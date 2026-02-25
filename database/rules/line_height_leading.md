---
id: line_height_leading
title: Line Height (Leading)
category: typography_and_text_perception
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:43.000000'
tags:
  - ux
  - typography
  - readability
  - content
  - ui_design
related_rules:
  - line_length_cpl
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
# Line Height (Leading)

## Description

Line height (or "leading" in print typography) is the vertical distance between lines of text. For good readability of body copy, the optimal line height is generally agreed to be around 1.5x to 1.6x the font size.

## Best Practices

### Use a `unitless` value in CSS

Instead of: `line-height: 24px;`
Do: `line-height: 1.5;`. This allows the line height to scale automatically if the font size changes, preventing unexpected overlaps or spacing issues.

### Adjust for context

-   **Body Text:** A line height of `1.5` to `1.6` is ideal for long-form reading.
-   **Headings:** Headings have shorter lines and larger font sizes, so they typically need less line height. A value of `1.1` to `1.2` is common.
-   **Longer Lines:** If you must use longer line lengths (outside the CPL recommendations), you may need to slightly increase the line height to help the eye find the start of the next line.

### Ensure sufficient spacing between paragraphs

Use margin-top or margin-bottom on paragraphs to create a clear separation between them, which should be more than the line height.

## Typical Contexts

-   The foundational styling of all text in a website, application, or design system.
-   CSS stylesheets (`line-height` property).
-   Any design involving readable text.
