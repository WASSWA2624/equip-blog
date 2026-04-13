function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function dedupeStrings(values) {
  return [...new Set((values || []).map((value) => trimText(value)).filter(Boolean))];
}

export function normalizePositiveInteger(value, fallback = 1) {
  const parsedValue = Number.parseInt(trimText(`${value ?? ""}`), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export function formatEquipmentDisplayName(value) {
  const trimmedValue = trimText(value);

  if (!trimmedValue) {
    return "";
  }

  if (/[A-Z]/.test(trimmedValue)) {
    return trimmedValue;
  }

  const firstLetterIndex = trimmedValue.search(/[a-z]/i);

  if (firstLetterIndex === -1) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, firstLetterIndex)}${trimmedValue
    .charAt(firstLetterIndex)
    .toUpperCase()}${trimmedValue.slice(firstLetterIndex + 1)}`;
}

export function formatEquipmentAwareTitle(title, equipmentName) {
  const normalizedTitle = trimText(title);
  const normalizedEquipmentName = trimText(equipmentName);
  const displayEquipmentName = formatEquipmentDisplayName(normalizedEquipmentName);

  if (!normalizedTitle) {
    return displayEquipmentName;
  }

  if (!normalizedEquipmentName || !displayEquipmentName) {
    return normalizedTitle;
  }

  if (normalizedTitle.toLowerCase().startsWith(normalizedEquipmentName.toLowerCase())) {
    return `${displayEquipmentName}${normalizedTitle.slice(normalizedEquipmentName.length)}`;
  }

  return normalizedTitle;
}
