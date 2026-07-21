// Talks & presentations. Add a new object to `talks` to list another.
// `date` is ISO (YYYY-MM-DD). Add any of slides / video / paper links as URLs.
// Entries render newest-first automatically.

export type TalkKind = "keynote" | "invited" | "conference" | "panel" | "seminar";

export interface Talk {
  title: string;
  event: string;          // conference, series, or host
  date: string;           // ISO date, e.g. "2025-04-18"
  location?: string;      // "Williamsburg, VA" or "Virtual"
  kind?: TalkKind;
  // Optional landing/materials page for this talk — e.g. a toolkit hub placed
  // in public/talks/<slug>/. Rendered as a "Materials & slides" link.
  href?: string;
  links?: {
    slides?: string;
    video?: string;
    paper?: string;
  };
  // Downloadable presentation materials. Put the files in `public/talks/`
  // and reference each by its root path. Add as many as you like:
  //   materials: [
  //     { label: "Slides (PDF)",  href: "/talks/catalyst-2026.pdf" },
  //     { label: "Slides (PPTX)", href: "/talks/catalyst-2026.pptx" },
  //     { label: "Handout",       href: "/talks/catalyst-2026-handout.pdf" },
  //   ]
  materials?: { label: string; href: string }[];
}

export const talks: Talk[] = [
  {
    title: "DOG Street AI",
    event: "The Catalyst Series · Greater Williamsburg Chamber of Commerce",
    date: "2026-07-21",
    location: "Williamsburg, VA",
    kind: "invited",
    href: "/talks/dog-street-ai/",
  },
  // NOTE: entries below are samples — replace with real talks.
  {
    title: "Human–Digital Twins and the Future of Human–AI Teaming",
    event: "DARPA Program Review",
    date: "2025-05-14",
    location: "Arlington, VA",
    kind: "invited",
  },
  {
    title: "Evaluating Large Language Models Beyond the Benchmark",
    event: "William & Mary Data Science Seminar",
    date: "2025-03-06",
    location: "Williamsburg, VA",
    kind: "seminar",
  },
  {
    title: "Computational Disinformation: Detection, Networks, and Harm",
    event: "Science Communication Panel",
    date: "2024-11-12",
    location: "Virtual",
    kind: "panel",
  },
];

export const kindLabel: Record<TalkKind, string> = {
  keynote: "Keynote",
  invited: "Invited",
  conference: "Conference",
  panel: "Panel",
  seminar: "Seminar",
};

export function sortedTalks(): Talk[] {
  return [...talks].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatTalkDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}
