#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

// Import our tools
import { repairText, getRepairLog, RepairTextParams, GetRepairLogParams } from './tools/repair.js';
import { formatTranscript, FormatTranscriptParams } from './tools/formatting.js';
import { summaryText, SummaryTextParams } from './tools/summary.js';

/**
 * TranscriptionTools MCP Server
 * Provides tools for transcription repair, formatting, and summarization
 */
class TranscriptionToolsServer {
  private server: Server;

  constructor() {
    // Initialize the MCP server
    this.server = new Server(
      {
        name: 'transcription-tools',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {}, // We'll register our tools next
        },
      }
    );

    // Register our tools
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up the tool handlers for our transcription tools
   */
  private setupToolHandlers() {
    // Register the list of available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'repair_text',
          description: 'Analyzes and repairs transcription errors with greater than 90% confidence',
          inputSchema: {
            type: 'object',
            properties: {
              input_text: {
                type: 'string',
                description: 'Text content or path to file containing transcribed text'
              },
              is_file_path: {
                type: 'boolean',
                description: 'Whether input_text is a file path',
                default: false
              }
            },
            required: ['input_text']
          }
        },
        {
          name: 'get_repair_log',
          description: 'Retrieves detailed analysis log from previous repair operation',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Session ID or timestamp from previous repair'
              }
            },
            required: ['session_id']
          }
        },
        {
          name: 'format_transcript',
          description: 'Transforms timestamped transcripts into naturally formatted text',
          inputSchema: {
            type: 'object',
            properties: {
              input_text: {
                type: 'string',
                description: 'Timestamped transcript text or path to file'
              },
              is_file_path: {
                type: 'boolean',
                description: 'Whether input_text is a file path',
                default: false
              },
              paragraph_gap: {
                type: 'number', 
                description: 'Seconds gap for paragraph breaks',
                default: 8
              },
              line_gap: {
                type: 'number',
                description: 'Seconds gap for line breaks',
                default: 4
              }
            },
            required: ['input_text']
          }
        },
        {
          name: 'summary_text',
          description: 'Generates intelligent summaries using ACE cognitive methodology',
          inputSchema: {
            type: 'object',
            properties: {
              input_text: {
                type: 'string',
                description: 'Text to summarize or path to file'
              },
              is_file_path: {
                type: 'boolean',
                description: 'Whether input_text is a file path',
                default: false
              },
              constraint_type: {
                type: 'string',
                enum: ['time', 'chars', 'words', null],
                description: 'Type of constraint to apply'
              },
              constraint_value: {
                type: 'number',
                description: 'Value for the specified constraint'
              }
            },
            required: ['input_text']
          }
        }
      ]
    }));

    // Handler for executing tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Route the request to the appropriate tool
      try {
        switch (name) {
          case 'repair_text':
            // Validate required parameters
            if (!args || typeof args.input_text !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: input_text');
            }
            const repairResult = await repairText(args as unknown as RepairTextParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(repairResult, null, 2)
                }
              ]
            };

          case 'get_repair_log':
            // Validate required parameters
            if (!args || typeof args.session_id !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: session_id');
            }
            const logResult = await getRepairLog(args as unknown as GetRepairLogParams);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(logResult, null, 2)
                }
              ]
            };

          case 'format_transcript':
            // Validate required parameters
            if (!args || typeof args.input_text !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: input_text');
            }
            const formatResult = await formatTranscript(args as unknown as FormatTranscriptParams);
            return {
              content: [
                {
                  type: 'text',
                  text: formatResult.formatted_text
                }
              ]
            };

          case 'summary_text':
            // Validate required parameters
            if (!args || typeof args.input_text !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: input_text');
            }
            const summaryResult = await summaryText(args as unknown as SummaryTextParams);
            return {
              content: [
                {
                  type: 'text',
                  text: summaryResult.summary
                }
              ]
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TranscriptionTools MCP server running on stdio');
  }
}

// Create and start the server
const server = new TranscriptionToolsServer();
server.run().catch(console.error);
