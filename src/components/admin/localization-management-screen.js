"use client";

import { startTransition, useEffect, useState } from "react";
import styled from "styled-components";

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
    linear-gradient(135deg, rgba(0, 95, 115, 0.12), rgba(16, 32, 51, 0.02));
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
  font-size: clamp(2rem, 5vw, 3.3rem);
  line-height: 1.05;
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
  max-width: 820px;
`;

const SummaryGrid = styled.section`
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
  background: rgba(255, 255, 255, 0.9);
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

const LocaleGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LocaleButton = styled.button`
  align-items: center;
  background: ${({ $active, theme }) =>
    $active ? "rgba(0, 95, 115, 0.12)" : "rgba(247, 249, 252, 0.95)"};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const LocaleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Pill = styled.span`
  background: ${({ $tone, theme }) =>
    $tone === "active"
      ? "rgba(0, 95, 115, 0.12)"
      : $tone === "default"
        ? "rgba(201, 123, 42, 0.18)"
        : "rgba(88, 97, 116, 0.12)"};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.65rem;
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin: 0;
`;

const StepList = styled.ol`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding-left: 1.2rem;
`;

const PostList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PostButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? "rgba(201, 123, 42, 0.12)" : "rgba(255, 255, 255, 0.96)"};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const PostTitle = styled.strong`
  font-size: 1rem;
`;

const CoverageRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const EditorLayout = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
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
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.8rem 1.3rem;
`;

function formatJsonField(value, fallback) {
  return JSON.stringify(value ?? fallback, null, 2);
}

function createDraftState(editor) {
  if (!editor) {
    return null;
  }

  return {
    contentHtml: editor.translation.contentHtml,
    contentMd: editor.translation.contentMd,
    disclaimer: editor.translation.disclaimer,
    excerpt: editor.translation.excerpt,
    faqJsonText: formatJsonField(editor.translation.faqJson, []),
    structuredContentJsonText: formatJsonField(editor.translation.structuredContentJson, {}),
    title: editor.translation.title,
  };
}

function getTranslationSourceLabel(copy, translationSource) {
  if (translationSource === "stored") {
    return copy.storedTranslation;
  }

  if (translationSource === "default_locale_seed") {
    return copy.seededFromDefaultLocale;
  }

  return copy.noStoredTranslation;
}

function buildLocaleQuery(postId, locale) {
  const params = new URLSearchParams();

  if (postId) {
    params.set("postId", postId);
  }

  if (locale) {
    params.set("locale", locale);
  }

  return params.toString();
}

function parseJsonField(label, value, fallback) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return fallback;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

