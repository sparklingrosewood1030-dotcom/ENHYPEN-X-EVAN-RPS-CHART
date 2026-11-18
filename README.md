# ENHYPEN × EVAN Pairing Preference Chart

A fan-made, static website starter for GitHub Pages. It uses plain HTML, CSS, and JavaScript; no build step is required.

## Included
- Seven-person directional 7×7 matrix: Jay, Jake, Sunghoon, Sunoo, Jungwon, Ni-ki, Evan
- Ten fixed preference categories
- Visitor-adjustable category colors
- Browser-local autosave
- Undo / redo and reset
- JSON backup import/export
- Member photo upload stored in the browser
- PNG export
- Responsive layout with horizontal chart scrolling on narrow screens

## Run locally
Open `index.html` in a modern browser. For the most reliable file and image behavior, serve the folder with a local static server (for example, VS Code Live Server).

## Publish on GitHub Pages
1. Create a new repository in your GitHub account.
2. Upload all files and the `assets` folder.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then save.
5. Wait for the Pages deployment and open the published URL.

## Customize member names
Edit `members.js`. The default roster is Jay, Jake, Sunghoon, Sunoo, Jungwon, Ni-ki, and Evan.

## Pairing names: important
The chart keeps direction separate. Pairing key format in `members.js` is `rowId|columnId`. For example:
- `jake|jay` = Jake in the row, Jay in the column
- `jay|jake` = Jay in the row, Jake in the column

Only the user-confirmed example `jake|jay` is prefilled as `젴젱 / Jekjeng`. Other pairing names are intentionally shown as member-name placeholders until the correct Korean Hangul and English romanizations are supplied. Do not assume that reversing a pairing name is mechanically correct.

## Local privacy and limitations
- Preferences and uploaded photos are saved in the visitor's browser, not sent to a server.
- Clearing browser data may remove the saved chart. Use Export backup to keep a copy.
- Imported JSON backups replace the current chart after confirmation.
- Photo files are kept in browser storage and are not uploaded to GitHub.
- The PNG exporter uses SVG foreignObject rendering; some browsers may restrict this. If export fails, use the JSON backup and try a current desktop browser.
- This is a starter implementation. Test the site on target browsers and devices before public release.

## Branding
The header currently uses editable text rather than an official logo asset. Add authorized logo files to `assets/` and update `index.html` when those assets are ready.

## Disclaimer
Unofficial fan-made project, not affiliated with or endorsed by ENHYPEN, EVAN, or their representatives.
