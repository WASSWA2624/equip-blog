"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";

const fallbackCopy = Object.freeze({
  aiGenerateAction: "Generate AI draft",
  aiUpdateAction: "AI update",
  credentialMissing: "Store a provider key or expose one through the environment before generating posts.",
  description:
    "Manage the seeded equipment master list, open manual drafts, trigger AI generation, and keep per-equipment content state visible in one place.",
  draftCountLabel: "Draft",
  editedCountLabel: "Edited",
  emptyState: "No equipment entries matched the current filters.",
  equipmentColumn: "Equipment",
  eyebrow: "Equipment",
  filtersTitle: "Filters",
  generatedCountLabel: "Generated",
  generateErrorPrefix: "Unable to generate equipment draft",
  generateSuccess: "Equipment draft generated.",
  lifecycleColumn: "Lifecycle",
  matchingCountLabel: "In view",
  manualDraftAction: "Open manual draft",
  manualDraftErrorPrefix: "Unable to open or create a manual draft",
  manualDraftExisting: "Opened the current editorial draft for this equipment entry.",
  manualDraftSuccess: "Manual draft ready.",
  nextPageAction: "Next",
  noActivePost: "No related post yet.",
  notesEmpty: "No lifecycle notes are stored yet.",
  openEditorAction: "Open editor",
  openLiveAction: "Open live route",
  pageSummary: "{start}-{end} of {total} equipment entries",
  plannedCountLabel: "Planned",
  postColumn: "Linked post",
  postedAction: "Mark already posted",
  postedCountLabel: "Posted",
  postedErrorPrefix: "Unable to update equipment lifecycle",
  postedSuccess: "Equipment entry marked as already posted.",
  previousPageAction: "Previous",
  providerCardTitle: "Default AI provider",
  providerMissing: "No enabled primary provider config is available yet.",
  providerReady: "Generation actions use the current default provider configuration.",
  refreshAction: "Refresh",
  resetAction: "Reset to planned",
  resetSuccess: "Equipment entry returned to planned status.",
  searchAction: "Apply filters",
  searchLabel: "Search equipment",
  searchPlaceholder: "Search by equipment name, slug, or linked post title",
  selectedTitle: "Selected equipment",
  statusFilterLabel: "Lifecycle filter",
  title: "Equipment content inventory",
  totalCountLabel: "Total equipment",
  updatedAtColumn: "Updated",
  updatedCountLabel: "Updated",
});

function getCopy(copy = {}) {
  return { ...fallbackCopy, ...copy };
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
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

function buildSnapshotUrl(filters) {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("q", filters.search);
  }

  if (filters.lifecycleStatus && filters.lifecycleStatus !== "all") {
    searchParams.set("status", filters.lifecycleStatus);
  }

  searchParams.set("page", `${filters.page || 1}`);

  return `/api/equipment?${searchParams.toString()}`;
}

function buildStatusTone(status) {
  if (status === "POSTED") {
    return "success";
  }

  if (status === "UPDATED" || status === "EDITED") {
    return "accent";
  }

  return "default";
}

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1440px;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  background:
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.2), transparent 38%),
    linear-gradient(135deg, rgba(0, 95, 115, 0.12), rgba(16, 32, 51, 0.03));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  line-height: 1.05;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
  max-width: 860px;
`;

const Grid = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1120px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.9fr);
  }
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 18px 50px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin: 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
`;

const SummaryCard = styled.div`
  background: rgba(247, 249, 252, 0.92);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const SummaryValue = styled.strong`
  font-size: 1.5rem;
  line-height: 1;
`;

const FormGrid = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 0.4fr) auto;
  }
`;

const Field = styled.label`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FieldLabel = styled.span`
  font-weight: 600;
`;

const Input = styled.input`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font: inherit;
  min-height: 48px;
  padding: 0.82rem 0.92rem;
