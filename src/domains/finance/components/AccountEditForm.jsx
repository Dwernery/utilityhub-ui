import { useState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { useUpdateAccount } from "../hooks";
import { assetTypeOptions } from "../utils/accounts";
import { useToast } from "../../../context/ToastContext";

const FIELD =
  "w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const LABEL = "block text-xs font-semibold text-slate-700";

/**
 * Rename, retype and archive one account, inline. The category can't change
 * (asset ↔ liability would rewrite past net worth), so assets pick from the
 * standard types and liabilities type their own, as when creating.
 * Mirrors utility-hub-mobile's app/finances/account/[id].tsx.
 *
 * @param {{ account: { id: number, accountName: string, accountType: string,
 *   category: "ASSET" | "LIABILITY", archived: boolean }, onDone: () => void }} props
 */
export function AccountEditForm({ account, onDone }) {
  const addToast = useToast();
  const updateAccount = useUpdateAccount();
  const [name, setName] = useState(account.accountName);
  const [type, setType] = useState(account.accountType);
  const isAsset = account.category === "ASSET";
  const busy = updateAccount.isPending;

  const save = async (fields, message) => {
    try {
      await updateAccount.mutateAsync({ id: account.id, ...fields });
      addToast(message, "success");
      onDone();
    } catch (err) {
      addToast(err.message || "Failed to update account", "error");
    }
  };

  const handleSave = () => {
    if (!name.trim()) return addToast("Please enter an account name", "error");
    if (!type.trim()) return addToast("Please enter an account type", "error");
    save(
      {
        accountName: name.trim(),
        accountType: type.trim(),
        archived: account.archived,
      },
      "Account updated",
    );
  };

  // Archiving saves the account as it was, not any unsaved edits in the form.
  const handleArchive = () =>
    save(
      {
        accountName: account.accountName,
        accountType: account.accountType,
        archived: !account.archived,
      },
      account.archived
        ? `${account.accountName} unarchived`
        : `${account.accountName} archived. Past months keep its balances.`,
    );

  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
      <div className="flex gap-2 flex-col sm:flex-row">
        <label className={`${LABEL} flex-1`}>
          Account Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            disabled={busy}
            className={FIELD}
            autoFocus
          />
        </label>
        <label className={`${LABEL} flex-1`}>
          Account Type
          {isAsset ? (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={busy}
              className={FIELD}
            >
              {assetTypeOptions(account.accountType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Credit Card, Mortgage"
              maxLength={50}
              disabled={busy}
              className={FIELD}
            />
          )}
        </label>
      </div>
      <p className="text-xs text-slate-500">
        The new name and type show in every month. Balances don’t change.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSave}
          disabled={busy}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {busy ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onDone}
          disabled={busy}
          className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleArchive}
          disabled={busy}
          title={
            account.archived
              ? "Offer this account for new months again"
              : "Stop offering this account for new months. Past months keep its balances."
          }
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm"
        >
          {account.archived ? (
            <ArchiveRestore size={14} />
          ) : (
            <Archive size={14} />
          )}
          {account.archived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </div>
  );
}
