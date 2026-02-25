---
id: postels_law
title: Postel's Law
category: cognitive_psychology_and_behavior
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:30.000000'
tags:
  - ux
  - development
  - robustness
  - forms
  - api
related_rules:
  - fitts_law
  - hicks_law
  - jakobs_law
  - millers_law
  - teslers_law
  - anchoring_bias
components:
  - form
  - input
patterns:
  - label-input
  - validation
common_violations:
  - unclear labels
  - poor grouping
  - missing validation
fix_strategies:
  - associate label with input
  - group related fields
  - provide validation messages
---
# Postel's Law

## Description

Also known as the Robustness Principle: "Be liberal in what you accept, and conservative in what you send." In UX, this means you should be flexible in interpreting user input but provide clear, consistent output.

## Best Practices

### Be flexible with input

Instead of: Requiring a phone number in `(555) 555-5555` format and showing an error for `555.555.5555`.
Do: Accepting multiple formats (dashes, spaces, dots, parentheses) and automatically reformatting it to a standard on the back-end.

### Provide clear, simple output

Instead of: An API that sometimes returns user data in XML and other times in JSON.
Do: An API that consistently returns well-formed JSON.

### Anticipate user variance

Instead of: A search that fails if there's a typo.
Do: A search that suggests corrections ("Did you mean...") or provides results for the likely intended query.

## Typical Contexts

-   Form design and validation (especially for phone numbers, dates, zip codes).
-   API design (both for requests and responses).
-   Search engine and filter functionality.
-   Any system that accepts user-generated content or input.
