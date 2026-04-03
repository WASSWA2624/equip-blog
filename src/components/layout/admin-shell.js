"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import AdminLogoutButton from "@/components/auth/admin-logout-button";
import EquipLogo from "@/components/common/equip-logo";
import { defaultLocale } from "@/features/i18n/config";
import { buildLocaleRootPath } from "@/features/i18n/routing";
import { getAdminNavigation } from "@/lib/auth/rbac";

const MOBILE_BREAKPOINT = 720;
const DESKTOP_BREAKPOINT = 1220;
const DESKTOP_SIGN_OUT_BREAKPOINT = 1340;

const MOBILE_PRIMARY_KEYS = Object.freeze([
  "dashboard",
  "generate",
  "drafts",
  "published",
  "comments",
]);

const TABLET_PRIMARY_KEYS = Object.freeze([...MOBILE_PRIMARY_KEYS, "media"]);

const DESKTOP_PRIMARY_KEYS = Object.freeze([...TABLET_PRIMARY_KEYS, "jobs", "categories"]);

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

function getViewportWidth() {
  if (typeof window === "undefined") {
    return DESKTOP_BREAKPOINT;
  }

  return window.innerWidth;
}

function getPrimaryKeysForViewport(viewportWidth) {
  if (viewportWidth < MOBILE_BREAKPOINT) {
    return MOBILE_PRIMARY_KEYS;
  }

  if (viewportWidth < DESKTOP_BREAKPOINT) {
    return TABLET_PRIMARY_KEYS;
  }

  return DESKTOP_PRIMARY_KEYS;
}

function distributeNavigationItems(items, pathname, primaryKeys) {
  const primaryLookup = new Set(primaryKeys);
  let primaryItems = items.filter((item) => primaryLookup.has(item.key));
  const activeItem = items.find((item) => isNavigationActive(pathname, item.href)) || null;
  const maxPrimaryItems = primaryKeys.filter((key) => items.some((item) => item.key === key)).length;

  if (activeItem && !primaryItems.some((item) => item.key === activeItem.key)) {
    primaryItems = [...primaryItems, activeItem];

    while (primaryItems.length > maxPrimaryItems) {
      let removableIndex = -1;

      for (let index = primaryItems.length - 1; index >= 0; index -= 1) {
        if (primaryItems[index].key !== activeItem.key) {
          removableIndex = index;
          break;
        }
      }

      if (removableIndex === -1) {
        break;
      }

      primaryItems = primaryItems.filter((_, index) => index !== removableIndex);
    }
  }

  const primaryItemKeys = new Set(primaryItems.map((item) => item.key));
  const overflowItems = items.filter((item) => !primaryItemKeys.has(item.key));

  return {
    overflowItems,
    primaryItems,
  };
}

const Shell = styled.div`
  background:
    radial-gradient(circle at top left, rgba(152, 176, 205, 0.24), transparent 24%),
    radial-gradient(circle at 88% 22%, rgba(255, 255, 255, 0.84), transparent 26%),
    linear-gradient(180deg, #f7f8fc 0%, #eef2f9 55%, #edf1f8 100%);
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
`;

const HeaderSurface = styled.div`
  background:
    radial-gradient(circle at top right, rgba(38, 138, 164, 0.36), transparent 24%),
    radial-gradient(circle at 8% 12%, rgba(255, 255, 255, 0.08), transparent 20%),
    linear-gradient(135deg, #11273d 0%, #17374d 44%, #0f6177 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 22px 48px rgba(16, 32, 51, 0.16);
  overflow: visible;
  position: relative;

  &::before {
    background:
      radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0, transparent 56%),
      repeating-linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.02) 0,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px,
        transparent 7px
      );
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
  }
`;

const HeaderInner = styled.div`
  display: grid;
  gap: 0.9rem;
  margin: 0 auto;
  max-width: 1560px;
  padding:
    clamp(0.85rem, 2vw, 1.1rem)
    clamp(0.7rem, 2.2vw, 1.4rem)
    clamp(0.8rem, 1.8vw, 1rem);
  position: relative;
  width: 100%;

  @media (max-width: 479px) {
    padding:
      0.85rem
      0.5rem
      0.8rem;
  }
`;

const TopRow = styled.div`
  align-items: start;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1fr) auto;

  @media (min-width: ${DESKTOP_SIGN_OUT_BREAKPOINT}px) {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
`;

const BrandLink = styled(Link)`
  align-items: start;
  color: white;
  display: inline-flex;
  gap: 0.75rem;
  min-width: 0;
`;

const BrandCopy = styled.span`
  display: grid;
  gap: 0.16rem;
  min-width: 0;
`;

