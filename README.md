# Asya business cards

Open-source digital business card platform by ASYA.

Each user gets a public profile page at `/<username>` with links, contact info, avatar, and vCard export.

## Features

- Public card pages with custom links
- vCard endpoint (`/<username>/vcard`) for contact import
- Optional contact form per card
- Page analytics (views, link clicks, form submissions, vCard downloads)
- SSO authentication (OIDC via NextAuth)
- Role-based access (`user` / `admin` groups)
- Admin panel for user management and default settings
- Avatar upload + crop

## Page titles

- Public card pages use the user `displayName` as the page title
- All other pages use `Asya business cards`

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- PostgreSQL 17
- NextAuth v5 (beta)
- Docker Compose

## Local development

### Prerequisites

- Node.js 22+
- pnpm
- Docker

### Setup

```bash
pnpm install
cp .env.example .env
docker compose up db -d
pnpm db:migrate
pnpm dev
```

App runs at `http://localhost:3000` in local dev.

## Production with Docker Compose

```bash
docker compose up -d --build
```

Compose services:

- `db` (PostgreSQL)
- `migrate` (runs Drizzle migrations once)
- `app` (Next.js standalone server)

Default published app port in compose: `3017:3000`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push schema directly (dev only) |
| `pnpm db:studio` | Open Drizzle Studio |

## Environment variables

All required variables are documented in `.env.example`.

Do not commit real secrets. Keep `.env` private.

## Open-source safety checklist

Before pushing public commits:

- Ensure `.env` is not tracked
- Ensure no private keys/certs are tracked
- Keep only template values in `.env.example`
- Review `docker-compose.yml` for hardcoded credentials
- Run `git status` and verify only intended files are staged

## License

Add your preferred license file (for example `MIT`) before publishing.
