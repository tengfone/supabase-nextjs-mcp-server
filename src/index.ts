#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
interface Database {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'supabase-nextjs-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'query_data',
          description: 'Query data from Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              select: { type: 'string' },
              filters: { type: 'object' }
            },
            required: ['table']
          }
        },
        {
          name: 'insert_record',
          description: 'Insert a record into Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              data: { type: 'object' }
            },
            required: ['table', 'data']
          }
        },
        {
          name: 'update_record',
          description: 'Update a record in Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              filters: { type: 'object' },
              data: { type: 'object' }
            },
            required: ['table', 'filters', 'data']
          }
        },
        {
          name: 'delete_record',
          description: 'Delete a record from Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              filters: { type: 'object' }
            },
            required: ['table', 'filters']
          }
        }
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'query_data':
          return this.handleQueryData(request.params.arguments);
        case 'insert_record':
          return this.handleInsertRecord(request.params.arguments);
        case 'update_record':
          return this.handleUpdateRecord(request.params.arguments);
        case 'delete_record':
          return this.handleDeleteRecord(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async handleQueryData(args: any) {
    const { table, select = '*', filters = {} } = args;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .match(filters);

    if (error) throw new McpError(ErrorCode.InternalError, error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }

  private async handleInsertRecord(args: any) {
    const { table, data } = args;
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw new McpError(ErrorCode.InternalError, error.message);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  private async handleUpdateRecord(args: any) {
    const { table, filters, data } = args;
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .match(filters)
      .select();

    if (error) throw new McpError(ErrorCode.InternalError, error.message);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  private async handleDeleteRecord(args: any) {
    const { table, filters } = args;
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match(filters);

    if (error) throw new McpError(ErrorCode.InternalError, error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Supabase MCP server running on stdio');
  }
}

const server = new SupabaseServer();
server.run().catch(console.error);
