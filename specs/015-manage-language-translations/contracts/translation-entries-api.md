# Contracts: Translation entries CRUD surface

All operations happen within the admin workspace under `/admin/languages/[locale]`. The page interacts with shared worker-side logic and D1; the following contract documents the expected requests/responses handled by the admin controller (Astro route or API endpoint).

## GET /admin/api/languages/:locale/translations

- **Purpose**: List translation entries scoped to a single locale.
- **Request**:  
  `GET /admin/api/languages/fr/translations`
- **Response**: `200 OK` with JSON body  
  ```json
  {
    "locale": "fr",
    "entries": [
      {
        "id": 42,
        "key": "nav.home",
        "value": "Accueil",
        "context": "Homepage nav label",
        "updated_at": "2026-04-08T20:15:00Z"
      }
    ]
  }
  ```

## POST /admin/api/languages/:locale/translations

- **Purpose**: Create a new translation entry for the specified locale.
- **Request body**:
  ```json
  {
    "key": "nav.blog",
    "value": "Blog",
    "context": "Navigation",
    "source": "admin"
  }
  ```
- **Response**: `201 Created` with the created entry.

## PATCH /admin/api/languages/:locale/translations/:id

- **Purpose**: Update the value (and optional metadata) of an existing entry.
- **Request body**:
  ```json
  {
    "value": "Nouvelles",
    "context": "Sidebar collection"
  }
  ```
- **Response**: `200 OK` with the updated entry snapshot.

## DELETE /admin/api/languages/:locale/translations/:id

- **Purpose**: Remove an entry for maintenance.
- **Response**: `204 No Content` on success; the entry should no longer appear in subsequent lists.
