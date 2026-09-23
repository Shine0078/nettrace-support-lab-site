# Phase log

This log records what was actually executed, why it was safe, and how it was verified. It is intentionally concise; detailed scenario evidence belongs in the scenario tickets.

## Phase 1 — repository setup and environment inventory

### Objective

Create a safe project boundary, preserve the authoritative requirements, inspect the current worktree, and record a sanitized prerequisite inventory before making implementation changes.

### Files and directories involved

- `GOAL1.txt` (authoritative prompt; read in full)
- `.gitignore`
- `README.md`
- `docs/environment-baseline.md`
- `docs/phase-log.md`
- `docs/`, `scripts/`, `tickets/`, `screenshots/`, `demo/`, `reports/`, `tests/`

### Terms

- **Repository:** a folder whose history is tracked by Git.
- **Baseline:** a record of normal state used for later comparison.
- **Sanitized:** redacted so private addresses, identifiers, and secrets are not published.
- **Loopback:** the computer talking to itself; `127.0.0.1` is the IPv4 loopback address.

### Risks and controls

- Network inspection can reveal private addresses; only a redacted summary is committed.
- Installing or changing networking software can affect connectivity; no installation or network configuration change was made in Phase 1.
- Existing work must not be overwritten; the directory contained only `GOAL1.txt` before setup.

### Commands executed

```powershell
Get-ChildItem -Force
Get-ChildItem -Recurse -File -Force
git status --short --branch
wsl --status
wsl -l -v
git --version
code --version
python --version
Get-ComputerInfo -Property WindowsProductName,WindowsVersion,OsBuildNumber,OsArchitecture
$PSVersionTable
Get-NetIPConfiguration
Get-NetRoute -AddressFamily IPv4
Get-NetTCPConnection -State Listen
```

### Expected result

The project directory exists; the initial inventory is visible; Git reports that no repository existed before setup; installed tools report versions; missing tools report a clear failure; network inspection is read-only.

### Result

The directory existed and contained only `GOAL1.txt`. Git and VS Code were present. WSL2 was enabled but Ubuntu was absent. Python, Wireshark, and diagrams.net were not available in the checked locations. The skeleton and privacy controls were then created. Git was initialized on `main` and committed as `fc63568`. A synthetic `.secret`, `.token`, and `.pcap` file were each matched by `.gitignore`, then removed. The working tree is clean.

### Next step

Initialize Git locally, verify the `.gitignore` with synthetic secret/packet-capture filenames, and create the first meaningful commit. Do not create a GitHub remote until the local history and user account choice are confirmed.

## Phase 2 — baseline collection (in progress)

### Objective

Create repeatable Windows and Linux diagnostic collectors that write timestamped, reviewable reports and return meaningful exit codes without contacting an external destination by accident.

### Files involved

- `scripts/windows-baseline.ps1`
- `scripts/linux-baseline.sh`
- `reports/generated/` (local output; ignored by Git)

### Technical terms

- **Exit code:** a number a command returns to indicate success (`0`) or a problem (non-zero).
- **Loopback:** the computer communicating with itself through `127.0.0.1`.
- **Opt-in:** a potentially sensitive operation is disabled unless the operator explicitly requests it.
- **Timestamp:** the date and time embedded in a report filename so repeated runs do not overwrite earlier evidence.

### Risk controls and implementation decision

The project brief names `1.1.1.1` and `example.com` checks, but the safety boundary prohibits accidental contact with public systems. Both scripts therefore include those checks as an explicit opt-in switch (`-IncludeInternetChecks` or `--include-internet`) and record them as skipped by default. Local diagnostics still run and remain in ignored report directories. Raw reports may contain private interface details and must not be committed.

### Commands and expected results

```powershell
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows-baseline.ps1
```

Expected result: exit code `0`, a timestamped report under `reports/generated/windows/`, local checks marked `[PASS]`, and external checks marked `[SKIP]`.

```bash
bash -n scripts/linux-baseline.sh
./scripts/linux-baseline.sh
```

Expected result after Ubuntu is installed: syntax check succeeds, the script returns `0`, and a timestamped report is created under `reports/generated/linux/`.

### Result so far

