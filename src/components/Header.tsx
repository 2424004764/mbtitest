import { NavLink } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { useLang } from '../i18n';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [menuOpen]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3.5 ${
      isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
    }`;

  return (
    <header className="glass sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <NavLink to="/" className="flex min-w-0 items-center gap-2.5">
          <Logo />
          {/* short brand on phones so the nav never gets squeezed into wrapping */}
          <span className="whitespace-nowrap text-[15px] font-bold tracking-tight sm:hidden">
            MBTI
          </span>
          <span className="hidden whitespace-nowrap text-base font-bold tracking-tight sm:inline">
            {t('brand.name')}
          </span>
        </NavLink>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <NavLink to="/test" className={linkCls}>
            {t('nav.test')}
          </NavLink>
          <NavLink to="/types" className={linkCls}>
            {t('nav.types')}
          </NavLink>
          <NavLink to="/compatibility" className={linkCls}>
            {t('nav.pair')}
          </NavLink>

          {/* more: quizzes + blog + about (dropdown so phones stay tidy) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3.5 ${
                menuOpen ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
              }`}
              aria-expanded={menuOpen}
              aria-label="More"
            >
              <Menu size={15} className="sm:hidden" />
              <span className="hidden sm:inline">{t('nav.more')}</span>
              <ChevronDown size={13} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
                {[
                  { to: '/quiz/enneagram', label: '⑨ ' + (lang === 'zh' ? '九型人格测试' : 'Enneagram Test') },
                  { to: '/quiz/bigfive', label: '⑤ ' + (lang === 'zh' ? '大五人格测试' : 'Big Five Test') },
                  { to: '/quiz/lovelang', label: '♥ ' + (lang === 'zh' ? '爱的语言测试' : 'Love Languages') },
                  { to: '/blog', label: t('nav.blog') },
                  { to: '/about', label: t('nav.about') },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface2 hover:text-ink'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <div className="ml-1.5 flex items-center gap-1.5 sm:ml-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="rounded-full border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
              aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              type="button"
              onClick={toggle}
              className="rounded-full border border-line bg-surface p-2 text-muted transition-colors hover:border-brand hover:text-brand"
              aria-label={isDark ? 'Switch to light theme' : '切换深色主题'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
