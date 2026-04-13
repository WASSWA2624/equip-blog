"use client";

import Link from "next/link";
import styled from "styled-components";

const fallbackCopy = Object.freeze({
  fullGeneratorAction: "Open full generator",
  inventoryWorkspaceDescription:
    "The equipment inventory stays aligned with the seeded 1,000+ item master list, including lifecycle state, draft linkage, and posted status.",
  inventoryWorkspaceTitle: "Equipment workflow",
  manageProvidersAction: "Manage providers",
  providerConfigDescription:
    "Review the active provider, model readiness, credential coverage, and fallback health before starting new AI-assisted drafts.",
  providerConfigMissing:
    "No enabled primary generation provider is configured yet. Add or enable one before starting AI draft generation.",
  providerConfigTitle: "AI configuration",
  providerFallbackReadyLabel: "Fallback ready",
  providerMissingKeysLabel: "Missing credentials",
  providerStoredKeysLabel: "Stored credentials",
  quickLaunchAction: "Generate post",
  quickLaunchDescription:
    "Enter an equipment name here to open the full generator with the field prefilled and the current default provider selected.",
  quickLaunchHintMissing:
    "Generation stays blocked until an enabled primary provider config has a usable credential.",
  quickLaunchHintReady:
    "The generator will open with your equipment name prefilled so you can review options and create the draft.",
  quickLaunchLabel: "Equipment name",
  quickLaunchPlaceholder: "e.g. ultrasound scanner",
  quickLaunchTitle: "Equipment post generator",
  workspaceDescription:
    "Use the dashboard as the control surface for provider readiness, generation entry points, and the equipment master list.",
  workspaceTitle: "Workspace",
});

function getDashboardCopy(copy = {}) {
  return {
    ...fallbackCopy,
    ...copy,
  };
}

function formatDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number.isFinite(value) ? value : 0);
}

function formatStageLabel(value) {
  return `${value || "unknown"}`
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getToneFromStatus(status) {
  if (status === "FAILED") {
    return "error";
  }

  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "RUNNING") {
    return "accent";
  }

  return "default";
}

function getToneFromLifecycle(status) {
  if (status === "POSTED") {
    return "success";
  }

  if (status === "UPDATED" || status === "EDITED" || status === "GENERATED") {
    return "accent";
  }

  return "default";
}

const Page = styled.main`
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.3rem);
  margin: 0 auto;
  max-width: 1280px;
  padding: clamp(1rem, 2.6vw, 1.8rem);
`;

const Hero = styled.section`
  background:
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.22), transparent 38%),
    linear-gradient(135deg, rgba(0, 95, 115, 0.12), rgba(16, 32, 51, 0.03));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: grid;
  gap: 0.72rem;
  overflow: hidden;
  padding: clamp(1.05rem, 3vw, 1.7rem);
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 4.2vw, 2.95rem);
  line-height: 0.98;
  margin: 0;
  max-width: 16ch;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.98rem;
  line-height: 1.55;
  margin: 0;
  max-width: 58ch;
`;

const SummaryGrid = styled.section`
  display: grid;
  gap: 0.82rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
`;

const SummaryCard = styled.section`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 249, 252, 0.92));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 12px 34px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: 0.25rem;
  padding: 0.92rem 1rem;
`;

const SummaryValue = styled.strong`
  font-size: clamp(1.55rem, 3vw, 2.1rem);
  line-height: 0.92;
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.94rem;
  line-height: 1.45;
  margin: 0;
`;

const WorkspaceGrid = styled.section`
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.2rem);

  @media (min-width: 920px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Grid = styled.section`
  display: grid;
  gap: clamp(0.95rem, 2vw, 1.2rem);

  @media (min-width: 1040px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.95fr);
  }
`;

const Card = styled.section`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 14px 38px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: 0.85rem;
  padding: clamp(0.95rem, 2.3vw, 1.2rem);
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 0.3rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  margin: 0;
`;

const BarGrid = styled.div`
  align-items: end;
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(14, minmax(28px, 1fr));
  min-height: 170px;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: thin;
`;

const BarColumn = styled.div`
  align-items: center;
  display: grid;
  gap: 0.2rem;
  justify-items: center;
  min-width: 0;
`;

const BarTrack = styled.div`
  align-items: end;
  background: rgba(16, 32, 51, 0.04);
  border-radius: 999px;
  display: flex;
  height: 140px;
  padding: 0.28rem;
  width: 100%;
`;

const BarFill = styled.div`
  background: linear-gradient(180deg, rgba(201, 123, 42, 0.92), rgba(0, 95, 115, 0.96));
  border-radius: 999px;
  min-height: ${({ $height }) => ($height > 0 ? "10px" : "0")};
  width: 100%;
  height: ${({ $height }) => `${$height}%`};
