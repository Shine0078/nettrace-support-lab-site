# Ticket 003 — incorrect endpoint

## User-reported symptom

The fictional warehouse dashboard reported that the inventory API was unavailable after a configuration change.

## Date and time

2026-09-22 (local lab time)

## System affected

Synthetic localhost HTTP inventory service and test client.

## Business impact

The dashboard could not load test stock data because it was pointed at the wrong local endpoint.

## Scope

One client endpoint value. The service and physical network configuration were unchanged.

## Initial hypothesis

The client is using a valid-looking loopback address but the wrong port.

## Investigation performed

1. Recorded the service's expected `127.0.0.1:<ephemeral-port>` endpoint.
2. Tested a different loopback port as the incorrect endpoint.
3. Tested the expected endpoint.

## Evidence collected

- Incorrect loopback port returned connection refusal.
- Expected loopback endpoint returned HTTP 200.
- The harness records both endpoints without publishing any personal address.

## Root cause

The application endpoint did not match the port where the synthetic service was listening.

## Corrective action

Restored the client to the recorded expected loopback endpoint.

## Validation performed

The client failed at the incorrect endpoint and succeeded at the expected endpoint. No adapter, route, or DNS setting was touched.

## Preventive recommendation

Store endpoint configuration in a reviewed, versioned runbook and validate host and port independently during support triage.

## Remaining limitation

The test uses a localhost port mismatch and does not model a distributed service-discovery system.

## Final status

Resolved and validated in the isolated lab.
