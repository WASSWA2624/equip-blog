"use client";

import Link from "next/link";
import styled from "styled-components";

import {
  buildLocalizedPath,
  publicNavigationRoutes,
  publicRouteSegments,
} from "@/features/i18n/routing";

const Shell = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0;
  position: sticky;
  top: 0;
  z-index: 20;
`;

const HeaderInner = styled.div`
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 18px 50px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0 auto;
  max-width: 1180px;
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: 900px) {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  }
`;

const BrandBlock = styled.div`
  display: grid;
  gap: 0.18rem;
`;

const Brand = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.01em;
`;

const Tagline = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
  max-width: 48ch;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)`
  background: rgba(0, 95, 115, 0.04);
  border: 1px solid transparent;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  padding: 0.55rem 0.9rem;

  &:hover {
    border-color: rgba(0, 95, 115, 0.12);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const FooterInner = styled.div`
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.muted};
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0 auto;
  max-width: 1180px;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 900px) {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const FooterMeta = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.92rem;
`;

export default function SiteShell({ children, locale, messages }) {
  const legalNavigation = messages.site.legalNavigation || {};

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <BrandBlock>
            <Brand href={buildLocalizedPath(locale, publicRouteSegments.home)}>
              {messages.site.title}
            </Brand>
            <Tagline>{messages.site.tagline}</Tagline>
          </BrandBlock>
          <Nav aria-label="Public navigation">
            {publicNavigationRoutes.map((item) => (
              <NavLink href={buildLocalizedPath(locale, item.segments)} key={item.key}>
                {messages.site.navigation[item.key]}
              </NavLink>
            ))}
          </Nav>
        </HeaderInner>
      </Header>
      {children}
      <Footer>
        <FooterInner>
          <div>
            <div>{messages.site.footer}</div>
            <FooterMeta>Active locale: {locale}</FooterMeta>
          </div>
          <FooterLinks>
            <FooterLink href={buildLocalizedPath(locale, publicRouteSegments.about)}>
              {messages.site.navigation.about}
            </FooterLink>
            <FooterLink href={buildLocalizedPath(locale, publicRouteSegments.contact)}>
              {messages.site.navigation.contact}
            </FooterLink>
            <FooterLink href={buildLocalizedPath(locale, publicRouteSegments.disclaimer)}>
              {legalNavigation.disclaimer || "Disclaimer"}
            </FooterLink>
            <FooterLink href={buildLocalizedPath(locale, publicRouteSegments.privacy)}>
              {legalNavigation.privacy || "Privacy"}
            </FooterLink>
          </FooterLinks>
        </FooterInner>
      </Footer>
    </Shell>
  );
}
