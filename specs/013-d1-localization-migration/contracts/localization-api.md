# Localization API Contract

## Endpoint

- **Method**: `GET`
- **Path**: `/api/localizations`
- **Purpose**: Serve the requested locale’s translation payload so the admin UI and other Astro pages can render labels dynamically.

## Request Parameters

- `locale` (required string): ISO code such as `en` or `vi`.  
- `namespace` (optional string): Dot-separated prefix (e.g., `actions`, `messages`) to limit the response to specific UI areas, reducing payload size.

## Response

- **200 OK**
  ```json
  {
    "locale": "en",
    "fallback": false,
    "translations": {
      "nav.home": "Home",
      "actions.createPost": "Create Post",
      ...
    }
  }
  ```
  - `fallback` indicates if any keys were served from the default locale due to gaps.
  - `translations` maps clean keys to user-facing strings; description fields (e.g., `messages.permissionCatalogDescription`) are not included.

- **4XX/5XX**
  - Prefers returning cached or default-language payloads with an error flag in tooling logs rather than blocking the UI.

## Notes

- This API runs inside the Worker process and fetches translation rows directly from D1, optionally filtering by namespace and paginating or chunking if necessary for very large catalogs.
