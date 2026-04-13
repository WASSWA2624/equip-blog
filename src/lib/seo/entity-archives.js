import { formatEquipmentDisplayName } from "@/lib/content/presentation";

function getEntityDisplayName(entity, entityKind) {
  if (!entity?.name) {
    return "";
  }

  return entityKind === "equipment" ? formatEquipmentDisplayName(entity.name) : entity.name;
}

function getEntityArchiveLabel(entityKind) {
  if (entityKind === "category") {
    return "Category archive";
  }

  if (entityKind === "manufacturer") {
    return "Manufacturer archive";
  }

  return "Equipment archive";
}

export function buildEntityArchiveTitle(entityKind, entity) {
  const name = getEntityDisplayName(entity, entityKind);

  if (!name) {
    return entityKind === "category"
      ? "Category archive"
      : entityKind === "manufacturer"
        ? "Manufacturer archive"
        : "Equipment archive";
  }

  if (entityKind === "category") {
    return `${name} guides`;
  }

  if (entityKind === "manufacturer") {
    return `${name} equipment guides`;
  }

  return `${name} guides`;
}

export function buildEntityArchiveDescription({ entity, entityKind, totalItems = 0 } = {}) {
  const name = getEntityDisplayName(entity, entityKind);
  const quantityPrefix = totalItems > 0 ? `Browse ${totalItems} published guides` : "Browse published guides";

  if (entityKind === "category") {
    return entity?.description
      ? `${quantityPrefix} filed under ${name}. ${entity.description}`
      : `${quantityPrefix} filed under ${name}, with connected equipment and manufacturer context.`;
  }

  if (entityKind === "manufacturer") {
    return entity?.primaryDomain
      ? `${quantityPrefix} connected to ${name}. Verified manufacturer context includes ${entity.primaryDomain}.`
      : `${quantityPrefix} connected to ${name}, including related equipment and category pathways.`;
  }

  return entity?.description
    ? `${quantityPrefix} for ${name}. ${entity.description}`
    : `${quantityPrefix} for ${name}, including explainers, maintenance notes, and related manufacturer coverage.`;
}

export function buildEntityArchivePageContent({ entity, entityKind, totalItems = 0 } = {}) {
  return {
    description: buildEntityArchiveDescription({
      entity,
      entityKind,
      totalItems,
    }),
    discoveryDescription:
      "Follow connected taxonomy and entity hubs to move from a single archive page into broader published coverage.",
    discoveryTitle: "Keep exploring",
    eyebrow: getEntityArchiveLabel(entityKind),
    resultsTitle: "Published guides",
    title: buildEntityArchiveTitle(entityKind, entity),
  };
}
