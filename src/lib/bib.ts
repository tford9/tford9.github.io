// Publications are sourced from BibTeX files in ../bib.
// File contents are loaded with Vite's import.meta.glob so they are bundled at
// build time — runtime fs.readdir does NOT work after Astro bundles this module.

export type Publication = {
  slug: string;
  key?: string;
  title: string;
  authors: string[];
  venue?: string;
  year?: number;
  doi?: string;
  url?: string;
  abstract?: string;
  raw?: any;
};

// Raw text of every .bib file, keyed by path. Eager so it's available synchronously.
const bibModules = import.meta.glob('../bib/*.bib', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function firstDefined<T>(...vals: Array<T | undefined | null>): T | undefined {
  for (const v of vals) if (v != null) return v as T;
  return undefined;
}

function normalizeAuthors(list: string[]): string[] {
  // BibTeX "and others" surfaces as a literal "others" author — show "et al." instead.
  const idx = list.findIndex((a) => a.toLowerCase() === 'others');
  return idx >= 0 ? [...list.slice(0, idx), 'et al.'] : list;
}

export async function getPublications(): Promise<Publication[]> {
  // Dynamically import Citation.js and its BibTeX plugin to play well with Vite/SSR.
  const coreMod: any = await import('@citation-js/core');
  await import('@citation-js/plugin-bibtex');
  const Candidate: any = coreMod?.default?.Cite ?? coreMod?.Cite ?? coreMod?.default ?? coreMod;
  const makeCite = (input: string) => {
    try { return new Candidate(input); } catch (_) { return Candidate(input); }
  };

  const texts = Object.values(bibModules);

  const pubs: Publication[] = [];
  for (const text of texts) {
    const cite = makeCite(text);
    const items = (cite?.data ?? []) as any[]; // CSL JSON items
    for (const item of items) {
      const title = (item.title ? String(item.title) : 'Untitled').replace(/[{}]/g, '');
      const key = item.id ? String(item.id) : undefined;
      const yearFromIssued = Array.isArray(item?.issued?.['date-parts']) && item.issued['date-parts'][0]?.[0]
        ? Number(item.issued['date-parts'][0][0])
        : undefined;
      const year = yearFromIssued ?? (item.year ? Number(String(item.year).match(/\d{4}/)?.[0]) : undefined);
      const venue = firstDefined<string>(
        item['container-title'], item.journalAbbreviation, item.booktitle,
        item.journal, item.conference, item.publisher,
      );
      const doi = item.DOI ? String(item.DOI) : (item.doi ? String(item.doi) : undefined);
      const url = item.URL ? String(item.URL) : (item.url ? String(item.url) : undefined);
      const abstract = item.abstract ? String(item.abstract).replace(/[{}]/g, '') : undefined;
      const authors = Array.isArray(item.author)
        ? normalizeAuthors(
            item.author
              .map((a: any) => (a.literal ? String(a.literal) : [a.given, a.family].filter(Boolean).join(' ')).trim())
              .filter(Boolean),
          )
        : [];
      const slug = slugify(key || title);
      pubs.push({ slug, key, title, authors, venue, year, doi, url, abstract, raw: item });
    }
  }

  // Sort newest first.
  pubs.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return pubs;
}

export async function getPublicationBySlug(slug: string): Promise<Publication | undefined> {
  const pubs = await getPublications();
  return pubs.find((p) => p.slug === slug);
}
