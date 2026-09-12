# Jorby design direction

**Status:** Living visual language  
**Last updated:** 2026-09-05  
**Reference:** Monzo iOS Home variants captured 2026-09-05 (accounts, activity, pots, suggested, rewards, cards)  
**Companion:** [design-system.md](./design-system.md) is the engineering contract — shadcn install, mobile rules, screen states, Playwright. This document is how Jorby should *look and feel*. When they disagree, this document wins on appearance; design-system.md wins on accessibility and touch targets.

Update this file in the same change that alters tokens, chrome, or a shared pattern. Personalisation decisions go in section 7, not as silent code edits.

## 1. Why this reference

Jorby and Monzo share a problem: a phone full of small household records that must stay scannable without reading as a spreadsheet. The Home captures from 2026-09-05 are the current template:

| Reference move | What it teaches Jorby |
| --- | --- |
| Avatar left, frosted action pill right | Identity is the home control; search and settings cluster in one pill |
| Saturated account hero + overlapping cards | One hero per screen. Jorby does **not** stack bank accounts — it uses a horizontal **snapshot strip** of section counts |
| Activity feed with a small person/group glyph | Household rows always show who, never an anonymous event |
| Horizontal “pots” | `SnapshotRow`: pinned or section shortcuts that scroll, never wrap |
| Suggested cards with an X | Dismissible prompts later (“we should”, both-want). Not insurance, rewards, or credit scores |
| Customise + Do more pills | Secondary search / primary “open the current catalog” |
| Floating glass tab bar | Keep the pill. Home has six catalog sections; Finance has its own shorter bar |
| Detail / form screens (earlier capture) | Circular back, uppercase labels, borderless fields, thumb-height primary |

We are copying the *system*, not the brand. Coral is Monzo’s bank colour. Jorby’s hues mean section and member, not logo.

### Deliberately not copying

- Bank balances, joint-account stacks, pots of money, cards, overdrafts, cashback, insurance, credit scores, FSCS, fraud banners.
- Image-backed pots until Places and Watch have provider photos and posters. Until then, hue tiles.
- Custom numeric keypads. Use the system keyboard.
- Playful 3D spot illustration. Empty states stay typographic until we have a reason to draw.
- Bank UI from the Monzo captures: balances as products, joint-account stacks, cards, overdrafts, cashback, insurance, credit scores.
- Together as a product surface.

## 2. Principles

**Hue means section, not decoration.** Each of the six sections owns a hue. It drives that screen’s wash, its icon tiles, and its active navigation state. The top inch of the screen should answer “where am I?”.

**Two people, two colours.** Nearly every record answers “which of us?”. Each member owns a colour used for avatars and attribution. Colour is never the only signal — initials or name always travel with it.

**White means content, tint means chrome.** Household data sits in a white card. Backgrounds, headers, and navigation are tinted or translucent.

**Separate with space and shadow, not borders.** Cards float on the wash. Rows inside a card divide with an inset hairline. A border plus a shadow reads as heavy.

**One focal number per screen.** Counts, ratings, and prices get the oversized numeral treatment. Everything else stays at body size so the focal point survives.

**Conversational, not administrative.** Headlines talk the way the two of you would: “You both want to watch this,” not “Watch reaction stage: WANTS_TO_WATCH.”

## 3. Tokens

All tokens live in `apps/web/src/index.css`. Colours are oklch so lightness stays even across hues.

### Surfaces

| Token | Role |
| --- | --- |
| `--background` | Warm off-white the wash fades into |
| `--card` | Pure white content groups |
| `--foreground` | Warm near-black body text |
| `--muted-foreground` | Grey for subtitles and micro-labels |
| `--section` / `--section-wash` / `--section-ink` | Active route hue, resolved from `[data-section]` |

### Section hues

| Section | Hue | Feeling | Used for |
| --- | --- | --- | --- |
| Home | Coral | Warm front door | Wash, Home hero, Home nav |
| Lists | Blue | Practical | List tiles, Lists wash |
| Notes | Amber | Paper | Note tiles, Notes wash |
| Places | Green | Out in the world | Place tiles, Places wash |
| Watch | Violet | Evening | Watch tiles, Watch wash |
| Things | Teal | Objects | Thing tiles, Things wash |
| Finance | Pine | Household money | Finance app wash, spend tiles |

A tile uses the *content type* hue, not the current route, so a Place looks the same on Home as it does in Places. Search and Settings inherit Home’s wash rather than inventing a seventh colour.

### Member colours

Driven by the Ontology `profileColor`. Seeded pair: Jordan is **Clay**, Sam is **Sage**. Each pair is a pale fill plus dark same-hue ink so initials stay legible at 24px. Additional tokens (`indigo`, `amber`) exist for a future third household.

### Type

Plus Jakarta Sans, self-hosted. Geometric enough to feel current, round enough to feel domestic.

