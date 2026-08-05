#!/usr/bin/env python3
"""Build the single-service Instagram graphics from one template.

Each post is 1080x1350 (4:5), the same paper, frame, and burgundy bar as the services
intro (1-instagram-services-intro-v3.html), but laid out for one offering rather
than four.

Two things are read from files that already exist rather than copied into this
one, so they cannot drift:

  * the @font-face block, lifted from the intro graphic. Lora and Playfair are
    embedded as base64 woff2 there, which is what makes a graphic render
    identically on a machine that has never had the fonts installed.
  * the icons, parsed out of the sprite in site.js. Change a drawing on the site
    and the next build picks it up.

Usage:
    python scripts/build-social.py            # write the HTML
    python scripts/build-social.py --render   # HTML, then PNGs via headless Chrome
    python scripts/build-social.py --measure  # HTML, then report any overflow

Run it from the repository root.
"""

import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOCIAL = ROOT / "social"
INTRO = SOCIAL / "1-instagram-services-intro-v3.html"
SITE_JS = ROOT / "site.js"

# --- Posts -----------------------------------------------------------------
# One entry per offering. `price` is checked against pricing.html; if a price
# moves on the site, it moves here and the graphic is rebuilt.
#
# Price convention: "From <lowest>" whenever the post covers more than one
# figure, and a bare figure only where the service genuinely has a single price
# (post 8's £150 package, post 6's £120 blurb, post 3's "Free"). A strip of
# unlabelled numbers reads as a sum rather than a price, which is what
# "£400 · £350 · £250" did. The full ladder belongs in the caption.
#
# Keep `body` to roughly 150 characters and each point under about 60: the
# template holds three points and the layout is verified by --measure, which
# fails the build rather than letting text run under the burgundy bar.

