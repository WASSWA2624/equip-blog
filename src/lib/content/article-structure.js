export const generatedArticleSectionOrder = Object.freeze([
  "featured_image",
  "definition_and_overview",
  "principle_of_operation",
  "components_and_parts",
  "types_and_variants",
  "uses_and_applications",
  "commonly_used_manufacturers",
  "commonly_encountered_models",
  "faults_and_remedies",
  "daily_care_and_maintenance",
  "preventive_maintenance_schedule",
  "safety_precautions",
  "sop_and_how_to_use_guidance",
  "manuals_and_technical_documents",
  "faq",
  "references",
  "disclaimer",
]);

export const publicPostPageSectionOrder = Object.freeze([
  "title",
  "excerpt",
  "featured_image",
  ...generatedArticleSectionOrder.filter((sectionId) => sectionId !== "featured_image"),
  "related_posts",
  "comments",
]);
