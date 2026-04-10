/**
 * Open Library cover image fetching.
 * Fallback chain: ISBN → title+author search → null
 */

const OL_COVERS = "https://covers.openlibrary.org";
const OL_SEARCH = "https://openlibrary.org/search.json";

/**
 * Try to get a cover URL from Open Library.
 * Returns the URL string or null if not found.
 */
export async function fetchCoverUrl(
  isbn: string | null,
  title: string,
  author: string
): Promise<string | null> {
  // 1) Try ISBN first (most reliable)
  if (isbn) {
    const url = `${OL_COVERS}/b/isbn/${isbn}-L.jpg?default=false`;
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.ok) return `${OL_COVERS}/b/isbn/${isbn}-L.jpg`;
    } catch {}
  }

  // 2) Search by title + author to find an OLID
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const searchUrl = `${OL_SEARCH}?q=${query}&fields=cover_i,isbn&limit=1`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const data = await res.json();
      const doc = data.docs?.[0];
      if (doc?.cover_i) {
        return `${OL_COVERS}/b/id/${doc.cover_i}-L.jpg`;
      }
      // Try first ISBN from search results
      const foundIsbn = doc?.isbn?.[0];
      if (foundIsbn) {
        return `${OL_COVERS}/b/isbn/${foundIsbn}-L.jpg`;
      }
    }
  } catch {}

  return null;
}
