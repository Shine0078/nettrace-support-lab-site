# Local results dashboard

## Purpose

The dashboard presents the completed NetTrace lab in a standard, print-friendly support format. It is a static web application served only on `127.0.0.1`; it has no telemetry, cloud API, external font, CDN, cookie, login, or remote runtime dependency.

## Data flow

```text
Sanitized repository evidence
          |
          v
scripts/export-web-results.py
          |
          v
web/data/lab-results.json
          |
          +--> status cards and tables
          +--> five scenario results
          +--> implementation timeline
          +--> generated SVG connection diagram
          +--> system-design checks
          +--> local evidence links
```

The SVG diagram and design checks use the same structured nodes, edges, and boundaries. `tests/validate_web.py` rejects duplicate node IDs, missing edge targets, missing evidence, failed design checks, broken local links, external runtime dependencies, private paths, and common secret patterns.

## Start the dashboard

From the repository root:

```powershell
pwsh -NoProfile -File .\scripts\start-dashboard.ps1
```

The script regenerates the sanitized JSON, starts Python's static server bound to `127.0.0.1:8765`, records its PID in ignored generated data, checks `http://127.0.0.1:8765/web/` for HTTP 200, and opens the default browser. The repository root is served so reviewed evidence links under `docs/`, `tickets/`, and `screenshots/` work; the server is still reachable only through loopback.

To use another local port or avoid opening a browser:

```powershell
pwsh -NoProfile -File .\scripts\start-dashboard.ps1 -Port 8877 -NoBrowser
```

## Validate

```powershell
py -3 .\scripts\export-web-results.py
py -3 .\tests\validate_web.py
py -3 .\tests\validate_project.py
```

Expected result: all commands return exit code `0`, the dashboard overall status is `PASS`, and the original GOAL1 validator continues to pass.

## Stop the dashboard

```powershell
pwsh -NoProfile -File .\scripts\stop-dashboard.ps1
```

The stop script terminates only the process ID recorded by the dashboard start script. It does not stop unrelated Python processes.

## Security and privacy

- The server binds to loopback, not `0.0.0.0`.
- The exporter reads sanitized repository evidence and optional ignored scenario JSON only.
- The browser cannot execute diagnostic commands.
- Raw reports, captures, certificates, keys, PID files, and temporary evidence remain ignored.
- Evidence links point to reviewed local project artifacts.

## Portable friend-device check

The dashboard includes `web/friend-check.html` for checking another Windows device with explicit owner consent. A browser cannot and should not execute operating-system diagnostics automatically. The device owner downloads and reviews `scripts/friend-device-check.ps1`, runs it locally, and selects the sanitized JSON in the page.

The PowerShell checker performs read-only version, tool, WSL, loopback, adapter-count, listener-count, and least-privilege checks. It records no usernames, hostnames, addresses, MAC addresses, DNS servers, gateways, ports, process IDs, credentials, personal files, browser data, or raw logs. The page uses the File API to process JSON locally and makes no upload request.

Validate the complete flow with:

```powershell
py -3 .\tests\validate_friend_check.py
```
