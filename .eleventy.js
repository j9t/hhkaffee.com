const { DateTime } = require("luxon");
const fs = require("fs");
const htmlmin = require("html-minifier");
const markdownIt = require("markdown-it");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(pluginRss);

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Set today’s date
  eleventyConfig.addShortcode("today", function() {
    return DateTime.now().setLocale("de").toFormat("d. MMMM yyyy");
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: "utc+1"}).setLocale("de").toFormat("d. MMMM yyyy");
  });

  // Get the first `n` elements of a collection
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  // Sort by title, https://github.com/11ty/eleventy/issues/898#issuecomment-662290629
  eleventyConfig.addFilter("sortByTitle", values => {
    return values.slice().sort((a, b) => a.data.title.localeCompare(b.data.title))
  });

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return [...tagSet];
  });

  // Create posts (“Schnack”) collection (folder-based)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getAllSorted().filter(item => item.url && ! item.inputPath.includes("index.njk") && item.inputPath.startsWith("./schnack/"));
  });

  // Create venues collection (folder-based)
  eleventyConfig.addCollection("venues", function(collectionApi) {
    return collectionApi.getAllSorted().filter(item => item.url && ! item.inputPath.includes("index.njk") && item.inputPath.startsWith("./cafes/"));
  });

  // Create favorites collection (tag-based)
  eleventyConfig.addCollection("favorites", function(collectionApi) {
    return collectionApi.getFilteredByTag("favorite");
  });

  // Create candidates collection (tag-based)
  eleventyConfig.addCollection("candidates", function(collectionApi) {
    return collectionApi.getFilteredByTag("candidate");
  });

  // Create locations collection
  eleventyConfig.addCollection("locations", function(collectionApi) {
    return collectionApi.getAll().filter(function(item) {
      return "locations" in item.data;
    });
  });

  // Copy certain folders to the output
  eleventyConfig.addPassthroughCopy({"root": "/"});
  eleventyConfig.addPassthroughCopy("media");
  eleventyConfig.addPassthroughCopy("setup");
  eleventyConfig.addPassthroughCopy("VERSION");

  // Customize Markdown library and settings
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // https://www.11ty.dev/docs/dev-server/
  eleventyConfig.setServerOptions({
    liveReload: true,
    domDiff: true,
    port: 8080,
    watch: [],
    showAllHosts: false,
    https: {
      // key: "./localhost.key",
      // cert: "./localhost.cert",
    },
    encoding: "utf-8",
  });

  eleventyConfig.addTransform("htmlmin", function(content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        continueOnParseError: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        preventAttributesEscaping: true,
        processConditionalComments: true,
        quoteCharacter: "\"",
        // removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortClassName: true,
        useShortDoctype: true
      });
      return minified;
    }
    return content;
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html"
    ],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    // pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with… (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with… (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Opt-out of pre-processing global data JSON files (default: `liquid`)
    dataTemplateEngine: false,

    // Define otherwise optional settings
    dir: {
      input: ".",
      includes: "_views",
      data: "_data",
      output: "_export"
    }
  };
};