const BrandTitle = styled.span`
  font-size: clamp(1.02rem, 2vw, 1.18rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
`;

const BrandDescription = styled.p`
  color: rgba(242, 247, 252, 0.82);
  font-size: clamp(0.84rem, 1.4vw, 0.92rem);
  line-height: 1.48;
  margin: 0;
  max-width: 30ch;

  @media (max-width: 479px) {
    max-width: 22ch;
  }
`;

const UserBadge = styled.div`
  align-items: center;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 0.55rem;
  grid-template-columns: minmax(0, 1fr);
  max-width: min(100%, 340px);
  min-width: min(100%, 156px);
  padding: 0.62rem 0.8rem;

  @media (min-width: 480px) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const UserCopy = styled.div`
  display: grid;
  gap: 0.14rem;
  min-width: 0;
`;

const UserName = styled.strong`
  color: white;
  font-size: clamp(0.88rem, 1.6vw, 1rem);
  line-height: 1.12;
`;

const UserMeta = styled.span`
  color: rgba(242, 247, 252, 0.84);
  font-size: clamp(0.74rem, 1.4vw, 0.82rem);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RolePill = styled.span`
  align-items: center;
  background: rgba(185, 205, 192, 0.18);
  border: 1px solid rgba(215, 228, 217, 0.22);
  border-radius: 999px;
  color: rgba(246, 250, 247, 0.92);
  display: none;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  padding: 0.45rem 0.74rem;
  text-transform: uppercase;
  white-space: nowrap;

  @media (min-width: 640px) {
    display: inline-flex;
  }
`;

const DesktopLogoutButton = styled(AdminLogoutButton)`
  align-items: center;
  background: rgba(14, 40, 62, 0.42);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  display: none;
  min-height: 58px;
  padding: 0.9rem 1.45rem;

  @media (min-width: ${DESKTOP_SIGN_OUT_BREAKPOINT}px) {
    display: inline-flex;
  }
`;

const NavRow = styled.div`
  align-items: center;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: minmax(0, 1fr) auto;
`;

const PrimaryNavScroller = styled.div`
  overflow-x: auto;
  padding-bottom: 0.1rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PrimaryNav = styled.nav`
  display: inline-flex;
  gap: 0.28rem;
  min-width: max-content;

  @media (max-width: 479px) {
    gap: 0.12rem;
  }
`;

const PrimaryNavLink = styled(Link)`
  align-items: center;
  background: ${({ $active }) => ($active ? "rgba(31, 49, 76, 0.58)" : "transparent")};
  border: 1px solid ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.08)" : "transparent")};
  border-radius: 14px;
  color: ${({ $active }) => ($active ? "white" : "rgba(244, 248, 252, 0.94)")};
  display: inline-flex;
  font-size: clamp(0.88rem, 1.6vw, 0.98rem);
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  letter-spacing: -0.02em;
  min-height: 46px;
  padding: 0 1rem;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
  white-space: nowrap;

  @media (max-width: 479px) {
    font-size: 0.8rem;
    min-height: 42px;
    padding: 0 0.55rem;
  }

  &:hover {
    background: ${({ $active }) =>
      $active ? "rgba(31, 49, 76, 0.64)" : "rgba(255, 255, 255, 0.08)"};
    color: white;
    transform: translateY(-1px);
  }
`;

const MenuWrap = styled.div`
  position: relative;
`;

const OverflowButton = styled.button`
  align-items: center;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  font-size: 1.6rem;
  font-weight: 800;
  height: 46px;
  justify-content: center;
  letter-spacing: 0.16em;
  transition:
    background 160ms ease,
    transform 160ms ease;
  width: 46px;

  @media (max-width: 479px) {
    font-size: 1.45rem;
    height: 42px;
    width: 42px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
  }
`;

const OverflowMenu = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(16, 32, 51, 0.16);
  display: ${({ $open }) => ($open ? "grid" : "none")};
  min-width: min(calc(100vw - 1.4rem), 280px);
  overflow: hidden;
  position: absolute;
  right: 0;
  top: calc(100% + 0.7rem);
  width: min(calc(100vw - 1.4rem), 280px);
  z-index: 50;
`;

const OverflowList = styled.div`
  display: grid;
`;

const OverflowLink = styled(Link)`
  border-top: 1px solid rgba(16, 32, 51, 0.08);
  color: ${({ $active }) => ($active ? "#244b73" : "#182742")};
  font-size: 0.96rem;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  letter-spacing: -0.02em;
  padding: 1rem 1.2rem;
  transition: background 160ms ease, color 160ms ease;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: rgba(36, 75, 115, 0.05);
    color: #244b73;
  }
`;

