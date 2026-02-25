---
id: fitts_law
title: Fitts's Law
category: cognitive_psychology_and_behavior
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:25.000000'
tags:
  - ux
  - interaction
  - motor-control
  - targets
related_rules:
  - doherty_threshold
  - hicks_law
  - jakobs_law
  - millers_law
  - postels_law
  - teslers_law
components: []
patterns:
  - buttons
  - links
common_violations:
  - targets too small
  - sparse hit area
fix_strategies:
  - ensure 44x44 css px
  - increase padding/margins
---
# Fitts's Law

## Description

The time to acquire a target is a function of the distance to and size of the target.

## Best Practices

### Make targets large

Instead of: Small, hard-to-click text links.
Do: Large, clearly defined buttons.

### Reduce distance

Instead of: Placing a "Submit" button far from the last form field.
Do: Placing the primary action button adjacent to the relevant content.

### Optimize for device ergonomics

Instead of: Placing key mobile actions at the top of the screen.
Do: Placing primary navigation and actions within the thumb's natural reach (bottom of the screen).

## Typical Contexts

-   Buttons, links, and all interactive targets
-   Mobile application design (e.g., Tab bars)
-   Popup menus and context menus
-   UI layout in general
