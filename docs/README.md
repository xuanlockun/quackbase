# Quackbase Docs in `docs/`

This documentation site is fully static and can be hosted directly from the repository `docs/` folder with GitHub Pages.

## Enable GitHub Pages

1. Push the repository to GitHub.
2. Open `Settings` -> `Pages`.
3. In `Build and deployment`, choose `Deploy from branch`.
4. Select branch `main`.
5. Select folder `/docs`.
6. Click `Save`.

## Structure

```text
docs/
|-- index.html
|-- pages/
|   |-- quickstart.html
|   |-- architecture.html
|   |-- backup-restore.html
|   |-- media.html
|   |-- captcha.html
|   |-- email.html
|   |-- api-reference.html
|   |-- database.html
|   |-- authentication.html
|   `-- deployment.html
|-- assets/
|   |-- css/
|   |   `-- styles.css
|   `-- js/
|       `-- main.js
`-- README.md
```

## Notes

- The docs use only HTML, CSS, and plain JavaScript.
- Mermaid is loaded from a CDN only on pages that need architecture or workflow diagrams.
- Tabs, theme switching, copy actions, active navigation, and search filtering are handled in `assets/js/main.js`.
- The layout stays GitHub Pages compatible and uses relative paths that work for both `index.html` and nested pages.
