'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaQuestionCircle, FaSyncAlt } from 'react-icons/fa';
import HelpModal from '../components/HelpModal';
import ThemeToggle from '../components/ThemeToggle';

const POLL_MS = 3000;

const BADGE =
  'rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-gray-500 dark:border-gray-800 dark:text-gray-400';

const GHOST_BTN =
  'rounded border border-gray-200 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-white';

const OUTLINE_BTN =
  'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-white';

function formatWhen(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts).replace('T', ' ').slice(0, 19);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [freshIds, setFreshIds] = useState(() => new Set());
  const [showHelp, setShowHelp] = useState(false);
  const seen = useRef(new Set());

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/answers?limit=50', { cache: 'no-store' });
      if (!res.ok) {
        setStatus('error');
        return;
      }
      const data = await res.json();
      const newly = data.items.filter((i) => !seen.current.has(i.id));
      seen.current = new Set(data.items.map((i) => i.id));
      setFreshIds(new Set(newly.map((i) => i.id)));
      setItems(data.items);
      setStatus('ok');
      if (newly.length && document.hidden) document.title = '• ai-hotkey';
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    const onShow = () => {
      document.title = 'ai-hotkey';
      load();
    };
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('focus', onShow);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, [load]);

  const statusText = {
    connecting: 'Connecting…',
    ok: `Live · polls every ${POLL_MS / 1000}s · ${items.length} saved`,
    offline: 'Server unreachable — retrying',
    error: 'Something went wrong',
  }[status];

  const tone = {
    connecting: 'bg-gray-300 dark:bg-gray-600',
    ok: 'bg-gray-900 dark:bg-gray-100',
    offline: 'bg-gray-400 dark:bg-gray-500',
    error: 'bg-gray-400 dark:bg-gray-500',
  }[status];

  return (
    <>
      <Header onHelp={() => setShowHelp(true)} />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        {/* Section head */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-4 border-b border-gray-200 pb-5 dark:border-gray-800">
          <div className="min-w-0">
            <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              01 / Console
            </div>
            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Answers
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone} ${
                  status === 'ok' ? 'animate-pulse' : ''
                }`}
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {statusText}
              </span>
            </div>
          </div>

          <button type="button" onClick={load} className={OUTLINE_BTN}>
            <FaSyncAlt size={9} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Empty */}
        {items.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 px-5 py-14 text-center dark:border-gray-800 sm:px-8">
            <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {status === 'connecting' ? 'Connecting' : 'Waiting'}
            </div>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Nothing yet. Highlight text on the laptop, press{' '}
              <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>M</kbd>, and the answer shows
              up here in a few seconds.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className={`${OUTLINE_BTN} mt-5`}
            >
              <FaQuestionCircle size={9} aria-hidden="true" />
              View commands
            </button>
          </div>
        ) : null}

        {/* Cards */}
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${
                freshIds.has(item.id) ? 'flash-in' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  {formatWhen(item.ts)}
                </span>
                <span className={BADGE}>{item.mode}</span>
                {item.error ? (
                  <span className={BADGE}>error</span>
                ) : (
                  <>
                    <span className={BADGE}>{item.model}</span>
                    <span className={BADGE}>{item.ms}ms</span>
                  </>
                )}
                <span className="ml-auto">
                  <CopyButton text={item.error || item.answer} />
                </span>
              </div>

              <div className="px-4 py-4 sm:px-5 sm:py-5">
                {item.selection ? (
                  <div className="mb-4 max-h-40 overflow-y-auto border-l-2 border-gray-200 pl-3 text-[13px] leading-relaxed whitespace-pre-wrap text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:pl-4">
                    {item.selection}
                  </div>
                ) : null}

                {item.error ? (
                  <p className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                    {item.error}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 sm:text-[15px]">
                    {item.answer}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Footer rule */}
        {items.length > 0 ? (
          <div className="mt-10 flex items-center gap-4">
            <span className="halftone h-1.5 flex-1" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              End of history
            </span>
            <span className="halftone h-1.5 flex-1" aria-hidden="true" />
          </div>
        ) : null}
      </main>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ header */

function Header({ onHelp }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gray-900 font-mono text-[11px] font-bold text-white dark:bg-gray-100 dark:text-gray-900"
          >
            H
          </span>
          <div className="min-w-0 leading-none">
            <div className="truncate text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              ai-hotkey
            </div>
            <div className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 sm:block">
              Answers console
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onHelp}
            aria-label="Keyboard commands"
            title="Keyboard commands"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <FaQuestionCircle size={13} aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------- copy button */

function CopyButton({ text }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className={GHOST_BTN}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard can be blocked on non-HTTPS origins.
        }
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}
