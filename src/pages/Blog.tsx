import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';
import { POSTS } from '../data/blog';

export default function Blog() {
  const { t, lang } = useLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={`${t('blog.title')} · ${t('brand.name')}`} description={t('blog.subtitle')} />

      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('blog.title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t('blog.subtitle')}</p>
      </div>

      <div className="mt-10 space-y-5">
        {POSTS.map((post, i) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="card group block p-7 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
          >
            <p className="text-xs font-medium text-muted">
              {t('blog.published', {
                date: new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              })}
            </p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight transition-colors group-hover:text-brand">
              {post.title[lang]}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">{post.description[lang]}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t('blog.readMore')}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className="ml-3 text-xs text-muted/70">{post.sections.length} {lang === 'zh' ? '节' : 'sections'}</span>
            {i === 1 && (
              <span className="float-right inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                <BookOpen size={12} />
                {lang === 'zh' ? '客观视角' : 'Balanced take'}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-br from-brand to-fuchsia-600 px-6 py-10 text-center text-white">
        <Users size={26} className="mx-auto opacity-80" />
        <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">{t('blog.takeTestCta')}</h2>
        <Link
          to="/test?mode=full"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-brand transition-transform hover:scale-105"
        >
          {t('nav.start')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
