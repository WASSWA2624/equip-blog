# Refactor Prompt: Equip Blog Codebase Cleanup, SEO, Performance, Blog Quality, and UI System Consolidation

You are a principal-level full-stack engineer and architect working on a **Next.js 16 + React 19 + App Router + styled-components + Prisma/MariaDB + Redux Toolkit + JavaScript** codebase.

Your task is to perform a **deep, repository-aware refactor** of the entire codebase.

## Mission

Refactor the repository to achieve all of the following **without breaking already compliant behavior**:

1. **Clean up the codebase** by removing unnecessary code, dead scaffolding, placeholder artifacts, and files that are not needed.
2. **Use `.env` as the runtime environment file** instead of `.env.local`.
3. **Use `.env.template.txt` as the committed template** for `.env`.
4. **SEO-optimize the app** so it performs strongly against checks commonly surfaced by these tools:
   - Semrush Site Audit
   - Ahrefs Site Audit
   - Screaming Frog SEO Spider
   - Google Search Console
   - Google URL Inspection
   - Google Rich Results Test
   - Lighthouse SEO audits
   - PageSpeed Insights
   - GTmetrix
   - SE Ranking Website Audit
5. Make the **blog truly comprehensive**, not thin, placeholder-like, or scaffold-centric.
6. Optimize the codebase for **best practical performance**.
7. Maximize **reusability, consistency, and uniformity of UI components**.
8. **Leave what is already implemented and compliant as is.** Do not rewrite compliant code just for style.

---

## Refactor Operating Rules

### Preserve behavior where already correct
- Do **not** replace working, compliant logic just because another style is possible.
- Only change code when one or more of these are true:
  - it is incorrect,
  - it is duplicated,
  - it is dead or unused,
  - it harms SEO,
  - it harms performance,
  - it harms maintainability,
  - it hurts UI consistency,
  - it conflicts with the env-file requirements,
  - it leaves production-visible scaffold or placeholder artifacts.

### Refactor philosophy
- Prefer **surgical, high-signal** changes over blanket rewrites.
- Prefer **server components by default** and only use client components where interactivity truly requires them.
- Prefer **shared primitives and composition** over copy-pasted styled-component blocks.
- Prefer **deletion** over keeping speculative or scaffold-only code.
- Prefer **small focused modules** over giant multi-thousand-line files.
- Prefer **measurable acceptance criteria** over vague improvements.

---

## Repository-Specific Findings You Must Address

The refactor must explicitly handle these repo-specific issues:

### 1) Environment file strategy is inconsistent
Current repo behavior assumes `.env.local` in multiple places. Refactor so `.env` becomes the canonical runtime env file and `.env.template.txt` becomes the committed template.

Update all relevant places, including but not limited to:
- `prisma.config.ts`
- `prisma/seed.js`
- `nodemon.json`
- README / setup docs
- env validation error messages
- any tests or scripts that still assume `.env.local` or `.env.example`

Required outcome:
- `.env.local` is no longer the primary env source.
- `.env.template.txt` is the canonical committed template.
- `.env.example` should be removed or retired unless there is a compelling compatibility reason.
- all setup instructions consistently tell developers to copy `.env.template.txt` to `.env`.

### 2) Installability is not clean
`npm ci` currently fails because `package.json` and `package-lock.json` are out of sync.

Required outcome:
- dependency graph is synchronized,
- lockfile is regenerated correctly,
- `npm ci` works,
- scripts are trustworthy.

### 3) Production-visible scaffold / placeholder copy remains
Remove or replace production-facing scaffold language and obvious placeholder UX/content where inappropriate, including patterns like:
- “scaffold” or “Repo scaffold ready” in SEO-visible surfaces
- placeholder admin/public metadata
- “Advertise Here” / hardcoded fake ad blocks unless there is a real ads feature behind them
- fake editorial contact values such as `editorial@equip-blog.local`
- placeholder route/status content that should not appear in a production-grade public blog

### 4) Dead or near-dead scaffold files exist
Audit and remove unnecessary files/modules such as scaffold-only exports and dead markers if they are not used in runtime.
Examples that should be reviewed carefully include:
- `src/components/blog/index.js`
- `src/components/forms/index.js`
- any placeholder-only modules with no meaningful runtime value

