# Redirects

Every short path on this site that forwards somewhere else, and what it's for.

These exist so a link can be published somewhere permanent — an Instagram bio,
a post, a printed card — while staying short, and so the traffic it brings can
be told apart from everything else in Google Analytics.

**Keep this file in step with the directories.** A redirect that isn't listed
here is one nobody will remember the purpose of, and a row with no directory is
a link that 404s wherever it was published.

To add, change, or remove one, use the `site-redirect` skill
([.claude/skills/site-redirect/SKILL.md](.claude/skills/site-redirect/SKILL.md)) —
it carries the template and the conventions. Ask Claude for "a redirect for X".

## Live redirects

| Path | Goes to | Campaign tag | Added | Used for |
|---|---|---|---|---|
| [/ig_bio](ig_bio/index.html) | `/` (homepage) | `bio_link` | 2026-08-05 | The Link field of the Instagram bio |
| [/ig_services_intro](ig_services_intro/index.html) | `/` (homepage) | `services_intro` | 2026-08-05 | The "Four things I do" services intro post. Story link sticker whenever that post is reshared to Stories |

## How they work

Each row above is a directory holding a single `index.html`. GitHub Pages is a
static host, so there is no server-side redirect to configure — the page at the
path forwards the visitor itself, three ways over (JavaScript, then a meta
refresh, then a visible link), with UTM tags on the destination.

They are all `noindex` and none appear in [sitemap.xml](sitemap.xml): they are
plumbing, not content.

## Reading the results

In Google Analytics, look under **Reports → Acquisition → Traffic acquisition**
and switch the dimension to **Session campaign**. Each campaign tag above shows
up as its own row. Sessions are grouped into the **Organic Social** channel,
because every redirect here sets `utm_medium=social`.

Traffic from someone typing the site address, or from an untagged link, stays
in **Direct** — so the gap between a post's reach and its campaign row is the
honest measure of whether the post worked.
