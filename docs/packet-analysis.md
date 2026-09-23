# Wireshark/TShark packet analysis

## Scope and capture method

The Windows Wireshark installation was verified, but its optional Npcap driver could not be installed from the current non-administrator session. To preserve the local-only boundary without changing a physical adapter, the capture was performed with Ubuntu WSL2's TShark 4.6.4 on the `lo` loopback interface. This is still Wireshark packet analysis and captures only the local harness traffic.

The local generator started a synthetic HTTP service, a self-signed local HTTPS service, and a UDP DNS responder. It made one request to each service and then stopped. The raw capture was written under `reports/generated/wireshark/` and is ignored by Git; it is not published.

Representative capture command:

```bash
sudo tshark -i lo -a duration:10 \
  -w reports/generated/wireshark/local-lab-capture.pcapng
```

The analysis commands used display filters and selected fields rather than exposing a raw capture:

```bash
tshark -r local-lab-capture.pcapng -Y dns
tshark -r local-lab-capture.pcapng -Y tcp
tshark -r local-lab-capture.pcapng -Y tls
tshark -r local-lab-capture.pcapng -Y 'ip.addr == 127.0.0.1'
tshark -r local-lab-capture.pcapng -Y 'tcp.port == 443'
```

The last filter is included as the standard HTTPS example from the project brief; this run used an unprivileged ephemeral local HTTPS port, so the `tls` filter is the authoritative match for the capture.

## Observed protocol evidence

The capture contained 28 loopback packets:

- **DNS:** frames 27–28 show a query for synthetic `warehouse.lab` from loopback to the local UDP responder and a response mapping it to `127.0.0.1`.
- **TCP:** frames 1–2 show SYN and SYN/ACK for HTTP; frames 13–14 show the corresponding HTTPS handshake transport. FIN packets show orderly close.
- **TLS:** frames 16 and 18 show ClientHello and ServerHello/certificate records. Later TLS records are encrypted application data.
- **HTTP:** frames 4 and 8 show a local `GET /` request and HTTP 200 response on the synthetic HTTP service.
- **Protocol hierarchy:** TShark reported TCP, HTTP, TLS, UDP, and DNS, with no public destination.

## Address, port, timing, and metadata

- Source and destination IPs are both `127.0.0.1`; this is the IPv4 loopback address.
- Source ports are ephemeral client ports. Destination ports are the synthetic HTTP, HTTPS, or DNS listener ports; screenshots replace exact ephemeral values with labels.
- Packet timing is relative to the capture start. The example DNS request and response occurred about 0.000092 seconds apart in the capture.
- Visible metadata includes protocol, endpoints, ports, TCP flags, TLS handshake type, relative timing, packet sizes, and connection close behavior.

## What TLS protects and does not hide

TLS encrypts the HTTP method, URI, response body, cookies, and other application data after the handshake. A packet observer can still see that a connection exists, the source and destination addresses and ports, timing, approximate packet sizes, and portions of the handshake such as certificate metadata. Encryption protects content; it does not make the connection invisible.

## Sanitized screenshots

The reviewed PNGs were generated from selected TShark fields by `scripts/render-packet-screenshots.py`:

- [`screenshots/wireshark-dns.png`](../screenshots/wireshark-dns.png)
- [`screenshots/wireshark-tcp-tls.png`](../screenshots/wireshark-tcp-tls.png)
- [`screenshots/wireshark-https-metadata.png`](../screenshots/wireshark-https-metadata.png)

The screenshots show only loopback addresses, synthetic names, protocol labels, relative timing, and redacted/ephemeral port labels. No raw capture, private adapter address, MAC address, credential, or external traffic is committed.