### 5) Large monolithic files need decomposition
Break down oversized files into maintainable modules with clear boundaries.
High-priority files include:
- `src/components/public/index.js`
- `src/features/public-site/index.js`
- `src/lib/ai/index.js`
- `src/lib/research/index.js`
- `src/components/admin/provider-configuration-screen.js`
- `src/components/admin/generate-post-screen.js`
- `src/components/admin/post-editor-screen.js`
- `src/components/layout/admin-shell.js`
- `src/components/layout/site-shell.js`

Decompose by responsibility, not arbitrarily.

### 6) Helper logic is duplicated across runtime layers
Centralize duplicated logic where appropriate. Review and consolidate repeated patterns such as:
- equipment title/display formatting helpers,
- string dedupe helpers,
- pagination integer normalization helpers,
- repeated metadata formatting logic,
- repeated page shell / hero / card / badge / panel patterns.

### 7) Public pages are too hydration-heavy
The public site currently relies on large client components for content-heavy pages. Reduce client JavaScript substantially.

Required outcome:
- render as much as possible on the server,
- isolate interactivity into leaf client components,
- avoid shipping the entire public UI as one giant client bundle,
- keep hydration scope small.

### 8) Image delivery is not optimized enough
The public UI currently relies heavily on plain `img` usage.

Required outcome:
- adopt `next/image` where practical,
- configure `images.remotePatterns` / allowed sources as needed,
- preserve external media safety rules,
- reduce CLS and improve LCP,
- keep meaningful alt text,
- maintain graceful fallback behavior.

### 9) Homepage caching strategy is too expensive
Review `src/app/[locale]/page.js` and remove unnecessary force-dynamic rendering if it is not strictly required.

Required outcome:
- use ISR / cache strategy where safe,
- keep freshness requirements intact,
- improve TTFB and cacheability.

### 10) SEO code has correctness and polish issues
Review all metadata, structured data, canonical, robots, sitemap, and indexation logic.
Examples to fix include:
- duplicate object keys / metadata bugs,
- weak or scaffold-centric default metadata copy,
- missing or weak SEO fallbacks,
- schema gaps,
- internal linking weaknesses,
- pagination/indexation mistakes,
- crawl hygiene issues,
- content discoverability weaknesses.

### 11) Fixture-oriented logic is leaking into runtime paths
Audit production runtime for fixture-specific behavior and fake source substitutions.
Examples to review include:
- fixture URL mapping in public-site rendering,
- deterministic fixture fallbacks in production code paths,
- fixture content that should be restricted to tests/dev-only execution.

Required outcome:
- acceptance fixtures remain available for tests where needed,
- production behavior does not depend on fake or placeholder fixture content unless explicitly intended and safely isolated.

### 12) Documentation quality is inconsistent
README currently references missing docs paths.

Required outcome:
- docs match reality,
- setup instructions are accurate,
- deleted docs are not referenced,
- architecture/setup guidance is trustworthy.

---

## Required Workstreams

## A. Codebase Cleanup

Perform a real cleanup pass.

### Remove or refactor:
- dead exports,
- unused components,
- unused helper modules,
- placeholder-only files,
- orphaned tests that no longer correspond to production behavior,
- misleading docs references,
- fake UI placeholders that should not ship,
- redundant wrappers and unnecessary indirection.

### Keep:
- useful tests,
- documented acceptance fixtures that still serve a valid QA purpose,
- compliant SEO and locale-aware routing behavior,
- working auth and editorial flows.

### Cleanup acceptance criteria
- no obvious dead scaffold marker modules remain,
- no production UI exposes development/scaffold messaging,
- no docs point to missing files,
- file structure is easier to navigate.

---

## B. Environment Strategy Refactor

### Implement this env standard
- Runtime env file: `.env`
- Committed template: `.env.template.txt`
- `.env` stays ignored by git
- `.env.template.txt` contains all required variables with safe placeholder values and clear inline comments where useful

### Required tasks
- migrate `.env.local` assumptions to `.env`
- update Prisma config loading order
- update seed scripts
- update dev tooling watchers
- update runtime validation error copy to reference `.env.template.txt`
- update docs and onboarding instructions
- ensure test helpers reflect the new standard where relevant

