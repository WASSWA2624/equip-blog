# Automated Medical Equipment Blog Platform — Complete App Write-Up

## 1. Project Overview

This project is a full-stack AI-powered blog platform for publishing educational content about medical equipment.

The core workflow is simple:

1. Admin enters a general equipment name, for example `microscope`, `centrifuge`, `hematology analyzer`, or `ultrasound machine`.
2. The system searches trusted sources, gathers structured data, generates a complete post in default locale `en`, and prepares media.
3. The admin reviews the generated draft.
4. The admin clicks **Publish**.
5. The post becomes publicly visible, SEO-ready, localized, shareable, and open for visitor comments.

The platform must work for any medical equipment category, not only microscopes.

---

## 2. Primary Goal

Build a scalable content generation and publishing system where creating a detailed medical-equipment article is as easy as:

- typing the equipment name
- clicking **Generate Post**
- reviewing the draft
- clicking **Publish**

---

## 3. Core Business Requirements

### 3.1 Required Generated Post Content

For any equipment entered, the generated post should include, where available:

1. Equipment title
2. Definition / overview
3. Featured image
4. Principle of operation
5. Illustrative images with captions
6. Main components / parts
7. Different types / variants
8. Clinical or laboratory uses
9. Common manufacturers
10. Top commonly used manufacturers (target: top 100 where data is available - list is enough). Show top 5 with an option to view more.
11. For each manufacturer, common latest models by year of manufacture (target: top 100 where data is available - list is enough). Show top 5 with an option to view more. The models should be shown under the manufacturer.
12. Common faults / errors / failure modes (target: at least 100 if reliable information exists)
13. Remedies / troubleshooting steps
14. Daily care and maintenance
15. Preventive maintenance schedule
16. Safety precautions
17. User manuals, brochures, operator manuals, service manuals, or technical documents where available (links only)
18. How to use section with SOPs (prioritize general SOPs and add inline model-specific SOP differences when available)
19. FAQ section
20. Disclaimer
21. References / sources

Content quality requirement for every generated section:

- each section must be information-rich and instructional, not surface-level
- include practical examples and contextual explanation where useful
- include inline photos/illustrations where they improve clarity

### 3.2 Required Disclaimer

Every generated post must include a visible disclaimer such as:

> While care has been taken to ensure accuracy of the content in this post, this content is provided for educational and informational purposes only. It does not replace the manufacturer’s official instructions, operator manual, service manual, safety procedures, or institutional biomedical engineering protocols. Always follow the official manufacturer guidelines and applicable clinical regulations.

### 3.3 Publishing Requirements

- Draft generation before publishing
- Manual publish button
- Draft, scheduled, published, archived states
- Editable content before publishing
- Schedule publish date and time during generation or after generation
- Slug generation
- SEO metadata generation
- Social sharing metadata
- Duplicate detection before generation for existing equipment posts:
  - notify admin when an existing equipment post is detected
  - if admin permits regeneration, replace the existing post
  - if admin declines, do nothing and keep the existing post as-is

### 3.4 Visitor Requirements

- No subscription required to read posts
- Publicly visible blog posts
- Visitors can comment on posts
- Spam control for comments
- Moderation tools for comments
- Visitors can share posts via social platforms and email

---

## 4. Recommended Tech Stack

The requested stack is appropriate for this project:

- **Frontend / Fullstack framework:** Next.js (JavaScript, App Router)
- **AI layer:** Vercel AI SDK
- **Styling:** styled-components
- **State management:** Redux Toolkit
- **Validation:** Zod
- **ORM / database access:** Prisma
- **Database:** MySQL
- **Localization:** Next.js i18n strategy
- **Image and file handling:** local `public/` storage first, switchable to cloud object storage (for example AWS S3) via environment variables
- **Search indexing:** database-backed search first, optional external search later
- **Background jobs:** internal job runner / queue
- **Auth:** admin-only authentication, public reading for visitors

### 4.1 Why this stack fits

- Next.js App Router supports full-stack rendering, route handlers, metadata, layouts, and server-first architecture.
- Vercel AI SDK supports text generation and streaming workflows.
- Next.js supports metadata APIs and file conventions for SEO and social previews.
- Next.js also supports internationalization routing and localized content structure.
- Prisma is a solid ORM choice for MySQL-backed content systems.
- Redux Toolkit is suitable for admin UI state, filters, generation status, and editor workflows.
- styled-components can be used in the App Router with the required CSS-in-JS registry setup.
- Zod is appropriate for validating generation inputs, AI outputs, API payloads, and admin forms.

---

## 5. Product Scope

## 5.1 Public Website

