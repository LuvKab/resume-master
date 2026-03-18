import { normalizeLinkHref } from "@/lib/richText";

const getPhoneHref = (value: string) => {
  const compact = value.trim();
  if (!compact) return null;

  const withPlus = compact.replace(/[^\d+]/g, "");
  const normalized = withPlus.startsWith("+")
    ? `+${withPlus.slice(1).replace(/\+/g, "")}`
    : withPlus.replace(/\+/g, "");
  const digitsOnly = normalized.replace(/\D/g, "");

  if (digitsOnly.length < 5) {
    return null;
  }

  return `tel:${normalized}`;
};

export const resolveBasicFieldHref = (
  key: string,
  value: string,
  isCustom = false
) => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  if (key === "phone") {
    return getPhoneHref(normalizedValue);
  }

  if (key === "email" || isCustom) {
    return normalizeLinkHref(normalizedValue);
  }

  return null;
};

export const isExternalHref = (href: string | null) =>
  Boolean(href && /^https?:\/\//i.test(href));
