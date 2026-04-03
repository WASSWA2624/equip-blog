"use client";

import { startTransition, useEffect, useState } from "react";
import styled from "styled-components";

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

function buildSnapshotUrl({ commentId, query, status }) {
  const params = new URLSearchParams();

  if (commentId) {
    params.set("commentId", commentId);
  }

  if (query) {
    params.set("query", query);
  }

  if (status) {
    params.set("status", status);
  }

  const suffix = params.toString();

  return suffix ? `/api/comments?${suffix}` : "/api/comments";
}

function statusTone(status) {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "SPAM" || status === "REJECTED") {
    return "danger";
  }

  return "neutral";
}

function getModerationStatusForAction(actionKind) {
  if (actionKind === "approve") {
    return "APPROVED";
  }

  if (actionKind === "reject") {
    return "REJECTED";
  }

  if (actionKind === "spam") {
    return "SPAM";
  }

  return "PENDING";
}

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1480px;
  padding: clamp(1rem, 2vw, 2rem);
`;

const Hero = styled.section`
  background:
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.2), transparent 40%),
    linear-gradient(135deg, rgba(0, 95, 115, 0.12), rgba(16, 32, 51, 0.03));
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: clamp(1.2rem, 2.2vw, 2rem);
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

const SummaryGrid = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
`;

const SummaryCard = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 18px 50px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SummaryValue = styled.strong`
  font-size: 2rem;
  line-height: 1;
`;

const SmallText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin: 0;
  overflow-wrap: anywhere;
`;

const Layout = styled.section`
  align-items: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1240px) {
    grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  align-content: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
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
  font-size: clamp(1.05rem, 1vw, 1.2rem);
  line-height: 1.15;
  margin: 0;
`;

const List = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const ListButton = styled.button`
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(180deg, rgba(0, 95, 115, 0.12), rgba(0, 95, 115, 0.08))"
      : "rgba(255, 255, 255, 0.98)"};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 18px 34px rgba(16, 32, 51, 0.08);
    transform: translateY(-1px);
  }
`;

const ListTitle = styled.strong`
  font-size: 1rem;
  overflow-wrap: anywhere;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Pill = styled.span`
  background: ${({ $tone, theme }) =>
    $tone === "success"
      ? "rgba(21, 115, 71, 0.14)"
      : $tone === "danger"
        ? "rgba(180, 35, 24, 0.12)"
        : "rgba(0, 95, 115, 0.12)"};
  border-radius: 999px;
  color: ${({ $tone, theme }) =>
    $tone === "success"
      ? theme.colors.success
      : $tone === "danger"
        ? theme.colors.danger
        : theme.colors.primary};
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.34rem 0.72rem;
`;

const StatusBanner = styled.div`
  background: ${({ $tone }) =>
    $tone === "success" ? "rgba(21, 115, 71, 0.12)" : "rgba(180, 35, 24, 0.12)"};
  border: 1px solid
    ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;

  &::before {
    background: ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
    border-radius: 999px;
    content: "";
    inset: 0 auto 0 0;
    position: absolute;
    width: 4px;
  }
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const FilterGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
`;

const Field = styled.label`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

const FieldLabel = styled.span`
  font-weight: 700;
`;

const Input = styled.input`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-width: 0;
  padding: 0.82rem 0.92rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(0, 95, 115, 0.12);
    outline: none;
  }
`;

const Select = styled.select`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-width: 0;
  padding: 0.82rem 0.92rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(0, 95, 115, 0.12);
    outline: none;
  }
`;

const Textarea = styled.textarea`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-height: 8.5rem;
  min-width: 0;
  padding: 0.82rem 0.92rem;
  resize: vertical;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(0, 95, 115, 0.12);
    outline: none;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 999px;
  color: white;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font: inherit;
  font-weight: 700;
  min-height: 44px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  padding: 0.82rem 1.35rem;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    box-shadow: ${({ disabled }) =>
      disabled ? "none" : "0 16px 28px rgba(0, 95, 115, 0.22)"};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }
`;

const SecondaryButton = styled.button`
  background: rgba(247, 249, 252, 0.96);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  min-height: 44px;
  padding: 0.82rem 1.1rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 14px 28px rgba(16, 32, 51, 0.08);
    transform: translateY(-1px);
  }
`;

const DangerButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.colors.danger};
`;

const MetaGrid = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
`;

const MetaItem = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetaTerm = styled.dt`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
`;

const MetaValue = styled.dd`
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const EventList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const EventCard = styled.div`
  background: rgba(247, 249, 252, 0.92);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
