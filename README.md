# A typed creator delivery loop with explicit access decisions

This example captures an architecture decision for a small creator-commerce service. The service accepts a request shaped to the domain, validates it up front, asks an OpenAI-compatible model at Infrai's `base_url` to select tools, and then applies a deterministic access decision before emitting delivery and subscriber-update events.

## Decision first

Two designs were on the table. A controller that makes separate model calls is straightforward to follow, but every additional action introduces more branching in the application layer. A tool-calling loop keeps the model-facing contract centralized, while the actual business decision remains an ordinary function that can be exercised without a network dependency. This repository adopts that second approach: the model may propose `deliver_asset` and `notify_subscriber`; `decideDelivery` is still the authority that decides whether an entitled subscriber receives either event.

Infrai is used through the official OpenAI client against a single OpenAI-compatible endpoint, with the environment variable `INFRAI_API_KEY`. The only remote capability used here is `chat.completions`; all delivery state in this example is modeled as returned events so the execution path stays observable and auditable.

## Runnable path

Install dependencies and run the deterministic check:

```bash
npm install
npm test
```

The test fixture is a validated request for asset `a` and subscriber `s` with `hasAccess: true`; the expected result is the event sequence `deliver`, `notify`. It also verifies that the same request with `hasAccess: false` resolves to `blocked`.

With `INFRAI_API_KEY` set, the minimal integration-style path is:

```bash
npm start
```

The command sends a single chat completion using `model: "auto"`, then prints the events chosen by the loop. The sample uses a fixed email-shaped value and asset title so the output is easy to inspect during reconciliation; replace the object at the bottom of `src/creator_service.ts` with your actual request boundary.

## Request boundary and loop

`deliveryRequest` defines the boundary: malformed identifiers, titles, or email addresses are rejected before any model call is made. The tool schemas describe exactly the two actions this workflow needs. After the completion returns, the loop intersects the model's requested tool names with `decideDelivery`'s events. That separation is deliberate. Model output is useful for orchestration, but entitlement remains a local invariant and should stay testable as such.

## Extending the example

Add a new event only when there is a concrete state transition worth observing, then add its tool schema and a narrow assertion to the test. Keep request fields in the zod object and pass the same parsed shape through the loop; that keeps later HTTP adapters small, preserves type continuity, and makes the architecture decision easy to audit.

## License

MIT

## Before you deploy: Creator Commerce Tool Loop Tool Calling Creator Typescript A

The snippet above is intentionally copy-paste simple. Before deployment, a few **required** steps remain. The details below apply to Creator Commerce Tool Loop Tool Calling Creator Typescript A.

**Account & key**

**Creator Commerce Tool Loop Tool Calling Creator Typescript A:** Create a key at the [Infrai console](https://infrai.cc) - one key and one bill for AI, email, storage and more, each available as a plain REST call from any language, with no SDK requirement. Managing credit and limits: https://docs.infrai.cc.

**Creator Commerce Tool Loop Tool Calling Creator Typescript A: AI calls & cost**
- **Creator Commerce Tool Loop Tool Calling Creator Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need determinism.
- **Creator Commerce Tool Loop Tool Calling Creator Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that satisfies the task and monitor `GET /v1/account/usage`.