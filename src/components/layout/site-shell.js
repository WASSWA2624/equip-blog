"use client";

import Link from "next/link";
import styled from "styled-components";

const Shell = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
`;

const Header = styled.header`
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 20;
`;

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1100px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const BrandBlock = styled.div`
  display: grid;
  gap: 0.15rem;
`;

const Brand = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.35rem;
  font-weight: 700;
`;

const Tagline = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)`
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  padding: 0.45rem 0.8rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const Footer = styled.footer`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 auto;
  max-width: 1100px;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  width: 100%;
`;

const publicNav = [
  { key: "home", suffix: "" },
  { key: "blog", suffix: "/blog" },
  { key: "search", suffix: "/search" },
  { key: "about", suffix: "/about" },
  { key: "contact", suffix: "/contact" },
];

export default function SiteShell({ children, locale, messages }) {
  return (
    <Shell>
      <Header>
        <HeaderInner>
          <BrandBlock>
            <Brand href={`/${locale}`}>{messages.site.title}</Brand>
            <Tagline>{messages.site.tagline}</Tagline>
          </BrandBlock>
          <Nav aria-label="Public navigation">
            {publicNav.map((item) => (
              <NavLink href={`/${locale}${item.suffix}`} key={item.key}>
                {messages.site.navigation[item.key]}
              </NavLink>
            ))}
          </Nav>
        </HeaderInner>
      </Header>
      {children}
      <Footer>
        {messages.site.footer} | Active locale: <strong>{locale}</strong>
      </Footer>
    </Shell>
  );
}
