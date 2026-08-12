# Compliance

How PPWR Compliance Screener positions itself under the EU AI Act, and the limits it states about its own
output. This file is the per-project classification referenced from the
[Automatiqa Lab profile](https://github.com/automatiqa-lab).

Not legal advice. Every entry is dated and its history is in git.

Contact for compliance and incident reports: aleks@automatiqa.io

## Scope of the tool itself

PPWR Compliance Screener screens supplier declarations for completeness and internal consistency. It does not
determine conformity with Regulation (EU) 2025/40, it is not legal advice, and it does not replace a
technical file, a notified body or a competent authority.

This matters for classification. The tool does not make or support a decision about a person, and it
does not decide regulatory conformity. It reports whether a set of documents is complete and
internally consistent, against a ruleset the operator chooses and versions.

## Role under the AI Act

The lab does not train, fine-tune or distribute models. PPWR Compliance Screener sends prompts to an
OpenAI-compatible endpoint that the deployer configures and holds the key for: a local runtime, a
hosted provider, a router, or a proxy of their own. Obligations attaching to the model itself rest
with whoever provides it, under their own terms.

The lab publishes workflow definitions and a library and operates no instance. Whoever runs a
campaign is the deployer and is responsible for how the output is used.

Recorded 2026-08-11.

## Article 50 - transparency

Two obligations are relevant.

**Interaction disclosure.** Supplier-facing email and the questionnaire footer state that the sender
uses an automated system, so a supplier is never left to guess whether a person read their
submission.

**Synthetic content marking.** Text a model drafted carries a readable line and machine-detectable
metadata.

Marking is **conditional**, and deliberately so. Content a model wrote is marked; content assembled
deterministically is not. Marking everything would misstate provenance and train readers to ignore
the label, which is the opposite of what the article is for. Concretely:

| Output | Model involved | Marked |
|--------|----------------|--------|
| Rule engine findings | No | No |
| Gap notice - the list of findings | No, assembled deterministically | No |
| Gap notice - covering paragraph | Yes | Yes |
| Fields extracted from an uploaded document | Yes | Yes, per field, with confidence |
| Confirmation that a submission is complete | No | No |
| Coverage report totals | No | No |

The confirmation is the row worth questioning. Nothing in it is drafted, so it carries no marking,
and that absence is the point: a supplier who sees the line on a gap notice and not on a
confirmation learns something true about which one a model touched.

The model is never named in visible output. Article 50 requires disclosure that content is
AI-generated, not disclosure of which system produced it, and naming a vendor in a compliance
artefact implies an endorsement the lab does not make.

Marking schema `automatiqa-disclosure/1`, wording bundled from `i18n/disclosure.json`.

## Annex III screening

Considered and rejected, with the near-miss named rather than waved off.

**Essential private services (Annex III 5(b)).** The nearest miss. A verdict can influence whether a
supplier keeps supplying, which touches commercial access. It falls outside because the assessment
is of a document's completeness rather than of a person's creditworthiness or entitlement, the
subject is a legal entity rather than a natural person, and no automated decision restricts access
to a service. A gap notice asks for a missing document.

**Employment (Annex III 4).** Not touched. No worker, applicant or performance data enters the
system.

**Critical infrastructure (Annex III 2).** Not touched. Packaging compliance paperwork is not
infrastructure.

**Justice, migration, law enforcement, education.** Not touched.

The system generates no synthetic images, audio or video, so the deep-fake limb of Article 50 does
not fire. Text is the only generated modality.

Screened 2026-08-11. Re-run on any change of purpose or new modality.

## Where judgement sits

No model produces a pass or a fail. Verdicts come from a deterministic rule engine evaluating a
versioned JSON ruleset. Swapping the model, or changing its provider, cannot change a verdict.

Two guards enforce that boundary:

- Extraction never overrides a value the supplier typed. It fills blanks. Confidence below the
  configured threshold leaves the field empty and raises an indeterminate result for any check that
  depended on it, rather than letting a guess become a finding.
- The drafting step is handed findings that are already final. It writes the surrounding paragraph
  and nothing else. Check identifiers in that paragraph are compared against the notice, and any
  that did not run is a hard error rather than a warning.

A build gate fails the release if engine code reads a clock or a random source, so the boundary is
enforced mechanically rather than remembered.

## Reproducibility

Every verdict record stores the ruleset version that produced it, and a hash of the findings.
Given a submission identifier and a ruleset version, re-running the engine produces identical
findings; a different hash means something changed that should not have. Submissions are
append-only: a resubmission is a new revision and nothing is overwritten, so the record of what was
checked, on what evidence, and who overrode what, survives.

The engine is developed and tested in a private working repository. What ships here is the result.

## Data protection

Supplier contact details and uploaded evidence are personal or commercially confidential data. The
deployer is the controller. The tool holds evidence in the deployer's own store; the lab operates no
service and receives no data.

## What remains the deployer's job

- Keep the marking intact. If you rewrite the notice templates, keep the disclosure line and the
  machine-readable envelope on the payload.
- Disclose to your own recipients if you forward output further, and keep the marking on it.
- Authenticate the exposed surfaces. The review form has no access control out of the box, which is
  stated on the workflow itself and in [SCOPE.md](SCOPE.md).
- Hold your own relationship with whoever provides the model.
- Re-screen against Annex III if you change what the system is for.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-08-11 | Marking is conditional, never blanket | The absence of a marking has to stay a true statement, or the label is worthless on the one notice where it matters |
| 2026-08-11 | Marking is applied at the lowest constructor, not at the mail node | An outer wrapper leaves replay, test and error paths uncovered; there is no path that emits an unmarked drafted notice |
| 2026-08-11 | The drafted paragraph is verified against the finding identifiers after generation | "The model cannot add, remove or reinterpret a finding" has to be enforced, not requested |
| 2026-08-11 | The lab is a publisher, the operator is the deployer | The lab operates no instance, holds no key and sends no mail |
| 2026-08-11 | Wording is bundled rather than fetched | A Code node has no filesystem, and wording carrying a legal claim belongs in one reviewable place with a version on it |

## Reviewing this file

Reviewed when Commission or AI Office guidance changes, and on each release. Wording changes land in
the shared disclosure configuration first, then propagate here.
