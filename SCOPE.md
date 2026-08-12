# Scope and limits

What this does, what it refuses to do, and what is not finished. If you are deciding whether to run
it against real suppliers, read this page rather than the feature list.

## What it is

A screener. It collects declarations, reads the documents, checks the answers against a versioned
ruleset, chases the suppliers who go quiet, and produces a file per item and a report per campaign.

## What it is not

It is not a conformity assessment. Nothing here decides whether a product may be placed on the
market. The output is "this declaration is complete and internally consistent against ruleset X" or
"these points are missing", and that is a very different sentence from "this packaging complies".

It is not legal advice, and it does not replace a technical file, a notified body or a competent
authority.

The ruleset shipped in `rulesets/ppwr-2026.01.json` is an example. It exercises every check type and
it is not a legal reading of the regulation. Have somebody qualified review the rules before a
supplier ever sees them.

## Where a model is used, and where it is not

Two jobs, both narrow:

1. Reading an uploaded document into named fields, each with a confidence and the page it came from.
2. Drafting the covering paragraph of a gap notice.

Nothing a model returns can produce a pass or a fail. Verdicts come from the rule engine, which has
no model, no network and no clock. The drafted paragraph is checked afterwards for any check id that
is not among the submission's findings, and the notice fails to send if one turns up.

Extraction quality is still extraction quality. A field read wrongly at high confidence will be
merged in as if it were right. The mitigation is that a typed answer always beats an extracted one,
a contradiction marks the field and sends the item to a human, and anything under the confidence
floor is not used at all.

## Known limits

**Scanned documents.** A scanner writes one image per page inside a PDF. Where those pages are
carried as complete JPEG or JPEG 2000 streams they are lifted out and looked at. Pages compressed
with FlateDecode are not: turning those back into an image means inflating and re-encoding, and a
Code node has neither zlib nor Buffer. Such a document comes back as an empty extraction with a
stated reason, and the engine says whatever it says about a missing declaration. It is never
reported as read.

**Oversized JSON.** The store computes the spill when a JSON value exceeds the Data Table column
limit, but nothing writes the spilled part to the blob store yet. In practice this bites on a
submission payload with a very large number of fields. The row is refused rather than truncated,
so nothing is silently lost, but the submission does not go through either.

**The review form has no access control.** `06` is reachable by anyone holding the link and a
submission id. Put it behind your own authentication before pointing real reviewers at it. This is
stated on the workflow's own sticky note too.

**Query shapes the Data Table cannot answer are refused.** An OR across several columns, or a read
with more conditions than the node has slots, throws `UNSUPPORTED_QUERY` instead of returning a
wrong answer. Switch the store to Postgres and the restriction lifts.

**A supplier list is loaded, never synced.** `08` reads a CSV and creates what is missing. It does
not watch an ERP, it does not deactivate an item that disappeared from a later file, and it does not
update a description that changed. Re-uploading is safe and additive, and that is all it is.

**One instance, one tenant.** There is no separation between campaigns beyond the campaign id, and
no per-user permissions anywhere.

**Mail delivery is best effort.** A failed send is recorded against the vendor and the run carries
on, so a campaign is never stopped by one bad address. Nobody is chasing the bounce for you.

## What is deliberate

**The engine cannot read a clock.** `now` is passed in. Re-run an old submission with its stored
`evaluated_at` and you get the verdict it was given, not a fresh judgement against today. A build
gate fails if engine code touches `Date.now` or `Math.random`.

**A campaign freezes its ruleset version and hash at launch.** Ship a new ruleset tomorrow and
running campaigns keep judging against the one they started with.

**Findings are hashed.** Each submission records a `findings_sha256`. An audit re-run that produces
a different hash means something changed that should not have.

**Every state change writes an event.** State is written in exactly one place, in the same call that
writes the event row, so there is no path that moves an item without leaving a trace.

**Evidence is content addressed.** A document row stores `evidence://<sha256>` and nothing else. On
the way back out the file is re-hashed and compared against the address it was fetched by. A
mismatch fails the execution instead of handing the bytes over.

## If you are evaluating this for production

Do these before anything else: review the ruleset with somebody who knows the regulation, put
authentication in front of the review form, decide where evidence lives and how it is backed up, and
run one campaign against a handful of friendly suppliers before you send four hundred emails.
