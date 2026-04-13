import Image from "next/image";
import styled from "styled-components";

import { getRenderableImageUrl } from "@/lib/media";

const ImageFrame = styled.div`
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  background: linear-gradient(180deg, rgba(248, 250, 253, 0.96), rgba(241, 245, 249, 0.98));
  border: 1px solid rgba(16, 32, 51, 0.08);
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const FallbackImage = styled.img`
  display: block;
  height: 100%;
  object-fit: ${({ $fit }) => $fit};
  width: 100%;
`;

function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getAspectRatio(image) {
  const width = Number.parseInt(`${image?.width ?? ""}`.trim(), 10);
  const height = Number.parseInt(`${image?.height ?? ""}`.trim(), 10);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "16 / 9";
  }

  return `${width} / ${height}`;
}

function isAbsoluteUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function toLocalImageSrc(value) {
  const normalizedValue = trimText(value);

  if (!normalizedValue || normalizedValue.startsWith("data:")) {
    return null;
  }

  if (normalizedValue.startsWith("/")) {
    return normalizedValue;
  }

  if (!isAbsoluteUrl(normalizedValue)) {
    return null;
  }

  const url = new URL(normalizedValue);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : null;

  if (!appUrl || url.origin !== appUrl.origin) {
    return null;
  }

  return `${url.pathname}${url.search}`;
}

export default function ContentImage({
  image,
  fit = "cover",
  priority = false,
  sizes = "100vw",
}) {
  const src = getRenderableImageUrl(image?.url, {
    alt: image?.alt,
    caption: image?.caption,
    height: image?.height,
    sourceUrl: image?.url,
    width: image?.width,
  });

  if (!src) {
    return null;
  }

  const localSrc = toLocalImageSrc(src);
  const aspectRatio = getAspectRatio(image);

  return (
    <ImageFrame $aspectRatio={aspectRatio}>
      {localSrc ? (
        <Image
          alt={image?.alt || image?.caption || "Guide image"}
          fill
          priority={priority}
          sizes={sizes}
          src={localSrc}
          style={{ objectFit: fit }}
        />
      ) : (
        <FallbackImage
          $fit={fit}
          alt={image?.alt || image?.caption || "Guide image"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          src={src}
        />
      )}
    </ImageFrame>
  );
}
