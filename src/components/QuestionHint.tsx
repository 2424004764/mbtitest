import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import { hintFor } from '../data/hints';

const BUBBLE_W = 300; // px, clamped down to viewport on small screens
const MARGIN = 14; // px, kept clear of viewport edges

/**
 * "?" bubble next to a question, showing its clarifying hint.
 * Interaction is click-based everywhere (identical on mouse and touch):
 * click the icon to toggle, click anywhere else / Esc to close.
 * Keyboard users get a preview on focus — but only for keyboard focus
 * (e.detail === 0), so a mouse click never double-fires open+close.
 */
export default function QuestionHint({ id }: { id: number }) {
  const { lang } = useLang();
  const [pos, setPos] = useState<{ top: number; left: number; width: number; arrowLeft: number } | null>(null);
  const [pinned, setPinned] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const visibleRef = useRef(false);

  const hint = hintFor(id, lang);

  useEffect(() => {
    visibleRef.current = pos !== null;
  }, [pos]);

  const place = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(BUBBLE_W, vw - MARGIN * 2);
    const iconCenter = r.left + r.width / 2;
    const left = Math.min(Math.max(MARGIN, iconCenter - width / 2), vw - width - MARGIN);
    setPos({ top: r.bottom + 10, left, width, arrowLeft: iconCenter - left });
  };

  const close = () => {
    setPinned(false);
    setPos(null);
  };

  // reset when the question changes
  useEffect(() => {
    setPinned(false);
    setPos(null);
  }, [id]);

  useEffect(() => {
    if (!pinned) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || tipRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pinned]);

  if (!hint) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={lang === 'zh' ? '题目释义' : 'What does this question mean?'}
        aria-expanded={visibleRef.current}
        onClick={(e) => {
          e.stopPropagation();
          // mouse click toggles; keyboard Enter pins the focus-preview open
          if (visibleRef.current && e.detail > 0) {
            close();
          } else {
            setPinned(true);
            place();
          }
        }}
        onFocus={() => {
          // keyboard focus only (:focus-visible) — mouse focus must not pre-open,
          // or the following click would immediately close what it just opened
          if (btnRef.current?.matches(':focus-visible')) place();
        }}
        onBlur={() => {
          if (!pinned) setPos(null);
        }}
        className="ml-1.5 inline-flex h-[22px] w-[22px] translate-y-[-1px] items-center justify-center rounded-full border border-line bg-surface2 text-[11px] font-bold text-muted transition-all hover:scale-110 hover:border-brand hover:bg-brand-soft hover:text-brand"
      >
        ?
      </button>

      {pos && (
        <span
          ref={tipRef}
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-40 rounded-xl border border-line bg-surface p-3.5 text-left text-xs font-normal leading-relaxed text-muted shadow-xl animate-fade-in"
        >
          <span
            aria-hidden="true"
            style={{ left: Math.min(Math.max(pos.arrowLeft, 14), pos.width - 14) }}
            className="absolute -top-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-line bg-surface"
          />
          {hint}
        </span>
      )}
    </>
  );
}
