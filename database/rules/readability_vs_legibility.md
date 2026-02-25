---
id: readability_vs_legibility
title: Readability vs. Legibility
category: typography_and_text_perception
evidence_level: established
validated: true
last_updated: '2026-02-24T10:00:45.000000'
tags:
  - ux
  - typography
  - readability
  - legibility
  - content
  - accessibility
related_rules:
  - line_length_cpl
  - line_height_leading
components: []
patterns:
  - readability
common_violations:
  - missing labels
  - low contrast
  - no focus state
fix_strategies:
  - add label/aria
  - increase contrast
  - ensure focus styles
---
# Readability vs. Legibility

## Description

These two terms are related but distinct:
-   **Legibility** is a measure of how easily a reader can distinguish individual letterforms in a piece of text. It's a micro-level concern, dependent on typeface design, font size, and contrast.
-   **Readability** is a measure of how easily a reader can understand the content as a whole. It's a macro-level concern, dependent on vocabulary, sentence structure, and typography (line length, line height).

A text can be legible but not readable (e.g., a clear legal document full of jargon), but it cannot be readable if it is not first legible.

## Best Practices

### To improve Legibility:

-   **Choose clear typefaces:** Avoid overly decorative or complex script fonts for body text.
-   **Ensure high contrast:** Text should have a sufficient contrast ratio against its background (e.g., black text on a white background).
-   **Use an adequate font size:** For body text, 16px is a common and safe baseline for web.

### To improve Readability:

-   **Use simple language:** Write for your audience. Avoid jargon and complex sentence structures.
-   **Optimize typography:** Adhere to best practices for line length (CPL) and line height (leading).
-   **Structure content:** Use headings, subheadings, lists, and short paragraphs to break up the text.

## Typical Contexts

-   This is a fundamental and universal concept in all design that involves text.
-   **Legibility** is paramount in UI design for elements like buttons, labels, and navigation.
-   **Readability** is paramount for content design, such as blog posts, instructions, and reports.
