# Atomic Dev Plan Index

Single source of truth: `app-write-up.md` (section 46).

Execution rules:

- Execute files in exact order.
- Do not skip verification criteria in each file.
- Do not merge steps; one step owns one aspect.
- If a step fails verification, stop and fix before next step.

Ordered steps:

1. `01_architecture_decisions.md`
2. `02_repo_scaffold.md`
3. `03_environment_schema.md`
4. `04_database_schema.md`
5. `05_database_indexes_and_seeds.md`
6. `06_authentication.md`
7. `07_authorization_rbac.md`
8. `08_locale_routing.md`
9. `09_translation_reuse_and_persistence.md`
10. `10_generation_input_validation.md`
11. `11_research_source_collection.md`
12. `12_ai_composition_pipeline.md`
13. `13_duplicate_equipment_detection.md`
14. `14_admin_generate_form.md`
15. `15_editorial_state_machine.md`
16. `16_scheduled_publishing_worker.md`
17. `17_public_post_rendering_mobile_first.md`
18. `18_media_storage_adapter.md`
19. `19_comments_and_moderation.md`
20. `20_seo_and_social_metadata.md`
21. `21_search_and_related_posts.md`
22. `22_view_analytics_and_observability.md`
23. `23_performance_and_scalability.md`
24. `24_security_copyright_and_release_traceability.md`

Final completeness rule:

- Implementation is complete only if step 24 proves full traceability to all mandatory requirements in `app-write-up.md` sections 1-46.
