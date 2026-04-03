"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

function formatDateLabel(locale, value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function buildHref(pathname, searchParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null || value === "" || value === false) {
      continue;
    }

    params.set(key, `${value}`);
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function getFieldErrors(payload) {
  return payload?.issues?.fieldErrors || payload?.fieldErrors || {};
}

const Panel = styled.section`
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(0, 95, 115, 0.16), transparent 40%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 22px 80px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 800px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const SectionHeader = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.45rem, 4vw, 2rem);
  margin: 0;
`;

const SectionDescription = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
  margin: 0;
  max-width: 60ch;
`;

const Notice = styled.div`
  background: ${({ $tone }) =>
    $tone === "success" ? "rgba(21, 115, 71, 0.12)" : "rgba(180, 35, 24, 0.12)"};
  border: 1px solid
    ${({ $tone, theme }) => ($tone === "success" ? theme.colors.success : theme.colors.danger)};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FieldGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 720px) {
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
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(16, 32, 51, 0.14);
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-height: 48px;
  padding: 0.8rem 0.95rem;
`;

const Textarea = styled.textarea`
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(16, 32, 51, 0.14);
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  min-height: 140px;
  padding: 0.8rem 0.95rem;
  resize: vertical;
`;

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.9rem;
  margin: 0;
`;

const ButtonRow = styled.div`
  align-items: center;
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
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  padding: 0.82rem 1.35rem;
`;

const SecondaryButton = styled.button`
  background: rgba(247, 249, 252, 0.96);
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  padding: 0.78rem 1.08rem;
`;

const CommentThread = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CommentCard = styled.article`
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`;

const MetaRow = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.88rem;
`;

const CommentText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.72;
  margin: 0;
  white-space: pre-wrap;
`;

const ReplyThread = styled.div`
  border-left: 2px solid rgba(0, 95, 115, 0.12);
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing.md};
`;

const ReplyButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  justify-self: start;
  padding: 0;
`;

const Pager = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const PagerSummary = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const PagerActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PagerButton = styled(Link)`
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  font-weight: 700;
  padding: 0.55rem 0.95rem;
`;

function Pagination({ copy, pagination, pathname }) {
  if (!pagination || pagination.totalItems <= pagination.pageSize) {
    return null;
  }

  return (
    <Pager aria-label="Comment pagination">
      <PagerSummary>
        {copy.commentsPaginationLabel}: {pagination.startItem}-{pagination.endItem} /{" "}
        {pagination.totalItems}
      </PagerSummary>
      <PagerActions>
        {pagination.hasPreviousPage ? (
          <PagerButton
            href={buildHref(pathname, {
              commentsPage: pagination.currentPage - 1,
            })}
          >
            {copy.previousPage}
          </PagerButton>
        ) : null}
        {pagination.hasNextPage ? (
          <PagerButton
            href={buildHref(pathname, {
              commentsPage: pagination.currentPage + 1,
            })}
          >
            {copy.nextPage}
          </PagerButton>
        ) : null}
      </PagerActions>
    </Pager>
  );
}

function createInitialFormState() {
  return {
    body: "",
    captchaAnswer: "",
    email: "",
    name: "",
  };
}

export default function PublicCommentSection({ article, copy, locale }) {
  const resolvedCopy = {
    commentBodyPlaceholder: "Share your question or experience.",
    commentCancelReplyAction: "Cancel reply",
    commentCaptchaLabel: "Captcha challenge",
    commentCaptchaPlaceholder: "Enter the answer",
    commentEmailLabel: "Email (optional)",
    commentEmailPlaceholder: "name@example.com",
    commentNameLabel: "Name",
    commentNamePlaceholder: "Your name",
    commentReplyAction: "Reply",
    commentReplyingToLabel: "Replying to",
    commentsPaginationLabel: "Comments",
    commentSubmitAction: "Submit comment",
    commentSubmitWorking: "Submitting...",
    commentSuccess:
      "Comment submitted. It will appear once an editor approves it.",
    ...copy,
  };
  const [formState, setFormState] = useState(createInitialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [captcha, setCaptcha] = useState(article.comments.form.captcha);

  function handleReplyTo(comment) {
    setReplyTarget({
      id: comment.id,
      name: comment.name,
    });
    setNotice(null);
    window.document.getElementById("public-comment-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCancelReply() {
    setReplyTarget(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setNotice(null);

    try {
      const response = await fetch("/api/comments", {
        body: JSON.stringify({
          body: formState.body,
          captchaAnswer: captcha ? formState.captchaAnswer : undefined,
          captchaToken: captcha?.token,
          email: formState.email,
          name: formState.name,
          parentId: replyTarget?.id || undefined,
          postId: article.comments.form.postId,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw payload;
      }

      startTransition(() => {
        setFieldErrors({});
        setFormState((currentState) => ({
          ...currentState,
          body: "",
          captchaAnswer: "",
        }));
        setReplyTarget(null);
        setCaptcha(payload.data?.captcha || null);
      });
      setNotice({
        message: payload.data?.message || resolvedCopy.commentSuccess,
        tone: "success",
      });
    } catch (errorPayload) {
      const payload = typeof errorPayload === "object" ? errorPayload : {};

      startTransition(() => {
        setFieldErrors(getFieldErrors(payload));
        setCaptcha(payload.data?.captcha || captcha);
      });
      setNotice({
        message: payload.message || "Unable to submit your comment right now.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel>
      <SectionHeader>
        <SectionTitle>{resolvedCopy.commentsTitle}</SectionTitle>
        <SectionDescription>{resolvedCopy.commentsDescription}</SectionDescription>
      </SectionHeader>

      {notice ? <Notice $tone={notice.tone}>{notice.message}</Notice> : null}

      <Form id="public-comment-form" onSubmit={handleSubmit}>
        <SectionHeader>
          <SectionTitle>{resolvedCopy.commentsFormTitle}</SectionTitle>
          <SectionDescription>{resolvedCopy.commentsFormDescription}</SectionDescription>
        </SectionHeader>

        {replyTarget ? (
          <ButtonRow>
            <HelpText>
              {resolvedCopy.commentReplyingToLabel}: <strong>{replyTarget.name}</strong>
            </HelpText>
            <SecondaryButton onClick={handleCancelReply} type="button">
              {resolvedCopy.commentCancelReplyAction}
            </SecondaryButton>
          </ButtonRow>
        ) : null}

        <FieldGrid>
          <Field>
            <FieldLabel>{resolvedCopy.commentNameLabel}</FieldLabel>
            <Input
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  name: event.target.value,
                }))
              }
              placeholder={resolvedCopy.commentNamePlaceholder}
              value={formState.name}
            />
            {fieldErrors.name?.map((error) => (
              <ErrorText key={error}>{error}</ErrorText>
            ))}
          </Field>
          <Field>
            <FieldLabel>{resolvedCopy.commentEmailLabel}</FieldLabel>
            <Input
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  email: event.target.value,
                }))
              }
              placeholder={resolvedCopy.commentEmailPlaceholder}
              type="email"
              value={formState.email}
            />
            {fieldErrors.email?.map((error) => (
              <ErrorText key={error}>{error}</ErrorText>
            ))}
          </Field>
        </FieldGrid>

        <Field>
          <FieldLabel>{resolvedCopy.commentBodyLabel || "Comment"}</FieldLabel>
          <Textarea
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                body: event.target.value,
              }))
            }
            placeholder={resolvedCopy.commentBodyPlaceholder}
            value={formState.body}
          />
          {fieldErrors.body?.map((error) => (
            <ErrorText key={error}>{error}</ErrorText>
          ))}
        </Field>

        {captcha ? (
          <Field>
            <FieldLabel>{resolvedCopy.commentCaptchaLabel}</FieldLabel>
            <HelpText>{captcha.prompt}</HelpText>
            <Input
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  captchaAnswer: event.target.value,
                }))
              }
              placeholder={resolvedCopy.commentCaptchaPlaceholder}
              value={formState.captchaAnswer}
            />
            {fieldErrors.captchaAnswer?.map((error) => (
              <ErrorText key={error}>{error}</ErrorText>
            ))}
          </Field>
        ) : null}

        <ButtonRow>
          <PrimaryButton disabled={isSubmitting} type="submit">
            {isSubmitting
              ? resolvedCopy.commentSubmitWorking
              : resolvedCopy.commentSubmitAction}
          </PrimaryButton>
        </ButtonRow>
      </Form>

      <SectionDescription>{resolvedCopy.commentsModerationNotice}</SectionDescription>

      {article.comments.items.length ? (
        <CommentThread>
          {article.comments.items.map((comment) => (
            <CommentCard key={comment.id}>
              <MetaRow>
                <strong>{comment.name}</strong>
                {comment.createdAt ? (
                  <span>{formatDateLabel(locale, comment.createdAt)}</span>
                ) : null}
              </MetaRow>
              <CommentText>{comment.body}</CommentText>
              <ReplyButton onClick={() => handleReplyTo(comment)} type="button">
                {resolvedCopy.commentReplyAction}
              </ReplyButton>
              {comment.replies.length ? (
                <ReplyThread>
                  {comment.replies.map((reply) => (
                    <CommentCard key={reply.id}>
                      <MetaRow>
                        <strong>{reply.name}</strong>
                        <span>{resolvedCopy.commentReplyLabel}</span>
                        {reply.createdAt ? (
                          <span>{formatDateLabel(locale, reply.createdAt)}</span>
                        ) : null}
                      </MetaRow>
                      <CommentText>{reply.body}</CommentText>
                    </CommentCard>
                  ))}
                </ReplyThread>
              ) : null}
            </CommentCard>
          ))}
        </CommentThread>
      ) : (
        <SectionDescription>{resolvedCopy.commentsEmpty}</SectionDescription>
      )}

      <Pagination
        copy={resolvedCopy}
        pagination={article.comments.pagination}
        pathname={article.path}
      />
    </Panel>
  );
}
