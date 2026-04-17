export function extractRows(praxsuiteBody) {
  if (!praxsuiteBody) return [];

  if (Array.isArray(praxsuiteBody?.data)) return praxsuiteBody.data;
  if (Array.isArray(praxsuiteBody?.rows)) return praxsuiteBody.rows;
  if (Array.isArray(praxsuiteBody?.result)) return praxsuiteBody.result;

  const safeFirstArray = (value, depth = 0) => {
    if (depth > 5) return null;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      for (const key of Object.keys(value)) {
        const found = safeFirstArray(value[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const nestedArray = safeFirstArray(praxsuiteBody);
  return Array.isArray(nestedArray) ? nestedArray : [];
}

