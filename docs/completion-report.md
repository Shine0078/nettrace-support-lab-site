# NetTrace Support Lab completion report

**Completion date:** 2026-09-22  
**Repository:** `Network-Troubleshooting-and-Support-Lab`  
**Final local commit before this report:** `41f696f`  
**Scope:** Windows host, WSL2 Ubuntu, localhost, and synthetic files/services only

## Project purpose

This project builds an isolated practice lab for diagnosing network and system failures with evidence. It demonstrates the support cycle of clarifying a symptom, establishing a baseline, testing a hypothesis, applying a reversible change, validating recovery, and documenting the result.

## Environment used

- Windows product query: Windows 10 Home, build 26200, 64-bit. The user-described Windows 11 label was retained as a discrepancy rather than assumed.
- PowerShell 7.6.5 and Windows Terminal 1.24.11911.0.
- WSL2 with Ubuntu 26.04.1 LTS; `uname -a` succeeded.
- Git 2.53.0 and VS Code 1.134.0.
- Python 3.13.15 via the `py` launcher.
- Windows Wireshark/TShark 4.6.8 and diagrams.net 31.4.5.
- Ubuntu TShark 4.6.4 and libpcap for loopback capture because Windows Npcap could not be installed from the current non-administrator session.
- GitHub Desktop 3.6.6 with the local `main` repository connected to the GitHub remote.

## Features completed

- Sanitized environment baseline and prerequisite documentation.
- Repeatable Windows PowerShell and Linux Bash baseline collectors with timestamps, useful exit codes, failure explanations, and safety-gated external checks.
- Privacy-aware Python report generator.
- Beginner command reference and evidence-first troubleshooting workflow.
- Editable diagrams.net architecture, SVG export, and reviewed PNG.
- Local-only five-scenario harness with failure/recovery assertions and cleanup.
- Five warehouse/inventory-style support tickets.
- Security boundaries and threat model.
- Local WSL packet capture and three sanitized Wireshark/TShark PNG views.
- Five-minute demo guide and validation scripts.
- Git history with meaningful commits and a connected GitHub Desktop workflow.

## Five failures tested

The corrected Ubuntu run of `scripts/lab-scenarios.py` returned `Overall: PASS` and exit code `0`:

1. DNS failure: an explicitly unused local resolver endpoint timed out while loopback HTTP remained reachable; a temporary DNS responder restored resolution.
2. Unavailable port: the local listener was stopped, connection refusal was observed, and the listener restart restored HTTP 200.
3. Incorrect endpoint: a wrong loopback port failed and the expected endpoint succeeded.
4. Stopped service: the service thread state changed from alive to stopped and back to alive, matching request failure and recovery.
5. Permission failure: `nobody` received `Permission denied` at mode `000`; mode `0644` restored access to the synthetic SKU record.

## Tests passed

- WSL2 Ubuntu started successfully; `wsl -d Ubuntu -- uname -a` returned exit code `0`.
- Windows baseline ran twice with exit code `0`, zero attempted failures, five safety skips, and timestamped reports.
- Linux baseline ran twice with exit code `0`, zero attempted failures, three safety skips, and timestamped reports.
- Report generator returned exit code `0` and created a timestamped redacted summary.
- Five-scenario harness returned exit code `0` and produced PASS evidence.
- `py_compile` passed for all Python scripts on Windows and Ubuntu.
- Static validator passed 26 required files, PNG validation, ignore rules, and ticket headings.
- Ubuntu full validator with `--run-scenarios` passed.
- Fresh Ubuntu loopback capture contained 28 packets. The packet validator passed DNS, TCP, TLS, HTTP, loopback, and SYN evidence.
- Diagram PNG was rendered from editable draw.io XML and visually inspected.
- Three packet screenshots were rendered and visually inspected for readable, sanitized content.
- `.gitignore` matched `GOAL1.txt`, private directories, packet captures, and generated reports.
- `git diff --check` passed.
- Tracked-tree scans found no common secrets, private-key headers, usernames, or Windows user paths.
- No raw packet capture, certificate, key, generated report, employer data, or workplace data is tracked.
- The working tree is clean after cleanup.

