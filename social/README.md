# Social

Instagram assets. One numbered post per file set: a `.md` holding the caption
and hashtags, a `.html` holding the graphic, and the `.png` rendered from it.

**Don't edit a post that has already gone out.** Once something is published the
file is a record of what was posted, and changing it means the folder no longer
tells you what people actually saw.

## Format

**4:5 portrait, 1080 × 1350.** Instagram's feed and its profile grid both
preview at 4:5, so a portrait image fills the cell and a square one gets cropped
or boxed. Portrait also takes up more of the screen as someone scrolls past,
which is the whole game.

Post 1 predates this and is 1080 × 1080. It stays that way — see the rule above.

The landscape 1.91:1 shape is for link previews on other platforms and is the
worst of the three here: it occupies the least vertical space in the feed.

## Posting order

The numbers are the running order, not a schedule. Posts 2 and 3 are the two
that earn the rest and should go early; after that the order matters less than
alternating audiences, so the feed doesn't show four editing posts to an account
followed by applicants.

| # | Post | Sells | Redirect |
|---|---|---|---|
| 0 | Bio and avatar | – | `/ig_bio` |
| 1 | Services intro | Everything, at a glance | `/ig_services_intro` |
| 2 | Which edit do you need | £250 / £350 / £400 | `/ig_which_edit` |
| 3 | The free sample edit | Nothing, deliberately | `/ig_free_sample` |
| 4 | Book ghostwriting | From £3,500 | `/ig_ghostwriting` |
| 5 | Genre fiction editing | From £350 | `/ig_genre_fiction` |
| 6 | Blurbs and Amazon copy | £120 | `/ig_blurb` |
| 7 | KDP formatting | £75 / £150 | `/ig_formatting` |
| 8 | Agent submission package | £150 | `/ig_submission` |
| 9 | Memoir and life story | From £350 / £3,500 | `/ig_memoir` |
| 10 | Academic editing | From £15 per 1,000 | `/ig_academic` |
| 11 | Thesis proofreading | From £250 | `/ig_thesis` |
| 12 | Personal statements | From £100 | `/ig_statements` |
| 13 | CV, LinkedIn, cover letters | £75 / £120 / £30 | `/ig_cv` |
| 14 | Grant and bid writing | From £300 | `/ig_grants` |
| 15 | Executive ghostwriting | £300 / £500 pm | `/ig_exec_ghostwriting` |
| 16 | Documents and letters | From £30 | `/ig_documents` |
| 17 | Wedding and occasion speeches | From £100 | `/ig_speeches` |
| 18 | Eulogies | From £100 | `/ig_eulogy` |

Every offering priced on `pricing.html` appears in exactly one post. Where the
site has several landing pages for one skill — the three genre pages, the two
personal statement pages — they share a post, and the `.md` says what to do if
it's worth splitting later.

Posts 17 and 18 are the exception: same skill, same price, split anyway, because
a wedding-tagged graphic above a bereavement caption reads badly and the two are
found by people in completely different states of mind. Don't recombine them,
and don't post them on the same day.

## Why one post per service, rather than four per wedge

Post 1 already is the four-wedge post: all four groups on one graphic. Four more
would restate it slower.

Instagram discovery is per post. "Academic" reaches nobody in particular; a post
about your university's proofreading policy reaches the people currently worried
about it. The site is already built this way — roughly twenty landing pages, each
aimed at one searcher — so the posts mirror an architecture that exists, and each
one has a real page to land on.

It also makes the results legible. One campaign tag per post means you find out
which service actually pulls, which four broad posts could never tell you.

## Building the graphics

```bash
python scripts/build-social.py            # write the HTML
python scripts/build-social.py --measure  # check nothing overflows
python scripts/build-social.py --render   # HTML, then PNGs
```

Copy lives in the `POSTS` table in
[scripts/build-social.py](../scripts/build-social.py), not in the generated
HTML — editing the HTML directly gets overwritten on the next build. The captions
in the `.md` files are hand-written and are never generated.

Fonts come from post 1's graphic and icons come from the sprite in `site.js`,
both read at build time, so neither can drift from the site.

`--measure` exists because the canvas is a fixed size with `overflow: hidden`:
copy that runs long is silently clipped rather than visibly broken. It reports
the slack above and below the middle block and fails under 26px, and `--render`
refuses to run if anything is tight. A headline of four lines will usually be
what trips it.

## Conventions

- **Captions**: British English, Oxford comma, spaced en dashes rather than em
  dashes, no emoji. Exclamation marks are allowed, sparingly. The first 125
  characters are all Instagram shows before "more", so they carry the hook.
- **Hashtags**: none in the caption, all in a first comment, roughly 25 per post
  against Instagram's limit of 30. CamelCase, so screen readers say "Book Editor"
  rather than one long noise. Rotating a few between posts stops every post
  looking identical to the algorithm.
- **Prices**: on the graphic only, never written out in the caption. The image
  carries the number and the caption explains the thing, which means a price
  change touches the `POSTS` table and nothing else. Captions saying "priced per
  bid" or "it costs less alongside a CV" don't go stale when a figure moves.
  Checked against `pricing.html` on 5 August 2026. Post 1 still quotes prices in
  its caption because it is already published and doesn't get edited.
- **Links**: never in the caption. The tracked `/ig_…` path goes at the top of
  the first comment instead, followed by a blank line and then the hashtags, so
  the whole comment pastes in one go:

  ```
  https://writeasrain.github.io/ig_thesis or link in bio!

  #PhDLife #PhDChat …
  ```

  It isn't clickable there — nothing on Instagram is except the bio and Story
  stickers — but a comment is where people look, it's short enough to copy, and
  the bio catches everyone who won't. The same path works on a Story link
  sticker, where it *is* tappable. Paths are listed above and in
  [REDIRECTS.md](../REDIRECTS.md). Campaign tags can't be renamed once a post is
  live without splitting the data in Analytics.

  Post 18 says "or link in bio" with no exclamation mark. That is the only post
  that differs and it is deliberate; the reason is in its own notes.
