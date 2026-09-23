# Troubleshooting command reference

This guide explains the commands used by NetTrace Support Lab in beginner-friendly language. A command gives evidence about one layer of a problem; no single command proves that every layer is healthy.

## Windows commands

### `ipconfig /all`

- **Does:** Displays Windows interface addresses, subnet masks, gateways, DNS servers, DHCP state, and MAC addresses.
- **Use when:** A computer cannot reach a service, has an unexpected address, or appears to have lost DHCP (automatic address assignment).
- **Success means:** The command ran and produced interface data. It does not mean the network is usable.
- **Failure suggests:** A damaged command path or a Windows networking problem.
- **Cannot prove:** That DNS, routing, a firewall, or the application service is working.

### `hostname`

- **Does:** Prints the local computer name.
- **Use when:** Confirming which machine produced a report or ticket.
- **Success means:** The shell can identify the local host.
- **Failure suggests:** A shell or operating-system issue.
- **Cannot prove:** That the name is resolvable by DNS or that the host is reachable.

### `ping 127.0.0.1`

- **Does:** Sends ICMP echo requests to loopback, the computer talking to itself.
- **Use when:** Separating a local TCP/IP stack problem from an adapter or route problem.
- **Success means:** The local IP stack can answer loopback traffic.
- **Failure suggests:** A severe local stack, ICMP, or command problem.
- **Cannot prove:** That another host, DNS, a port, or an application is available.

### `ping 1.1.1.1`

- **Does:** Sends ICMP requests to a public test address.
- **Use when:** Only when an external destination is explicitly authorized; this project keeps it opt-in.
- **Success means:** That destination answered ICMP at that moment.
- **Failure suggests:** A route, firewall, ICMP policy, or remote availability issue.
- **Cannot prove:** That DNS or TCP/HTTPS works. Many hosts intentionally block ICMP.

### `nslookup example.com`

- **Does:** Asks a configured DNS server to translate a name to an IP address.
- **Use when:** A name fails but a known IP may still work.
- **Success means:** A DNS server returned an answer for that name.
- **Failure suggests:** Resolver configuration, DNS reachability, a missing record, or a temporary DNS issue.
- **Cannot prove:** That the returned host accepts the desired port or that HTTPS is healthy.

### `tracert example.com`

- **Does:** Shows the routers (network hops) that respond between the local system and a destination.
- **Use when:** A route appears broken or latency changes between hops; keep the destination authorized.
- **Success means:** Some hops replied and a path was observed.
- **Failure suggests:** A route or filtering issue, or simply routers that do not answer traceroute.
- **Cannot prove:** That every hop is required to answer, or that an application port is open.

### `Test-NetConnection example.com -Port 443`

- **Does:** Tests TCP connectivity to port 443, normally HTTPS.
- **Use when:** A host is reachable but a specific service may be unavailable.
- **Success means:** A TCP connection was established to that host and port.
- **Failure suggests:** A closed service, listener, firewall rule, route, or name-resolution problem.
- **Cannot prove:** That the application protocol or TLS certificate is valid after the TCP handshake.

### `curl.exe -I https://example.com`

- **Does:** Requests only HTTP response headers over HTTPS.
- **Use when:** Checking application-layer response and TLS negotiation without downloading a full page.
- **Success means:** DNS, TCP, TLS, and an HTTP response all worked for that request.
- **Failure suggests:** A failure in one of those layers; read the error carefully.
- **Cannot prove:** That every URL, user, or application workflow is healthy.

### `Get-NetIPConfiguration`

- **Does:** Displays structured Windows interface, DNS, and gateway information.
- **Use when:** A script needs machine-readable baseline data.
- **Success means:** PowerShell could query the local network stack.
- **Failure suggests:** A permissions, WMI, or networking query problem.
- **Cannot prove:** That a gateway is reachable or that a service is listening.

### `Get-NetRoute -AddressFamily IPv4`

