# ethanadams.dev

Personal project showcase website.

## Current Project: County Value Mapper

An interactive map viewer for finding ideal places to live based on customizable data overlays (land value, fiber access, farmland, etc.).

## Stack

- **Vite** - Fast dev server and build tool
- **Svelte + TypeScript** - Reactive UI framework
- **MapLibre GL JS** - Free, open-source mapping library
- **Vanilla CSS** - Full styling control

## Development

```bash
npm install
npm run dev
```

## Deployment

Production deploys run through GitHub Actions and Vercel.

Required `ethanadams.dev` repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The site deploy workflow runs on pushes to `master`, manual dispatches, and `repository_dispatch` events named
`mandarin-updated`.

Required `mandarin-lesson-practice` repository secret:

- `SITE_REPO_DISPATCH_TOKEN` - a GitHub token that can create repository dispatch events for
  `ethan-adams/ethanadams.dev`.

When `mandarin-lesson-practice` pushes to `main`, its workflow dispatches a production site deploy.
