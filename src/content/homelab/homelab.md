---
title: Homelab
---

My mini homelab is where I run services, experiment with infrastructure and learn about security. I try to keep it small and efficient, combining Kubernetes and Docker with GitOps, monitoring and backups across a few machines at home and a VPS, all managed as code from a single repository.

## The setup

<!-- Diagrams use the shared homelab-diagram renderer, icon catalog and traffic routes. -->

```homelab-diagram
{
  "title": "The setup: simplified diagram",
  "nodes": [
    {
      "id": "router",
      "icon": "router",
      "x": 160,
      "y": 35
    },
    {
      "id": "vps",
      "icon": "server",
      "x": 440,
      "y": 35
    },
    {
      "id": "switch",
      "icon": "switch",
      "x": 160,
      "y": 120
    },
    {
      "id": "nuc",
      "icon": "nuc",
      "x": 70,
      "y": 205
    },
    {
      "id": "pi",
      "icon": "pi",
      "x": 200,
      "y": 205
    },
    {
      "id": "nas",
      "icon": "nas",
      "x": 330,
      "y": 205
    }
  ],
  "edges": [
    {
      "from": "router",
      "to": "switch"
    },
    {
      "from": "switch",
      "to": "nuc"
    },
    {
      "from": "switch",
      "to": "pi"
    },
    {
      "from": "switch",
      "to": "nas"
    },
    {
      "from": "router",
      "to": "vps",
      "dashed": true
    }
  ],
  "traffic": [
    ["router", "switch", "nuc"],
    ["router", "switch", "pi"],
    ["router", "switch", "nas"],
    ["router", "vps"]
  ]
}
```

The setup combines a **Proxmox host**, a **Raspberry Pi**, a **Synology NAS** and a **VPS**. An **OPNsense router**, a managed switch and an access point connect the home equipment. The diagram is an illustrative overview, not a complete network map.

## Managed as code

Everything lives in one Git **monorepo**: Ansible roles for the hosts, Docker Compose projects grouped by host, Talos machine configuration and Flux manifests for the cluster. Every change follows the same path wherever it runs: commit, push to **Forgejo**, and let Flux or Arcane reconcile it. Then I check health and logs, and roll back or restore if something does not recover.

Secrets are only committed encrypted with **SOPS and age**; the keys stay out of Git and are decrypted at deploy time. **Forgejo Actions** run **Renovate** every few hours to propose dependency and image updates, and a **Trivy** scan on every push that fails on critical vulnerabilities, misconfigurations or leaked secrets.

The runbooks follow the same idea: an internal docs-as-code site written in Markdown, built by CI and deployed to the cluster through Flux, so recovery steps are versioned next to the configuration they describe.

## Networking and access

```homelab-diagram
{
  "title": "Networking and access: simplified diagram",
  "nodes": [
    {
      "id": "headscale",
      "icon": "network",
      "x": 300,
      "y": 35
    },
    {
      "id": "tailnet",
      "icon": "network",
      "x": 150,
      "y": 110
    },
    {
      "id": "secure access",
      "icon": "lock",
      "x": 450,
      "y": 110
    },
    {
      "id": "router",
      "icon": "router",
      "x": 300,
      "y": 145
    },
    {
      "id": "home network",
      "icon": "network",
      "x": 130,
      "y": 230
    },
    {
      "id": "services",
      "icon": "server",
      "x": 470,
      "y": 230
    }
  ],
  "edges": [
    {
      "from": "headscale",
      "to": "tailnet"
    },
    {
      "from": "tailnet",
      "to": "router"
    },
    {
      "from": "secure access",
      "to": "router"
    },
    {
      "from": "router",
      "to": "home network"
    },
    {
      "from": "router",
      "to": "services"
    }
  ],
  "traffic": [
    ["headscale", "tailnet", "router", "home network"],
    ["headscale", "tailnet", "router", "services"],
    ["secure access", "router", "home network"]
  ]
}
```

**Headscale** coordinates a Tailscale-compatible private network, or **tailnet**, connecting parts of the lab and providing remote access. OPNsense handles routing, firewall rules and network segmentation.

**Caddy** provides reverse proxying and HTTPS for services, while Kubernetes uses **Envoy Gateway** and **Gateway API** for application routing.

## Deployments and automation

```homelab-diagram
{
  "title": "Deployments and automation: simplified diagram",
  "nodes": [
    {
      "id": "forgejo",
      "icon": "git",
      "x": 300,
      "y": 35
    },
    {
      "id": "flux",
      "icon": "sync",
      "x": 150,
      "y": 115
    },
    {
      "id": "arcane",
      "icon": "box",
      "x": 450,
      "y": 115
    },
    {
      "id": "kubernetes",
      "icon": "cluster",
      "x": 150,
      "y": 205
    },
    {
      "id": "docker hosts",
      "icon": "server",
      "x": 450,
      "y": 205
    }
  ],
  "edges": [
    {
      "from": "forgejo",
      "to": "flux"
    },
    {
      "from": "forgejo",
      "to": "arcane"
    },
    {
      "from": "flux",
      "to": "kubernetes"
    },
    {
      "from": "arcane",
      "to": "docker hosts"
    }
  ],
  "traffic": [
    ["forgejo", "flux", "kubernetes"],
    ["forgejo", "arcane", "docker hosts"]
  ]
}
```

