"use client";

import Link from "next/link";
import { useState } from "react";
import styled, { css } from "styled-components";

import PublicViewTracker from "@/components/analytics/public-view-tracker";
import { PublicCommentSection } from "@/components/comments";
import ShareActions from "@/components/public/share-actions";
import { createImagePlaceholderDataUrl } from "@/lib/media";
import { sanitizeExternalUrl } from "@/lib/security";

function formatDateLabel(locale, value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatEquipmentDisplayName(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/[A-Z]/.test(trimmedValue)) {
    return trimmedValue;
  }

  const firstLetterIndex = trimmedValue.search(/[a-z]/i);

  if (firstLetterIndex === -1) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, firstLetterIndex)}${trimmedValue
    .charAt(firstLetterIndex)
    .toUpperCase()}${trimmedValue.slice(firstLetterIndex + 1)}`;
}

function formatArticleDisplayTitle(title, equipmentName) {
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedEquipmentName = typeof equipmentName === "string" ? equipmentName.trim() : "";
  const displayEquipmentName = formatEquipmentDisplayName(normalizedEquipmentName);

  if (!normalizedTitle) {
    return displayEquipmentName;
  }

  if (!normalizedEquipmentName || !displayEquipmentName) {
    return normalizedTitle;
  }

  if (normalizedTitle.toLowerCase().startsWith(normalizedEquipmentName.toLowerCase())) {
    return `${displayEquipmentName}${normalizedTitle.slice(normalizedEquipmentName.length)}`;
  }

  return normalizedTitle;
}

function getLocaleLabel(locale) {
  if (locale === "en") {
    return "English";
  }

  if (typeof locale !== "string" || !locale.trim()) {
    return "English";
  }

  return locale.toUpperCase();
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
  gap: clamp(1.2rem, 2.8vw, 1.75rem);
  margin: 0 auto;
  max-width: 1280px;
  padding: clamp(1.35rem, 3vw, 2.2rem) clamp(1rem, 3vw, 1.6rem) clamp(2rem, 4vw, 3rem);
  width: 100%;
`;

const Panel = styled.section`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 255, 0.92));
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 22px;
  box-shadow:
    0 18px 40px rgba(22, 40, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  padding: clamp(1rem, 2.6vw, 1.55rem);
`;

const HeroPanel = styled.section`
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.3rem);
  padding: clamp(0.35rem, 1vw, 0.65rem) 0 clamp(0.2rem, 0.8vw, 0.45rem);
`;

const LandingGrid = styled.div`
  display: grid;
  gap: clamp(1rem, 2.6vw, 1.5rem);

  @media (min-width: 760px) and (max-width: 1099px) {
    align-items: start;
    grid-template-areas:
      "hero hero"
      "content rail";
    grid-template-columns: minmax(0, 1fr) minmax(240px, 272px);
  }

  @media (min-width: 1100px) {
    align-items: start;
    grid-template-areas:
      "hero rail"
      "content rail";
    grid-template-columns: minmax(0, 1fr) minmax(285px, 336px);
  }
`;

const LandingHero = styled(HeroPanel)`
  grid-area: hero;
`;

const LandingContent = styled(Panel)`
  grid-area: content;
`;

const LandingRail = styled.aside`
  display: none;

  @media (min-width: 760px) {
    align-content: start;
    display: grid;
    gap: clamp(1rem, 2vw, 1.25rem);
    grid-area: rail;
  }
`;

const Eyebrow = styled.p`
  color: rgba(27, 59, 93, 0.74);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: #182742;
  font-size: clamp(2.7rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.95;
  margin: 0;
  max-width: 14ch;
`;

const Lead = styled.p`
  color: rgba(72, 84, 108, 0.96);
  font-size: clamp(1.05rem, 2.3vw, 1.2rem);
  line-height: 1.72;
  margin: 0;
  max-width: 40ch;
`;

const RailCard = styled(Panel)`
  gap: clamp(0.85rem, 1.5vw, 1rem);
  padding: clamp(0.95rem, 1.8vw, 1.1rem);
`;

const RailTitle = styled.p`
  color: rgba(53, 66, 91, 0.76);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
`;

const AdFrame = styled.div`
  align-items: center;
  aspect-ratio: 1 / 0.86;
  background: linear-gradient(180deg, rgba(246, 248, 252, 0.98), rgba(237, 241, 247, 0.98));
  border: 1px solid rgba(16, 32, 51, 0.06);
  border-radius: 12px;
  display: grid;
  justify-items: center;
`;

const AdText = styled.span`
  color: rgba(99, 108, 127, 0.82);
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.04em;
`;

const RailUtilityCard = styled(Panel)`
  gap: 0;
  padding: 0;
`;

const RailLocaleRow = styled.div`
  align-items: center;
  display: flex;
  gap: 0.4rem;
  justify-content: space-between;
  padding: 1rem 1.1rem;
`;

const RailLocaleText = styled.div`
  align-items: baseline;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.28rem;
`;

const RailLocaleLabel = styled.span`
  color: rgba(80, 92, 115, 0.9);
  font-size: 0.92rem;
`;

const RailLocaleValue = styled.span`
  color: #44506a;
  font-size: 0.92rem;
  font-weight: 600;
`;

