import PublicViewTracker from "@/components/analytics/public-view-tracker";
import {
  EmptyState,
  EmptyTitle,
  Eyebrow,
  getCommonCopy,
  Grid,
  LandingContent,
  LandingGrid,
  LandingHero,
  LandingRail,
  Lead,
  MetaRow,
  PageMain,
  Pagination,
  Panel,
  PostCard,
  PublicUtilityRail,
  SearchButton,
  SearchForm,
  SearchInput,
  SearchLink,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  SpotlightGrid,
  Title,
} from "@/components/public/server-primitives";

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

export default function PublicCollectionPage({
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
                ? `${pageData.pagination.totalItems} ${copy.resultsLabel.toLowerCase()} in this archive.`
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

        <LandingRail aria-label="Archive context">
          <PublicUtilityRail
            copy={copy}
            locale={locale}
            metrics={[
              { label: "Published results", value: `${pageData.pagination.totalItems}` },
              {
                label: "Connected hubs",
                value: `${pageData.discoverySections?.reduce((count, section) => count + section.items.length, 0) || 0}`,
              },
            ]}
          />
        </LandingRail>
      </LandingGrid>

      {pageData.discoverySections?.length ? (
        <Panel>
          <SectionHeader>
            <SectionTitle>{pageContent.discoveryTitle || "Keep exploring"}</SectionTitle>
            <SectionDescription>
              {pageContent.discoveryDescription ||
                "Use connected category, manufacturer, and equipment routes to branch into adjacent published guides instead of hitting a dead end."}
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