- Home page
- Blog index page
- Category pages
- Manufacturer pages
- Equipment pages
- Individual post pages
- Search page
- Comment threads
- About page
- Contact page
- Disclaimer page
- Privacy policy page

## 5.2 Admin Panel

- Dashboard
- Generate Post page
- Drafts list
- Published posts list
- Categories management
- Manufacturers management
- Media library
- Comments moderation
- SEO management
- Localization management
- Job logs / generation logs
- Prompt configuration
- Source configuration

---

## 6. User Roles

### 6.1 Super Admin

- Full system control
- Manage settings
- Publish / unpublish
- Moderate comments
- Manage prompts and sources
- Manage translations

### 6.2 Editor

- Generate drafts
- Edit drafts
- Publish if allowed
- Upload media
- Moderate comments if allowed

### 6.3 Visitor

- Read posts
- Search content
- Comment on posts

---

## 7. High-Level Workflow

## 7.1 Post Generation Flow

1. Admin opens **Generate Post**.
2. Admin enters equipment name.
3. System checks for existing post(s) for that equipment and locale.
4. If duplicate is found, system notifies admin and requests action:
  - replace existing post and continue, or
  - stop generation and keep existing post
5. Admin chooses language, depth, target audience, and region.
6. System validates input with Zod.
7. System starts a generation job.
8. System runs research pipeline:
  - normalize equipment term
  - expand aliases and synonyms
  - collect manufacturers
  - collect models
  - collect maintenance and troubleshooting information
  - collect manuals and brochures
  - collect images and captions
9. System builds structured JSON.
10. AI converts structured JSON into a chronologically organized article.
11. SEO metadata is generated.
12. Draft is saved.
13. Admin can set publish schedule (date/time) immediately or later.
14. Admin reviews draft.
15. Admin clicks **Publish** (or leaves scheduled publishing active).
16. Post becomes live.

## 7.2 Comment Flow

1. Visitor opens post
2. Visitor submits comment
3. Comment passes validation and anti-spam checks
4. Depending on settings:
  - published immediately, or
  - held for moderation

---

## 8. Content Generation Strategy

This platform should not rely on a single raw prompt. It should use a structured pipeline.

## 8.1 Step 1: Input Normalization

Input: `microscope`

System expands to:

- microscope
- laboratory microscope
- optical microscope
- compound microscope
- clinical microscope

For other equipment, the system should also resolve synonyms, abbreviations, and spelling variants.

## 8.2 Step 2: Structured Research Schema

The research layer should aim to fill a normalized schema like this:

```json
{
  "equipmentName": "Microscope",
  "aliases": [],
  "summary": "...",
  "definition": "...",
  "principleOfOperation": "...",
  "components": [],
  "types": [],
  "uses": [],
  "manufacturers": [
    {
      "name": "...",
      "country": "...",
      "website": "...",
      "models": [
        {
          "name": "...",
          "category": "...",
          "manualLinks": []
        }
      ]
    }
  ],
  "faults": [
    {
      "fault": "...",
      "cause": "...",
      "symptoms": "...",
      "remedy": "..."
    }
  ],
  "maintenance": {
    "daily": [],
    "weekly": [],
    "monthly": [],
    "safety": []
  },
  "images": [
    {
      "url": "...",
      "caption": "...",
      "alt": "..."
    }
  ],
  "references": []
}
```

## 8.3 Step 3: AI Writing Layer

The AI should not invent facts. It should transform verified structured data into a readable article with:

- logical progression
- section headings
- numbered troubleshooting lists where appropriate
- tables for manufacturers and models
- caution notes
- references
- disclaimer

## 8.4 Step 4: Quality Gate

Before saving the draft, validate:

- required sections exist
- no empty headings
- at least one image exists if available
- manual links are valid if collected
- fault/remedy entries are paired correctly
- duplicate manufacturers and models are removed
- content length passes minimum threshold
- unsupported claims are flagged

---

## 9. Article Structure Template

Each generated article should follow a stable structure.

## 9.1 Recommended Post Order

1. Title
2. Intro summary
3. Definition
4. Featured image
5. Principle of operation
6. Main components
7. Types of the equipment
8. Common applications
9. Top manufacturers
10. Common models by manufacturer
11. Common faults and remedies
12. Daily care and maintenance
13. Preventive maintenance checklist
14. Safety precautions
15. Manuals / brochures / technical documents
16. Frequently asked questions
17. Disclaimer
18. References

This order is ideal for easy understanding and follow-up because it moves from basic knowledge to advanced operational support.

---

## 10. SEO Requirements

“100% SEO” is not realistic in an absolute sense because search ranking depends on competition, backlinks, crawl behavior, content quality, technical health, site authority, and search engine decisions. The practical goal should be **strong technical SEO + strong content SEO + clean information architecture**.

