"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const recentViewTtlMs = 3000;

function buildTrackingKey({ eventType, path, postId }) {
  return `equip-blog:view:${eventType}:${postId || "none"}:${path}`;
}

function shouldSkipRecentDuplicate(key, now) {
  try {
    const previousTimestamp = Number.parseInt(sessionStorage.getItem(key) || "", 10);

    if (Number.isFinite(previousTimestamp) && now - previousTimestamp < recentViewTtlMs) {
      return true;
    }

    sessionStorage.setItem(key, `${now}`);
    return false;
  } catch {
    return false;
  }
}

export default function PublicViewTracker({ eventType, locale, postId = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();
  const path = `${pathname || `/${locale}`}${search ? `?${search}` : ""}`;

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const now = Date.now();
    const trackingKey = buildTrackingKey({
      eventType,
      path,
      postId,
    });

    if (shouldSkipRecentDuplicate(trackingKey, now)) {
      return;
    }

    void fetch("/api/analytics/views", {
      body: JSON.stringify({
        eventType,
        locale,
        path,
        ...(postId ? { postId } : {}),
        ...(document.referrer ? { referrer: document.referrer } : {}),
      }),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    }).catch(() => {});
  }, [eventType, locale, path, pathname, postId]);

  return null;
}
