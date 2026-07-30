# Before this site goes live

Three things must be replaced. Nothing else is blocking.

## 1. The domain — 82 placeholders across 14 files

Every canonical URL, Open Graph URL, sitemap entry and schema `@id` currently says
`REPLACE-DOMAIN`. **A wrong canonical tag is worse than none at all**, so this has to be
done before the site is indexed.

From this folder, in Git Bash:

```bash
grep -rl 'REPLACE-DOMAIN' . | xargs sed -i 's|REPLACE-DOMAIN|writeasrain.co.uk|g'
```

(substituting your actual domain, no `https://` and no trailing slash — those are already
in the files). Then check nothing was missed:

```bash
grep -rn 'REPLACE-DOMAIN' . || echo "all clear"
```

## 2. The contact form — `index.html`

`action="https://formspree.io/f/YOUR_FORM_ID"` is still a placeholder, so **the form
currently does nothing**. Create a new Formspree form for this site (separate from the dev
site's, so the two enquiry streams stay apart) and paste the ID in.

## 3. Verify the UCAS three-question format

`ucas-personal-statement.html` states that from 2026 entry UCAS replaced the single
personal statement with three questions, 4,000 characters total, minimum 350 per question.
Confirm the exact wording and limits on the UCAS site for the current cycle before
publishing — the page already tells readers to do the same, but the page itself should
be right. This is the one factual claim on the site that has a shelf life.

---

## After launch

- Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Add an `og:image` (1200×630) and a favicon. Social shares are currently text-only.
- Set up a Google Business Profile if you want to appear in local "editor near me" results.

## Note on FAQ schema

Every page carries valid `FAQPage` structured data. Since Google's August 2023 change,
**FAQ rich results only display for government and health sites**, so don't expect the
expandable Q&A to appear under your listing. The schema is still worth having: it feeds
AI Overviews, ChatGPT/Perplexity-style answers (which is also what `llms.txt` is for),
and People Also Ask. The FAQ *content* is doing the real SEO work, not the markup.

## Adding another niche page later

Copy any existing niche page as a template. Every one of them needs:

1. Unique `<title>`, `<meta name="description">`, and `rel="canonical"`.
2. `BreadcrumbList` + `Service` + `FAQPage` JSON-LD (the FAQ entries must match the
   visible questions exactly — Google treats a mismatch as a violation).
3. A card added to the `#who-i-help` grid in `index.html`, a link in the footer list,
   an entry in `sitemap.xml`, and an entry in `llms.txt`.

Styles and scripts are shared via `styles.css` and `site.js` — don't inline them again.