`;

const EventTitle = styled.strong`
  font-size: 0.96rem;
`;

const StatusActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModerationButton = styled.button`
  background: ${({ $tone, theme }) =>
    $tone === "success"
      ? theme.colors.success
      : $tone === "danger"
        ? theme.colors.danger
        : $tone === "warning"
          ? "#a16207"
          : theme.colors.primary};
  border: none;
  border-radius: 999px;
  color: white;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font: inherit;
  font-weight: 700;
  min-height: 44px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  padding: 0.78rem 1.05rem;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    box-shadow: ${({ disabled }) =>
      disabled ? "none" : "0 16px 28px rgba(16, 32, 51, 0.14)"};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }
`;

const StickyCard = styled(Card)`
  @media (min-width: 1240px) {
    position: sticky;
    top: 1rem;
  }
`;

export default function CommentModerationScreen({ copy, initialData }) {
  const resolvedCopy = {
    actionErrorPrefix: "Unable to update comment moderation",
    actionWorking: "Saving moderation update...",
    allStatusLabel: "All statuses",
    approveAction: "Approve",
    approveSuccess: "Comment approved.",
    approvedCountLabel: "Approved",
    description:
      "Review guest comments, filter the moderation queue, and keep action history visible for every decision.",
    detailDescription:
      "The selected comment shows its current status, related post, reply context, and moderation history.",
    detailTitle: "Comment details",
    emailLabel: "Email",
    emptyState: "No comments match the current filter.",
    eyebrow: "Comments moderation",
    filteredCountLabel: "In view",
    historyEmpty: "No moderation events are recorded for this comment yet.",
    historyTitle: "Moderation history",
    listDescription:
      "Filter the queue by status or search by commenter, body text, email, or post title.",
    listTitle: "Moderation queue",
    loadErrorPrefix: "Unable to load comments moderation data",
    moderationNotesHint:
      "Notes stay attached to the moderation event so future reviewers can see why a decision was made.",
    moderationNotesLabel: "Moderation notes",
    noSelection:
      "Select a comment from the moderation queue to inspect its history and take action.",
    pendingCountLabel: "Pending",
    postLabel: "Post",
    queryLabel: "Search comments",
    queryPlaceholder: "Search by commenter, body, email, or post",
    rejectAction: "Reject",
    rejectSuccess: "Comment rejected.",
    rejectedCountLabel: "Rejected",
    removeAction: "Remove",
    removeConfirmation:
      "Remove this comment from public display and record the moderation action?",
    removeSuccess: "Comment removed from public display.",
    replyContextLabel: "Reply context",
    replyTypeLabel: "Reply",
    resetFiltersAction: "Reset filters",
    searchAction: "Apply filters",
    spamAction: "Mark as spam",
    spamCountLabel: "Spam",
    spamSuccess: "Comment marked as spam.",
    statusFilterLabel: "Status filter",
    submittedAtLabel: "Submitted",
    title: "Moderate comments",
    topLevelTypeLabel: "Top-level",
    totalCountLabel: "Total comments",
    typeLabel: "Comment type",
    updatedAtLabel: "Updated",
    userAgentLabel: "User agent",
    ...copy,
  };
  const [data, setData] = useState(initialData);
  const [queryDraft, setQueryDraft] = useState(initialData.filters.query || "");
  const [statusDraft, setStatusDraft] = useState(initialData.filters.status || "PENDING");
  const [notesDraft, setNotesDraft] = useState("");
  const [notice, setNotice] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setNotesDraft("");
  }, [data.selection.commentId]);

  async function loadSnapshot({
    commentId = data.selection.commentId,
    query = queryDraft,
    status = statusDraft,
  } = {}) {
    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch(
        buildSnapshotUrl({
          commentId,
          query,
          status,
        }),
        {
          cache: "no-store",
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || resolvedCopy.loadErrorPrefix);
      }

      startTransition(() => {
        setData(payload.data);
        setQueryDraft(payload.data.filters.query || "");
        setStatusDraft(payload.data.filters.status || "PENDING");
      });
      return true;
    } catch (error) {
      setNotice({
        message: `${resolvedCopy.loadErrorPrefix}: ${error.message}`,
        tone: "error",
      });
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmitFilters(event) {
    event.preventDefault();
    await loadSnapshot({
      commentId: data.selection.commentId,
      query: queryDraft,
      status: statusDraft,
    });
  }

  async function handleResetFilters() {
    setQueryDraft("");
    setStatusDraft("PENDING");
    await loadSnapshot({
      commentId: null,
      query: "",
      status: "PENDING",
    });
  }

  async function handleSelectComment(commentId) {
    await loadSnapshot({
      commentId,
      query: queryDraft,
      status: statusDraft,
    });
  }

  async function handleAction(actionKind) {
    const selectedComment = data.editor.comment;

    if (!selectedComment) {
      return;
    }

    if (
      actionKind === "remove" &&
      !window.confirm(resolvedCopy.removeConfirmation)
    ) {
      return;
    }

    const requestInit =
      actionKind === "remove"
        ? {
            body: JSON.stringify({
              notes: notesDraft,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "DELETE",
          }
        : {
            body: JSON.stringify({
              moderationStatus: getModerationStatusForAction(actionKind),
              notes: notesDraft,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "PATCH",
          };

    setIsBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/comments/${selectedComment.id}`, requestInit);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || resolvedCopy.actionErrorPrefix);
      }

      const didReload = await loadSnapshot({
        commentId: selectedComment.id,
        query: queryDraft,
        status: statusDraft,
      });

      if (!didReload) {
        return;
      }

      setNotice({
        message:
          actionKind === "approve"
            ? resolvedCopy.approveSuccess
            : actionKind === "reject"
              ? resolvedCopy.rejectSuccess
              : actionKind === "spam"
                ? resolvedCopy.spamSuccess
                : resolvedCopy.removeSuccess,
        tone: "success",
      });
    } catch (error) {
      setNotice({
        message: `${resolvedCopy.actionErrorPrefix}: ${error.message}`,
        tone: "error",
      });
    } finally {
      setIsBusy(false);
    }
  }

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
          <SummaryValue>{data.summary.pendingCount}</SummaryValue>
          <SmallText>{resolvedCopy.pendingCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.approvedCount}</SummaryValue>
          <SmallText>{resolvedCopy.approvedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.rejectedCount}</SummaryValue>
          <SmallText>{resolvedCopy.rejectedCountLabel}</SmallText>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{data.summary.spamCount}</SummaryValue>
          <SmallText>{resolvedCopy.spamCountLabel}</SmallText>
        </SummaryCard>
      </SummaryGrid>

      <Layout>
        <Stack>
          <StickyCard>
            <CardTitle>{resolvedCopy.listTitle}</CardTitle>
            <SmallText>{resolvedCopy.listDescription}</SmallText>
            {notice ? <StatusBanner $tone={notice.tone}>{notice.message}</StatusBanner> : null}
            <Form onSubmit={handleSubmitFilters}>
              <FilterGrid>
                <Field>
                  <FieldLabel>{resolvedCopy.queryLabel}</FieldLabel>
                  <Input
                    onChange={(event) => setQueryDraft(event.target.value)}
                    placeholder={resolvedCopy.queryPlaceholder}
                    value={queryDraft}
                  />
                </Field>
                <Field>
                  <FieldLabel>{resolvedCopy.statusFilterLabel}</FieldLabel>
                  <Select
                    onChange={(event) => setStatusDraft(event.target.value)}
                    value={statusDraft}
                  >
                    <option value="ALL">{resolvedCopy.allStatusLabel}</option>
                    <option value="PENDING">{resolvedCopy.pendingCountLabel}</option>
                    <option value="APPROVED">{resolvedCopy.approvedCountLabel}</option>
                    <option value="REJECTED">{resolvedCopy.rejectedCountLabel}</option>
                    <option value="SPAM">{resolvedCopy.spamCountLabel}</option>
                  </Select>
                </Field>
              </FilterGrid>
              <ButtonRow>
                <PrimaryButton disabled={isBusy} type="submit">
                  {isBusy ? resolvedCopy.actionWorking : resolvedCopy.searchAction}
                </PrimaryButton>
                <SecondaryButton onClick={handleResetFilters} type="button">
                  {resolvedCopy.resetFiltersAction}
                </SecondaryButton>
              </ButtonRow>
              <SmallText>
                {resolvedCopy.filteredCountLabel}: {data.summary.filteredCount}
              </SmallText>
            </Form>

            {data.comments.length ? (
              <List>
                {data.comments.map((comment) => (
                  <ListButton
                    key={comment.id}
                    onClick={() => handleSelectComment(comment.id)}
                    type="button"
                    $active={data.selection.commentId === comment.id}
                  >
                    <ListTitle>{comment.name}</ListTitle>
                    <SmallText>{comment.bodyPreview}</SmallText>
                    <SmallText>{comment.post.title}</SmallText>
                    <BadgeRow>
                      <Pill $tone={statusTone(comment.status)}>{comment.status}</Pill>
                      <Pill>{comment.isReply ? resolvedCopy.replyTypeLabel : resolvedCopy.topLevelTypeLabel}</Pill>
                      {comment.parentName ? <Pill>{comment.parentName}</Pill> : null}
                    </BadgeRow>
                    <SmallText>{formatDate(comment.createdAt)}</SmallText>
                  </ListButton>
                ))}
              </List>
            ) : (
              <SmallText>{resolvedCopy.emptyState}</SmallText>
            )}
          </StickyCard>
        </Stack>

        <Stack>
          <Card>
            <CardTitle>{resolvedCopy.detailTitle}</CardTitle>
            <SmallText>{resolvedCopy.detailDescription}</SmallText>

            {data.editor.comment ? (
              <>
                <MetaGrid>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.postLabel}</MetaTerm>
                    <MetaValue>{data.editor.comment.post.title}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.typeLabel}</MetaTerm>
                    <MetaValue>
                      {data.editor.comment.parent
                        ? resolvedCopy.replyTypeLabel
                        : resolvedCopy.topLevelTypeLabel}
                    </MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.emailLabel}</MetaTerm>
                    <MetaValue>{data.editor.comment.email || "N/A"}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.submittedAtLabel}</MetaTerm>
                    <MetaValue>{formatDate(data.editor.comment.createdAt)}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.updatedAtLabel}</MetaTerm>
                    <MetaValue>{formatDate(data.editor.comment.updatedAt)}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.userAgentLabel}</MetaTerm>
                    <MetaValue>{data.editor.comment.userAgent || "N/A"}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.statusFilterLabel}</MetaTerm>
                    <MetaValue>
                      <Pill $tone={statusTone(data.editor.comment.status)}>
                        {data.editor.comment.status}
                      </Pill>
                    </MetaValue>
                  </MetaItem>
                  {data.editor.comment.parent ? (
                    <MetaItem>
                      <MetaTerm>{resolvedCopy.replyContextLabel}</MetaTerm>
                      <MetaValue>{data.editor.comment.parent.body}</MetaValue>
                    </MetaItem>
                  ) : null}
                  <MetaItem>
                    <MetaTerm>{resolvedCopy.commentBodyLabel || "Comment"}</MetaTerm>
                    <MetaValue>{data.editor.comment.body}</MetaValue>
                  </MetaItem>
                </MetaGrid>

                <Field>
                  <FieldLabel>{resolvedCopy.moderationNotesLabel}</FieldLabel>
                  <Textarea
                    onChange={(event) => setNotesDraft(event.target.value)}
                    placeholder={resolvedCopy.moderationNotesHint}
                    value={notesDraft}
                  />
                </Field>

                <StatusActions>
                  <ModerationButton
                    disabled={isBusy}
                    onClick={() => handleAction("approve")}
                    type="button"
                    $tone="success"
                  >
                    {resolvedCopy.approveAction}
                  </ModerationButton>
                  <ModerationButton
                    disabled={isBusy}
                    onClick={() => handleAction("reject")}
                    type="button"
                    $tone="danger"
                  >
                    {resolvedCopy.rejectAction}
                  </ModerationButton>
                  <ModerationButton
                    disabled={isBusy}
                    onClick={() => handleAction("spam")}
                    type="button"
                    $tone="warning"
                  >
                    {resolvedCopy.spamAction}
                  </ModerationButton>
                  <DangerButton
                    disabled={isBusy}
                    onClick={() => handleAction("remove")}
                    type="button"
                  >
                    {resolvedCopy.removeAction}
                  </DangerButton>
                </StatusActions>
              </>
            ) : (
              <SmallText>{resolvedCopy.noSelection}</SmallText>
            )}
          </Card>

          <Card>
            <CardTitle>{resolvedCopy.historyTitle}</CardTitle>
            {data.editor.comment?.moderationEvents.length ? (
              <EventList>
                {data.editor.comment.moderationEvents.map((event) => (
                  <EventCard key={event.id}>
                    <EventTitle>{event.actionLabel}</EventTitle>
                    <SmallText>{event.actorName}</SmallText>
                    <SmallText>{formatDate(event.createdAt)}</SmallText>
                    {event.notes ? <SmallText>{event.notes}</SmallText> : null}
                  </EventCard>
                ))}
              </EventList>
            ) : (
              <SmallText>{resolvedCopy.historyEmpty}</SmallText>
            )}
          </Card>
        </Stack>
      </Layout>
    </Page>
  );
}
