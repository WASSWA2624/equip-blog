# 03 Environment Schema

Source sections: 17, 32, 34.
Atomic aspect: environment contract only.
Prerequisite: step 02.

## Goal

Create the single validated runtime configuration contract for the application.

## Implement

1. Define a typed environment schema using Zod.
2. Support all required variables in section 34, including locale, auth, AI, storage, rate limiting, and secrets, with `SUPPORTED_LOCALES` set to `en` in Release 1 but still config-driven.
3. Distinguish required, optional, and feature-flag variables.
4. Add `.env.example` that matches the validated schema.
5. Centralize environment access so later modules do not read `process.env` directly.

## Required Outputs

- validated config module
- `.env.example`
- startup-time validation errors with clear messages

## Verify

- missing required variables fail fast at startup
- invalid values fail with actionable error messages
- optional variables have explicit defaults only where the write-up allows them

## Exit Criteria

- all later steps consume one shared config contract
