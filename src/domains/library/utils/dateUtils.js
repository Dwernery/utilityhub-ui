export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    return new Date(y, mo, d);
  }
  const dt = new Date(dateStr);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const formatDate = (dateStr) => {
  const dt = parseLocalDate(dateStr);
  if (!dt) return "—";
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};