import { test } from "node:test";
import { equal } from "rich-assert";
import { forcePolish } from "./force-polish.ts";

async function run(url: string) {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const redirects: string[] = [];
  let continued = false;
  const ctx = {
    request: { req: { url } },
    response: {
      redirect: (location: string) => {
        redirects.push(location);
      },
    },
  } as any;
  try {
    await forcePolish()(ctx, async () => {
      continued = true;
    });
  } finally {
    process.env.NODE_ENV = previous;
  }
  return { redirects, continued };
}

test("redirects the root to the Polish version", async () => {
  const { redirects, continued } = await run("/");
  equal(redirects[0], "/pl");
  equal(continued, false);
});

test("redirects a page URL with a query string", async () => {
  const { redirects, continued } = await run("/account?tab=profile");
  equal(redirects[0], "/pl/account?tab=profile");
  equal(continued, false);
});

test("leaves localized and API URLs alone", async () => {
  equal((await run("/pl/account")).continued, true);
  equal((await run("/_/sync/settings")).continued, true);
  equal((await run("/login/xyz")).continued, true);
});
