# Microsoft Outlook Synchronization & Connectivity Guide

## Overview
Instructions for troubleshooting email synchronization failures, OST corruption, and connection state issues in Microsoft Outlook for Windows and macOS.

## Common Symptoms
- Outlook status bar shows "Disconnected" or "Trying to connect..."
- New emails not appearing in Inbox despite webmail showing messages
- Sent items stuck in Outbox
- "OST file corrupt or damaged" error message

## Troubleshooting Outlook Synchronization
1. **Verify Webmail Access**: Log into Outlook Web App (OWA) at `https://outlook.office.com`. If webmail works, your Exchange mailbox server is operational.
2. **Toggle Offline Mode**:
   - Go to the **Send / Receive** tab in Outlook.
   - Click **Work Offline** to turn it on, wait 10 seconds, then click it again to reconnect.
3. **Repair Outlook Data File (.OST)**:
   - Close Microsoft Outlook.
   - Open File Explorer and navigate to `%LOCALAPPDATA%\Microsoft\Outlook`.
   - Rename `outlook.ost` to `outlook.ost.old`.
   - Reopen Outlook. A fresh OST file will automatically rebuild from the Exchange server.
4. **Repair Microsoft 365 Profile**:
   - Control Panel > Mail > Show Profiles > Select profile > Click **Properties** > **Email Accounts** > Select account > Click **Repair**.
5. **Clear Credentials Cache**:
   - Open Windows Credential Manager -> Windows Credentials -> Delete all credentials related to `MicrosoftOffice16` or `adal`.

## Escalation Path
If synchronization remains broken after building a new OST file, submit an Incident ticket to **Messaging & Collaboration Support**.
