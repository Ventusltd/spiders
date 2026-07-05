# Document Rules

Document type: doctrine

Status: draft operating rule

## Purpose

Every document must declare what kind of document it is.

Loose prose creates confusion. The Spider OS needs every document to have a role.

## Allowed document types

```text
doctrine
contract
evidence
receipt
study
draft
handover
recovery
implementation
source-card
```

## Meanings

Doctrine is operating law.

Contract is a schema, interface or build rule.

Evidence is sourced factual basis.

Receipt is proof of a run, build or verification.

Study is researched material that is not yet binding.

Draft is not accepted yet.

Handover is context for the next executor.

Recovery is a known-good copy or restore route.

Implementation is code-facing instruction.

Source-card is a declared external source profile.

## Rules

A study does not become doctrine because it sounds good.

A draft does not become truth until accepted.

A receipt records evidence, not intention.

A handover is context, not authority.

A recovery file is an anchor, not a redesign target.

A source-card is required before an external source becomes mapped truth.

## Required header fields

Each new OS document should state:

```text
Document type
Status
Scope
Owner repo
Last reviewed
```

If a field is unknown, write `unknown` rather than inventing it.
