
 // test.js
// Prove the service is single-use under concurrency.

import { issueToken, consumeToken, closeRedis } from "./token-service.js";

async function main() {
  try {
    // Step 1: Issue one token
    const id = await issueToken({ userId: 42 }, 60);
    console.log("issued token:", id);

    // Step 2: Consume the same token with 5 concurrent requests
    const results = await Promise.all([
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
      consumeToken(id),
    ]);

    // Step 3: Count successful consumers
    const winners = results.filter((r) => r.ok).length;
    console.log("winners:", winners);

    // Step 4: Assert that exactly one consumer wins
    if (winners !== 1) {
      throw new Error("SINGLE-USE VIOLATED! winners = " + winners);
    }

    console.log("PASS: token was single-use.");
  } finally {
    // Close the Redis connection
    await closeRedis();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
