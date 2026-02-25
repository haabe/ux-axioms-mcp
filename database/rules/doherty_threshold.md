---
id: doherty_threshold
title: Doherty Threshold
category: cognitive_psychology_and_behavior
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:29.000000'
tags:
  - ux
  - performance
  - speed
  - interaction
related_rules:
  - the_labor_illusion
components:
  - loading
patterns:
  - skeleton
  - optimistic-ui
common_violations:
  - slow response
  - janky transitions
fix_strategies:
  - budget < 400ms for feedback
  - use GPU-accelerated transitions
---
# Doherty Threshold

## Description

Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other. Keeping feedback snappy and immediate keeps users in a state of flow.

## Best Practices

### Provide immediate feedback

Instead of: A button that shows no change for a second after being clicked.
Do: An immediate change in the button's state (e.g., color change, "loading" text) upon click, even if the system is still working.

### Optimize for perceived performance

Instead of: A blank screen while a large image loads.
Do: Displaying a low-resolution, blurred version of the image instantly, which is then replaced by the high-resolution version when it's ready.

### Use optimistic UI updates

Instead of: Waiting for server confirmation to show an item has been "liked".
Do: Immediately showing the "liked" state on the UI while the server request happens in the background. Handle the error case gracefully if the request fails.

## Typical Contexts

-   Website and application performance optimization (front-end and back-end).
-   UI animations and state transitions.
-   Any user interaction that triggers a system response (clicks, form submissions, data filtering).
-   Designing loading states (spinners, progress bars, skeleton screens).