`;

const Select = styled.select`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  font: inherit;
  min-height: 48px;
  padding: 0.82rem 0.92rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Button = styled.button`
  background: ${({ $tone, theme }) =>
    $tone === "secondary" ? "rgba(247, 249, 252, 0.96)" : theme.colors.primary};
  border: 1px solid ${({ $tone, theme }) => ($tone === "secondary" ? theme.colors.border : "transparent")};
  border-radius: 999px;
  color: ${({ $tone }) => ($tone === "secondary" ? "inherit" : "white")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font: inherit;
  font-weight: 700;
  opacity: ${({ disabled }) => (disabled ? 0.68 : 1)};
  padding: 0.78rem 1.05rem;
`;

const TableScroller = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  border-collapse: collapse;
  min-width: 100%;

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.85rem 0.65rem;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const Row = styled.tr`
  background: ${({ $selected }) => ($selected ? "rgba(0, 95, 115, 0.06)" : "transparent")};
  cursor: pointer;
`;

const Pill = styled.span`
  background: ${({ $tone }) =>
    $tone === "success"
      ? "rgba(21, 115, 71, 0.12)"
      : $tone === "accent"
        ? "rgba(201, 123, 42, 0.18)"
        : "rgba(0, 95, 115, 0.12)"};
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.72rem;
`;

const Banner = styled.div`
  background: ${({ $tone, theme }) =>
    $tone === "success" ? "rgba(21, 115, 71, 0.12)" : "rgba(180, 35, 24, 0.12)"};
  border: 1px solid ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const MetaGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
`;

