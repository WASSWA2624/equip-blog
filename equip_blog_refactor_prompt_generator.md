# Markdown Prompt Generator

Use the following instruction to generate the final refactor prompt in markdown.

---

## Generator Instruction

Create a **single comprehensive markdown prompt** for an expert engineer or coding agent to deeply review and refactor the attached codebase.

### Output Rules

- The result must be **the final prompt only**.
- The result must be written in **clean markdown**.
- The result must be structured with clear headings, subheadings, bullet points, and implementation requirements.
- The result must be written as an **actionable instruction prompt**, not as commentary, explanation, or analysis.
- The prompt must instruct the engineer/agent to **preserve anything already implemented and compliant**.
- The prompt must be explicit, detailed, and production-oriented.

### The generated prompt must require all of the following

#### 1. Full Codebase Review

- Perform an expert-level, deep review of the entire attached codebase.
- Identify what is already compliant and leave it unchanged.
- Refactor only what is necessary to make the whole codebase fully compliant with the requirements.

#### 2. Code Cleanup

- Remove unnecessary, unused, duplicate, obsolete, dead, or redundant code.
- Remove unnecessary files, components, assets, utilities, and configurations.
- Keep useful and compliant code intact.

#### 3. Environment File Rules

- Use `.env` as the active environment file instead of `.env.local`.
- Use `.env.template.txt` as the template source for `.env`.
- Align the entire codebase with this environment configuration.

#### 4. SEO Requirements

- Fully optimize the app for SEO using standards commonly validated by the top 10 SEO optimization tools.
- Require implementation and validation of:
  - metadata
  - titles and meta descriptions
  - canonical URLs
  - structured data / schema markup
  - Open Graph
  - Twitter cards
  - sitemap
  - robots.txt
  - semantic HTML
  - internal linking
  - crawlability
  - page speed and performance-related SEO

#### 5. Blog Requirements

- Make the blog comprehensive and scalable.
- Ensure blog posts are **AI-generated**, not hard-coded.
- The blog architecture must support generating, editing, updating, and managing posts properly.

#### 6. Performance Optimization

- Optimize the entire codebase for best possible performance.
- Improve frontend rendering, backend logic, data fetching, asset loading, database access, and overall responsiveness.

#### 7. UI Reusability and Uniformity

- Maximize reusability of UI components.
- Enforce consistency in component design, structure, naming, behavior, and styling.
- Eliminate duplicated UI logic where appropriate.

#### 8. Database Refactor

- Refactor the database to use `snake_case` for all table names and column names.
- Refactor and align the entire codebase so all database-related logic consistently uses `snake_case`.
- This includes models, migrations, queries, schemas, APIs, DTOs, validators, and all related references.

#### 9. Advert Placeholder Behavior

- Make the empty advert placeholder clickable.
- Clicking it should redirect to the WhatsApp number stored in `.env`.
- The WhatsApp number to configure is `+256783230321`.

#### 10. Admin Dashboard

Require creation of a simple admin dashboard with:

- `/admin/login`
- `/admin/`*

##### Admin Login Defaults

- email: `admin@admin.com`
- password: `admin`

##### Admin Dashboard Features

The prompt must require:

- configuration of AI provider
- configuration of AI model
- configuration of API key

Behavior:

- once a provider is selected, only that provider’s supported models should appear in a searchable selectable dropdown

#### 11. Equipment Post Generator

The admin dashboard must allow:

- entering an equipment name
- clicking **Generate Post**
- generating a blog post using AI

#### 12. Equipment Master List Table

The admin dashboard must contain a prefilled table of **unique medical equipment general names**.

The generated prompt must clearly explain that:

- only general equipment names should be included
- duplicates must be removed
- variants must be merged into their parent/general equipment name

Example:

- `x-ray machine` is a general equipment name
- variants such as `dental x-ray` and `c-arm x-ray` must not be treated as separate general names

The generated prompt must require:

- generating as many valid unique general medical equipment names as possible
- targeting **at least 1,000**
- exceeding 1,000 if more valid entries exist
- using the maximum valid number if fewer than 1,000 are realistically possible

#### 13. Posted Status / Content Management

Each equipment entry must support:

- marking as already posted
- manual editing
- manual updating
- AI-based regeneration or updating

### Final instruction for the generated prompt

The generated prompt must end with a strong implementation directive that:

- preserves already compliant work
- refactors non-compliant parts
- keeps the final architecture clean, scalable, and production-ready
- ensures the final solution is coherent across the full codebase

---

## Expected Output From This Generator

A **single polished markdown prompt** ready to be given to an expert developer or coding agent.