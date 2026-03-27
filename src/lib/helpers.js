// src/lib/helpers.js
// Small helper to split a vehicle title into make/model parts.
// Adjust parsing rules to match your title format (e.g., "2019 Ford Transit").
export function splitTitleToParts(title = '') {
  // Basic heuristic: remove year at start, then split remaining words
  // Example: "2019 Ford Transit" -> { make: "Ford", model: "Transit" }
  const t = (title || '').toString().trim();
  if (!t) return { make: '', model: '' };

  // Remove leading year if present
  const withoutYear = t.replace(/^\d{4}\s+/, '').trim();
  const parts = withoutYear.split(/\s+/);

  // If only one word remains, treat it as model
  if (parts.length === 1) {
    return { make: '', model: parts[0] };
  }

  // Otherwise assume first word is make, rest is model
  const make = parts[0];
  const model = parts.slice(1).join(' ');
  return { make, model };
}
