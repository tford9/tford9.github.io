import { readFile, readdir } from 'node:fs/promises';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// We'll dynamically import Citation.js inside the function to avoid SSR ESM interop issues.

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseAuthors(raw?: string): string[] {
  if (!raw) return [];
  // Split authors by " and " per BibTeX convention
  return raw
    .split(/\s+and\s+/i)
    .map((a) => a.trim())
    .filter(Boolean);
}

function firstDefined<T>(...vals: Array<T | undefined | null>): T | undefined {
  for (const v of vals) if (v != null) return v as T;
  return undefined;
}

async function readBibFiles(dir: string): Promise<string[]> {
  const entries: string[] = [];
  const files = await readdir(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.isFile() && f.name.toLowerCase().endsWith('.bib')) {
      entries.push(await readFile(join(dir, f.name), 'utf8'));
    }
  }
  return entries;
}

export async function getPublications(): Promise<Publication[]> {
  // Dynamically import Citation.js and its BibTeX plugin to play well with Vite/SSR
  const coreMod: any = await import('@citation-js/core');
  await import('@citation-js/plugin-bibtex');
  const Candidate: any = coreMod?.default?.Cite ?? coreMod?.Cite ?? coreMod?.default ?? coreMod;
  const makeCite = (input: string) => {
    try { return new Candidate(input); } catch (_) { return Candidate(input); }
  };

  // Expect .bib files at src/bib
  const bibDir = join(__dirname, '..', 'bib');
  let texts: string[] = [];
  try {
    texts = await readBibFiles(bibDir);
  } catch (_) {
    // no .bib directory; return empty list
    return [];
  }

  const pubs: Publication[] = [];
  for (const text of texts) {
    const cite = makeCite(text);
    const items = cite.data as any[]; // CSL JSON items
    for (const item of items) {
      const title = (item.title ? String(item.title) : 'Untitled').replace(/[{}]/g, '');
      const key = item.id ? String(item.id) : undefined;
      // Year from issued/date-parts or year field fallback
      const yearFromIssued = Array.isArray(item?.issued?.['date-parts']) && item.issued['date-parts'][0]?.[0]
        ? Number(item.issued['date-parts'][0][0])
        : undefined;
      const year = yearFromIssued ?? (item.year ? Number(String(item.year).match(/\d{4}/)?.[0]) : undefined);
      const venue = firstDefined<string>(item['container-title'], item.journalAbbreviation, item.publisher, item.booktitle, item.journal);
      const doi = item.DOI ? String(item.DOI) : (item.doi ? String(item.doi) : undefined);
      const url = item.URL ? String(item.URL) : (item.url ? String(item.url) : undefined);
      const abstract = item.abstract ? String(item.abstract).replace(/[{}]/g, '') : undefined;
      const authors = Array.isArray(item.author)
        ? item.author
            .map((a: any) => [a.given, a.family].filter(Boolean).join(' ').trim())
            .filter(Boolean)
        : [];
      const slug = slugify(key || title);
      pubs.push({ slug, key, title, authors, venue, year, doi, url, abstract, raw: item });
    }
  }

  // Sort newest first
  pubs.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return pubs;
}

export async function getPublicationBySlug(slug: string): Promise<Publication | undefined> {
  const pubs = await getPublications();
  return pubs.find((p) => p.slug === slug);
}
