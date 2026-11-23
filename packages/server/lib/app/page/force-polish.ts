import { type Context, type Middleware, type Next } from "@fastr/core";
import { Pages } from "@keybr/pages-shared";

const pagePaths = [
  "/index",
  Pages.account.path,
  Pages.help.path,
  Pages.highScores.path,
  Pages.layouts.path,
  Pages.multiplayer.path,
  Pages.profile.path,
  Pages.typingTest.path,
  Pages.termsOfService.path,
  Pages.privacyPolicy.path,
];

/**
 * Sends all unlocalized page URLs to their Polish versions.
 *
 * API, authentication, asset and already localized URLs are left alone.
 */
export function forcePolish(): Middleware {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (process.env.NODE_ENV === "test") {
      await next();
      return;
    }
    const url = ctx.request.req.url ?? "/";
    const path = url.split("?")[0];
    const isPage =
      path === Pages.practice.path ||
      pagePaths.some(
        (pagePath) => path === pagePath || path.startsWith(`${pagePath}/`),
      );
    if (isPage) {
      ctx.response.redirect(Pages.intlPath(url, "pl"));
      return;
    }
    await next();
  };
}
