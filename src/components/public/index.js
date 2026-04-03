"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

import PublicViewTracker from "@/components/analytics/public-view-tracker";
import { PublicCommentSection } from "@/components/comments";
import ShareActions from "@/components/public/share-actions";

function formatDateLabel(locale, value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
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
  if (!image?.url) {
    return null;
  }

  return (
    <FigureImage
      alt={image.alt}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      height={image.height || undefined}
      loading={priority ? "eager" : loading}
      sizes={image.srcSet ? sizes : undefined}
      src={image.url}
      srcSet={image.srcSet || undefined}
      width={image.width || undefined}
    />
  );
}

function PostCard({ copy, locale, post }) {
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
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
  padding-left: 1.25rem;
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
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.88rem;
`;

const BreadcrumbLink = styled(Link)`
  color: inherit;
`;

const PostHeader = styled(HeroPanel)`
  gap: clamp(0.9rem, 2vw, 1.25rem);
`;

const PostLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 1100px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.7fr);
  }
`;

const ArticleColumn = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
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
  contain-intrinsic-size: 720px;
  content-visibility: auto;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ArticleBody = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  line-height: 1.62;
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
    );
  }

  return null;
}

export function PublicPostPage({ locale, messages, pageData }) {
  const copy = getCommonCopy(messages);
  const { article } = pageData;

  return (
    <PageMain>
      <PublicViewTracker eventType="POST_VIEW" locale={locale} postId={article.id} />
      <PostHeader>
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
            {article.heroImages.map((image, index) => (
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
