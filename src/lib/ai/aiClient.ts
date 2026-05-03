import { getPostHogServer } from "@/app/posthog-server";
import { createGateway } from "@ai-sdk/gateway";
import { withTracing } from "@posthog/ai";

/**
 * Creates a PostHog-traced AI model for transaction parsing.
 * This will help us track the usage of the AI model and performance.
 */
export function createTracedModel(modelId: string, userId?: string) {
  const posthog = getPostHogServer();
  const gateway = createGateway();
  const model = gateway(modelId);

  const tracedModel = withTracing(model, posthog, {
    posthogDistinctId: userId,
    posthogProperties: {
      $ai_span_name: "Transaction Parsing",
      model_id: modelId,
      feature: "transaction_parsing",
    },
  });

  return tracedModel;
}
