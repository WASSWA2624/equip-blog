"use client";

import { useState } from "react";
import styled from "styled-components";

const Panel = styled.section`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.1), transparent 56%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 18px;
  box-shadow:
    0 24px 54px rgba(22, 40, 64, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  padding: clamp(1rem, 2.6vw, 1.3rem);
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const SectionTitle = styled.h2`
  color: #16243b;
  font-size: clamp(1.15rem, 3vw, 1.35rem);
  letter-spacing: -0.04em;
  line-height: 1.08;
  margin: 0;
`;

const SectionDescription = styled.p`
  color: rgba(72, 84, 108, 0.92);
  font-size: 0.96rem;
  line-height: 1.54;
  margin: 0;
`;

const ShareButtonRow = styled.div`
  display: grid;
  gap: 0.7rem;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ShareLink = styled.a`
  align-items: center;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(16, 32, 51, 0.1);
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(19, 34, 58, 0.04);
  color: #173454;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-height: 48px;
  padding: 0.65rem 0.9rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: rgba(36, 75, 115, 0.18);
    box-shadow: 0 18px 34px rgba(19, 34, 58, 0.08);
    transform: translateY(-1px);
  }
`;

const ShareButton = styled.button`
  background: ${({ $copied }) =>
    $copied ? "linear-gradient(180deg, #274d74, #1f3e5e)" : "rgba(255, 255, 255, 0.78)"};
  border: 1px solid
    ${({ $copied }) => ($copied ? "rgba(31, 62, 94, 0.24)" : "rgba(16, 32, 51, 0.1)")};
  border-radius: 12px;
  box-shadow: ${({ $copied }) =>
    $copied ? "0 18px 36px rgba(31, 62, 94, 0.18)" : "0 12px 26px rgba(19, 34, 58, 0.04)"};
  color: ${({ $copied }) => ($copied ? "#fff" : "#173454")};
  cursor: pointer;
  font-weight: 800;
  min-height: 48px;
  padding: 0.65rem 0.9rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    transform: translateY(-1px);
  }
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
        <ShareButton $copied={copied} onClick={handleCopyLink} type="button">
          {copied ? copy.copiedLink : copy.copyLink}
        </ShareButton>
      </ShareButtonRow>
    </Panel>
  );
}
