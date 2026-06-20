export const BITACORA_FILTER_OPTIONS = [
  "all",
  "actividades",
  "travesia",
  "hito",
  "evento",
];

export function formatBitacoraDate(dateValue, language = "es") {
  if (!dateValue) return "";

  return new Date(`${dateValue}T12:00:00`).toLocaleDateString(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatEventDateTime(isoValue, language = "es") {
  if (!isoValue) return "";

  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCategoryStyle(category) {
  const styles = {
    actividades: "bitacora-filter-actividades",
    travesia: "bitacora-filter-travesia",
    hito: "bitacora-filter-hito",
    evento: "bitacora-filter-evento",
    gremio: "bitacora-filter-actividades",
  };

  return styles[category] || "bitacora-filter-evento";
}