const RailChevron = styled.span`
  color: rgba(80, 92, 115, 0.82);
  font-size: 1rem;
  line-height: 1;
`;

const RailActionButton = styled.button`
  background: transparent;
  border: none;
  border-top: 1px solid rgba(16, 32, 51, 0.08);
  color: rgba(84, 93, 112, 0.92);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.95rem 1.1rem;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: rgba(16, 32, 51, 0.03);
    color: #182742;
  }
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const SectionTitle = styled.h2`
  color: #182742;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  letter-spacing: -0.03em;
  margin: 0;
`;

const SectionDescription = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.68;
  margin: 0;
  max-width: 62ch;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};

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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 255, 0.92));
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(22, 40, 64, 0.04);
  contain-intrinsic-size: 320px;
  content-visibility: auto;
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 100%;
  padding: clamp(1rem, 2.2vw, 1.35rem);
`;

const MetaRow = styled.div`
  color: rgba(80, 92, 115, 0.92);
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
  background: rgba(32, 74, 113, 0.05);
  border: 1px solid rgba(32, 74, 113, 0.1);
  border-radius: 999px;
  color: #244b73;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
`;

const PostCardTitle = styled.h3`
  color: #182742;
  font-size: 1.28rem;
  letter-spacing: -0.03em;
  line-height: 1.18;
  margin: 0;
`;

const TitleLink = styled(Link)`
  color: inherit;
`;

const PostCardText = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.68;
  margin: 0;
`;

const ActionLink = styled(Link)`
  color: #244b73;
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
  border-radius: 14px;
  display: block;
  height: auto;
  object-fit: cover;
  width: 100%;
`;

const FigureCaption = styled.figcaption`
  color: rgba(80, 92, 115, 0.92);
  font-size: 0.9rem;
  line-height: 1.6;
`;

function ResponsiveImage({
  image,
  loading = "lazy",
  priority = false,
  sizes = "100vw",
}) {
  const fallbackSrc = createImagePlaceholderDataUrl({
    alt: image?.alt,
    caption: image?.caption,
    height: image?.height,
    sourceUrl: image?.url,
    width: image?.width,
  });
  const [failedSource, setFailedSource] = useState(null);
  const src = failedSource === image?.url ? fallbackSrc : image?.url || "";

  if (!src) {
    return null;
  }

  const isFallbackSource = src === fallbackSrc;

  return (
    <FigureImage
      alt={image.alt}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      height={image.height || undefined}
      loading={priority ? "eager" : loading}
      onError={() => {
        if (!isFallbackSource) {
          setFailedSource(image?.url || "");
        }
      }}
      sizes={!isFallbackSource && image.srcSet ? sizes : undefined}
      src={src}
      srcSet={!isFallbackSource ? image.srcSet || undefined : undefined}
      width={image.width || undefined}
    />
  );
}

function PostCard({ copy, locale, post }) {
  const displayEquipmentName = formatEquipmentDisplayName(post.equipment.name);
  const displayTitle = formatArticleDisplayTitle(post.title, post.equipment.name);

  return (
    <Card>
      {post.heroImage ? (
        <Figure>
          <ResponsiveImage
            image={post.heroImage}
            sizes="(min-width: 1080px) 28vw, (min-width: 720px) 46vw, 92vw"
          />
          {post.heroImage.caption ? <FigureCaption>{post.heroImage.caption}</FigureCaption> : null}
        </Figure>
      ) : null}
      <MetaRow>
        {post.publishedAt ? (
          <span>
            {copy.publishedLabel}: {formatDateLabel(locale, post.publishedAt)}
          </span>
        ) : null}
        <span>{displayEquipmentName}</span>
      </MetaRow>
      <div>
        <PostCardTitle>
          <TitleLink href={post.path}>{displayTitle}</TitleLink>
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
  align-content: center;
  min-height: 100%;
  padding: clamp(1.2rem, 2.8vw, 1.75rem);
  justify-items: start;
`;

const EmptyTitle = styled.h3`
  color: #182742;
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
  align-items: center;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  display: inline-flex;
  font-weight: 700;
  justify-content: center;
  padding: 0.55rem 0.95rem;
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
  background: linear-gradient(180deg, #2a537d, #203f61);
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  min-height: 48px;
  padding: 0 1.15rem;
`;

