import Link from "next/link";
import styled, { css } from "styled-components";

import ContentImage from "@/components/public/content-image";
import { formatEquipmentAwareTitle, formatEquipmentDisplayName } from "@/lib/content/presentation";
import { sanitizeHrefUrl } from "@/lib/security";

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

export function getCommonCopy(publicMessages = {}) {
  const common = publicMessages.common || {};

  return {
    authorLabel: common.authorLabel || "Author",
    backToBlogAction: common.backToBlogAction || "Back to blog",
    browseCategory: common.browseCategory || "Browse category",
    browseEquipment: common.browseEquipment || "Browse equipment",
    browseManufacturer: common.browseManufacturer || "Browse manufacturer",
    clearAction: common.clearAction || "Clear",
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
    resultsLabel: common.resultsLabel || "Published posts",
    searchAction: common.searchAction || "Search",
    searchPlaceholder:
      common.searchPlaceholder || "Search published posts, equipment, manufacturers, or tags",
    topCategoriesTitle: common.topCategoriesTitle || "Top categories",
    topEquipmentTitle: common.topEquipmentTitle || "Top equipment",
    topManufacturersTitle: common.topManufacturersTitle || "Top manufacturers",
    updatedLabel: common.updatedLabel || "Updated",
  };
}

export const PageMain = styled.main`
  display: grid;
  gap: clamp(1.2rem, 2.8vw, 1.75rem);
  margin: 0 auto;
  max-width: 1280px;
  padding: clamp(1.35rem, 3vw, 2.2rem) clamp(1rem, 3vw, 1.6rem) clamp(2rem, 4vw, 3rem);
  width: 100%;
`;

export const Panel = styled.section`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 255, 0.92));
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 18px;
  box-shadow:
    0 18px 40px rgba(22, 40, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  display: grid;
  gap: 14px;
  overflow: hidden;
  padding: clamp(1rem, 2.6vw, 1.55rem);
`;

export const HeroPanel = styled.section`
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.3rem);
  padding: clamp(0.35rem, 1vw, 0.65rem) 0 clamp(0.2rem, 0.8vw, 0.45rem);
`;

export const LandingGrid = styled.div`
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

export const LandingHero = styled(HeroPanel)`
  grid-area: hero;
`;

export const LandingContent = styled(Panel)`
  grid-area: content;
`;

export const LandingRail = styled.aside`
  display: none;

  @media (min-width: 760px) {
    align-content: start;
    display: grid;
    gap: clamp(1rem, 2vw, 1.25rem);
    grid-area: rail;
  }
