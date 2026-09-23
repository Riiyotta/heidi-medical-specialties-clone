#!/usr/bin/env python3
"""Adversarial test suite for the Heidi-clone design-repo.

For every rule the schema/validator enforce, constructs a mutated PageSpec
instance that must be REJECTED, and proves it is -- by both the JSON Schema
(schema/pagespec.schema.json, Draft7Validator) and the semantic validator
(schema/semantic_validate.py). Also asserts the CONTROL case: every real
template's own node sequence (synthesized into a minimal valid instance) and
the bundled example.pagespec.json produce ZERO errors from both layers.

Run: python3 schema/tests/adversarial_test.py
"""
import copy
import json
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, "schema"))

from jsonschema import Draft7Validator  # noqa: E402
import semantic_validate as sv  # noqa: E402

SCHEMA = json.load(open(os.path.join(REPO, "schema", "pagespec.schema.json")))
EXAMPLE = json.load(open(os.path.join(REPO, "schema", "example.pagespec.json")))
SECTIONS = sv.load_sections()
TEMPLATES = sv.load_templates()
GRAPH = json.load(open(os.path.join(REPO, "compatibility", "graph.json")))

validator = Draft7Validator(SCHEMA)

PASS = 0
FAIL = 0


def schema_errors(instance):
    return list(validator.iter_errors(instance))


def report(name, ok, detail=""):
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}  {detail}")


def expect_schema_rejects(name, instance):
    errs = schema_errors(instance)
    report(name, len(errs) > 0, "expected >=1 schema error, got 0" if not errs else "")


def expect_semantic_rejects(name, instance):
    errs = sv.validate(instance, SECTIONS, TEMPLATES, GRAPH)
    report(name, len(errs) > 0, "expected >=1 semantic error, got 0" if not errs else "")


def expect_valid(name, instance):
    schema_errs = schema_errors(instance)
    sem_errs = sv.validate(instance, SECTIONS, TEMPLATES, GRAPH)
    ok = (len(schema_errs) == 0) and (len(sem_errs) == 0)
    detail = ""
    if not ok:
        detail = f"schema_errors={[str(e.message)[:100] for e in schema_errs][:2]} semantic_errors={sem_errs[:2]}"
    report(name, ok, detail)


print("=== CONTROLS (must all pass with zero errors) ===")
expect_valid("bundled example.pagespec.json validates clean", EXAMPLE)

# One minimal valid instance per real template, built directly from that
# template's own required nodes with a trivial-but-schema-legal content body.
def minimal_content_for(section_id):
    sec = SECTIONS[section_id]
    props = sec["content"]["properties"]
    out = {}
    for key, pschema in props.items():
        out[key] = fill(pschema)
    return out


def fill(pschema):
    t = pschema.get("type")
    if "const" in pschema:
        return pschema["const"]
    if "enum" in pschema:
        return pschema["enum"][0]
    if t == "string":
        return "x"
    if t == "boolean":
        return False
    if t == "object":
        return {k: fill(v) for k, v in pschema.get("properties", {}).items() if k in pschema.get("required", [])}
    if t == "array":
        min_items = pschema.get("minItems", 1)
        item_schema = pschema.get("items", {"type": "string"})
        return [fill(item_schema) for _ in range(max(min_items, 1))]
    return "x"


def motion_for(section_id):
    sec = SECTIONS[section_id]
    pattern = sec["motion"]["pattern"]
    if pattern not in ("heroFadeIn", "fadeUpOnScroll", "static-no-animation"):
        pattern = "fadeUpOnScroll"
    return {"pattern": pattern, "reducedMotionFallback": "static-no-animation"}


def build_minimal_instance(tpl):
    nodes = []
    for n in tpl["nodes"]:
        if not n.get("required"):
            continue
        nodes.append({
            "section": n["section"],
            "required": True,
            "repeatable": n.get("repeatable", False),
            "motion": motion_for(n["section"]),
            "content": minimal_content_for(n["section"]),
        })
    return {
        "specVersion": "1.0.0",
        "route": "/x",
        "title": "x",
        "basedOnTemplate": tpl["id"],
        "theme": "light",
        "nodes": nodes,
    }


for tpl in TEMPLATES.values():
    inst = build_minimal_instance(tpl)
    expect_valid(f"control: minimal valid instance for template '{tpl['id']}'", inst)

print("\n=== SCHEMA-LAYER MUTATIONS (must be rejected) ===")

m = copy.deepcopy(EXAMPLE)
m["basedOnTemplate"] = "template-that-does-not-exist"
expect_schema_rejects("invented basedOnTemplate enum value", m)

m = copy.deepcopy(EXAMPLE)
del m["route"]
expect_schema_rejects("missing required top-level field (route)", m)

m = copy.deepcopy(EXAMPLE)
m["nodes"][0]["section"] = "hero.invented-type"
expect_schema_rejects("invented node section id", m)

m = copy.deepcopy(EXAMPLE)
del m["nodes"][0]["motion"]["reducedMotionFallback"]
expect_schema_rejects("missing reducedMotionFallback", m)

