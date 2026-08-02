# Before this site goes live

One thing left — the UCAS check in §3. Nothing else is blocking.

## 1. ~~The domain~~ — done

The site is live at **https://writeasrain.github.io/**, served from the
`writeasrain/writeasrain.github.io` repo. All 169 placeholders across 22 files were
replaced: canonicals, Open Graph URLs, sitemap entries, schema `@id`s, `robots.txt`,
`llms.txt`, and the contact form's hidden `_next` redirect.

No `CNAME` file is needed — `github.io` is served over HTTPS by default. One consequence
worth knowing: a `hello@` address is **not** possible on `github.io`, because the domain
is GitHub's and has no MX records you can point anywhere. The contact email stays
`robartben@gmail.com` unless a real domain gets bought later.

## 2. ~~The contact form~~ — done

`index.html` now posts to a real Formspree endpoint. Worth sending one test message
after the domain change, since that's the only way to find out it works.

## 3. Verify the UCAS three-question format

`ucas-personal-statement.html` states that from 2026 entry UCAS replaced the single
personal statement with three questions, 4,000 characters total, minimum 350 per question.
Confirm the exact wording and limits on the UCAS site for the current cycle before
publishing — the page already tells readers to do the same, but the page itself should
be right. This is the one factual claim on the site that has a shelf life.

`medicine-personal-statement.html` repeats the same three questions and adds the earlier
October deadline for medicine, dentistry, veterinary science and Oxbridge. Same check,
same page on the UCAS site.

## Prices invented for the two new services

`book-blurb-writing.html` (£120, £90 with an edit, £90 per further book in a series) and
`cover-letter-writing.html` (£45, £110 with a CV, £150 with CV and LinkedIn) are new
revenue lines with no existing price to inherit, so those numbers were chosen to ladder
sensibly against the CV pricing. They appear on the page, in `pricing.html`, in the
homepage `#services` accordions, in the homepage `makesOffer` schema, and in `llms.txt`.
Change them in all five places or none.

`pricing.html` also commits to three policies that weren't written down anywhere before:
no rush surcharge, no series discount, and splitting a long invoice being a normal
request. All three are consistent with how the rest of the site talks, but they are
policies, so they're yours to confirm or cut.

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
4. The shared nav, which now carries a `prices` link between `services` and `who I help`
   on all 19 pages. Copying an existing page brings it along; writing one from scratch
   doesn't.
5. Links *into* the new page from wherever it's relevant. A page nothing links to is a
   page Google treats as an orphan, and readers never find it either.

Styles and scripts are shared via `styles.css` and `site.js` — don't inline them again.
New illustrations go in the sprite at the top of `site.js`, with the viewBox origin at
`0 0`; the pricing calculator is also in `site.js` and does nothing on pages without a
`#calc-words` input.
