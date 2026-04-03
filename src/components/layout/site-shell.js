"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 100vh;
`;

const Header = styled.header`
  padding: 0.7rem 0.8rem 0;
  position: sticky;
  top: 0;
  z-index: 30;

  @media (min-width: 760px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} 0;
  }
`;

const HeaderInner = styled.div`
  backdrop-filter: blur(22px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(0, 95, 115, 0.14), transparent 42%);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 16px 42px rgba(16, 32, 51, 0.08);
  display: grid;
  gap: 0.72rem;
  margin: 0 auto;
  max-width: 1180px;
  padding: 0.82rem 0.88rem;

  @media (min-width: 760px) {
    padding: 0.92rem 1.05rem;
  }
`;

const TopRow = styled.div`
  align-items: start;
  display: grid;
  gap: 0.65rem;

  @media (min-width: 540px) {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const TopControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: flex-start;

  @media (min-width: 540px) {
    justify-content: flex-end;
  }
`;

const BrandLink = styled(Link)`
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  gap: 0.72rem;
  min-width: 0;

  @media (min-width: 540px) {
    align-items: center;
  }
`;

const BrandCopy = styled.span`
  display: grid;
  gap: 0.12rem;
  min-width: 0;
`;

const BrandTitle = styled.span`
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
`;

const Tagline = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  display: -webkit-box;
  font-size: 0.82rem;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.38;
  margin: 0;
  max-width: 46ch;
  overflow: hidden;
`;

const MetaPill = styled.span`
  align-items: center;
  background: rgba(0, 95, 115, 0.08);
  border: 1px solid rgba(0, 95, 115, 0.12);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  justify-self: start;
  padding: 0.38rem 0.64rem;
  text-transform: uppercase;
  white-space: nowrap;
`;

const MenuButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.38rem 0.68rem;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

  &:hover {
    border-color: rgba(0, 95, 115, 0.2);
    transform: translateY(-1px);
  }

  @media (min-width: 760px) {
    display: none;
  }
`;

const MenuButtonText = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
`;

const MenuIcon = styled.span`
  display: inline-grid;
  height: 0.82rem;
  place-items: center;
  position: relative;
  width: 0.95rem;

  &::before,
  &::after {
    background: currentColor;
    border-radius: 999px;
    content: "";
    height: 2px;
    left: 0;
    position: absolute;
    transition:
      top 160ms ease,
      transform 160ms ease;
    width: 100%;
  }

  &::before {
    top: ${({ $open }) => ($open ? "0.35rem" : "0.08rem")};
    transform: ${({ $open }) => ($open ? "rotate(45deg)" : "none")};
  }

  &::after {
    top: ${({ $open }) => ($open ? "0.35rem" : "0.62rem")};
    transform: ${({ $open }) => ($open ? "rotate(-45deg)" : "none")};
  }
`;

const MenuIconBar = styled.span`
  background: currentColor;
  border-radius: 999px;
  height: 2px;
  opacity: ${({ $open }) => ($open ? 0 : 1)};
  transition: opacity 120ms ease;
  width: 100%;
`;

const NavScroller = styled.div`
  overflow-x: auto;
  padding: 0.05rem 0 0.1rem;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DesktopNavScroller = styled(NavScroller)`
  display: none;

  @media (min-width: 760px) {
    display: block;
  }
`;

const Nav = styled.nav`
  align-items: center;
  display: inline-flex;
  gap: 0.95rem;
  min-width: max-content;
`;

const NavLink = styled(Link)`
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text)};
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.18rem 0;
  position: relative;
  transition:
    transform 160ms ease,
    color 160ms ease;
  white-space: nowrap;

  &::after {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 999px;
    bottom: -0.22rem;
    content: "";
    height: 2px;
    left: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    position: absolute;
    transform: scaleX(${({ $active }) => ($active ? 1 : 0.45)});
    transform-origin: left;
    transition:
      transform 160ms ease,
      opacity 160ms ease;
    width: 100%;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }

  &:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
`;

const MobileMenu = styled.div`
  border-top: 1px solid rgba(16, 32, 51, 0.08);
  display: ${({ $open }) => ($open ? "grid" : "none")};
  gap: 0.58rem;
  padding-top: 0.78rem;

  @media (min-width: 760px) {
    display: none;
  }
`;

const MobileNav = styled.nav`
  display: grid;
  column-gap: 0.85rem;
  gap: 0.15rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const MobileNavLink = styled(Link)`
  align-items: center;
  border-bottom: 1px solid ${({ $active }) => ($active ? "rgba(0, 95, 115, 0.2)" : "rgba(16, 32, 51, 0.08)")};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text)};
  display: inline-flex;
  font-size: 0.84rem;
  font-weight: 700;
  min-height: 40px;
  padding: 0.4rem 0.08rem 0.52rem;
  transition: color 160ms ease, border-color 160ms ease;

  &:hover {
    border-bottom-color: rgba(0, 95, 115, 0.2);
    color: ${({ theme }) => theme.colors.primary};
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const legalNavigation = messages.site.legalNavigation || {};
  const navigationItems = publicNavigationRoutes.map((item) => ({
    ...item,
    href: buildLocalizedPath(locale, item.segments),
    label: messages.site.navigation[item.key],
  }));
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
              <EquipLogo size={38} />
              <BrandCopy>
                <BrandTitle>{messages.site.title}</BrandTitle>
                <Tagline>{messages.site.tagline}</Tagline>
              </BrandCopy>
            </BrandLink>
            <TopControls>
              <MetaPill>Locale {locale.toUpperCase()}</MetaPill>
              <MenuButton
                aria-controls="mobile-public-navigation"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close public navigation" : "Open public navigation"}
                onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                type="button"
              >
                <MenuButtonText>{isMenuOpen ? "Close" : "Menu"}</MenuButtonText>
                <MenuIcon $open={isMenuOpen}>
                  <MenuIconBar $open={isMenuOpen} />
                </MenuIcon>
              </MenuButton>
            </TopControls>
          </TopRow>

          <DesktopNavScroller>
            <Nav aria-label="Public navigation">
              {navigationItems.map((item) => {
                const isActive = isNavigationActive(pathname, item.href);

                return (
                  <NavLink
                    aria-current={isActive ? "page" : undefined}
                    href={item.href}
                    key={item.key}
                    $active={isActive}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </Nav>
          </DesktopNavScroller>

          <MobileMenu $open={isMenuOpen} id="mobile-public-navigation">
            <MobileNav aria-label="Mobile public navigation">
              {navigationItems.map((item) => {
                const isActive = isNavigationActive(pathname, item.href);

                return (
                  <MobileNavLink
                    aria-current={isActive ? "page" : undefined}
                    href={item.href}
                    key={item.key}
                    onClick={() => setIsMenuOpen(false)}
                    $active={isActive}
                  >
                    {item.label}
                  </MobileNavLink>
                );
              })}
            </MobileNav>
          </MobileMenu>
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