### Env acceptance criteria
- starting the app locally only requires `.env`
- a new developer can copy `.env.template.txt` to `.env` and boot the app
- no runtime-critical code path still assumes `.env.local`

---

## C. SEO Hardening Against the 10 Tools

Treat this as a serious SEO engineering pass, not just “add a few meta tags.”

### Optimize for technical checks commonly surfaced by the listed tools

#### Crawlability and indexation
- robots rules are correct and minimal
- sitemap is complete, valid, stable, and excludes intentionally noindexed/search pages where appropriate
- all indexable pages return the correct canonical URL
- no accidental noindex/nofollow leakage
- URL normalization is consistent
- orphan pages are minimized
- internal linking helps discovery of important pages
- broken internal links, redirect chains, and crawl traps are removed

#### Metadata quality
- each indexable page has unique, non-placeholder title and description
- metadata reflects real page intent and entity context
- OG/Twitter metadata is production-grade and non-scaffold
- fallback metadata is sensible and brand-safe

#### Structured data / rich results
- validate and improve Organization, Article, Breadcrumb, FAQ, and any other applicable schema
- ensure schema reflects visible content and follows Google guidelines
- avoid invalid, misleading, or unsupported properties
- make article pages rich-result friendly where appropriate

#### Information architecture
- strengthen category, manufacturer, equipment, and blog relationships
- improve breadcrumb depth and internal hubs
- create better content pathways from broad pages to deep pages
- improve discoverability of new and important content

#### Content SEO
- eliminate thin or placeholder-like page copy
- ensure indexable pages have sufficient unique textual value
- ensure taxonomic landing pages are useful, not shallow lists with minimal context
- add strong headings, descriptive intros, meaningful summaries, and clear entity context
- ensure pagination pages are handled properly

#### Performance-related SEO
- improve Core Web Vitals posture
- reduce LCP/CLS/INP risk
- reduce unnecessary client JS
- optimize image loading strategy
- improve caching/revalidation behavior
- reduce heavy above-the-fold work

#### SEO validation deliverable
Create a checklist/matrix mapping the implemented changes to these tool families:
- Semrush Site Audit
- Ahrefs Site Audit
- Screaming Frog
- Google Search Console
- URL Inspection
- Rich Results Test
- Lighthouse SEO
- PageSpeed Insights
- GTmetrix
- SE Ranking

For each tool family, document:
- which classes of issues were addressed,
- what files changed,
- how compliance was improved,
- what remains intentionally out of scope, if anything.

---

## D. Blog Must Become Comprehensive

The blog should feel authoritative, complete, and useful.
Do not keep public content surfaces thin, generic, or scaffold-like.

### Strengthen the blog system at these levels

#### 1) Individual article quality
Each public article page should support:
- stronger lead section and summary,
- better heading hierarchy,
- better semantic HTML,
- visible trust/context signals,
- strong references section,
- FAQ where supported by real content,
- useful related content,
- richer entity context for equipment/manufacturer/category relationships,
- better share/discovery flows,
- stronger TOC or section navigation if it improves UX.

#### 2) Collection and taxonomy pages
Category / manufacturer / equipment / blog index pages should not be shallow grids only.
Where appropriate, add:
- descriptive intros,
- explanatory copy,
- featured/priority content,
- clear entity summaries,
- related subtopic navigation,
- meaningful internal links.

#### 3) Content architecture
Ensure the public blog supports a more comprehensive content graph:
- hub and spoke relationships,
- related entities,
- discoverable archives,
- better cross-linking,
- fewer dead ends.

#### 4) Editorial trust signals
Make sure the blog presents as a serious knowledge product:
- no fake placeholder copy,
- no scaffold language in public pages,
- consistent disclaimers where required,
- visible references and source grounding,
- coherent article metadata.

### Blog acceptance criteria
- public pages feel production-ready,
- taxonomy pages provide unique value,
- articles are not thin or generic,
- SEO-visible content is strong enough to stand on its own.

---

## E. Performance Optimization

Perform a real application performance pass.

