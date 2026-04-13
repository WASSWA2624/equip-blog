function normalizePhoneCharacters(value) {
  return `${value || ""}`.trim().replace(/[^\d+]/g, "");
}

export function normalizeWhatsAppNumber(value) {
  const normalizedValue = normalizePhoneCharacters(value);

  if (!normalizedValue) {
    return null;
  }

  const digitsOnly = normalizedValue.startsWith("+")
    ? normalizedValue.slice(1)
    : normalizedValue;

  if (!/^\d{8,15}$/.test(digitsOnly)) {
    return null;
  }

  return digitsOnly;
}

export function buildWhatsAppContactHref(phoneNumber, message = "") {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);

  if (!normalizedNumber) {
    return null;
  }

  const normalizedMessage = `${message || ""}`.trim();
  const searchParams = new URLSearchParams();

  if (normalizedMessage) {
    searchParams.set("text", normalizedMessage);
  }

  const query = searchParams.toString();

  return `https://wa.me/${normalizedNumber}${query ? `?${query}` : ""}`;
}