`;

export const Eyebrow = styled.p`
  color: rgba(27, 59, 93, 0.74);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  color: #182742;
  font-size: clamp(2.7rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.95;
  margin: 0;
  max-width: 14ch;
`;

export const Lead = styled.p`
  color: rgba(72, 84, 108, 0.96);
  font-size: clamp(1.05rem, 2.3vw, 1.2rem);
  line-height: 1.72;
  margin: 0;
  max-width: 58ch;
`;

const RailCard = styled(Panel)`
  gap: 0.85rem;
  padding: 1rem 1.05rem;
`;

const RailTitle = styled.p`
  color: rgba(53, 66, 91, 0.76);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
`;

const RailCopy = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.58;
  margin: 0;
`;

const RailBulletList = styled.ul`
  color: rgba(72, 84, 108, 0.94);
  display: grid;
  gap: 0.55rem;
  line-height: 1.5;
  margin: 0;
  padding-left: 1.1rem;
`;

const RailMetricList = styled.dl`
  display: grid;
  gap: 0.7rem;
  margin: 0;
`;

const RailMetricRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

const RailMetricLabel = styled.dt`
  color: rgba(80, 92, 115, 0.9);
  font-size: 0.88rem;
  margin: 0;
`;

const RailMetricValue = styled.dd`
  color: #182742;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

export const SectionTitle = styled.h2`
  color: #182742;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  letter-spacing: -0.03em;
  margin: 0;
`;

export const SectionDescription = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.68;
  margin: 0;
  max-width: 62ch;
`;

export const Grid = styled.div`
  display: grid;
  gap: 8px;

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
`;

const Card = styled.article`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 255, 0.92));
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(22, 40, 64, 0.04);
  display: grid;
  gap: 8px;
  min-height: 100%;
  padding: clamp(1rem, 2.2vw, 1.35rem);
`;

const Figure = styled.figure`
  display: grid;
  gap: 0.45rem;
  margin: 0;
`;

const FigureCaption = styled.figcaption`
  color: rgba(80, 92, 115, 0.92);
  font-size: 0.86rem;
  line-height: 1.36;
`;

export const MetaRow = styled.div`
  color: rgba(80, 92, 115, 0.92);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.88rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled(Link)`
  background: rgba(32, 74, 113, 0.05);
  border: 1px solid rgba(32, 74, 113, 0.1);
  border-radius: 14px;
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
  line-height: 1.56;
  margin: 0;
`;

const ActionLink = styled(Link)`
  color: #244b73;
  font-weight: 700;
`;

const SpotlightCard = styled(Card)`
  align-content: start;
`;

const SpotlightTitle = styled.h3`
  font-size: 1.05rem;
  margin: 0;
`;

const SpotlightMeta = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.54;
  margin: 0;
`;

export const EmptyState = styled(Card)`
  align-content: center;
  justify-items: start;
  min-height: 100%;
  padding: clamp(1.2rem, 2.8vw, 1.75rem);
`;

export const EmptyTitle = styled.h3`
  color: #182742;
  margin: 0;
`;

const Pager = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
`;

const PagerSummary = styled.p`
  color: rgba(72, 84, 108, 0.94);
  margin: 0;
`;

const PagerActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PagerButton = styled(Link)`
  background: rgba(32, 74, 113, 0.06);
  border: 1px solid rgba(32, 74, 113, 0.1);
  border-radius: 999px;
  color: #244b73;
  font-weight: 700;
  padding: 0.55rem 0.95rem;
`;

export const SearchForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: #182742;
  flex: 1 1 18rem;
  font-size: 0.96rem;
  min-height: 46px;
  min-width: 12rem;
  padding: 0 1rem;
`;

export const SearchButton = styled.button`
  background: linear-gradient(180deg, #255ca3, #194882);
  border: 1px solid rgba(17, 51, 92, 0.18);
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 800;
  min-height: 46px;
  padding: 0 1rem;
`;

export const SearchLink = styled(Link)`
  align-items: center;
  color: #244b73;
  display: inline-flex;
  font-weight: 700;
  min-height: 46px;
`;

const ContentSection = styled(Panel)`
  gap: 14px;
`;

export const StaticSectionGrid = styled.div`
  display: grid;
  gap: clamp(1rem, 2.4vw, 1.5rem);

  @media (min-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const RichText = styled.div`
  color: rgba(72, 84, 108, 0.94);
  display: grid;
  gap: 8px;
  line-height: 1.62;
`;

export const BulletList = styled.ul`
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

export function PublicUtilityRail({ locale, metrics = [] }) {
  return (
    <>
      <RailCard>
        <RailTitle>Editorial standards</RailTitle>
        <RailCopy>Every public guide is published after editorial review and keeps its trust cues visible.</RailCopy>
        <RailBulletList>
          <li>References stay attached to article sections and document lists.</li>
          <li>Taxonomy pages connect categories, manufacturers, and equipment families.</li>
          <li>Search remains available to readers but stays out of search-engine indexing.</li>
        </RailBulletList>
      </RailCard>

      <RailCard>
        <RailTitle>Current view</RailTitle>
        <RailMetricList>
          <RailMetricRow>
            <RailMetricLabel>Locale</RailMetricLabel>
            <RailMetricValue>{getLocaleLabel(locale)}</RailMetricValue>
          </RailMetricRow>
          {metrics.map((metric) => (
            <RailMetricRow key={metric.label}>
              <RailMetricLabel>{metric.label}</RailMetricLabel>
              <RailMetricValue>{metric.value}</RailMetricValue>
            </RailMetricRow>
          ))}
        </RailMetricList>
      </RailCard>
    </>
  );
}

export function PostCard({ copy, locale, post }) {
  const displayEquipmentName = formatEquipmentDisplayName(post.equipment.name);
  const displayTitle = formatEquipmentAwareTitle(post.title, post.equipment.name);

  return (
    <Card>
      {post.heroImage ? (
        <Figure>
          <ContentImage
            image={post.heroImage}
            priority={false}
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

export function SpotlightGrid({ actionLabel, items }) {
  return (
    <Grid $columns="three">
      {items.map((item) => (
        <SpotlightCard key={item.path}>
          <SpotlightTitle>{item.name}</SpotlightTitle>
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

export function Pagination({ copy, pagination, pathname, query }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Pager aria-label="Pagination">
      <PagerSummary>
        {pagination.startItem}-{pagination.endItem} of {pagination.totalItems}
      </PagerSummary>
      <PagerActions>
        {pagination.hasPreviousPage ? (
          <PagerButton
            href={buildHref(pathname, {
              ...query,
              page: pagination.currentPage - 1,
            })}
          >
            {copy.previousPage}
          </PagerButton>
        ) : null}
        {pagination.hasNextPage ? (
          <PagerButton
            href={buildHref(pathname, {
              ...query,
              page: pagination.currentPage + 1,
            })}
          >
            {copy.nextPage}
          </PagerButton>
        ) : null}
      </PagerActions>
    </Pager>
  );
}

export function StaticSection({ section }) {
  return (
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
          {section.links
            .map((link) => ({
              href: sanitizeHrefUrl(link.href),
              label: link.label,
            }))
            .filter((link) => link.href && link.label)
            .map((link) => (
              <Chip as={Link} href={link.href} key={link.href}>
                {link.label}
              </Chip>
            ))}
        </ChipRow>
      ) : null}
    </ContentSection>
  );
}
