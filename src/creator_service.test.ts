import assert from "node:assert/strict";
import { decideDelivery, deliveryRequest } from "./creator_service.js";

const request = deliveryRequest.parse({ creatorId: "c", subscriberId: "s", assetId: "a", assetTitle: "Guide", subscriberEmail: "reader@example.com", hasAccess: true });
assert.deepEqual(decideDelivery(request).map((event) => event.type), ["deliver", "notify"]);
assert.equal(decideDelivery({ ...request, hasAccess: false })[0].type, "blocked");
console.log("decision test passed");
