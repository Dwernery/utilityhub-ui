import { useState } from "react";
import { Check, Copy, Fingerprint, X } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { isCancelled, registerPasskey } from "../../../lib/passkey";

/**
 * "Set up Touch ID": creates a passkey on this computer, then shows the line to add to
 * the server's .env. The server keeps no list of passkeys, so this is how it learns
 * about the new one (and removing it there revokes it).
 */
export function SetUpTouchIdModal({ onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(null);
  const [copied, setCopied] = useState(false);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      setRegistered(await registerPasskey());
    } catch (err) {
      if (err?.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
        setError(
          "This computer already has a Touch ID passkey for Project SHIELD.",
        );
      } else if (!isCancelled(err)) {
        setError(
          err instanceof TypeError ? "Couldn't reach the server." : err.message,
        );
      }
    }
    setBusy(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(registered.envLine);
    setCopied(true);
  };

  return (
    <Modal onClose={onClose} panelClassName="w-full max-w-lg">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-lg font-bold text-slate-800">Set up Touch ID</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-slate-400 hover:text-slate-600 hover:cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {registered ? (
          <>
            <p className="text-sm text-slate-600">
              Touch ID is ready on this computer. To turn it on, add this line
              to the server&apos;s <code>.env</code> (replacing any existing{" "}
              <code>PASSKEYS=</code> line), then run{" "}
              <code>./scripts/deploy.sh --force</code>.
            </p>
            <pre className="mt-3 p-3 bg-slate-100 rounded-lg text-xs font-mono break-all whitespace-pre-wrap select-all">
              {registered.envLine}
            </pre>
            <button
              type="button"
              onClick={copy}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold hover:cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy line"}
            </button>
            <p className="mt-3 text-xs text-slate-500">
              It holds only public keys, so it isn&apos;t a secret.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Sign in with Touch ID instead of typing your password. Your Mac
              creates a passkey for this site and keeps it in your iCloud
              Keychain.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-xs text-red-600">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={start}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:cursor-pointer disabled:cursor-default"
            >
              <Fingerprint className="w-4 h-4" />
              {busy ? "Waiting for Touch ID…" : "Create passkey"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
