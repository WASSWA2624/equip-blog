"use client";

import { startTransition, useEffect, useState } from "react";
import styled from "styled-components";

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1320px;
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
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.05;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
  max-width: 860px;
`;

const Layout = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1080px) {
    grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 20px 60px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h2`
  font-size: 1.05rem;
  margin: 0;
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin: 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const StatCard = styled.div`
  background: rgba(247, 249, 252, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const StatValue = styled.strong`
  font-size: 2rem;
  line-height: 1;
`;

const List = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ListButton = styled.button`
  background: ${({ $active }) => ($active ? "rgba(0, 95, 115, 0.12)" : "rgba(255, 255, 255, 0.98)")};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const ListTitle = styled.strong`
  font-size: 1rem;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Pill = styled.span`
  background: ${({ $tone, theme }) =>
    $tone === "accent"
      ? "rgba(201, 123, 42, 0.18)"
      : $tone === "primary"
        ? "rgba(0, 95, 115, 0.12)"
        : "rgba(88, 97, 116, 0.12)"};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
`;

const SecondaryButton = styled.button`
  background: rgba(247, 249, 252, 0.96);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  padding: 0.7rem 1rem;
`;

const StatusBanner = styled.div`
  background: ${({ $tone, theme }) =>
    $tone === "success" ? "rgba(21, 115, 71, 0.12)" : "rgba(180, 35, 24, 0.12)"};
  border: 1px solid
    ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FieldGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  padding: 0.8rem 0.9rem;
`;

const Textarea = styled.textarea`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-height: ${({ $rows }) => `${$rows * 1.65}rem`};
  padding: 0.8rem 0.9rem;
  resize: vertical;
`;

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const SaveButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 999px;
  color: white;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font: inherit;
  font-weight: 700;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  padding: 0.8rem 1.3rem;
`;

function createDraft(editor) {
  return {
    aliasesText: editor?.aliases?.map((alias) => alias.alias).join("\n") || "",
    branchCountriesText: editor?.manufacturer?.branchCountries?.join("\n") || "",
    headquartersCountry: editor?.manufacturer?.headquartersCountry || "",
    manufacturerId: editor?.manufacturer?.id || null,
    name: editor?.manufacturer?.name || "",
    primaryDomain: editor?.manufacturer?.primaryDomain || "",
  };
}

function parseMultiline(value) {
  return [...new Set(value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean))];
}

