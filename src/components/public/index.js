"use client";

import { useState } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";

import { PublicCommentSection } from "@/components/comments";

function formatDateLabel(locale, value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function buildHref(pathname, searchParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null || value === "" || value === false) {
      continue;
    }

    params.set(key, `${value}`);
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function getCommonCopy(publicMessages = {}) {
  const common = publicMessages.common || {};

  return {
    authorLabel: common.authorLabel || "Author",
    backToBlogAction: common.backToBlogAction || "Back to blog",
    browseCategory: common.browseCategory || "Browse category",
    browseEquipment: common.browseEquipment || "Browse equipment",
    browseManufacturer: common.browseManufacturer || "Browse manufacturer",
    clearAction: common.clearAction || "Clear",
    commentBodyLabel: common.commentBodyLabel || "Comment",
    commentBodyPlaceholder:
      common.commentBodyPlaceholder || "Share your question or experience.",
    commentCancelReplyAction: common.commentCancelReplyAction || "Cancel reply",
    commentCaptchaLabel: common.commentCaptchaLabel || "Captcha challenge",
    commentCaptchaPlaceholder:
      common.commentCaptchaPlaceholder || "Enter the answer",
    commentEmailLabel: common.commentEmailLabel || "Email (optional)",
    commentEmailPlaceholder: common.commentEmailPlaceholder || "name@example.com",
    commentNameLabel: common.commentNameLabel || "Name",
    commentNamePlaceholder: common.commentNamePlaceholder || "Your name",
    commentReplyLabel: common.commentReplyLabel || "Reply",
    commentReplyAction: common.commentReplyAction || "Reply",
    commentReplyingToLabel: common.commentReplyingToLabel || "Replying to",
    commentsPaginationLabel: common.commentsPaginationLabel || "Comments",
    commentsDescription:
      common.commentsDescription ||
      "Approved comments and editor-approved replies appear here.",
    commentsEmpty: common.commentsEmpty || "No approved comments are published yet.",
    commentsFormDescription:
      common.commentsFormDescription ||
      "Share a question or correction. Every submission is reviewed before it appears publicly.",
    commentsFormTitle: common.commentsFormTitle || "Leave a comment",
    commentsModerationNotice:
      common.commentsModerationNotice || "Comments are moderated before appearing publicly.",
    commentsTitle: common.commentsTitle || "Comments",
    commentSubmitAction: common.commentSubmitAction || "Submit comment",
    commentSubmitWorking: common.commentSubmitWorking || "Submitting...",
    commentSuccess:
      common.commentSuccess ||
      "Comment submitted. It will appear once an editor approves it.",
    copiedLink: common.copiedLink || "Link copied",
    copyLink: common.copyLink || "Copy link",
    emptyStateDescription:
      common.emptyStateDescription ||
      "Published content for this page will appear after editorial approval and release.",
    emptyStateTitle: common.emptyStateTitle || "No published posts yet",
    latestPostsTitle: common.latestPostsTitle || "Latest posts",
    nextPage: common.nextPage || "Next",
    noSearchResults: common.noSearchResults || "No published posts matched your search yet.",
    previousPage: common.previousPage || "Previous",
    publishedLabel: common.publishedLabel || "Published",
    readPostAction: common.readPostAction || "Read post",
    referencesHeading: common.referencesHeading || "References",
    relatedPostsDescription:
      common.relatedPostsDescription ||
      "These published guides share the same equipment, taxonomy, or manufacturer context.",
    relatedPostsTitle: common.relatedPostsTitle || "Related posts",
    resultsLabel: common.resultsLabel || "Published posts",
    searchAction: common.searchAction || "Search",
    searchPlaceholder:
      common.searchPlaceholder || "Search published posts, equipment, or categories",
    shareDescription:
      common.shareDescription ||
      "Send this article to a teammate or save it for later reference.",
    shareTitle: common.shareTitle || "Share this post",
    topCategoriesTitle: common.topCategoriesTitle || "Top categories",
    topEquipmentTitle: common.topEquipmentTitle || "Top equipment",
    topManufacturersTitle: common.topManufacturersTitle || "Top manufacturers",
    updatedLabel: common.updatedLabel || "Updated",
  };
}

const PageMain = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  margin: 0 auto;
  max-width: 1180px;
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;

  @media (min-width: 800px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const Panel = styled.section`
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9)),
    ${({ $tinted, theme }) =>
      $tinted
        ? `radial-gradient(circle at top right, rgba(0, 95, 115, 0.16), transparent 40%)`
        : theme.colors.surface};
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 22px 80px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 800px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const HeroPanel = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SplitHero = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 960px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
  }
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 8vw, 4.2rem);
  line-height: 0.98;
  margin: 0;
  max-width: 12ch;
`;

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.03rem;
  line-height: 1.75;
  margin: 0;
  max-width: 66ch;
`;

const StatGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 800px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const StatValue = styled.strong`
  font-size: 1.6rem;
  line-height: 1;
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.45rem, 4vw, 2rem);
  margin: 0;
`;

const SectionDescription = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
  max-width: 60ch;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ $columns }) =>
    $columns === "three" &&
    css`
      @media (min-width: 720px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @media (min-width: 1080px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    `}

  ${({ $columns }) =>
    $columns === "four" &&
    css`
      @media (min-width: 720px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @media (min-width: 1080px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    `}
`;

const Card = styled.article`
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const MetaRow = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.88rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Chip = styled(Link)`
  background: rgba(0, 95, 115, 0.06);
  border: 1px solid rgba(0, 95, 115, 0.14);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
`;

const PostCardTitle = styled.h3`
  font-size: 1.25rem;
  line-height: 1.2;
  margin: 0;
`;

const TitleLink = styled(Link)`
  color: inherit;
`;

const PostCardText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.72;
  margin: 0;
`;

const ActionLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const Figure = styled.figure`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const FigureImage = styled.img`
  aspect-ratio: 16 / 9;
  background: rgba(16, 32, 51, 0.04);
  border-radius: ${({ theme }) => theme.radius.md};
  display: block;
  object-fit: cover;
  width: 100%;
`;

const FigureCaption = styled.figcaption`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  line-height: 1.6;
`;

function PostCard({ copy, locale, post }) {
  return (
    <Card>
      {post.heroImage ? (
        <Figure>
          <FigureImage alt={post.heroImage.alt} loading="lazy" src={post.heroImage.url} />
          {post.heroImage.caption ? <FigureCaption>{post.heroImage.caption}</FigureCaption> : null}
        </Figure>
      ) : null}
      <MetaRow>
        {post.publishedAt ? (
          <span>
            {copy.publishedLabel}: {formatDateLabel(locale, post.publishedAt)}
          </span>
        ) : null}
        <span>{post.equipment.name}</span>
      </MetaRow>
      <div>
        <PostCardTitle>
          <TitleLink href={post.path}>{post.title}</TitleLink>
        </PostCardTitle>
      </div>
      <PostCardText>{post.excerpt}</PostCardText>
      {post.categories.length ? (
        <ChipRow>
          {post.categories.slice(0, 3).map((category) => (
            <Chip href={category.path} key={category.slug}>
              {category.name}
            </Chip>
          ))}
        </ChipRow>
      ) : null}
      <ActionLink href={post.path}>{copy.readPostAction}</ActionLink>
    </Card>
  );
}

const SpotlightCard = styled(Card)`
  align-content: start;
`;

const SpotlightTitle = styled.h3`
  font-size: 1.05rem;
  margin: 0;
`;

const SpotlightMeta = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.65;
  margin: 0;
`;

const EmptyState = styled(Card)`
  justify-items: start;
`;

const EmptyTitle = styled.h3`
  margin: 0;
`;

const Pager = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const PagerSummary = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const PagerActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PagerButton = styled(Link)`
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  font-weight: 700;
  padding: 0.55rem 0.95rem;
`;

const SearchCard = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchForm = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 720px) {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(16, 32, 51, 0.14);
  border-radius: ${({ theme }) => theme.radius.md};
  min-height: 48px;
  padding: 0.8rem 0.95rem;
`;

const SearchButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  min-height: 48px;
  padding: 0 1.15rem;
`;

const SearchLink = styled(Link)`
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  min-height: 48px;
  padding: 0.75rem 1.05rem;
`;

function Pagination({ copy, pageParam = "page", pagination, pathname, query = {} }) {
  if (!pagination || pagination.totalItems <= pagination.pageSize) {
    return null;
  }

  return (
    <Pager aria-label="Pagination">
      <PagerSummary>
        {copy.resultsLabel}: {pagination.startItem}-{pagination.endItem} / {pagination.totalItems}
      </PagerSummary>
      <PagerActions>
        {pagination.hasPreviousPage ? (
          <PagerButton
            href={buildHref(pathname, {
              ...query,
              [pageParam]: pagination.currentPage - 1,
            })}
          >
            {copy.previousPage}
          </PagerButton>
        ) : null}
        {pagination.hasNextPage ? (
          <PagerButton
            href={buildHref(pathname, {
              ...query,
              [pageParam]: pagination.currentPage + 1,
            })}
          >
            {copy.nextPage}
          </PagerButton>
        ) : null}
      </PagerActions>
    </Pager>
  );
}

function SpotlightGrid({ actionLabel, items }) {
  return (
    <Grid $columns="three">
      {items.map((item) => (
        <SpotlightCard key={`${item.type}-${item.slug}`}>
          <div>
            <SpotlightTitle>{item.name}</SpotlightTitle>
          </div>
          {item.summary ? <SpotlightMeta>{item.summary}</SpotlightMeta> : null}
          <MetaRow>
            <span>{item.postCount} posts</span>
            {item.primaryDomain ? <span>{item.primaryDomain}</span> : null}
          </MetaRow>
          <ActionLink href={item.path}>{actionLabel}</ActionLink>
        </SpotlightCard>
      ))}
    </Grid>
  );
}

export function PublicHomePage({ locale, messages, pageContent, pageData }) {
  const copy = getCommonCopy(messages);

  return (
    <PageMain>
      <HeroPanel $tinted>
        <SplitHero>
          <div>
            <Eyebrow>{pageContent.eyebrow}</Eyebrow>
            <Title>{pageContent.title}</Title>
            <Lead>{pageContent.description}</Lead>
          </div>
          {pageData.featuredPost ? (
            <Card>
              <SectionHeader>
                <SectionTitle>{pageContent.featuredTitle || "Featured post"}</SectionTitle>
                <SectionDescription>
                  {pageContent.featuredDescription ||
                    "Start with the newest published guide and use the discovery sections below to branch out."}
                </SectionDescription>
              </SectionHeader>
              <PostCard copy={copy} locale={locale} post={pageData.featuredPost} />
            </Card>
          ) : (
            <EmptyState>
              <EmptyTitle>{copy.emptyStateTitle}</EmptyTitle>
              <SectionDescription>{copy.emptyStateDescription}</SectionDescription>
            </EmptyState>
          )}
        </SplitHero>
        <StatGrid>
          <StatCard>
            <StatValue>{pageData.stats.postCount}</StatValue>
            <StatLabel>{copy.resultsLabel}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{pageData.stats.categoryCount}</StatValue>
            <StatLabel>{copy.topCategoriesTitle}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{pageData.stats.manufacturerCount}</StatValue>
            <StatLabel>{copy.topManufacturersTitle}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{pageData.stats.equipmentCount}</StatValue>
            <StatLabel>{copy.topEquipmentTitle}</StatLabel>
          </StatCard>
        </StatGrid>
      </HeroPanel>

      <Panel>
        <SectionHeader>
          <SectionTitle>{pageContent.latestTitle || copy.latestPostsTitle}</SectionTitle>
          <SectionDescription>
            {pageContent.latestDescription ||
              "Published guides are rendered server-side and stay organized for quick scanning on mobile first."}
          </SectionDescription>
        </SectionHeader>
        {pageData.latestPosts.length ? (
          <Grid $columns="three">
            {pageData.latestPosts.map((post) => (
              <PostCard copy={copy} key={post.slug} locale={locale} post={post} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <EmptyTitle>{copy.emptyStateTitle}</EmptyTitle>
            <SectionDescription>{copy.emptyStateDescription}</SectionDescription>
          </EmptyState>
        )}
      </Panel>

      <Panel>
        <SectionHeader>
          <SectionTitle>{pageContent.discoveryTitle || "Discovery routes"}</SectionTitle>
          <SectionDescription>
            {pageContent.discoveryDescription ||
              "Category, manufacturer, and equipment landing pages stay focused on published content only."}
          </SectionDescription>
        </SectionHeader>
        {pageData.spotlights.categories.length ? (
          <>
            <SectionHeader>
              <SectionTitle>{copy.topCategoriesTitle}</SectionTitle>
            </SectionHeader>
            <SpotlightGrid actionLabel={copy.browseCategory} items={pageData.spotlights.categories} />
          </>
        ) : null}
        {pageData.spotlights.manufacturers.length ? (
          <>
            <SectionHeader>
              <SectionTitle>{copy.topManufacturersTitle}</SectionTitle>
            </SectionHeader>
            <SpotlightGrid
              actionLabel={copy.browseManufacturer}
              items={pageData.spotlights.manufacturers}
            />
          </>
        ) : null}
        {pageData.spotlights.equipment.length ? (
          <>
            <SectionHeader>
              <SectionTitle>{copy.topEquipmentTitle}</SectionTitle>
            </SectionHeader>
            <SpotlightGrid actionLabel={copy.browseEquipment} items={pageData.spotlights.equipment} />
          </>
        ) : null}
      </Panel>
    </PageMain>
  );
}

export function PublicCollectionPage({
  entity,
  locale,
  messages,
  pageContent,
  pageData,
  pathname,
  query,
  showSearch = false,
}) {
  const copy = getCommonCopy(messages);

  return (
    <PageMain>
      <HeroPanel $tinted>
        <Eyebrow>{pageContent.eyebrow}</Eyebrow>
        <Title>{entity?.name || pageContent.title}</Title>
        <Lead>{entity?.description || pageContent.description}</Lead>
        {entity?.primaryDomain || entity?.headquartersCountry || entity?.branchCountries?.length ? (
          <MetaRow>
            {entity.primaryDomain ? <span>{entity.primaryDomain}</span> : null}
            {entity.headquartersCountry ? <span>{entity.headquartersCountry}</span> : null}
            {entity.branchCountries?.length ? <span>{entity.branchCountries.join(", ")}</span> : null}
          </MetaRow>
        ) : null}
      </HeroPanel>

      {showSearch ? (
        <SearchCard>
          <SectionHeader>
            <SectionTitle>{pageContent.searchTitle || pageContent.title}</SectionTitle>
            <SectionDescription>{pageContent.searchDescription || pageContent.description}</SectionDescription>
          </SectionHeader>
          <SearchForm action={pathname} role="search">
            <SearchInput
              defaultValue={pageData.search}
              name="q"
              placeholder={copy.searchPlaceholder}
              type="search"
            />
            <SearchButton type="submit">{copy.searchAction}</SearchButton>
            {pageData.search ? (
              <SearchLink href={pathname}>{copy.clearAction}</SearchLink>
            ) : null}
          </SearchForm>
        </SearchCard>
      ) : null}

      <Panel>
        <SectionHeader>
          <SectionTitle>{pageContent.resultsTitle || copy.resultsLabel}</SectionTitle>
          <SectionDescription>
            {pageData.pagination.totalItems
              ? `${pageData.pagination.totalItems} ${copy.resultsLabel.toLowerCase()}.`
              : showSearch && pageData.search
                ? copy.noSearchResults
                : copy.emptyStateDescription}
          </SectionDescription>
        </SectionHeader>
        {pageData.posts.length ? (
          <Grid $columns="three">
            {pageData.posts.map((post) => (
              <PostCard copy={copy} key={post.slug} locale={locale} post={post} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <EmptyTitle>
              {showSearch && pageData.search ? copy.noSearchResults : copy.emptyStateTitle}
            </EmptyTitle>
            <SectionDescription>
              {showSearch && pageData.search ? copy.noSearchResults : copy.emptyStateDescription}
            </SectionDescription>
          </EmptyState>
        )}
        <Pagination copy={copy} pagination={pageData.pagination} pathname={pathname} query={query} />
      </Panel>
    </PageMain>
  );
}

const ContentSection = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.lg};
`;

const RichText = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  line-height: 1.78;
`;

const BulletList = styled.ul`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
  padding-left: 1.25rem;
`;

export function PublicStaticPage({ pageContent }) {
  return (
    <PageMain>
      <HeroPanel $tinted>
        <Eyebrow>{pageContent.eyebrow}</Eyebrow>
        <Title>{pageContent.title}</Title>
        <Lead>{pageContent.description}</Lead>
      </HeroPanel>

      {(pageContent.sections || []).map((section) => (
        <ContentSection key={section.title}>
          <SectionHeader>
            <SectionTitle>{section.title}</SectionTitle>
          </SectionHeader>
          <RichText>
            {(section.paragraphs || []).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </RichText>
          {section.items?.length ? (
            <BulletList>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </BulletList>
          ) : null}
          {section.links?.length ? (
            <ChipRow>
              {section.links.map((link) => (
                <Chip as={Link} href={link.href} key={link.href}>
                  {link.label}
                </Chip>
              ))}
            </ChipRow>
          ) : null}
        </ContentSection>
      ))}
    </PageMain>
  );
}

const Breadcrumbs = styled.nav`
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.88rem;
`;

const BreadcrumbLink = styled(Link)`
  color: inherit;
`;

const PostHeader = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PostLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1100px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.7fr);
  }
`;

const ArticleColumn = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SidebarColumn = styled.aside`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeroImageGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ArticleSection = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.md};
`;

const ArticleBody = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  line-height: 1.78;
`;

const NumberedList = styled.ol`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
  padding-left: 1.3rem;
`;

const FaultGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FaultCard = styled.div`
  background: rgba(0, 95, 115, 0.03);
  border: 1px solid rgba(0, 95, 115, 0.12);
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ShareButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ShareLink = styled.a`
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  display: inline-flex;
  font-weight: 700;
  padding: 0.55rem 0.9rem;
`;

const ShareButton = styled.button`
  background: transparent;
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  padding: 0.55rem 0.9rem;
`;

function renderArticleSection(section, copy) {
  if (section.kind === "text") {
    return (
      <ArticleBody>
        {(section.paragraphs || []).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </ArticleBody>
    );
  }

  if (section.kind === "list") {
    return (
      <ArticleBody>
        {section.intro ? <p>{section.intro}</p> : null}
        <BulletList>
          {(section.items || []).map((item) => (
            <li key={`${item.title}-${item.description || ""}`}>
              <strong>{item.title}</strong>
              {item.description ? `: ${item.description}` : ""}
            </li>
          ))}
        </BulletList>
      </ArticleBody>
    );
  }

  if (section.kind === "models_by_manufacturer") {
    return (
      <Grid $columns="three">
        {(section.groups || []).map((group) => (
          <Card key={group.manufacturer}>
            <PostCardTitle>{group.manufacturer}</PostCardTitle>
            <BulletList>
              {(group.models || []).map((model) => (
                <li key={model.name}>
                  <strong>{model.name}</strong>
                  {model.latestKnownYear ? ` (${model.latestKnownYear})` : ""}
                  {model.summary ? `: ${model.summary}` : ""}
                </li>
              ))}
            </BulletList>
          </Card>
        ))}
      </Grid>
    );
  }

  if (section.kind === "faults") {
    return (
      <FaultGrid>
        {(section.items || []).map((fault) => (
          <FaultCard key={fault.title}>
            <PostCardTitle>{fault.title}</PostCardTitle>
            <ArticleBody>
              <p>
                <strong>Cause:</strong> {fault.cause || "Not verified."}
              </p>
              <p>
                <strong>Symptoms:</strong> {fault.symptoms || "Not verified."}
              </p>
              <p>
                <strong>Remedy:</strong> {fault.remedy || "Not verified."}
              </p>
              <p>
                <strong>Severity:</strong> {fault.severity}
              </p>
            </ArticleBody>
          </FaultCard>
        ))}
      </FaultGrid>
    );
  }

  if (section.kind === "steps") {
    return (
      <ArticleBody>
        {section.intro ? <p>{section.intro}</p> : null}
        <NumberedList>
          {(section.steps || []).map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              {step.description ? `: ${step.description}` : ""}
            </li>
          ))}
        </NumberedList>
      </ArticleBody>
    );
  }

  if (section.kind === "manuals" || section.kind === "references") {
    return (
      <BulletList>
        {(section.items || []).map((item) => (
          <li key={`${item.title}-${item.url}`}>
            <a href={item.url} rel="noreferrer" target="_blank">
              {item.title}
            </a>
            {item.fileType || item.language
              ? ` (${[item.fileType, item.language].filter(Boolean).join(" | ")})`
              : ""}
          </li>
        ))}
      </BulletList>
    );
  }

  if (section.kind === "faq") {
    return (
      <Grid $columns="three">
        {(section.items || []).map((item) => (
          <Card key={item.question}>
            <PostCardTitle>{item.question}</PostCardTitle>
            <PostCardText>{item.answer}</PostCardText>
          </Card>
        ))}
      </Grid>
    );
  }

  if (section.kind === "image_gallery") {
    return (
      <HeroImageGrid>
        {(section.images || []).map((image) => (
          <Figure key={image.url}>
            <FigureImage alt={image.alt || copy.relatedPostsTitle} loading="lazy" src={image.url} />
            {image.caption ? <FigureCaption>{image.caption}</FigureCaption> : null}
          </Figure>
        ))}
      </HeroImageGrid>
    );
  }

  return null;
}

function ShareActions({ article, copy }) {
  const [copied, setCopied] = useState(false);
  const title = encodeURIComponent(article.title);
  const url = encodeURIComponent(article.url);
  const shareLinks = [
    { href: `https://twitter.com/intent/tweet?text=${title}&url=${url}`, label: "X" },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, label: "Facebook" },
    {
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
      label: "LinkedIn",
    },
    { href: `https://wa.me/?text=${title}%20${url}`, label: "WhatsApp" },
    {
      href: `mailto:?subject=${title}&body=${encodeURIComponent(`${article.title}\n\n${article.url}`)}`,
      label: "Email",
    },
  ];

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(article.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Panel>
      <SectionHeader>
        <SectionTitle>{copy.shareTitle}</SectionTitle>
        <SectionDescription>{copy.shareDescription}</SectionDescription>
      </SectionHeader>
      <ShareButtonRow>
        {shareLinks.map((link) => (
          <ShareLink href={link.href} key={link.label} rel="noreferrer" target="_blank">
            {link.label}
          </ShareLink>
        ))}
        <ShareButton onClick={handleCopyLink} type="button">
          {copied ? copy.copiedLink : copy.copyLink}
        </ShareButton>
      </ShareButtonRow>
    </Panel>
  );
}

export function PublicPostPage({ locale, messages, pageData }) {
  const copy = getCommonCopy(messages);
  const { article } = pageData;

  return (
    <PageMain>
      <PostHeader $tinted>
        <Breadcrumbs aria-label="Breadcrumb">
          {article.breadcrumb.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? " / " : ""}
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            </span>
          ))}
        </Breadcrumbs>
        <Eyebrow>{article.equipment.name}</Eyebrow>
        <Title>{article.title}</Title>
        <Lead>{article.excerpt}</Lead>
        <MetaRow>
          {article.publishedAt ? (
            <span>
              {copy.publishedLabel}: {formatDateLabel(locale, article.publishedAt)}
            </span>
          ) : null}
          {article.updatedAt ? (
            <span>
              {copy.updatedLabel}: {formatDateLabel(locale, article.updatedAt)}
            </span>
          ) : null}
          <span>
            {copy.authorLabel}: {article.authorName}
          </span>
        </MetaRow>
        {article.categories.length || article.manufacturers.length ? (
          <ChipRow>
            {article.categories.map((category) => (
              <Chip href={category.path} key={category.slug}>
                {category.name}
              </Chip>
            ))}
            {article.manufacturers.map((manufacturer) => (
              <Chip href={manufacturer.path} key={manufacturer.slug}>
                {manufacturer.name}
              </Chip>
            ))}
          </ChipRow>
        ) : null}
      </PostHeader>

      {article.heroImages.length ? (
        <Panel>
          <HeroImageGrid>
            {article.heroImages.map((image) => (
              <Figure key={image.url}>
                <FigureImage alt={image.alt} loading="eager" src={image.url} />
                {image.caption ? <FigureCaption>{image.caption}</FigureCaption> : null}
              </Figure>
            ))}
          </HeroImageGrid>
        </Panel>
      ) : null}

      <PostLayout>
        <ArticleColumn>
          {article.bodySections.map((section) => (
            <ArticleSection key={section.id}>
              <SectionHeader>
                <SectionTitle>
                  {section.id === "references" ? copy.referencesHeading : section.title}
                </SectionTitle>
              </SectionHeader>
              {renderArticleSection(section, copy)}
            </ArticleSection>
          ))}

          <Panel>
            <SectionHeader>
              <SectionTitle>{copy.relatedPostsTitle}</SectionTitle>
              <SectionDescription>{copy.relatedPostsDescription}</SectionDescription>
            </SectionHeader>
            {article.relatedPosts.length ? (
              <Grid $columns="three">
                {article.relatedPosts.map((post) => (
                  <PostCard copy={copy} key={post.slug} locale={locale} post={post} />
                ))}
              </Grid>
            ) : (
              <EmptyState>
                <EmptyTitle>{copy.emptyStateTitle}</EmptyTitle>
                <SectionDescription>{copy.emptyStateDescription}</SectionDescription>
              </EmptyState>
            )}
          </Panel>

          <PublicCommentSection article={article} copy={copy} locale={locale} />
        </ArticleColumn>

        <SidebarColumn>
          <ShareActions article={article} copy={copy} />
          <Panel>
            <SectionHeader>
              <SectionTitle>{article.equipment.name}</SectionTitle>
              <SectionDescription>
                This published guide belongs to the equipment landing page for {article.equipment.name}.
              </SectionDescription>
            </SectionHeader>
            <ActionLink href={article.equipment.path}>{copy.browseEquipment}</ActionLink>
          </Panel>
          <Panel>
            <ActionLink href={buildHref(article.breadcrumb[1].href)}>{copy.backToBlogAction}</ActionLink>
          </Panel>
        </SidebarColumn>
      </PostLayout>
    </PageMain>
  );
}
