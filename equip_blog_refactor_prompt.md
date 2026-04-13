# Expert Codebase Review and Refactor Prompt

## Objective

Perform an expert-level, end-to-end review and refactor of the attached codebase. Preserve anything already implemented and compliant. Change only what is necessary to make the full system fully compliant, coherent, scalable, maintainable, and production-ready.

---

## Core Operating Rules

* Deeply review the entire codebase before making architectural changes.
* Identify and preserve all existing features, modules, patterns, and flows that are already compliant with these requirements.
* Refactor only non-compliant, inconsistent, redundant, brittle, or low-quality parts.
* Avoid unnecessary rewrites.
* Keep the final solution clean, minimal, performant, and internally consistent.
* Ensure every change is reflected across the entire stack where relevant.

---

## Execution Scope

## 1. Full Codebase Review

Perform a full audit of the attached codebase, including:

* frontend
* backend
* database layer
* API layer
* admin flows
* blog system
* utilities
* environment configuration
* assets
* routing
* SEO implementation
* build and runtime configuration

### Review Requirements

* Identify what is already compliant and leave it unchanged.
* Identify non-compliant areas and refactor them.
* Detect architectural inconsistencies, naming issues, duplication, dead code, broken abstractions, poor separation of concerns, and scalability risks.
* Standardize patterns across the project where beneficial.
* Ensure the final codebase feels intentionally designed as one coherent system.

---

## 2. Code Cleanup

Clean the codebase thoroughly without damaging compliant functionality.

### Remove

* unused code
* duplicate code
* obsolete code
* dead code
* redundant helpers
* unnecessary components
* unnecessary assets
* unused styles
* stale utilities
* unused configs
* irrelevant files

### Keep

* useful code
* compliant code
* reusable code
* production-relevant files
* stable existing implementations that already meet requirements

### Cleanup Standards

* eliminate duplication at both logic and UI levels
* reduce unnecessary abstractions
* improve readability
* improve maintainability
* keep folder structure clear and purposeful

---

## 3. Environment File Refactor

Refactor the project so that `.env` is the active environment file instead of `.env.local`.

### Required Rules

* use `.env` as the primary runtime environment file
* use `.env.template.txt` as the canonical template source for `.env`
* align the entire codebase to this convention
* remove or replace `.env.local` assumptions where they exist
* update environment loading logic, docs, scripts, and references accordingly

### Environment Standards

* centralize environment variable access
* validate required environment variables safely
* avoid hard-coded secrets or values in source code
* keep environment naming consistent
* ensure local development and deployment are both aligned with the `.env` strategy

---

## 4. SEO Refactor and Optimization

Fully optimize the application for SEO using standards commonly validated by the top SEO optimization tools.

### Implement and validate all of the following

* page-level metadata
* titles
* meta descriptions
* canonical URLs
* Open Graph tags
* Twitter cards
* structured data / schema markup
* sitemap generation
* robots.txt
* semantic HTML
* crawlability
* internal linking
* clean URL structure
* indexability controls where needed
* page speed and performance-related SEO improvements

### SEO Expectations

* ensure every important route is SEO-ready
* ensure blog pages are SEO-rich and indexable
* eliminate duplicate metadata patterns
* fix missing or weak metadata
* improve heading structure and semantic layout
* ensure structured data is relevant and valid
* ensure canonicalization is consistent
* ensure sitemap and robots behavior are correct
* optimize for discoverability, sharing, and search rendering quality

---

## 5. Blog Refactor

Refactor the blog into a comprehensive, scalable, maintainable system.

### Blog Requirements

* blog posts must be AI-generated, not hard-coded
* blog architecture must support:

  * generation
  * editing
  * updating
  * publishing management
  * regeneration
* the content pipeline must be practical for long-term use
* the blog must be extensible and production-ready

### Blog Standards

* separate content generation logic from presentation
* support structured blog data management
* support slug generation and uniqueness
* support SEO-ready blog pages
* support future growth without architectural rework
* avoid hard-coded content pages masquerading as a blog system

---

## 6. Performance Optimization

Optimize the entire system for the best practical performance.

### Performance Scope

* frontend rendering
* backend execution
* data fetching
* database access
* asset loading
* caching opportunities
* route-level performance
* bundle behavior
* hydration/render strategy where relevant
* unnecessary rerenders
* query efficiency
* network overhead
* responsiveness and perceived speed

### Performance Standards

* remove performance bottlenecks
* reduce unnecessary client-side work
* improve loading behavior
* optimize media and static assets
* optimize API and database interactions
* eliminate wasteful repeated computations
* keep performance improvements aligned with maintainability

---

## 7. UI Reusability and Uniformity

Refactor the UI layer for maximum reuse and consistency.

### Requirements

* maximize reusable components
* standardize component architecture
* standardize naming
* standardize styling patterns
* standardize behavior and interaction patterns
* eliminate duplicate UI logic
* consolidate repeated layouts, controls, cards, tables, forms, and wrappers where appropriate

### UI Standards

* enforce a consistent design language
* enforce structural uniformity
* reduce one-off components unless justified
* improve composability
* improve maintainability
* keep the UI system scalable for future additions