The Windows baseline ran twice successfully. Both runs returned exit code `0`, reported zero attempted failures, recorded five external checks as skipped, and created separate timestamped reports. Ubuntu 26.04.1 LTS was then installed and started under WSL2. The Linux script passed `bash -n` and ran twice successfully, returning exit code `0` with zero attempted failures and three safety skips each time. Python 3.13.15, Wireshark/TShark 4.6.8, diagrams.net 31.4.5, and GitHub Desktop 3.6.6 were installed or verified. The local repository was opened in GitHub Desktop and connected to the GitHub remote.

### Gate to complete Phase 2

Inspect both Windows and Linux reports for timestamps and pass/fail explanations, then commit the scripts and evidence documentation. This gate now passes; the next phase is the beginner command reference, workflow, safety boundaries, and editable network diagram.

## Phase 3 — documentation and architecture

The beginner command reference, evidence-first workflow, security boundaries, threat model, editable diagrams.net source, SVG, and rendered PNG were added and reviewed. The rendered diagram was visually inspected and corrected so trust boundaries, localhost capture scope, WSL2, Windows, and the intentionally isolated external reference are readable. The static validator passed the documentation and diagram checks.

## Phase 4 — controlled scenarios and support tickets

`scripts/lab-scenarios.py` was run under Ubuntu. The first run exposed a real permission-test defect: the file was restored to `0644` but its temporary directory remained `0700`. The harness was corrected to make only the synthetic directory traversable (`0755`); the next run returned overall `PASS` with all five failures reproduced, repaired, validated, and cleaned up. Five required tickets, a sanitized evidence matrix, demo guide, report generator, and project validator were added. The Ubuntu full validator passed.

## Phase 5 — packet analysis

Windows TShark reported missing Npcap, so no Windows adapter or driver change was made. Ubuntu TShark 4.6.4 was installed with the safer non-superuser capture option disabled; capture was performed only as a short-lived `sudo tshark -i lo` process on Ubuntu loopback. The 28-packet local capture contained DNS, TCP, TLS, HTTP, and loopback evidence. `tests/validate_packet_capture.py` initially exposed an incompatible `-c 1` filter limit and a Boolean SYN-field assumption; both were corrected, and the validator now passes. Three sanitized PNGs were rendered and visually inspected. The raw pcapng, certificate, and key remain ignored local artifacts and are not committed.

## Phase 6 — final validation and cleanup

The final audit reran both baseline scripts twice, the five-scenario harness, the Ubuntu loopback packet capture, packet filters, static/full validators, ignore-rule checks, diff checks, and tracked-tree privacy scans. Every check passed. Generated reports, raw pcapng files, certificates, keys, and temporary services were then removed. The completion report is the authoritative summary of this audit.

## Phase 3 — documentation and architecture

The beginner command reference, evidence-first workflow, security boundaries, threat model, editable diagrams.net source, SVG, and rendered PNG were added and reviewed. The rendered diagram was visually inspected and corrected so trust boundaries, localhost capture scope, WSL2, Windows, and the intentionally isolated external reference are readable. The static validator passed the documentation and diagram checks.

## Phase 4 — controlled scenarios and support tickets

`scripts/lab-scenarios.py` was run under Ubuntu. The first run exposed a real permission-test defect: the file was restored to `0644` but its temporary directory remained `0700`. The harness was corrected to make only the synthetic directory traversable (`0755`); the next run returned overall `PASS` with all five failures reproduced, repaired, validated, and cleaned up. Five required tickets, a sanitized evidence matrix, demo guide, report generator, and project validator were added. The Ubuntu full validator passed.

## Phase 5 — packet analysis

Windows TShark reported missing Npcap, so no Windows adapter or driver change was made. Ubuntu TShark 4.6.4 was installed with the safer non-superuser capture option disabled; capture was performed only as a short-lived `sudo tshark -i lo` process on Ubuntu loopback. The 28-packet local capture contained DNS, TCP, TLS, HTTP, and loopback evidence. `tests/validate_packet_capture.py` initially exposed an incompatible `-c 1` filter limit and a Boolean SYN-field assumption; both were corrected, and the validator now passes. Three sanitized PNGs were rendered and visually inspected. The raw pcapng, certificate, and key remain ignored local artifacts and are not committed.
