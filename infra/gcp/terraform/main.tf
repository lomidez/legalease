terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = "legalease-25wq"
  region  = "us-central1"
}

### INIT ### 

variable "gcp_service_list" {
  description = "List of APIs/Services needed for this project"
  type        = list(string)
  default = [
    "compute.googleapis.com",
  ]
}

variable "zones" {
  description = "List of zones to try for resource availability, supplied by the shell script (tfvars)"
  type        = list(string)
}

variable "machine_type" {
  description = "Type of machine to try for resource availability, supplied by the shell script (tfvars)"
  type        = string
}

resource "google_project_service" "legalease_gcp_services" {
  for_each           = toset(var.gcp_service_list)
  service            = each.key
  disable_on_destroy = false # don't disable the API when destroying the resource -- makes stopping the instance then starting it in another zone difficult, disabling/reenabling takes 5-10 mins
}

### LEGALEASE ###

resource "google_compute_network" "legalease_network" {
  name                    = "legalease-network"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "legalease_allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.legalease_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "legalease_allow_mosh" {
  name    = "allow-mosh"
  network = google_compute_network.legalease_network.name

  allow {
    protocol = "udp"
    ports    = ["60000-61000"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "legalease_allow_ollama" {
  name    = "allow-ollama"
  network = google_compute_network.legalease_network.name

  allow {
    protocol = "tcp"
    ports    = ["11434"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "legalease_allow_webui" {
  name    = "allow-webui"
  network = google_compute_network.legalease_network.name

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "legalease_allow_fastapi" {
  name    = "allow-fastapi"
  network = google_compute_network.legalease_network.name

  allow {
    protocol = "tcp"
    ports    = ["8000"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_instance" "legalease_vm" {
  count        = 1
  name         = "legalease"
  machine_type = var.machine_type
  zone         = var.zones[0]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 40
    }
  }

  network_interface {
    network = google_compute_network.legalease_network.name
    access_config {}
  }

  guest_accelerator {
    type  = "nvidia-tesla-t4"
    count = 1
  }

  scheduling {
    on_host_maintenance = "TERMINATE" # terminate instance when GCP performs maintenance -- haven't tested e2e yet that it will be migrated properly
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/legalease_gcp_key.pub")}"
  }

  # Not necessary, but helpful in the provisioning process when we keep retrying zones for resource availability, so the firewalls don't get remade on next iterations
  depends_on = [
    google_compute_firewall.legalease_allow_ssh,
    google_compute_firewall.legalease_allow_mosh,
    google_compute_firewall.legalease_allow_ollama,
    google_compute_firewall.legalease_allow_webui,
    google_compute_firewall.legalease_allow_fastapi
  ]

}

locals {
  vm_ip = google_compute_instance.legalease_vm[0].network_interface[0].access_config[0].nat_ip
}

output "instance_ip" {
  value = local.vm_ip
}

output "instance_zone" {
  value = google_compute_instance.legalease_vm[0].zone
}

output "ollama_url" {
  value = "http://${local.vm_ip}:11434"
}

output "webui_url" {
  value = "http://${local.vm_ip}:3000"
}

output "fastapi_url" {
  value = "http://${local.vm_ip}:8000"
}

