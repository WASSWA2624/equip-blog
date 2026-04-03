"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

import EquipLogo from "@/components/common/equip-logo";
import { buildLocalizedPath, publicRouteSegments } from "@/features/i18n/routing";

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

function getEntityContextLabel(pathname) {
  const segments = normalizePathname(pathname).split("/").filter(Boolean);
  const entitySegment = segments[1];

  if (entitySegment === "category") {
    return "Category";
  }

  if (entitySegment === "manufacturer") {
    return "Manufacturer";
  }

  if (entitySegment === "equipment") {
    return "Equipment";
  }

  return null;
}

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(16, 32, 51, 0.07);
  box-shadow: 0 14px 42px rgba(16, 32, 51, 0.04);
  position: relative;
  z-index: 20;
`;

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1280px;
  min-height: 72px;
  padding: 0 1rem;
  width: 100%;

  @media (min-width: 720px) {
    min-height: 78px;
    padding: 0 1.25rem;
  }

  @media (min-width: 1100px) {
    padding: 0 1.5rem;
  }
`;

const HeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: 0.9rem;
  min-width: 0;
`;

const BrandLink = styled(Link)`
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  gap: 0.75rem;
  min-width: 0;
`;

const BrandTitle = styled.span`
  color: #182742;
  font-size: clamp(1.9rem, 5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  white-space: nowrap;
`;

const ContextLabel = styled.span`
  color: #182742;
  display: none;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;

  @media (min-width: 720px) {
    display: inline-flex;
  }

  @media (min-width: 900px) {
    font-size: 1rem;
  }
`;

const HeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: 0.9rem;
`;

const PrimaryNav = styled.nav`
  align-items: center;
  display: none;
  gap: 2rem;

  @media (min-width: 720px) {
    display: inline-flex;
  }
`;

const PrimaryNavLink = styled(Link)`
  color: ${({ $active }) => ($active ? "#182742" : "rgba(24, 39, 66, 0.96)")};
  font-size: 0.95rem;
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  letter-spacing: -0.02em;
  position: relative;
  transition: color 160ms ease;
  white-space: nowrap;

  &::after {
    background: #244b73;
    border-radius: 999px;
    bottom: -0.38rem;
    content: "";
    height: 2px;
    left: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    position: absolute;
    transform: scaleX(${({ $active }) => ($active ? 1 : 0.6)});
    transform-origin: left;
    transition: opacity 160ms ease, transform 160ms ease;
    width: 100%;
  }

  &:hover {
    color: #244b73;
  }

  &:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
`;

const MenuWrap = styled.div`
  position: relative;
`;

const MoreButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: #182742;
  cursor: pointer;
  display: inline-flex;
  font-size: 1.5rem;
  font-weight: 800;
  height: 44px;
  justify-content: center;
  letter-spacing: 0.12em;
  padding: 0;
  transition: opacity 160ms ease, transform 160ms ease;
  width: 44px;

  &:hover {
    opacity: 0.78;
    transform: translateY(-1px);
  }
`;

const DesktopMenu = styled.div`
  display: none;

  @media (min-width: 720px) {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(16, 32, 51, 0.08);
    border-radius: 18px;
    box-shadow: 0 24px 48px rgba(16, 32, 51, 0.12);
    display: ${({ $open }) => ($open ? "grid" : "none")};
    gap: 0.2rem;
    min-width: 220px;
    padding: 0.55rem;
    position: absolute;
    right: 0;
    top: calc(100% + 0.75rem);
  }
`;

const DesktopMenuLink = styled(Link)`
  border-radius: 12px;
  color: #182742;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.8rem 0.9rem;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: rgba(36, 75, 115, 0.06);
    color: #244b73;
  }
`;

const MobileMenu = styled.div`
  border-top: 1px solid rgba(16, 32, 51, 0.07);
  display: ${({ $open }) => ($open ? "grid" : "none")};
  gap: 0.3rem;
  padding: 0.7rem 1rem 1rem;

  @media (min-width: 720px) {
    display: none;
  }
`;

const MobileMenuLink = styled(Link)`
  border-bottom: 1px solid rgba(16, 32, 51, 0.07);
  color: ${({ $active }) => ($active ? "#244b73" : "#182742")};
  font-size: 0.98rem;
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  padding: 0.82rem 0;
`;

const Content = styled.div`
  display: grid;
  flex: 1;
