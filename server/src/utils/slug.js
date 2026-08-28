// Why does this file exist? Slug generation utility for public form URLs; pure function, reusable.

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50) || "form";
}

export function generateSlug(title) {
  const base = slugify(title);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}