| Role | Treatment |
| --- | --- |
| Screen title | ~28px, extrabold, tight tracking |
| Focal numeral | 40px bold; currency mark raised and small; decimals one step down |
| Card / row title | 15px semibold |
| Body / subtitle | 14–15px muted |
| Micro-label | 11px uppercase, wide tracking, muted |

Numerals always use `tabular-nums`.

### Shape and depth

| Thing | Treatment |
| --- | --- |
| Card group | 16–20px radius, `--shadow-card`, no border |
| Icon tile | 40px, 12px radius |
| Controls | Fully round pills for actions, chips, back, tab bar |
| Tab bar | Inset from all three edges, translucent, `--shadow-float`, backdrop blur |
| Header | Member (or “You”) on the left; frosted pill on the right for search and settings |
| Snapshot strip | Horizontal 140px cards, no wrap, `--shadow-card` |

## 4. Patterns

These are the reusable pieces in `apps/web/src/components/jorby`. Screens compose them; they should not reinvent a second card language.

| Pattern | Component | Rule |
| --- | --- | --- |
| Page wash | `PageWash` | Fixed, non-interactive, section hue fading over ~42svh |
| Screen title | `ScreenHeader` | Extrabold title, optional muted description |
| Back | `BackLink` | Circular/pill control, not an underlined breadcrumb |
| Group | `CardGroup` | Optional uppercase label, white rounded body |
| Row | `LinkRow` / `Row` / `ButtonRow` | Tile, title, subtitle, optional trailing, optional chevron. Min height 64px |
| Tile | `Tile` | 40px rounded square in the *content* hue |
| Member | `MemberMark` / `MemberChip` | Colour + initials or name |
| Snapshot | `SnapshotRow` / `SnapshotCard` | Horizontal section or pin counts. Scroll, never wrap |
| Hero | `HeroCard` | The one saturated block per screen. Actions inside it are translucent pills |
| Focal number | `Amount` / `Stat` | Oversized numeral; `Amount` splits currency / integer / cents |
| Filters | `FilterRow` / `FilterChip` | Horizontal scroll, full-size chips, never wrapping |
| Primary action | `StickyActions` | Sits above `--tab-bar-space` so the keyboard and tab bar never cover it |
| Reviews | `ReviewGroup` | Always a pair of attributed rows, never a single anonymous score |

## 5. Screen mapping

How the starter screens land on Jorby. This is the implementation contract for the current prototype.

| Jorby screen | Reference move | Notes |
| --- | --- | --- |
| Home | Snapshot strip + hero + activity | Live households show Foundry lists only. Mock `our-home` may show seeded “we should” and disagreements |
| Lists index | Activity list | Tile + title + trailing open count |
| List detail | Checklist inside one card | Sticky add field above the tab bar |
| Notes index | Activity list | Tile + title + tag chips |
| Note editor | Add-money card | Borderless fields inside one white card, pill Save |
| Places / Watch indexes | Activity list + chip filters | Status and “both want” as trailing / chips |
| Place / Watch / Thing detail | Transaction detail | Hero with the focal number, then labeled groups, then a sticky action |
| Things index | Activity list + lens tabs | Tabs are a full-width pill, not underlined text |
| Search | Header search, expanded | Round field on the wash; hits reuse content-type tiles |
| Settings | “Spent by” group | Members as attributed rows, not bordered admin cards |
| Welcome / household chooser | Confirmation | Conversational title, one card, one pill action |
| Apps chooser | Confirmation | Two app rows after a household is chosen. Not a seventh catalog tab |
| Finance home | Snapshot strip + hero | Hero is this month’s spend. Account strip. Household / member chips |
| Finance spend | Activity list | Card and account transactions with who spent |
| Finance budgets / goals | Progress rows | Meter, not a chart |
| Finance bills | Activity list | Subscriptions and recurring charges |

## 6. Accessibility constraints

These override any visual preference:

- Body and label text must clear WCAG AA against its actual backdrop, including over the wash.
- Colour never carries meaning alone.
- Everything in [design-system.md](./design-system.md) still applies: 44px targets, no overflow at 320px, 16px inputs, content clear of the tab bar. Playwright enforces those against *this* design.

## 7. Open for personalisation

The starter template is in. The next pass should make it *ours*, not more Monzo. Roughly in order of impact:

1. **Section hues.** Evenly spaced and generic. They could come from a shared colour — a kitchen tile, a neighborhood, a trip.
2. **Typeface.** Plus Jakarta Sans is a defensible default, not a considered choice.
3. **The Home hero.** Structurally right, still generic copy. This is the place a nickname, an inside phrase, or a real “tonight” prompt belongs.
4. **Member colours.** Clay and Sage match the seed labels. They can change without touching layout.
5. **Empty states.** Still text. Illustration only if it earns a permanent place.
6. **Provider imagery.** Posters and place photos will change Places and Watch more than any token tweak. Do not fake them.
7. **Dark mode.** Tokens exist; the wash needs its own dark treatment before anything toggles `.dark`.
