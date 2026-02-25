---
id: line_length_cpl
title: Line Length (CPL)
category: typography_and_text_perception
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:40.000000'
tags:
  - ux
  - typography
  - readability
  - content
  - ui_design
related_rules:
  - line_height_leading
  - readability_vs_legibility
components: []
patterns:
  - readability
common_violations:
  - too small font
  - long line length
fix_strategies:
  - 14-16px body
  - 45-75 CPL
---
# Line Length (CPL)

## Description

The optimal number of characters per line (CPL) for body text is widely considered to be between 45 and 75 characters, including spaces. Lines shorter than this cause the eye to travel back too often, breaking rhythm. Lines that are too long make it hard for the eye to find the start of the next line.

## Best Practices

### Constrain text block width

Instead of: Letting a paragraph of text span the full width of a wide-screen monitor.
Do: Setting a `max-width` on the text container (e.g., `max-width: 75ch` in CSS) to ensure the line length stays within the optimal range regardless of screen size.

### Balance with font size and line height

The optimal CPL is not an absolute rule and depends on font size and line height. Larger fonts can support slightly longer line lengths.

### Consider the medium

On mobile devices, where the screen is narrow, shorter line lengths (around 35-50 CPL) are often more comfortable.

## Typical Contexts

-   Blog posts, articles, and any long-form reading content.
-   Product descriptions and marketing copy.
-   Designing responsive layouts that need to accommodate text on various screen sizes.
-   Any interface with significant blocks of running text.
