# Building Access — Benefits Navigator

A guided decision-tree tool connecting newly injured and disabled Illinois residents with home accessibility funding programs.

## Phase Status

- [x] Phase 1: Data Foundation — programs.json, zip-grantees.json
- [ ] Phase 2: Logic and Tests — matchPrograms.js, Jest unit tests
- [ ] Phase 3: Frontend Build — React app, WCAG 2.1 AA, mobile-first
- [ ] Phase 4: WordPress Integration — plugin, Netlify deploy
- [ ] Phase 5: Soft Launch

## Project Structure

```
navigator/
├── src/
│   ├── data/
│   │   ├── programs.json        # Program database — update quarterly
│   │   └── zip-grantees.json   # ZIP → county → HRAP grantee mapping
│   ├── logic/
│   │   └── matchPrograms.js    # Core matching function (Phase 2)
│   ├── components/             # React components (Phase 3)
│   ├── steps/                  # Intake question components (Phase 3)
│   ├── styles/                 # CSS Modules (Phase 3)
│   └── __tests__/              # Jest unit tests (Phase 2+)
└── package.json
```

## Updating Program Data

Program data is in `src/data/programs.json`. Non-technical updates:

1. Open `programs.json` in GitHub (Edit button)
2. Update `lastVerified`, `waitlistStatus`, `availabilityNote`, or `contact` fields
3. Commit to a branch named `quarterly-update-YYYY-QN`
4. Open a pull request — CI validates the JSON before merge

**Quarterly review due:** See `_meta.nextScheduledReview` in programs.json.

## Design Document

See `Benefits_Navigator_Design_Document.docx` in the parent directory for full architecture, intake flow logic, data model, WCAG requirements, and build sequence.
