"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 100vh;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg} 0;
  position: sticky;
  top: 0;
  z-index: 40;
`;

const HeaderInner = styled.div`
  backdrop-filter: blur(22px);
  background:
    linear-gradient(135deg, rgba(16, 32, 51, 0.96), rgba(0, 95, 115, 0.94)),
    radial-gradient(circle at top right, rgba(242, 179, 90, 0.18), transparent 44%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 24px 70px rgba(16, 32, 51, 0.24);
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 auto;
  max-width: 1280px;
  padding: 0.92rem 1rem;
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
  color: white;
  display: inline-flex;
  gap: 0.82rem;
  min-width: 0;
`;

const BrandCopy = styled.span`
  display: grid;
  gap: 0.18rem;
  min-width: 0;
`;

const Title = styled.span`
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
  line-height: 1.45;
  margin: 0;
`;

const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const UserBadge = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${({ theme }) => theme.radius.md};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 100%;
  padding: 0.48rem 0.72rem;
`;

const UserCopy = styled.div`
  display: grid;
  gap: 0.12rem;
  min-width: 0;
`;

const UserName = styled.strong`
  color: white;
  font-size: 0.94rem;
  line-height: 1.1;
`;

const UserMeta = styled.span`
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.8rem;
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
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.34rem 0.6rem;
  text-transform: uppercase;
  white-space: nowrap;
`;

const NavScroller = styled.div`
  overflow-x: auto;
  padding-bottom: 0.12rem;
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
  background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.08)")};
  border: 1px solid ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.12)")};
  border-radius: 999px;
  color: ${({ $active }) => ($active ? "#fff5df" : "white")};
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.48rem 0.78rem;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
  }
`;

const Footer = styled.footer`
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
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
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 1.15rem 1.2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};

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
  line-height: 1.68;
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
  gap: 0.55rem;
`;

const FooterLink = styled(Link)`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: white;
  display: inline-flex;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.42rem 0.74rem;
`;

const FooterBottom = styled.div`
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
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
  const adminNav = getAdminNavigation(user);
  const publicSiteHref = buildLocaleRootPath(defaultLocale);

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <TopRow>
            <BrandLink href="/admin">
              <EquipLogo size={42} />
              <BrandCopy>
                <Title>{messages.admin.title}</Title>
                <Description>{messages.admin.description}</Description>
              </BrandCopy>
            </BrandLink>

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
          </TopRow>

          <NavScroller>
            <Nav aria-label="Admin navigation">
              {adminNav.map((item) => {
                const isActive = isNavigationActive(pathname, item.href);

                return (
                  <NavLink
                    aria-current={isActive ? "page" : undefined}
                    href={item.href}
                    key={item.key}
                    $active={isActive}
                  >
                    {messages.admin.navigation[item.key] || item.key}
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
