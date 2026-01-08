# Built by Denny - Blog System

## Overview

The blog system allows Denny to publish articles directly to the website. Posts are stored as individual HTML files in the `/blog/` folder.

## File Structure

```
blog/
├── index.html          ← Blog listing page (shows all posts)
├── README.md           ← This documentation
└── [post-slug].html    ← Individual blog posts
```

## How It Works

1. **Writing Posts**: Use the admin dashboard at `/admin/` to write and publish posts
2. **Storage**: Posts are saved as static HTML files in this folder
3. **Images**: Blog images are stored in `/images/blog/`
4. **Listing**: The blog index automatically displays all published posts

## URL Structure

- Blog home: `https://builtbydenny.com/blog/`
- Individual post: `https://builtbydenny.com/blog/post-slug.html`

## Post File Naming

Posts use URL-friendly slugs:
- "Why Roll-In Showers Matter" → `why-roll-in-showers-matter.html`
- "VA SAH Grant Guide 2026" → `va-sah-grant-guide-2026.html`

## SEO Features

Each post includes:
- Meta description (auto-generated or custom)
- Open Graph tags for social sharing
- Article schema markup for search engines
- Canonical URLs

## Adding Posts Manually

If needed, copy an existing post file and update:
1. Title (in `<title>` and `<h1>`)
2. Meta description
3. Content
4. Date
5. Schema markup
6. Filename (slug)

Then add the post to `index.html` in the posts grid.

## Related Files

- `/css/blog.css` - Blog-specific styles
- `/admin/` - Admin dashboard for writing posts
- `/images/blog/` - Blog post images