## 10.1 Technical SEO Requirements

- Server-rendered post pages
- Clean readable URLs
- Dynamic metadata per post
- Open Graph metadata
- Twitter/X metadata
- Canonical URLs
- XML sitemap
- robots.txt
- breadcrumb schema
- article schema
- organization schema
- image alt text
- internal linking
- fast Core Web Vitals
- compressed images
- lazy loading for non-critical media
- proper heading hierarchy
- structured data JSON-LD

## 10.2 Content SEO Requirements

- unique title per post
- unique meta description
- keyword-focused H1/H2/H3 structure
- equipment synonyms in content naturally
- FAQ schema where appropriate
- descriptive image captions
- topical cluster pages for categories and manufacturers
- related posts section
- multilingual SEO support

## 10.3 SEO Page Types

- `/` home
- `/blog`
- `/blog/[slug]`
- `/category/[slug]`
- `/manufacturer/[slug]`
- `/equipment/[slug]`
- `/search`

## 10.4 Metadata to Generate Per Post

- title
- description
- canonical URL
- OG title
- OG description
- OG image
- Twitter title
- Twitter description
- keywords
- authors
- publication date
- modified date

---

## 11. Internationalization Strategy

The application should support multiple locales from the start.

### 11.1 Locale Strategy

Example locales:

- `en`
- `fr`
- `sw`
- `ar`

### 11.2 Localized Routing

Example:

- `/en/blog/microscope`
- `/fr/blog/microscope`
- `/sw/blog/microscope`

### 11.3 What Should Be Localized

- UI labels
- buttons
- admin interface labels
- navigation
- disclaimers
- generated article body
- SEO metadata
- image captions where possible

### 11.4 Translation Approach

- Generate source content in default locale `en` first
- When a visitor requests a supported non-`en` locale:
  - if translation does not exist yet, translate and persist it
  - if translation already exists, reuse the stored translation
- Save localized versions per post with one unique translation per locale
- Keep manual editing per locale
- Keep locale files separated (one content file per locale per post in the output/rendering layer)

---

## 12. Authentication and Access Control

Visitors do not need accounts.

Only admin/editor areas require authentication.

### 12.1 Admin Authentication

- email/password or secure provider login
- role-based access control
- protected admin routes
- session expiry
- audit trail for publish actions

### 12.2 Public Access

- all posts readable without login
- comments optionally anonymous or guest-based

---

## 13. Database Design

Below is a recommended Prisma data model structure.

Scalability and performance requirements:

- optimize for high-read workloads (indexes on slug, locale, status, publish date)
- support analytics volume growth using append-only view-event tables
- use selective denormalization/materialized aggregates for admin dashboards when needed
- partition/archive large event tables over time without affecting post read performance

## 13.1 Main Entities

- User
- Role
- Post
- PostTranslation
- Category
- Tag
- Manufacturer
- Equipment
- EquipmentAlias
- Model
- Fault
- Remedy
- MaintenanceTask
- MediaAsset
- SourceReference
- Comment
- CommentModeration
- GenerationJob
- PromptTemplate
- SEORecord
- ViewEvent
- ModelProviderConfig

## 13.2 Suggested Prisma Models

