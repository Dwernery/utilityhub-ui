import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { passkeyApi } from "./http";
import { describeThisDevice, setSessionState } from "./session";

// Touch ID sign-in with a passkey. The server sends the options plus a signed
// challenge token; the browser asks for Touch ID; the answer goes back with the token.

export const passkeysSupported = () => browserSupportsWebAuthn();

/** The user closed the Touch ID prompt (or it timed out): not an error worth showing. */
export function isCancelled(error) {
  return (
    error?.name === "NotAllowedError" ||
    error?.cause?.name === "NotAllowedError"
  );
}

/** Signs in with Touch ID. On success the API sets the session cookie. */
export async function signInWithPasskey() {
  const { challengeToken, publicKey } = await passkeyApi.signInOptions();
  const credential = await startAuthentication({ optionsJSON: publicKey });
  const session = await passkeyApi.signIn(
    challengeToken,
    credential,
    describeThisDevice(),
  );
  setSessionState("signedIn");
  return session;
}

/**
 * Creates a Touch ID passkey for this site. The server doesn't keep it: it returns
 * the line to add to its .env.
 * @returns {Promise<{credential: string, envLine: string}>}
 */
export async function registerPasskey() {
  const { challengeToken, publicKey } = await passkeyApi.registrationOptions();
  const credential = await startRegistration({ optionsJSON: publicKey });
  return passkeyApi.register(challengeToken, credential);
}
