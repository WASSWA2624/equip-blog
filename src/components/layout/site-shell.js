"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

import EquipLogo from "@/components/common/equip-logo";
import {
  buildLocalizedPath,
  publicNavigationRoutes,
  publicRouteSegments,
} from "@/features/i18n/routing";

function normalizePathname(pathname) {
  if (typeof pathname !== "string" || !pathname.trim()) {
    return "/";
  }

  const value = pathname.trim();

  if (value === "/") {
    return value;
  }

  return value.replace(/\/+$/, "") || "/";
}

function isNavigationActive(pathname, href) {
  const currentPath = normalizePathname(pathname);
  const targetPath = normalizePathname(href);

  if (targetPath === "/") {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

const Shell = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 100vh;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} 0;
  position: sticky;
  top: 0;
  z-index: 30;
`;

const HeaderInner = styled.div`
  backdrop-filter: blur(22px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(0, 95, 115, 0.14), transparent 42%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 20px 60px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 auto;
  max-width: 1180px;
  padding: 0.9rem 1rem;

  @media (min-width: 900px) {
    padding: 1rem 1.2rem;
  }
`;

const TopRow = styled.div`
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
`;

const BrandLink = styled(Link)`
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  gap: 0.82rem;
  min-width: 0;
`;

const BrandCopy = styled.span`
  display: grid;
  gap: 0.18rem;
  min-width: 0;
`;

const BrandTitle = styled.span`
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
`;

const Tagline = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.86rem;
  line-height: 1.45;
  margin: 0;
  max-width: 50ch;
`;

const MetaPill = styled.span`
  align-items: center;
  background: rgba(0, 95, 115, 0.08);
  border: 1px solid rgba(0, 95, 115, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.44rem 0.72rem;
  text-transform: uppercase;
  white-space: nowrap;
`;

const NavScroller = styled.div`
  overflow-x: auto;
  padding-bottom: 0.15rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Nav = styled.nav`
  display: inline-flex;
  gap: 0.5rem;
  min-width: max-content;
`;

const NavLink = styled(Link)`
  background: ${({ $active }) => ($active ? "rgba(0, 95, 115, 0.14)" : "rgba(255, 255, 255, 0.7)")};
  border: 1px solid ${({ $active }) => ($active ? "rgba(0, 95, 115, 0.24)" : "rgba(16, 32, 51, 0.08)")};
  border-radius: 999px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text)};
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.5rem 0.84rem;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
  white-space: nowrap;

  &:hover {
    border-color: rgba(0, 95, 115, 0.2);
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const FooterInner = styled.div`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 249, 252, 0.9)),
    radial-gradient(circle at top right, rgba(201, 123, 42, 0.14), transparent 45%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 22px 70px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1180px;
  padding: 1.1rem;

  @media (min-width: 900px) {
    padding: 1.35rem 1.45rem;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.78fr) minmax(0, 0.78fr);
  }
`;

const FooterBrand = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterBrandLink = styled(Link)`
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  gap: 0.82rem;
  justify-self: start;
`;

const FooterBrandCopy = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const FooterBrandTitle = styled.strong`
  font-size: 1rem;
  letter-spacing: 0.01em;
`;

const FooterDescription = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.68;
  margin: 0;
  max-width: 54ch;
`;

const FooterSection = styled.div`
  align-content: start;
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterSectionTitle = styled.strong`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const FooterLinkList = styled.div`
  display: grid;
  gap: 0.72rem;
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterBottom = styled.div`
  align-items: center;
  border-top: 1px solid rgba(16, 32, 51, 0.08);
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const FooterMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterMetaPill = styled.span`
  align-items: center;
  background: rgba(16, 32, 51, 0.04);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.muted};
  display: inline-flex;
  font-size: 0.82rem;
  padding: 0.38rem 0.66rem;
  white-space: nowrap;
`;

export default function SiteShell({ children, locale, messages }) {
  const pathname = usePathname();
  const legalNavigation = messages.site.legalNavigation || {};
  const exploreLinks = [
    { href: buildLocalizedPath(locale, publicRouteSegments.home), label: messages.site.navigation.home },
    { href: buildLocalizedPath(locale, publicRouteSegments.blog), label: messages.site.navigation.blog },
    {
      href: buildLocalizedPath(locale, publicRouteSegments.search),
      label: messages.site.navigation.search,
    },
  ];
  const companyLinks = [
    { href: buildLocalizedPath(locale, publicRouteSegments.about), label: messages.site.navigation.about },
    {
      href: buildLocalizedPath(locale, publicRouteSegments.contact),
      label: messages.site.navigation.contact,
    },
    {
      href: buildLocalizedPath(locale, publicRouteSegments.disclaimer),
      label: legalNavigation.disclaimer || "Disclaimer",
    },
    {
      href: buildLocalizedPath(locale, publicRouteSegments.privacy),
      label: legalNavigation.privacy || "Privacy",
    },
  ];

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <TopRow>
            <BrandLink href={buildLocalizedPath(locale, publicRouteSegments.home)}>
              <EquipLogo size={42} />
              <BrandCopy>
                <BrandTitle>{messages.site.title}</BrandTitle>
                <Tagline>{messages.site.tagline}</Tagline>
              </BrandCopy>
            </BrandLink>
            <MetaPill>Locale {locale.toUpperCase()}</MetaPill>
          </TopRow>

          <NavScroller>
            <Nav aria-label="Public navigation">
              {publicNavigationRoutes.map((item) => {
                const href = buildLocalizedPath(locale, item.segments);
                const isActive = isNavigationActive(pathname, href);

                return (
                  <NavLink
                    aria-current={isActive ? "page" : undefined}
                    href={href}
                    key={item.key}
                    $active={isActive}
                  >
                    {messages.site.navigation[item.key]}
                  </NavLink>
                );
              })}
            </Nav>
          </NavScroller>
        </HeaderInner>
      </Header>

      {children}

      <Footer>
        <FooterInner>
          <FooterGrid>
            <FooterBrand>
              <FooterBrandLink href={buildLocalizedPath(locale, publicRouteSegments.home)}>
                <EquipLogo size={38} />
                <FooterBrandCopy>
                  <FooterBrandTitle>{messages.site.title}</FooterBrandTitle>
                  <span>{messages.site.footer}</span>
                </FooterBrandCopy>
              </FooterBrandLink>
              <FooterDescription>{messages.site.tagline}</FooterDescription>
            </FooterBrand>

            <FooterSection>
              <FooterSectionTitle>Browse</FooterSectionTitle>
              <FooterLinkList>
                {exploreLinks.map((item) => (
                  <FooterLink href={item.href} key={item.href}>
                    {item.label}
                  </FooterLink>
                ))}
              </FooterLinkList>
            </FooterSection>

            <FooterSection>
              <FooterSectionTitle>Company</FooterSectionTitle>
              <FooterLinkList>
                {companyLinks.map((item) => (
                  <FooterLink href={item.href} key={item.href}>
                    {item.label}
                  </FooterLink>
                ))}
              </FooterLinkList>
            </FooterSection>
          </FooterGrid>

          <FooterBottom>
            <span>{messages.site.footer}</span>
            <FooterMetaRow>
              <FooterMetaPill>Locale: {locale.toUpperCase()}</FooterMetaPill>
              <FooterMetaPill>{messages.meta?.language || "English"}</FooterMetaPill>
            </FooterMetaRow>
          </FooterBottom>
        </FooterInner>
      </Footer>
    </Shell>
  );
}