const SearchLink = styled(Link)`
  align-items: center;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-weight: 700;
  justify-content: center;
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
          {item.summary || item.description ? (
            <SpotlightMeta>{item.summary || item.description}</SpotlightMeta>
          ) : null}
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

function getDiscoverySectionTitle(copy, kind) {
  if (kind === "category") {
    return copy.topCategoriesTitle;
  }

  if (kind === "manufacturer") {
    return copy.topManufacturersTitle;
  }

  return copy.topEquipmentTitle;
}

function getDiscoverySectionActionLabel(copy, kind) {
  if (kind === "category") {
    return copy.browseCategory;
  }

  if (kind === "manufacturer") {
    return copy.browseManufacturer;
  }

  return copy.browseEquipment;
}

function PublicUtilityRail({ locale }) {
  return (
    <>
      <RailCard>
        <RailTitle>Advertisement</RailTitle>
        <AdFrame>
          <AdText>Ad</AdText>
        </AdFrame>
      </RailCard>

      <RailUtilityCard>
        <RailLocaleRow>
          <RailLocaleText>
            <RailLocaleLabel>Locale:</RailLocaleLabel>
            <RailLocaleValue>{getLocaleLabel(locale)}</RailLocaleValue>
          </RailLocaleText>
          <RailChevron aria-hidden="true">v</RailChevron>
        </RailLocaleRow>
        <RailActionButton type="button">Advertise Here</RailActionButton>
      </RailUtilityCard>
    </>
  );
}

export function PublicHomePage({ locale, messages, pageContent, pageData }) {
  const copy = getCommonCopy(messages);
  const featuredAndLatestPosts = [pageData.featuredPost, ...(pageData.latestPosts || [])].filter(Boolean);
  const hasDiscoverySections =
    pageData.spotlights.categories.length ||
    pageData.spotlights.manufacturers.length ||
    pageData.spotlights.equipment.length;

  return (
    <PageMain>
      <PublicViewTracker eventType="WEBSITE_VIEW" locale={locale} />
      <LandingGrid>
        <LandingHero>
          <Title>{pageContent.title}</Title>
          <Lead>{pageContent.description}</Lead>
        </LandingHero>

        <LandingContent>
          {featuredAndLatestPosts.length ? (
            <>
              <SectionHeader>
                <SectionTitle>{pageContent.latestTitle || copy.latestPostsTitle}</SectionTitle>
                <SectionDescription>
                  {pageContent.latestDescription ||
                    "Browse the newest published equipment guides in a layout tuned for phone, tablet, and desktop reading."}
                </SectionDescription>
              </SectionHeader>
              <Grid $columns="three">
                {featuredAndLatestPosts.slice(0, 3).map((post) => (
                  <PostCard copy={copy} key={post.slug} locale={locale} post={post} />
                ))}
              </Grid>
            </>
          ) : (
            <EmptyState>
              <EmptyTitle>{copy.emptyStateTitle}</EmptyTitle>
              <SectionDescription>{copy.emptyStateDescription}</SectionDescription>
            </EmptyState>
          )}
        </LandingContent>

        <LandingRail aria-label="Public utilities">
          <PublicUtilityRail locale={locale} />
        </LandingRail>
      </LandingGrid>

      {hasDiscoverySections ? (
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
      ) : null}
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
      <PublicViewTracker eventType="PAGE_VIEW" locale={locale} />
      <LandingGrid>
        <LandingHero>
          {pageContent.eyebrow ? <Eyebrow>{pageContent.eyebrow}</Eyebrow> : null}
          <Title>{entity?.name || pageContent.title}</Title>
          <Lead>{entity?.description || pageContent.description}</Lead>
          {entity?.primaryDomain || entity?.headquartersCountry || entity?.branchCountries?.length ? (
            <MetaRow>
              {entity.primaryDomain ? <span>{entity.primaryDomain}</span> : null}
              {entity.headquartersCountry ? <span>{entity.headquartersCountry}</span> : null}
              {entity.branchCountries?.length ? <span>{entity.branchCountries.join(", ")}</span> : null}
            </MetaRow>
          ) : null}
        </LandingHero>

        <LandingContent>
          {showSearch ? (
            <>
              <SectionHeader>
                <SectionTitle>{pageContent.searchTitle || pageContent.title}</SectionTitle>
                <SectionDescription>
                  {pageContent.searchDescription || pageContent.description}
                </SectionDescription>
              </SectionHeader>
              <SearchForm action={pathname} role="search">
                <SearchInput
                  defaultValue={pageData.search}
                  name="q"
                  placeholder={copy.searchPlaceholder}
                  type="search"
                />
                <SearchButton type="submit">{copy.searchAction}</SearchButton>
                {pageData.search ? <SearchLink href={pathname}>{copy.clearAction}</SearchLink> : null}
              </SearchForm>
            </>
          ) : null}

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
        </LandingContent>

        <LandingRail aria-label="Public utilities">
          <PublicUtilityRail locale={locale} />
        </LandingRail>
      </LandingGrid>

      {pageData.discoverySections?.length ? (
        <Panel>
          <SectionHeader>
            <SectionTitle>{pageContent.discoveryTitle || "Keep exploring"}</SectionTitle>
            <SectionDescription>
              {pageContent.discoveryDescription ||
                "Use connected category, manufacturer, and equipment routes to keep branching through published guides."}
            </SectionDescription>
          </SectionHeader>
          {pageData.discoverySections.map((section) => (
            <div key={section.kind}>
              <SectionHeader>
                <SectionTitle>{getDiscoverySectionTitle(copy, section.kind)}</SectionTitle>
              </SectionHeader>
              <SpotlightGrid
                actionLabel={getDiscoverySectionActionLabel(copy, section.kind)}
                items={section.items}
              />
            </div>
          ))}
        </Panel>
      ) : null}
    </PageMain>
  );
}

const ContentSection = styled(Panel)`
  gap: ${({ theme }) => theme.spacing.md};
`;

const StaticSectionGrid = styled.div`
  display: grid;
  gap: clamp(1rem, 2.4vw, 1.5rem);

  @media (min-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const RichText = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  line-height: 1.62;
`;

const BulletList = styled.ul`
  color: rgba(66, 79, 101, 0.96);
  display: grid;
  gap: 0.85rem;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.05rem, 1.15vw, 1.14rem);
  line-height: 1.82;
  margin: 0;
  padding-left: 1.35rem;

  li::marker {
    color: #2b5a82;
  }