```prisma
model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  passwordHash String
  role         UserRole @default(EDITOR)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  posts        Post[]
}

model Post {
  id                String         @id @default(cuid())
  slug              String         @unique
  status            PostStatus     @default(DRAFT)
  equipmentName     String
  excerpt           String?        @db.Text
  featuredImageId   String?
  authorId          String
  publishedAt       DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  author            User           @relation(fields: [authorId], references: [id])
  featuredImage     MediaAsset?    @relation(fields: [featuredImageId], references: [id])
  translations      PostTranslation[]
  categories        PostCategory[]
  tags              PostTag[]
  manufacturers     PostManufacturer[]
  comments          Comment[]
  sources           SourceReference[]
  generationJobs    GenerationJob[]
  seo               SEORecord?
  viewEvents        ViewEvent[]
}

model PostTranslation {
  id             String   @id @default(cuid())
  postId         String
  locale         String
  title          String
  contentHtml    String   @db.LongText
  contentMd      String   @db.LongText
  metaTitle      String?
  metaDescription String? @db.Text
  disclaimer     String   @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  post           Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, locale])
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     PostCategory[]
}

model Manufacturer {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  website   String?
  country   String?
  branchCountries String? @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  models    Model[]
  posts     PostManufacturer[]
}

model Model {
  id             String   @id @default(cuid())
  name           String
  slug           String
  manufacturerId String
  equipmentType  String?
  summary        String?  @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id], onDelete: Cascade)
  manuals        SourceReference[]

  @@unique([manufacturerId, slug])
}

model Fault {
  id          String   @id @default(cuid())
  postId       String
  title        String
  cause        String?  @db.Text
  symptoms     String?  @db.Text
  remedy       String?  @db.Text
  severity     String?
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MaintenanceTask {
  id          String   @id @default(cuid())
  postId       String
  frequency    String
  title        String
  description  String   @db.Text
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MediaAsset {
  id          String   @id @default(cuid())
  url         String
  alt         String?
  caption     String?  @db.Text
  mimeType    String?
  width       Int?
  height      Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SourceReference {
  id          String   @id @default(cuid())
  postId       String?
  modelId      String?
  title        String
  url          String
  sourceType   String
  notes        String?  @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  post         Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  model        Model?   @relation(fields: [modelId], references: [id], onDelete: Cascade)
}

model Comment {
  id          String         @id @default(cuid())
  postId       String
  name         String
  email        String?
  body         String         @db.Text
  status       CommentStatus  @default(PENDING)
  parentId     String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  post         Post           @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model GenerationJob {
  id            String      @id @default(cuid())
  postId         String?
  equipmentName  String
  locale         String
  status         JobStatus   @default(PENDING)
  requestJson    String      @db.LongText
  responseJson   String?     @db.LongText
  errorMessage   String?     @db.Text
  replaceExisting Boolean    @default(false)
  startedAt      DateTime?
  finishedAt     DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  post           Post?       @relation(fields: [postId], references: [id], onDelete: SetNull)
}

model ViewEvent {
  id          String   @id @default(cuid())
  postId      String?
  path        String
  locale      String
  eventType   ViewEventType
  ipHash      String?
  userAgent   String?  @db.Text
  referrer    String?  @db.Text
  createdAt   DateTime @default(now())
  post        Post?    @relation(fields: [postId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([postId, createdAt])
  @@index([path, createdAt])
}

model ModelProviderConfig {
  id            String   @id @default(cuid())
  provider      String
  model         String
  isDefault     Boolean  @default(false)
  isEnabled     Boolean  @default(true)
  apiKeyEnvName String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([provider, model])
}

model SEORecord {
  id               String   @id @default(cuid())
  postId            String   @unique
  canonicalUrl      String?
  metaTitle         String?
  metaDescription   String?  @db.Text
  ogTitle           String?
  ogDescription     String?  @db.Text
  ogImage           String?
  keywords          String?  @db.Text
  structuredData    String?  @db.LongText
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  post              Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
}

enum UserRole {
  SUPER_ADMIN
  EDITOR
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

enum CommentStatus {
  PENDING
  APPROVED
  SPAM
  REJECTED
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

enum ViewEventType {
  WEBSITE_VIEW
  PAGE_VIEW
  POST_VIEW
}
```

Note: join tables such as `PostCategory`, `PostTag`, and `PostManufacturer` should also be added in the implementation.

---

## 14. Folder Structure

Recommended Next.js App Router structure in JavaScript:

```text
src/
  app/
    [locale]/
      layout.js
      page.js
      blog/
        page.js
        [slug]/
          page.js
      category/
        [slug]/
          page.js
      manufacturer/
        [slug]/
          page.js
      search/
        page.js
    admin/
      layout.js
      page.js
      generate/
        page.js
      posts/
        page.js
      posts/[id]/
        page.js
      comments/
        page.js
    api/
      generate-post/route.js
      publish-post/route.js
      comments/route.js
      comments/[id]/route.js
      media/route.js
      revalidate/route.js
      webhook/route.js
    sitemap.js
    robots.js
    opengraph-image.js
    twitter-image.js
    globals.js
  components/
    common/
    layout/
    blog/
    comments/
    admin/
    forms/
    seo/
  features/
    auth/
    postGenerator/
    posts/
    comments/
    media/
    seo/
    i18n/
  lib/
    ai/
    prisma/
    validation/
    seo/
    markdown/
    storage/
    scraping/
    normalization/
    comments/
  store/
    index.js
    provider.js
    slices/
  styles/
    theme.js
    styled-registry.js
  messages/
    en.json
    fr.json
    sw.json
  prisma/
    schema.prisma
  middleware.js
```

---

## 15. Styled-Components Architecture

Because App Router needs a CSS-in-JS registry pattern, use:

- `styles/styled-registry.js`
- root layout wraps app with registry
- theme provider placed high in the tree

### 15.1 Theme Shape Example

```js
export const lightTheme = {
  colors: {
    bg: '#ffffff',
    surface: '#f8f9fb',
    text: '#111827',
    muted: '#6b7280',
    primary: '#0f62fe',
    danger: '#dc2626',
    success: '#16a34a',
    border: '#e5e7eb'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px'
  }
}
```

