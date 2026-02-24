# Website Review – Steuerberatung Petertil

## Overall impression
The website feels modern, trustworthy, and conversion-focused. The design language (hero gradient, social proof, clear CTAs) is strong and appropriate for a tax advisory service.

## Strengths
- Strong value proposition above the fold with dual CTA paths (register vs pricing).
- Credibility markers (certification badge, testimonials, concrete stats) are well placed.
- Good bilingual setup (`de`/`en`) and broad content coverage (pricing wizard, deadlines, FAQ, calculator).
- Consistent visual rhythm with sections for value propositions, process, testimonials, and referral.

## Improvement opportunities

### 1) Trust proof depth
- Add logos, case snippets, or verifiable references to strengthen social proof beyond static testimonials.
- Add one concrete “result-style” proof block (e.g., average turnaround time, deduction optimization examples with disclaimer).

### 2) Accessibility
- Audit color contrast (especially lighter navy/gold text combinations) and keyboard focus states.
- Ensure semantic heading hierarchy remains consistent across all pages.
- Add explicit aria labels and visible focus rings on all major interactive elements.

### 3) Conversion clarity (deep dive)
Current observation: the homepage presents multiple strong actions early, which is generally good, but can introduce choice friction when users are not yet sure where to click first.

#### What to improve
1. **One primary action per section**
   - Hero should have one visually dominant primary CTA (start flow), while secondary actions are demoted to a lighter text link style.
   - Keep the same primary intent through subsequent sections to avoid re-decision moments.

2. **Stronger CTA copy with concrete outcome**
   - Replace generic CTA language with clearer value + expectation:
     - “Jetzt starten – in 3 Minuten Unterlagen hochladen”
     - “Kostenlos prüfen lassen” (if process starts with qualification)
     - “Fixpreis in 60 Sekunden berechnen” (if routing to pricing wizard)

3. **Micro-reassurance at point of action**
   - Place one short reassurance line directly under the main CTA:
     - “Unverbindlich · Antwort i. d. R. in 24h · 100% digital”
   - This reduces perceived risk exactly where hesitation occurs.

4. **Intent-based path split (for different user mindsets)**
   - “Ready to file” users: keep fast route to upload/start.
   - “Still comparing” users: route to pricing and FAQ via secondary links.
   - This keeps both paths but makes the default decision obvious.

5. **Reduce duplicate decision points**
   - If the same CTA appears multiple times, keep wording and destination identical.
   - Avoid introducing new labels for the same action (e.g., “Einreichen” vs “Starten” vs “Abgeben”) unless the action truly differs.

#### Suggested A/B tests (2–3 weeks each)
- **Test A (CTA hierarchy):**
  - Variant 1: two full buttons
  - Variant 2: one primary button + text link secondary
  - Success metric: hero primary CTR and downstream form start rate

- **Test B (CTA wording):**
  - Variant 1: current label
  - Variant 2: outcome/time-specific label
  - Success metric: click-to-completion rate

- **Test C (reassurance line):**
  - Variant 1: no reassurance
  - Variant 2: reassurance microcopy below CTA
  - Success metric: conversion rate uplift, reduced bounce on hero

#### Metrics to monitor
- Hero CTA click-through rate (primary)
- Registration/start-flow completion rate
- Pricing page detour rate
- Time-to-first-action
- Mobile conversion rate (often most sensitive to CTA clarity)

#### Priority implementation order
1. Adjust visual CTA hierarchy in hero.
2. Add reassurance microcopy under primary CTA.
3. Standardize CTA naming site-wide.
4. Run A/B tests and iterate based on data.

### 4) SEO/content depth
- Expand educational content (tax guides by canton, checklists, deadlines explainer pages) to support organic search.
- Add internal-linking hubs from service pages to educational resources.

### 5) Performance validation
- Run Lighthouse/Core Web Vitals checks in production and optimize any image/font bottlenecks.
- Prioritize LCP and CLS improvements on homepage first.

## Conclusion
As a business website, this is already in a strong position: professional design, clear user flow, and convincing service framing. The highest-impact next step is conversion clarity in the hero and first-scroll journey, paired with measurement-driven iteration.
