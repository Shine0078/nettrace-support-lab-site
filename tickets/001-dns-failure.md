# Ticket 001 — DNS failure

## User-reported symptom

The fictional Northstar Warehouse receiving workstation could reach a local inventory service by IP, but the warehouse name used by the receiving workflow would not resolve.

## Date and time

2026-09-22 (local lab time)

## System affected

Synthetic Ubuntu WSL2 receiving workstation and a localhost inventory test service.

## Business impact

Receiving clerks could not use the normal service name, delaying a fictional inbound shipment. Direct local connectivity remained available, so the scope was limited to name resolution.

## Scope

One isolated WSL2 test process and a synthetic DNS endpoint on loopback. No Windows adapter or resolver configuration was changed.

## Initial hypothesis

The configured DNS endpoint is unavailable, while general IP connectivity is healthy.

## Investigation performed

1. Started the local synthetic HTTP service.
2. Requested it through `127.0.0.1` and received HTTP 200.
3. Sent a DNS query to an explicitly unused loopback UDP port; it timed out.
4. Started the temporary DNS responder and repeated the query.

## Evidence collected

- `HTTP 200: NetTrace synthetic warehouse service`
- Invalid local resolver query timed out.
- Temporary responder returned the synthetic address `127.0.0.1`.
- The evidence is reproduced by `scripts/lab-scenarios.py` and summarized in `docs/scenario-evidence.md`.

## Root cause

No listener was present at the explicitly selected local DNS endpoint. The IP stack and local HTTP service were healthy.

## Corrective action

Started the synthetic DNS responder for the duration of the test. In a real environment, the next safe action would be to verify the approved DNS server and DHCP scope rather than changing an adapter at random.

## Validation performed

The repeated DNS query returned a valid synthetic response, while the loopback HTTP request continued to return HTTP 200. The temporary responder was stopped afterward.

## Preventive recommendation

Monitor resolver availability and document approved DNS servers. Keep a direct-IP test separate from a hostname test so support staff can distinguish DNS from routing.

## Remaining limitation

The scenario models a local resolver listener, not an enterprise DNS outage or DHCP-delivered configuration.

## Final status

Resolved and validated in the isolated lab.