- **Does:** Lists IPv4 routes and their next hops.
- **Use when:** An address is reachable on one subnet but not another.
- **Success means:** The route table was read.
- **Failure suggests:** A query or stack problem.
- **Cannot prove:** That the selected next hop will forward traffic successfully.

### `Get-NetTCPConnection -State Listen`

- **Does:** Lists local TCP ports waiting for connections.
- **Use when:** Confirming whether a local service is listening and where it is bound.
- **Success means:** The table was read; entries show listeners, not healthy applications.
- **Failure suggests:** A permissions or networking query problem.
- **Cannot prove:** That a listener will accept a request or that UDP is available.

## Linux and WSL commands

### `hostname`

Prints the Linux host name. Use it to label a report. It does not prove DNS or network reachability.

### `ip addr`

Lists Linux interfaces and addresses. Use it to check whether an interface is up and whether loopback exists. It does not prove a route or application port.

### `ip route`

Lists Linux routes and the default gateway. Use it to understand where packets should go. It does not prove that a next hop responds.

### `ping -c 4 127.0.0.1`

Sends four loopback ICMP requests. A successful result validates local IP handling only; it does not test a remote host or TCP service.

### `ping -c 4 1.1.1.1`

Tests an external ICMP destination and is disabled by default in this lab. A failure can be filtering rather than a broken route.

### `getent hosts example.com`

Asks the configured name-service system for a host record. Use it to compare name resolution with direct IP connectivity. It does not test a port or HTTPS.

### `ss -tulpn`

Lists listening TCP/UDP sockets and, where permitted, their processes. Use it to find a local listener. It cannot prove the application is responding correctly, and process details may require elevated permission.

### `curl -I https://example.com`

Requests HTTPS headers. Use it for an application-layer check only when the destination is authorized. It does not prove other URLs or user workflows work.

### `bash -n scripts/linux-baseline.sh`

Parses a Bash script without executing it. A zero exit code means syntax is valid; it does not prove runtime commands or permissions will succeed.

### `chmod` and `runuser`

`chmod` changes Unix permission bits on a synthetic file. `runuser` runs a command as an unprivileged local user for the permission scenario. Use only inside the temporary lab directory. They do not model an enterprise identity system.

## Core networking concepts

| Concept | Beginner explanation |
|---|---|
| IP address | A numeric address used to identify an interface on an IP network. IPv4 looks like four numbers separated by dots. |
| Subnet mask | A rule that divides an IP address into a local-network part and a host part. It helps a computer decide whether to use the gateway. |
| Default gateway | The router a computer uses when the destination is outside its local subnet. |
| DNS | Domain Name System; translates a name such as `example.com` into an IP address. |
| DHCP | Dynamic Host Configuration Protocol; automatically supplies an address and related settings. |
| MAC address | A link-layer identifier associated with a network interface. It is private device metadata and should be redacted before publishing. |
| TCP | A connection-oriented transport protocol that acknowledges data and provides ordered delivery. |
| UDP | A connectionless transport protocol with low overhead; delivery and ordering are not guaranteed. |
| Port | A number that identifies a service endpoint on a host, such as TCP 443 for HTTPS. |
| Routing | The process of selecting a next hop for a packet based on destination addresses. |
| Firewall | A control that allows or blocks traffic according to rules such as address, protocol, and port. |
| HTTP | The application protocol used to request and return web resources. |
| HTTPS | HTTP carried inside an encrypted TLS connection. |
| TLS | Transport Layer Security; encrypts and authenticates a connection when certificates and verification succeed. |
| Localhost | A name for the same computer; `127.0.0.1` is its IPv4 loopback address. |
| Process | A running instance of a program with memory and an operating-system identity. |
| Service | A program intended to run in the background and provide a function, often a network listener. |
| Permission | A rule describing who may read, write, execute, or otherwise use a resource. |

## Evidence discipline

Run one command at a time, save the output in an ignored report directory, record the timestamp, and state what the result does and does not prove. Never paste a raw report containing private addresses, MAC addresses, hostnames, or tokens into a public ticket.
