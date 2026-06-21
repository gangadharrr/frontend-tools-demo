
import { interrupt } from '@langchain/langgraph';
import { BaseLangChainTool } from './tools';
import { EventType } from '@ag-ui/core';
import { AnyAgentMiddleware, createMiddleware, ToolMessage } from 'langchain';
import { externalToolResumeSchema } from '../schemas/tool.schemas';

export const externalToolCallMiddleware: (tools: BaseLangChainTool[]) => AnyAgentMiddleware = (tools: BaseLangChainTool[]) => {
	return createMiddleware({
		name: 'externalToolMiddleware',
		wrapToolCall: async (request, handler) => {
			const toolCall = request.toolCall;
			const toolName = toolCall.name;
			const toolId = toolCall.id;

			const tool = tools.find((t) => t.name === toolName);
			if (!tool?.isExternal || toolId === undefined) {
				return handler(request);
			}

			const toolResponse = interrupt({
        eventType: EventType.CUSTOM,
        customEventName: "EXTERNAL_TOOL_CALL",
        eventData: {
          toolName,
          toolId,
          toolArgs: toolCall.args,
        },
      });
			const responseParse = externalToolResumeSchema.safeParse(toolResponse);
			if (responseParse.success) {
				if (responseParse.data.externalToolResponse === 'success') {
					const { successMessage } = responseParse.data;
					return new ToolMessage({
						content: JSON.stringify(successMessage),
						tool_call_id: toolId,
						status: 'success',
					});
				}
				if (responseParse.data.externalToolResponse === 'failure') {
					const { failureMessage } = responseParse.data;
					return new ToolMessage({
						content: JSON.stringify(failureMessage),
						tool_call_id: toolId,
						status: 'error',
					});
				}
			}

			return new ToolMessage({
				content:
					'[EXTERNAL_TOOL_MIDDLEWARE] External tool response did not match expected schema for success or failure',
				tool_call_id: toolId,
				status: 'error',
			});
		},
	});
};
