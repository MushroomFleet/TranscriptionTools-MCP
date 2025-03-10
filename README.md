# TranscriptionTools MCP Server

[![smithery badge](https://smithery.ai/badge/@MushroomFleet/transcriptiontools-mcp)](https://smithery.ai/server/@MushroomFleet/transcriptiontools-mcp)

An MCP server providing intelligent transcript processing capabilities, featuring natural formatting, contextual repair, and smart summarization powered by Deep Thinking LLMs.

## Available MCP Tools

This MCP server exposes four powerful tools for transcript processing:

1. **repair_text** - Analyzes and repairs transcription errors with greater than 90% confidence
2. **get_repair_log** - Retrieves detailed analysis logs from previous repairs
3. **format_transcript** - Transforms timestamped transcripts into naturally formatted text
4. **summary_text** - Generates intelligent summaries using ACE cognitive methodology

## Installation

### Installing via Smithery

To install Transcription Tools for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@MushroomFleet/transcriptiontools-mcp):

```bash
npx -y @smithery/cli install @MushroomFleet/transcriptiontools-mcp --client claude
```

1. Clone this repository:
```bash
git clone https://github.com/mushroomfleet/TranscriptionTools-MCP
cd TranscriptionTools-MCP
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

4. Configure the MCP server in your MCP settings file:
```json
{
  "mcpServers": {
    "transcription-tools": {
      "command": "node",
      "args": ["/path/to/TranscriptionTools-MCP/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Using the MCP Tools

### Repairing Transcription Errors

```
<use_mcp_tool>
<server_name>transcription-tools</server_name>
<tool_name>repair_text</tool_name>
<arguments>
{
  "input_text": "We recieve about ten thousand dollars which is defiantly not enough.",
  "is_file_path": false
}
</arguments>
</use_mcp_tool>
```

### Formatting Timestamped Transcripts

```
<use_mcp_tool>
<server_name>transcription-tools</server_name>
<tool_name>format_transcript</tool_name>
<arguments>
{
  "input_text": "/path/to/timestamped-transcript.txt",
  "is_file_path": true,
  "paragraph_gap": 8,
  "line_gap": 4
}
</arguments>
</use_mcp_tool>
```

### Generating Summaries

```
<use_mcp_tool>
<server_name>transcription-tools</server_name>
<tool_name>summary_text</tool_name>
<arguments>
{
  "input_text": "Long text to summarize...",
  "is_file_path": false,
  "constraint_type": "words",
  "constraint_value": 100
}
</arguments>
</use_mcp_tool>
```

### Retrieving Repair Logs

```
<use_mcp_tool>
<server_name>transcription-tools</server_name>
<tool_name>get_repair_log</tool_name>
<arguments>
{
  "session_id": "20241206143022"
}
</arguments>
</use_mcp_tool>
```

## Core Technologies

### Natural Formatting
- Removes timestamps while preserving speech patterns
- Applies intelligent spacing based on pause duration
- Respects natural grammar and language flow
- Maintains exact transcribed content

### Contextual Repair
- Identifies and corrects likely transcription errors
- Uses semantic context for high-confidence corrections
- Maintains detailed logs of all changes
- 90% confidence threshold for corrections
- No original audio required

### Smart Summarization
- Creates concise summaries of processed transcripts
- Supports multiple constraint types:
  - Time-based (speaking duration)
  - Character count
  - Word count
- Preserves key information and context
- Maintains natural speaking rhythm

## Project Structure
```
/
├── .gitignore         # Git ignore file
├── LICENSE            # MIT license file
├── README.md          # This documentation
├── package.json       # Package dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── build/             # Compiled JavaScript files (generated after build)
│   ├── tools/         # Compiled tool implementations
│   └── utils/         # Compiled utility functions
└── src/               # Source TypeScript files
    ├── index.ts       # MCP server entry point
    ├── tools/         # Tool implementations
    │   ├── formatting.ts
    │   ├── repair.ts
    │   └── summary.ts
    └── utils/         # Utility functions
        ├── file-handler.ts
        └── logger.ts
```

## Configuration

You can customize the server behavior by modifying the source code directly. The key configuration parameters are found in the respective tool implementation files:

```typescript
// In src/tools/formatting.ts
const paragraph_gap = 8; // seconds
const line_gap = 4;      // seconds

// In src/tools/repair.ts
const confidence_threshold = 90; // percentage

// In src/tools/summary.ts
const default_speaking_pace = 150; // words per minute
```

## License
MIT
