# Quackbase

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5-black.svg)](https://astro.build/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020.svg)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/astro-blog-starter-template)

<img src="docs/d5677d11-feb4-4bcc-9a67-eb5525620533.png" alt="Demo" height="420">

**Quackbase is a runtime CMS for Astro, powered by Cloudflare Workers and D1.**

Build fast content-driven websites without spinning up a server, wiring a traditional backend, or paying for a database before your project even has users.

Quackbase gives you a clean admin experience, runtime content editing, and a deploy-anywhere-on-Cloudflare setup that feels small, sharp, and ridiculously easy to ship.

## Why Quackbase?

Most CMS setups are either too heavy, too expensive, or too annoying to deploy.

Quackbase is built around a simpler idea:

> Your Astro site should stay fast, your content should be editable at runtime, and your infrastructure should fit in your pocket.

No credit card.  
No server.  
No vendor ceremony.  
No bullshit.

Just Astro, Cloudflare Workers, D1, and a tiny CMS layer that gets out of your way.

## What you get

- **Runtime content editing**  
  Update pages, posts, and structured content without rebuilding the whole site every time.

- **Cloudflare-native deployment**  
  Runs on Cloudflare Workers with D1 as the database layer.

- **Astro-first architecture**  
  Designed for Astro projects, not retrofitted from a generic CMS.

- **Clean admin UI**  
  A simple editing experience for managing content without touching code.

- **Fast by default**  
  Built close to the edge, with a lightweight stack and minimal moving parts.

- **Open source and hackable**  
  TypeScript all the way down. Fork it, customize it, break it, make it yours.

## Built for

Quackbase is a good fit for:

- blogs
- docs sites
- landing pages
- changelogs
- portfolios
- startup websites
- small content-heavy products
- indie projects that need a CMS without the baggage

## Not built for

Quackbase is intentionally small.

It is probably not what you want if you need:

- enterprise workflow approval chains
- massive editorial teams
- complex multi-tenant permission systems
- a WordPress replacement with every plugin under the sun

This project is for people who want something lean, understandable, and easy to deploy.

## Tech stack

- **Astro 5**
- **TypeScript**
- **Cloudflare Workers**
- **Cloudflare D1**
- **Wrangler**

## 📦 Get Started

```bash
npm install
npm run dev
```

Use the deploy button above when you are ready to publish to Cloudflare.

> **⚠️ Note:** This repository is the app source for Edge CMS. For a private instance, keep your real Cloudflare values in `wrangler.json`. For a public starter, replace those values with placeholders. On a fresh install, the login screen will create the first admin account automatically.

## 🚀 Features

### Core Platform
- **⚡ Edge-First**: Built for Cloudflare Workers with global performance
- **🔧 Developer-Centric**: TypeScript-first and admin-friendly
- **🤖 AI-Friendly**: Structured codebase that is easy to extend
- **📱 Modern Stack**: Astro 5, Cloudflare D1, R2, Bootstrap 5
- **🚀 Fast & Lightweight**: Designed for runtime content, not heavy rebuilds

### Content Management
- **📝 Posts and Pages**: Create and edit runtime content
- **🎛️ Site Settings**: Manage title, logo, favicon, and media config
- **📚 Draft / Publish Flow**: Content can be controlled before going live
- **🌍 Localized Content**: Multilingual content and localized slugs
- **🧩 Modular Admin**: Settings, media, pages, roles, users, and languages

### Media Management
- **🖼️ Media Library**: Upload and manage assets from the admin panel
- **☁️ R2 / S3-Compatible**: Works with Cloudflare R2 or S3-compatible buckets
- **🔐 DB-Backed Settings**: Media config is stored in the database
- **👁️ Secret Toggle**: Reveal saved access key fields when needed
- **🧪 Test Connection**: Validate media credentials from settings

## 📊 What It Includes

| Area | Edge CMS |
|--|--|
| **Runtime content** | Yes |
| **Cloudflare Workers** | Yes |
| **Cloudflare D1** | Yes |
| **Media uploads** | Yes |
| **RBAC** | Yes |
| **Multilingual UI** | Yes |
| **Localized content** | Yes |
| **Database-backed settings** | Yes |

## 🌟 Why Edge CMS?

### Edge Performance
- Runs on Cloudflare’s network
- No traditional server deployment required
- Built for fast runtime content updates
- Works well for global audiences

### Developer Experience
- TypeScript-first with clear patterns
- Astro-based pages and layouts
- Bootstrap-based admin screens
- Easy to extend with new admin sections

### Flexible Storage
- D1 for content and configuration
- R2 or S3-compatible storage for media
- Media secrets can be managed in the admin UI

## 🛠 Technology Stack

### Core Framework
- **Astro 5** - app and admin rendering
- **TypeScript** - strict type safety
- **Bootstrap 5** - admin UI styling

### Cloudflare Services
- **D1** - SQLite database at the edge
- **Workers** - serverless runtime
- **R2** - object storage for media

### Development Tools
- **Vitest** - testing
- **Wrangler** - local development and deployment
- **Node.js 22** - runtime compatibility

## 🏁 Quick Start

### For application developers

If you want to run Edge CMS locally:

```bash
npm install
npm run dev
```

Then open the app and sign in at `/admin`.

### For private deployments

Use your own `wrangler.json` values and Cloudflare bindings, then deploy with:

```bash
npm run deploy
```

## 🔧 Cloudflare Setup

This project uses `wrangler.json` for deployment.

For a private instance, keep your real values in `wrangler.json`:

```json
{
  "name": "edge-cms",
  "compatibility_date": "2025-10-08",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "YOUR_D1_DATABASE_NAME",
      "database_id": "YOUR_D1_DATABASE_ID",
      "migrations_dir": "migrations"
    }
  ],
  "main": "./dist/_worker.js/index.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true
}
```

For a public starter repo, replace real values with placeholders so others can safely copy the project.

## Database And Migrations

The repository now splits migrations into two folders:

- `migrations/` - real bootstrap migrations for new installs
- `migrations-dev/` - the old SQL history and local test migrations

Wrangler points at `migrations/` by default, so fresh installs apply the bootstrap file first.

## 🧩 Admin Areas

- `/admin` - dashboard
- `/admin/posts` - posts
- `/admin/pages` - pages
- `/admin/media` - media library
- `/admin/settings` - site, media, and secrets settings
- `/admin/users` - users
- `/admin/roles` - roles and permissions
- `/admin/languages` - language management

## 🗂 Media Storage

Media settings are managed from the admin settings page.

Supported fields:
- S3 upload endpoint
- Bucket name
- Public base URL
- Access key ID
- Secret access key
- Region
- Path-style toggle

The app can work with Cloudflare R2 or other S3-compatible providers.

## 🌐 API Endpoints

### Content
- `GET /admin/posts` - list posts
- `GET /admin/pages` - list pages
- `GET /admin/media` - media library

### Admin actions
- `POST /api/admin/site` - save site settings
- `POST /api/admin/media/settings` - save/test media settings
- `POST /api/admin/media/sync` - refresh media library from bucket when listing is supported

## 🚀 Deployment

```bash
npm run build
npm run deploy
```

### Environment Configuration

- Keep private Cloudflare IDs in your own `wrangler.json`
- Do not commit secrets to the public repo
- Use the admin UI for media secrets when appropriate

## 🧪 Testing

```bash
npm test
npm run check
```

When changing media behavior, verify:

- upload works
- delete works
- bucket refresh works if the provider supports listing
- settings save and load correctly

## 📁 Project Structure

```text
.
|-- locales/
|-- migrations/
|-- migrations-dev/
|-- public/
|-- src/
|   |-- components/
|   |-- layouts/
|   |-- lib/
|   `-- pages/
|-- tests/
`-- wrangler.json
```

## 📚 Documentation

- [Astro](https://astro.build/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
