# Jorby

Private shared-household catalog. Foundry Ontology is the application backend; this repository is the GitHub source of truth for the React frontend, membership service, and living specifications.

## Living specifications

Read [docs/README.md](./docs/README.md) first. Those documents override assumptions in code when they disagree.

## Repository layout

```text
jorby/
├── apps/
│   └── web/                 # React PWA (Vite, TypeScript, Tailwind, shadcn)
├── services/
│   └── membership/          # Trusted invite/membership service (not started)
├── packages/                # Shared packages (reserved)
├── docs/                    # Product, ontology, and agent handoff
└── .github/workflows/
```

## Web app

```bash
cd apps/web
npm install
npm run dev
```

Do not expand into Money, Together, uploaded media, or social features without an approved decision in `docs/product-decisions.md`.
