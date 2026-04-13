# Codebase Refactor Brief

Perform an expert-level, end-to-end review of the attached codebase and produce a complete refactor of the project while preserving all existing functionality that is already correctly implemented and compliant.

## Core Objective

Refactor the entire codebase to improve cleanliness, maintainability, performance, SEO, content generation, admin control, and database naming consistency, without altering any parts that are already correct and aligned with the requirements.

## Refactor Requirements

### 1. Codebase Cleanup

- Remove unnecessary, unused, duplicate, obsolete, or dead code.
- Delete redundant files, components, utilities, configurations, and assets.
- Preserve all files and logic that are already valid, useful, and compliant.

### 2. Environment Configuration

- Use `.env` as the active environment file instead of `.env.local`.
- Use `.env.template.txt` as the source template for `.env`.
- Ensure all required environment variables are clearly documented and aligned with the refactored implementation.

### 3. SEO Optimization

- Optimize the application for strong SEO performance using the standards commonly validated by the top 10 SEO optimization tools.
- Ensure best-practice implementation for at least:
  - metadata
  - titles and descriptions
  - canonical URLs
  - structured data / schema markup
  - Open Graph and Twitter cards
  - sitemap generation
  - robots.txt
  - internal linking
  - semantic HTML structure
  - page speed and crawlability
- Preserve existing SEO-compliant implementations where already correct.

### 4. Blog Improvements

- Make the blog comprehensive, scalable, and production-ready.
- Blog content must be AI-generated and not hard-coded.
- Ensure the blog architecture supports generating, editing, updating, and displaying posts cleanly.
- Keep already compliant blog functionality unchanged where applicable.

### 5. Performance Optimization

- Optimize the codebase for the best possible performance.
- Improve frontend and backend efficiency, rendering behavior, database access patterns, asset loading, and overall responsiveness.
- Remove performance bottlenecks while preserving behavior.

### 6. UI Reusability and Uniformity

- Maximize reuse of UI components across the application.
- Standardize component design, naming, structure, styling, and behavior.
- Eliminate unnecessary UI duplication and enforce consistency throughout the app.

### 7. Database Naming Convention Refactor

- Refactor the database to use `snake_case` for all table names and column names.
- Refactor and align the entire codebase so all database references, queries, models, migrations, schemas, APIs, and related logic consistently use `snake_case`.
- Ensure no mismatches remain between database structure and application code.

### 8. Advert Placeholder Behavior

- Make the empty advert placeholder clickable.
- On click, redirect to a WhatsApp number defined in `.env`.
- Use this number:
  - `+256783230321`

## Admin Dashboard Requirements

Create a simple admin dashboard with the following routes:

- `/admin/login`
- `/admin`

### Admin Login

Use the following default credentials:

- **Email:** `admin@admin.com`
- **Password:** `admin`

### Admin Features

#### AI Provider Configuration

Allow the admin to configure:

- AI provider
- AI model
- API key

Behavior:

- Once a provider is selected, show only that provider’s supported models in a selectable dropdown.

#### Equipment Post Generation

Allow the admin to:

- input an equipment name
- click **Generate Post**
- generate a blog post using AI

#### Equipment Master Table

Add a table in the admin dashboard that is prefilled with a list of unique medical equipment general names.

This table must be populated using a comprehensive equipment master list based on the following rule:

- include only general equipment names
- avoid repetition
- merge variants into their parent/general equipment name

Example:

- `x-ray machine` is the general name
- variants such as `dental x-ray` and `c-arm x-ray` should not be treated as separate general equipment names

Target:

- generate as many unique general medical equipment names as possible
- aim for at least **1,000**
- if fewer than 1,000 are realistically possible, include the maximum valid set
- if more than 1,000 are possible, exceed 1,000

#### Post Status Management

Each equipment entry must support a status indicating whether it has already been posted.

This should allow an equipment item to be:

- marked as already posted
- edited manually
- updated manually
- regenerated or updated via AI

## Implementation Constraints

- Leave all existing implementations unchanged where they are already correct and compliant.
- Refactor only what is necessary to meet the above requirements.
- Maintain a clean, scalable, production-ready architecture.
- Ensure the final implementation is coherent, consistent, and fully aligned across the codebase.

## Expected Deliverable

Produce a comprehensive refactor plan and implementation that:

1. audits the current codebase
2. identifies non-compliant areas
3. preserves compliant areas
4. refactors the rest to fully satisfy all requirements above

