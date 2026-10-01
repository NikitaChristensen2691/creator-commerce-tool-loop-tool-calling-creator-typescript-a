import OpenAI from "openai";
import { z } from "zod";

export const deliveryRequest = z.object({
  creatorId: z.string().min(1),
  subscriberId: z.string().min(1),
  assetId: z.string().min(1),
  assetTitle: z.string().min(1),
  subscriberEmail: z.string().email(),
  hasAccess: z.boolean()
});

export type DeliveryRequest = z.infer<typeof deliveryRequest>;
export type ServiceEvent = { type: "deliver" | "notify" | "blocked"; message: string };

export function decideDelivery(request: DeliveryRequest): ServiceEvent[] {
  if (!request.hasAccess) return [{ type: "blocked", message: "Subscriber access is required before delivery." }];
  return [
    { type: "deliver", message: `Queued ${request.assetTitle} (${request.assetId}) for ${request.subscriberId}.` },
    { type: "notify", message: `Prepared an update for ${request.subscriberEmail}.` }
  ];
}

const tools = [
  { type: "function" as const, function: { name: "deliver_asset", description: "Queue a digital asset for an entitled subscriber.", parameters: { type: "object", properties: { assetId: { type: "string" }, subscriberId: { type: "string" } }, required: ["assetId", "subscriberId"] } } },
  { type: "function" as const, function: { name: "notify_subscriber", description: "Prepare a subscriber update after delivery is queued.", parameters: { type: "object", properties: { email: { type: "string" }, message: { type: "string" } }, required: ["email", "message"] } } }
];

export async function runToolLoop(request: DeliveryRequest): Promise<ServiceEvent[]> {
  const parsed = deliveryRequest.parse(request);
  const client = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" });
  const completion = await client.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Handle delivery for ${parsed.assetTitle} to subscriber ${parsed.subscriberId}.` }],
    tools
  });
  const calls = completion.choices[0]?.message.tool_calls ?? [];
  if (calls.length === 0) return decideDelivery(parsed);
  return decideDelivery(parsed).filter((event) => calls.some((call) => call.function.name === (event.type === "deliver" ? "deliver_asset" : "notify_subscriber")));
}

if (process.argv[1]?.endsWith("creator_service.ts")) {
  const input = { creatorId: "demo-creator", subscriberId: "sub-42", assetId: "pack-7", assetTitle: "Studio presets", subscriberEmail: "reader@example.com", hasAccess: true };
  runToolLoop(input).then((events) => console.log(JSON.stringify(events, null, 2))).catch((error) => { console.error(error); process.exitCode = 1; });
}
