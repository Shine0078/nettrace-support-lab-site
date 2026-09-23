# Sanitized scenario evidence

The local harness `scripts/lab-scenarios.py` was run under Ubuntu 26.04.1 LTS on 2026-09-22. The successful run returned exit code `0` and produced `overall: PASS`. All endpoints were loopback addresses with ephemeral ports; no physical adapter, public destination, system resolver, router, or firewall was changed. The raw JSON/Markdown run reports remain under the ignored `reports/generated/` directory.

## Results matrix

| Scenario | Failure reproduced | Recovery validated | Evidence |
|---|---:|---:|---|
| DNS failure | Yes | Yes | Loopback HTTP returned 200 while an explicitly invalid local DNS port timed out; a synthetic local DNS responder then returned `127.0.0.1`. |
| Unavailable port | Yes | Yes | Local HTTP returned 200, then connection was refused after the listener stopped, then returned 200 after restart. |
| Incorrect endpoint | Yes | Yes | The expected loopback service endpoint returned 200; a different loopback port was refused; the correct endpoint returned 200. |
| Stopped service | Yes | Yes | The service thread was alive and reachable, then stopped and became unreachable, then restarted and returned 200. |
| Permission failure | Yes | Yes | An unprivileged `nobody` read failed at mode `000`; after restoring mode `0644`, the synthetic inventory record was readable. |

## Privacy and cleanup evidence

- HTTP, DNS, and test files were synthetic and bound to `127.0.0.1` or `/tmp`.
- The DNS scenario used an explicitly selected local UDP port rather than changing `/etc/resolv.conf` or Windows DNS settings.
- The permission scenario restored file permissions and deleted its temporary directory in a `finally` block.
- Local raw reports contain diagnostic details and are ignored by Git; this document contains only sanitized summaries.
