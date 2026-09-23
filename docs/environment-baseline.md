# Environment baseline (sanitized)

**Captured:** 2026-09-22  
**Scope:** local Windows host inspection only  
**Privacy note:** exact hostnames, usernames, MAC addresses, IP addresses, DNS server addresses, gateways, process IDs, and listening-port inventories are intentionally not stored in this public-facing document. The raw command output was used for local planning and is not committed.

## Operating system and shells

| Item | Observed value | Status |
|---|---|---|
| Windows product reported by `Get-ComputerInfo` | Windows 10 Home | Present (build `26200`, 64-bit) |
| PowerShell | 7.6.5, Core | Present |
| Windows Terminal | 1.24.11911.0 | Present |
| WSL default version | 2 | Present |
| WSL distributions | Ubuntu 26.04.1 LTS and `docker-desktop`; Ubuntu running as WSL2 | Ready |

The user described the computer as Windows 11, while the local product query reported Windows 10 Home. The build and the observed command output are retained as evidence; this discrepancy should be clarified if it affects installation guidance.

## Development tools

| Tool | Result | Action |
|---|---|---|
| Git | 2.53.0.windows.1 | Ready |
| VS Code (`code`) | 1.134.0, x64 | Ready |
| Python | 3.13.15 (64-bit), available through `py` launcher | Ready; use `py -3` when the Windows Store alias masks `python.exe` |
| Wireshark/TShark | 4.6.8.0; TShark reports 4.6.8 | Ready for local packet analysis |
| diagrams.net desktop | 31.4.5.0 | Ready for diagram export |
| GitHub Desktop | 3.6.6 | Ready; local repository is connected to GitHub Desktop |

Ubuntu package additions for packet analysis: TShark 4.6.4 and libpcap are installed inside Ubuntu. The Windows Wireshark GUI is installed at 4.6.8, but Windows Npcap could not be added from the current non-administrator session; packet capture therefore uses Ubuntu's `lo` interface and does not touch the Windows adapter.

## Network and service inventory

The host has multiple adapters, including Wi‑Fi and additional local/virtual adapters. A private IPv4 default route was observed. Loopback is available. Listening services were observed on the host, including loopback-only and system-managed listeners. Exact addresses, ports, and process identifiers are deliberately omitted from this file.

The implementation uses loopback and an isolated WSL service for demonstrations. It does not depend on the observed physical adapter, home gateway, or private DNS configuration.

| Required baseline item | Sanitized observation |
|---|---|
| Network interfaces | Wi‑Fi plus additional local/virtual adapters; exact adapter identifiers omitted. |
| IP addresses | Private IPv4 and link-local values were present; exact addresses omitted. Loopback was verified. |
| DNS servers | DNS server entries were configured on the observed adapters; server addresses omitted. |
| Default gateway | One private IPv4 default route was observed; gateway address omitted. |
| Routes | Loopback, connected private-network, multicast, and default-route entries were observed; exact prefixes and next hops omitted. |
| Listening services | Multiple loopback-only and system-managed TCP listeners were observed; exact ports and process IDs omitted. |

## Required prerequisite commands and expected evidence

These commands were run read-only during Phase 1:

```text
wsl --status
wsl -l -v
git --version
code --version
python --version
```

Expected evidence is a tool version or an explicit, explainable “not installed” result.

## Next prerequisite action

Ubuntu installation and the desktop-tool prerequisites are now complete. Verify them with `wsl -l -v`, `wsl -d Ubuntu -- uname -a`, `py --version`, `tshark --version` (or the installed Wireshark path), and the diagrams.net/GitHub Desktop application versions. Do not change the default physical network adapter or router.

## Official prerequisite sources

- [Microsoft: Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) — required to add an Ubuntu WSL2 distribution without using a virtual machine.
- [Python.org: Python releases for Windows](https://www.python.org/getit/windows/) — optional, used by the report generator and local validation helpers.
- [Wireshark: official downloads](https://www.wireshark.org/download.html) — required for the packet-analysis phase; capture only lab-generated traffic.
- [diagrams.net web editor](https://app.diagrams.net/) — can create the required diagram without installing a desktop package.
- [GitHub Desktop downloads](https://desktop.github.com/download/) — required only to connect the local repository to the user’s GitHub account and review changes graphically.
