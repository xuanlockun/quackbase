<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Language-English-0f172a?style=for-the-badge" alt="English README"></a>
  <a href="./README.vi.md"><img src="https://img.shields.io/badge/Ngôn_ngữ-Tiếng_Việt-dc2626?style=for-the-badge" alt="Vietnamese README"></a>
</p>

<h1 style="display: flex; align-items: center; gap: 10px;">
  <img src="docs/quackbase.png" alt="V1t" height="40">
  <span>Quackbase</span>
</h1>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5-black.svg)](https://astro.build/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020.svg)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/quackbase)

<img src="docs/d5677d11-feb4-4bcc-9a67-eb5525620533.png" alt="Demo" height="420">

**Quackbase is a lightweight runtime CMS for Astro, powered by Cloudflare Workers and D1.**

Ship content-driven websites fast without managing servers, stitching together a separate backend, or paying for infrastructure before the project proves itself.

Quackbase gives you runtime content editing, a clean admin experience, and a Cloudflare-native deployment model that stays lean, fast, and easy to ship.

## ✨ Why Quackbase?

Most CMS setups are either too heavy, too expensive, or too annoying to deploy.

Quackbase is built around a simpler idea:

> Your Astro site should stay fast, your content should be editable at runtime, and your infrastructure should fit in your pocket.

💳 No credit card.  
🖥️ No server.  
🧾 No vendor ceremony.  
🦆 No bullsh*t.

Just Astro, Cloudflare Workers, D1, and a tiny CMS layer that gets out of your way.

## 🎯 Built for

Quackbase is a good fit for:

| Project type | Why it fits |
| --- | --- |
| Blogs | Publish and edit content at runtime without rebuild friction. |
| Docs sites | Keep documentation lightweight, fast, and easy to update. |
| Landing pages | Manage marketing content with a simple admin flow. |
| Changelogs | Ship product updates quickly with structured publishing. |
| Portfolios | Maintain a polished personal site without backend overhead. |
| Startup websites | Move fast with a small stack and low hosting complexity. |
| Small content-heavy products | Handle pages and posts cleanly without CMS bloat. |
| Indie projects | Add a CMS layer without the baggage of a traditional platform. |

## 🚫 Not built for

Quackbase is intentionally small.

It is probably not what you want if you need:

- enterprise workflow approval chains
- massive editorial teams
- complex multi-tenant permission systems
- a WordPress replacement with every plugin under the sun

This project is for people who want something lean, understandable, and easy to deploy.

## ⚙️ Installation

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/quackbase)

Deploy and setup admin credential at /admin.

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

## 🏗️ Architect

Quackbase follows a simple edge-first architecture:

- **Astro** handles the frontend, routing, and page rendering.
- **Cloudflare Workers** runs the application runtime close to users.
- **Cloudflare D1** stores posts, pages, settings, and admin-managed content.
- **Admin UI** lives inside the same project, so content editing and site delivery stay in one deployable codebase.

This keeps the system small and practical: one Astro app, one edge runtime, one database, and no separate CMS server to maintain.

## 📚 Documentation

- [Project docs](https://quackbase.v1t.site/)
- [Astro](https://astro.build/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Credit

From V1t with love ❤️

Thanks to [Mr. Hieu](https://www.linkedin.com/in/hieu-ha-ngoc) for inspiring this project.

<img src="docs/V1t_.png" alt="V1t" height="120"> X <img src="docs/allxone.webp" alt="AllXOne" height="40">
