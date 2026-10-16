'use client';

import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Command reference, styled after the portfolio's DialogProvider confirm
 * panel: square card, mono eyebrow, bold title, right-aligned mono footer.
 */
const GROUPS = [
  {
    label: 'Hotkeys',
    note: 'Highlight text first, then press.',
    items: [
      {
        keys: ['Ctrl', 'Alt', 'H', 'then', 'M'],
        name: 'Ask',
        desc: 'Send the selection and get a direct answer.',
      },
      {
        keys: ['Ctrl', 'Alt', 'H', 'then', 'E'],
        name: 'Explain',
        desc: 'Step-by-step breakdown with jargon defined.',
      },
      {
        keys: ['Ctrl', 'Alt', 'H', 'then', 'W'],
        name: 'Write',
        desc: 'Turn the selection into finished written work.',
      },
      {
        keys: ['Ctrl', 'Alt', 'H', 'then', 'C'],
        name: 'Check',
        desc: 'Critical review with problems ranked by importance.',
      },
      {
        keys: ['Ctrl', 'Alt', 'H', 'then', 'F'],
        name: 'Fix',
        desc: 'An error, stack trace or failing output - get the likely cause and the smallest change that fixes it.',
      },
      {
        keys: ['Ctrl', 'Alt', 'F'],
        name: 'Fix',
        desc: 'One-keystroke version. Use this with terminal output, where every extra keystroke matters.',
      },
      {
        keys: ['Ctrl', 'Alt', 'M'],
        name: 'Ask',
        desc: 'One-keystroke version of Ask. Prefer it when it counts — the chord has to land twice inside 2 seconds.',
      },
      {
        keys: ['Ctrl', 'Alt', 'E'],
        name: 'Explain',
        desc: 'One-keystroke version of Explain.',
      },
    ],
  },
  {
    label: 'Tray icon',
    note: 'Bottom-right corner. It is the only feedback you get.',
    items: [
      {
        keys: ['Double-click'],
        name: 'Open dashboard',
        desc: 'Opens this page in a new tab.',
      },
      {
        keys: ['Right-click'],
        name: 'Menu',
        desc: 'Copy last answer, Show last answer, or Exit.',
      },
      {
        keys: ['Hover'],
        name: 'Status',
        desc: 'Tooltips show thinking / ready / errors. Nothing is ever drawn on screen and no notification is raised.',
      },
    ],
  },
  {
    label: 'While you work',
    items: [
      {
        keys: ['Esc'],
        name: 'Dismiss',
        desc: 'Closes the overlay instantly when display = panel.',
      },
      {
        keys: ['Ctrl', 'C'],
        name: 'Clipboard',
        desc: 'Used to capture your selection, then restored to what it was.',
      },
    ],
  },
];

function KeyChips({ keys }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {keys.map((key, i) =>
        key === 'then' ? (
          <span
            key={`${key}-${i}`}
            className="px-0.5 font-mono text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500"
          >
            then
          </span>
        ) : (
          <kbd key={`${key}-${i}`}>{key}</kbd>
        ),
      )}
    </div>
  );
}

export default function HelpModal({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    // Stop the page behind scrolling on mobile while the sheet is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fade-in fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard commands"
        onClick={(e) => e.stopPropagation()}
        className="rise-in flex max-h-[90vh] w-full flex-col border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 sm:max-h-[85vh] sm:max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:p-5">
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Reference
            </div>
            <h2 className="mt-1 text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Keyboard commands
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {GROUPS.map((group) => (
            <section key={group.label} className="mb-6 last:mb-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.label}
                </h3>
                {group.note ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {group.note}
                  </p>
                ) : null}
              </div>

              <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                {group.items.map((item) => (
                  <li
                    key={item.keys.join(' ') + item.name}
                    className="grid gap-1.5 py-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-5"
                  >
                    <div className="flex flex-wrap items-center gap-1">
                      <KeyChips keys={item.keys} />
                      <span className="ml-1 text-[13px] font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-400 dark:border-gray-800 dark:text-gray-500">
            Answers arrive in this dashboard, not on your screen. Everything is
            logged to <span className="font-mono">server.log</span> and stored in
            Supabase.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-gray-700 dark:border-gray-700 dark:bg-transparent dark:text-white dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
