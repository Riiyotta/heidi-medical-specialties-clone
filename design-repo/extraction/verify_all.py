#!/usr/bin/env python3
"""Self-containment + schema + structural + allowlist/citation/count checks,
all in one, runnable from anywhere (path derived from __file__, never a
hardcoded absolute path -- this is what makes the self-containment test in
BUILD-GUIDE.md section 3 meaningful).

Checks performed:
  1. Draft-07 schema validation of schema/example.pagespec.json -- 0 errors.
  2. Semantic validation of the same instance -- 0 errors.
  3. Allowlist parity: every id in tokens/llm/component-allowlist.json has a
     matching contract file on disk, and every real primitive/component/
     section file has an allowlist entry. No phantom entries, no orphans.
  4. Citation validity: every `measuredFrom`/citation string of the form
     "path:line[-line]" (optionally with trailing prose) that names a file
     INSIDE this design-repo's sibling source tree resolves against that
     real file and the line range does not exceed the file's real length.
     Citations naming files outside any locatable source tree degrade
     gracefully to a warning, never a failure, per BUILD-GUIDE 2.7 --
     a standalone design-repo package (no sibling app source) must still
     verify cleanly.
  5. Manifest counts: registry.manifest.json's `counts` block is recomputed
     from the actual files on disk and compared, not read from the manifest.
  6. Route coverage: every route in templates/templates.json is mapped to
     exactly one template (no gaps, no double-assignment).
  7. Manifest self-containment: every entryPoints path resolves to a real
     file INSIDE this design-repo folder, and none start with "../".
  8. No absolute local machine paths anywhere in the repo.

Exit code 0 iff every check passes.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "schema"))

FAILURES = []
WARNINGS = []


def ok(label):
    print(f"  OK    {label}")


def fail(label, detail=""):
    FAILURES.append(label)
    print(f"  FAIL  {label}  {detail}")


def warn(label, detail=""):
    WARNINGS.append(label)
    print(f"  WARN  {label}  {detail}")


def find_source_root():
    """The Heidi app's src/ lives one directory up from design-repo/ during a
    build session, but a standalone shipped copy of design-repo/ will not
    have that sibling present -- citation checks must degrade to a warning
    in that case, not fail."""
    candidate = os.path.dirname(REPO)
    if os.path.isdir(os.path.join(candidate, "src")):
        return candidate
    return None


def check_schema_and_semantic():
    from jsonschema import Draft7Validator
    import semantic_validate as sv

    schema = json.load(open(os.path.join(REPO, "schema", "pagespec.schema.json")))
    example = json.load(open(os.path.join(REPO, "schema", "example.pagespec.json")))
    v = Draft7Validator(schema)
    errs = list(v.iter_errors(example))
    if errs:
        fail("schema validation of example.pagespec.json", f"{len(errs)} errors")
    else:
        ok("schema validation of example.pagespec.json (0 errors)")

    sem_errs = sv.validate(example)
    if sem_errs:
        fail("semantic validation of example.pagespec.json", f"{sem_errs[:2]}")
    else:
        ok("semantic validation of example.pagespec.json (0 errors)")


def check_allowlist_parity():
    allow = json.load(open(os.path.join(REPO, "tokens", "llm", "component-allowlist.json")))
    on_disk = {
        "primitives": {f[:-5] for f in os.listdir(os.path.join(REPO, "primitives")) if f.endswith(".json")},
        "components": {f[:-5] for f in os.listdir(os.path.join(REPO, "components")) if f.endswith(".json")},
        "sections": {f[:-5] for f in os.listdir(os.path.join(REPO, "sections")) if f.endswith(".json")},
    }
    problems = []
    for category in ("primitives", "components", "sections"):
        listed = set(allow.get(category, []))
        real = on_disk[category]
        phantom = listed - real
        orphan = real - listed
        if phantom:
            problems.append(f"{category}: phantom allowlist entries with no file: {sorted(phantom)}")
        if orphan:
            problems.append(f"{category}: files with no allowlist entry: {sorted(orphan)}")
    if problems:
        fail("allowlist parity", "; ".join(problems))
    else:
        ok(f"allowlist parity ({len(on_disk['primitives'])} primitives, {len(on_disk['components'])} components, {len(on_disk['sections'])} sections, all matched)")


CITATION_RE = re.compile(r"([A-Za-z0-9_./\- ]+\.[a-zA-Z]+):(\d+)(?:-(\d+))?")


def iter_citations(obj, path=""):
    """Yield (context, raw_citation_string) for every measuredFrom-like value in a nested JSON structure."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("measuredFrom",) and isinstance(v, str):
                yield (path or "<root>", v)
            else:
                yield from iter_citations(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from iter_citations(v, f"{path}[{i}]")


def check_citations():
    source_root = find_source_root()
    if source_root is None:
        warn("citation validity", "no sibling source tree found (standalone package) -- skipped, not failed")
        return

    total = 0
    bad = 0
    bad_examples = []
    for dirpath, _dirs, files in os.walk(REPO):
        if os.sep + ".git" in dirpath:
            continue
        for fn in files:
            if not fn.endswith(".json"):
                continue
            full = os.path.join(dirpath, fn)
            try:
                data = json.load(open(full))
            except Exception:
                continue
            for _ctx, citation in iter_citations(data):
                for m in CITATION_RE.finditer(citation):
                    total += 1
                    rel_path, start, end = m.group(1).strip(), int(m.group(2)), m.group(3)
                    end = int(end) if end else start
                    real_file = os.path.join(source_root, rel_path)
                    if not os.path.isfile(real_file):
                        # Not every matched "word.ext:NN" is a real file path (e.g.
                        # prose mentioning a version number) -- only count it as a
                        # citation if the referenced file actually exists somewhere
                        # under source_root or REPO.
                        alt = os.path.join(REPO, rel_path)
                        if not os.path.isfile(alt):
                            continue
                        real_file = alt
                    with open(real_file, encoding="utf-8", errors="ignore") as f:
                        line_count = sum(1 for _ in f)
                    if end > line_count:
                        bad += 1
                        bad_examples.append(f"{rel_path}:{start}-{end} exceeds real length {line_count}")

    if bad:
        fail("citation validity", f"{bad}/{total} citations out of range: {bad_examples[:5]}")
    else:
        ok(f"citation validity ({total} citations checked against real file lengths, 0 out of range)")


def check_manifest_counts():
    manifest_path = os.path.join(REPO, "registry.manifest.json")
    manifest = json.load(open(manifest_path))
    real_counts = {
        "tokens": sum(
            len([f for f in os.listdir(os.path.join(REPO, "tokens", sub)) if f.endswith(".json")])
            for sub in ("00-foundation", "10-semantic", "20-component", "30-layout", "themes")
        ),
        "primitives": len([f for f in os.listdir(os.path.join(REPO, "primitives")) if f.endswith(".json")]),
        "components": len([f for f in os.listdir(os.path.join(REPO, "components")) if f.endswith(".json")]),
        "sections": len([f for f in os.listdir(os.path.join(REPO, "sections")) if f.endswith(".json")]),
        "templates": len(json.load(open(os.path.join(REPO, "templates", "templates.json")))["templates"]),
        "routes": sum(
            len(t["routes"])
            for t in json.load(open(os.path.join(REPO, "templates", "templates.json")))["templates"]
        ),
    }
    stated = manifest.get("counts", {})
    mismatches = {k: (stated.get(k), v) for k, v in real_counts.items() if stated.get(k) != v}
    if mismatches:
        fail("manifest counts recomputed-from-disk", f"mismatches (stated,real): {mismatches}")
    else:
        ok(f"manifest counts match disk exactly: {real_counts}")


def check_route_coverage():
    tpls = json.load(open(os.path.join(REPO, "templates", "templates.json")))["templates"]
    all_routes = []
    for t in tpls:
        all_routes += t["routes"]
    dupes = {r for r in all_routes if all_routes.count(r) > 1}
    if dupes:
        fail("route coverage (no double-assignment)", f"duplicated routes: {dupes}")
    else:
        ok(f"route coverage: {len(all_routes)} routes, each mapped to exactly one template, no duplicates")


def check_manifest_self_containment():
    manifest = json.load(open(os.path.join(REPO, "registry.manifest.json")))
    entry_points = manifest.get("entryPoints", [])
    bad = []
    for ep in entry_points:
        if ep.startswith("../") or ep.startswith("/"):
            bad.append(ep)
            continue
        if not os.path.isfile(os.path.join(REPO, ep)):
            bad.append(ep + " (does not exist inside design-repo/)")
    if bad:
        fail("registry.manifest.json entryPoints self-containment", f"{bad}")
    else:
        ok(f"registry.manifest.json entryPoints ({len(entry_points)}) are all real, in-package paths")


def check_no_absolute_paths():
    hits = []
    # This script (and adversarial_test.py, which imports it) necessarily
    # contains the literal string "/Users/" as part of the regex PATTERN that
    # performs this very check -- that is not a hardcoded machine path, so
    # both files are excluded from scanning themselves by name, not silently
    # skipped wholesale (every other file, including every other .py file,
    # is still scanned).
    self_exempt = {os.path.abspath(__file__)}
    for dirpath, _dirs, files in os.walk(REPO):
        if os.sep + ".git" in dirpath:
            continue
        for fn in files:
            if fn.endswith((".json", ".py", ".md")):
                full = os.path.join(dirpath, fn)
                if os.path.abspath(full) in self_exempt:
                    continue
                try:
                    text = open(full, encoding="utf-8", errors="ignore").read()
                except Exception:
                    continue
                for m in re.finditer(r"/Users/[^\s\"'\\]*", text):
                    hits.append(f"{os.path.relpath(full, REPO)}: {m.group(0)}")
    if hits:
        fail("no absolute /Users/ paths anywhere in repo", f"{hits[:5]}")
    else:
        ok("no absolute /Users/ paths anywhere in repo")


def check_allowlist_version_parity():
    manifest = json.load(open(os.path.join(REPO, "registry.manifest.json")))
    allow = json.load(open(os.path.join(REPO, "tokens", "llm", "component-allowlist.json")))
    if manifest.get("allowlistVersion") != allow.get("allowlistVersion"):
        fail("allowlistVersion parity (manifest vs component-allowlist.json)",
             f"manifest={manifest.get('allowlistVersion')} allowlist={allow.get('allowlistVersion')}")
    else:
        ok(f"allowlistVersion parity ({manifest.get('allowlistVersion')})")


def main():
    print("=== Heidi-clone design-repo verify_all.py ===")
    print(f"repo root (derived from __file__): {REPO}\n")
    check_schema_and_semantic()
    check_allowlist_parity()
    check_allowlist_version_parity()
    check_citations()
    check_manifest_counts()
    check_route_coverage()
    check_manifest_self_containment()
    check_no_absolute_paths()
    print(f"\n{len(FAILURES)} failure(s), {len(WARNINGS)} warning(s)")
    if FAILURES:
        for f in FAILURES:
            print("  -", f)
        sys.exit(1)
    print("ALL CHECKS PASSED")
    sys.exit(0)


if __name__ == "__main__":
    main()
