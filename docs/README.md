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
|   |-- deployment.html
|   |-- architecture.html
|   |-- media.html
|   |-- captcha.html
|   |-- email.html
|   |-- languages.html
|   `-- backup.html
|-- assets/
|   |-- css/
|   |   `-- styles.css
|   `-- js/
|       `-- main.js
```

## Notes

- The docs use only HTML, CSS, and plain JavaScript.
- Dark mode is the default and the selected theme is stored in `localStorage`.
- The introduction page uses the existing Quackbase assets already stored in `docs/`.
