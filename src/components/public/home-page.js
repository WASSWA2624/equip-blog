import PublicViewTracker from "@/components/analytics/public-view-tracker";
import {
  EmptyState,
  EmptyTitle,
  getCommonCopy,
  Grid,
  LandingContent,
  LandingGrid,
  LandingHero,
  LandingRail,
  Lead,
  PageMain,
  Panel,
  PostCard,
  PublicUtilityRail,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  SpotlightGrid,
  Title,
} from "@/components/public/server-primitives";

export default function PublicHomePage({ locale, messages, pageContent, pageData }) {
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
                    "Browse the newest published equipment guides in a layout tuned for fast scanning and deeper follow-up reading."}
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

        <LandingRail aria-label="Public route context">
          <PublicUtilityRail
            copy={copy}
            locale={locale}
            metrics={[
              { label: "Published guides", value: `${pageData.stats.postCount}` },
              { label: "Categories", value: `${pageData.stats.categoryCount}` },
              { label: "Manufacturers", value: `${pageData.stats.manufacturerCount}` },
              { label: "Equipment pages", value: `${pageData.stats.equipmentCount}` },
            ]}
          />
        </LandingRail>
      </LandingGrid>

      {hasDiscoverySections ? (
        <Panel>
          <SectionHeader>
            <SectionTitle>{pageContent.discoveryTitle || "Discovery routes"}</SectionTitle>
            <SectionDescription>
              {pageContent.discoveryDescription ||
                "Category, manufacturer, and equipment landing pages give each published guide broader entity context and stronger internal-linking pathways."}
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
