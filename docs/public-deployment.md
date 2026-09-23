# Public GitHub Pages deployment

## Public URLs

- Dashboard: https://shine0078.github.io/nettrace-support-lab-site/web/
- Consent-based device check: https://shine0078.github.io/nettrace-support-lab-site/web/friend-check.html
- Sanitized public repository: https://github.com/Shine0078/nettrace-support-lab-site

The original development repository remains private. GitHub Pages is published from a separate public repository that contains only the allowlisted site artifact.

## What is public

- Static HTML, CSS, and JavaScript for the dashboard and device-check page.
- Sanitized dashboard JSON.
- Reviewed Markdown documentation, tickets, diagrams, and screenshots.
- `GOAL2.txt`.
- The read-only, consent-based `friend-device-check.ps1` script.

## What is excluded

- `GOAL1.txt` and private project-control information.
- Raw reports, packet captures, logs, temporary certificates, private keys, generated device results, PID files, and temporary directories.
- Windows/Linux baseline scripts and packet traffic generators.
- Git metadata from the private repository.

`tests/validate_pages_bundle.py` builds and scans the exact public bundle before deployment. It rejects forbidden paths, raw/private file extensions, private user paths, private IPv4 patterns, key headers, and common token patterns.

## Diagnostic modes

### Browser-safe diagnostics

After the visitor checks the consent box, the public page uses standard Web APIs to display only browser-accessible data: OS/platform hints, architecture hints where supported, logical processor threads, approximate memory where supported, display capabilities, locale/time zone, connection-quality hints, site-storage quota, battery state where supported, and browser feature support.

The browser cannot provide BIOS, firmware, serial numbers, motherboard details, installed applications, Windows services, Event Logs, WSL state, process lists, personal files, private addresses, MAC addresses, DNS servers, gateways, Wi-Fi details, or router configuration. Browser privacy controls may reduce or remove any optional value.

### Full read-only Windows capability check

For deeper support checks, the device owner downloads and reviews `friend-device-check.ps1`, explicitly consents, runs it locally, and selects the generated JSON in the page. The JSON is processed locally and is never uploaded by the site.

## Publish updates

From the private project repository:

```powershell
py -3 .\tests\validate_friend_check.py
py -3 .\tests\validate_web.py
py -3 .\tests\validate_pages_bundle.py
pwsh -NoProfile -File .\scripts\deploy-github-pages.ps1
```

The deployment script rebuilds the sanitized artifact, updates `Shine0078/nettrace-support-lab-site`, and configures GitHub Pages from that public repository's `main` branch.

## References

- GitHub Pages publishing sources: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages REST API: https://docs.github.com/en/rest/pages/pages
- User-Agent Client Hints: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues
- Browser logical processor hint: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency
- Device Memory API: https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API
- Storage estimate API: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
