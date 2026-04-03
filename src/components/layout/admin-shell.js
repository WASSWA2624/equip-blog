"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

import AdminLogoutButton from "@/components/auth/admin-logout-button";
import EquipLogo from "@/components/common/equip-logo";
import { defaultLocale } from "@/features/i18n/config";
import { buildLocaleRootPath } from "@/features/i18n/routing";
import { getAdminNavigation } from "@/lib/auth/rbac";

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

  if (targetPath === "/admin") {
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
  padding: 0.65rem 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 40;

  @media (min-width: 900px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg} 0;
  }
`;

const HeaderInner = styled.div`
  backdrop-filter: blur(22px);
  background:
    linear-gradient(135deg, rgba(16, 32, 51, 0.96), rgba(0, 95, 115, 0.94)),
    radial-gradient(circle at top right, rgba(242, 179, 90, 0.18), transparent 44%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 18px 54px rgba(16, 32, 51, 0.22);
  display: grid;
  gap: 0.6rem;
  margin: 0 auto;
  max-width: 1280px;
  padding: 0.72rem 0.8rem;

  @media (min-width: 900px) {
    padding: 0.82rem 0.95rem;
  }
`;

const TopRow = styled.div`
  align-items: start;
  display: grid;
  gap: 0.58rem;
  grid-template-columns: minmax(0, 1fr) auto;

  @media (min-width: 980px) {
    align-items: center;
  }
`;

const BrandLink = styled(Link)`
  align-items: flex-start;
  color: white;
  display: inline-flex;
  gap: 0.62rem;
  min-width: 0;

  @media (min-width: 540px) {
    align-items: center;
  }
`;

const TopControls = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const BrandCopy = styled.span`
  display: grid;
  gap: 0.12rem;
  min-width: 0;
`;

const Title = styled.span`
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.72);
  display: -webkit-box;
  font-size: 0.82rem;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.38;
  margin: 0;
  overflow: hidden;
`;

const HeaderActions = styled.div`
  align-items: center;
  display: none;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;

  @media (min-width: 980px) {
    display: flex;
  }
`;

const MenuButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.42rem 0.72rem;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
  }

  @media (min-width: 980px) {
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

const UserBadge = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  gap: 0.55rem;
  grid-template-columns: minmax(0, 1fr) auto;
  justify-self: start;
  max-width: 100%;
  padding: 0.36rem 0.5rem;
  width: fit-content;

  @media (min-width: 980px) {
    justify-self: end;
  }
`;

const UserCopy = styled.div`
  display: grid;
  gap: 0.12rem;
  min-width: 0;
`;

const UserName = styled.strong`
  color: white;
  font-size: 0.88rem;
  line-height: 1.1;
`;

const UserMeta = styled.span`
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RolePill = styled.span`
  align-items: center;
  background: rgba(242, 179, 90, 0.18);
  border: 1px solid rgba(242, 179, 90, 0.24);
  border-radius: 999px;
  color: #ffe3b7;
  display: inline-flex;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.56rem;
  text-transform: uppercase;
  white-space: nowrap;
`;

const NavScroller = styled.div`
  overflow-x: auto;
  padding-bottom: 0.12rem;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DesktopNavScroller = styled(NavScroller)`
  display: none;

  @media (min-width: 980px) {
    display: block;
  }
`;

const Nav = styled.nav`
  align-items: center;
  display: inline-flex;
  gap: 0.82rem;
  min-width: max-content;
`;

const NavLink = styled(Link)`
  color: ${({ $active }) => ($active ? "#fff5df" : "rgba(255, 255, 255, 0.86)")};
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.18rem 0;
  position: relative;
  transition:
    transform 160ms ease,
    color 160ms ease;
  white-space: nowrap;

  &::after {
    background: #ffe3b7;
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
    color: white;
    transform: translateY(-1px);
  }

  &:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
`;

const MobileMenu = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: ${({ $open }) => ($open ? "grid" : "none")};
  gap: 0.72rem;
  padding-top: 0.84rem;

  @media (min-width: 980px) {
    display: none;
  }
`;

const MobileUtilityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MobileUtilityLink = styled(Link)`
  align-items: center;
  color: #fff5df;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 700;
  min-height: 34px;
  padding: 0.2rem 0;
  position: relative;

  &::after {
    background: currentColor;
    border-radius: 999px;
    bottom: 0;
    content: "";
    height: 2px;
    left: 0;
    opacity: 0.9;
    position: absolute;
    width: 100%;
  }
`;

const MobileNav = styled.nav`
  display: grid;
  column-gap: 0.9rem;
  gap: 0.18rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const MobileNavLink = styled(Link)`
  align-items: center;
  border-bottom: 1px solid ${({ $active }) => ($active ? "rgba(255, 227, 183, 0.28)" : "rgba(255, 255, 255, 0.12)")};
  color: ${({ $active }) => ($active ? "#fff5df" : "rgba(255, 255, 255, 0.88)")};
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 700;
  min-height: 42px;
  padding: 0.38rem 0 0.56rem;
  transition: color 160ms ease, border-color 160ms ease;

  &:hover {
    border-bottom-color: rgba(255, 227, 183, 0.24);
    color: white;
  }
`;

