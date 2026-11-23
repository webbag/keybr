import { type Context, type Middleware, type Next } from "@fastr/core";
import { ForbiddenError } from "@fastr/errors";
import { randomString, type SessionState } from "@fastr/middleware-session";
import { User } from "@keybr/database";
import { type AuthState } from "./types.ts";

/** E-mail of the account used to sign every new session in automatically. */
const autoLoginEmail = process.env.AUTO_LOGIN_EMAIL ?? "xyz@localhost";

export function loadUser(): Middleware<SessionState & AuthState> {
  return async (
    ctx: Context<SessionState & AuthState>,
    next: Next,
  ): Promise<void> => {
    const { state } = ctx;
    Object.assign(state, await makeAuthState(state));
    await next();
  };
}

async function makeAuthState(
  state: SessionState & AuthState,
): Promise<AuthState> {
  const { session } = state;
  const sessionId = session.id ?? randomString(10);
  const userId = session.get("userId");
  let user: User | null = null;
  if (userId != null) {
    user = await User.findById(userId);
  }
  if (user == null && process.env.NODE_ENV !== "test") {
    user = await User.login(autoLoginEmail);
    session.start();
    session.set("userId", user.id!);
  }
  const publicUser = User.toPublicUser(user, sessionId);
  return {
    sessionId,
    user,
    publicUser,
    requireUser: () => {
      if (user == null) {
        throw new ForbiddenError();
      } else {
        return user;
      }
    },
  };
}
