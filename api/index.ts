import handler from "../dist/server/server.js";

export const config = { runtime: "nodejs20.x" };

export default async function (req: Request): Promise<Response> {
  // @ts-expect-error - tanstack server.js default export is a fetch handler
  return handler.fetch(req);
}
