# Evidence-first troubleshooting method

This workflow is the lab's standard operating procedure. It keeps a support technician from changing random settings and losing the evidence needed to explain the root cause.

## Workflow

1. **Clarify the symptom.** Ask what the user expected, what happened instead, when it started, and whether the error is repeatable.
2. **Identify the affected system and user.** Record a synthetic user, device role, application, and endpoint. Do not collect real credentials or personal data.
3. **Determine the scope.** Test whether one user, one host, one service, or many systems are affected. Scope prevents an unnecessary broad change.
4. **Establish a baseline.** Run the appropriate Windows or Linux baseline and record a timestamp. A baseline is the normal state used for comparison.
5. **Form a testable hypothesis.** State one likely cause and one observation that would support or reject it. Example: “The local service is stopped because the port is closed while loopback still responds.”
6. **Gather evidence.** Use the smallest command that can distinguish the hypotheses: name resolution, route, port, process, service, or permission evidence.
7. **Make the smallest safe change.** Change only the synthetic lab configuration or process. Back up anything that must be restored, and record the exact recovery command.
8. **Verify the result.** Repeat the failed check, then perform a positive check. A repair is not complete just because an error message disappeared.
9. **Document the resolution.** Write the symptom, scope, evidence, root cause, corrective action, validation, and remaining limitation in ticket format.
10. **Escalate when appropriate.** If the issue is outside the local lab boundary, stop and describe the evidence needed by the next support tier.

## Why random changes are poor troubleshooting

Changing DNS, firewall rules, adapters, or services without evidence can hide the original symptom, break unrelated users, destroy a useful before-state, and make the eventual fix impossible to reproduce. It also creates security risk when a technician uses administrator privileges unnecessarily. The lab therefore introduces one reversible failure at a time and validates both failure and recovery.

## Evidence quality checklist

- Is the timestamp present?
- Is the test scope local and authorized?
- Does the result distinguish the current hypothesis from at least one alternative?
- Is the change reversible?
- Was the repair validated from the user's perspective?
- Are private identifiers and raw packet captures excluded from published evidence?
- Could another beginner repeat the same steps?
