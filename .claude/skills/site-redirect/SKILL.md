---
name: site-redirect
description: Create, change, or remove a tracked redirect path on this site — a short URL like /ig_bio or /ig_post_03 that forwards to a real page with UTM tags attached, so the visit is attributable in Google Analytics. Use whenever the user asks for a redirect, short link, vanity URL, "link for a post", a link for the Instagram bio, or a way to tell where traffic came from. Also use when auditing or deleting existing redirects, since REDIRECTS.md must stay in step with the files.
---

# Site redirects

This site is hosted on GitHub Pages, which is a **static host with no
server-side redirects**. There is no `.htaccess`, no `_redirects` file (that's
Netlify), and no server config to edit. A redirect is therefore a real page at
the redirect path that bounces the visitor onward itself.

`/ig_bio` is the reference implementation. Read
[../../../ig_bio/index.html](../../../ig_bio/index.html) before building a new
one — the comments in it explain each decision.

## How a redirect is structured

Every redirect is a directory containing one `index.html`:

```
ig_bio/index.html   →  served at /ig_bio and /ig_bio/
```

Use a directory, not a bare `ig_bio.html` file. GitHub Pages 301s `/ig_bio` to
`/ig_bio/` and serves the index, so both forms work with no extension showing.

The page redirects in three layers, and **all three must carry the same
destination**:

1. `window.location.replace(...)` — fires immediately. Use `replace`, never
   `location.href`: `replace` leaves no history entry, so the visitor's "back"
   button returns them to Instagram instead of bouncing them through the
   redirect again into an inescapable loop.
2. `<meta http-equiv="refresh">` — covers JavaScript being off or blocked,
   which does happen in in-app browsers.
3. A visible link in the body — covers both of the above failing.

If only layer 1 carried the UTM tags, visitors without JavaScript would arrive
untagged and be silently recorded as direct traffic. That failure is invisible
in the reports, so keep the three in sync.

## Steps

1. **Pick the slug.** Lowercase, underscores, platform prefix: `ig_bio`,
   `ig_post_03`, `fb_launch`. Check it doesn't collide with anything already in
   the web root (`ls` the root — `pricing.html` etc. are real pages) or with a
   row in [../../../REDIRECTS.md](../../../REDIRECTS.md).

2. **Confirm the destination exists.** A redirect to a typo'd path lands the
   visitor on the 404 page. Check the file is really there.

3. **Build the destination URL** with UTM tags — see conventions below.

4. **Copy [template.html](template.html)** to `<slug>/index.html` and replace
   the three placeholders:

   | Placeholder | Replace with | Ampersands |
   |---|---|---|
   | `{{DEST_ESCAPED}}` | destination path + query (2 places) | `&amp;` |
   | `{{DEST_RAW}}` | the same URL, in the JS string (1 place) | plain `&` |
   | `{{CANONICAL}}` | absolute URL of the destination, **no UTM tags** | n/a |

   The ampersand difference is not cosmetic: `&amp;` is required inside HTML
   attributes, and would be wrong inside the JavaScript string literal.

5. **Add a row to [../../../REDIRECTS.md](../../../REDIRECTS.md).** Newest last.
   Fill every column; "Used for" is the one that will matter in six months when
   the campaign name alone no longer means anything.

6. **Verify locally** before reporting done:

   ```bash
   python -m http.server 8931 >/dev/null 2>&1 &
   sleep 2
   curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8931/<slug>"   # 301
   curl -s "http://localhost:8931/<slug>/" | grep -i "refresh\|replace\|<a href"
   kill %1
   ```

   Confirm all three layers show the same destination.

## UTM conventions

Keep these stable — changing them mid-campaign splits the data in Google
Analytics into two rows that can't be recombined.

| Tag | Value |
|---|---|
| `utm_source` | the platform: `instagram`, `facebook`, `linkedin`, `threads` |
| `utm_medium` | **always `social`** for social links |
| `utm_campaign` | what the link is: `bio_link`, `post_03`, `reel_launch` |

`utm_medium=social` is load-bearing. GA4's default channel grouping files a
visit under **Organic Social** when the medium matches `social` (or when the
source is a recognised social network). Using something descriptive-but-custom
like `utm_medium=bio` risks the visit landing in Unassigned.

Example for a post link:

```
/pricing.html?utm_source=instagram&utm_medium=social&utm_campaign=post_03
```

## Rules that are easy to get wrong

- **Canonical points at the bare destination**, with no UTM tags, so search
  engines don't index a tagged duplicate of a real page.
- **`noindex, follow`** on every redirect page. These are not content.
- **No analytics tag on the redirect page itself.** It stays a pure hop. Adding
  gtag here would put a phantom pageview in front of every real session, and
  the async script often wouldn't load before the redirect fired anyway.
- **Styles stay inline.** The page is only ever *seen* if both redirects fail;
  requesting `/styles.css` would slow down the cases that work. Brand colours
  are `#faf5ec`/`#2b2118`/`#6d1f2a` light, `#1a1613`/`#eee7de`/`#e08d92` dark.
- **Never add a redirect to [../../../sitemap.xml](../../../sitemap.xml).**
  They are deliberately unindexed.

## Removing a redirect

Delete the directory *and* its row in `REDIRECTS.md`. If the link has already
been published anywhere, say so — a dead bio link is worse than a stale one,
and the user may want to keep the file and just repoint it instead.