---

## 16. Redux Toolkit Usage Plan

Redux Toolkit should be used mainly in admin UX and client-side state, not for everything.

### 16.1 Suggested Slices

- `authSlice`
- `generatorSlice`
- `draftEditorSlice`
- `commentModerationSlice`
- `mediaLibrarySlice`
- `uiSlice`
- `localeSlice`

### 16.2 Suggested State for Generator Slice

```js
{
  equipmentName: '',
  locale: 'en',
  loading: false,
  progress: 0,
  currentStage: 'idle',
  resultPostId: null,
  error: null,
  warnings: [],
  preview: null
}
```

### 16.3 RTK Query

Use RTK Query for:

- drafts list
- published posts list
- comments moderation
- manufacturer lookup
- generation logs

---

## 17. Validation with Zod

Use Zod in four layers:

1. admin input validation
2. API request validation
3. AI structured output validation
4. comment submission validation

### 17.1 Example Input Schema

```js
import { z } from 'zod'

export const generatePostSchema = z.object({
  equipmentName: z.string().trim().min(2).max(200),
  locale: z.string().trim().min(2).max(10),
  articleDepth: z.enum(['fast', 'complete', 'repair', 'maintenance']).default('complete'),
  targetAudience: z.array(z.enum([
    'students',
    'nurses',
    'doctors',
    'medical_workers',
    'technicians',
    'engineers',
    'hospital_owners',
    'administrators',
    'procurement_teams',
    'trainers',
    'biomedical_staff'
  ])).min(1),
  includeManufacturers: z.boolean().default(true),
  includeModels: z.boolean().default(true),
  includeFaults: z.boolean().default(true),
  includeManualLinks: z.boolean().default(true),
  schedulePublishAt: z.string().datetime().optional(),
  replaceExistingPost: z.boolean().default(false)
})
```

### 17.2 Example Comment Schema

```js
import { z } from 'zod'

export const commentSchema = z.object({
  postId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  body: z.string().trim().min(3).max(3000)
})
```

---

## 18. AI Integration Design

## 18.1 AI Responsibilities

The AI layer should:

- organize validated research into readable sections
- generate summaries and FAQs
- generate meta titles and descriptions
- generate image captions
- generate related-keyword suggestions
- rewrite for different audiences and locales
- use SDK-first tool integrations (web search, extraction, image generation) for accuracy and efficiency

The AI layer should not be trusted as the only source of factual truth.

## 18.2 Generation Modes

- **Fast mode:** shorter draft
- **Complete mode:** deep article with all sections
- **Repair/Troubleshooting mode:** fault-heavy article
- **Maintenance mode:** care-heavy article
- **Translation mode:** locale version of an existing article

## 18.3 AI Pipeline Components

- input validator
- normalization service
- source collector
- structured research aggregator
- AI writer
- post formatter
- SEO generator
- persistence service
- provider/model switch layer controlled from admin UI

## 18.4 Recommended Internal Prompt Layers

1. System instruction for medical-equipment educational writing
2. Data-grounding instruction
3. Output JSON structure instruction
4. Final article formatting instruction
5. Safety instruction for non-diagnostic, non-clinical advice boundaries

## 18.5 Output Stages

- stage A: structured JSON
- stage B: validated structured JSON
- stage C: markdown article
- stage D: HTML render output
- stage E: SEO package

---

## 19. Research and Source Collection Layer

This is the most important layer in the whole system.

A high-quality platform depends more on **research quality** than on the writing model itself.

## 19.1 Source Priority

Prioritize sources in this order:

1. official manufacturer websites
2. official product pages
3. official manuals / brochures / IFUs / service documents
4. official distributor documentation
5. trusted biomedical engineering references
6. trusted professional societies
7. reputable educational institutions
8. trusted web search results through approved AI tools/SDK integrations

## 19.2 What to Collect

For each equipment query, collect:

- official definition if available
- core operating principle
- manufacturer list
- model list
- PDF manuals and brochures
- maintenance instructions
- troubleshooting references
- images with usable attribution rules where applicable

## 19.3 Reliability Rules

- tag every fact with its source
- do not present unsupported counts as certain
- if “top 20” is not reliably available, return the best verified set
- do not fabricate manuals, models, or faults
- separate “verified” from “AI-composed summary”
- enforce copyright-safe usage:
  - avoid copying proprietary text verbatim beyond short fair-use excerpts
  - prefer synthesized/paraphrased explanations with citations
  - use only licensed images or internally generated illustrations
  - store license/usage notes for each media asset

## 19.4 Manuals and Brochures

Store for each link:

- title
- source domain
- file type
- language
- access status
- last checked time

---

## 20. Handling “Top 100 Manufacturers” and “Top 100 Models”

