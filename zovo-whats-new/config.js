globalThis.ZOVO_WHATS_NEW = Object.freeze({
  "version": "1.0.18",
  "name": "Form Filler Pro",
  "id": "hmbedfhmeeljkifcnekoidogkplcbkpk",
  "slug": "form-filler-pro",
  "date": "2026-10-31",
  "changes": [
    {
      "type": "fixed",
      "text": "The Random button no longer shows a PRO badge or an upgrade note. Random fill was always free, and now the popup says so."
    },
    {
      "type": "fixed",
      "text": "After you activate a key, the Settings page now shows Pro and opens the Sequences tab."
    },
    {
      "type": "new",
      "text": "The popup has a What's new link, so you can open this page when you want to."
    },
    {
      "type": "improved",
      "text": "This page opens by itself at most once in 30 days, and never after a new install. You can turn it off at the bottom."
    },
    {
      "type": "new",
      "text": "After some real use, the popup shows one short note from me with two links, one to rate and one to tell me what's missing. Not now hides it for 90 days."
    }
  ],
  "stats": [
    {
      "area": "local",
      "key": "usageStats",
      "path": "fillCount",
      "label": "forms filled"
    }
  ],
  "tips": [
    "Make one profile for each test account, so one click fills the right data.",
    "Use Random on a sign up form to test it with new data each time.",
    "Press Alt+F on a page with a form to fill it with the selected profile."
  ],
  "plan": {
    "area": "sync",
    "key": "proStatus",
    "path": "isPro",
    "pro": [
      true
    ],
    "free": [
      false
    ]
  },
  "signal": {
    "area": "local",
    "key": "usageStats",
    "path": "fillCount",
    "min": 20,
    "line": "You've filled {n} forms with it."
  },
  "icon": "icon.png"
});
