"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import SearchableSelect from "@/components/common/searchable-select";

const purposeOrder = Object.freeze({
  draft_generation: 1,
  draft_generation_fallback: 2,
});

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1320px;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Hero = styled.section`
  background:
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.18), transparent 38%),
    linear-gradient(135deg, rgba(0, 95, 115, 0.12), rgba(16, 32, 51, 0.03));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 1.05;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.65;
  margin: 0;
  max-width: 920px;
`;

const Layout = styled.section`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1040px) {
    grid-template-columns: minmax(0, 330px) minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  align-content: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
`;

const SidebarStack = styled(Stack)`
  @media (min-width: 1040px) {
    max-height: calc(100vh - 2rem);
    overflow: auto;
    padding-right: 0.15rem;
    position: sticky;
    scrollbar-gutter: stable;
    top: 1rem;
  }
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 20px 60px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;

  &::before {
    background: linear-gradient(90deg, rgba(0, 95, 115, 0.16), rgba(201, 123, 42, 0.12));
    content: "";
    height: 3px;
    inset: 0 0 auto;
    position: absolute;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.02rem;
  margin: 0;
`;

const SectionTitle = styled.h3`
  font-size: 0.98rem;
  margin: 0;
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.58;
  margin: 0;
  overflow-wrap: anywhere;
`;

const SummaryGrid = styled.div`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
`;

const SummaryStat = styled.div`
  background: rgba(247, 249, 252, 0.94);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.strong`
  font-size: 1.45rem;
  line-height: 1;
`;

const ProviderChipGrid = styled.div`
  align-content: start;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ProviderChip = styled.span`
  background: rgba(0, 95, 115, 0.08);
  border: 1px solid rgba(0, 95, 115, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.28rem 0.62rem;
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
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const ButtonRow = styled.div`
  align-items: start;
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
  padding: 0.72rem 1.05rem;
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const ConfigList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const ConfigCard = styled.article`
  background: ${({ $enabled }) =>
    $enabled ? "rgba(255, 255, 255, 0.98)" : "rgba(247, 249, 252, 0.95)"};
  border: 1px solid
    ${({ $enabled, theme }) => ($enabled ? theme.colors.border : "rgba(88, 97, 116, 0.28)")};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ConfigHeader = styled.div`
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
`;

const ConfigMeta = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: min(100%, 26rem);
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
          : $tone === "success"
            ? "rgba(21, 115, 71, 0.12)"
            : "rgba(88, 97, 116, 0.12)"};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.26rem 0.68rem;
`;

const ToggleGroup = styled.div`
  align-items: start;
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
  height: 1rem;
  width: 1rem;
`;

const Radio = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  height: 1rem;
  width: 1rem;
`;

const FieldGrid = styled.div`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

const FieldLabel = styled.span`
  font-weight: 600;
`;

const Input = styled.input`
  background: white;
  border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-width: 0;
  padding: 0.78rem 0.88rem;
  width: 100%;
`;

const CredentialCard = styled.div`
  background: rgba(247, 249, 252, 0.96);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.md};
`;

const CatalogCard = styled(CredentialCard)`
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetaList = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  min-width: 0;
`;

const MetaRow = styled.div`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  grid-template-columns: minmax(0, 110px) minmax(0, 1fr);
  min-width: 0;
`;

const MetaLabel = styled.dt`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const MetaValue = styled.dd`
  margin: 0;
  overflow-wrap: anywhere;