This requirement should be implemented carefully.

### 20.1 Problem

For many medical devices, there is no single universal authoritative ranking of the “top 100” manufacturers or models.

### 20.2 Practical Solution

Use a ranking strategy such as:

- frequency across trusted sources
- market presence across official catalogs
- product breadth in the equipment category
- recurrence in distributor catalogs and hospital procurement references

### 20.3 Output Rule

Present these as:

- **Commonly used manufacturers**
- **Commonly encountered models**

Do not claim exact worldwide rank unless a reliable source explicitly supports that ranking.

Additional deduplication and coverage rules:

- deduplicate manufacturer names by normalized name + primary domain
- merge aliases into one canonical manufacturer record
- include headquarters country and branch countries where verified data exists

---

## 21. Handling “Up To 100 Common Faults and Remedies”

### 21.1 Required Logic

- collect verified issues from manuals, service docs, and support references
- deduplicate similar faults
- normalize wording
- map each fault to cause, symptom, and remedy

### 21.2 Output Rule

If only 18 reliable faults are found, publish 18 reliable faults instead of inventing 100.

### 21.3 Fault Record Example

```json
{
  "fault": "Image is blurry",
  "cause": "Dirty objective lens or incorrect focus",
  "symptoms": "Observed specimen lacks sharp detail",
  "remedy": "Clean objective lens with approved lens paper and refocus gradually"
}
```

---

## 22. Media and Image Strategy

## 22.1 Required Images

- featured image
- principle-of-operation illustration
- component diagram if available
- representative equipment type images

## 22.2 Image Metadata to Store

- source URL
- alt text
- caption
- width
- height
- license / usage notes
- local optimized file path

## 22.3 Image Processing

- download or proxy only when legally allowed
- optimize for web
- generate responsive sizes
- lazy load non-critical images
- auto-generate descriptive alt text draft
- support inline illustrations inside article sections, not only hero media
- store assets in `public/uploads` initially through a storage adapter
- switch to object storage (for example AWS S3) via environment variables without changing business logic

---

## 23. Admin Generate Post Page Specification

## 23.1 Inputs

- equipment name
- locale
- article depth (select/dropdown, default: `complete`)
- target audience (multi-choice checkboxes, select all by default)
- include images toggle
- include manuals toggle
- include faults toggle
- include manufacturers toggle
- include models toggle
- publish immediately toggle disabled by default
- optional schedule publish date-time picker
- replace existing post checkbox (shown only after duplicate detection)

## 23.2 UI Flow

- text input
- duplicate check runs after equipment name input
- generate button
- progress indicator
- stage labels
- live draft preview
- error panel
- warnings section
- save draft button
- publish button
- schedule controls (date + time picker)
- AI provider/model selector for easy switching

## 23.3 Progress Stages Example

1. validating input
2. normalizing equipment
3. collecting sources
4. extracting structured data
5. generating article
6. generating SEO
7. saving draft

---

## 24. Public Post Page Specification

## 24.1 Sections

- breadcrumb
- title
- excerpt
- publish info
- hero image
- article body
- inline images/diagrams anchored to relevant sections
- references
- disclaimer
- related posts
- comments block
- share actions (social/email/copy link)

## 24.2 Comments Block

- comment form
- list of approved comments
- reply support optional
- moderation notice

---

## 25. Comment System Design

### 25.1 Fields

- name
- email optional
- comment body
- postId
- parentId optional

### 25.2 Moderation Rules

- rate limiting
- spam keyword check
- duplicate detection
- optional CAPTCHA
- profanity filtering
- status workflow: pending, approved, rejected, spam

### 25.3 Admin Comment Tools

- approve
- reject
- mark spam
- delete
- filter by post
- filter by status

---

## 26. API Route Plan

Recommended route handlers:

- `POST /api/generate-post`
- `POST /api/publish-post`
- `POST /api/save-draft`
- `PATCH /api/posts/:id`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `POST /api/comments`
- `PATCH /api/comments/:id`
- `DELETE /api/comments/:id`
- `GET /api/manufacturers`
- `GET /api/models`
- `POST /api/media`
- `POST /api/revalidate`

---

## 27. Suggested Generation API Contract

### 27.1 Request

```json
{
  "equipmentName": "microscope",
  "locale": "en",
  "targetAudience": ["technicians", "engineers", "biomedical_staff"],
  "articleDepth": "complete",
  "includeImages": true,
  "includeManualLinks": true,
  "includeManufacturers": true,
  "includeModels": true,
  "includeFaults": true
}
```

### 27.2 Response

```json
{
  "success": true,
  "jobId": "job_123",
  "postId": "post_123",
  "status": "draft_saved",
  "warnings": [
    "Only 12 verified model manuals were found"
  ]
}
```

