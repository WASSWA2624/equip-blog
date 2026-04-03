"use client";

import { useState } from "react";
import styled from "styled-components";

const Panel = styled.section`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 255, 0.92)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.09), transparent 58%);
  border: 1px solid rgba(16, 32, 51, 0.07);
  border-radius: 22px;
  box-shadow:
    0 18px 40px rgba(22, 40, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  padding: clamp(1rem, 2.6vw, 1.55rem);
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const SectionTitle = styled.h2`
  color: #182742;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  letter-spacing: -0.03em;
  margin: 0;
`;

const SectionDescription = styled.p`
  color: rgba(72, 84, 108, 0.94);
  line-height: 1.68;
  margin: 0;
  max-width: 62ch;
`;

const ShareButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ShareLink = styled.a`
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  display: inline-flex;
  font-weight: 700;
  padding: 0.55rem 0.9rem;
`;

const ShareButton = styled.button`
  background: transparent;
  border: 1px solid rgba(16, 32, 51, 0.12);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  padding: 0.55rem 0.9rem;
`;

export default function ShareActions({ article, copy }) {
  const [copied, setCopied] = useState(false);
  const title = encodeURIComponent(article.title);
  const url = encodeURIComponent(article.url);
  const shareLinks = [
    { href: `https://twitter.com/intent/tweet?text=${title}&url=${url}`, label: "X" },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, label: "Facebook" },
    {
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
      label: "LinkedIn",
    },
    { href: `https://wa.me/?text=${title}%20${url}`, label: "WhatsApp" },
    {
      href: `mailto:?subject=${title}&body=${encodeURIComponent(`${article.title}\n\n${article.url}`)}`,
      label: "Email",
    },
  ];

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(article.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Panel>
      <SectionHeader>
        <SectionTitle>{copy.shareTitle}</SectionTitle>
        <SectionDescription>{copy.shareDescription}</SectionDescription>
      </SectionHeader>
      <ShareButtonRow>
        {shareLinks.map((link) => (
          <ShareLink href={link.href} key={link.label} rel="noreferrer" target="_blank">
            {link.label}
          </ShareLink>
        ))}
        <ShareButton onClick={handleCopyLink} type="button">
          {copied ? copy.copiedLink : copy.copyLink}
        </ShareButton>
      </ShareButtonRow>
    </Panel>
  );
}
