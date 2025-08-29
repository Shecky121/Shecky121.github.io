---
layout: default
title: "Building Your First Homelab: Practical Starter Projects and Essential Hardware"
date: 2025-08-29
categories: [Guides, HomeLab]
tags: [homelab, networking, proxmox, docker, k3s]
permalink: /guides/homelab/first-homelab-starter-guide/
---

# Building Your First Homelab: Practical Starter Projects and Essential Hardware

*Updated 2025-08-29*

## Why build a homelab?
A homelab is your personal sandbox for learning networking, Linux, virtualization, storage, and automation without risking production systems.

## Design goals
- **Simple first**: Minimize moving parts, then iterate.
- **Low noise & power**: Favor efficiency for 24/7 uptime.
- **Segmentation**: Isolate IoT, guests, media, and admin.
- **Observability**: Basic logs, metrics, and backups from day one.

## Hardware: pick a lane
1. **Single box starter**: An old desktop or SFF PC with 16–32 GB RAM and SSD.
2. **Mini‑server**: USFF/NUC/used enterprise (e.g., Dell R230).
3. **Raspberry Pi 4/5**: Great for network services and K3s agents.

## Reference layout
```
[Internet] --> [Firewall/Router] --> [Managed Switch]
                           ├─ VLAN10 Admin
                           ├─ VLAN20 Media
                           ├─ VLAN30 IoT
                           └─ VLAN40 Guest
```

## First platform: Proxmox VE
Install Proxmox VE on the host, create a ZFS mirror if you have two SSDs, and enable a non‑routed management network.

- Docs: https://pve.proxmox.com/wiki/Installation

## Starter services (containers)
1. **DNS sinkhole**: Pi‑hole (+Unbound).
2. **Media**: Jellyfin/Plex.
3. **Reverse proxy**: Traefik / Nginx Proxy Manager.

### Example `docker-compose.yml`
```yaml
version: "3.9"
services:
  pihole:
    image: pihole/pihole:latest
    environment:
      TZ: "America/New_York"
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "80:80/tcp"
    restart: unless-stopped
```

## Level up: identity & orchestration
- **FreeIPA** for centralized identity.
- **K3s** for orchestration when you outgrow Compose.

## Security basics (day 1)
- Unique admin creds; use a password manager.
- Put management on its own VLAN; block WAN to mgmt.
- Back up Proxmox (VMs/CTs) and off‑box configs.
- Patch firmware/packages on a schedule.

## Troubleshooting
- **Network**: verify VLAN tagging at switch/NICs.
- **DNS**: test by IP then hostname; check split‑DNS.
- **Storage**: watch S.M.A.R.T., ZFS health, free space.

## TL;DR
- Start on one quiet box with Proxmox.
- Ship useful services: Pi‑hole, media, reverse proxy.
- Segment networks early; keep management isolated.
- Add FreeIPA + K3s when needed.
- Backups + updates = no‑panic homelab.

## References
1. Proxmox VE Installation — https://pve.proxmox.com/wiki/Installation  
2. Pi‑hole basic install — https://docs.pi-hole.net/main/basic-install/  
3. Docker Compose docs — https://docs.docker.com/compose/  
4. K3s quick‑start — https://docs.k3s.io/quick-start  
5. FreeIPA Quick Start — https://www.freeipa.org/page/Quick_Start_Guide
