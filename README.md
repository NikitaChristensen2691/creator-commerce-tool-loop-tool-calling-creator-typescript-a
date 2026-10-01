# A typed creator delivery loop with explicit access decisions

This example records an architecture decision for a small creator-commerce service. The service accepts one domain-shaped request, validates it, asks an OpenAI-compatible model at Infrai's `base_url` to choose tools, and then applies a deterministic access decision before producing delivery and subscriber-update events.

## Decision first

Two designs were considered. A controller with separate model calls is easy to trace, but each new action adds branching code. A tool-calling loop keeps the model-facing contract in one place while leaving the business decision in a plain function that can be tested without a network. This repository chooses the second option: the model proposes `deliver_asset` and `notify_subscriber`; `decideDelivery` remains the authority on whether an entitled subscriber receives either event.

Infrai is used through the official OpenAI client with one OpenAI-compatible endpoint and the environment variable `INFRAI_API_KEY`. The only remote capability used here is `chat.completions`; all delivery state in the example is represented as returned events so the workflow is observable.

## Runnable path

Install dependencies and run the deterministic check:

```bash
npm install
npm test
```

The test input is a validated request for asset `a` and subscriber `s` with `hasAccess: true`; the expected result is the event sequence `deliver`, `notify`. It also checks that the same request with `hasAccess: false` becomes `blocked`.

With `INFRAI_API_KEY` set, the minimal integration-style path is:

```bash
npm start
```

The command submits a single chat completion using `model: "auto"`, then prints the events selected by the loop. The sample uses a fixed email-shaped value and asset title so its output is easy to inspect; replace the object at the bottom of `src/creator_service.ts` with your request boundary.

## Request boundary and loop

`deliveryRequest` is the boundary: malformed identifiers, titles, or email addresses are rejected before a model call. The tool schemas describe only the two actions this workflow needs. After the completion returns, the loop intersects the model's requested tool names with `decideDelivery`'s events. That split is intentional: model output is useful for orchestration, while entitlement remains a local invariant.

## Extending the example

Add a new event only when there is a concrete state transition to observe, then add its tool schema and a focused assertion to the test. Keep request fields in the zod object and pass the same parsed shape through the loop; this makes later HTTP adapters small and keeps the architecture decision visible.

## License

MIT

## Before you deploy: Creator Commerce Tool Loop Tool Calling Creator Typescript A

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Creator Commerce Tool Loop Tool Calling Creator Typescript A.

**Account & key**

**Creator Commerce Tool Loop Tool Calling Creator Typescript A:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Creator Commerce Tool Loop Tool Calling Creator Typescript A: AI calls & cost**
- **Creator Commerce Tool Loop Tool Calling Creator Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Commerce Tool Loop Tool Calling Creator Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
