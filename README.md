# Cursor Agent Scheduler

A VS Code extension for [Cursor](https://cursor.sh) that lets you schedule and automatically run AI agent prompts using cron schedules.

## Features

- **Schedule AI Prompts**: Set up cron-based schedules to run prompts automatically
- **Inline Prompts**: Write prompts directly in the schedule configuration
- **Command Files**: Reference reusable command definitions from `.cursor/commands/`
- **Variable Substitution**: Use `{datetime}`, `{date}`, `{time}`, `{timestamp}` in prompts
- **Run History**: Track execution history and results
- **Shareable Schedules**: Store schedules in `.cursor/agent-schedules.json` for team sharing

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to launch the extension in development mode

## Usage

### Creating a Schedule

1. Open Command Palette (`Cmd+Shift+P`)
2. Run "Agent Schedules: Add Schedule"
3. Configure your schedule:
   - **Name**: A descriptive name
   - **Cron Schedule**: When to run (e.g., `0 9 * * *` for 9 AM daily)
   - **Target**: Choose "Inline Prompt" or "Command File"
   - **Prompt**: Your AI prompt (supports variables like `{datetime}`)

### Cron Schedule Examples

| Schedule | Description |
|----------|-------------|
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour |
| `0 9 * * *` | Daily at 9 AM |
| `0 9 * * 1-5` | Weekdays at 9 AM |
| `0 0 * * 0` | Weekly on Sunday |

### Variable Substitution

Use these variables in your prompts:

- `{datetime}` - Current date and time (e.g., `2026-01-18-10-30-00`)
- `{date}` - Current date (e.g., `2026-01-18`)
- `{time}` - Current time (e.g., `10:30:00`)
- `{timestamp}` - Unix timestamp

Example prompt:
```
Create a file called report-{datetime}.md with a summary of today's tasks
```

### Command Files

Create reusable command definitions in `.cursor/commands/`:

```markdown
---
id: daily-report
name: Daily Report
description: Generate a daily status report
---

# Daily Report Generator

Create a markdown file with today's date containing:
1. Summary of completed tasks
2. Pending items
3. Blockers
```

### Schedule Configuration

Schedules are stored in `.cursor/agent-schedules.json`:

```json
{
  "schedules": [
    {
      "id": "unique-id",
      "name": "Daily Report",
      "enabled": true,
      "cronSchedule": "0 9 * * 1-5",
      "targetType": "prompt",
      "inlinePrompt": "Generate a status report for {date}",
      "executionMode": "ide"
    }
  ]
}
```

## Commands

| Command | Description |
|---------|-------------|
| Agent Schedules: Add Schedule | Create a new schedule |
| Agent Schedules: Edit | Edit an existing schedule |
| Agent Schedules: Run Now | Execute a schedule immediately |
| Agent Schedules: Enable | Enable a disabled schedule |
| Agent Schedules: Disable | Disable a schedule |
| Agent Schedules: View Run History | View execution history |
| Agent Schedules: Test Execution | Test agent execution with a sample prompt |

## How It Works

The extension uses Cursor's internal VS Code commands to execute prompts:

1. Opens the chat with the prompt pre-filled using `workbench.action.chat.open`
2. Submits the prompt using `composer.triggerCreateWorktreeButton`
3. Monitors for file changes to track execution results

## Requirements

- [Cursor](https://cursor.sh) IDE
- Node.js 18+

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Run extension
Press F5 in VS Code/Cursor
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
