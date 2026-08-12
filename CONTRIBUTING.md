# Contributing

Thank you for looking. A few things worth knowing before you spend time on a change.

## Where changes belong

**The rules live in `rulesets/`.** A ruleset is versioned JSON: each check names the fields it
needs, the condition it applies and the message it produces. Adding a check, changing a threshold,
correcting wording or adding a language is an edit there, and that is an ordinary pull request.

**The workflows are generated.** They are built and tested in a private working repository and
exported here as a result, which is why every Code node carries a compiled library rather than hand
written logic. A pull request that edits a workflow JSON will be overwritten by the next release, so
open an issue describing the behaviour instead. If we agree on it, the change lands upstream and
arrives here credited to you.

Documentation, the installer and the sheet of things that are wrong with this: ordinary pull
requests, very welcome.

## Two properties that must not regress

**A verdict is reproducible.** Given the same submission and the same ruleset version, re-running it
a year later returns the same findings in the same order. The engine reads no clock, no random
source and no locale. That is the whole reason a rule engine is here rather than a model.

**A model never decides.** It reads a document into named fields with a confidence on each, and it
drafts the covering paragraph of a gap notice. Nothing it returns can produce a pass or a fail. Any
proposal that needs that to bend is a different project, and worth being honest about rather than
arguing the edges.

## Accurate scope

This screens declarations for completeness and internal consistency. It is not a conformity
assessment, it is not legal advice, and it does not replace a technical file, a notified body or a
competent authority. Wording that implies otherwise will be edited, including in a pull request
that is otherwise good.

## Reporting a bug

Most useful with the ruleset version, the input that triggered it, what you expected and what you
got. If a verdict looks wrong, include the submission and the ruleset rows for the checks involved:
between them they determine the answer completely, so if the verdict does not follow from those
two, that is the bug and it is a good one to have found.