`;

export function PublicStaticPage({ locale, pageContent }) {
  return (
    <PageMain>
      <PublicViewTracker eventType="PAGE_VIEW" locale={locale} />
      <HeroPanel>
        {pageContent.eyebrow ? <Eyebrow>{pageContent.eyebrow}</Eyebrow> : null}
        <Title>{pageContent.title}</Title>
        <Lead>{pageContent.description}</Lead>
      </HeroPanel>

      <StaticSectionGrid>
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
      </StaticSectionGrid>
    </PageMain>
  );
}

const Breadcrumbs = styled.nav`
  align-items: center;
  color: rgba(55, 71, 96, 0.74);
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const BreadcrumbLink = styled(Link)`
  color: inherit;

  &:hover {
    color: #244b73;
  }
`;

const BreadcrumbSeparator = styled.span`
  opacity: 0.45;
`;

const PostScene = styled.section`
  display: grid;
  gap: clamp(1.25rem, 2.8vw, 1.8rem);
`;

const PostHeroShell = styled.section`
  background:
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.14), transparent 34%),
    radial-gradient(circle at bottom left, rgba(0, 95, 115, 0.11), transparent 42%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 30px;
  box-shadow:
    0 32px 90px rgba(19, 34, 58, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
  overflow: hidden;
  padding: clamp(1.25rem, 4vw, 2.5rem);
`;

const PostHeroGrid = styled.div`
  display: grid;
  gap: clamp(1.25rem, 2.8vw, 1.85rem);

  @media (min-width: 980px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.8fr);
  }
`;

const PostHeader = styled.div`
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.2rem);
`;

const PostKicker = styled.p`
  color: rgba(31, 77, 108, 0.82);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

const PostTitle = styled.h1`
  color: #16243b;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 1.04;
  margin: 0;
  max-width: 15ch;
  text-wrap: balance;
`;

const PostDeck = styled.p`
  color: rgba(54, 67, 88, 0.92);
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(0.98rem, 1.65vw, 1.08rem);
  line-height: 1.7;
  margin: 0;
  max-width: 42ch;
`;

const PostMetaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const MetaPill = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(16, 32, 51, 0.1);
  border-radius: 999px;
  box-shadow: 0 10px 28px rgba(19, 34, 58, 0.04);
  color: rgba(62, 75, 95, 0.9);
  display: inline-flex;
  font-size: 0.88rem;
  gap: 0.28rem;
  padding: 0.55rem 0.9rem;

  strong {
    color: #17253d;
    font-size: 0.89rem;
    font-weight: 800;
  }
`;

const PostHeroChip = styled(Chip)`
  background: rgba(32, 74, 113, 0.08);
  border-color: rgba(32, 74, 113, 0.12);
  box-shadow: 0 10px 24px rgba(19, 34, 58, 0.04);
  padding: 0.46rem 0.88rem;
`;

const HeroActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
`;

const HeroPrimaryAction = styled.a`
  align-items: center;
  background: linear-gradient(180deg, #274d74, #1f3e5e);
  border-radius: 999px;
  box-shadow: 0 18px 40px rgba(31, 62, 94, 0.18);
  color: #fff;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-height: 48px;
  padding: 0.78rem 1.25rem;
`;

const HeroSecondaryAction = styled(Link)`
  align-items: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: #183b63;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-height: 48px;
  padding: 0.78rem 1.15rem;
`;

const HeroGhostAction = styled(Link)`
  align-items: center;
  color: rgba(45, 61, 84, 0.92);
  display: inline-flex;
  font-weight: 700;
  min-height: 48px;
  padding: 0.2rem 0.1rem;
`;

const PostHeroAside = styled.aside`
  display: grid;
  gap: 0.95rem;
`;

const HeroSnapshotCard = styled.div`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 255, 0.94)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.08), transparent 56%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 24px;
  display: grid;
  gap: 0.95rem;
  padding: clamp(1rem, 2.2vw, 1.2rem);
`;

const HeroSnapshotEyebrow = styled.p`
  color: rgba(49, 74, 103, 0.74);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

const HeroSnapshotTitle = styled.h2`
  color: #16243b;
  font-size: clamp(0.98rem, 1.5vw, 1.08rem);
  letter-spacing: -0.03em;
  line-height: 1.18;
  margin: 0;
`;

const HeroSnapshotText = styled.p`
  color: rgba(73, 86, 108, 0.94);
  line-height: 1.7;
  margin: 0;
`;

const HeroStatsGrid = styled.dl`
  display: grid;
  gap: 0.75rem;
  margin: 0;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const HeroStatCard = styled.div`
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 18px;
  display: grid;
  gap: 0.22rem;
  min-height: 88px;
  padding: 0.9rem;
`;

const HeroStatLabel = styled.dt`
  color: rgba(72, 86, 109, 0.8);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin: 0;
  text-transform: uppercase;
`;

const HeroStatValue = styled.dd`
  color: #17253d;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0;
`;

const SectionNavList = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const SectionNavLink = styled.a`
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 18px;
  color: #17253d;
  display: grid;
  gap: 0.18rem;
  padding: 0.8rem 0.9rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: rgba(36, 75, 115, 0.2);
    box-shadow: 0 14px 34px rgba(19, 34, 58, 0.07);
    transform: translateY(-1px);
  }
