# 12 AI Composition Pipeline

Source sections: 3.1, 8, 9, 18, 28, 37, 38, 5.2.
Atomic aspect: AI composition, prompt configuration, and draft assembly only.
Prerequisite: step 11.

## Goal

Turn verified structured research into complete drafts that match the required article template.

## Implement

1. Build the provider/model abstraction using `providerConfigId`.
2. Implement prompt-template loading from `PromptTemplate`.
3. Implement the required prompt layers from section 18.4.
4. Generate structured article JSON first, then Markdown, then HTML, then SEO payloads.
5. Persist structured JSON blocks for faults, maintenance, models, and FAQs.
6. Ensure generated drafts follow the required order in section 9.
7. Build the admin Prompt Configuration page.
8. Use `microscope` from section 38 as the baseline acceptance fixture.

## Required Outputs

- draft-generation engine
- prompt configuration admin surface
- acceptance fixture tests

## Verify

- generated drafts contain the required sections
- disclaimers and references are never omitted
- `microscope` generates a compliant acceptance draft

## Exit Criteria

- the pipeline can create a valid draft from verified research input
