# Ticket 004 — stopped service

## User-reported symptom

The fictional warehouse order screen stopped responding even though the workstation's local networking appeared normal.

## Date and time

2026-09-22 (local lab time)

## System affected

Synthetic HTTP service process in Ubuntu WSL2.

## Business impact

Test order entry was unavailable until the local application process was restored.

## Scope

One local process and its loopback endpoint. The IP stack remained available.

## Initial hypothesis

The service process is stopped rather than the network being broken.

## Investigation performed

1. Confirmed the service thread was alive and returned HTTP 200.
2. Stopped it and tested the same endpoint.
3. Inspected the thread state and observed it was no longer alive.
4. Restarted the service and tested again.

## Evidence collected

- Normal request returned HTTP 200; service thread alive was `True`.
- Stopped request returned connection refusal; service thread alive was `False`.
- Restarted request returned HTTP 200.

## Root cause

The application process was not running. This was not a route or DNS failure.

## Corrective action

Restarted the harmless synthetic service process.

## Validation performed

The same request succeeded after restart and the process state was recorded.

## Preventive recommendation

Use service health checks and process supervision. Check listener state and process state before changing network settings.

## Remaining limitation

The harness uses a thread instead of a production service manager such as systemd or Windows Service Control Manager.

## Final status

Resolved and validated in the isolated lab.
