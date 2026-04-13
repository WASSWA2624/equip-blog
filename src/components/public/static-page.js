import PublicViewTracker from "@/components/analytics/public-view-tracker";
import {
  Eyebrow,
  HeroPanel,
  Lead,
  PageMain,
  PublicUtilityRail,
  StaticSection,
  StaticSectionGrid,
  Title,
} from "@/components/public/server-primitives";

export default function PublicStaticPage({ locale, pageContent }) {
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
          <StaticSection key={section.title} section={section} />
        ))}
      </StaticSectionGrid>

      <PublicUtilityRail
        locale={locale}
        metrics={[
          { label: "Sections", value: `${(pageContent.sections || []).length}` },
        ]}
      />
    </PageMain>
  );
}