`;

const ExternalLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 700;
  overflow-wrap: anywhere;
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
    providerLabel: config.providerLabel,
    purpose: config.purpose,
    updatedAt: config.updatedAt,
  };
}

function createNewConfig(index, hasFallbackConfig, defaultProviderValue = "openai") {
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
    provider: defaultProviderValue,
    providerLabel: defaultProviderValue,
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

function formatCatalogBadge(copy, state) {
  if (state === "ready") {
    return copy.catalogReadyBadge;
  }

  if (state === "credential_required") {
    return copy.catalogCredentialBadge;
  }

  if (state === "error") {
    return copy.catalogErrorBadge;
  }

  return copy.catalogIdleBadge;
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
    `${leftConfig.providerLabel || leftConfig.provider}`.localeCompare(
      `${rightConfig.providerLabel || rightConfig.provider}`,
    ) ||
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

function normalizeProviderInput(value) {
  return `${value || ""}`.trim().toLowerCase();
}

function getProviderOption(providerCatalog, providerValue) {
  return providerCatalog.providers.find((provider) => provider.value === providerValue) || null;
}

function buildModelOptions(config, catalogItems) {
  const normalizedCurrentModel = `${config.model || ""}`.trim();
  const options = catalogItems.map((item) => ({
    description: item.label && item.label !== item.id ? item.label : "",
    keywords: [item.label, item.provider],
    label: item.id,
    value: item.id,
  }));

  if (!normalizedCurrentModel) {
    return options;
  }

  const hasCurrentModel = options.some((option) => option.value === normalizedCurrentModel);

  if (hasCurrentModel) {
    return options;
  }

  return [
    {
      badge: "Current",
      description: "Currently configured model id.",
      label: normalizedCurrentModel,
      value: normalizedCurrentModel,
    },
    ...options,
  ];
}

export default function ProviderConfigurationScreen({ copy, initialData }) {
  const suggestionTimersRef = useRef(new Map());
  const providerSuggestionTimerRef = useRef(null);
  const [data, setData] = useState(initialData);
  const [draftConfigs, setDraftConfigs] = useState(() =>
    initialData.configs.map(createDraftConfig),
  );
  const [providerSearchState, setProviderSearchState] = useState(() => ({
    items: initialData.providerCatalog.providers || [],
    loading: false,
    message: "",
  }));
  const [modelCatalogState, setModelCatalogState] = useState({});
  const [notice, setNotice] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const dirtyCount = useMemo(() => getDirtyCount(data, draftConfigs), [data, draftConfigs]);
  const orderedDraftConfigs = useMemo(() => [...draftConfigs].sort(sortConfigs), [draftConfigs]);
  const providerCatalogItems = providerSearchState.items;
  const providerOptions = useMemo(
    () =>
      providerCatalogItems.map((provider) => ({
        description: provider.searchHint,
        keywords: [provider.value, provider.catalogSourceLabel],
        label: provider.label,
        value: provider.value,
      })),
    [providerCatalogItems],
  );
  const purposeOptions = useMemo(
    () => [
      {
        description: "Used for normal draft generation requests.",
        label: copy.purposePrimary,
        value: "draft_generation",
      },
      {
        description: "Used only when the primary generation config fails.",
        label: copy.purposeFallback,
        value: "draft_generation_fallback",
      },
    ],
    [copy.purposeFallback, copy.purposePrimary],
  );

  useEffect(() => {
    const suggestionTimers = suggestionTimersRef.current;

    return () => {
      if (providerSuggestionTimerRef.current) {
        window.clearTimeout(providerSuggestionTimerRef.current);
      }

      for (const timerId of suggestionTimers.values()) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

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

  const requestProviderSuggestions = useCallback(async (query = "") => {
    setProviderSearchState((currentState) => ({
      ...currentState,
      loading: true,
    }));

    try {
      const response = await fetch(
        `/api/providers/catalog?q=${encodeURIComponent(query)}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || copy.catalogLoadErrorPrefix);
      }

      const nextItems = payload.data.providers || [];

      setProviderSearchState({
        items: nextItems,
        loading: false,
        message: nextItems.length ? "" : copy.providerUnknownHint,
      });

      if (!payload.data.query) {
        startTransition(() => {
          setData((currentData) => ({
            ...currentData,
            providerCatalog: {
              ...currentData.providerCatalog,
              providers: nextItems,
              supportedProviderCount:
                payload.data.supportedProviderCount || currentData.providerCatalog.supportedProviderCount,
            },
          }));
        });
      }
    } catch (error) {
      setProviderSearchState((currentState) => ({
        ...currentState,
        loading: false,
        message: `${copy.catalogLoadErrorPrefix}: ${error.message}`,
      }));
    }
  }, [copy.catalogLoadErrorPrefix, copy.providerUnknownHint]);

  const queueProviderSuggestions = useCallback((query = "") => {
    if (providerSuggestionTimerRef.current) {
      window.clearTimeout(providerSuggestionTimerRef.current);
    }

    providerSuggestionTimerRef.current = window.setTimeout(() => {
      requestProviderSuggestions(query);
      providerSuggestionTimerRef.current = null;
    }, 180);
  }, [requestProviderSuggestions]);

  useEffect(() => {
    void requestProviderSuggestions("");
  }, [requestProviderSuggestions]);

  async function requestModelSuggestions(configId, providerValue, query = "", forceRefresh = false) {
    const normalizedProvider = normalizeProviderInput(providerValue);
    const providerOption = getProviderOption(data.providerCatalog, normalizedProvider);

    if (!providerOption) {
      setModelCatalogState((currentState) => ({
        ...currentState,
        [configId]: {
          items: [],
          message: copy.providerUnknownHint,
          syncStatus: "error",
          syncedAt: null,
        },
      }));
      return;
    }

    setModelCatalogState((currentState) => ({
      ...currentState,
      [configId]: {
        ...(currentState[configId] || {}),
        loading: true,
      },
    }));

    try {
      const response = await fetch(
        `/api/providers/catalog?provider=${encodeURIComponent(normalizedProvider)}&q=${encodeURIComponent(
          query,
        )}${forceRefresh ? "&force=1" : ""}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || copy.catalogLoadErrorPrefix);
      }

      setModelCatalogState((currentState) => ({
        ...currentState,
        [configId]: {
          items: payload.data.models || [],
          loading: false,
          message: payload.data.models?.length
            ? `${payload.data.modelCount} ${copy.catalogResultCountLabel}`
            : payload.data.provider.searchHint,
          syncStatus: payload.data.provider.syncStatus,
          syncedAt: payload.data.provider.syncedAt,
        },
      }));
    } catch (error) {
      setModelCatalogState((currentState) => ({
        ...currentState,
        [configId]: {
          items: [],
          loading: false,
          message: `${copy.catalogLoadErrorPrefix}: ${error.message}`,
          syncStatus: "error",
          syncedAt: null,
        },
      }));
    }
  }

  function queueModelSuggestions(configId, providerValue, query = "", forceRefresh = false) {
    const existingTimer = suggestionTimersRef.current.get(configId);

    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timerId = window.setTimeout(() => {
      requestModelSuggestions(configId, providerValue, query, forceRefresh);
      suggestionTimersRef.current.delete(configId);
    }, forceRefresh ? 0 : 180);

    suggestionTimersRef.current.set(configId, timerId);
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
        <SidebarStack>
          <Card>
            <CardTitle>{copy.summaryTitle}</CardTitle>
            <SmallText>{copy.summaryDescription}</SmallText>
            <SummaryGrid>
              <SummaryStat>
                <SmallText>{copy.supportedProviderCountLabel}</SmallText>
                <StatValue>{data.providerCatalog.supportedProviderCount}</StatValue>
              </SummaryStat>
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
            </SummaryGrid>
          </Card>

          <Card>
            <CardTitle>{copy.catalogSectionTitle}</CardTitle>
            <SmallText>{copy.catalogDescription}</SmallText>
            <ProviderChipGrid>
              {data.providerCatalog.providers.map((provider) => (
                <ProviderChip key={provider.value}>{provider.label}</ProviderChip>
              ))}
            </ProviderChipGrid>
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
        </SidebarStack>

        <Stack>
          <Card>
            <ActionRow>
              <div>
                <CardTitle>{copy.title}</CardTitle>
                <SmallText>
                  {dirtyCount ? `${dirtyCount} ${copy.dirtyLabel}` : copy.noPendingChanges}
                </SmallText>
              </div>
              <ButtonRow>
                <Button $tone="secondary" onClick={handleAddConfig} type="button">
                  {copy.addAction}
                </Button>
              </ButtonRow>
            </ActionRow>

            {notice ? <StatusBanner $tone={notice.kind}>{notice.message}</StatusBanner> : null}

            <Form onSubmit={handleSave}>
              <ConfigList>
                {orderedDraftConfigs.map((config) => {
                  const providerOption = getProviderOption(data.providerCatalog, config.provider);
                  const catalogState = modelCatalogState[config.id] || null;
                  const catalogItems = catalogState?.items || [];
                  const modelOptions = buildModelOptions(config, catalogItems);
                  const resolvedProviderLabel =
                    providerOption?.label || config.providerLabel || config.provider || copy.newConfigLabel;

                  return (
                    <ConfigCard $enabled={config.isEnabled} key={config.id}>
                      <ConfigHeader>
                        <ConfigMeta>
                          <ConfigTitle>
                            {config.model ? `${resolvedProviderLabel} / ${config.model}` : copy.newConfigLabel}
                          </ConfigTitle>
                          <BadgeRow>
                            {config.isDefault ? <Pill $tone="primary">{copy.defaultBadge}</Pill> : null}
                            {config.purpose === "draft_generation_fallback" ? (
                              <Pill $tone="accent">{copy.fallbackBadge}</Pill>
                            ) : null}
                            <Pill>{config.isEnabled ? copy.enabledBadge : copy.disabledBadge}</Pill>
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
                        <Field as="div">
                          <FieldLabel>{copy.providerLabel}</FieldLabel>
                          <SearchableSelect
                            ariaLabel={copy.providerLabel}
                            emptyMessage={providerSearchState.message || copy.providerUnknownHint}
                            loading={Boolean(providerSearchState.loading && !providerOptions.length)}
                            loadingMessage={copy.catalogLoading}
                            onChange={(nextValue) => {
                              const nextProviderValue = normalizeProviderInput(nextValue);
                              const nextProviderOption = getProviderOption(
                                data.providerCatalog,
                                nextProviderValue,
                              );

                              updateDraftConfig(config.id, {
                                model: nextProviderValue === config.provider ? config.model : "",
                                provider: nextProviderValue,
                                providerLabel: nextProviderOption?.label || nextProviderValue,
                              });
                              setModelCatalogState((currentState) => ({
                                ...currentState,
                                [config.id]: undefined,
                              }));

                              if (nextProviderOption) {
                                queueModelSuggestions(config.id, nextProviderValue, "");
                              }
                            }}
                            onOpen={() => queueProviderSuggestions("")}
                            onSearchChange={(nextQuery) => queueProviderSuggestions(nextQuery)}
                            placeholder={copy.providerPlaceholder}
                            options={providerOptions}
                            searchPlaceholder="Search AI providers"
                            value={config.provider}
                          />
                          {providerOption ? (
                            <SmallText>
                              {providerOption.label} - {providerOption.catalogSourceLabel}
                            </SmallText>
                          ) : (
                            <SmallText>{copy.providerUnknownHint}</SmallText>
                          )}
                          {providerOption?.docsUrl ? (
                            <ExternalLink href={providerOption.docsUrl} rel="noreferrer" target="_blank">
                              {copy.openCatalogSourceAction}
                            </ExternalLink>
                          ) : null}
                        </Field>

                        <Field as="div">
                          <FieldLabel>{copy.modelLabel}</FieldLabel>
                          <SearchableSelect
                            ariaLabel={copy.modelLabel}
                            disabled={!providerOption}
                            emptyMessage={
                              catalogState?.message || providerOption?.searchHint || copy.modelSearchHint
                            }
                            loading={Boolean(catalogState?.loading && !modelOptions.length)}
                            loadingMessage={copy.catalogLoading}
                            onChange={(nextValue) =>
                              updateDraftConfig(config.id, {
                                model: nextValue,
                              })
                            }
                            onOpen={() => {
                              if (providerOption) {
                                queueModelSuggestions(config.id, config.provider, config.model || "");
                              }
                            }}
                            onSearchChange={(nextQuery) => {
                              if (providerOption) {
                                queueModelSuggestions(config.id, config.provider, nextQuery);
                              }
                            }}
                            options={modelOptions}
                            placeholder={copy.modelPlaceholder}
                            searchPlaceholder="Search provider models"
                            value={config.model}
                          />
                          <SmallText>{copy.modelSearchHint}</SmallText>
                        </Field>
                      </FieldGrid>

                      <FieldGrid>
                        <Field as="div">
                          <FieldLabel>{copy.purposeLabel}</FieldLabel>
                          <SearchableSelect
                            ariaLabel={copy.purposeLabel}
                            onChange={(nextValue) =>
                              updateDraftConfig(config.id, {
                                purpose: nextValue,
                              })
                            }
                            options={purposeOptions}
                            placeholder={copy.purposeLabel}
                            searchPlaceholder="Search provider purposes"
                            value={config.purpose}
                          />
                          <SmallText>{copy.purposeHint}</SmallText>
                        </Field>

                        <CatalogCard>
                          <ActionRow>
                            <SectionTitle>{copy.catalogStatusTitle}</SectionTitle>
                            <Button
                              $tone="secondary"
                              disabled={!providerOption || catalogState?.loading}
                              onClick={() =>
                                queueModelSuggestions(config.id, config.provider, config.model, true)
                              }
                              type="button"
                            >
                              {catalogState?.loading ? copy.catalogRefreshWorking : copy.catalogRefreshAction}
                            </Button>
                          </ActionRow>
                          <BadgeRow>
                            <Pill
                              $tone={
                                catalogState?.syncStatus === "ready"
                                  ? "success"
                                  : catalogState?.syncStatus === "error"
                                    ? "danger"
                                    : catalogState?.syncStatus === "credential_required"
                                      ? "accent"
                                      : undefined
                              }
                            >
                              {formatCatalogBadge(copy, catalogState?.syncStatus || providerOption?.syncStatus)}
                            </Pill>
                            {providerOption ? <Pill>{providerOption.catalogSourceLabel}</Pill> : null}
                          </BadgeRow>
                          <MetaList>
                            <MetaRow>
                              <MetaLabel>{copy.catalogResultsLabel}</MetaLabel>
                              <MetaValue>{catalogItems.length || 0}</MetaValue>
                            </MetaRow>
                            <MetaRow>
                              <MetaLabel>{copy.updatedAtLabel}</MetaLabel>
                              <MetaValue>{formatTimestamp(catalogState?.syncedAt || providerOption?.syncedAt)}</MetaValue>
                            </MetaRow>
                          </MetaList>
                          <SmallText>
                            {catalogState?.loading
                              ? copy.catalogLoading
                              : catalogState?.message || providerOption?.searchHint || copy.modelSearchHint}
                          </SmallText>
                        </CatalogCard>
                      </FieldGrid>

                      <FieldGrid>
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
                              {copy.clearKeyAction}
                            </Toggle>
                          ) : null}
                        </Field>
                      </FieldGrid>
                    </ConfigCard>
                  );
                })}
              </ConfigList>

              <ActionRow>
                <SmallText>
                  {dirtyCount ? `${dirtyCount} ${copy.dirtyLabel}` : copy.noPendingChanges}
                </SmallText>
                <Button disabled={isBusy} type="submit">
                  {isBusy ? copy.saveWorking : copy.saveAction}
                </Button>
              </ActionRow>
            </Form>
          </Card>
        </Stack>
      </Layout>
    </Page>
  );
}