const Footer = styled.footer`
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const FooterInner = styled.div`
  background:
    linear-gradient(145deg, rgba(16, 32, 51, 0.96), rgba(0, 95, 115, 0.92)),
    radial-gradient(circle at top right, rgba(242, 179, 90, 0.16), transparent 42%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 24px 70px rgba(16, 32, 51, 0.18);
  color: rgba(255, 255, 255, 0.82);
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0.95rem 1rem;
`;

const FooterGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  }
`;

const FooterBrand = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterBrandLink = styled(Link)`
  align-items: center;
  color: white;
  display: inline-flex;
  gap: 0.82rem;
  justify-self: start;
`;

const FooterBrandTitle = styled.strong`
  display: block;
  font-size: 1rem;
  letter-spacing: 0.01em;
`;

const FooterDescription = styled.p`
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.56;
  margin: 0;
  max-width: 60ch;
`;

const FooterNavGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterSectionTitle = styled.strong`
  color: #ffe3b7;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const FooterNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.82rem;
`;

const FooterLink = styled(Link)`
  color: white;
  display: inline-flex;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.18rem 0;
  position: relative;

  &::after {
    background: rgba(255, 227, 183, 0.92);
    border-radius: 999px;
    bottom: -0.16rem;
    content: "";
    height: 2px;
    left: 0;
    opacity: 0;
    position: absolute;
    transform: scaleX(0.45);
    transform-origin: left;
    transition:
      transform 160ms ease,
      opacity 160ms ease;
    width: 100%;
  }

  &:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
`;

const FooterBottom = styled.div`
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: space-between;
  padding-top: 0.75rem;
`;

const FooterMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterMetaPill = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.78);
  display: inline-flex;
  font-size: 0.82rem;
  padding: 0.36rem 0.64rem;
  white-space: nowrap;
`;

export default function AdminShell({ children, messages, user }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const adminNav = getAdminNavigation(user);
  const publicSiteHref = buildLocaleRootPath(defaultLocale);
  const navigationItems = adminNav.map((item) => ({
    ...item,
    label: messages.admin.navigation[item.key] || item.key,
  }));

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <TopRow>
            <BrandLink href="/admin">
              <EquipLogo size={38} />
              <BrandCopy>
                <Title>{messages.admin.title}</Title>
                <Description>{messages.admin.description}</Description>
              </BrandCopy>
            </BrandLink>

            <TopControls>
              <HeaderActions>
                <UserBadge aria-label="Authenticated admin">
                  <UserCopy>
                    <UserName>{user.name}</UserName>
                    <UserMeta>{user.email}</UserMeta>
                  </UserCopy>
                  <RolePill>{user.role.replace(/_/g, " ")}</RolePill>
                </UserBadge>
                <AdminLogoutButton />
              </HeaderActions>
              <MenuButton
                aria-controls="mobile-admin-navigation"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close admin navigation" : "Open admin navigation"}
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
            <Nav aria-label="Admin navigation">
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

          <MobileMenu $open={isMenuOpen} id="mobile-admin-navigation">
            <UserBadge aria-label="Authenticated admin">
              <UserCopy>
                <UserName>{user.name}</UserName>
                <UserMeta>{user.email}</UserMeta>
              </UserCopy>
              <RolePill>{user.role.replace(/_/g, " ")}</RolePill>
            </UserBadge>

            <MobileUtilityRow>
              <MobileUtilityLink href={publicSiteHref} onClick={() => setIsMenuOpen(false)}>
                Open public site
              </MobileUtilityLink>
              <AdminLogoutButton />
            </MobileUtilityRow>

            <MobileNav aria-label="Mobile admin navigation">
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
              <FooterBrandLink href="/admin">
                <EquipLogo size={38} />
                <div>
                  <FooterBrandTitle>{messages.admin.title}</FooterBrandTitle>
                  <span>{messages.admin.footer}</span>
                </div>
              </FooterBrandLink>
              <FooterDescription>{messages.admin.description}</FooterDescription>
            </FooterBrand>

            <FooterNavGroup>
              <FooterSectionTitle>Quick Access</FooterSectionTitle>
              <FooterNav>
                <FooterLink href={publicSiteHref}>Open public site</FooterLink>
                {adminNav.slice(0, 5).map((item) => (
                  <FooterLink href={item.href} key={item.href}>
                    {messages.admin.navigation[item.key] || item.key}
                  </FooterLink>
                ))}
              </FooterNav>
            </FooterNavGroup>
          </FooterGrid>

          <FooterBottom>
            <span>{messages.admin.footer}</span>
            <FooterMetaRow>
              <FooterMetaPill>{user.role.replace(/_/g, " ")}</FooterMetaPill>
              <FooterMetaPill>{user.email}</FooterMetaPill>
            </FooterMetaRow>
          </FooterBottom>
        </FooterInner>
      </Footer>
    </Shell>
  );
}
