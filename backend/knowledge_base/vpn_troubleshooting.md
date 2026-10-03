# Virtual Private Network (VPN) Troubleshooting Guide

## Overview
This document provides official enterprise instructions for resolving VPN connection failures and authentication issues when connecting remotely to corporate network resources.

## Common Symptoms
- Error message: "Authentication failed" or "Unable to establish tunnel"
- GlobalProtect / Cisco AnyConnect client fails to connect
- Stuck on "Connecting..." status
- MFA prompt not received on mobile device

## Step-by-Step Resolution Steps
1. **Verify Internet Connectivity**: Ensure your local Wi-Fi or Ethernet connection is working by browsing to a public website.
2. **Check Corporate Credentials**: Ensure your domain password has not expired. If your domain password expired, use the Self-Service Password Reset Portal before attempting VPN login.
3. **MFA Push Notification**: Open your authenticator app and manually check for pending push approvals. Ensure your phone has active cellular or Wi-Fi data.
4. **Re-enter Gateway Address**: Ensure gateway address is set to `vpn.company.com` or `remote.company.com`.
5. **Restart VPN Agent**:
   - On Windows: Open Task Manager, locate `GlobalProtect Service` or `Cisco AnyConnect`, click **Restart**.
   - On macOS: Run `sudo launchctl stop com.paloaltonetworks.gp` in Terminal.
6. **Flush DNS Cache**:
   - Open Command Prompt as Administrator and execute `ipconfig /flushdns`.
7. **Reboot Device**: If issues persist, reboot your machine.

## Escalation Path
If steps 1 through 7 fail to resolve the VPN issue, submit an Incident to the **Network Support** team with your laptop serial number and exact error code.
