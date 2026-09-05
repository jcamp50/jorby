# Jorby

Private shared-household catalog.

**This GitHub repository is the frontend and membership service only.** Foundry Ontology is the application backend and lives in a separate project. Product and Ontology specs are copied here so the UI stays aligned.

## Living specifications

Start at [docs/README.md](./docs/README.md).

- Product and Ontology (Foundry, not coded here): `docs/product-decisions.md`, `docs/ontology-spec.md`
- This repo: [docs/this-repo/README.md](./docs/this-repo/README.md)

## Repository layout

```text
jorby/
├── apps/web/                 # React PWA
├── services/membership/      # Trusted invite/membership service
├── packages/                 # Shared packages (reserved)
├── docs/                     # Product + Ontology specs, plus docs/this-repo/
└── .github/workflows/
```

## Web app

```bash
cd apps/web
npm install
npm run dev
```

Do not expand into Money, Together, uploaded media, or social features without an approved decision in `docs/product-decisions.md`.
