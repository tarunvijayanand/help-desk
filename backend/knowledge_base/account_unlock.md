# Active Directory Account Unlock Procedure

## Overview
Guidelines for resolving account lockouts caused by multiple failed password attempts.

## Automatic Unlock Policy
- Domain accounts unlock automatically after **15 minutes** of inactivity.
- For immediate account unlock, use the **Self-Service AI Helpdesk** or call the automated phone attendant.

## Automated Account Unlock Steps
1. In the AI Helpdesk chatbot, type *"My account is locked"* or *"Unlock my domain account"*.
2. The AI system classifies the request as an **Automatable Issue**.
3. Upon MFA verification, the Self-Heal Agent executes an automated Active Directory unlock command.
4. ServiceNow incident state is set to **Resolved**, and an entry is logged in the Audit Trail.
