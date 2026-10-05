---
layout: legal
title: Alchemy Rush! Privacy Policy
effective_date: 2026-10-05
permalink: /alchemy-rush/privacy/
---
<!-- Source: docs/compliance/privacy-policy.md in the Alchemy Rush! game repository; edits belong there. -->

# Alchemy Rush! Privacy Policy

Effective date: {{ page.effective_date | date: "%-d %B %Y" }}

Alchemy Rush! is provided by Vitor Machado, an individual developer. For privacy
questions or requests, contact suporte@vitormach.dev.

## Information used by the game

Google AdMob provides rewarded advertisements. Its Google Mobile Ads SDK collects and
shares IP addresses (which can indicate approximate location), app and advertisement
interactions, performance diagnostics, advertising and app set identifiers, and applicable
identifiers associated with signed-in device accounts. Google uses these for advertising,
measurement and fraud prevention. See [Google's SDK disclosure][admob].

GameAnalytics measures gameplay to help us understand usage and improve the game. It is
turned off wherever Google's User Messaging Platform (UMP) reports that consent is
required, including the EEA, UK and Switzerland: no GameAnalytics data is sent from those
players. Elsewhere, it receives session and run starts and endings, run scores, tutorial
progress, ranks and levels, order tiers and points, merged elements, consumed items,
collected stickers, virtual coin changes, and advertisement offers, results and
availability. It also receives purchase history: product identifiers and purchase or
restoration outcomes, used for analytics and not shared for advertising.

GameAnalytics associates these events with SDK-generated identifiers, app set ID and
device, app and session information. Its servers receive the device's IP address.
GameAnalytics advertising-ID tracking is disabled everywhere; it does not collect the
Android advertising ID through this game. It receives no payment details or purchase
receipts. See [GameAnalytics' processing details][ga-dpa].

Google Play Billing processes purchases, with Google as merchant of record. Payment
information is handled by Google under [Google's privacy policy][google]. The separate
GameAnalytics purchase and restoration events are described above.

Progress and run logs are stored on your device. Run logs are not automatically uploaded;
you can choose to export them through your device's share sheet.

## Your choices

The game requests updated UMP consent information on every launch and shows Google's
consent form when required. It requests no advertisement until UMP says advertisements
can be requested. You can decline consent and the game remains fully playable.

To change your advertisement choices or withdraw consent, open Settings → Ad Choices /
Personalisation and use Google's privacy choices form. Advertisement personalisation
follows your applicable consent choices. GameAnalytics remains off in UMP-required regions
regardless of whether you accept or decline advertisement consent.

You can also reset or delete your advertising ID through Android's advertisement privacy
settings. This is separate from requesting deletion of information already held by a vendor.

## Retention and privacy requests

Google's retention periods vary by data and purpose. Its published policy describes
advertising-log anonymisation after 9 months for IP addresses and 18 months for cookies,
with longer retention for security, legal and financial records. These are not universal
expiry periods for every AdMob record. See [Google's retention policy][google-retention].

GameAnalytics' [Developer Policy][ga-policy] ties retention to the developer's agreed
service terms. Its [retention documentation][ga-retention] progressively removes event
detail: progression and design events become unavailable after three months; some totals
remain after twelve months. Dashboard availability does not by itself establish when all
underlying personal data is deleted. Contact suporte@vitormach.dev for information about
the applicable retention terms.

To request access to or deletion of your data, use **Settings → Support** to e-mail
suporte@vitormach.dev, keeping the pre-filled subject. When analytics is active, that
subject includes the anonymous GameAnalytics identifier needed to locate your records.
We reply within 30 days. The game has no accounts and does not know your name; we forward
your request and identifier to GameAnalytics and ask it to delete the linked records.
Players in regions where analytics is off have no GameAnalytics data to delete. Vendor-held
data remains subject to the vendor's identification process and retention obligations, and resetting
the game does not by itself delete it. You can also contact GameAnalytics' privacy team
directly at privacy@gameanalytics.com. Data held by Google for advertising is managed
through Google's own privacy controls, described in its policy.

## Children

Alchemy Rush! is intended for players aged 13 and over and is not directed at children
under 13. Please contact suporte@vitormach.dev if you believe a child under 13 has provided
personal information through the game.

[admob]: https://developers.google.com/admob/android/next-gen/privacy/play-data-disclosure
[ga-dpa]: https://www.gameanalytics.com/trust/eu-data-processing-addendum
[ga-policy]: https://www.gameanalytics.com/trust/privacy-faq
[ga-retention]: https://docs.gameanalytics.com/event-tracking-and-integrations/data-retention-and-limits/data-retention-practices/
[google]: https://policies.google.com/privacy
[google-retention]: https://policies.google.com/technologies/retention
