import { useEffect } from "react";

function isErrorMessage(message) {
  const value = (message || "").toLowerCase();
  return (
    value.startsWith("❌") ||
    value.includes("error") ||
    value.includes("failed") ||
    value.includes("invalid") ||
    value.includes("unable") ||
    value.includes("could not")
  );
}

export default function StatusToast({
  message,
  onClose,
  autoHideMs = 5000,
}) {
  useEffect(() => {
    if (!message || !onClose || autoHideMs <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      onClose();
    }, autoHideMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [message, onClose, autoHideMs]);

  if (!message) {
    return null;
  }

  const error = isErrorMessage(message);

  return (
    <div
      className={`fixed left-4 top-24 z-[90] max-w-sm rounded-xl border px-4 py-3 shadow-xl backdrop-blur ${
        error
          ? "border-red-500/70 bg-red-500/15 text-red-200"
          : "border-emerald-500/70 bg-emerald-500/15 text-emerald-200"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <p className="text-sm font-medium">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded px-2 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
            aria-label="Close status message"
          >
            x
          </button>
        )}
      </div>
    </div>
  );
}