## Evidence produced

- `docs/environment-baseline.md`
- `docs/network-diagram.png`, `docs/network-diagram.drawio`, and `docs/network-diagram.svg`
- `docs/command-reference.md`, `docs/troubleshooting-method.md`, `docs/security-boundaries.md`, and `docs/threat-model.md`
- `docs/packet-analysis.md` and `docs/scenario-evidence.md`
- `scripts/windows-baseline.ps1`, `scripts/linux-baseline.sh`, `scripts/generate-report.py`, `scripts/lab-scenarios.py`, `scripts/local-traffic.py`, and `scripts/render-packet-screenshots.py`
- Five support tickets under `tickets/`
- `screenshots/wireshark-dns.png`, `screenshots/wireshark-tcp-tls.png`, and `screenshots/wireshark-https-metadata.png`
- `demo/demo-script.md`
- `tests/validate_project.py` and `tests/validate_packet_capture.py`

## Security controls

- Loopback-only services and WSL-local capture.
- External baseline checks disabled by default.
- No physical adapter, router, system DNS, firewall, or employer network changes.
- Synthetic users, files, hostnames, and warehouse data only.
- Ignored secrets, keys, tokens, private directories, reports, and packet captures.
- Least-privilege permission test using an unprivileged account.
- Timestamped evidence and reversible scenario cleanup.
- Privacy review before Git publication.

## Known limitations

- Windows Npcap could not be installed without an elevated administrator session; packet capture used Ubuntu loopback TShark instead.
- External checks named in the original brief are implemented as opt-in but were intentionally skipped to honor the local-only safety rule.
- The scenarios model localhost services, a Unix permission mode, and synthetic DNS; they do not reproduce enterprise DNS, Windows ACLs, load balancers, or production service managers.
- The Windows product query reports Windows 10 Home while the user described Windows 11; the lab does not depend on that label.
- The GitHub repository is connected and pushed, but public release still requires a separate human decision after reviewing privacy and repository visibility.

## Costs

The minimum implementation uses free/open-source software and local Windows/WSL resources. No paid cloud, Azure, AWS, Docker, Kubernetes, or production network service is required.

## Cleanup completed

All local HTTP/DNS/TLS services and scenario threads stopped. The temporary permission directory, raw pcapng files, self-signed certificate/key, generated reports, and test logs were deleted. The ignored `reports/generated/` directory is absent, the local `GOAL1.txt` prompt remains available but is not tracked, and `git status` is clean.

## Future improvements

- Add optional local PSScriptAnalyzer and ShellCheck runs.
- Add a second isolated VM only if WSL2 coverage proves insufficient.
- Add a sanitized offline packet fixture for teaching without a live capture.
- Add a local dashboard that reads only reviewed summaries.
- Revisit Windows Npcap installation from an elevated, user-approved maintenance window.

## Skills demonstrated

Windows and Linux diagnostics; DNS, IP addressing, routing, ports, TCP/UDP, HTTP/HTTPS/TLS; PowerShell and Bash; WSL2; Git and GitHub Desktop; Wireshark/TShark filtering; packet metadata interpretation; root-cause analysis; safe change management; least privilege; privacy review; support-ticket writing; technical documentation; and reproducible validation.

## Suggested resume bullet

“Built an isolated Windows/Linux troubleshooting lab and diagnosed five simulated DNS, connectivity, port, and permission failures using packet analysis and documented validation.”

## Suggested interview explanation

“I built a small Windows and Linux lab to practise real troubleshooting. I established a normal baseline, introduced controlled failures, gathered evidence using PowerShell, Linux tools, and Wireshark, fixed each issue, and documented the result in support-ticket format. The project taught me to distinguish DNS, routing, port, service, and permission problems before making changes.”
