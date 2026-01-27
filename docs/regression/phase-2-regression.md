# Phase 2 Regression Checklist

Run this checklist after completing Phase 2. Should take ~12 minutes.

## A) Chat Core (3 checks)
- [ ] 1. Start new chat, send message, get assistant reply
- [ ] 2. Refresh page → conversation history persists with correct message order
- [ ] 3. Create 2nd conversation → both appear in conversation list, sorted by most recent

## B) Conversation Titles (3 checks)
- [ ] 4. Send first message in new conversation → title auto-generates (first 50 chars)
- [ ] 5. Manually edit conversation title → title updates
- [ ] 6. Send more messages → title does NOT change (title_locked = true)

## C) Career File (3 checks)
- [ ] 7. Open Career File panel, set Display Name + Target Role + Goals, click Save
- [ ] 8. See "Saved ✓" confirmation → refresh page → all fields persist
- [ ] 9. Send chat message → assistant can reference career context (verify response uses it)
- [ ] 10. Clear one field → save → refresh → that field is empty, others persist
- [ ] 11. Check server logs → system prompt only includes non-empty career file fields

## D) Memory Consent (4 checks)
- [ ] 12. Send message that should trigger memory candidate (e.g., "I'm targeting senior PM roles")
- [ ] 13. See [[MEMORY_CANDIDATE]] marker parsed correctly, consent UI appears: "Want me to remember that?"
- [ ] 14. Click "No" → consent UI disappears, nothing appears in Memory Panel
- [ ] 15. Send similar message again → candidate can appear again
- [ ] 16. Click "Remember" → see "Saved: {value}" system message
- [ ] 17. Check Memory Panel → new item appears
- [ ] 18. Check messages table → stored message does NOT contain [[MEMORY_CANDIDATE]] marker (stripped)

## E) Memory Panel (3 checks)
- [ ] 19. Memory panel loads with all active items, sorted by most recent
- [ ] 20. Click [Edit] on item → change key and value → save → see "Saved ✓" → refresh → persists
- [ ] 21. Click [Delete] on item → confirm → item disappears → refresh → stays deleted (status='deleted')

## F) Failure Handling (3 checks)
- [ ] 22. Temporarily break memory endpoint (wrong env var, comment out route, or return 500)
- [ ] 23. Verify chat still works (can send/receive messages normally)
- [ ] 24. Check Memory Panel shows "Memory is temporarily unavailable" with [Retry] button
- [ ] 25. Fix endpoint → click [Retry] → Memory Panel loads successfully
- [ ] 26. Break career file endpoint → chat works, uses empty career context
- [ ] 27. Fix endpoint → career file loads normally

## Pass Criteria
✅ All 27 checks pass = Phase 2 complete, safe to proceed to Phase 3

## Notes
- If any check fails, fix before moving forward
- This regression should be re-run after any Phase 2 changes
- Expected time: 10-12 minutes for full checklist
- Keep this checklist updated if you add features to Phase 2
