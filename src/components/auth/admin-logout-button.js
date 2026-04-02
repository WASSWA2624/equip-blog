"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styled from "styled-components";

const Button = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: white;
  cursor: pointer;
  min-height: 42px;
  padding: 0.65rem 1rem;

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
`;

export default function AdminLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startNavigation] = useTransition();

  async function handleLogout() {
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Could not sign out.");
        return;
      }

      startNavigation(() => {
        router.replace("/admin/login");
        router.refresh();
      });
    } catch {
      setError("Could not sign out.");
    }
  }

  return (
    <Button aria-label={error || "Sign out of the admin area"} disabled={isPending} onClick={handleLogout} type="button">
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