export default function ManufacturerManagementScreen({ copy, initialData }) {
  const [data, setData] = useState(initialData);
  const [draft, setDraft] = useState(() => createDraft(initialData.editor));
  const [notice, setNotice] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setDraft(createDraft(data.editor));
  }, [data.editor]);

  async function loadManufacturer(manufacturerId) {
    if (!manufacturerId) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/manufacturers?manufacturerId=${manufacturerId}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || copy.loadErrorPrefix);
      }

      startTransition(() => {
        setData(payload.data);
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: `${copy.loadErrorPrefix}: ${error.message}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  function handleCreateNew() {
    setNotice(null);
    setData((currentData) => ({
      ...currentData,
      editor: {
        aliases: [],
        manufacturer: {
          branchCountries: [],
          headquartersCountry: "",
          id: null,
          name: "",
          normalizedName: "",
          primaryDomain: "",
          rankingScore: 0,
          slug: "",
          updatedAt: null,
        },
        models: [],
        sourceReferences: [],
        stats: {
          aliasCount: 0,
          modelCount: 0,
          sourceReferenceCount: 0,
        },
      },
      selection: {
        manufacturerId: null,
      },
    }));
    setDraft({
      aliasesText: "",
      branchCountriesText: "",
      headquartersCountry: "",
      manufacturerId: null,
      name: "",
      primaryDomain: "",
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch("/api/manufacturers", {
        body: JSON.stringify({
          aliases: parseMultiline(draft.aliasesText),
          branchCountries: parseMultiline(draft.branchCountriesText),
          headquartersCountry: draft.headquartersCountry,
          manufacturerId: draft.manufacturerId || undefined,
          name: draft.name,
          primaryDomain: draft.primaryDomain,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || copy.saveErrorPrefix);
      }

      startTransition(() => {
        setData(payload.data.snapshot);
      });
      setNotice({
        kind: "success",
        message: copy.saveSuccess,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: `${copy.saveErrorPrefix}: ${error.message}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Page>
      <Hero>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Title>{copy.title}</Title>
        <Description>{copy.description}</Description>
      </Hero>
      <SummaryGrid>
        <StatCard>
          <StatValue>{data.summary.manufacturerCount}</StatValue>
          <SmallText>{copy.manufacturerSummary}</SmallText>
        </StatCard>
        <StatCard>
          <StatValue>{data.summary.aliasCount}</StatValue>
          <SmallText>{copy.aliasSummary}</SmallText>
        </StatCard>
        <StatCard>
          <StatValue>{data.summary.modelCount}</StatValue>
          <SmallText>{copy.modelSummary}</SmallText>
        </StatCard>
      </SummaryGrid>
      <Layout>
        <Stack>
          <Card>
            <CardTitle>{copy.listTitle}</CardTitle>
            <SmallText>{copy.listDescription}</SmallText>
            <SecondaryButton onClick={handleCreateNew} type="button">
              {copy.createAction}
            </SecondaryButton>
            {data.manufacturers.length ? (
              <List>
                {data.manufacturers.map((manufacturer) => (
                  <ListButton
                    key={manufacturer.id}
                    onClick={() => loadManufacturer(manufacturer.id)}
                    type="button"
                    $active={data.selection.manufacturerId === manufacturer.id}
                  >
                    <ListTitle>{manufacturer.name}</ListTitle>
                    <SmallText>{manufacturer.primaryDomain}</SmallText>
                    <BadgeRow>
                      <Pill $tone="primary">
                        {copy.aliasBadge}: {manufacturer.aliasCount}
                      </Pill>
                      <Pill>{copy.modelBadge}: {manufacturer.modelCount}</Pill>
                      <Pill $tone="accent">
                        {copy.scoreBadge}: {manufacturer.rankingScore}
                      </Pill>
                    </BadgeRow>
                  </ListButton>
                ))}
              </List>
            ) : (
              <SmallText>{copy.emptyManufacturers}</SmallText>
            )}
          </Card>
        </Stack>
        <Stack>
          <Card>
            <CardTitle>{copy.editorTitle}</CardTitle>
            <SmallText>{copy.editorDescription}</SmallText>
            {notice ? <StatusBanner $tone={notice.kind}>{notice.message}</StatusBanner> : null}
            <Form onSubmit={handleSave}>
              <FieldGrid>
                <Field>
                  <FieldLabel>{copy.fieldName}</FieldLabel>
                  <Input
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        name: event.target.value,
                      }))
                    }
                    value={draft.name}
                  />
                </Field>
                <Field>
                  <FieldLabel>{copy.fieldPrimaryDomain}</FieldLabel>
                  <Input
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        primaryDomain: event.target.value,
                      }))
                    }
                    value={draft.primaryDomain}
                  />
                </Field>
              </FieldGrid>
              <FieldGrid>
                <Field>
                  <FieldLabel>{copy.fieldHeadquarters}</FieldLabel>
                  <Input
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        headquartersCountry: event.target.value,
                      }))
                    }
                    value={draft.headquartersCountry}
                  />
                </Field>
                <Field>
                  <FieldLabel>{copy.fieldBranchCountries}</FieldLabel>
                  <Textarea
                    $rows={5}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        branchCountriesText: event.target.value,
                      }))
                    }
                    value={draft.branchCountriesText}
                  />
                  <SmallText>{copy.fieldBranchCountriesHint}</SmallText>
                </Field>
              </FieldGrid>
              <Field>
                <FieldLabel>{copy.fieldAliases}</FieldLabel>
                <Textarea
                  $rows={6}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      aliasesText: event.target.value,
                    }))
                  }
                  value={draft.aliasesText}
                />
                <SmallText>{copy.fieldAliasesHint}</SmallText>
              </Field>
              <ActionRow>
                <SmallText>
                  {isBusy
                    ? copy.saveWorking
                    : draft.manufacturerId
                      ? `${copy.editingLabel}: ${draft.name || copy.unnamedLabel}`
                      : copy.creatingLabel}
                </SmallText>
                <SaveButton disabled={isBusy} type="submit">
                  {isBusy ? copy.saveWorking : copy.saveAction}
                </SaveButton>
              </ActionRow>
            </Form>
          </Card>
          <Card>
            <CardTitle>{copy.modelsTitle}</CardTitle>
            {data.editor.models.length ? (
              <List>
                {data.editor.models.map((model) => (
                  <ListButton as="div" key={model.id} $active={false}>
                    <ListTitle>{model.name}</ListTitle>
                    <SmallText>{model.equipmentName}</SmallText>
                    <BadgeRow>
                      <Pill>{copy.modelYearBadge}: {model.latestKnownYear || copy.notAvailable}</Pill>
                      <Pill $tone="accent">{copy.scoreBadge}: {model.rankingScore}</Pill>
                      <Pill>{copy.sourceBadge}: {model.sourceReferenceCount}</Pill>
                    </BadgeRow>
                  </ListButton>
                ))}
              </List>
            ) : (
              <SmallText>{copy.emptyModels}</SmallText>
            )}
          </Card>
          <Card>
            <CardTitle>{copy.sourcesTitle}</CardTitle>
            {data.editor.sourceReferences.length ? (
              <List>
                {data.editor.sourceReferences.map((sourceReference) => (
                  <ListButton as="div" key={sourceReference.id} $active={false}>
                    <ListTitle>{sourceReference.title}</ListTitle>
                    <SmallText>{sourceReference.sourceDomain}</SmallText>
                    <BadgeRow>
                      <Pill>{sourceReference.sourceType}</Pill>
                      {sourceReference.reliabilityTier ? (
                        <Pill $tone="accent">{sourceReference.reliabilityTier}</Pill>
                      ) : null}
                    </BadgeRow>
                  </ListButton>
                ))}
              </List>
            ) : (
              <SmallText>{copy.emptySources}</SmallText>
            )}
          </Card>
        </Stack>
      </Layout>
    </Page>
  );
}
