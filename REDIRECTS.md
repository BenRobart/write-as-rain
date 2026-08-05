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
| [/ig_which_edit](ig_which_edit/index.html) | `proofreading-vs-copyediting.html` | `which_edit` | 2026-08-05 | Post 2, which edit do you need |
| [/ig_free_sample](ig_free_sample/index.html) | `/` (homepage) | `free_sample` | 2026-08-05 | Post 3, the free sample edit |
| [/ig_ghostwriting](ig_ghostwriting/index.html) | `book-ghostwriting.html` | `ghostwriting` | 2026-08-05 | Post 4, book ghostwriting |
| [/ig_genre_fiction](ig_genre_fiction/index.html) | `romance-editor.html` | `genre_fiction` | 2026-08-05 | Post 5, genre fiction editing |
| [/ig_blurb](ig_blurb/index.html) | `book-blurb-writing.html` | `blurb` | 2026-08-05 | Post 6, blurbs and Amazon copy |
| [/ig_formatting](ig_formatting/index.html) | `ebook-formatting-kdp.html` | `formatting` | 2026-08-05 | Post 7, KDP formatting |
| [/ig_submission](ig_submission/index.html) | `agent-submission-help.html` | `submission` | 2026-08-05 | Post 8, agent submission package |
| [/ig_memoir](ig_memoir/index.html) | `memoir-life-story.html` | `memoir` | 2026-08-05 | Post 9, memoir and life story |
| [/ig_academic](ig_academic/index.html) | `journal-english-editing.html` | `academic` | 2026-08-05 | Post 10, academic editing |
| [/ig_thesis](ig_thesis/index.html) | `phd-thesis-proofreading.html` | `thesis` | 2026-08-05 | Post 11, thesis proofreading |
| [/ig_statements](ig_statements/index.html) | `ucas-personal-statement.html` | `statements` | 2026-08-05 | Post 12, personal statements |
| [/ig_cv](ig_cv/index.html) | `cv-writing-career-change.html` | `cv` | 2026-08-05 | Post 13, CV, LinkedIn and cover letters |
| [/ig_grants](ig_grants/index.html) | `grant-writing-charities.html` | `grants` | 2026-08-05 | Post 14, grant and bid writing |
| [/ig_exec_ghostwriting](ig_exec_ghostwriting/index.html) | `executive-ghostwriting.html` | `exec_ghostwriting` | 2026-08-05 | Post 15, executive ghostwriting |
| [/ig_documents](ig_documents/index.html) | `document-writing-service.html` | `documents` | 2026-08-05 | Post 16, documents and letters |
| [/ig_speeches](ig_speeches/index.html) | `wedding-speech-writer.html` | `speeches` | 2026-08-05 | Post 17, wedding and occasion speeches |
| [/ig_eulogy](ig_eulogy/index.html) | `eulogy-writing.html` | `eulogy` | 2026-08-05 | Post 18, eulogies |

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
