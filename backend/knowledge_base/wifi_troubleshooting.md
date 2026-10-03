# Enterprise Wi-Fi Connection Guide

## Overview
Standard operating procedure for troubleshooting Wi-Fi connections on corporate laptops when connecting to `Corp-Secure` or `Guest-WiFi`.

## Quick Resolution Steps
1. **Forget Network**: Go to Wi-Fi Settings > Manage Known Networks > Select `Corp-Secure` > Click **Forget**. Reconnect using domain credentials (`DOMAIN\username`).
2. **Toggle Airplane Mode**: Turn Airplane Mode ON for 5 seconds, then OFF.
3. **Reset Wireless Adapter**:
   - Open Command Prompt as Administrator.
   - Run `netsh winsock reset` followed by `netsh int ip reset`.
   - Restart laptop.
4. **Certificate Trust**: Ensure the `Corp-Internal-CA` certificate is trusted if prompted during 802.1X authentication.
