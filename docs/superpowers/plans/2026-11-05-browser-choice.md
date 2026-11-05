# Browser Choice Implementation Plan

**Goal:** Two download choices under the existing KPPN button, including a tested temporary Firefox package.

**Architecture:** Native disclosure for the website. Firefox-only API adapters around the unchanged v0.1.3 engine; native event-page manifest and live-port document ownership. Chrome download bytes remain unchanged.

**Tech Stack:** Static HTML/CSS, Node tests, isolated Chrome and Firefox WebDriver BiDi, Git/Netlify.

- [x] Probe isolated Firefox and write failing bridge/website tests.
- [x] Implement Firefox bridge/manifest/README and deterministic package whitelist.
- [x] Test native Firefox installation, read-only check, synthetic approvals, reload/checkpoint and stale-port rejection.
- [x] Implement disclosure and both ZIP links; test keyboard, two themes, responsive layout and download hashes.
- [x] Run regressions, review source/archives, push scoped repository files and verify live downloads. Feature commit 70c6748; both native downloads on Netlify match local SHA256.

No AMO publication/signature bypass, no production approval, no user profile changes, no unrelated design changes. Execute inline under the existing push authorization.
