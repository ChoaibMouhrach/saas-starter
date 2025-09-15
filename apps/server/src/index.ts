import { env } from "./lib/env";
import { createApp } from "./app";

const main = async () => {
  const app = await createApp();

  console.log("The server is running on port:", env.SERVER_API_PORT);
  Bun.serve({
    fetch: app.fetch,
    port: env.SERVER_API_PORT,
  });
};

main();