**Ansible** provisions and configures hosts, while **Forgejo** provides Git hosting, a container registry and Actions runners for the images I build.

The Kubernetes cluster runs **Talos Linux** with **Cilium**. **Flux** reconciles its configuration from Git; Envoy Gateway manages ingress with a **Coraza** WAF running the OWASP Core Rule Set, **cert-manager** handles certificates, the **Trivy Operator** scans running workloads and **VolSync** handles configured persistent volume backups. Workloads include Immich, Paperless and some of my own applications.

**Docker Compose** runs services across several hosts. **Arcane** manages Git-synced projects alongside the Kubernetes setup.

## Observability and security

```homelab-diagram
{
  "title": "Metrics, logs and traces: simplified diagram",
  "nodes": [
    {
      "id": "hosts & workloads",
      "icon": "server",
      "x": 300,
      "y": 35
    },
    {
      "id": "prometheus",
      "icon": "metrics",
      "x": 110,
      "y": 130
    },
    {
      "id": "loki",
      "icon": "storage",
      "x": 300,
      "y": 130
    },
    {
      "id": "opentelemetry",
      "icon": "network",
      "x": 490,
      "y": 130
    },
    {
      "id": "tempo",
      "icon": "storage",
      "x": 490,
      "y": 260
    },
    {
      "id": "grafana",
      "icon": "metrics",
      "x": 300,
      "y": 260
    }
  ],
  "edges": [
    {
      "from": "hosts & workloads",
      "to": "prometheus"
    },
    {
      "from": "hosts & workloads",
      "to": "loki"
    },
    {
      "from": "hosts & workloads",
      "to": "opentelemetry"
    },
    {
      "from": "prometheus",
      "to": "grafana",
      "viaY": 260
    },
    {
      "from": "loki",
      "to": "grafana"
    },
    {
      "from": "tempo",
      "to": "grafana"
    },
    {
      "from": "opentelemetry",
      "to": "tempo"
    }
  ],
  "traffic": [
    [
      "hosts & workloads",
      "prometheus",
      "grafana"
    ],
    [
      "hosts & workloads",
      "loki",
      "grafana"
    ],
    [
      "hosts & workloads",
      "opentelemetry",
      "tempo",
      "grafana"
    ]
  ]
}
```

**Prometheus and Grafana** provide metrics and dashboards. **Grafana Alloy** collects logs from hosts, Kubernetes, network devices and Talos; **Loki** stores them for search in Grafana Explore. **OpenTelemetry** instruments applications and sends traces to **Tempo**, where they can be explored in Grafana alongside metrics and logs. **Wazuh** remains separate for security events and endpoint monitoring.

**Gatus** monitors selected services both from inside the network and from the VPS, with **Gotify** used for notifications. A dashboard I built for the lab brings hosts, services and their health together in an inventory graph. A small private bridge forwards selected results to **Healthchecks**, which supplies the public status indicators on the homepage without exposing the Gatus dashboard.

**Wazuh and Trivy** help surface security events and vulnerability findings across parts of the environment. **CrowdSec** monitors suspicious activity on the VPS and applies its decisions through the firewall bouncer.

## Backups and recovery

```homelab-diagram
{
  "title": "Backups and recovery: simplified diagram",
  "nodes": [
    {
      "id": "docker",
      "icon": "box",
      "x": 150,
      "y": 35
    },
    {
      "id": "kubernetes",
      "icon": "cluster",
      "x": 450,
      "y": 35
    },
    {
      "id": "rbackup",
      "icon": "sync",
      "x": 150,
      "y": 100
    },
    {
      "id": "volsync",
      "icon": "sync",
      "x": 450,
      "y": 100
    },
    {
      "id": "backup storage",
      "icon": "storage",
      "x": 300,
      "y": 105
    },
    {
      "id": "kopia",
      "icon": "sync",
      "x": 300,
      "y": 220
    },
    {
      "id": "backblaze b2",
      "icon": "cloud",
      "x": 485,
      "y": 220
    }
  ],
  "edges": [
    {
      "from": "docker",
      "to": "rbackup"
    },
    {
      "from": "kubernetes",
      "to": "volsync"
    },
    {
      "from": "rbackup",
      "to": "backup storage"
    },
    {
      "from": "volsync",
      "to": "backup storage"
    },
    {
      "from": "backup storage",
      "to": "kopia"
    },
    {
      "from": "kopia",
      "to": "backblaze b2"
    }
  ],
  "traffic": [
    ["docker", "rbackup", "backup storage", "kopia", "backblaze b2"],
    ["kubernetes", "volsync", "backup storage", "kopia", "backblaze b2"]
  ]
}
```

Selected Docker data and Kubernetes volumes have backup jobs using **rbackup** and **VolSync**. **Garage** provides object storage, while **Kopia** handles additional copies, including off-site backups to **Backblaze B2**.

Backup coverage varies by service, and restores are an important part of the process.
