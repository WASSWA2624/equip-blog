# 21 Search and Related Posts

Source sections: 24.1, 29, 30, 39.
Atomic aspect: discovery only.
Prerequisite: step 20.

## Goal

Implement search and related-content discovery for published localized content.

## Implement

1. Build the public search page and search query service.
2. Search across the exact fields listed in section 30.1.
3. Restrict search results to published content in the requested locale.
4. Implement related-post selection using the ordering rules in section 29.
5. Surface related posts on post pages and discovery blocks on landing pages where appropriate.

## Required Outputs

- search service
- search page
- related-posts service

## Verify

- relevant published results are returned for equipment terms
- exact title matches rank above weaker matches
- related posts respect locale and overlap rules

## Exit Criteria

- users can discover content through search and related recommendations
