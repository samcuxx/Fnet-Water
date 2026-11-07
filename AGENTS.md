# F NET WATER HUB — AGENT RULES & CONTRACT

This file binds all autonomous and subagent operations in this workspace. Refer to [PROJECT_RULES.md](file:///c:/Users/samue/Documents/Github/fnetWater/PROJECT_RULES.md) and [GEMINI.md](file:///c:/Users/samue/Documents/Github/fnetWater/GEMINI.md) for full engineering specifications.

## 6 COMMANDMENTS FOR EVERY MODULE:
1. **Archetype Fidelity**: Every screen must originate directly from `ui_template` (`AuthPageLayout` for auth, `Ecommerce.tsx` for executive dashboards, `Logistics.tsx` for dispatch/operations).
2. **Rich ApexCharts**: Always use responsive ApexCharts (`radialBar` gauges, smooth area charts, monthly bar charts, donut charts) rather than flat stat text or lone bars.
3. **Vendor Jargon Ban**: Never show `mNotify`, `Paystack`, `Prisma`, `Docker`, or `NextAuth` in user UI. Use "SMS Code", "Mobile Money", "Phone Number", etc.
4. **Progressive 2-Step Flow**: Separate phone input from code entry. Use the 5-box digit input standard with auto-focus and clipboard paste.
5. **Anti-Slop Standard**: No buzzwords, no em dashes (`—`), no walls of text, no cards without actionable purpose, no table horizontal scroll.
6. **Dual Testing**: Run `npx.cmd tsc --noEmit` and verify HTTP 200 before completing any turn.
