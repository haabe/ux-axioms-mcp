---
id: hicks_law
title: Hick's Law
category: cognitive_psychology_and_behavior
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:24.000000'
tags:
  - ux
  - cognitive
  - decision-making
  - navigation
  - menus
related_rules:
  - millers_law
  - fitts_law
  - jakobs_law
  - postels_law
  - teslers_law
  - anchoring_bias
components:
  - menu
  - nav
patterns:
  - settings
  - menus
  - tabs
  - drawer
  - topnav
common_violations:
  - too many top-level choices
  - too many choices
  - nonstandard placement
fix_strategies:
  - group options
  - progressive disclosure
  - group items
  - use common placement
---
# Hick's Law

## Description

The time it takes to make a decision increases with the number and complexity of choices.

## Best Practices

### Simplify choices

Instead of: A long dropdown of 50 states.
Do: A text input with autocomplete.

### Break down complex tasks

Instead of: A single, long form for user registration.
Do: A multi-step wizard with 3-4 fields per screen.

### Use progressive disclosure

Instead of: Showing all advanced settings at once.
Do: Hiding advanced options behind a "Show Advanced" link.

## Typical Contexts

-   Navigation menus
-   Pricing tables
-   Forms with many options
-   Control panels and settings screens
