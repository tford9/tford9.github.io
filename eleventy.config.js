import glob from 'fast-glob';
import hljs from 'highlight.js';
import markdownIt from 'markdown-it';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import markdownItAttrs from 'markdown-it-attrs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import siteData from './site/_data/site.js';
const site = siteData;
const theme = '_themes/' + (process.env.THEME || site.theme);

export default function(eleventyConfig) {

  // Markdown engine with its plugins
  const Markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, {language: lang}).value;
        } catch (__) {}
      }
      return '';
    }
  })
    .use(markdownItEmoji)
    .use(markdownItLinkAttributes, {
      pattern: /^(https?:)?\/\//,
      attrs: {
        target: '_blank',
        rel: 'noopener'
      }
    })
    .use(markdownItAttrs, {
      allowedAttributes: ['id', 'class']
    });
  eleventyConfig.setLibrary('md', Markdown);

  // Nunjucks configuration
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,
    lstripBlocks: true
  });

  // Filters
  glob.sync(['_11ty/filters/*.cjs', `site/${theme}/filters.cjs`]).forEach(file => {
    let filters = require('./' + file);
    Object.keys(filters).forEach(name => eleventyConfig.addFilter(name, filters[name]));
  });

  // Shortcodes
  glob.sync(['_11ty/shortcodes/*.cjs', `site/${theme}/shortcodes.cjs`]).forEach(file => {
    let shortcodes = require('./' + file);
    Object.keys(shortcodes).forEach(name => eleventyConfig.addShortcode(name, shortcodes[name]));
  });

  // PairedShortcodes
  glob.sync(['_11ty/pairedShortcodes/*.cjs', `site/${theme}/pairedShortcodes.cjs`]).forEach(file => {
    let pairedShortcodes = require('./' + file);
    Object.keys(pairedShortcodes).forEach(name => eleventyConfig.addPairedShortcode(name, pairedShortcodes[name]));
  });

  // Collections
  eleventyConfig.addCollection('pages', (collectionApi) => collectionApi.getFilteredByGlob('site/pages/**/*.md'));
  eleventyConfig.addCollection('posts', (collectionApi) => collectionApi.getFilteredByGlob('site/posts/**/*.md'));

  // Transforms
  const {suffix} = require('./_11ty/filters/rename.cjs');
  eleventyConfig.addTransform('async-transform-images', async (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      let lazy = 0;
      return content.replace(/(<article .*?data-input-path="(.*?)".*?>)([\s\S]*?)(<\/article>)/gim, (match, openingtag, inputPath, innerContent, closingtag) => {
        let imagePath = inputPath.match(/(?:\/posts(\/\d{4}\/\d{2}\/)|\/pages\/)[^\/]*/);
        imagePath = (imagePath) ? (imagePath[1] ? imagePath[1] : '/') : '';
        innerContent = innerContent.replace(/<img src="(?!https?:\/\/)(.*?).jpg" alt="(.*?)">/g, (match, src, alt) => {
          return `<picture><source type="image/webp" srcset="${suffix(`/images${imagePath}${src}.webp`, '-330x')} 330w, ${suffix(`/images${imagePath}${src}.webp`, '-720x')} 720w, ${suffix(`/images${imagePath}${src}.webp`, '-330x@2x')} 2x, ${suffix(`/images${imagePath}${src}.webp`, '-330x@3x')} 3x"><img src="${suffix(`/images${imagePath}${src}.jpg`, '-720x')}" alt="${alt}"${lazy++ ? ' loading="lazy"' : ''}></picture>`
        })
        return `${openingtag}${innerContent}${closingtag}`;
      });
    }
    return content;
  });

  return {
    templateFormats: ['html', 'md', 'njk', '11ty.js'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    dir: {
      input: './site',
      includes: `${theme}/layouts`,
      data: '_data',
      output: './_site'
    }
  }
};
