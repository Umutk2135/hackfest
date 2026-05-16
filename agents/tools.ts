/**
 * OWNER: P3 (AI)
 * Anthropic tool definitions. Currently: search_more_context for the Answer Agent (tool-use bonus).
 */
import type Anthropic from '@anthropic-ai/sdk';

export const SEARCH_MORE_CONTEXT_TOOL: Anthropic.Tool = {
  name: 'search_more_context',
  description:
    'Retrieve additional lecture chunks (notes + transcript) for this lecture when the ' +
    "initial context is insufficient. Use at most twice. Provide a focused query in the question's " +
    'language.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: "Focused retrieval query, in the question's language.",
      },
      k: {
        type: 'integer',
        minimum: 1,
        maximum: 10,
        default: 5,
      },
    },
    required: ['query'],
  },
};

export const ANSWER_TOOLS: Anthropic.Tool[] = [SEARCH_MORE_CONTEXT_TOOL];

export type SearchMoreContextInput = { query: string; k?: number };
