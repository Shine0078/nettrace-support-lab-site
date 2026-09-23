# NetTrace Support Lab threat model

## Assets

- Local Windows and WSL configuration evidence.
- Synthetic service code, scenario results, and tickets.
- Packet-analysis screenshots.
- Git history and the GitHub repository.
- The user's real network identity, addresses, credentials, and files (out of scope and protected).

## Threat actors

- An accidental future commit by the lab author.
- A malicious or curious reader of a public repository.
- A compromised local process attempting to read generated reports.
- An operator who runs a command against an unauthorized destination.

The lab does not model an attack against a real employer or public service.

## Trust boundaries

1. **Windows host boundary:** real adapters, hostnames, and private network metadata are not published.
2. **WSL boundary:** Ubuntu is an isolated practice system; its temporary files and services are synthetic.
3. **Loopback service boundary:** local HTTP, HTTPS, and DNS services bind only to `127.0.0.1`.
4. **Evidence boundary:** raw reports and captures stay in ignored paths; only sanitized summaries cross into Git.
5. **GitHub boundary:** publishing is an external action and must follow a privacy review.

## Attack paths and possible impact

| Attack path | Possible impact | Control |
|---|---|---|
| A private packet capture is committed | Personal or unrelated network metadata is exposed | Loopback-only capture, `.pcap` ignore rules, screenshot review, delete-and-recapture procedure |
| A real IP/MAC/hostname is copied into README or ticket | Host identity or location clues are published | Sanitized docs and a pre-publish search |
| A credential or key is placed in a report | Account compromise | Synthetic values only, key/token ignore rules, no secrets in scripts |
| A DNS or firewall change is applied to the physical adapter | Loss of connectivity or unsafe traffic exposure | No physical changes; opt-in external checks; reversible scenario design |
| A command runs with excessive administrator privileges | Unintended system changes | Run as a normal user; use temporary files and localhost |
| A tester scans outside the lab | Unauthorized activity and legal risk | Scope statement, local-only defaults, explicit external-check switch |
| Evidence is overwritten or lost | Root cause cannot be defended | Timestamped reports and Git commits |
| Procedures are unclear or unrepeatable | Wrong fixes and poor support handoff | Command reference, phase log, tickets, and validation tests |

## Validation method

The test harness records both the failure and recovery for five local scenarios. Baseline scripts run twice. `git check-ignore`, `git diff --check`, secret-pattern scans, TShark interface/filter checks, screenshot review, and a final completion checklist provide independent evidence.

## Remaining risk

The host still has real network adapters and unrelated processes. A human can bypass the local-only defaults, publish a raw report, or open a public capture. The lab reduces but cannot eliminate operator error; a final human review is required before public sharing.