`;

const BarLabel = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.68rem;
`;

const BarValue = styled.strong`
  font-size: 0.76rem;
`;

const ItemList = styled.div`
  display: grid;
  gap: 0.72rem;
`;

const Item = styled.article`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.94));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: 0.55rem;
  padding: 0.88rem 0.95rem;
`;

const Row = styled.div`
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.75rem;
  justify-content: space-between;
`;

const ItemTitle = styled.h3`
  font-size: 0.96rem;
  margin: 0;
`;

const MetaRow = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  font-size: 0.82rem;
`;

const Pill = styled.span`
  background: ${({ $tone }) =>
    $tone === "error"
      ? "rgba(168, 49, 49, 0.12)"
      : $tone === "success"
        ? "rgba(21, 115, 71, 0.12)"
        : $tone === "accent"
          ? "rgba(201, 123, 42, 0.16)"
          : "rgba(0, 95, 115, 0.12)"};
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.26rem 0.58rem;
`;

const EmptyState = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
`;

const Notice = styled(Card)`
  background:
    linear-gradient(180deg, rgba(255, 251, 239, 0.96), rgba(255, 255, 255, 0.96)),
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.18), transparent 46%);
`;

const InlineLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const QuickLaunchForm = styled.form`
  display: grid;
  gap: 0.72rem;
`;