---

## 8. Database Refactor to `snake_case`

Refactor the database and all related code to use `snake_case` consistently.

### Required Refactor Scope

Apply `snake_case` to all relevant database-facing elements, including:

* table names
* column names
* migration files
* ORM models
* schema definitions
* query builders
* raw SQL
* repositories
* API payload mappings where required
* DTOs
* validators
* serializers
* service-layer references
* admin integrations
* blog integrations
* seed logic

### Standards

* ensure naming consistency across the entire stack
* eliminate mixed naming conventions
* update all references safely
* preserve correctness and data integrity
* ensure the final implementation is fully aligned end-to-end

---

## 9. Advert Placeholder Click Behavior

Implement the empty advert placeholder so that it is clickable and redirects to the WhatsApp number stored in `.env`.

### Required Behavior

* clicking the empty advert placeholder must open WhatsApp using the configured number
* the number to configure is `+256783230321`
* do not hard-code the value in component logic if it is meant to come from `.env`
* wire the feature through environment configuration cleanly

### Standards

* the click target must be obvious and functional
* the implementation must be robust across supported environments
* the number source must be configurable through `.env`

---

## 10. Admin Dashboard

Create a simple admin dashboard with the following routes:

* `/admin/login`
* `/admin/`

### Admin Login Defaults

Use these default bootstrap credentials:

* email: `admin@admin.com`
* password: `admin`

### Security and Implementation Expectations

* implement the defaults as initial bootstrap credentials only
* store credentials securely
* hash the password properly
* keep the implementation simple but correct
* ensure login/session/auth flow is functional and maintainable

### Admin Dashboard Must Support

* configuration of AI provider
* configuration of AI model
* configuration of API key

### Required Behavior

* once a provider is selected, only models supported by that provider must be shown
* the model selector must be searchable
* provider/model selection logic must be clean and maintainable
* the configuration flow must be practical for ongoing admin use

---

## 11. Equipment Post Generator

The admin dashboard must include an equipment-based blog post generator.

### Required Features

* input field for equipment name
* **Generate Post** action
* AI-generated blog post creation based on the entered equipment name
* support saving and managing generated content properly

### Standards

* generation flow must integrate with the selected AI provider/model/API key configuration
* generation logic must be modular and maintainable
* generated content must fit the blog architecture
* generated content must not be hard-coded

---

## 12. Equipment Master List Table

The admin dashboard must include a prefilled table of unique medical equipment general names.

### Critical Data Rules

* include only general medical equipment names
* remove duplicates
* merge variants into their parent/general equipment name
* do not treat subtype variants as separate general-name entries when they belong to one broader equipment category

### Example Rule

* `x-ray machine` is a valid general equipment name
* `dental x-ray` and `c-arm x-ray` are variants and must not be treated as separate general names if they belong under `x-ray machine`

### Quantity Requirement

* generate as many valid unique general medical equipment names as possible
* target at least **1,000**
* exceed **1,000** if more valid entries exist
* if fewer than **1,000** can be justified realistically without inventing invalid categories, use the maximum valid number possible

### Data Standards

* prioritize correctness over artificial inflation
* avoid variant duplication
* avoid synonyms that represent the same general equipment name
* keep names normalized and consistent
* structure the table so it is manageable in admin workflows

---

## 13. Posted Status and Content Management

Each equipment entry must support content lifecycle management.

### Required Per-Entry Features

* mark as already posted
* manual editing
* manual updating
* AI-based regeneration
* AI-based updating

### Standards

* keep content state management clear
* make the workflow practical for repeated admin use
* ensure the system can distinguish draft, generated, edited, updated, and posted states as needed
* keep the implementation simple, usable, and scalable

---

## 14. Architecture and Integration Standards

Ensure all new and refactored parts work together coherently.

### Requirements

* align admin tools with the blog system
* align AI configuration with generation flows
* align environment configuration with runtime behavior
* align database naming with all application layers
* align SEO with content architecture
* align UI reuse with new admin features
* ensure all changes integrate cleanly across the full codebase

### General Engineering Standards

* clean architecture
* strong consistency
* maintainable abstractions
* scalable structure
* minimal technical debt
* production readiness
* no fragile shortcuts
* no disconnected implementations

---

## 15. Quality Expectations

Ensure the final refactor is production-oriented.

### Enforce

* correctness
* consistency
* maintainability
* readability
* scalability
* performance
* SEO integrity
* admin usability
* data normalization
* configuration clarity

### Avoid

* breaking already compliant functionality
* unnecessary rewrites
* hard-coded content where dynamic behavior is required
* inconsistent naming
* duplicate logic
* overengineering
* partial refactors that leave the system internally inconsistent

---

## 16. Final Implementation Directive

Deeply review the entire codebase, preserve everything already implemented and compliant, and refactor only the parts that are non-compliant, redundant, weak, or inconsistent. Deliver a clean, scalable, SEO-optimized, performance-oriented, AI-enabled, admin-manageable, production-ready architecture that is fully coherent across the entire codebase, including environment handling, blog generation, admin configuration, advert behavior, UI consistency, and database-wide `snake_case` alignment.
