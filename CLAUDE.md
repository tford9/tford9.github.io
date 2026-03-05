# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and research blog for Trenton W. Ford, built with Eleventy (11ty) v0.12 and Gulp. Deployed via GitHub Actions to GitHub Pages (builds to `_site/`, deployed to `gh-pages` branch).

## Build Commands

- `npm run build` - Full production build (clean, copy assets, compile CSS, build HTML, process images)
- `npm run live` - Development server with BrowserSync and file watching
- `npm run debug` - Dry run with Eleventy debug output

## Architecture

**Build pipeline:** Gulp orchestrates the build (`gulpfile.js`), calling Eleventy for HTML generation and handling CSS concatenation/minification, image processing (responsive sizes + WebP), and asset copying.

**Templating:** Nunjucks templates with markdown-it for content. The theme system lives under `site/_themes/hyde/` and is configured via `site/_data/site.js` (theme name, site title, URL).

**Key directories:**
- `site/posts/` - Blog posts (markdown), organized by year. Layout: `post.njk`. Permalinks strip date prefixes from filenames.
- `site/pages/` - Static pages (markdown): contact, publications, research, scholar. Layout: `page.njk`.
- `site/_themes/hyde/layouts/` - Nunjucks layout templates (default, page, post, sidebar, head)
- `site/_themes/hyde/css/` - Stylesheets (concatenated with highlight.js theme into `styles.css`)
- `_11ty/filters/` - Eleventy filters (dates, arrays, excerpt, rename)
- `_11ty/shortcodes/` - Eleventy shortcodes (code)

**Image processing:** Gulp generates responsive variants (720px jpg, 330px/720px/660px/990px webp) from jpg files in posts/pages. An Eleventy transform (`async-transform-images` in `.eleventy.js`) rewrites `<img>` tags in HTML output to `<picture>` elements with responsive srcsets.

**Collections:** Two collections defined in `.eleventy.js` - `pages` (from `site/pages/**/*.md`) and `posts` (from `site/posts/**/*.md`).

## Content Authoring

Posts go in `site/posts/{year}/` as markdown files. The filename format is `DD-slug.md` (date prefix is stripped for the permalink). Posts use frontmatter for title and date. Images for posts should be jpg files placed alongside the markdown file.

Pages go in `site/pages/` as markdown files with frontmatter title.
