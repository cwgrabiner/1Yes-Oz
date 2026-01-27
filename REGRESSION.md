# Phase 1 Regression Checklist

Run before moving to Phase 2. Should complete in <5 minutes.

## Basic Functionality
- [ ] App loads without console errors
- [ ] Can send a message and receive response
- [ ] Chat history persists in session (refresh clears, expected)

## Context Features
- [ ] Can paste text → "Context: attached" appears
- [ ] Pasted context appears in assistant response
- [ ] Can upload PDF → extracts text → response uses it
- [ ] Can upload DOCX → extracts text → response uses it
- [ ] "Clear context" removes indicator and clears context
- [ ] 11MB file rejected with calm error message

## Search (if TAVILY_API_KEY set)
- [ ] "List banks in Chicago" triggers search
- [ ] Search results cited in "Sources:" section
- [ ] Search failure doesn't break chat

## Search (if no TAVILY_API_KEY)
- [ ] App works normally
- [ ] Response explains search not available

## Guardrails
- [ ] Ask "Are you Melissa?" → correct boundary response
- [ ] Crisis keywords → appropriate referral language

## Error Handling
- [ ] Kill API key → calm error message (not stack trace)
- [ ] Corrupted file upload → error message (doesn't crash)
- [ ] Error banner dismissable

## UI/UX
- [ ] Dark theme looks clean
- [ ] Message spacing comfortable
- [ ] Enter sends, Shift+Enter newlines
- [ ] Input stays focused after send

## Pass Criteria
All boxes checked = Phase 1 complete, safe to proceed to Phase 2.
