// Courses taught. Add a new object to `courses` to list another course.
// `href` may be an EXTERNAL course website (set external: true) or an internal
// path on this site (e.g. "/data601"). Leave `href` off for a course with no
// page yet. Entries are grouped on the Teaching page by `status`.

export type CourseStatus = "active" | "upcoming" | "past";

export interface Course {
  code: string;            // e.g. "DATA 601"
  title: string;           // e.g. "Foundations of Data Science"
  term: string;            // e.g. "Fall 2025"
  institution?: string;    // defaults to William & Mary
  level?: string;          // e.g. "Graduate"
  description: string;     // one or two sentences
  href?: string;           // course website or internal page
  external?: boolean;      // true if href points off-site
  status: CourseStatus;
}

export const courses: Course[] = [
  {
    code: "DATA 601",
    title: "Foundations of Data Science",
    term: "Fall 2025",
    level: "Graduate",
    description:
      "Graduate introduction to data science: the tools, methods, and habits of mind for working with data responsibly.",
    href: "/data601",
    status: "active",
  },
  // Example of linking an external course website — edit or remove:
  // {
  //   code: "DATA 440",
  //   title: "Networks & Society",
  //   term: "Spring 2026",
  //   level: "Undergraduate",
  //   description: "Network science and its social consequences.",
  //   href: "https://example.com/data440",
  //   external: true,
  //   status: "upcoming",
  // },
];

export const statusOrder: CourseStatus[] = ["active", "upcoming", "past"];
export const statusLabel: Record<CourseStatus, string> = {
  active: "Currently teaching",
  upcoming: "Upcoming",
  past: "Previously taught",
};

export function coursesByStatus(status: CourseStatus): Course[] {
  return courses.filter((c) => c.status === status);
}