`;

const SectionNavIndex = styled.span`
  color: rgba(76, 91, 114, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const SectionNavLabel = styled.span`
  font-size: 0.97rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
`;

const PostImagePanel = styled.section`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 255, 0.93));
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 28px;
  box-shadow:
    0 24px 64px rgba(19, 34, 58, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
  overflow: hidden;
  padding: clamp(0.95rem, 2.6vw, 1.35rem);
`;

const PostLayout = styled.div`
  display: grid;
  gap: clamp(1.25rem, 2.8vw, 1.8rem);

  @media (min-width: 1100px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.78fr);
  }
`;

const ArticleColumn = styled.div`
  display: grid;
  gap: clamp(1.1rem, 2.4vw, 1.45rem);
`;

const SidebarColumn = styled.aside`
  display: grid;
  gap: clamp(1rem, 2.2vw, 1.25rem);

  @media (min-width: 1100px) {
    position: sticky;
    top: 5.4rem;
  }
`;

const HeroImageGrid = styled.div`
  display: grid;
  gap: clamp(0.85rem, 2vw, 1rem);

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SidebarPanel = styled(Panel)`
  gap: 0.95rem;
  padding: clamp(1rem, 2.2vw, 1.25rem);
`;

const SidebarTitle = styled.h2`
  color: #16243b;
  font-size: 1.12rem;
  letter-spacing: -0.03em;
  margin: 0;
`;

const SidebarText = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.68;
  margin: 0;
`;

const SidebarAction = styled(Link)`
  align-items: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: #183b63;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-height: 46px;
  padding: 0.72rem 1rem;
`;

const SidebarBackLink = styled(Link)`
  color: rgba(53, 67, 90, 0.94);
  font-weight: 700;
`;

const ArticlePaper = styled.article`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 251, 255, 0.96)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.05), transparent 52%);
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 28px;
  box-shadow:
    0 28px 70px rgba(19, 34, 58, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  display: grid;
  padding: clamp(1.2rem, 4vw, 2.4rem);
  scroll-margin-top: 5.8rem;
`;

const ArticleFlow = styled.div`
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);

  > section + section {
    border-top: 1px solid rgba(16, 32, 51, 0.08);
    padding-top: clamp(2rem, 4vw, 3rem);
  }
`;

const StorySection = styled.section`
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.2rem);
  scroll-margin-top: 6rem;

  ${({ $tone }) =>
    $tone === "reference" &&
    css`
      background:
        linear-gradient(180deg, rgba(243, 247, 255, 0.86), rgba(250, 251, 255, 0.98)),
        radial-gradient(circle at top right, rgba(36, 75, 115, 0.08), transparent 48%);
      border: 1px solid rgba(36, 75, 115, 0.12);
      border-radius: 24px;
      padding: clamp(1.1rem, 2.6vw, 1.45rem);
    `}

  ${({ $tone }) =>
    $tone === "warning" &&
    css`
      background:
        linear-gradient(180deg, rgba(255, 247, 238, 0.96), rgba(255, 251, 246, 0.99)),
        radial-gradient(circle at top right, rgba(201, 123, 42, 0.1), transparent 52%);
      border: 1px solid rgba(201, 123, 42, 0.18);
      border-radius: 24px;
      padding: clamp(1.1rem, 2.6vw, 1.45rem);
    `}

  ${({ $tone }) =>
    $tone === "utility" &&
    css`
      background: rgba(245, 248, 252, 0.82);
      border: 1px solid rgba(16, 32, 51, 0.08);
      border-radius: 24px;
      padding: clamp(1.05rem, 2.5vw, 1.35rem);
    `}
`;

const StorySectionHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const SectionLabel = styled.span`
  color: rgba(44, 76, 108, 0.74);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const PostSectionTitle = styled.h2`
  color: #16243b;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.18rem, 1.9vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.12;
  margin: 0;
  text-wrap: balance;
`;

const ArticleBody = styled.div`
  color: rgba(56, 68, 88, 0.96);
  display: grid;
  gap: 1rem;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.12rem, 1.25vw, 1.24rem);
  line-height: 1.88;

  p {
    margin: 0;
  }

  strong {
    color: #17253d;
  }

  a {
    color: #244b73;
    text-decoration-color: rgba(36, 75, 115, 0.35);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }
`;

const NumberedList = styled.ol`
  color: rgba(56, 68, 88, 0.96);
  display: grid;
  gap: 0.9rem;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.08rem, 1.2vw, 1.18rem);
  line-height: 1.82;
  margin: 0;
  padding-left: 1.45rem;

  li::marker {
    color: #244b73;
    font-family: var(--font-ui), sans-serif;
    font-weight: 800;
  }
`;

const DetailCardGrid = styled.div`
  display: grid;
  gap: clamp(0.85rem, 2vw, 1rem);

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1180px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const DetailCard = styled.article`
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(19, 34, 58, 0.04);
  display: grid;
  gap: 0.72rem;
  padding: clamp(1rem, 2.2vw, 1.2rem);
`;

const DetailCardTitle = styled.h3`
  color: #17253d;
  font-size: 1.08rem;
  letter-spacing: -0.03em;
  line-height: 1.18;
  margin: 0;
`;

