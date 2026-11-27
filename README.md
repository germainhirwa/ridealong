# Ridealong landing page

Static landing page for Ridealong: a one-button wristband recorder for in-home sales reps, plus a scorecard after every appointment.

No build step. Plain HTML, CSS and a little JavaScript.

```
index.html   the page
styles.css   all styling
main.js      lead forms, revenue calculator, scroll effects
assets/      product renders
```

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy on Vercel

Import the repo in Vercel, keep the framework preset at **Other**, and deploy. No build command or output directory needed.

## Before going live

- **Wire up the lead forms.** Set `FORM_ENDPOINT` at the top of `main.js` (Formspree, Basin, or your own endpoint). Until then, submitting only shows the thank-you message.
- **Replace sample data.** The scorecard card in the hero and the team view table use sample names and numbers.
- **Customer stories.** The section is built but hidden (`<section id="stories" hidden>` in `index.html`). Fill each card with a real customer's words, name and company, with their permission, then remove `hidden`.
- **Images.** Photos other than the band renders load from the pilot site (ridealong-pilot.vercel.app). Copy them into `assets/` and update the paths so this site doesn't depend on it.