POSTS = [
    dict(
        n=2, slug="which-edit", icon="wr-glasses", group="Manuscript editing",
        headline="Three edits, and\nyou only need\none of them",
        body="Proofreading, copyediting, and developmental editing get used as if "
             "they mean the same thing. They don't, and paying for the wrong one is "
             "how manuscripts come back disappointing.",
        points=[
            "Developmental: does the book work at all?",
            "Copyediting: sentence by sentence, with a style sheet",
            "Proofreading: the last look, after everything else",
        ],
        price="From &pound;250",
        dest="proofreading-vs-copyediting.html",
    ),
    dict(
        n=3, slug="free-sample-edit", icon="wr-page-pencil", group="Before you pay",
        headline="Send me your\nfirst 1,000 words",
        body="I'll edit them properly. Tracked changes, comments, the lot, exactly the "
             "way I'd work on the whole manuscript. Then I send them back and you decide.",
        points=[
            "No payment, and no obligation afterwards",
            "No follow-up emails if you decide against it",
            "Proof you can check, unlike a testimonial",
        ],
        price="Free",
        dest="index.html",
    ),
    dict(
        n=4, slug="book-ghostwriting", icon="wr-book-open", group="Ghostwriting",
        headline="The book you've\nbeen going to write",
        body="Written from recorded conversations, chapter by chapter. Memoirs, business "
             "books, family life stories, and novel collaborations.",
        points=[
            "You own the manuscript and the copyright",
            "No royalties taken, and no credit unless you want it",
            "Paid in four stages, not up front",
        ],
        # Deliberate exception to the single-figure convention below: the £450
        # sample chapter is the low-commitment way in and comes off the total,
        # so it earns its place next to a number as large as £3,500.
        price="From &pound;3,500 &middot; sample chapter &pound;450",
        dest="book-ghostwriting.html",
    ),
    dict(
        n=5, slug="genre-fiction", icon="wr-heart-book", group="Manuscript editing",
        headline="An editor who\nreads your genre",
        body="Romance, crime and thriller, fantasy and sci-fi. Someone who reads the genre "
             "knows a convention when they see one, and won't flag it as a mistake.",
        points=[
            "Romance: a series bible, so book six matches book one",
            "Crime: a clue timeline that proves the reveal is fair",
            "Fantasy: a glossary, not \"corrections\" to your names",
        ],
        price="From &pound;350",
        dest="romance-editor.html",
    ),
    dict(
        n=6, slug="book-blurb", icon="wr-megaphone", group="Books and publishing",
        headline="The 150 words that\nsell the 90,000",
        body="Nobody reads chapter one in the shop. They read the back, and they decide "
             "there. A blurb is a different craft from the book it's selling.",
        points=[
            "Back cover blurb and the longer Amazon version",
            "Hook line and author bio, formatted for KDP",
            "Two rounds of revisions included",
        ],
        price="&pound;120",
        dest="book-blurb-writing.html",
    ),
    dict(
        n=7, slug="kdp-formatting", icon="wr-device", group="Books and publishing",
        headline="Formatting that\npasses first time",
        body="Validated EPUB 3 for KDP, Apple Books, Kobo, and Google Play, and print "
             "interiors with trim size, margins, and gutters set properly.",
        points=[
            "Source files included, so you can update it yourself",
            "Print-ready PDF for KDP Print and IngramSpark",
            "Rejected files diagnosed free",
        ],
        price="From &pound;75",
        dest="ebook-formatting-kdp.html",
    ),
    dict(
        n=8, slug="submission-package", icon="wr-envelope", group="Books and publishing",
        headline="Form rejections\ndon't tell you\nwhat went wrong",
        body="Agents send the same line to everyone. Working out whether it's the book, "
             "the query, the synopsis, or the opening chapter is the whole job.",
        points=[
            "Query letter in UK or US convention",
            "One-page synopsis, which is its own dark art",
            "A critique of your opening chapter",
        ],
        price="&pound;150",
        dest="agent-submission-help.html",
    ),
    dict(
        n=9, slug="memoir", icon="wr-books", group="Memoir and life story",
        headline="A life is not\na plot",
        body="Memoir editing for a book you're publishing, life story writing for one the "
             "family keeps. They are different jobs and they get priced differently.",
        points=[
            "Structure that carries a reader who never knew you",
            "Honest guidance on writing about the living",
            "Interview-based writing, or editing your own draft",
        ],
        price="From &pound;350",
        dest="memoir-life-story.html",
    ),
    dict(
        n=10, slug="academic-editing", icon="wr-flask", group="Academic",
        headline="Desk-rejected for\nthe English, not\nthe science",
        body="Journal-standard language editing for researchers writing in English as a "
             "second language. Your findings, your argument, and your data stay untouched.",
        points=[
            "Citation style made consistent throughout",
            "Formatted to the journal's author guidelines",
            "Response-to-reviewers letters polished",
        ],
        price="From &pound;15 per 1,000 words",
        dest="journal-english-editing.html",
    ),
    dict(
        n=11, slug="thesis-proofreading", icon="wr-mortarboard", group="Academic",
        headline="Proofreading that\nstays inside your\nuniversity's rules",
        body="Every institution publishes a proofreading policy and most students never "
             "find it. I work to yours, and I put in writing what I will and won't touch.",
        points=[
            "Surface features only, nothing near your argument",
            "A written record of every change, for your viva file",
            "Dissertation coaching separately, at &pound;50 a session",
        ],
        price="From &pound;250",
        dest="phd-thesis-proofreading.html",
    ),
    dict(
        n=12, slug="personal-statements", icon="wr-plane", group="Applications and careers",
        headline="The statement you wrote,\nmade to work harder",
        body="UCAS, Oxbridge, medicine and dentistry, postgraduate, and US college essays. "
             "Your draft, edited and coached – never one written for you.",
        points=[
            "Reflection that beats a list of placements",
            "Nothing in it you couldn't defend at interview",
            "First look at your draft is free",
        ],
        price="From &pound;100",
        dest="ucas-personal-statement.html",
    ),
    dict(
        n=13, slug="cv-linkedin", icon="wr-briefcase", group="Applications and careers",
        headline="Your CV describes\nthe job you had",
        body="Not the one you want. Changing field is the hardest CV problem there is, "
             "because the reader has to do translation work you should have done for them.",
        points=[
            "Rebuilt around the role, achievement-led",
            "Readable by the software that screens it first",
            "LinkedIn rewritten to tell the same story",
        ],
        price="From &pound;30",
        dest="cv-writing-career-change.html",
    ),
    dict(
        n=14, slug="grant-writing", icon="wr-hand-heart", group="Business",
        headline="Bids written the way\nassessors score them",
        body="Small charities and SMEs without a fundraising team. Answered point by point "
             "against the funder's own guidance, because that's how it gets marked.",
        points=[
            "A free go/no-go verdict before you spend anything",
            "Never on commission, so the advice stays honest",
            "Editing your existing draft costs less",
        ],
        price="From &pound;300 per bid",
        dest="grant-writing-charities.html",
    ),
    dict(
        n=15, slug="executive-ghostwriting", icon="wr-quill", group="Business",
        headline="The posts you keep\nmeaning to write",
        body="LinkedIn and newsletters in your voice, built from one recorded conversation "
             "a month. Nothing is published without your sign-off.",
        points=[
            "No account access needed, ever",
            "No credit taken anywhere, it's your name on it",
            "First post free, before any retainer starts",
        ],
        price="From &pound;300 per month",
        dest="executive-ghostwriting.html",
    ),
    dict(
        n=16, slug="documents", icon="wr-doc-lines", group="Business",
        headline="Your notes, turned\ninto a document",
        body="Handwritten pages, photos taken on your phone, or a rough draft. Back it "
             "comes finished, in Word and PDF, ready to send.",
        points=[
            "Letters, reports, policies, and personal documents",
            "Longer or structured pieces quoted flat",
            "Tidying your own draft costs less than writing it",
        ],
        price="From &pound;30",
        dest="document-writing-service.html",
    ),
    dict(
        n=17, slug="speeches", icon="wr-mic", group="Occasions",
        headline="You've got the stories.\nFive minutes is\nthe hard part",
        body="Wedding, best man, father of the bride, maid of honour, retirement. Written "
             "from a conversation, timed to your slot, with the pauses marked.",
        points=[
            "Timed properly, because overrunning is the fear",
            "Your material in your phrasing, not a template",
            "Delivery notes in the margin, for the day itself",
        ],
        price="From &pound;100",
        dest="wedding-speech-writer.html",
    ),
    # Split from the speeches post: same skill and same price, but a graphic
    # tagged for weddings sitting above a bereavement caption reads badly, and
    # the two get found by people in very different states of mind.
    dict(
        n=18, slug="eulogy", icon="wr-candle", group="Eulogies",
        headline="You talk about them.\nI write it",
        body="Usually one phone call is enough. You don't need anything written down "
             "first, or to know yet what you want to say.",
        points=[
            "Short notice is normal, so say if it's Friday",
            "Paced and marked so you can get through it",
            "Ring and ask first – the advice costs nothing",
        ],
        price="From &pound;100",
        dest="eulogy-writing.html",
    ),
]


