# Oz - AI Assistant Shell

A Next.js (App Router) + TypeScript application with a ChatGPT-like interface for AI interactions.

## Features

- **Dark mode default** - Calm, modern dark theme
- **Collapsible sidebar** - Context management panel (collapsed by default)
- **Message history abstraction** - Built-in helpers for managing conversation state
- **Prompt building** - Structured prompt construction with explicit context slots
- **No external dependencies** - No auth, no database, no global state libraries

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_actual_key_here
OPENAI_MODEL=gpt-4o-mini
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/lib/chat/` - Message types and history management
  - `types.ts` - Message type definitions
  - `history.ts` - Message normalization and manipulation helpers
- `src/lib/prompt/` - Prompt building logic
  - `buildPrompt.ts` - Structured prompt construction with context slots
- `src/components/` - UI components
  - `Shell.tsx` - Main shell container
  - `Header.tsx` - Top header with sidebar toggle
  - `Sidebar.tsx` - Collapsible context sidebar
  - `ChatArea.tsx` - Main chat interface

## Context Slots

The prompt builder supports explicit context slots:
- `careerFileText` - Career-related context
- `pastedText` - Pasted content
- `notesStub` - Notes and reminders

## Development

The page auto-updates as you edit files. Start by modifying `src/app/page.tsx` or any component in `src/components/`.