const OverflowActions = styled.div`
  border-top: 1px solid rgba(16, 32, 51, 0.08);
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem 1rem 1rem;
`;

const OverflowActionLink = styled(Link)`
  align-items: center;
  background: rgba(36, 75, 115, 0.05);
  border: 1px solid rgba(36, 75, 115, 0.08);
  border-radius: 999px;
  color: #244b73;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 700;
  justify-content: center;
  min-height: 44px;
  padding: 0 1rem;
`;

const OverflowLogoutButton = styled(AdminLogoutButton)`
  background: linear-gradient(180deg, #244b73, #1d3d5e);
  border-color: transparent;
  display: inline-flex;
  justify-content: center;
  min-height: 44px;
  width: 100%;
`;

const Main = styled.div`
  flex: 1;
`;

export default function AdminShell({ children, messages, user }) {
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [openMenuContext, setOpenMenuContext] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(DESKTOP_BREAKPOINT);
  const publicSiteHref = buildLocaleRootPath(defaultLocale);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(getViewportWidth());
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpenMenuContext(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const navigationItems = useMemo(() => {
    return getAdminNavigation(user).map((item) => ({
      ...item,
      label: messages.admin.navigation[item.key] || item.key,
    }));
  }, [messages.admin.navigation, user]);

  const primaryKeys = getPrimaryKeysForViewport(viewportWidth);
  const { overflowItems, primaryItems } = useMemo(() => {
    return distributeNavigationItems(navigationItems, pathname, primaryKeys);
  }, [navigationItems, pathname, primaryKeys]);

  const shouldShowCompactActions = viewportWidth < DESKTOP_SIGN_OUT_BREAKPOINT;
  const menuContext = `${pathname}:${primaryKeys.join("|")}`;
  const isOverflowOpen = openMenuContext === menuContext;

  return (
    <Shell>
      <Header>
        <HeaderSurface>
          <HeaderInner>
            <TopRow>
              <BrandLink href="/admin">
                <EquipLogo size={44} />
                <BrandCopy>
                  <BrandTitle>{messages.admin.title}</BrandTitle>
                  <BrandDescription>{messages.admin.description}</BrandDescription>
                </BrandCopy>
              </BrandLink>

              <UserBadge aria-label="Authenticated admin">
                <UserCopy>
                  <UserName>{user.name}</UserName>
                  <UserMeta>{user.email}</UserMeta>
                </UserCopy>
                <RolePill>{user.role.replace(/_/g, " ")}</RolePill>
              </UserBadge>

              <DesktopLogoutButton />
            </TopRow>

            <NavRow>
              <PrimaryNavScroller>
                <PrimaryNav aria-label="Admin navigation">
                  {primaryItems.map((item) => {
                    const isActive = isNavigationActive(pathname, item.href);

                    return (
                      <PrimaryNavLink
                        aria-current={isActive ? "page" : undefined}
                        href={item.href}
                        key={item.key}
                        onClick={() => setOpenMenuContext(null)}
                        $active={isActive}
                      >
                        {item.label}
                      </PrimaryNavLink>
                    );
                  })}
                </PrimaryNav>
              </PrimaryNavScroller>

              <MenuWrap ref={menuRef}>
                <OverflowButton
                  aria-controls="admin-overflow-navigation"
                  aria-expanded={isOverflowOpen}
                  aria-label={isOverflowOpen ? "Close admin menu" : "Open admin menu"}
                  onClick={() =>
                    setOpenMenuContext((currentValue) =>
                      currentValue === menuContext ? null : menuContext,
                    )
                  }
                  type="button"
                >
                  ...
                </OverflowButton>

                <OverflowMenu $open={isOverflowOpen} id="admin-overflow-navigation">
                  {overflowItems.length ? (
                    <OverflowList>
                      {overflowItems.map((item) => {
                        const isActive = isNavigationActive(pathname, item.href);

                        return (
                          <OverflowLink
                            aria-current={isActive ? "page" : undefined}
                            href={item.href}
                            key={item.key}
                            onClick={() => setOpenMenuContext(null)}
                            $active={isActive}
                          >
                            {item.label}
                          </OverflowLink>
                        );
                      })}
                    </OverflowList>
                  ) : null}

                  <OverflowActions>
                    <OverflowActionLink href={publicSiteHref} onClick={() => setOpenMenuContext(null)}>
                      Open public site
                    </OverflowActionLink>
                    {shouldShowCompactActions ? <OverflowLogoutButton /> : null}
                  </OverflowActions>
                </OverflowMenu>
              </MenuWrap>
            </NavRow>
          </HeaderInner>
        </HeaderSurface>
      </Header>

      <Main>{children}</Main>
    </Shell>
  );
}
