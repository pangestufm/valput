# Extension Download Implementation Plan

**Goal:** Publish one unobtrusive KPPN extension download without changing validator behavior.

**Architecture:** Native same-origin download anchor in the existing footer, existing button tokens and a static versioned ZIP. No additional JavaScript or dependencies.

**Tech Stack:** Static HTML/CSS, Node tests, isolated Playwright, Git and Netlify Git deployment.

## Steps

- [x] Add tests/download.test.cjs; run it before implementation and confirm missing button/package failures.
- [x] Add the footer anchor and scoped CSS to index.html; copy the verified 10-file v0.1.3 ZIP to downloads/.
- [x] Run node --test tests/*.test.cjs. Inspect ZIP manifest/entries and compare archive hash with the delivered extension.
- [x] Use isolated Playwright at 390/768/1440 widths in both themes; exercise theme, upload, validation, export and native ZIP download. Verify no overflow, unchanged validator script and matching download hash.
- [ ] Review only this diff, commit the scoped files, push origin/main, and verify the deployed HTML/ZIP on caput079.netlify.app.

Constraints: exact requested label, one download control, no Firefox compatibility claim, no private data in archive, no unrelated website or extension changes. User requested immediate execution/push; continue inline.
