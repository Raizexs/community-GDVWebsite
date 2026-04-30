export const resolveLocalizedValue = (value, language = "es") => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    const normalizedLanguage = String(language || "es").toLowerCase();
    const shortLanguage = normalizedLanguage.split("-")[0];

    if (value[normalizedLanguage]) {
      return value[normalizedLanguage];
    }

    if (value[shortLanguage]) {
      return value[shortLanguage];
    }

    if (value.es) {
      return value.es;
    }

    if (value.en) {
      return value.en;
    }
  }

  return "";
};
