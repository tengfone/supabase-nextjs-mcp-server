# supabase-nextjs-server MCP Server
[![smithery badge](https://smithery.ai/badge/@tengfone/supabase-nextjs-mcp-server)](https://smithery.ai/server/@tengfone/supabase-nextjs-mcp-server)

A Model Context Protocol server

This is a TypeScript-based MCP server that implements a simple notes system for NextJS. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

<a href="https://glama.ai/mcp/servers/9i4b9xiqrc"><img width="380" height="200" src="https://glama.ai/mcp/servers/9i4b9xiqrc/badge" alt="Supabase NextJS Server MCP server" /></a>

## Features

### Init
- Require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables

### Resources
- List and access notes via `note://` URIs
- Each note has a title, content and metadata
- Plain text mime type for simple content access

### Tools
- `create_note` - Create new text notes
  - Takes title and content as required parameters
  - Stores note in server state

### Prompts
- `summarize_notes` - Generate a summary of all stored notes
  - Includes all note contents as embedded resources
  - Returns structured prompt for LLM summarization

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "supabase-nextjs-server": {
      "command": "/path/to/supabase-nextjs-server/build/index.js"
    }
  }
}
```

### Installing via Smithery

To install Supabase Notes for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@tengfone/supabase-nextjs-mcp-server):

```bash
npx -y @smithery/cli install @tengfone/supabase-nextjs-mcp-server --client claude
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