m = copy.deepcopy(EXAMPLE)
m["nodes"][0]["motion"]["pattern"] = "invented-motion-pattern"
expect_schema_rejects("invented motion pattern value", m)

m = copy.deepcopy(EXAMPLE)
m["nodes"][0]["motion"]["inventedAnimation"] = "spin"
expect_schema_rejects("motion object smuggles an invented field (additionalProperties:false)", m)

m = copy.deepcopy(EXAMPLE)
m["nodes"][0]["content"]["inventedField"] = "sneaky"
expect_schema_rejects("content object smuggles an invented field for a real section", m)

m = copy.deepcopy(EXAMPLE)
m["nodes"][0]["content"]["visual"]["assetRole"] = "invented-asset-role-not-in-catalog"
expect_schema_rejects("invented assetRole value on a real visual field (const-locked per section)", m)

m = copy.deepcopy(EXAMPLE)
m["unexpectedTopLevelField"] = True
expect_schema_rejects("invented top-level PageSpec field", m)

print("\n=== STRUCTURAL MUTATIONS (must be rejected by semantic validator) ===")

# Duplicate a one-per-page section (faq.list appears twice)
m = copy.deepcopy(EXAMPLE)
faq_node = copy.deepcopy([n for n in m["nodes"] if n["section"] == "solutions.faq"][0])
m["nodes"].append(faq_node)
expect_semantic_rejects("duplicate one-per-page section (FAQ_AT_MOST_ONCE)", m)

# Remove a mandatory section (the hero)
m = copy.deepcopy(EXAMPLE)
m["nodes"] = [n for n in m["nodes"] if n["section"] != "solutions.hero"]
expect_semantic_rejects("removed mandatory hero node (template cross-reference)", m)

# Reorder the fixed-position closing CTA band to not be last
m = copy.deepcopy(EXAMPLE)
cta = m["nodes"].pop()
assert cta["section"] == "solutions.cta-band"
m["nodes"].insert(0, cta)
expect_semantic_rejects("closing CTA band reordered away from last (CTA_BAND_MUST_BE_LAST)", m)

# Template/node-sequence mismatch: declare a different template than the real nodes match
m = copy.deepcopy(EXAMPLE)
m["basedOnTemplate"] = "home"
expect_semantic_rejects("basedOnTemplate declares 'home' but nodes[] is the solutions-shared sequence", m)

# Two hero nodes (ONE_HERO_PER_PAGE)
m = copy.deepcopy(EXAMPLE)
hero_node = copy.deepcopy([n for n in m["nodes"] if n["section"] == "solutions.hero"][0])
m["nodes"].append(hero_node)
expect_semantic_rejects("second hero-category node added (ONE_HERO_PER_PAGE)", m)

# A node whose section isn't even part of the declared template
m = copy.deepcopy(EXAMPLE)
foreign = {
    "section": "band.dark-quote", "required": False, "repeatable": False,
    "motion": {"pattern": "fadeUpOnScroll", "reducedMotionFallback": "static-no-animation"},
    "content": {"quote": "x"},
}
m["nodes"].insert(1, foreign)
expect_semantic_rejects("node section not part of declared template's own node list", m)

# content-index/customer-index split: prose.block wrongly present on
# content-index (real: neither /blog nor /progress-notes has one)
content_index_tpl = TEMPLATES["content-index"]
m = build_minimal_instance(content_index_tpl)
prose_node = {
    "section": "prose.block", "required": False, "repeatable": False,
    "motion": motion_for("prose.block"),
    "content": minimal_content_for("prose.block"),
}
m["nodes"].insert(1, prose_node)
expect_semantic_rejects("prose.block smuggled onto content-index (real: blog/progress-notes have no prose section)", m)

# customer-index missing its required prose.block (real: /customers has one)
customer_index_tpl = TEMPLATES["customer-index"]
m = build_minimal_instance(customer_index_tpl)
m["nodes"] = [n for n in m["nodes"] if n["section"] != "prose.block"]
expect_semantic_rejects("removed mandatory prose.block from customer-index (template cross-reference)", m)

print("\n=== RUNTIME MUTATIONS (must be rejected by semantic validator) ===")

m = copy.deepcopy(EXAMPLE)
hero_idx = next(i for i, n in enumerate(m["nodes"]) if n["section"] == "solutions.hero")
m["nodes"][hero_idx]["content"]["heading"] = " ".join(["word"] * 40)  # heading maxWords is 14
expect_semantic_rejects("maxWords overflow on a real field (solutions.hero.heading)", m)

m = copy.deepcopy(EXAMPLE)
faq_idx = next(i for i, n in enumerate(m["nodes"]) if n["section"] == "solutions.faq")
m["nodes"][faq_idx]["content"]["items"][0]["a"] = " ".join(["word"] * 200)  # answer maxWords is 120
expect_semantic_rejects("maxWords overflow inside a nested array item field", m)

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