---

## 28. Rendering Format Strategy

Store content in both:

- **Markdown** for editing portability
- **HTML** for fast rendering

Optional:

- structured JSON blocks for sections such as faults, maintenance tasks, and model lists

This hybrid approach makes editing and templating easier.

---

## 29. Related Content Strategy

Generate relationships automatically based on:

- equipment type
- manufacturers
- shared tags
- shared categories
- localized language

Examples:

- “Microscope maintenance guide” related to “Common microscope faults”
- “Hematology analyzer basics” related to “CBC analyzer maintenance”

---

## 30. Search Strategy

### 30.1 Initial Version

Use database search on:

- post title
- excerpt
- body text
- tags
- equipment name
- manufacturer name

### 30.2 Future Version

Introduce dedicated search indexing when content volume grows.

---

## 31. Performance Strategy

- design mobile-first, then scale to tablet and desktop breakpoints
- use server components by default
- keep client components minimal
- paginate comments and admin tables
- cache published post pages where appropriate
- optimize images
- lazy load below-the-fold media
- revalidate only changed routes
- use streaming for generation progress if needed
- keep UI lightweight, attractive, and fast to load with clear reading hierarchy

---

## 32. Security Strategy

- protect admin routes
- sanitize comments
- sanitize rendered HTML
- validate all API input with Zod
- rate limit public comment submissions
- secure secrets in environment variables
- restrict media upload types
- audit publish actions
- verify external URLs before storing

---

## 33. Observability and Logging

Track:

- generation success/failure
- source fetch errors
- missing manual links
- image processing failures
- comment spam rate
- publish events
- SEO generation issues
- website/page/post views for admin statistics

Admin should see generation logs per job.

---

## 34. Environment Variables

Example:

```env
DATABASE_URL="mysql://user:password@localhost:3306/med_blog"
NEXT_PUBLIC_APP_URL="https://example.com"
AI_PROVIDER_API_KEY="your-key"
AI_PROVIDER_DEFAULT="openai"
AI_MODEL_DEFAULT="gpt-4.1"
AI_PROVIDER_FALLBACK="openai"
MEDIA_BUCKET_NAME="your-bucket"
MEDIA_BUCKET_REGION="your-region"
MEDIA_ACCESS_KEY="your-access-key"
MEDIA_SECRET_KEY="your-secret-key"
MEDIA_DRIVER="local" # local | s3
LOCAL_MEDIA_BASE_PATH="public/uploads"
S3_MEDIA_BUCKET="your-bucket"
S3_MEDIA_REGION="your-region"
S3_MEDIA_BASE_URL="https://cdn.example.com"
ADMIN_SEED_EMAIL="admin@example.com"
ADMIN_SEED_PASSWORD="strong-password"
COMMENT_RATE_LIMIT_WINDOW_MS="60000"
COMMENT_RATE_LIMIT_MAX="5"
```

---

## 35. Publishing States and Editorial Workflow

### 35.1 Draft Workflow

- generated
- reviewed
- edited
- approved
- published

### 35.2 Optional Enhancements

- scheduled publishing with date-time picker in generation/editor flows
- revision history
- rollback to previous version
- draft comparison view

---

## 36. Content Quality Rules

Every generated post should pass these checks:

- title exists
- definition exists
- operation principle exists
- maintenance exists
- disclaimer exists
- references exist
- no broken internal structure
- no duplicate manufacturer rows
- no empty model sections
- readable paragraph length
- tables formatted correctly
- each section includes deep explanation, not only summary statements
- SOP/how-to-use section exists and includes model-specific differences where available
- target audience coverage is explicit and broad (students, nurses, doctors, medical workers, technicians, engineers, hospital owners, administrators, procurement teams, trainers, and biomedical staff)
- manufacturer entries are deduplicated and include branch countries where data exists

---

## 37. Suggested Prompt Design

The writing prompt should instruct the model to:

- write for educational use
- avoid unsupported claims
- preserve source-grounded structure
- organize sections in a stable learning sequence
- clearly separate facts, guidance, and warnings
- never invent manuals or technical documents
- explicitly note missing information where necessary

---

## 38. Sample Generated Post Outline for “Microscope”

1. What is a microscope?
2. Featured image of a microscope
3. How a microscope works
4. Key components of a microscope
5. Types of microscopes
6. Common laboratory applications
7. Commonly used microscope manufacturers
8. Common microscope models by manufacturer
9. Common microscope faults and remedies
10. Daily care and cleaning
11. Preventive maintenance checklist
12. Safety precautions
13. Manuals and brochures
14. FAQs
15. Disclaimer
16. References

---

## 39. Minimum Viable Product

