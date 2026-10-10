import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Seo title={`404 · ${t('brand.name')}`} noindex />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Compass size={28} />
      </div>
      <h1 className="mt-6 font-mono text-5xl font-extrabold tracking-tight">404</h1>
      <p className="mt-3 text-lg font-semibold">{t('notFound.title')}</p>
      <p className="mt-2 text-sm text-muted">{t('notFound.desc')}</p>
      <Link to="/" className="btn-primary mt-8">
        {t('common.backHome')}
      </Link>
    </div>
  );
}
