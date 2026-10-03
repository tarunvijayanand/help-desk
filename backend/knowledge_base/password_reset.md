# Self-Service Password Reset Policy & Procedure

## Overview
This document outlines approved procedures for resetting expired or forgotten Active Directory / SSO enterprise domain passwords.

## Password Requirements
- Minimum length: 14 characters
- Must include uppercase letters, lowercase letters, numbers, and special symbols (!@#$%^&*)
- Cannot match any of your previous 10 passwords
- Cannot contain your first name, last name, or username

## Self-Service Password Reset (Automated)
If your password has expired or you are locked out of your account, you can initiate an automated password reset through the Self-Service Portal:
1. Navigate to the Helpdesk Portal and select **Password Reset / Unlock**.
2. Enter your corporate email address (`user@company.com`).
3. Complete Multi-Factor Authentication (MFA) via SMS code or Authenticator Push.
4. Set your new password according to the password requirements above.
5. The automated system resets your Active Directory credentials instantly across all integrated applications.

## Post-Reset Instructions
- Update stored Wi-Fi passwords on mobile devices.
- Re-authenticate in Microsoft Outlook and Teams.
- If logged into VPN, disconnect and reconnect using the new password.

## Approved Automation Policy
Password resets for domain accounts are classified as an **Approved Automatable Issue**. The Helpdesk AI agent is authorized to execute instant self-service resets upon successful user identity verification.
