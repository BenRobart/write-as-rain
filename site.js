/* Write as Rain — shared behaviour: mobile menu, theme toggle, privacy popup, scroll reveal. */
(function () {
  'use strict';

  // Flag JS as available before anything else. The reveal/stagger rules only hide
  // content under .js, so with scripting off the page renders fully rather than blank.
  document.documentElement.classList.add('js');

  // --- Illustration sprite ---
  // Every page references these with <use href="#wr-…">, so the drawings live
  // here once instead of being pasted into eleven files. Nothing carries stroke
  // or fill attributes: colour and line weight both come from CSS, which is what
  // lets one symbol work at 17px in a label and 104px in a hero.
  // Purely decorative, so pages without scripting simply lose the ornaments.
  (function () {
    var symbols = [
      // Open book, three-quarter view
      '<symbol id="wr-book-open" viewBox="0 0 24 24">' +
        '<path d="M12 7.6C10.2 6.3 7.6 5.6 4 5.7v11.6c3.6-.1 6.2.6 8 1.9"/>' +
        '<path d="M12 7.6c1.8-1.3 4.4-2 8-1.9v11.6c-3.6-.1-6.2.6-8 1.9"/>' +
        '<path d="M12 7.6v11.6"/>' +
      '</symbol>',
      // Stack of three books
      '<symbol id="wr-books" viewBox="0 0 24 24">' +
        '<rect x="4" y="15" width="16" height="4.6" rx="1"/>' +
        '<rect x="5.6" y="10.4" width="12.8" height="4.6" rx="1"/>' +
        '<rect x="4" y="5.8" width="10.6" height="4.6" rx="1"/>' +
        '<path d="M16.6 15v4.6M8.6 10.4V15M11.4 5.8v4.6"/>' +
      '</symbol>',
      // Quill: feather, rachis, and the shaft running down to the nib
      '<symbol id="wr-quill" viewBox="0 0 24 24">' +
        '<path d="M20.8 3.2c-.9 5.4-2.8 9.1-5.6 11.2-2.3 1.7-4.4 1.9-6.3 1.6.2-1.9.7-4.1 2.3-6.3C13.1 6.9 16.4 4.4 20.8 3.2Z"/>' +
        '<path d="M20.8 3.2C16.8 6.2 12.4 10.6 8.9 16"/>' +
        '<path d="M8.9 16 2.8 21.4"/>' +
      '</symbol>',
      // Pen nib
      '<symbol id="wr-nib" viewBox="0 0 24 24">' +
        '<path d="M12 2.5 6.6 14.2 12 21.5l5.4-7.3L12 2.5Z"/>' +
        '<path d="M6.6 14.2h10.8"/>' +
        '<circle cx="12" cy="11.4" r="1.5"/>' +
        '<path d="M12 2.5v7.4M12 12.9v4.4"/>' +
      '</symbol>',
      // Reading glasses
      '<symbol id="wr-glasses" viewBox="0 0 24 24">' +
        '<circle cx="6.5" cy="14" r="3.6"/>' +
        '<circle cx="17.5" cy="14" r="3.6"/>' +
        '<path d="M10.1 13.6c1.2-.8 2.6-.8 3.8 0"/>' +
        '<path d="M2.9 13 4.6 7.6a1.5 1.5 0 0 1 1.4-1h1.6"/>' +
        '<path d="M21.1 13 19.4 7.6a1.5 1.5 0 0 0-1.4-1h-1.6"/>' +
      '</symbol>',
      // Marked-up page with a pencil
      '<symbol id="wr-page-pencil" viewBox="0 0 24 24">' +
        '<path d="M13.6 2.8H6.8A1.8 1.8 0 0 0 5 4.6v14.8a1.8 1.8 0 0 0 1.8 1.8h5.4"/>' +
        '<path d="M8.3 7.4h6.4M8.3 10.8h6.4M8.3 14.2h3.4"/>' +
        '<path d="M18.9 8.9 21 11l-7.2 7.2-2.8.7.7-2.8L18.9 8.9Z"/>' +
        '<path d="m17.5 10.3 2.1 2.1"/>' +
      '</symbol>',
      // Magnifier over a line of text
      '<symbol id="wr-magnifier" viewBox="0 0 24 24">' +
        '<circle cx="10.5" cy="10.5" r="6.5"/>' +
        '<path d="m15.2 15.2 5.3 5.3"/>' +
        '<path d="M7.6 8.8h5.8M7.6 12h3.6"/>' +
      '</symbol>',
      // Stacked layers, for structural work
      '<symbol id="wr-layers" viewBox="0 0 24 24">' +
        '<path d="m12 2.8 9 4.7-9 4.7-9-4.7 9-4.7Z"/>' +
        '<path d="m3.4 12.2 8.6 4.5 8.6-4.5"/>' +
        '<path d="m3.4 16.6 8.6 4.5 8.6-4.5"/>' +
      '</symbol>',
      // E-reader
      '<symbol id="wr-device" viewBox="0 0 24 24">' +
        '<rect x="5" y="2.6" width="14" height="18.8" rx="2"/>' +
        '<path d="M8.4 7h7.2M8.4 10.4h7.2M8.4 13.8h4.4"/>' +
        '<path d="M10.4 18.4h3.2"/>' +
      '</symbol>',
      // Speech bubble with two lines of text
      '<symbol id="wr-speech" viewBox="0 0 24 24">' +
        '<path d="M21 5.8v9.4a1.8 1.8 0 0 1-1.8 1.8H9.6L5 20.9V17H4.8A1.8 1.8 0 0 1 3 15.2V5.8A1.8 1.8 0 0 1 4.8 4h14.4A1.8 1.8 0 0 1 21 5.8Z"/>' +
        '<path d="M7.4 8.4h9.2M7.4 12h6"/>' +
      '</symbol>',
      // Envelope
      '<symbol id="wr-envelope" viewBox="0 0 24 24">' +
        '<rect x="2.6" y="5" width="18.8" height="14" rx="1.8"/>' +
        '<path d="m3.4 6.2 7.4 5.6a2 2 0 0 0 2.4 0l7.4-5.6"/>' +
      '</symbol>',
      // Open book with a heart above it
      '<symbol id="wr-heart-book" viewBox="0 0 24 24">' +
        '<path d="M12 10.4C10.4 9.2 8 8.6 4.6 8.7v10.6c3.4-.1 5.8.5 7.4 1.7"/>' +
        '<path d="M12 10.4c1.6-1.2 4-1.8 7.4-1.7v10.6c-3.4-.1-5.8.5-7.4 1.7"/>' +
        '<path d="M12 10.4v10.6"/>' +
        '<path d="M12 7.4C12 7.4 8.6 5.4 8.6 3.6A1.9 1.9 0 0 1 12 2.5a1.9 1.9 0 0 1 3.4 1.1c0 1.8-3.4 3.8-3.4 3.8Z"/>' +
      '</symbol>',
      // Ringed planet and a star
      '<symbol id="wr-planet" viewBox="0 0 24 24">' +
        '<circle cx="11.6" cy="12.4" r="5.8"/>' +
        '<ellipse cx="11.6" cy="12.4" rx="10.4" ry="3.4" transform="rotate(-22 11.6 12.4)"/>' +
        '<path d="M19.4 4.2v2.8M18 5.6h2.8"/>' +
      '</symbol>',
      // Paper aeroplane
      '<symbol id="wr-plane" viewBox="0 0 24 24">' +
        '<path d="M21.2 3 2.8 10.4l7.2 2.8 2.8 7.2L21.2 3Z"/>' +
        '<path d="M10 13.2 21.2 3"/>' +
      '</symbol>',
      // Conical flask
      '<symbol id="wr-flask" viewBox="0 0 24 24">' +
        '<path d="M9.6 2.8v6.4l-5 8.2a1.8 1.8 0 0 0 1.5 2.8h11.8a1.8 1.8 0 0 0 1.5-2.8l-5-8.2V2.8"/>' +
        '<path d="M8.2 2.8h7.6"/>' +
        '<path d="M7.2 14.4h9.6"/>' +
      '</symbol>',
      // Mortarboard
      '<symbol id="wr-mortarboard" viewBox="0 0 24 24">' +
        '<path d="M12 3.6 2.4 8.2 12 12.8l9.6-4.6L12 3.6Z"/>' +
        '<path d="M6.4 10.2v4.9c0 1.9 2.5 3.4 5.6 3.4s5.6-1.5 5.6-3.4v-4.9"/>' +
        '<path d="M21.6 8.2v5.4"/>' +
      '</symbol>',
      // Written page
      '<symbol id="wr-doc-lines" viewBox="0 0 24 24">' +
        '<path d="M13.8 2.8H7.2A1.8 1.8 0 0 0 5.4 4.6v14.8a1.8 1.8 0 0 0 1.8 1.8h9.6a1.8 1.8 0 0 0 1.8-1.8V7.6l-4.8-4.8Z"/>' +
        '<path d="M13.8 2.8v4.8h4.8"/>' +
        '<path d="M8.6 12.2h6.8M8.6 15.4h6.8M8.6 18.6h4"/>' +
      '</symbol>',
      // Briefcase
      '<symbol id="wr-briefcase" viewBox="0 0 24 24">' +
        '<rect x="2.6" y="7.2" width="18.8" height="12.6" rx="1.8"/>' +
        '<path d="M8.8 7.2V5.8A1.8 1.8 0 0 1 10.6 4h2.8a1.8 1.8 0 0 1 1.8 1.8v1.4"/>' +
        '<path d="M2.6 12.6h18.8M10.4 12.6h3.2"/>' +
      '</symbol>',
      // Heart cupped in a hand
      '<symbol id="wr-hand-heart" viewBox="0 0 24 24">' +
        '<path d="M12 9.4C12 9.4 8.4 7.2 8.4 5.3A2 2 0 0 1 12 4.1a2 2 0 0 1 3.6 1.2c0 1.9-3.6 4.1-3.6 4.1Z"/>' +
        '<path d="M3.6 20.6v-5.4a1.8 1.8 0 0 1 1.8-1.8h2l2 1.4h3a1.5 1.5 0 0 1 0 3h-2.6"/>' +
        '<path d="M9.8 17.8h3l4.8-2.2a1.7 1.7 0 0 1 1.6 3l-5.4 3a3.2 3.2 0 0 1-1.6.4H3.6"/>' +
      '</symbol>',
      // Microphone
      '<symbol id="wr-mic" viewBox="0 0 24 24">' +
        '<rect x="9" y="2.6" width="6" height="11.2" rx="3"/>' +
        '<path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0"/>' +
        '<path d="M12 18v3.4M8.6 21.4h6.8"/>' +
      '</symbol>',
      // Lit candle
      '<symbol id="wr-candle" viewBox="0 0 24 24">' +
        '<path d="M12 2.8c1.8 1.7 2.7 3.1 2.7 4.4A2.7 2.7 0 0 1 12 9.9a2.7 2.7 0 0 1-2.7-2.7c0-1.3.9-2.7 2.7-4.4Z"/>' +
        '<path d="M12 9.9v1.9"/>' +
        '<rect x="8.4" y="11.8" width="7.2" height="9.4" rx="1.4"/>' +
        '<path d="M8.4 15h7.2"/>' +
      '</symbol>',
      // Price tag
      '<symbol id="wr-tag" viewBox="0 0 24 24">' +
        '<path d="M11.9 3H4.8A1.8 1.8 0 0 0 3 4.8v7.1a1.8 1.8 0 0 0 .53 1.27l7.6 7.6a1.8 1.8 0 0 0 2.54 0l7.1-7.1a1.8 1.8 0 0 0 0-2.54l-7.6-7.6A1.8 1.8 0 0 0 11.9 3Z"/>' +
        '<circle cx="7.6" cy="7.6" r="1.5"/>' +
      '</symbol>',
      // Clock
      '<symbol id="wr-clock" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M12 6.6V12l3.6 2.2"/>' +
      '</symbol>',
      // Ruler
      '<symbol id="wr-ruler" viewBox="0 0 24 24">' +
        '<rect x="1.8" y="8.2" width="20.4" height="7.6" rx="1.4"/>' +
        '<path d="M6 8.2v3M10 8.2v4.2M14 8.2v3M18 8.2v4.2"/>' +
      '</symbol>',
      // Globe
      '<symbol id="wr-globe" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M3 12h18"/>' +
        '<path d="M12 3c2.6 2.6 4 5.6 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.6-4-9s1.4-6.4 4-9Z"/>' +
      '</symbol>',
      // Parcel
      '<symbol id="wr-package" viewBox="0 0 24 24">' +
        '<path d="M20.5 7.8v8.4a1.6 1.6 0 0 1-.85 1.41l-6.9 3.8a1.6 1.6 0 0 1-1.5 0l-6.9-3.8A1.6 1.6 0 0 1 3.5 16.2V7.8a1.6 1.6 0 0 1 .85-1.41l6.9-3.8a1.6 1.6 0 0 1 1.5 0l6.9 3.8A1.6 1.6 0 0 1 20.5 7.8Z"/>' +
        '<path d="m3.7 7 8.3 4.6L20.3 7"/>' +
        '<path d="M12 11.6V21"/>' +
      '</symbol>',
      // A path that turns — for a pivot
      '<symbol id="wr-signpost" viewBox="0 0 24 24">' +
        '<path d="M4.5 20.5v-7.2a3.8 3.8 0 0 1 3.8-3.8h11"/>' +
        '<path d="m15.4 5.8 3.9 3.7-3.9 3.7"/>' +
      '</symbol>',
      // Bar chart
      '<symbol id="wr-chart" viewBox="0 0 24 24">' +
        '<path d="M3.4 19.4h17.2"/>' +
        '<rect x="5.6" y="12.4" width="3.5" height="5.4" rx=".7"/>' +
        '<rect x="10.2" y="8.4" width="3.5" height="9.4" rx=".7"/>' +
        '<rect x="14.8" y="4.6" width="3.5" height="13.2" rx=".7"/>' +
      '</symbol>',
      // Heart
      '<symbol id="wr-heart" viewBox="0 0 24 24">' +
        '<path d="M12 20.9 3.9 12.6a5 5 0 0 1 0-7.1 5 5 0 0 1 7.1 0l1 1 1-1a5 5 0 0 1 7.1 0 5 5 0 0 1 0 7.1Z"/>' +
      '</symbol>',
      // Two figures
      '<symbol id="wr-users" viewBox="0 0 24 24">' +
        '<circle cx="9" cy="8" r="3.4"/>' +
        '<path d="M2.8 20.4a6.2 6.2 0 0 1 12.4 0"/>' +
        '<path d="M16.4 4.9a3.4 3.4 0 0 1 0 6.6"/>' +
        '<path d="M17.6 14.6a6.2 6.2 0 0 1 3.6 5.8"/>' +
      '</symbol>',
      // Four-point sparkle, for magic
      '<symbol id="wr-sparkle" viewBox="0 0 24 24">' +
        '<path d="M10.6 3.4c0 3.9 3.1 7 7 7-3.9 0-7 3.1-7 7 0-3.9-3.1-7-7-7 3.9 0 7-3.1 7-7Z"/>' +
        '<path d="M18.6 14.2c0 1.8 1.5 3.3 3.3 3.3-1.8 0-3.3 1.5-3.3 3.3 0-1.8-1.5-3.3-3.3-3.3 1.8 0 3.3-1.5 3.3-3.3Z"/>' +
      '</symbol>',
      // Folded map
      '<symbol id="wr-map" viewBox="0 0 24 24">' +
        '<path d="M2.8 6.6 9 4.2v13.2l-6.2 2.4V6.6Z"/>' +
        '<path d="M9 4.2 15 6.6v13.2L9 17.4"/>' +
        '<path d="m15 6.6 6.2-2.4v13.2L15 19.8"/>' +
      '</symbol>',
      // Ticked list
      '<symbol id="wr-checklist" viewBox="0 0 24 24">' +
        '<path d="M9.6 6.4h10.2M9.6 12h10.2M9.6 17.6h10.2"/>' +
        '<path d="m3.4 6.2 1.4 1.4 2.4-2.6"/>' +
        '<path d="m3.4 11.8 1.4 1.4 2.4-2.6"/>' +
        '<path d="m3.4 17.4 1.4 1.4 2.4-2.6"/>' +
      '</symbol>',
      // Stacked coins
      '<symbol id="wr-coins" viewBox="0 0 24 24">' +
        '<ellipse cx="12" cy="6.8" rx="7.4" ry="3.1"/>' +
        '<path d="M4.6 6.8v5c0 1.7 3.3 3.1 7.4 3.1s7.4-1.4 7.4-3.1v-5"/>' +
        '<path d="M4.6 11.8v5c0 1.7 3.3 3.1 7.4 3.1s7.4-1.4 7.4-3.1v-5"/>' +
      '</symbol>',
      // Balance scales
      '<symbol id="wr-scales" viewBox="0 0 24 24">' +
        '<path d="M12 4.6v15.2"/>' +
        '<path d="M7.8 19.8h8.4"/>' +
        '<path d="M4.6 8.6h14.8"/>' +
        '<path d="m4.6 8.6-3 6a3 3 0 0 0 6 0l-3-6Z"/>' +
        '<path d="m19.4 8.6-3 6a3 3 0 0 0 6 0l-3-6Z"/>' +
      '</symbol>',
      // Padlock
      '<symbol id="wr-lock" viewBox="0 0 24 24">' +
        '<rect x="4.4" y="10.4" width="15.2" height="10.6" rx="2"/>' +
        '<path d="M7.8 10.4V7.6a4.2 4.2 0 0 1 8.4 0v2.8"/>' +
        '<circle cx="12" cy="15.4" r="1.5"/>' +
      '</symbol>',
      // Struck-through circle, for the things I will not do
      '<symbol id="wr-no" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M5.6 5.6 18.4 18.4"/>' +
      '</symbol>',
      // Fingerprint, for crime
      '<symbol id="wr-fingerprint" viewBox="0 0 24 24">' +
        '<path d="M3.6 11.8a8.4 8.4 0 0 1 16.8 0v1.6"/>' +
        '<path d="M6.8 12a5.2 5.2 0 0 1 10.4 0c0 2.6-.4 5-1.2 7.2"/>' +
        '<path d="M9.9 12a2.1 2.1 0 0 1 4.2 0c0 3.2-.5 6.2-1.5 8.7"/>' +
        '<path d="M5.7 17.9c.7-1.9 1.1-3.9 1.1-5.9"/>' +
        '<path d="M20.3 15.8c-.2 1.5-.5 2.9-1 4.2"/>' +
      '</symbol>',
      // Stethoscope
      '<symbol id="wr-stethoscope" viewBox="0 0 24 24">' +
        '<path d="M4.4 2.8h-.6A1.8 1.8 0 0 0 2 4.6v4.2a5.6 5.6 0 0 0 11.2 0V4.6a1.8 1.8 0 0 0-1.8-1.8h-.6"/>' +
        '<path d="M7.6 14.4v1.2a5 5 0 0 0 10 0v-2.3"/>' +
        '<circle cx="17.6" cy="11" r="2.3"/>' +
      '</symbol>',
      // Calculator, for the word count sums
      '<symbol id="wr-calculator" viewBox="0 0 24 24">' +
        '<rect x="4.4" y="2.6" width="15.2" height="18.8" rx="2"/>' +
        '<rect x="7.4" y="5.6" width="9.2" height="3.4" rx="1"/>' +
        '<path d="M7.8 12.6h1.6M11.2 12.6h1.6M14.6 12.6h1.6"/>' +
        '<path d="M7.8 15.8h1.6M11.2 15.8h1.6M14.6 15.8h1.6"/>' +
        '<path d="M7.8 19h1.6M11.2 19h1.6M14.6 19h1.6"/>' +
      '</symbol>',
      // Framed photograph, for a life story
      '<symbol id="wr-photo" viewBox="0 0 24 24">' +
        '<rect x="3" y="4.4" width="18" height="15.2" rx="2"/>' +
        '<circle cx="8.4" cy="9.6" r="1.6"/>' +
        '<path d="m3.4 17.6 4.8-4.7a1.8 1.8 0 0 1 2.5 0l3.9 3.9"/>' +
        '<path d="m14.1 14.6 1.8-1.7a1.8 1.8 0 0 1 2.5 0l2.2 2.1"/>' +
      '</symbol>',
      // Megaphone, for the words that sell the book
      '<symbol id="wr-megaphone" viewBox="0 0 24 24">' +
        '<path d="M4.6 9.4h3.2L18 4.2v15.6L7.8 14.6H4.6a1.8 1.8 0 0 1-1.8-1.8v-1.6a1.8 1.8 0 0 1 1.8-1.8Z"/>' +
        '<path d="M7.8 9.4v5.2"/>' +
        '<path d="M20.4 9.2a3.4 3.4 0 0 1 0 5.6"/>' +
      '</symbol>',
      // The name, drawn: rain falling onto an open book. Homepage hero only.
      // Keep the viewBox origin at 0 0. <use> defaults to x="0" y="0", so a
      // symbol whose viewBox starts anywhere else gets placed that far off and
      // clipped — which is not obvious until you see it on the page.
      '<symbol id="wr-art-book" viewBox="0 0 148 164">' +
        '<path d="M74 84C60 74 40 68 14 68c-3 23-3 47 0 70 26 0 46 6 60 16Z"/>' +
        '<path d="M74 84c14-10 34-16 60-16 3 23 3 47 0 70-26 0-46 6-60 16Z"/>' +
        '<path d="M74 84v70"/>' +
        '<path d="M24 90c14 2.5 28 6.5 40 11M24 104c14 2.5 28 6.5 40 11M24 118c14 2.5 28 6.5 40 11"/>' +
        '<path d="M124 90c-14 2.5-28 6.5-40 11M124 104c-14 2.5-28 6.5-40 11M124 118c-14 2.5-28 6.5-40 11"/>' +
        '<g opacity=".72">' +
          '<path d="m18 10-6 18M42 6l-6 18M66 14l-6 18M90 8l-6 18M114 12l-6 18M138 8l-6 18"/>' +
          '<path d="m30 36-5 16M54 32l-5 16M78 38l-5 16M102 34l-5 16M126 30l-5 16"/>' +
          '<path d="m54 54-4 12M78 58l-4 12M102 52l-4 12"/>' +
        '</g>' +
      '</symbol>'
    ].join('');

    // Built through an HTML container so the parser puts everything in the SVG
    // namespace; createElement alone would not.
    var host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    host.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + symbols + '</svg>';
    document.body.insertBefore(host, document.body.firstChild);
  })();

  // --- Mobile menu ---
  var menuToggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Theme toggle (persisted where storage is available) ---
  var themeToggle = document.getElementById('theme-toggle');
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeToggle) themeToggle.innerHTML = t === 'dark' ? '&#9788;' : '&#9790;';
    try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable; theme just won't persist */ }
  }
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme('dark');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // --- Privacy popup ---
  (function () {
    var btn = document.getElementById('privacyBtn');
    var popup = document.getElementById('privacyPopup');
    var closeBtn = document.getElementById('privacyPopupClose');
    if (!btn || !popup || !closeBtn) return;

    function isOpen() { return popup.getAttribute('aria-hidden') === 'false'; }

    function openPopup() {
      popup.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }

    function closePopup(returnFocus) {
      popup.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () { isOpen() ? closePopup(true) : openPopup(); });
    closeBtn.addEventListener('click', function () { closePopup(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closePopup(true);
    });
    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (popup.contains(e.target) || btn.contains(e.target)) return;
      closePopup(false);
    });
  })();

  // --- Word count calculator (pricing.html only) ---
  // The three manuscript services share one shape: a base price covering the
  // first 60,000 words, then a published rate per additional 1,000. The markup
  // ships with the sums for the default word count already filled in, so the
  // panel still says something useful with scripting off.
  (function () {
    var input = document.getElementById('calc-words');
    if (!input) return;

    var FREE_TO = 60000;
    var services = {
      proof: { base: 250, rate: 4 },
      copy:  { base: 350, rate: 6 },
      dev:   { base: 400, rate: 7 }
    };
    var note = document.getElementById('calc-note');

    function money(n) { return '£' + n.toLocaleString('en-GB'); }

    function update() {
      var words = parseInt(String(input.value).replace(/[^0-9]/g, ''), 10);
      var valid = isFinite(words) && words > 0;
      // Part-thousands are charged as a whole thousand, so the quote can never
      // come out lower than the number shown here.
      var extra = valid ? Math.max(0, Math.ceil((words - FREE_TO) / 1000)) : 0;

      Object.keys(services).forEach(function (key) {
        var s = services[key];
        var priceEl = document.querySelector('[data-calc-price="' + key + '"]');
        var sumEl = document.querySelector('[data-calc-sum="' + key + '"]');
        if (priceEl) priceEl.textContent = valid ? money(s.base + extra * s.rate) : '—';
        if (!sumEl) return;
        if (!valid) {
          sumEl.textContent = 'Waiting on a word count';
        } else if (extra === 0) {
          sumEl.textContent = money(s.base) + ' flat, with ' +
            (FREE_TO - words).toLocaleString('en-GB') + ' words to spare';
        } else {
          sumEl.textContent = money(s.base) + ' + (' + extra + ' × ' + money(s.rate) + ')';
        }
      });

      if (!note) return;
      if (!valid) {
        note.textContent = 'Put a word count in and the three prices work themselves out.';
      } else if (extra === 0) {
        note.textContent = 'Under 60,000 words, so all three sit at the base price. Nothing is added on.';
      } else {
        note.textContent = words.toLocaleString('en-GB') + ' words is 60,000 plus ' + extra +
          ' more thousand, and only that second part is charged per 1,000. Part-thousands round up, ' +
          'so the quote you get will match this number or come in under it.';
      }
    }

    // Stepper buttons, standing in for the browser's spin buttons: those sit on
    // top of a right-aligned number and clip the last digit. Each click moves to
    // the next round thousand rather than adding to an odd count, so 82,300 goes
    // to 83,000 rather than 83,300. The input's own arrow keys still work.
    var steppers = document.querySelectorAll('[data-calc-step]');
    Array.prototype.forEach.call(steppers, function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.getAttribute('data-calc-step'), 10);
        var size = Math.abs(step);
        var current = parseInt(String(input.value).replace(/[^0-9]/g, ''), 10);
        if (!isFinite(current)) current = 0;
        var next = step > 0
          ? (Math.floor(current / size) + 1) * size
          : Math.ceil(current / size - 1) * size;
        var min = parseInt(input.min, 10);
        var max = parseInt(input.max, 10);
        if (isFinite(min)) next = Math.max(min, next);
        if (isFinite(max)) next = Math.min(max, next);
        input.value = next;
        update();
      });
    });

    input.addEventListener('input', update);
    update();
  })();

  // The contact form posts in place rather than handing the visitor over to
  // Formspree's own thank-you page. Every form also carries a _next field, so
  // with scripting off the plain POST still happens and lands on thanks.html —
  // this only takes over when there's something to take over with.
  (function () {
    var forms = document.querySelectorAll('.contact-form');
    if (!forms.length || !window.fetch || !window.FormData) return;

    var THANKS = 'Thank you for your enquiry. I will get back to you within one business day.';

    Array.prototype.forEach.call(forms, function (form) {
      var status = form.querySelector('.form-status');
      if (!status) return;

      form.addEventListener('submit', function (e) {
        // Let the browser show its own validation messages before we intervene.
        if (form.checkValidity && !form.checkValidity()) return;
        e.preventDefault();

        status.className = 'form-status';
        status.textContent = '';
        form.classList.add('is-sending');

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.classList.remove('is-sending');
          status.className = 'form-status is-ok';
          status.textContent = THANKS;
          // Take the fields away with it, so the same message can't go twice.
          var spent = form.querySelectorAll('.form-field, button[type="submit"], .form-note');
          Array.prototype.forEach.call(spent, function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
          });
        }).catch(function () {
          form.classList.remove('is-sending');
          status.className = 'form-status is-error';
          status.innerHTML = 'Something went wrong sending that – the fault is mine, not yours. ' +
            'Please email me at <a href="mailto:robartben@gmail.com">robartben@gmail.com</a> ' +
            'and I\'ll pick it up from there.';
        });
      });
    });
  })();

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Reveal on scroll (also drives .stagger and .section-title rules) ---
  var revealEls = document.querySelectorAll('.reveal, .stagger, .section-title');
  if ('IntersectionObserver' in window && !reduced) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Reading progress bar + nav shadow, both driven by one scroll handler ---
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var nav = document.querySelector('nav');
  var ticking = false;

  function onScroll() {
    var top = window.pageYOffset || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (height > 0 ? Math.min(top / height, 1) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', top > 12);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();