`;

const Footer = styled.footer`
  background:
    radial-gradient(circle at top left, rgba(120, 152, 190, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(92, 123, 160, 0.14), transparent 30%),
    linear-gradient(180deg, #243f5d 0%, #203a56 100%);
  color: rgba(255, 255, 255, 0.96);
  margin-top: auto;
`;

const FooterInner = styled.div`
  display: grid;
  gap: 1.75rem;
  margin: 0 auto;
  max-width: 1280px;
  padding: clamp(1.5rem, 4vw, 2.2rem) clamp(1rem, 3vw, 1.5rem) 1rem;
`;

const FooterTop = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 560px) {
    align-items: start;
    grid-template-columns: minmax(0, 1.2fr) minmax(105px, 0.6fr) minmax(105px, 0.6fr);
  }

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(105px, 0.6fr) minmax(105px, 0.6fr) minmax(220px, 0.9fr);
  }
`;

const FooterBrand = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const FooterBrandLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: inline-flex;
  gap: 0.7rem;
  justify-self: start;
`;

const FooterBrandTitle = styled.span`
  font-size: clamp(1.15rem, 2.4vw, 1.35rem);
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const FooterCopyStack = styled.div`
  display: grid;
  gap: 0.55rem;
  max-width: 26ch;
`;

const FooterBodyText = styled.p`
  color: rgba(241, 245, 250, 0.9);
  font-size: clamp(0.98rem, 2vw, 1.04rem);
  line-height: 1.55;
  margin: 0;
`;

const FooterNavSection = styled.div`
  align-content: start;
  display: grid;
  gap: 0.75rem;
`;

const FooterSectionTitle = styled.span`
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const FooterLinkList = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.96);
  font-size: clamp(0.96rem, 2vw, 1.02rem);
  font-weight: 700;
  letter-spacing: -0.02em;

  &:hover {
    color: rgba(233, 242, 255, 0.84);
  }
`;

const FooterUtility = styled.div`
  display: none;

  @media (min-width: 1100px) {
    align-content: start;
    display: grid;
  }
`;

const FooterAdvertiseButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.96);
  cursor: pointer;
  font-size: 0.98rem;
  font-weight: 600;
  min-height: 56px;
  padding: 0 1rem;
  transition: background 160ms ease, border-color 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const FooterBottom = styled.div`
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 1rem;
`;

const Copyright = styled.span`
  color: rgba(242, 245, 249, 0.9);
  font-size: clamp(0.95rem, 2vw, 1rem);
`;

const FooterLocale = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.96);
  cursor: pointer;
  display: inline-flex;
  font-size: clamp(0.96rem, 2vw, 1rem);
  gap: 0.42rem;
  justify-content: center;
  min-height: 48px;
  padding: 0 1rem;
  white-space: nowrap;
`;

const FooterLocaleArrow = styled.span`
  font-size: 1rem;
  line-height: 1;