const MetaCard = styled.div`
  background: rgba(247, 249, 252, 0.9);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const LinkAction = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Empty = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

export default function EquipmentManagementScreen({ copy, initialData, permissions }) {
  const resolvedCopy = getCopy(copy);
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState(initialData.filters);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(initialData.items[0]?.id || null);

  useEffect(() => {
    if (data.items.some((item) => item.id === selectedEquipmentId)) {
      return;
    }

    setSelectedEquipmentId(data.items[0]?.id || null);
  }, [data.items, selectedEquipmentId]);

  async function loadSnapshot(nextFilters) {
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch(buildSnapshotUrl(nextFilters));
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load equipment inventory.");
      }

      setData(payload.data);
      setFilters(payload.data.filters);
    } catch (error) {
      setNotice({
        kind: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function runAction(actionKey, implementation) {
    setActiveAction(actionKey);
    setNotice(null);

    try {
      return await implementation();
    } finally {
      setActiveAction(null);
    }
  }

  async function handleFilterSubmit(event) {
    event.preventDefault();
    await loadSnapshot({
      ...filters,
      page: 1,
    });
  }

  async function handlePageChange(nextPage) {
    await loadSnapshot({
      ...filters,
      page: nextPage,
    });
  }

  async function handleGenerate(item) {
    try {
      const payload = await runAction(`generate:${item.id}`, async () => {
        const response = await fetch(`/api/equipment/${item.id}/generate`, {
          method: "POST",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || resolvedCopy.generateErrorPrefix);
        }

        return payload.data;
      });

      await loadSnapshot({
        ...filters,
        page: data.pagination.currentPage,
      });
      setSelectedEquipmentId(item.id);
      setNotice({
        actionHref: payload?.result?.postId ? `/admin/posts/${payload.result.postId}` : null,
        actionLabel: payload?.result?.postId ? resolvedCopy.openEditorAction : null,
        kind: "success",
        message: resolvedCopy.generateSuccess,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: error.message,
      });
    }
  }

  async function handleManualDraft(item) {
    try {
      const payload = await runAction(`manual:${item.id}`, async () => {
        const response = await fetch(`/api/equipment/${item.id}/manual-draft`, {
          method: "POST",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || resolvedCopy.manualDraftErrorPrefix);
        }

        return payload.data;
      });

      await loadSnapshot({
        ...filters,
        page: data.pagination.currentPage,
      });
      setSelectedEquipmentId(item.id);
      setNotice({
        actionHref: payload?.post?.editorPath || null,
        actionLabel: payload?.post?.editorPath ? resolvedCopy.openEditorAction : null,
        kind: "success",
        message: payload?.created ? resolvedCopy.manualDraftSuccess : resolvedCopy.manualDraftExisting,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: error.message,
      });
    }
  }

  async function handleLifecycleUpdate(item, lifecycleStatus, successMessage) {
    try {
      await runAction(`${lifecycleStatus.toLowerCase()}:${item.id}`, async () => {
        const response = await fetch(`/api/equipment/${item.id}`, {
          body: JSON.stringify({
            lifecycleStatus,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "PATCH",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || resolvedCopy.postedErrorPrefix);
        }
      });

      await loadSnapshot({
        ...filters,
        page: data.pagination.currentPage,
      });
      setSelectedEquipmentId(item.id);
      setNotice({
        kind: "success",
        message: successMessage,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: error.message,
      });
    }
  }

  const selectedItem = data.items.find((item) => item.id === selectedEquipmentId) || null;
  const providerReady =
    Boolean(data.defaultProviderConfig?.hasUsableCredential) && Boolean(data.defaultProviderConfig?.id);

  return (
    <Page>
      <Hero>
        <Eyebrow>{resolvedCopy.eyebrow}</Eyebrow>
        <Title>{resolvedCopy.title}</Title>
        <Description>{resolvedCopy.description}</Description>
      </Hero>

      <SummaryGrid>
        <SummaryCard>
          <SummaryValue>{data.summary.totalCount}</SummaryValue>
          <SmallText>{resolvedCopy.totalCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.matchingCount}</SummaryValue>
          <SmallText>{resolvedCopy.matchingCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.plannedCount}</SummaryValue>
          <SmallText>{resolvedCopy.plannedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.draftCount}</SummaryValue>
          <SmallText>{resolvedCopy.draftCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.generatedCount}</SummaryValue>
          <SmallText>{resolvedCopy.generatedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.editedCount}</SummaryValue>
          <SmallText>{resolvedCopy.editedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.updatedCount}</SummaryValue>
          <SmallText>{resolvedCopy.updatedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.postedCount}</SummaryValue>
          <SmallText>{resolvedCopy.postedCountLabel}</SmallText>
        </SummaryCard>
      </SummaryGrid>

      {notice ? (
        <Banner $tone={notice.kind}>
          <SmallText>
            {notice.message}{" "}
            {notice.actionHref && notice.actionLabel ? (
              <LinkAction href={notice.actionHref}>{notice.actionLabel}</LinkAction>
            ) : null}
          </SmallText>
        </Banner>
      ) : null}

      <Grid>
        <div>
          <Card>
            <SmallText>{resolvedCopy.filtersTitle}</SmallText>
            <FormGrid onSubmit={handleFilterSubmit}>
              <Field>
                <FieldLabel>{resolvedCopy.searchLabel}</FieldLabel>
                <Input
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      search: event.target.value,
                    }))
                  }
                  placeholder={resolvedCopy.searchPlaceholder}
                  value={filters.search}
                />
              </Field>
              <Field>
                <FieldLabel>{resolvedCopy.statusFilterLabel}</FieldLabel>
                <Select
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      lifecycleStatus: event.target.value,
                    }))
                  }
                  value={filters.lifecycleStatus}
                >
                  <option value="all">All lifecycle states</option>
                  <option value="planned">Planned</option>
                  <option value="draft">Draft</option>
                  <option value="generated">Generated</option>
                  <option value="edited">Edited</option>
                  <option value="updated">Updated</option>
                  <option value="posted">Posted</option>
                </Select>
              </Field>
              <ButtonRow>
                <Button disabled={loading} type="submit">
                  {resolvedCopy.searchAction}
                </Button>
                <Button $tone="secondary" disabled={loading} onClick={() => loadSnapshot(filters)} type="button">
                  {resolvedCopy.refreshAction}
                </Button>
              </ButtonRow>
            </FormGrid>
          </Card>

          <Card>
            <SmallText>
              {resolvedCopy.pageSummary
                .replace("{start}", `${data.pagination.startItem}`)
                .replace("{end}", `${data.pagination.endItem}`)
                .replace("{total}", `${data.pagination.totalItems}`)}
            </SmallText>
            {!data.items.length ? (
              <Empty>
                <SmallText>{resolvedCopy.emptyState}</SmallText>
              </Empty>
            ) : (
              <>
                <TableScroller>
                  <Table>
                    <thead>
                      <tr>
                        <th>{resolvedCopy.equipmentColumn}</th>
                        <th>{resolvedCopy.lifecycleColumn}</th>
                        <th>{resolvedCopy.postColumn}</th>
                        <th>{resolvedCopy.updatedAtColumn}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <Row key={item.id} onClick={() => setSelectedEquipmentId(item.id)} $selected={item.id === selectedEquipmentId}>
                          <td>
                            <strong>{item.name}</strong>
                            <br />
                            <SmallText>{item.slug}</SmallText>
                          </td>
                          <td>
                            <Pill $tone={buildStatusTone(item.lifecycleStatus)}>{item.lifecycleStatus}</Pill>
                          </td>
                          <td>
                            <strong>{item.primaryPost?.title || resolvedCopy.noActivePost}</strong>
                            {item.primaryPost ? (
                              <SmallText>
                                {item.primaryPost.status} | {item.primaryPost.editorialStage}
                              </SmallText>
                            ) : null}
                          </td>
                          <td>{formatDateTime(item.updatedAt)}</td>
                          <td>
                            <ButtonRow>
                              <Button
                                $tone="secondary"
                                disabled={activeAction === `manual:${item.id}` || !permissions.canEditDrafts}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleManualDraft(item);
                                }}
                                type="button"
                              >
                                {resolvedCopy.manualDraftAction}
                              </Button>
                              <Button
                                disabled={activeAction === `generate:${item.id}` || !permissions.canGeneratePosts || !providerReady}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleGenerate(item);
                                }}
                                type="button"
                              >
                                {item.primaryPost ? resolvedCopy.aiUpdateAction : resolvedCopy.aiGenerateAction}
                              </Button>
                            </ButtonRow>
                          </td>
                        </Row>
                      ))}
                    </tbody>
                  </Table>
                </TableScroller>

                <Actions>
                  <SmallText>
                    {resolvedCopy.pageSummary
                      .replace("{start}", `${data.pagination.startItem}`)
                      .replace("{end}", `${data.pagination.endItem}`)
                      .replace("{total}", `${data.pagination.totalItems}`)}
                  </SmallText>
                  <ButtonRow>
                    <Button
                      $tone="secondary"
                      disabled={!data.pagination.hasPreviousPage || loading}
                      onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                      type="button"
                    >
                      {resolvedCopy.previousPageAction}
                    </Button>
                    <Button
                      $tone="secondary"
                      disabled={!data.pagination.hasNextPage || loading}
                      onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                      type="button"
                    >
                      {resolvedCopy.nextPageAction}
                    </Button>
                  </ButtonRow>
                </Actions>
              </>
            )}
          </Card>
        </div>
        <div>
          <Card>
            <SmallText>{resolvedCopy.providerCardTitle}</SmallText>
            {data.defaultProviderConfig ? (
              <>
                <MetaGrid>
                  <MetaCard>
                    <strong>{data.defaultProviderConfig.providerLabel}</strong>
                    <SmallText>{data.defaultProviderConfig.model}</SmallText>
                  </MetaCard>
                  <MetaCard>
                    <strong>{data.defaultProviderConfig.isDefault ? "Default" : "Secondary"}</strong>
                    <SmallText>{data.defaultProviderConfig.purpose}</SmallText>
                  </MetaCard>
                </MetaGrid>
                <SmallText>
                  {providerReady ? resolvedCopy.providerReady : resolvedCopy.credentialMissing}
                </SmallText>
                <SmallText>{data.defaultProviderConfig.credentialLabel}</SmallText>
                <Actions>
                  <LinkAction href="/admin/providers">Manage providers</LinkAction>
                </Actions>
              </>
            ) : (
              <Empty>
                <SmallText>{resolvedCopy.providerMissing}</SmallText>
              </Empty>
            )}
          </Card>

          <Card>
            <SmallText>{resolvedCopy.selectedTitle}</SmallText>
            {selectedItem ? (
              <>
                <MetaGrid>
                  <MetaCard>
                    <strong>{selectedItem.name}</strong>
                    <SmallText>{selectedItem.slug}</SmallText>
                  </MetaCard>
                  <MetaCard>
                    <strong>{selectedItem.lifecycleStatus}</strong>
                    <SmallText>{resolvedCopy.lifecycleColumn}</SmallText>
                  </MetaCard>
                  <MetaCard>
                    <strong>{selectedItem.postCount}</strong>
                    <SmallText>{resolvedCopy.postColumn}</SmallText>
                  </MetaCard>
                  <MetaCard>
                    <strong>{formatDateTime(selectedItem.updatedAt)}</strong>
                    <SmallText>{resolvedCopy.updatedAtColumn}</SmallText>
                  </MetaCard>
                </MetaGrid>

                <MetaCard>
                  <strong>{selectedItem.primaryPost?.title || resolvedCopy.noActivePost}</strong>
                  <SmallText>
                    {selectedItem.primaryPost
                      ? `${selectedItem.primaryPost.status} | ${selectedItem.primaryPost.editorialStage}`
                      : resolvedCopy.noActivePost}
                  </SmallText>
                  {selectedItem.primaryPost?.publishedAt ? (
                    <SmallText>Published: {formatDateTime(selectedItem.primaryPost.publishedAt)}</SmallText>
                  ) : null}
                  {selectedItem.postedAt ? (
                    <SmallText>Marked posted: {formatDateTime(selectedItem.postedAt)}</SmallText>
                  ) : null}
                </MetaCard>

                <MetaCard>
                  <strong>Lifecycle notes</strong>
                  <SmallText>{selectedItem.lifecycleNotes || resolvedCopy.notesEmpty}</SmallText>
                </MetaCard>

                <Actions>
                  {selectedItem.primaryPost?.editorPath ? (
                    <LinkAction href={selectedItem.primaryPost.editorPath}>
                      {resolvedCopy.openEditorAction}
                    </LinkAction>
                  ) : null}
                  {selectedItem.primaryPost?.publicPath ? (
                    <LinkAction href={selectedItem.primaryPost.publicPath}>
                      {resolvedCopy.openLiveAction}
                    </LinkAction>
                  ) : null}
                </Actions>

                <ButtonRow>
                  <Button
                    $tone="secondary"
                    disabled={activeAction === `manual:${selectedItem.id}` || !permissions.canEditDrafts}
                    onClick={() => handleManualDraft(selectedItem)}
                    type="button"
                  >
                    {resolvedCopy.manualDraftAction}
                  </Button>
                  <Button
                    disabled={
                      activeAction === `generate:${selectedItem.id}` ||
                      !permissions.canGeneratePosts ||
                      !providerReady
                    }
                    onClick={() => handleGenerate(selectedItem)}
                    type="button"
                  >
                    {selectedItem.primaryPost ? resolvedCopy.aiUpdateAction : resolvedCopy.aiGenerateAction}
                  </Button>
                </ButtonRow>

                <ButtonRow>
                  <Button
                    $tone="secondary"
                    disabled={activeAction === `posted:${selectedItem.id}` || !permissions.canEditDrafts}
                    onClick={() =>
                      handleLifecycleUpdate(selectedItem, "POSTED", resolvedCopy.postedSuccess)
                    }
                    type="button"
                  >
                    {resolvedCopy.postedAction}
                  </Button>
                  <Button
                    $tone="secondary"
                    disabled={activeAction === `planned:${selectedItem.id}` || !permissions.canEditDrafts}
                    onClick={() =>
                      handleLifecycleUpdate(selectedItem, "PLANNED", resolvedCopy.resetSuccess)
                    }
                    type="button"
                  >
                    {resolvedCopy.resetAction}
                  </Button>
                </ButtonRow>
              </>
            ) : (
              <Empty>
                <SmallText>{resolvedCopy.emptyState}</SmallText>
              </Empty>
            )}
          </Card>
        </div>
      </Grid>
    </Page>
  );
}