The MVP should include:

- admin authentication
- generate post form
- draft save
- manual publish
- public blog pages
- localized routing foundation
- comments with moderation
- SEO metadata
- sitemap and robots
- manufacturer/model/manual links support

---

## 40. Phase 2 Features

- automatic related posts
- richer manufacturer pages
- manual source approval queue
- PDF extraction pipeline
- source confidence scoring
- analytics dashboard
- content update reminders
- multilingual translation dashboard
- advanced search filters

---

## 41. Phase 3 Features

- automatic refresh of old posts
- model comparison tables
- equipment troubleshooting decision trees
- biomedical engineer review workflow
- region-specific model catalogs
- downloadable maintenance checklists
- semantic search
- AI-assisted comment moderation

---

## 42. Recommended Development Order

1. initialize Next.js JavaScript app
2. configure styled-components registry
3. configure Prisma + MySQL
4. add admin auth
5. build Post, PostTranslation, Comment models
6. build public blog pages
7. build admin dashboard
8. build generation form
9. add AI generation pipeline
10. add source normalization and storage
11. add SEO metadata system
12. add comments moderation
13. add localization
14. optimize performance and caching
15. add logging and analytics

---

## 43. Practical Constraints and Important Notes

### 43.1 About Full Automation

A fully automatic medical-equipment publisher can be built technically, but medical and technical accuracy must be handled very carefully.

### 43.2 Strong Recommendation

Use this operational policy:

- **AI generates drafts automatically**
- **publishing remains a manual editor action**

That still keeps the workflow extremely fast while reducing risk.

### 43.3 Why This Matters

Medical-equipment content can affect cleaning, maintenance, safety, and troubleshooting behavior. Incorrect details may create operational risk.

So the safest model is:

- automated research
- automated draft generation
- manual final publish approval

---

## 44. Final Architecture Summary

This application should be built as a **Next.js App Router full-stack content platform** with:

- JavaScript only
- Vercel AI SDK for generation
- styled-components for theming and styling
- Redux Toolkit for admin-side state
- Zod for strict validation
- Prisma + MySQL for structured persistence
- localized routes and translations
- public reading without signup
- visitor comments with moderation
- rich SEO metadata
- source-grounded AI generation workflow

The most important design decision is this:

> Do not treat the model as the source of truth. Treat the model as the writing and organization layer on top of a structured research pipeline.

That is what will make the platform scalable, trustworthy, and reusable across many medical-equipment categories.

---

## 45. Official Technology References

- Next.js App Router documentation
- Next.js Metadata and SEO documentation
- Next.js Internationalization documentation
- Next.js CSS-in-JS documentation
- Vercel AI SDK documentation
- Prisma documentation for Next.js and Prisma schema
- Redux Toolkit guide for Next.js App Router
- Zod documentation

---

## 46. Source of Truth and Implementation Completeness

This file (`app-write-up.md`) is the single source of truth for implementation.

### 46.1 Precedence Rules

Use this precedence order for all implementation decisions:

1. Safety, legal, and compliance requirements in this document
2. Core business requirements and workflows in this document
3. Data model and API contracts in this document
4. UX/UI behavior in this document
5. Optimization and phase enhancements in this document

If implementation artifacts conflict with this document, this document wins.

### 46.2 Normative Requirement Semantics

- **Must:** mandatory for release.
- **Should:** expected unless a documented exception is approved.
- **May/Optional:** not mandatory for MVP, but if implemented must still follow all constraints in this document.
- **Where available:** include data only when verifiably sourced; never fabricate missing values.

### 46.3 Completion Gate (No Missing Scope)

Implementation is incomplete unless all are true:

- all required content sections are generated (including SOP/how-to-use with model-specific differences where applicable)
- localization behavior is correct (`en` source generation, translation reuse, and per-locale persistence)
- duplicate equipment detection and replace-or-cancel branch are enforced
- article depth and target audience controls match UI and API contracts
- scheduling works during or after generation with date-time picker
- inline images and media attribution/copyright constraints are enforced
- manufacturer/model/fault dedup and reliability rules are enforced
- admin can switch AI provider/model without code changes
- website/page/post view analytics are tracked and visible to admin
- public sharing (social/email) works
- mobile-first responsive behavior is implemented
- security validation and moderation controls are active

### 46.4 Change Control for Future Edits

Any future update to this document must include:

- explicit section(s) changed
- rationale for change
- impact on schema/API/UI/workflows
- migration or backward-compatibility notes when relevant

### 46.5 Definition of Done

The app is considered complete only when:

- all mandatory requirements in sections 1-46 are implemented
- no unresolved contradictions exist inside this document
- release validation confirms behavior against the completion gate in section 46.3

