# 14 Admin Generate Form

Source sections: 5.2, 23, 27.2.
Atomic aspect: Generate Post page UX only.
Prerequisite: step 13.

## Goal

Build the admin UI for generation, review, and generation-stage feedback.

## Implement

1. Build all required inputs from section 23.1.
2. Surface duplicate detection feedback inline.
3. Show generation progress stages, warnings, and errors.
4. Show a live draft preview after generation.
5. Expose `Save Draft`, `Publish`, and scheduling actions, and keep schedule intent separate from final schedule confirmation.
6. Expose provider/model selection using the configured provider records.
7. Ensure default values match the validated request contract.

## Required Outputs

- Generate Post admin page
- generation progress UI
- preview UI

## Verify

- a valid generation request can be submitted from the UI
- progress stages match the source-of-truth stage order
- warnings and duplicate branches are visible and actionable

## Exit Criteria

- admins can drive the entire generation flow from one page