const DetailCardText = styled.p`
  color: rgba(72, 84, 108, 0.96);
  line-height: 1.7;
  margin: 0;
`;

const FaultGrid = styled.div`
  display: grid;
  gap: clamp(0.85rem, 2vw, 1rem);

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FaultCard = styled.article`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 249, 252, 0.96)),
    radial-gradient(circle at top right, rgba(0, 95, 115, 0.08), transparent 48%);
  border: 1px solid rgba(0, 95, 115, 0.12);
  border-radius: 22px;
  display: grid;
  gap: 0.85rem;
  padding: clamp(1rem, 2.2vw, 1.25rem);
`;

const ResourceList = styled.ul`
  color: rgba(56, 68, 88, 0.96);
  display: grid;
  gap: 0.7rem;
  font-family: var(--font-editorial), Georgia, serif;
  font-size: clamp(1.08rem, 1.18vw, 1.16rem);
  line-height: 1.84;
  margin: 0;
  padding-left: 1.4rem;

  li::marker {
    color: rgba(36, 75, 115, 0.7);
  }
`;

const ResourceItem = styled.li`
  margin: 0;
`;

const ResourceLink = styled.a`
  color: #183b63;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: rgba(24, 59, 99, 0.35);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16em;
`;

const ResourceMeta = styled.span`
  color: rgba(89, 100, 120, 0.88);
  font-size: 0.95em;
`;

const ResourceGroup = styled.div`
  display: grid;
  gap: 0.9rem;
`;

const ResourceGroupTitle = styled.h3`
  color: #17253d;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
  margin: 0;
