# MindEase

## Current State
Fresh project with only the base scaffold (shadcn UI, React, Tailwind). No App.tsx, no backend Motoko code, no components yet.

## Requested Changes (Diff)

### Add
- Full MindEase app: AI-powered therapy support and behavioral tracking tool
- Mood tracking with emoji selection and mood history chart
- Daily journaling (text entries stored per user)
- AI chat support with scripted/rule-based responses to emotional keywords (no external LLM)
- Dashboard showing mood trends (line chart), streak, and AI coping suggestions
- Emergency support section with helpline numbers
- Behavioral risk detection: alert user if negative mood persists many days

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: user mood logs, journal entries, chat messages stored on-chain. CRUD for moods, journals, and chat. Risk detection logic (flag if >= 5 negative moods in last 7 days).
2. Frontend pages: Dashboard, Chat, Mood Tracker, Journal, Emergency Support.
3. Navigation: sidebar or bottom nav linking all pages.
4. Charts: mood trend line chart using recharts.
5. AI chat: keyword-based response engine in frontend (stress, anxiety, sad, happy, etc.)

## UX Notes
- Calm, soft color palette (greens/blues)
- Mobile-friendly layout
- Disclaimer on chat screen: "This app does not replace professional therapy"
- Emoji mood picker (5 moods: great, good, okay, bad, awful)
