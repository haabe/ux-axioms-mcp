---
id: teslers_law
title: Tesler's Law
category: cognitive_psychology_and_behavior
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:28.000000'
tags:
  - ux
  - complexity
  - simplification
  - product_design
related_rules:
  - fitts_law
  - hicks_law
  - jakobs_law
  - millers_law
  - postels_law
  - anchoring_bias
components: []
patterns: []
common_violations: []
fix_strategies: []
---
# Tesler's Law

## Description

Also known as The Law of Conservation of Complexity, this states that for any system, there is a certain amount of complexity which cannot be reduced. The only question is who deals with it: the user, the developers, or the designers.

## Best Practices

### Absorb complexity for the user

Instead of: Making the user enter their city, state, and zip code based on their address.
Do: Automatically populating city and state fields after the user enters a zip code.

### Don't oversimplify

Instead of: Removing an "expert" feature because most users don't need it.
Do: Hiding the feature under an "Advanced Settings" area, reducing complexity for the majority while retaining power for the few.

### Be deliberate about where complexity lives

Instead of: Forcing a user to manually sync data between devices.
Do: Investing development effort to build automatic, cloud-based data synchronization. The complexity is moved from the user to the system.

## Typical Contexts

-   Software and application design, especially for complex domains (e.g., photo editing, financial analysis).
-   Deciding between user customization vs. opinionated defaults.
-   Automating processes and workflows.
-   Service design.