export default function LocalizationManagementScreen({ copy, initialData }) {
  const [data, setData] = useState(initialData);
  const [draft, setDraft] = useState(() => createDraftState(initialData.editor));
  const [notice, setNotice] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setDraft(createDraftState(data.editor));
  }, [data.editor]);

  async function loadSnapshot(postId, locale) {
    if (!postId || !locale) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/localization?${buildLocaleQuery(postId, locale)}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || copy.selectionErrorPrefix);
      }

      startTransition(() => {
        setData(payload.data);
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message: `${copy.selectionErrorPrefix}: ${error.message}`,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!data.editor || !draft) {
      return;
    }

    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch("/api/localization", {
        body: JSON.stringify({
          contentHtml: draft.contentHtml,
          contentMd: draft.contentMd,
          disclaimer: draft.disclaimer,
          excerpt: draft.excerpt,
          faqJson: parseJsonField(copy.fieldFaqJson, draft.faqJsonText, []),
          locale: data.selection.locale,
          postId: data.selection.postId,
          structuredContentJson: parseJsonField(
            copy.fieldStructuredContentJson,
            draft.structuredContentJsonText,
            {},
          ),
          title: draft.title,
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
        <Stack>
          <Card>
            <CardTitle>{copy.localeRegistryTitle}</CardTitle>
            <LocaleGrid>
              {data.locales.map((locale) => (
                <LocaleButton
                  disabled={!locale.canEdit || !data.selection.postId || isBusy}
                  key={locale.code}
                  onClick={() => loadSnapshot(data.selection.postId, locale.code)}
                  type="button"
                  $active={data.selection.locale === locale.code}
                >
                  <strong>{locale.label}</strong>
                  <LocaleMeta>
                    <Pill $tone={locale.isActive ? "active" : "inactive"}>
                      {locale.isActive ? copy.statusActive : copy.statusInactive}
                    </Pill>
                    {locale.isDefault ? <Pill $tone="default">{copy.statusDefault}</Pill> : null}
                  </LocaleMeta>
                  {!locale.canEdit ? <SmallText>{copy.inactiveLocaleHint}</SmallText> : null}
                </LocaleButton>
              ))}
            </LocaleGrid>
          </Card>
          <Card>
            <CardTitle>{copy.activationGuideTitle}</CardTitle>
            <StepList>
              {copy.activationGuide.map((step) => (
                <SmallText as="li" key={step}>
                  {step}
                </SmallText>
              ))}
            </StepList>
          </Card>
        </Stack>
        <Stack>
          <Card>
            <CardTitle>{copy.postsTitle}</CardTitle>
            {data.posts.length ? (
              <PostList>
                {data.posts.map((post) => (
                  <PostButton
                    key={post.id}
                    onClick={() => loadSnapshot(post.id, data.selection.locale)}
                    type="button"
                    $active={data.selection.postId === post.id}
                  >
                    <PostTitle>{post.equipmentName}</PostTitle>
                    <SmallText>
                      {`/admin/posts/${post.id}`} | slug `{post.slug}` | {post.status}
                    </SmallText>
                    <CoverageRow>
                      {post.coverage.map((coverage) => (
                        <Pill
                          key={`${post.id}-${coverage.locale}`}
                          $tone={coverage.hasTranslation ? "active" : "inactive"}
                        >
                          {coverage.locale}: {coverage.hasTranslation ? "saved" : "missing"}
                        </Pill>
                      ))}
                    </CoverageRow>
                  </PostButton>
                ))}
              </PostList>
            ) : (
              <SmallText>{copy.emptyPosts}</SmallText>
            )}
          </Card>
          <Card>
            <CardTitle>{copy.editorTitle}</CardTitle>
            <SmallText>{copy.editorDescription}</SmallText>
            {notice ? <StatusBanner $tone={notice.kind}>{notice.message}</StatusBanner> : null}
            {!data.editor || !draft ? (
              <SmallText>{copy.emptyPosts}</SmallText>
            ) : (
              <EditorLayout>
                <SmallText>{getTranslationSourceLabel(copy, data.editor.translationSource)}</SmallText>
                <SmallText>
                  Editing `{data.selection.locale}` for `{data.editor.post.equipmentName}`.
                </SmallText>
                <Form onSubmit={handleSave}>
                  <FieldGrid>
                    <Field>
                      <FieldLabel>{copy.fieldTitle}</FieldLabel>
                      <Input
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            title: event.target.value,
                          }))
                        }
                        value={draft.title}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>{copy.fieldExcerpt}</FieldLabel>
                      <Textarea
                        $rows={4}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            excerpt: event.target.value,
                          }))
                        }
                        value={draft.excerpt}
                      />
                    </Field>
                  </FieldGrid>
                  <Field>
                    <FieldLabel>{copy.fieldDisclaimer}</FieldLabel>
                    <Textarea
                      $rows={6}
                      onChange={(event) =>
                        setDraft((currentDraft) => ({
                          ...currentDraft,
                          disclaimer: event.target.value,
                        }))
                      }
                      value={draft.disclaimer}
                    />
                  </Field>
                  <FieldGrid>
                    <Field>
                      <FieldLabel>{copy.fieldMarkdown}</FieldLabel>
                      <Textarea
                        $rows={14}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            contentMd: event.target.value,
                          }))
                        }
                        value={draft.contentMd}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>{copy.fieldHtml}</FieldLabel>
                      <Textarea
                        $rows={14}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            contentHtml: event.target.value,
                          }))
                        }
                        value={draft.contentHtml}
                      />
                    </Field>
                  </FieldGrid>
                  <FieldGrid>
                    <Field>
                      <FieldLabel>{copy.fieldStructuredContentJson}</FieldLabel>
                      <Textarea
                        $rows={12}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            structuredContentJsonText: event.target.value,
                          }))
                        }
                        value={draft.structuredContentJsonText}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>{copy.fieldFaqJson}</FieldLabel>
                      <Textarea
                        $rows={12}
                        onChange={(event) =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            faqJsonText: event.target.value,
                          }))
                        }
                        value={draft.faqJsonText}
                      />
                    </Field>
                  </FieldGrid>
                  <ActionRow>
                    <SmallText>
                      {isBusy
                        ? copy.loadState
                        : getTranslationSourceLabel(copy, data.editor.translationSource)}
                    </SmallText>
                    <SaveButton disabled={isBusy} type="submit">
                      {isBusy ? copy.saveWorking : copy.saveAction}
                    </SaveButton>
                  </ActionRow>
                </Form>
              </EditorLayout>
            )}
          </Card>
        </Stack>
      </SummaryGrid>
    </Page>
  );
}