const QuickLaunchInput = styled.input`
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-height: 48px;
  padding: 0.82rem 0.9rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const ActionButton = styled.button`
  background: ${({ $tone, theme }) =>
    $tone === "secondary" ? "rgba(247, 249, 252, 0.96)" : theme.colors.primary};
  border: 1px solid ${({ $tone, theme }) => ($tone === "secondary" ? theme.colors.border : "transparent")};
  border-radius: 999px;
  color: ${({ $tone }) => ($tone === "secondary" ? "inherit" : "white")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font: inherit;
  font-weight: 700;
  min-height: 42px;
  opacity: ${({ disabled }) => (disabled ? 0.66 : 1)};
  padding: 0.72rem 1rem;
`;

export default function AnalyticsDashboardScreen({ copy, initialData }) {
  const resolvedCopy = getDashboardCopy(copy);
  const trendMax = Math.max(...initialData.analytics.trend.map((entry) => entry.totalViews), 0);
  const providerConfiguration = initialData.workspace?.providerConfiguration || {};
  const defaultProviderConfig = providerConfiguration.defaultConfig || null;
  const providerSummary = providerConfiguration.summary || {};
  const workspacePermissions = initialData.workspace?.permissions || {};
  const workspaceRoutes = {
    equipment: initialData.workspace?.routes?.equipment || "/admin/equipment",
    generate: initialData.workspace?.routes?.generate || "/admin/generate",
    providers: initialData.workspace?.routes?.providers || "/admin/providers",
  };
  const providerReady = Boolean(defaultProviderConfig?.hasUsableCredential);

  return (
    <Page>
      <Hero>
        <Eyebrow>{resolvedCopy.eyebrow}</Eyebrow>
        <Title>{resolvedCopy.title}</Title>
        <Description>{resolvedCopy.description}</Description>
      </Hero>

      <SummaryGrid>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.generationJobCount30d)}</SummaryValue>
          <SmallText>{resolvedCopy.generationJobsLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.completedJobCount30d)}</SummaryValue>
          <SmallText>{resolvedCopy.completedJobsLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.failedJobCount30d)}</SummaryValue>
          <SmallText>{resolvedCopy.failedJobsLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.warningJobCount30d)}</SummaryValue>
          <SmallText>{resolvedCopy.warningJobsLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.failureLogCount14d)}</SummaryValue>
          <SmallText>{resolvedCopy.failureLogsLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{formatNumber(initialData.summary.scheduledRunCount14d)}</SummaryValue>
          <SmallText>{resolvedCopy.scheduledRunsLabel}</SmallText>
        </SummaryCard>
      </SummaryGrid>

      <Card>
        <SectionHeader>
          <CardTitle>{resolvedCopy.workspaceTitle}</CardTitle>
          <SmallText>{resolvedCopy.workspaceDescription}</SmallText>
        </SectionHeader>

        <WorkspaceGrid>
          <Card>
            <SectionHeader>
              <CardTitle>{resolvedCopy.providerConfigTitle}</CardTitle>
              <SmallText>{resolvedCopy.providerConfigDescription}</SmallText>
            </SectionHeader>
            {defaultProviderConfig ? (
              <>
                <SummaryGrid>
                  <SummaryCard>
                    <SummaryValue>{defaultProviderConfig.providerLabel}</SummaryValue>
                    <SmallText>{defaultProviderConfig.model}</SmallText>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryValue>{formatNumber(providerSummary.storedCredentialCount)}</SummaryValue>
                    <SmallText>{resolvedCopy.providerStoredKeysLabel}</SmallText>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryValue>{formatNumber(providerSummary.missingCredentialCount)}</SummaryValue>
                    <SmallText>{resolvedCopy.providerMissingKeysLabel}</SmallText>
                  </SummaryCard>
                </SummaryGrid>
                <Item>
                  <Row>
                    <ItemTitle>{defaultProviderConfig.credentialLabel}</ItemTitle>
                    <Pill $tone={providerReady ? "success" : "error"}>
                      {providerSummary.fallbackReady
                        ? resolvedCopy.providerFallbackReadyLabel
                        : defaultProviderConfig.credentialState}
                    </Pill>
                  </Row>
                  <SmallText>
                    {defaultProviderConfig.isDefault ? "Primary generation config." : "Enabled generation config."}
                  </SmallText>
                </Item>
              </>
            ) : (
              <EmptyState>{resolvedCopy.providerConfigMissing}</EmptyState>
            )}
            {workspacePermissions.canManageProviders ? (
              <InlineLink href={workspaceRoutes.providers}>{resolvedCopy.manageProvidersAction}</InlineLink>
            ) : null}
          </Card>

          <Card>
            <SectionHeader>
              <CardTitle>{resolvedCopy.quickLaunchTitle}</CardTitle>
              <SmallText>{resolvedCopy.quickLaunchDescription}</SmallText>
            </SectionHeader>
            <QuickLaunchForm action={workspaceRoutes.generate} method="get">
              <QuickLaunchInput
                aria-label={resolvedCopy.quickLaunchLabel}
                defaultValue=""
                name="equipment"
                placeholder={resolvedCopy.quickLaunchPlaceholder}
                type="text"
              />
              <ActionRow>
                <ActionButton disabled={!workspacePermissions.canGeneratePosts || !providerReady} type="submit">
                  {resolvedCopy.quickLaunchAction}
                </ActionButton>
                <InlineLink href={workspaceRoutes.generate}>{resolvedCopy.fullGeneratorAction}</InlineLink>
              </ActionRow>
            </QuickLaunchForm>
            <SmallText>
              {providerReady ? resolvedCopy.quickLaunchHintReady : resolvedCopy.quickLaunchHintMissing}
            </SmallText>
          </Card>

          <Card>
            <SectionHeader>
              <CardTitle>{resolvedCopy.inventoryWorkspaceTitle}</CardTitle>
              <SmallText>{resolvedCopy.inventoryWorkspaceDescription}</SmallText>
            </SectionHeader>
            <SummaryGrid>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.totalCount)}</SummaryValue>
                <SmallText>{resolvedCopy.equipmentInventoryLabel}</SmallText>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.generatedCount)}</SummaryValue>
                <SmallText>{resolvedCopy.equipmentGeneratedLabel}</SmallText>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.postedCount)}</SummaryValue>
                <SmallText>{resolvedCopy.equipmentPostedLabel}</SmallText>
              </SummaryCard>
            </SummaryGrid>
            {workspacePermissions.canViewEquipment ? (
              <InlineLink href={workspaceRoutes.equipment}>{resolvedCopy.openEquipmentInventoryAction}</InlineLink>
            ) : null}
          </Card>
        </WorkspaceGrid>
      </Card>

      {initialData.permissions.canViewAnalytics ? (
        <Grid>
          <Card>
            <SectionHeader>
              <CardTitle>{resolvedCopy.trafficSectionTitle}</CardTitle>
              <SmallText>{resolvedCopy.trafficSectionDescription}</SmallText>
            </SectionHeader>
            <SummaryGrid>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.analytics.totalViewCount30d)}</SummaryValue>
                <SmallText>{resolvedCopy.totalViewsLabel}</SmallText>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.analytics.websiteViewCount30d)}</SummaryValue>
                <SmallText>{resolvedCopy.websiteViewsLabel}</SmallText>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.analytics.pageViewCount30d)}</SummaryValue>
                <SmallText>{resolvedCopy.pageViewsLabel}</SmallText>
              </SummaryCard>
              <SummaryCard>
                <SummaryValue>{formatNumber(initialData.analytics.postViewCount30d)}</SummaryValue>
                <SmallText>{resolvedCopy.postViewsLabel}</SmallText>
              </SummaryCard>
            </SummaryGrid>
            {initialData.analytics.trend.length ? (
              <>
                <SectionHeader>
                  <CardTitle>{resolvedCopy.trendTitle}</CardTitle>
                </SectionHeader>
                <BarGrid aria-label={resolvedCopy.trendTitle}>
                  {initialData.analytics.trend.map((entry) => (
                    <BarColumn key={entry.date}>
                      <BarTrack>
                        <BarFill
                          $height={trendMax ? Math.max(8, (entry.totalViews / trendMax) * 100) : 0}
                        />
                      </BarTrack>
                      <BarValue>{formatNumber(entry.totalViews)}</BarValue>
                      <BarLabel>{entry.date.slice(5)}</BarLabel>
                    </BarColumn>
                  ))}
                </BarGrid>
              </>
            ) : (
              <EmptyState>{resolvedCopy.noTrendData}</EmptyState>
            )}
          </Card>

          <Card>
            <SectionHeader>
              <CardTitle>{resolvedCopy.topPostsTitle}</CardTitle>
              <SmallText>{resolvedCopy.topPostsDescription}</SmallText>
            </SectionHeader>
            {initialData.analytics.topPosts.length ? (
              <ItemList>
                {initialData.analytics.topPosts.map((post) => (
                  <Item key={post.id}>
                    <Row>
                      <div>
                        <ItemTitle>{post.title}</ItemTitle>
                        <MetaRow>
                          <span>{resolvedCopy.viewCountLabel}: {formatNumber(post.viewCount)}</span>
                          {post.publishedAt ? <span>{formatDateTime(post.publishedAt)}</span> : null}
                        </MetaRow>
                      </div>
                      <InlineLink href={post.path}>{resolvedCopy.openPostAction}</InlineLink>
                    </Row>
                  </Item>
                ))}
              </ItemList>
            ) : (
              <EmptyState>{resolvedCopy.noTopPosts}</EmptyState>
            )}
          </Card>
        </Grid>
      ) : (
        <Notice>
          <SectionHeader>
            <CardTitle>{resolvedCopy.analyticsRestrictedTitle}</CardTitle>
            <SmallText>{resolvedCopy.analyticsRestrictedDescription}</SmallText>
          </SectionHeader>
        </Notice>
      )}

      <Card>
        <SectionHeader>
          <CardTitle>{resolvedCopy.equipmentPreviewTitle}</CardTitle>
          <SmallText>{resolvedCopy.equipmentPreviewDescription}</SmallText>
        </SectionHeader>
        <SummaryGrid>
          <SummaryCard>
            <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.totalCount)}</SummaryValue>
            <SmallText>{resolvedCopy.equipmentInventoryLabel}</SmallText>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.plannedCount)}</SummaryValue>
            <SmallText>{resolvedCopy.equipmentPlannedLabel}</SmallText>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.generatedCount)}</SummaryValue>
            <SmallText>{resolvedCopy.equipmentGeneratedLabel}</SmallText>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{formatNumber(initialData.equipmentPreview.summary.postedCount)}</SummaryValue>
            <SmallText>{resolvedCopy.equipmentPostedLabel}</SmallText>
          </SummaryCard>
        </SummaryGrid>
        {initialData.equipmentPreview.items.length ? (
          <ItemList>
            {initialData.equipmentPreview.items.map((item) => (
              <Item key={item.id}>
                <Row>
                  <div>
                    <ItemTitle>{item.name}</ItemTitle>
                    <MetaRow>
                      <span>{item.slug}</span>
                      <span>{formatDateTime(item.updatedAt)}</span>
                    </MetaRow>
                  </div>
                  <Pill $tone={getToneFromLifecycle(item.lifecycleStatus)}>{item.lifecycleStatus}</Pill>
                </Row>
                <MetaRow>
                  <span>{item.primaryPost?.title || resolvedCopy.equipmentPreviewNoPost}</span>
                  {item.primaryPost?.status ? <span>{item.primaryPost.status}</span> : null}
                </MetaRow>
                <Row>
                  <SmallText>{item.lifecycleNotes || resolvedCopy.equipmentPreviewNoNotes}</SmallText>
                  <MetaRow>
                    {item.primaryPost?.editorPath ? (
                      <InlineLink href={item.primaryPost.editorPath}>
                        {resolvedCopy.openEquipmentEditorAction}
                      </InlineLink>
                    ) : null}
                    {item.primaryPost?.publicPath ? (
                      <InlineLink href={item.primaryPost.publicPath}>{resolvedCopy.openPostAction}</InlineLink>
                    ) : null}
                  </MetaRow>
                </Row>
              </Item>
            ))}
          </ItemList>
        ) : (
          <EmptyState>{resolvedCopy.noEquipmentPreview}</EmptyState>
        )}
        <InlineLink href="/admin/equipment">{resolvedCopy.openEquipmentInventoryAction}</InlineLink>
      </Card>

      <Grid>
        <Card>
          <SectionHeader>
            <CardTitle>{resolvedCopy.recentFailuresTitle}</CardTitle>
            <SmallText>{resolvedCopy.recentFailuresDescription}</SmallText>
          </SectionHeader>
          {initialData.recentFailures.length ? (
            <ItemList>
              {initialData.recentFailures.map((failure) => (
                <Item key={failure.id}>
                  <Row>
                    <div>
                      <ItemTitle>{formatStageLabel(failure.action)}</ItemTitle>
                      <SmallText>{failure.summary}</SmallText>
                    </div>
                    <Pill $tone={failure.level === "error" ? "error" : "accent"}>
                      {failure.level === "error" ? resolvedCopy.levelError : resolvedCopy.levelWarning}
                    </Pill>
                  </Row>
                  <MetaRow>
                    <span>{failure.entityType}</span>
                    <span>{failure.entityId}</span>
                    <span>{formatDateTime(failure.createdAt)}</span>
                  </MetaRow>
                </Item>
              ))}
            </ItemList>
          ) : (
            <EmptyState>{resolvedCopy.noRecentFailures}</EmptyState>
          )}
        </Card>

        <Card>
          <SectionHeader>
            <CardTitle>{resolvedCopy.recentJobsTitle}</CardTitle>
            <SmallText>{resolvedCopy.recentJobsDescription}</SmallText>
          </SectionHeader>
          {initialData.recentGenerationJobs.length ? (
            <ItemList>
              {initialData.recentGenerationJobs.map((job) => (
                <Item key={job.id}>
                  <Row>
                    <div>
                      <ItemTitle>{job.equipmentName}</ItemTitle>
                      <MetaRow>
                        <span>{job.locale.toUpperCase()}</span>
                        <span>{formatStageLabel(job.currentStage)}</span>
                        {job.providerConfig ? <span>{job.providerConfig.label}</span> : null}
                      </MetaRow>
                    </div>
                    <Pill $tone={getToneFromStatus(job.status)}>{job.status}</Pill>
                  </Row>
                  <MetaRow>
                    <span>{formatDateTime(job.createdAt)}</span>
                    {job.warningCount ? (
                      <span>{resolvedCopy.warningCountLabel}: {formatNumber(job.warningCount)}</span>
                    ) : null}
                    {job.errorMessage ? <span>{job.errorMessage}</span> : null}
                  </MetaRow>
                </Item>
              ))}
            </ItemList>
          ) : (
            <EmptyState>{resolvedCopy.noRecentJobs}</EmptyState>
          )}
        </Card>
      </Grid>

      <Card>
        <SectionHeader>
          <CardTitle>{resolvedCopy.scheduledRunsTitle}</CardTitle>
          <SmallText>{resolvedCopy.scheduledRunsDescription}</SmallText>
        </SectionHeader>
        {initialData.scheduledRuns.length ? (
          <ItemList>
            {initialData.scheduledRuns.map((run) => (
              <Item key={run.runId}>
                <Row>
                  <div>
                    <ItemTitle>{run.runId}</ItemTitle>
                    <MetaRow>
                      <span>{resolvedCopy.batchSizeLabel}: {formatNumber(run.batchSize || 0)}</span>
                      <span>{resolvedCopy.dueCountLabel}: {formatNumber(run.dueCount || 0)}</span>
                      <span>{resolvedCopy.publishedCountLabel}: {formatNumber(run.publishedCount || 0)}</span>
                    </MetaRow>
                  </div>
                  <Pill $tone={run.status === "completed" ? "success" : "accent"}>
                    {run.status === "completed" ? resolvedCopy.runCompletedLabel : resolvedCopy.runRunningLabel}
                  </Pill>
                </Row>
                <MetaRow>
                  <span>{resolvedCopy.failedJobsLabel}: {formatNumber(run.failedCount || 0)}</span>
                  <span>{resolvedCopy.skippedCountLabel}: {formatNumber(run.skippedCount || 0)}</span>
                  <span>
                    {run.completedAt ? formatDateTime(run.completedAt) : formatDateTime(run.startedAt)}
                  </span>
                </MetaRow>
              </Item>
            ))}
          </ItemList>
        ) : (
          <EmptyState>{resolvedCopy.noScheduledRuns}</EmptyState>
        )}
      </Card>
    </Page>
  );
}
