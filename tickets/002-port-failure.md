# Ticket 002 — unavailable port

## User-reported symptom

The fictional inventory workstation could see its local host, but the warehouse application could not connect to its expected service port.

## Date and time

2026-09-22 (local lab time)

## System affected

Synthetic localhost HTTP inventory service in Ubuntu WSL2.

## Business impact

The receiving screen could not submit a test inventory update while the service port was closed.

## Scope

One loopback TCP listener and one synthetic client request. No physical network or firewall changes were made.

## Initial hypothesis

The host is reachable but the service listener is unavailable on the expected TCP port.

## Investigation performed

1. Started the synthetic HTTP server and requested the endpoint.
2. Stopped the listener while leaving the host running.
3. Repeated the request and observed connection refusal.
4. Restarted the listener and repeated the request.

## Evidence collected

- Working endpoint returned HTTP 200.
- After shutdown, the same loopback connection returned `connection refused`.
- After restart, the endpoint returned HTTP 200 again.
- Harness: `scripts/lab-scenarios.py`; sanitized matrix: `docs/scenario-evidence.md`.

## Root cause

The process listening on the TCP port was stopped, so no service accepted the connection.

## Corrective action

Restarted only the synthetic local service. No firewall rule was changed.

## Validation performed

The same request succeeded before shutdown and after restart, and failed only while the listener was absent.

## Preventive recommendation

Monitor service state and port health separately. Record the expected port in the application runbook.

## Remaining limitation

This does not prove that an enterprise firewall or load balancer would behave the same way.

## Final status

Resolved and validated in the isolated lab.
