import Anthropic from "@anthropic-ai/sdk";
import { INTEGRATIONS } from "@/lib/data/integrations";
import { generateAgentSystemPrompt, generateContextualPrompt } from "@/lib/prompts/agent-generator";

// Allow streaming responses up to 60 seconds for agentic loops
export const maxDuration = 60;

// Define tools for Claude to use
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "generate_agent",
    description:
      "Generate a complete agent configuration with title, step-by-step instructions, and required integrations. Use this when the user wants to create a new agent or has described what they want the agent to do.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "A clear, descriptive name for the agent (e.g., 'Lead Enrichment Agent', 'GitHub Issue Monitor')",
        },
        goal: {
          type: "string",
          description: "A concise 1-2 sentence description of what this agent accomplishes",
        },
        integrations: {
          type: "array",
          description:
            "List of integration names required for this agent (e.g., ['Salesforce', 'Clearbit', 'Slack'])",
          items: {
            type: "string",
          },
        },
        instructions: {
          type: "array",
          description:
            "Detailed step-by-step instructions as a numbered list. Be specific about which integration to use and what data to process.",
          items: {
            type: "string",
          },
        },
        triggers: {
          type: "object",
          description: "Recommended trigger types for this agent",
          properties: {
            api: {
              type: "boolean",
              description: "Enable manual API trigger",
            },
            mcp: {
              type: "boolean",
              description: "Enable MCP server trigger",
            },
            webhook: {
              type: "boolean",
              description: "Enable webhook trigger",
            },
            scheduled: {
              type: "object",
              description: "Scheduled trigger configuration",
              properties: {
                enabled: {
                  type: "boolean",
                },
                cron: {
                  type: "string",
                  description: "Cron expression (e.g., '0 9 * * 1' for every Monday at 9 AM)",
                },
                description: {
                  type: "string",
                  description: "Human-readable description of the schedule",
                },
              },
            },
          },
        },
        notes: {
          type: "string",
          description: "Additional considerations, limitations, or best practices for this agent",
        },
      },
      required: ["title", "goal", "integrations", "instructions"],
    },
  },
  {
    name: "fetch_relevant_tools",
    description:
      "Fetch available tools for specific integrations to help design the agent workflow. Use this to discover what operations are available for selected integrations.",
    input_schema: {
      type: "object",
      properties: {
        integration_names: {
          type: "array",
          description:
            "List of integration names to fetch tools for (e.g., ['Salesforce', 'Slack'])",
          items: {
            type: "string",
          },
        },
      },
      required: ["integration_names"],
    },
  },
];

// Process a tool call and return the result
function processToolCall(toolName: string, toolInput: unknown): string {
  if (toolName === "fetch_relevant_tools") {
    const input = toolInput as { integration_names: string[] };
    const results = input.integration_names
      .map((name) => {
        const integration = INTEGRATIONS.find((i) => i.name.toLowerCase() === name.toLowerCase());
        if (!integration) {
          return `- ${name}: Not found`;
        }
        const toolsList = integration.tools
          ? integration.tools.map((t) => `    - ${t.name}: ${t.description}`).join("\n")
          : "    No tools available";
        return `- ${integration.name} (${integration.category}):\n${toolsList}`;
      })
      .join("\n\n");

    return `Found integrations and their available tools:\n\n${results}\n\nNow use generate_agent to create the complete agent configuration with detailed instructions using these tools.`;
  }

  return "Unknown tool";
}

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // Validate that we have messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages array is required", { status: 400 });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate the system prompt with all integrations and tools
    const systemPrompt = generateAgentSystemPrompt();

    // Add contextual information if provided
    const contextualPrompt = context ? generateContextualPrompt(context) : "";
    const fullSystemPrompt = systemPrompt + contextualPrompt;

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Build initial messages array
          let conversationMessages: Anthropic.Messages.MessageParam[] = messages.map(
            (msg: { role: string; content: string }) => ({
              role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
              content: msg.content,
            })
          );

          // Agentic loop - continue until we get a final response or generate_agent is called
          let continueLoop = true;
          let loopCount = 0;
          const maxLoops = 5; // Safety limit

          while (continueLoop && loopCount < maxLoops) {
            loopCount++;

            // Create streaming response
            const stream = await anthropic.messages.stream({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              temperature: 0.7,
              system: fullSystemPrompt,
              tools,
              messages: conversationMessages,
            });

            // Stream text content to client as it arrives
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                const data = JSON.stringify({ type: "text", content: event.delta.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            // Get the final message to check for tool calls
            const finalMessage = await stream.finalMessage();

            // Check if we should continue the loop
            if (finalMessage.stop_reason === "end_turn") {
              // Claude finished naturally without tool calls
              continueLoop = false;
            } else if (finalMessage.stop_reason === "tool_use") {
              // Process tool calls
              const toolUseBlocks = finalMessage.content.filter(
                (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
              );

              // Check if generate_agent was called - this is the final output
              const generateAgentCall = toolUseBlocks.find(
                (block) => block.name === "generate_agent"
              );
              if (generateAgentCall) {
                // Send the generated agent to the client
                const data = JSON.stringify({
                  type: "tool_call",
                  tool: "generate_agent",
                  data: generateAgentCall.input,
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                continueLoop = false;
              } else {
                // Process other tool calls and continue the loop
                const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

                for (const toolBlock of toolUseBlocks) {
                  const result = processToolCall(toolBlock.name, toolBlock.input);

                  // Send progress update to client
                  if (toolBlock.name === "fetch_relevant_tools") {
                    const input = toolBlock.input as { integration_names: string[] };
                    const progressText = `\n\n📋 Analyzing ${input.integration_names.join(", ")} integrations...\n`;
                    const progressData = JSON.stringify({ type: "text", content: progressText });
                    controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                  }

                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolBlock.id,
                    content: result,
                  });
                }

                // Add assistant message with tool use and tool results to conversation
                conversationMessages = [
                  ...conversationMessages,
                  {
                    role: "assistant" as const,
                    content: finalMessage.content,
                  },
                  {
                    role: "user" as const,
                    content: toolResults,
                  },
                ];
              }
            } else {
              // Unknown stop reason, exit loop
              continueLoop = false;
            }
          }

          if (loopCount >= maxLoops) {
            const warningData = JSON.stringify({
              type: "text",
              content: "\n\n⚠️ Agent generation took too long. Please try a simpler request.",
            });
            controller.enqueue(encoder.encode(`data: ${warningData}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = JSON.stringify({
            type: "text",
            content: `\n\nError: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API route:", error);

    // Check for specific error types
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