### Priorities
- reduce client-side bundle size,
- shrink hydration boundaries,
- split giant components/modules,
- move non-interactive rendering to server components,
- improve route-level code splitting,
- lazy-load non-critical UI,
- use `next/image` where beneficial,
- avoid unnecessary dynamic rendering,
- improve cache/revalidate strategy,
- reduce repeated expensive formatting/computation in render paths,
- audit styled-components usage for unnecessary runtime cost,
- optimize list rendering and large page composition,
- ensure no heavy logic lives inside large client trees unless necessary.

### Performance acceptance criteria
- public routes ship materially less JS,
- large content pages have smaller hydration cost,
- image loading is improved,
- caching is more intentional,
- code splitting is cleaner,
- monolith modules are broken up with measurable bundle-health improvements.

---

## F. UI Reusability and Uniformity

Create a clearer design system / shared component layer.

### Extract and standardize reusable primitives for patterns repeatedly used across screens
Examples include:
- page shells,
- hero sections,
- section headers,
- content panels,
- cards,
- pills/badges,
- table/list wrappers,
- empty states,
- status banners,
- form rows,
- field labels/help/error states,
- modal/drawer primitives,
- button variants,
- navigation tabs,
- pagination controls,
- search bars.

### Rules
- remove repeated styled-component definitions where the same pattern appears across multiple screens,
- centralize spacing, radii, shadows, borders, typography scales, and surface treatments,
- preserve existing visual identity where already coherent,
- do not create abstraction for one-time use,
- do not over-engineer.

### UI acceptance criteria
- repeated patterns are shared,
- visual behavior is more consistent,
- component APIs are simpler,
- admin/public UI has clearer structure,
- future feature work becomes easier.

---

## G. Testing, Validation, and Build Quality

### Required engineering finish
- ensure `npm ci` works
- ensure lint passes
- ensure tests pass or are updated deliberately
- ensure build succeeds
- update/add tests for changed behavior where appropriate
- remove or fix brittle tests that no longer reflect real behavior

### Minimum validation you must perform
- verify public routes render correctly
- verify admin routes still work
- verify env loading works with `.env`
- verify sitemap/robots behavior
- verify metadata output for representative pages
- verify structured data output for representative pages
- verify pagination/internal linking still works
- verify images still render correctly after optimization changes

---

## Constraints and Guardrails

- Keep the stack unless a change is necessary to satisfy the goals.
- Stay in JavaScript unless a targeted TypeScript migration is clearly beneficial and low-risk.
- Do not introduce large new dependencies without strong justification.
- Do not remove locale-ready architecture.
- Do not regress auth, moderation, SEO, publishing, analytics, or editorial workflows.
- Do not leave TODO markers as a substitute for implementation.
- Do not preserve placeholder production copy just because it already exists.
- Do not perform shallow “cleanup” that only renames files without reducing complexity.

---

## Expected Deliverables

Produce all of the following:

### 1) The refactored codebase
With all required changes implemented.

### 2) A cleanup summary
List:
- files deleted,
- files heavily refactored,
- duplicated utilities consolidated,
- placeholder/scaffold elements removed.

### 3) An env migration summary
Explain:
- how `.env.local` was retired,
- how `.env.template.txt` is now used,
- what docs/scripts/tests changed.

### 4) An SEO implementation summary
Include a matrix showing improvements mapped to the 10 tool families.

### 5) A performance summary
Include:
- major bundle/hydration reductions,
- server/client boundary improvements,
- image optimization changes,
- cache/revalidation improvements.

### 6) A UI system summary
List the shared primitives introduced or consolidated.

### 7) Final verification report
Include results for:
- install
- lint
- tests
- build
- manual spot checks

---

## Definition of Done

The work is only done when all of the following are true:

- the repo is cleaner,
- unnecessary files/code are removed,
- `.env` is the active env file,
- `.env.template.txt` is the committed template,
- scaffold/placeholder production artifacts are removed,
- SEO is materially stronger and aligned to the listed tools,
- the blog feels comprehensive and production-ready,
- public performance is meaningfully improved,
- UI patterns are more reusable and consistent,
- compliant existing behavior was preserved,
- install/lint/test/build are green or any residual failure is explicitly justified and fixed if within scope.

Execute the refactor now.
