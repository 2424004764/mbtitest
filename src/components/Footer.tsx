import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useLang } from '../i18n';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-bold">{t('brand.name')}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('footer.disclaimer')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t('footer.links')}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-muted transition-colors hover:text-brand" to="/test">{t('nav.test')}</Link></li>
            <li><Link className="text-muted transition-colors hover:text-brand" to="/types">{t('nav.types')}</Link></li>
            <li><Link className="text-muted transition-colors hover:text-brand" to="/compatibility">{t('nav.pair')}</Link></li>
            <li><Link className="text-muted transition-colors hover:text-brand" to="/blog">{t('nav.blog')}</Link></li>
            <li><Link className="text-muted transition-colors hover:text-brand" to="/about">{t('nav.about')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t('about.privacyTitle')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('footer.privacy')}</p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {t('brand.name')} ·{' '}
        <a
          href="https://tool.fologde.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-brand"
        >
          {t('footer.poweredBy')}
        </a>{' '}
        · {t('footer.langAuto')}
      </div>
    </footer>
  );
}