def font_css() -> str:
    """The @font-face block from the intro graphic, base64 payloads and all."""
    html = INTRO.read_text(encoding="utf-8")
    blocks = re.findall(r"<style>(.*?)</style>", html, re.S)
    for block in blocks:
        if "@font-face" in block:
            return block.strip()
    raise SystemExit("no @font-face block found in " + str(INTRO))


def icons() -> dict:
    """Every <symbol> in the site.js sprite, keyed by id."""
    js = SITE_JS.read_text(encoding="utf-8")
    found = {}
    for match in re.finditer(
        r"'<symbol id=\"(wr-[a-z-]+)\" viewBox=\"([^\"]+)\">'(.*?)'</symbol>'", js, re.S
    ):
        name, viewbox, guts = match.groups()
        # The sprite is JS string concatenation; strip the quoting and joins.
        paths = re.sub(r"'\s*\+\s*(//[^\n]*\n\s*)?'", "", guts)
        paths = re.sub(r"\s*//[^\n]*", "", paths)
        paths = paths.replace("'", "").strip()
        found[name] = (viewbox, paths)
    return found


TEMPLATE = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<title>Write as Rain &mdash; {title}</title>
<style>
{fonts}
</style>
<style>
  /* Tokens lifted verbatim from styles.css :root */
  :root {{
    --bg: #faf5ec;
    --bg-alt: #f2ead9;
    --ink: #2b2118;
    --ink-soft: #56483a;
    --ink-faint: #8c7a66;
    --accent: #6d1f2a;
    --rule: #e0d4c0;
  }}

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}

  html, body {{ width: 1080px; height: 1350px; }}

  body {{
    font-family: 'Lora', Georgia, serif;
    background: var(--bg);
    color: var(--ink);
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }}

  /* Same paper grain as the site, a shade stronger so it survives
     Instagram's re-encode rather than being smoothed away. */
  .grain {{
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  }}

  .frame {{
    position: absolute;
    inset: 26px 26px 110px;
    border: 1px solid var(--rule);
    z-index: 1;
  }}

  .sheet {{
    position: relative;
    z-index: 2;
    height: 1258px;
    padding: 82px 96px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }}

  /* --- Masthead: smaller than the intro's, since the headline leads here --- */
  .wordmark {{
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 600;
    font-size: 30px;
    letter-spacing: 0.02em;
    color: var(--accent);
  }}

  .eyebrow {{
    margin-top: 12px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }}

  /* Everything between the masthead and the price.
     There are three auto margins down this column — this one, and both of the
     price's — and flexbox splits the leftover height equally between them. That
     gives three identical gaps: masthead to content, content to price, price to
     the bar. Whatever the copy length, the price is always exactly as far below
     the points panel as it is above the bar.
     The earlier version pinned the price a fixed 40px off the bar and let this
     block's margins take all the slack, which put the entire surplus into the
     one gap above the price: on the shorter posts that was 117px above against
     40px below, and the price read as having fallen to the bottom of the page.
     Don't reintroduce a fixed margin on .price — that is the bug. */
  .middle {{
    margin: auto 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }}

  /* --- Headline --- */
  .icon-mark {{
    margin-top: 0;
    width: 60px;
    height: 60px;
    color: var(--accent);
    fill: none;
    stroke: currentColor;
    stroke-width: 1.15;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.9;
  }}

  h1 {{
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 600;
    font-size: 74px;
    line-height: 1.14;
    letter-spacing: -0.015em;
    color: var(--ink);
    margin-top: 40px;
  }}

  .rule-short {{
    width: 108px;
    height: 1px;
    background: var(--accent);
    opacity: 0.45;
    margin: 52px 0;
  }}

  .body {{
    font-size: 23px;
    line-height: 1.62;
    color: var(--ink-soft);
    max-width: 800px;
  }}

  /* --- Points --- */
  /* The tinted panel is the treatment the services intro uses for its service
     cells. Without an edge the points read as more prose; with one they read as
     a block worth scanning, which is the whole reason they are there.
     The gap above is smaller than the gap below on purpose, and the two are not
     interchangeable: the panel is the detail of the sentence above it, so it has
     to sit nearer that. Set them equal and it visually joins the price instead.
     Padding is 8px because the rows carry 28px of their own, so 8 + 28 + 1px of
     border matches the 36 + 1 at the sides and the text is inset evenly. */
  .points {{
    margin-top: 44px;
    width: 100%;
    max-width: 820px;
    list-style: none;
    text-align: left;
    background: var(--bg-alt);
    border: 1px solid var(--rule);
    border-radius: 3px;
    padding: 8px 36px;
  }}

  .points li {{
    display: flex;
    align-items: baseline;
    gap: 15px;
    font-size: 26px;
    font-weight: 500;
    line-height: 1.5;
    color: var(--ink);
    padding: 28px 0;
    border-top: 1px solid var(--rule);
  }}
  /* The panel supplies the outer edges, so the first and last rows drop theirs
     or they double up into a two-pixel line. */
  .points li:first-child {{ border-top: none; }}
  .points li:last-child {{ border-bottom: none; }}

  /* Burgundy hairline rather than a bullet: the site uses rules, not dots. */
  .points li::before {{
    content: "";
    flex: 0 0 auto;
    width: 26px;
    height: 2px;
    background: var(--accent);
    opacity: 1;
    transform: translateY(-8px);
  }}

  /* --- Price --- */
  /* Both margins auto: see .middle. These are two of the three that share the
     leftover height, which is what centres the price between the panel and the
     bar rather than dropping it to the bottom. */
  .price {{
    margin: auto 0;
    font-size: 27px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.01em;
  }}

  /* --- Burgundy footer bar, echoing the site's OG card --- */
  .bar {{
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 92px;
    z-index: 3;
    background: var(--accent);
    color: #f6ece0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-size: 20px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }}
  .bar .dot {{ opacity: 0.5; }}
</style>
</head>
<body>

<div class="frame"></div>

<div class="sheet">

  <div class="wordmark">Write as Rain</div>
  <div class="eyebrow">{group}</div>

  <div class="middle">

    <svg class="icon-mark" viewBox="{viewbox}" aria-hidden="true">{icon}</svg>

    <h1>{headline}</h1>

    <div class="rule-short"></div>

    <p class="body">{body}</p>

    <ul class="points">
{points}
    </ul>

  </div>

  <div class="price">{price}</div>

</div>

<div class="bar">
  <span>writeasrain.github.io</span>
  <span class="dot">&middot;</span>
  <span>writeasrainuk@gmail.com</span>
</div>

<div class="grain"></div>

</body>
</html>
"""

# The sheet is a fixed 988px with the middle block's auto margins soaking up the
# slack, so the sheet's own height never changes and cannot reveal overflow.
# What actually breaks is those auto margins reaching zero: past that the middle
# block grows into the masthead above and pushes the price under the burgundy
# bar below, and because the body is overflow:hidden it does so silently.
# Measure the two margins directly.
MEASURE_PROBE = """<script>window.addEventListener('load',function(){
  var eb=document.querySelector('.eyebrow'), mid=document.querySelector('.middle'),
      p=document.querySelector('.price');
  var mb=mid.getBoundingClientRect(), pb=p.getBoundingClientRect();
  document.title=JSON.stringify({
    top: Math.round(mb.top - eb.getBoundingClientRect().bottom),
    mid: Math.round(pb.top - mb.bottom),
    bot: Math.round((1350-92) - pb.bottom)});
});</script>"""


def build() -> list:
    fonts = font_css()
    sprite = icons()
    written = []
    for post in POSTS:
        if post["icon"] not in sprite:
            raise SystemExit(f"post {post['n']}: no icon {post['icon']} in site.js")
        viewbox, paths = sprite[post["icon"]]
        points = "\n".join(f"    <li>{p}</li>" for p in post["points"])
        html = TEMPLATE.format(
            title=post["slug"],
            fonts=fonts,
            group=post["group"],
            viewbox=viewbox,
            icon=paths,
            headline=post["headline"].replace("\n", "<br>"),
            body=post["body"],
            points=points,
            price=post["price"],
        )
        out = SOCIAL / f"{post['n']}-instagram-{post['slug']}.html"
        out.write_text(html, encoding="utf-8")
        written.append(out)
    return written


def chrome() -> str:
    for candidate in (
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ):
        if pathlib.Path(candidate).exists():
            return candidate
    found = shutil.which("chrome") or shutil.which("google-chrome")
    if not found:
        raise SystemExit("no Chrome or Edge found for rendering")
    return found


def render(paths) -> None:
    exe = chrome()
    for src in paths:
        png = src.with_suffix(".png")
        subprocess.run(
            [exe, "--headless", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--window-size=1080,1350",
             f"--screenshot={png}", src.as_uri()],
            check=True, capture_output=True,
        )
        print(f"  rendered {png.name}")


def measure(paths) -> int:
    """Render each graphic with a probe and report anything that overflows."""
    exe = chrome()
    tmp = SOCIAL / "_measure.html"
    bad = 0
    try:
        for src in paths:
            tmp.write_text(
                src.read_text(encoding="utf-8").replace("</body>", MEASURE_PROBE + "</body>"),
                encoding="utf-8",
            )
            out = subprocess.run(
                [exe, "--headless", "--disable-gpu", "--window-size=1080,1350",
                 "--virtual-time-budget=4000", "--dump-dom", tmp.as_uri()],
                capture_output=True, text=True,
            ).stdout
            match = re.search(r"<title>(\{.*?\})</title>", out, re.S)
            if not match:
                print(f"  ?? {src.name}: no measurement returned")
                bad += 1
                continue
            m = json.loads(match.group(1).replace("&quot;", '"'))
            gaps = [m["top"], m["mid"], m["bot"]]
            # The three auto margins should come out equal; a spread wider than
            # a pixel or two means something has picked up a fixed margin again.
            uneven = max(gaps) - min(gaps) > 2
            # Below ~26px the page stops looking composed and starts looking full.
            over = min(gaps) < 26 or uneven
            flag = "UNEVEN" if uneven else ("TIGHT" if over else "ok")
            if over:
                bad += 1
            print(f"  {flag:9} {src.name:46} gaps {gaps[0]:>3}/{gaps[1]:>3}/{gaps[2]:>3}px")
    finally:
        tmp.unlink(missing_ok=True)
    return bad


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--render", action="store_true", help="also write PNGs")
    ap.add_argument("--measure", action="store_true", help="also check for overflow")
    args = ap.parse_args()

    paths = build()
    print(f"built {len(paths)} graphics")

    failures = 0
    if args.measure or args.render:
        failures = measure(paths)
    if args.render:
        if failures:
            print(f"\n{failures} graphic(s) overflow; not rendering. Fix the copy first.")
            return 1
        render(paths)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
