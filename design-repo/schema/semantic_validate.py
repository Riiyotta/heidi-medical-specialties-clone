#!/usr/bin/env python3
"""Semantic validator for Heidi-clone PageSpec instances.

Enforces everything JSON Schema draft-07 structurally cannot express:
  - basedOnTemplate cross-reference: the instance's nodes[] must match (as a
    required-subset-in-order check) its declared template's own real node
    list from templates/templates.json -- not just "nodes[] look internally
    consistent" (MASTER-GUIDE.md 3.3, the single most repeated bug class).
  - compatibility/graph.json rhythm rules (ONE_HERO_PER_PAGE, CTA_BAND_MUST_BE_LAST,
    FAQ_AT_MOST_ONCE), respecting each rule's severity.
  - reducedMotionFallback presence on every node (schema already requires this
    structurally too; re-checked here for defense in depth).
  - per-instance maxWords word counts against the referenced section's own
    content contract in sections/*.json -- not just the bundled example.

Path portability: repo root is derived from this file's own location, never
a hardcoded absolute path, so this script works identically after the whole
design-repo/ folder is copied/zipped/extracted anywhere else.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Section ids whose section contract sets constraints.mustBeFirst / hero category.
HERO_CATEGORY_SECTIONS = None  # computed from disk, see load_sections()


def load_json(rel_path):
    with open(os.path.join(REPO, rel_path)) as f:
        return json.load(f)


def load_sections():
    sec_dir = os.path.join(REPO, "sections")
    out = {}
    for fn in os.listdir(sec_dir):
        if fn.endswith(".json"):
            s = json.load(open(os.path.join(sec_dir, fn)))
            out[s["id"]] = s
    return out


def load_templates():
    t = load_json("templates/templates.json")
    return {tpl["id"]: tpl for tpl in t["templates"]}


def word_count(s):
    return len(re.findall(r"\S+", s))


def check_maxwords(content, schema_props, path, errors):
    for key, val in content.items():
        if key not in schema_props:
            continue
        prop_schema = schema_props[key]
        if isinstance(val, str) and isinstance(prop_schema, dict) and "maxWords" in prop_schema:
            wc = word_count(val)
            if wc > prop_schema["maxWords"]:
                errors.append(f"{path}.{key}: {wc} words exceeds maxWords={prop_schema['maxWords']}")
        elif isinstance(val, list) and isinstance(prop_schema, dict) and prop_schema.get("type") == "array":
            item_schema = prop_schema.get("items", {})
            if isinstance(item_schema, dict) and item_schema.get("type") == "object":
                item_props = item_schema.get("properties", {})
                for i, item in enumerate(val):
                    if isinstance(item, dict):
                        check_maxwords(item, item_props, f"{path}.{key}[{i}]", errors)
            elif isinstance(item_schema, dict) and "maxWords" in item_schema:
                for i, item in enumerate(val):
                    if isinstance(item, str):
                        wc = word_count(item)
                        if wc > item_schema["maxWords"]:
                            errors.append(f"{path}.{key}[{i}]: {wc} words exceeds maxWords={item_schema['maxWords']}")
        elif isinstance(val, dict) and isinstance(prop_schema, dict) and prop_schema.get("type") == "object":
            check_maxwords(val, prop_schema.get("properties", {}), f"{path}.{key}", errors)


def validate(instance, sections=None, templates=None, graph=None, warnings_out=None):
    """Returns a list of error strings. Empty list == valid. If warnings_out
    is passed a list, non-fatal (severity: "warn") graph-rule findings are
    appended to it in place."""
    errors = []
    sections = sections or load_sections()
    templates = templates or load_templates()
    graph = graph or load_json("compatibility/graph.json")

    tpl_id = instance.get("basedOnTemplate")
    tpl = templates.get(tpl_id)
    if tpl is None:
        errors.append(f"basedOnTemplate '{tpl_id}' does not exist in templates/templates.json")
        return errors

    instance_nodes = instance.get("nodes", [])
    instance_section_ids = [n["section"] for n in instance_nodes]

    # --- Template cross-reference (MASTER-GUIDE 3.3) ---------------------
    # Every REQUIRED node in the declared template must appear, in the same
    # relative order, in the instance's nodes[]. This is the check that must
    # cross-reference basedOnTemplate against the template's OWN real node
    # list, not just validate nodes[] in isolation.
    required_template_sections = [n["section"] for n in tpl["nodes"] if n.get("required")]
    idx = 0
    for req_section in required_template_sections:
        found = False
        while idx < len(instance_section_ids):
            if instance_section_ids[idx] == req_section:
                found = True
                idx += 1
                break
            idx += 1
        if not found:
            errors.append(
                f"template '{tpl_id}' requires section '{req_section}' but the instance's nodes[] "
                f"is missing it (or has it out of the template's declared order)"
            )

    # Also: no node in the instance may reference a section id that isn't
    # even part of the declared template's own node list (a section from a
    # DIFFERENT template smuggled in).
    template_section_ids = {n["section"] for n in tpl["nodes"]}
    for n in instance_nodes:
        if n["section"] not in template_section_ids:
            errors.append(
                f"node references section '{n['section']}' which is not part of template "
                f"'{tpl_id}''s own declared node list"
            )

    # --- compatibility/graph.json rhythm rules ----------------------------
    hero_ids = {sid for sid, s in sections.items() if s["category"] == "hero"}
    hero_nodes = [n for n in instance_nodes if n["section"] in hero_ids]
    if len(hero_nodes) > 1:
        errors.append(f"ONE_HERO_PER_PAGE violated: {len(hero_nodes)} hero-category nodes present")

    last_sections_must_be_last = {
        sid for sid, s in sections.items() if s.get("constraints", {}).get("mustBeLast")
    }
    for i, n in enumerate(instance_nodes):
        if n["section"] in last_sections_must_be_last and i != len(instance_nodes) - 1:
            errors.append(f"CTA_BAND_MUST_BE_LAST violated: '{n['section']}' is not the final node")

    faq_ids = {"faq.list", "solutions.faq", "band.faq-band"}
    faq_count = sum(1 for n in instance_nodes if n["section"] in faq_ids)
    if faq_count > 1:
        errors.append(f"FAQ_AT_MOST_ONCE violated: {faq_count} FAQ nodes present")

    # --- warn-severity graph rules (non-fatal, but still checked -- a rule
    # documented in compatibility/graph.json and never implemented here is
    # exactly the "correction that doesn't reach the rule enforcing it" bug
    # class from MASTER-GUIDE.md 3.8/3.18). Keyed on (section, variant) so a
    # section that legitimately repeats with a different variant tag (e.g.
    # home's two home.quote-band nodes, solutions-enterprise's two
    # band.logo-marquee nodes) does not false-positive.
    warnings = []
    for i in range(len(instance_nodes) - 1):
        a, b = instance_nodes[i], instance_nodes[i + 1]
        a_key = (a["section"], a.get("variant"))
        b_key = (b["section"], b.get("variant"))
        if a_key == b_key:
            warnings.append(
                f"NO_ADJACENT_SAME_SECTION: nodes[{i}] and nodes[{i+1}] are both "
                f"'{a['section']}' (variant={a.get('variant')!r}) with nothing between them"
            )

    scroll_stage_ids = {"band.quote-carousel", "band.timeline"}
    for i in range(len(instance_nodes) - 1):
        if instance_nodes[i]["section"] in scroll_stage_ids and instance_nodes[i + 1]["section"] in scroll_stage_ids:
            warnings.append(
                f"NO_CONSECUTIVE_SCROLL_STAGES: nodes[{i}] and nodes[{i+1}] are both scroll/step-driven sections"
            )

    non_fade_count = len({
        n["motion"]["pattern"] for n in instance_nodes
        if n.get("motion", {}).get("pattern") not in ("fadeUpOnScroll", "static-no-animation")
    })
    if non_fade_count > 3:
        warnings.append(f"MOTION_BUDGET: {non_fade_count} distinct non-fade motion patterns declared (budget is 3)")

    if warnings_out is not None:
        warnings_out.extend(warnings)

    # --- reducedMotionFallback presence (defense in depth) ---------------
    for i, n in enumerate(instance_nodes):
        motion = n.get("motion", {})
        if motion.get("reducedMotionFallback") != "static-no-animation":
            errors.append(f"node[{i}] ('{n.get('section')}') missing/invalid reducedMotionFallback")

    # --- per-instance maxWords, against the REAL referenced section contract ---
    for i, n in enumerate(instance_nodes):
        sec = sections.get(n["section"])
        if sec is None:
            continue
        content = n.get("content", {})
        schema_props = sec["content"]["properties"]
        check_maxwords(content, schema_props, f"nodes[{i}]({n['section']})", errors)

    return errors


def main():
    if len(sys.argv) < 2:
        path = os.path.join(REPO, "schema", "example.pagespec.json")
    else:
        path = sys.argv[1]
    instance = json.load(open(path))
    warnings = []
    errors = validate(instance, warnings_out=warnings)
    for w in warnings:
        print("WARN -", w)
    if errors:
        print(f"INVALID -- {len(errors)} error(s):")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    print(f"VALID -- 0 errors, {len(warnings)} warning(s)")
    sys.exit(0)


if __name__ == "__main__":
    main()
