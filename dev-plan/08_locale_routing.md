# 08 Locale Routing

Source sections: 10.3, 11.1, 11.2, 14.
Atomic aspect: locale routing only.
Prerequisite: step 07.

## Goal

Implement the Release 1 public routing model with locale-prefixed URLs and root redirection.

## Implement

1. Support the exact locales `en`, `fr`, `sw`, and `ar`.
2. Implement root `/` redirection to the default or negotiated locale.
3. Ensure all public pages render under `[locale]`.
4. Keep admin routes under `/admin`.
5. Add helpers for locale-aware links and canonical path generation.
6. Add safe handling for unsupported locale prefixes.

## Required Outputs

- locale routing layer
- root redirect behavior
- locale-aware path helpers

## Verify

- all public route families resolve correctly for each supported locale
- `/` redirects correctly
- unsupported locales do not resolve to broken content

## Exit Criteria

- the app has a stable routing contract for all public pages
