# Security Policy

PPWR Compliance Screener (Automatiqa Lab by Aleks Sidorecs) handles supplier contact details, uploaded evidence
and commercially confidential packaging data. It runs entirely inside the deployer's own boundary:
the lab operates no service, hosts no instance and receives no data. Vulnerability reports are taken
seriously.

## Reporting a vulnerability

Please report privately - do not open a public issue for a security problem.

- Preferred: open a private advisory via GitHub Security Advisories ("Report a vulnerability" on the
  Security tab).
- Or email **aleks@automatiqa.io**.

Include what you found, how to reproduce it, the impact, and any suggested fix. If you have a proof
of concept, attach it.

Expect acknowledgement within 3 business days, and a disclosure timeline agreed with you. Credit is
given unless you prefer otherwise.

## Supported versions

Pre-1.0. Fixes land on `main` and in the next release; older tags are not patched.

## Scope

In scope:

- Token forgery, guessing or replay that would let someone read or submit against another supplier's
  campaign item
- Any path where uploaded evidence is readable by a party other than the deployer and the supplier
  who uploaded it
- Injection into the rule engine expression parser
- Prompt injection in an uploaded document that changes a verdict, alters a finding, or causes data
  to be sent anywhere other than the configured endpoint
- Secrets recoverable from logs, error messages or exported artefacts

Out of scope:

- The security of the language model endpoint you configure and hold the key for
- Vulnerabilities in n8n, PostgreSQL or other upstream components - report those upstream, though a
  note here is appreciated if the combination is what makes it exploitable
- Findings that require an attacker to already hold deployer credentials
- Reports produced solely by an automated scanner with no demonstrated impact

## Deployer responsibilities

The tool is designed to be run by the party that owns the data. A deployment is expected to hold the
token secret outside version control, serve the questionnaire over TLS, restrict database access, and
keep the evidence store inside its own boundary. None of that can be enforced from this repository.
