---
id: incident-escalation
title: Production Incident and Account Crisis Escalation Matrix
category: SOP
access: internal
owner: Ananya Iyer
updated: 2026-08-30
status: approved
---

## Scope and Intent
This matrix dictates the immediate response protocol for critical account emergencies, technical website downtime, catastrophic ad-spend overruns, social PR crises, or data leakage at Brightwave Digital. Ananya Iyer (VP of Operations) acts as incident Commander.

## Severity Level Classifications

### Severity 1 (Critical / Blocker)
- **Criteria**: Client website or landing page completely offline during active ad campaigns; ad spend overrun exceeding ₹50,000 above daily cap; unintended post published triggering legal threat or PR backlash; tracking tag outage preventing all lead capture.
- **Initial Response Time**: Within 15 minutes of detection, 24/7/365.
- **Action Procedure**:
  1. Incident discoverer calls Ananya Iyer (+91 98250 XXXXX) and pages the `#ops-critical` Slack channel.
  2. For ad overrun, pause all active campaigns in Google Ads and Meta Ads Manager immediately.
  3. Form a virtual war room with Technical Lead, Account Manager, and Managing Partner.
  4. Provide hourly progress updates to client leadership via phone and email.

### Severity 2 (High Priority)
- **Criteria**: Ad account payment failure causing temporary campaign suspension; broken checkout flow on specific product page; discrepancy in Looker Studio data greater than 20%; delayed weekly report exceeding 24 hours without prior notice.
- **Initial Response Time**: Within 1 hour during business hours (9:30 AM to 6:30 PM IST), within 3 hours during weekends.
- **Action Procedure**: Account Manager directly coordinates with Media Buyer or Web Analytics specialist to resolve within 4 business hours.

### Severity 3 (Medium / Low Priority)
- **Criteria**: Minor typo in live blog post or social caption; non-critical broken hyperlink; cosmetic layout misalignment on mobile viewport.
- **Initial Response Time**: Within 4 business hours. Resolved within 1 business day.

## Post-Mortem Requirement
For every Severity 1 and Severity 2 incident, an Incident Retrospective document must be published within 48 hours of resolution, specifying root cause, financial impact in INR, remediation steps taken, and preventative safeguards.

