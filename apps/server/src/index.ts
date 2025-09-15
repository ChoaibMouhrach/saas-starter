import { Hono } from "hono";

export const main = () => {
  const server = new Hono();

  const port = 3001;
  console.log("Server is running on port:", port);
  Bun.serve({
    fetch: server.fetch,
    port,
  });
};

main();
