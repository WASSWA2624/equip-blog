# 09 Translation Reuse and Persistence

Source sections: 11.3, 11.4, 3.3.
Atomic aspect: translation lifecycle only.
Prerequisite: step 08.
Implement: generate source in `en`, create non-`en` translation only when absent, reuse stored translations, persist per-locale output.
Deliverable: translation persistence service.
Verify: non-`en` requests do not regenerate existing translations.