`;

function collectSectionText(value, collected = []) {
  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      collected.push(normalizedValue);
    }

    return collected;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectSectionText(entry, collected);
    }

    return collected;
  }

  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectSectionText(entry, collected);
    }
  }

  return collected;
}

function estimateReadingTimeMinutes(sections = []) {
  const words = collectSectionText(sections)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(4, Math.ceil(words / 215));
}

function countReferenceItems(sections = []) {
  return sections.reduce((total, section) => {
    if (
      section?.id === "references" ||
      section?.kind === "manuals" ||
      section?.kind === "references"
    ) {
      return total + (section.items?.length || 0);
    }

    return total;
  }, 0);
}

function getPostSectionAnchor(sectionId) {
  return `section-${sectionId}`;
}

function getArticleSectionTone(section) {
  if (section.id === "disclaimer") {
    return "warning";
  }

  if (
    section.id === "references" ||
    section.kind === "manuals" ||
    section.kind === "references"
  ) {
    return "reference";
  }

  if (
    section.kind === "faults" ||
    section.kind === "faq" ||
    section.kind === "models_by_manufacturer" ||
    section.kind === "image_gallery"
  ) {
    return "utility";
  }

  return "default";
}

function getArticleSectionLabel(section) {
  if (section.id === "disclaimer") {
    return "Safety boundary";
  }

  if (section.id === "references") {
    return "Reference pack";
  }

  if (section.kind === "manuals") {
    return "Manuals";
  }

  if (section.kind === "faults") {
    return "Troubleshooting";
  }

  if (section.kind === "steps") {
    return "Procedure";
  }

  if (section.kind === "faq") {
    return "Common questions";
  }

  if (section.kind === "models_by_manufacturer") {
    return "Model guide";
  }

  if (section.kind === "list") {
    return "Key points";
  }

  return null;
}

function getImageResourceTitle(image, index) {
  const candidate = image?.alt || image?.caption;

  return candidate && `${candidate}`.trim() ? candidate : `Photo resource ${index + 1}`;
}

function getImageResourceMeta(image, label) {
  const details = [];

  if (image?.alt && image.alt !== label) {
    details.push(image.alt);
  }

  if (image?.caption && image.caption !== label) {
    details.push(image.caption);
  }

  return details.join(" ");
}

function renderImageResourceList(images = []) {
  if (!images.length) {
    return null;
  }

  return (
    <ResourceList>
      {images.map((image, index) => {
        const label = getImageResourceTitle(image, index);
        const meta = getImageResourceMeta(image, label);
        const href = image.href || image.url || null;

        return (
          <ResourceItem key={`${href || label}-${index}`}>
            {href ? (
              <ResourceLink href={href} rel="noreferrer" target="_blank">
                {label}
              </ResourceLink>
            ) : (
              <strong>{label}</strong>
            )}
            {meta ? <ResourceMeta>{meta}</ResourceMeta> : null}
          </ResourceItem>
        );
      })}
    </ResourceList>
  );
}

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
      <DetailCardGrid>
        {(section.groups || []).map((group) => (
          <DetailCard key={group.manufacturer}>
            <DetailCardTitle>{group.manufacturer}</DetailCardTitle>
            <BulletList>
              {(group.models || []).map((model) => (
                <li key={model.name}>
                  <strong>{model.name}</strong>
                  {model.latestKnownYear ? ` (${model.latestKnownYear})` : ""}
                  {model.summary ? `: ${model.summary}` : ""}
                </li>
              ))}
            </BulletList>
          </DetailCard>
        ))}
      </DetailCardGrid>
    );
  }

  if (section.kind === "faults") {
    return (
      <FaultGrid>
        {(section.items || []).map((fault) => (
          <FaultCard key={fault.title}>
            <DetailCardTitle>{fault.title}</DetailCardTitle>
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
      <ResourceList>
        {(section.items || []).map((item) => {
          const safeUrl = sanitizeExternalUrl(item.url);

          return (
            <ResourceItem key={`${item.title}-${item.url || "no-url"}`}>
              {safeUrl ? (
                <ResourceLink href={safeUrl} rel="noreferrer" target="_blank">
                  {item.title}
                </ResourceLink>
              ) : (
                <strong>{item.title}</strong>
              )}
              {item.fileType || item.language ? (
                <ResourceMeta>
                  {[item.fileType, item.language].filter(Boolean).join(" | ")}
                </ResourceMeta>
              ) : null}
            </ResourceItem>
          );
        })}
      </ResourceList>
    );
  }

  if (section.kind === "faq") {
    return (
      <DetailCardGrid>
        {(section.items || []).map((item) => (
          <DetailCard key={item.question}>
            <DetailCardTitle>{item.question}</DetailCardTitle>
            <DetailCardText>{item.answer}</DetailCardText>
          </DetailCard>
        ))}
      </DetailCardGrid>
    );
  }

  if (section.kind === "image_gallery") {
    const inlineImages = (section.images || []).filter((image) => image.renderInline);
    const linkedImages = (section.images || []).filter((image) => !image.renderInline);

    return (
      <>
        {inlineImages.length ? (
          <HeroImageGrid>
            {inlineImages.map((image) => (
              <Figure key={image.url}>
                <ResponsiveImage
                  image={{
                    ...image,
                    alt: image.alt || copy.relatedPostsTitle,
                  }}
                  sizes="(min-width: 720px) 46vw, 92vw"
                />
                {image.caption ? <FigureCaption>{image.caption}</FigureCaption> : null}
              </Figure>
            ))}
          </HeroImageGrid>
        ) : null}
        {linkedImages.length ? renderImageResourceList(linkedImages) : null}
      </>
    );
  }

  return null;
}

export function PublicPostPage({ locale, messages, pageData }) {
  const copy = getCommonCopy(messages);
  const { article } = pageData;
  const displayEquipmentName = formatEquipmentDisplayName(article.equipment.name);
  const displayTitle = formatArticleDisplayTitle(article.title, article.equipment.name);
  const bodySections = article.bodySections || [];
  const inlineHeroImages = (article.heroImages || []).filter((image) => image.renderInline);
  const linkedHeroImages = (article.heroImages || []).filter((image) => !image.renderInline);
  const sectionLinks = bodySections.filter((section) => section?.id && section?.title);
  const readingTimeMinutes = estimateReadingTimeMinutes(bodySections);
  const referenceItemCount = countReferenceItems(bodySections);
  const backToBlogHref = article.breadcrumb[1]?.href || article.path;
  const heroSectionLinks = sectionLinks.slice(0, 5);
  const heroStats = [
    {
      label: "Estimated read",
      value: `${readingTimeMinutes} min`,
    },
    {
      label: "Guide sections",
      value: `${bodySections.length}`,
    },
    {
      label: "Sources cited",
      value: `${referenceItemCount}`,
    },
    {
      label: "Manufacturers",
      value: `${article.manufacturers.length || 0}`,
    },
  ];

  return (
    <PageMain>
      <PublicViewTracker eventType="POST_VIEW" locale={locale} postId={article.id} />
      <PostScene>
        <PostHeroShell>
          <PostHeroGrid>
            <PostHeader>
              <Breadcrumbs aria-label="Breadcrumb">
                {article.breadcrumb.map((item, index) => (
                  <span key={item.href}>
                    {index > 0 ? <BreadcrumbSeparator>/</BreadcrumbSeparator> : null}{" "}
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  </span>
                ))}
              </Breadcrumbs>
              <PostKicker>{displayEquipmentName}</PostKicker>
              <PostTitle>{displayTitle}</PostTitle>
              <PostDeck>{article.excerpt}</PostDeck>
              <PostMetaGrid>
                {article.publishedAt ? (
                  <MetaPill>
                    {copy.publishedLabel}
                    <strong>{formatDateLabel(locale, article.publishedAt)}</strong>
                  </MetaPill>
                ) : null}
                {article.updatedAt ? (
                  <MetaPill>
                    {copy.updatedLabel}
                    <strong>{formatDateLabel(locale, article.updatedAt)}</strong>
                  </MetaPill>
                ) : null}
                <MetaPill>
                  {copy.authorLabel}
                  <strong>{article.authorName}</strong>
                </MetaPill>
              </PostMetaGrid>
              {article.categories.length || article.manufacturers.length ? (
                <ChipRow>
                  {article.categories.map((category) => (
                    <PostHeroChip href={category.path} key={category.slug}>
                      {category.name}
                    </PostHeroChip>
                  ))}
                  {article.manufacturers.map((manufacturer) => (
                    <PostHeroChip href={manufacturer.path} key={manufacturer.slug}>
                      {manufacturer.name}
                    </PostHeroChip>
                  ))}
                </ChipRow>
              ) : null}
              <HeroActionRow>
                <HeroPrimaryAction href="#guide-content">Start reading</HeroPrimaryAction>
                <HeroSecondaryAction href={article.equipment.path}>
                  {copy.browseEquipment}
                </HeroSecondaryAction>
                <HeroGhostAction href={backToBlogHref}>{copy.backToBlogAction}</HeroGhostAction>
              </HeroActionRow>
            </PostHeader>

            <PostHeroAside>
              <HeroSnapshotCard>
                <HeroSnapshotEyebrow>Quick scan</HeroSnapshotEyebrow>
                <HeroSnapshotTitle>What this guide covers</HeroSnapshotTitle>
                <HeroSnapshotText>
                  Use the quick stats and section links to move between the overview,
                  troubleshooting, and reference material faster.
                </HeroSnapshotText>
                <HeroStatsGrid>
                  {heroStats.map((entry) => (
                    <HeroStatCard key={entry.label}>
                      <HeroStatLabel>{entry.label}</HeroStatLabel>
                      <HeroStatValue>{entry.value}</HeroStatValue>
                    </HeroStatCard>
                  ))}
                </HeroStatsGrid>
              </HeroSnapshotCard>

              {heroSectionLinks.length ? (
                <HeroSnapshotCard>
                  <HeroSnapshotEyebrow>On this page</HeroSnapshotEyebrow>
                  <HeroSnapshotTitle>Jump to a section</HeroSnapshotTitle>
                  <SectionNavList>
                    {heroSectionLinks.map((section, index) => (
                      <SectionNavLink
                        href={`#${getPostSectionAnchor(section.id)}`}
                        key={section.id}
                      >
                        <SectionNavIndex>{`${index + 1}`.padStart(2, "0")}</SectionNavIndex>
                        <SectionNavLabel>
                          {section.id === "references" ? copy.referencesHeading : section.title}
                        </SectionNavLabel>
                      </SectionNavLink>
                    ))}
                  </SectionNavList>
                </HeroSnapshotCard>
              ) : null}
            </PostHeroAside>
          </PostHeroGrid>
        </PostHeroShell>

        {article.heroImages.length ? (
          <PostImagePanel>
            {inlineHeroImages.length ? (
              <HeroImageGrid>
                {inlineHeroImages.map((image, index) => (
                  <Figure key={image.url}>
                    <ResponsiveImage
                      image={image}
                      priority={index === 0}
                      sizes="(min-width: 1100px) 50vw, 92vw"
                    />
                    {image.caption ? <FigureCaption>{image.caption}</FigureCaption> : null}
                  </Figure>
                ))}
              </HeroImageGrid>
            ) : null}
            {linkedHeroImages.length ? (
              <ResourceGroup>
                <ResourceGroupTitle>Photo resources</ResourceGroupTitle>
                {renderImageResourceList(linkedHeroImages)}
              </ResourceGroup>
            ) : null}
          </PostImagePanel>
        ) : null}

        <PostLayout>
          <ArticleColumn>
            <ArticlePaper id="guide-content">
              <ArticleFlow>
                {bodySections.map((section) => (
                  <StorySection
                    id={getPostSectionAnchor(section.id)}
                    key={section.id}
                    $tone={getArticleSectionTone(section)}
                  >
                    <StorySectionHeader>
                      {getArticleSectionLabel(section) ? (
                        <SectionLabel>{getArticleSectionLabel(section)}</SectionLabel>
                      ) : null}
                      <PostSectionTitle>
                        {section.id === "references" ? copy.referencesHeading : section.title}
                      </PostSectionTitle>
                    </StorySectionHeader>
                    {renderArticleSection(section, copy)}
                  </StorySection>
                ))}
              </ArticleFlow>
            </ArticlePaper>

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

            {sectionLinks.length ? (
              <SidebarPanel>
                <SidebarTitle>Guide navigator</SidebarTitle>
                <SidebarText>
                  Use the section list to move through the article without losing your place.
                </SidebarText>
                <SectionNavList>
                  {sectionLinks.map((section, index) => (
                    <SectionNavLink href={`#${getPostSectionAnchor(section.id)}`} key={section.id}>
                      <SectionNavIndex>{`${index + 1}`.padStart(2, "0")}</SectionNavIndex>
                      <SectionNavLabel>
                        {section.id === "references" ? copy.referencesHeading : section.title}
                      </SectionNavLabel>
                    </SectionNavLink>
                  ))}
                </SectionNavList>
              </SidebarPanel>
            ) : null}

            <SidebarPanel>
              <SidebarTitle>{displayEquipmentName}</SidebarTitle>
              <SidebarText>
                This published guide belongs to the equipment landing page for{" "}
                {displayEquipmentName}.
              </SidebarText>
              {article.manufacturers.length ? (
                <ChipRow>
                  {article.manufacturers.map((manufacturer) => (
                    <PostHeroChip href={manufacturer.path} key={manufacturer.slug}>
                      {manufacturer.name}
                    </PostHeroChip>
                  ))}
                </ChipRow>
              ) : null}
              <SidebarAction href={article.equipment.path}>{copy.browseEquipment}</SidebarAction>
              <SidebarBackLink href={backToBlogHref}>{copy.backToBlogAction}</SidebarBackLink>
            </SidebarPanel>
          </SidebarColumn>
        </PostLayout>
      </PostScene>
    </PageMain>
  );
}
