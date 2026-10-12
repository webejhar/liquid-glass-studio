import { useEffect } from "react";

/**
 * Sets document title and meta/OG descriptions for a page.
 * Prefer this in pages where adding a <SEOHead /> JSX element is awkward.
 */
export function useSEO(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | Webejhar`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) metaDesc.setAttribute("content", description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${title} | Webejhar`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute("content", description);
  }, [title, description]);
}