`;

export default function SiteShell({ children, locale, messages }) {
  const pathname = usePathname();
  const [menuOpenedForPath, setMenuOpenedForPath] = useState(null);
  const legalNavigation = messages.site.legalNavigation || {};
  const languageLabel = messages.meta?.language || locale.toUpperCase();
  const currentYear = new Date().getFullYear();

  const homeHref = buildLocalizedPath(locale, publicRouteSegments.home);
  const blogHref = buildLocalizedPath(locale, publicRouteSegments.blog);
  const aboutHref = buildLocalizedPath(locale, publicRouteSegments.about);
  const contactHref = buildLocalizedPath(locale, publicRouteSegments.contact);
  const searchHref = buildLocalizedPath(locale, publicRouteSegments.search);
  const disclaimerHref = buildLocalizedPath(locale, publicRouteSegments.disclaimer);
  const privacyHref = buildLocalizedPath(locale, publicRouteSegments.privacy);

  const primaryLinks = [
    { href: homeHref, label: messages.site.navigation.home },
    { href: blogHref, label: messages.site.navigation.blog },
    { href: aboutHref, label: messages.site.navigation.about },
    { href: contactHref, label: messages.site.navigation.contact },
  ];
  const secondaryLinks = [
    { href: searchHref, label: messages.site.navigation.search },
    { href: disclaimerHref, label: legalNavigation.disclaimer || "Disclaimer" },
    { href: privacyHref, label: legalNavigation.privacy || "Privacy" },
  ];
  const matchedContext =
    [...primaryLinks, ...secondaryLinks].find((item) => isNavigationActive(pathname, item.href)) || null;
  const contextLabel =
    matchedContext?.label || getEntityContextLabel(pathname) || messages.site.navigation.home;
  const isMenuOpen = menuOpenedForPath === pathname;

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <HeaderLeft>
            <BrandLink href={homeHref}>
              <EquipLogo size={48} />
              <BrandTitle>{messages.site.title}</BrandTitle>
            </BrandLink>
            <ContextLabel>{contextLabel}</ContextLabel>
          </HeaderLeft>

          <HeaderRight>
            <PrimaryNav aria-label="Public navigation">
              {primaryLinks.map((item) => {
                const isActive = isNavigationActive(pathname, item.href);

                return (
                  <PrimaryNavLink
                    aria-current={isActive ? "page" : undefined}
                    href={item.href}
                    key={item.href}
                    $active={isActive}
                  >
                    {item.label}
                  </PrimaryNavLink>
                );
              })}
            </PrimaryNav>

            <MenuWrap>
              <MoreButton
                aria-controls="public-navigation-overflow"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() =>
                  setMenuOpenedForPath((currentValue) => (currentValue === pathname ? null : pathname))
                }
                type="button"
              >
                ...
              </MoreButton>

              <DesktopMenu $open={isMenuOpen} id="public-navigation-overflow">
                {secondaryLinks.map((item) => (
                  <DesktopMenuLink href={item.href} key={item.href}>
                    {item.label}
                  </DesktopMenuLink>
                ))}
              </DesktopMenu>
            </MenuWrap>
          </HeaderRight>
        </HeaderInner>

        <MobileMenu $open={isMenuOpen}>
          {[...primaryLinks, ...secondaryLinks].map((item) => {
            const isActive = isNavigationActive(pathname, item.href);

            return (
              <MobileMenuLink
                aria-current={isActive ? "page" : undefined}
                href={item.href}
                key={item.href}
                $active={isActive}
              >
                {item.label}
              </MobileMenuLink>
            );
          })}
        </MobileMenu>
      </Header>

      <Content>{children}</Content>

      <Footer>
        <FooterInner>
          <FooterTop>
            <FooterBrand>
              <FooterBrandLink href={homeHref}>
                <EquipLogo size={44} />
                <FooterBrandTitle>{messages.site.title}</FooterBrandTitle>
              </FooterBrandLink>

              <FooterCopyStack>
                <FooterBodyText>{messages.site.footer}</FooterBodyText>
                <FooterBodyText>{messages.site.tagline}</FooterBodyText>
              </FooterCopyStack>
            </FooterBrand>

            <FooterNavSection>
              <FooterSectionTitle>Browse</FooterSectionTitle>
              <FooterLinkList>
                <FooterLink href={homeHref}>{messages.site.navigation.home}</FooterLink>
                <FooterLink href={blogHref}>{messages.site.navigation.blog}</FooterLink>
                <FooterLink href={searchHref}>{messages.site.navigation.search}</FooterLink>
              </FooterLinkList>
            </FooterNavSection>

            <FooterNavSection>
              <FooterSectionTitle>Company</FooterSectionTitle>
              <FooterLinkList>
                <FooterLink href={aboutHref}>{messages.site.navigation.about}</FooterLink>
                <FooterLink href={contactHref}>{messages.site.navigation.contact}</FooterLink>
                <FooterLink href={disclaimerHref}>
                  {legalNavigation.disclaimer || "Disclaimer"}
                </FooterLink>
                <FooterLink href={privacyHref}>{legalNavigation.privacy || "Privacy"}</FooterLink>
              </FooterLinkList>
            </FooterNavSection>

            <FooterUtility>
              <FooterAdvertiseButton type="button">Advertise Here</FooterAdvertiseButton>
            </FooterUtility>
          </FooterTop>

          <FooterBottom>
            <Copyright>
              &copy; {currentYear} {messages.site.title}. All rights reserved.
            </Copyright>
            <FooterLocale type="button">
              Locale: {languageLabel}
              <FooterLocaleArrow aria-hidden="true">v</FooterLocaleArrow>
            </FooterLocale>
          </FooterBottom>
        </FooterInner>
      </Footer>
    </Shell>
  );
}
