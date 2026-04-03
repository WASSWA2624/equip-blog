"use client";

import { startTransition, useMemo, useState } from "react";
import styled from "styled-components";

const providerOptions = Object.freeze([
  {
    label: "OpenAI",
    value: "openai",
  },
]);

const purposeOrder = Object.freeze({
  draft_generation: 1,
  draft_generation_fallback: 2,
});

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1280px;
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

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
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
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SummaryStat = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.strong`
  font-size: 1.95rem;
  line-height: 1;
`;

const StatusBanner = styled.div`
  background: ${({ $tone, theme }) =>
    $tone === "success" ? "rgba(21, 115, 71, 0.12)" : "rgba(180, 35, 24, 0.12)"};
  border: 1px solid ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SecondaryButton = styled.button`
  background: rgba(247, 249, 252, 0.96);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.8rem 1.15rem;
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
  padding: 0.8rem 1.25rem;
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ConfigCard = styled.article`
  background: ${({ $enabled }) =>
    $enabled ? "rgba(255, 255, 255, 0.98)" : "rgba(247, 249, 252, 0.96)"};
  border: 1px solid
    ${({ $enabled, theme }) => ($enabled ? theme.colors.border : "rgba(88, 97, 116, 0.28)")};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ConfigHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
`;

const ConfigMeta = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ConfigTitle = styled.h3`
  font-size: 1rem;
  margin: 0;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Pill = styled.span`
  background: ${({ $tone }) =>
    $tone === "primary"
      ? "rgba(0, 95, 115, 0.12)"
      : $tone === "accent"
        ? "rgba(201, 123, 42, 0.18)"
        : $tone === "danger"
          ? "rgba(180, 35, 24, 0.12)"
          : "rgba(88, 97, 116, 0.12)"};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const Toggle = styled.label`
  align-items: center;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
`;

const Checkbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  height: 1.05rem;
  width: 1.05rem;
`;

const Radio = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  height: 1.05rem;
  width: 1.05rem;
`;

const FieldGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 860px) {
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

const Select = styled.select`
  appearance: none;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  padding: 0.8rem 0.9rem;
`;

const CredentialCard = styled.div`
  background: rgba(247, 249, 252, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

function createDraftConfig(config) {
  return {
    apiKey: "",
    clearApiKey: false,
    credentialLabel: config.credentialLabel,
    credentialState: config.credentialState,
    hasStoredApiKey: config.hasStoredApiKey,
    id: config.id,
    isDefault: config.isDefault,
    isEnabled: config.isEnabled,
    model: config.model,
    provider: config.provider,
    purpose: config.purpose,
    updatedAt: config.updatedAt,
  };
}

function createNewConfig(index, hasFallbackConfig) {
  return {
    apiKey: "",
    clearApiKey: false,
    credentialLabel: "A new config will use a stored key after you save one.",
    credentialState: "missing",
    hasStoredApiKey: false,
    id: `draft_provider_${Date.now()}_${index}`,
    isDefault: false,
    isEnabled: true,
    model: "",
    provider: "openai",
    purpose: hasFallbackConfig ? "draft_generation" : "draft_generation_fallback",
    updatedAt: null,
  };
}

function formatPurposeLabel(copy, purpose) {
  return purpose === "draft_generation_fallback" ? copy.purposeFallback : copy.purposePrimary;
}

function formatCredentialBadge(copy, state) {
  if (state === "stored") {
    return copy.credentialStoredBadge;
  }

  if (state === "environment") {
    return copy.credentialEnvironmentBadge;
  }

  return copy.credentialMissingBadge;
}

function formatCredentialDescription(copy, state) {
  if (state === "stored") {
    return copy.credentialStoredDescription;
  }

  if (state === "environment") {
    return copy.credentialEnvironmentDescription;
  }

  return copy.credentialMissingDescription;
}

function formatTimestamp(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildErrorMessage(payload, fallbackMessage) {
  const issueMessage = payload?.issues?.formErrors?.[0];

  if (issueMessage) {
    return issueMessage;
  }

  return payload?.message || fallbackMessage;
}

function getDirtyCount(data, draftConfigs) {
  const currentConfigsById = new Map(data.configs.map((config) => [config.id, config]));

  return draftConfigs.filter((draftConfig) => {
    const currentConfig = currentConfigsById.get(draftConfig.id);

    if (!currentConfig) {
      return true;
    }

    return (
      currentConfig.isDefault !== draftConfig.isDefault ||
      currentConfig.isEnabled !== draftConfig.isEnabled ||
      currentConfig.model !== draftConfig.model ||
      currentConfig.provider !== draftConfig.provider ||
      currentConfig.purpose !== draftConfig.purpose ||
      Boolean(draftConfig.apiKey) ||
      draftConfig.clearApiKey
    );
  }).length;
}

function sortConfigs(leftConfig, rightConfig) {
  return (
    (purposeOrder[leftConfig.purpose] || 9) - (purposeOrder[rightConfig.purpose] || 9) ||
    Number(rightConfig.isDefault) - Number(leftConfig.isDefault) ||
    leftConfig.provider.localeCompare(rightConfig.provider) ||
    leftConfig.model.localeCompare(rightConfig.model)
  );
}

function ensureValidDefault(configs) {
  const hasValidDefault = configs.some(
    (config) => config.isDefault && config.isEnabled && config.purpose === "draft_generation",
  );

  if (hasValidDefault) {
    return configs;
  }

  const nextDefaultConfig = configs.find(
    (config) => config.isEnabled && config.purpose === "draft_generation",
  );

  if (!nextDefaultConfig) {
    return configs.map((config) => ({
      ...config,
      isDefault: false,
    }));
  }

  return configs.map((config) => ({
    ...config,
    isDefault: config.id === nextDefaultConfig.id,
  }));
}

export default function ProviderConfigurationScreen({ copy, initialData }) {
  const [data, setData] = useState(initialData);
  const [draftConfigs, setDraftConfigs] = useState(() =>
    initialData.configs.map(createDraftConfig),
  );
  const [notice, setNotice] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const dirtyCount = useMemo(() => getDirtyCount(data, draftConfigs), [data, draftConfigs]);
  const orderedDraftConfigs = useMemo(
    () => [...draftConfigs].sort(sortConfigs),
    [draftConfigs],
  );

  function updateDraftConfig(configId, updates) {
    setDraftConfigs((currentConfigs) => {
      let nextConfigs = currentConfigs.map((config) =>
        config.id === configId ? { ...config, ...updates } : config,
      );

      if (updates.isDefault) {
        nextConfigs = nextConfigs.map((config) => ({
          ...config,
          isDefault: config.id === configId,
        }));
      }

      if (updates.purpose === "draft_generation_fallback") {
        nextConfigs = nextConfigs.map((config) =>
          config.id !== configId && config.purpose === "draft_generation_fallback"
            ? { ...config, purpose: "draft_generation" }
            : config,
        );
      }

      return ensureValidDefault(nextConfigs);
    });
  }

  function handleAddConfig() {
    setDraftConfigs((currentConfigs) => [
      ...currentConfigs,
      createNewConfig(
        currentConfigs.length,
        currentConfigs.some((config) => config.purpose === "draft_generation_fallback"),
      ),
    ]);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch("/api/providers", {
        body: JSON.stringify({
          configs: draftConfigs.map((draftConfig) => ({
            apiKey: draftConfig.apiKey || undefined,
            clearApiKey: draftConfig.clearApiKey,
            id: draftConfig.id.startsWith("draft_provider_") ? null : draftConfig.id,
            isDefault: draftConfig.isDefault,
            isEnabled: draftConfig.isEnabled,
            model: draftConfig.model,
            provider: draftConfig.provider,
            purpose: draftConfig.purpose,
          })),
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(buildErrorMessage(payload, copy.saveErrorPrefix));
      }

      startTransition(() => {
        setData(payload.data.snapshot);
        setDraftConfigs(payload.data.snapshot.configs.map(createDraftConfig));
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
      <Layout>
        <Stack>
          <Card>
            <CardTitle>{copy.summaryTitle}</CardTitle>
            <SmallText>{copy.summaryDescription}</SmallText>
            <SummaryGrid>
              <SummaryStat>
                <SmallText>{copy.configCountLabel}</SmallText>
                <StatValue>{data.summary.configCount}</StatValue>
              </SummaryStat>
              <SummaryStat>
                <SmallText>{copy.enabledCountLabel}</SmallText>
                <StatValue>{data.summary.enabledCount}</StatValue>
              </SummaryStat>
              <SummaryStat>
                <SmallText>{copy.storedCredentialCountLabel}</SmallText>
                <StatValue>{data.summary.storedCredentialCount}</StatValue>
              </SummaryStat>
              <SummaryStat>
                <SmallText>{copy.fallbackReadyLabel}</SmallText>
                <StatValue>{data.summary.fallbackReady ? "Ready" : "Needs work"}</StatValue>
              </SummaryStat>
            </SummaryGrid>
          </Card>
          <Card>
            <CardTitle>{copy.credentialSectionTitle}</CardTitle>
            <SmallText>{copy.securityDescription}</SmallText>
            <BadgeRow>
              <Pill $tone="primary">{copy.credentialStoredBadge}</Pill>
              <Pill>{copy.credentialEnvironmentBadge}</Pill>
              <Pill $tone="danger">{copy.credentialMissingBadge}</Pill>
            </BadgeRow>
          </Card>
        </Stack>
        <Stack>
          <Card>
            <ActionRow>
              <div>
                <CardTitle>{copy.editorTitle}</CardTitle>
                <SmallText>{copy.editorDescription}</SmallText>
              </div>
              <ButtonRow>
                <SecondaryButton onClick={handleAddConfig} type="button">
                  {copy.addAction}
                </SecondaryButton>
              </ButtonRow>
            </ActionRow>
            {notice ? <StatusBanner $tone={notice.kind}>{notice.message}</StatusBanner> : null}
            <Form onSubmit={handleSave}>
              {orderedDraftConfigs.map((config) => (
                <ConfigCard $enabled={config.isEnabled} key={config.id}>
                  <ConfigHeader>
                    <ConfigMeta>
                      <ConfigTitle>
                        {config.model ? `${config.provider} / ${config.model}` : "New provider config"}
                      </ConfigTitle>
                      <BadgeRow>
                        {config.isDefault ? <Pill $tone="primary">{copy.defaultBadge}</Pill> : null}
                        {config.purpose === "draft_generation_fallback" ? (
                          <Pill $tone="accent">{copy.fallbackBadge}</Pill>
                        ) : null}
                        <Pill>{config.isEnabled ? copy.enabledBadge : "Disabled"}</Pill>
                        <Pill
                          $tone={
                            config.credentialState === "stored"
                              ? "primary"
                              : config.credentialState === "environment"
                                ? undefined
                                : "danger"
                          }
                        >
                          {formatCredentialBadge(copy, config.credentialState)}
                        </Pill>
                      </BadgeRow>
                    </ConfigMeta>
                    <ToggleGroup>
                      <Toggle>
                        <Radio
                          checked={config.isDefault}
                          name="default-provider-config"
                          onChange={() => updateDraftConfig(config.id, { isDefault: true })}
                          type="radio"
                        />
                        {copy.defaultLabel}
                      </Toggle>
                      <Toggle>
                        <Checkbox
                          checked={config.isEnabled}
                          onChange={(event) =>
                            updateDraftConfig(config.id, {
                              isEnabled: event.target.checked,
                            })
                          }
                          type="checkbox"
                        />
                        {copy.enabledLabel}
                      </Toggle>
                    </ToggleGroup>
                  </ConfigHeader>

                  <FieldGrid>
                    <Field>
                      <FieldLabel>{copy.providerLabel}</FieldLabel>
                      <Select
                        onChange={(event) =>
                          updateDraftConfig(config.id, {
                            provider: event.target.value,
                          })
                        }
                        value={config.provider}
                      >
                        {providerOptions.map((providerOption) => (
                          <option key={providerOption.value} value={providerOption.value}>
                            {providerOption.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>{copy.modelLabel}</FieldLabel>
                      <Input
                        onChange={(event) =>
                          updateDraftConfig(config.id, {
                            model: event.target.value,
                          })
                        }
                        value={config.model}
                      />
                    </Field>
                  </FieldGrid>

                  <FieldGrid>
                    <Field>
                      <FieldLabel>{copy.purposeLabel}</FieldLabel>
                      <Select
                        onChange={(event) =>
                          updateDraftConfig(config.id, {
                            purpose: event.target.value,
                          })
                        }
                        value={config.purpose}
                      >
                        <option value="draft_generation">{copy.purposePrimary}</option>
                        <option value="draft_generation_fallback">{copy.purposeFallback}</option>
                      </Select>
                      <SmallText>{copy.purposeHint}</SmallText>
                    </Field>
                    <CredentialCard>
                      <FieldLabel>{copy.credentialTitle}</FieldLabel>
                      <BadgeRow>
                        <Pill
                          $tone={
                            config.credentialState === "stored"
                              ? "primary"
                              : config.credentialState === "environment"
                                ? undefined
                                : "danger"
                          }
                        >
                          {formatCredentialBadge(copy, config.credentialState)}
                        </Pill>
                        <Pill>{formatPurposeLabel(copy, config.purpose)}</Pill>
                      </BadgeRow>
                      <SmallText>{config.credentialLabel}</SmallText>
                      <SmallText>{formatCredentialDescription(copy, config.credentialState)}</SmallText>
                      <SmallText>
                        {copy.updatedAtLabel}: {formatTimestamp(config.updatedAt)}
                      </SmallText>
                    </CredentialCard>
                  </FieldGrid>

                  <Field>
                    <FieldLabel>{copy.apiKeyLabel}</FieldLabel>
                    <Input
                      autoComplete="new-password"
                      onChange={(event) =>
                        updateDraftConfig(config.id, {
                          apiKey: event.target.value,
                          clearApiKey: event.target.value ? false : config.clearApiKey,
                        })
                      }
                      placeholder={copy.apiKeyPlaceholder}
                      type="password"
                      value={config.apiKey}
                    />
                    <SmallText>{copy.apiKeyHint}</SmallText>
                  </Field>

                  {config.hasStoredApiKey ? (
                    <Toggle>
                      <Checkbox
                        checked={config.clearApiKey}
                        disabled={Boolean(config.apiKey)}
                        onChange={(event) =>
                          updateDraftConfig(config.id, {
                            clearApiKey: event.target.checked,
                          })
                        }
                        type="checkbox"
                      />
                      Remove stored key
                    </Toggle>
                  ) : null}
                </ConfigCard>
              ))}

              <ActionRow>
                <SmallText>
                  {dirtyCount ? `${dirtyCount} ${copy.dirtyLabel}` : copy.noPendingChanges}
                </SmallText>
                <SaveButton disabled={isBusy} type="submit">
                  {isBusy ? copy.saveWorking : copy.saveAction}
                </SaveButton>
              </ActionRow>
            </Form>
          </Card>
        </Stack>
      </Layout>
    </Page>
  );
}
