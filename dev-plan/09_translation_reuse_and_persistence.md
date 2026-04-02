# 09 Translation Reuse and Persistence

Source sections: 11.3, 11.4, 24, 39.
Atomic aspect: translation lifecycle and localization management only.
Prerequisite: step 08.

## Goal

Persist localized content correctly and prevent unnecessary regeneration of existing translations.

## Implement

1. Implement `en` as the source locale for generation.
2. Implement lazy translation on first request for supported non-`en` locales.
3. Persist exactly one active translation per post and locale.
4. Reuse stored translations when they already exist.
5. Support manual editing of localized content in the admin localization management page.
6. Persist localized Markdown and HTML render artifacts per post and locale.

## Required Outputs

- translation persistence service
- translation lookup and reuse logic
- localization management admin surface

## Verify

- the first non-`en` request creates and stores a translation
- later requests reuse the stored translation instead of regenerating it
- locale edits are persisted independently of the `en` source

## Exit Criteria

- localized content behavior is deterministic and reusable
