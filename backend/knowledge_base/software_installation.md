# Standard Software Request & Automated Provisioning Guide

## Overview
Enterprise policy and procedure for obtaining software licenses and automated application installation on developer and workstation hardware.

## Approved Software Catalogue
Standard approved developer tools are available via self-service automated provisioning:
- **Visual Studio Code**: Standard IDE for developers and data engineers. Pre-approved for instant automated deployment.
- **Git / Git Bash**: Version control CLI and GUI utilities. Pre-approved for instant deployment.
- **Docker Desktop**: Containerization engine (requires manager approval).
- **Postman**: API testing suite (pre-approved).

## How to Request Software
1. Open the AI Helpdesk Self-Service Portal.
2. Enter your request in natural language (e.g., *"I need Visual Studio Code installed on my laptop"*).
3. The AI agent detects the **Service Request** intent, validates software eligibility in the catalogue, generates a ServiceNow Request item (`REQxxxxxx`), and triggers the Mock Provisioning API.
4. Once provisioned, the software status updates to **Completed** and automated software installation logs are posted to your audit timeline.
