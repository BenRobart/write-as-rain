# Before this site goes live

Nothing is blocking. The only step that can't be done from a text editor is sending one
real message through the contact form (§2) once you're happy — that's the sole way to
find out it works.

## 1. ~~The domain~~ — done

The site is live at **https://writeasrain.github.io/**, served from the
`writeasrain/writeasrain.github.io` repo. All 169 placeholders across 22 files were
replaced: canonicals, Open Graph URLs, sitemap entries, schema `@id`s, `robots.txt`,
`llms.txt`, and the contact form's hidden `_next` redirect.

No `CNAME` file is needed — `github.io` is served over HTTPS by default. One consequence
worth knowing: a `hello@` address is **not** possible on `github.io`, because the domain
is GitHub's and has no MX records you can point anywhere. The contact email stays
`writeasrainuk@gmail.com` unless a real domain gets bought later.

## 2. ~~The contact form~~ — done

`index.html` now posts to a real Formspree endpoint. Worth sending one test message
after the domain change, since that's the only way to find out it works.

## 3. ~~Verify the UCAS three-question format~~ — verified August 2026

Checked against UCAS directly: three questions, **4,000 characters total**, **minimum 350
per question**, and the questions themselves don't count toward the limit. Both
`ucas-personal-statement.html` and `medicine-personal-statement.html` state this correctly,
and their wording of the three questions matches UCAS's own. The earlier October deadline
for medicine, dentistry, veterinary science and Oxbridge is right, and both pages hedge it
properly by telling readers to confirm the date for their cycle.

**Re-check this every cycle.** It remains the one factual claim on the site with a shelf
life — UCAS sets these rules and has changed them before.

## Prices invented for the two new services

`book-blurb-writing.html` (£120, £90 with an edit, £90 per further book in a series) and
`cover-letter-writing.html` (£30, £95 with a CV, £140 with CV and LinkedIn) are new
revenue lines with no existing price to inherit, so those numbers were chosen to ladder
sensibly against the CV pricing. They appear on the page, in `pricing.html`, in the
homepage `#services` accordions, in the homepage `makesOffer` schema, and in `llms.txt`.
Change them in all five places or none.

`document-writing-service.html` (from £30 for a letter or single page, longer documents
quoted flat, tidy-ups cheaper) is the same situation: a new revenue line with no existing
price to inherit. It appears on the page, in `pricing.html`, in the homepage `#services`
accordion, in the homepage `makesOffer` schema, and in `llms.txt`. Change it in all five
places or none.

The cover letter came down to £30 to match, so the two no longer compete on price. Both
pages still say a letter written to a job advert is a different job - it's answered
against a person specification and scored - so people route themselves to the right page.
If the prices ever diverge again, that wording needs to carry the difference explicitly,
or applicants will read two prices for what looks like the same thing.

The bundles moved with it: CV and letter £110 -> £95, and CV, LinkedIn, and letter
£150 -> £140. Both keep the £10 saving against buying the pieces separately, which is
where the old numbers came from.

One number worth a second look: a supporting statement sits in the same £30 tier as a
cover letter, and it is not the same amount of work. An NHS or local government statement
answered criterion by criterion against a person specification often runs to 1,000-2,000
words, against maybe 400 for a letter. Splitting them - the letter at £30, statements at
£60 or quoted on length - would price the work rather than the format. Left alone for now
because it's a pricing decision, not a copy one.

The page also commits to same-day or next-day turnaround on letters and two to three days
on longer documents, which is a delivery promise rather than a price - worth confirming
you want to be held to it.

`executive-ghostwriting.html` is now two tiers rather than one: £300 a month for the
conversation and four posts, £500 for eight, or four and a newsletter. The single £500
retainer it started as is still there as the full package; what's new underneath it is a
cheaper way in, which matters because this is the one service where a first client can
never be shown any proof - no case studies, no portfolio, no names, by design.

The tiering isn't linear on purpose. The monthly conversation costs the same whether it
produces four pieces or eight, so four is £300 rather than £250. The page says that
outright instead of leaving people to work out why the maths looks odd.

The page justifies the per-word rate rather than asserting it: short-form writing costs
more per word than long-form, because a 200-word post has to carry an idea, land it above
the LinkedIn fold, and sound like a specific person, with nothing spare to cut. It cites
two of this site's own published prices as evidence - a 150-word blurb at £120 against a
60,000-word copyedit at £350 - so the argument can be checked rather than taken on trust.
That reasoning is what stops it contradicting the £117 per 1,000 words on book
ghostwriting, which is long-form and includes the interviews.

Worth knowing what it does NOT try to reconcile with: the £30 cover letter. Both are short,
one is £30 and one is about £60 a piece. The distinction is one-off consumer work against a
business retainer, and the two never appear side by side except in different panels on the
pricing page. Deliberately not addressed anywhere in the copy, because answering it would
join up two things no real buyer is comparing.

For context if you revisit: UK LinkedIn ghostwriting retainers commonly run £1,000 and up,
so £300-£500 still sits at the entry end of that market.

`book-ghostwriting.html` carries the biggest invented numbers on the site by a wide margin,
and they need your sign-off before anything goes live: £450 for a chapter plan and sample
chapter (deducted from the total), £3,500 up to 30,000 words, £7,000 up to 60,000, then
£120 per additional 1,000. Those three work out at a consistent ~£117 per 1,000 words, so
the ladder holds if you move one - move all of them. UK ghostwriting rates run from roughly
£5,000 at the newer end to £30,000+ for established names, so this sits deliberately low.
Worth checking against what you'd actually accept for six to nine months of work, because
a full-length book at £7,000 is around £800 a month if it takes nine.

It also commits to terms, not just prices: staged quarters, the client keeping everything
if they stop, no royalties or rights taken, and sole credit by default. Those are the parts
a client will hold you to.

Knock-on: `memoir-life-story.html` and `pricing.html` both used to say interview-based life
story work was "quoted, flat". They now say "from £3,500" and point at the ghostwriting
page, because publishing a band on one page and refusing to on another is the kind of thing
people notice.

`pricing.html` also commits to three policies that weren't written down anywhere before:
no rush surcharge, no series discount, and splitting a long invoice being a normal
request. All three are consistent with how the rest of the site talks, but they are
policies, so they're yours to confirm or cut.

---

## After launch

- **Submit `sitemap.xml` in Google Search Console.** The property is already verified via
  `google99d958bd68ae300d.html` at the repo root — leave that file there permanently, as
  Google re-checks it and un-verifies the property if it vanishes.
- **Add the site to Bing Webmaster Tools.** Bing can import a verified GSC property, which
  is faster than verifying from scratch.
- ~~`og:image` and favicon~~ — done. `og-image.png` (1200×630) on all 19 content pages,
  plus `favicon.ico` and `apple-touch-icon.png`. Regenerate any of them from `favicon.svg`
  with `python scripts/build-icons.py`.
- **Analytics is live**: GA4 `G-4W3Q03PS05` and Clarity `xw679pu73i`, on all 21 pages.
  Confirm both are receiving hits a day or so after launch — a tag that silently fails is
  worse than no tag, because you'll trust the empty numbers.
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
