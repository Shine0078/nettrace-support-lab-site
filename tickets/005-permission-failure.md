# Ticket 005 — permission failure

## User-reported symptom

The fictional warehouse import worker could reach its local file share path but could not read the inventory file.

## Date and time

2026-09-22 (local lab time)

## System affected

Synthetic Ubuntu WSL2 file `/tmp` test directory and unprivileged `nobody` account.

## Business impact

The test import could not load a fictional SKU record, delaying a simulated stock reconciliation.

## Scope

One synthetic file and one unprivileged local account. No real user, share, or workplace file was used.

## Initial hypothesis

The service is reachable, but Unix permission bits deny the service account read access.

## Investigation performed

1. Created a synthetic inventory record in a temporary directory.
2. Changed only the file mode to `000`.
3. Read the file as `nobody` and recorded `Permission denied`.
4. Restored the file to `0644` and repeated the read.

## Evidence collected

- Restricted read exited non-zero with `Permission denied`.
- Restored read exited `0` and returned `FICTIONAL-SKU-001`.
- The temporary directory was deleted in a `finally` cleanup block.

## Root cause

Unix permission bits denied the unprivileged service account read access.

## Corrective action

Restored the synthetic file to mode `0644`. No broad administrator permission was granted.

## Validation performed

The restricted read failed and the restored read succeeded with the expected synthetic content.

## Preventive recommendation

Document service-account ownership and least-privilege file modes. Test permissions as the service identity rather than as an administrator.

## Remaining limitation

This models Unix mode bits, not Windows ACLs, identity-provider groups, or a production file server.

## Final status

Resolved and validated in the isolated lab; synthetic data was cleaned up.
