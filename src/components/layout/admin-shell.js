"use client";

import Link from "next/link";
import styled from "styled-components";

const Shell = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.text};
  color: white;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
`;

const BrandBlock = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const Title = styled(Link)`
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)`
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: white;
  padding: 0.45rem 0.8rem;
`;

const Footer = styled.footer`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  width: 100%;
`;

const adminNav = [
  { key: "dashboard", href: "/admin" },
  { key: "generate", href: "/admin/generate" },
  { key: "drafts", href: "/admin/posts/drafts" },
  { key: "published", href: "/admin/posts/published" },
  { key: "comments", href: "/admin/comments" },
  { key: "media", href: "/admin/media" },
];

export default function AdminShell({ children, messages }) {
  return (
    <Shell>
      <Header>
        <HeaderInner>
          <BrandBlock>
            <Title href="/admin">{messages.admin.title}</Title>
            <Description>{messages.admin.description}</Description>
          </BrandBlock>
          <Nav aria-label="Admin navigation">
            {adminNav.map((item) => (
              <NavLink href={item.href} key={item.key}>
                {messages.admin.navigation[item.key]}
              </NavLink>
            ))}
          </Nav>
        </HeaderInner>
      </Header>
      {children}
      <Footer>{messages.admin.footer}</Footer>
    </Shell>
  );
}
