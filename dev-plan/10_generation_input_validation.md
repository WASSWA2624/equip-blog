# 10 Generation Input Validation

Source sections: 17.1, 23.1, 27.1.
Atomic aspect: generation input contract only.
Prerequisite: step 09.
Implement: Zod schema for equipment, locale, articleDepth default `complete`, targetAudience multiselect default all, schedule and replaceExisting flags.
Deliverable: shared request validator.
Verify: invalid payloads fail predictably; valid payloads match API contract.
