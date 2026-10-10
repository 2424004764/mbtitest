import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';
import { POSTS } from '../data/blog';
import { SITE_URL } from '../lib/site';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { t, lang } = useLang();

  const idx = POSTS.findIndex((p) => p.slug === slug);
  const post = POSTS[idx];

  if (!post) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold">{t('blog.notFound')}</p>
        <Link to="/blog" className="btn-primary mt-6">
          {t('blog.backToList')}
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? POSTS[idx - 1] : null;
  const next = idx < POSTS.length - 1 ? POSTS[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Seo
        title={`${post.title[lang]} · ${t('brand.name')}`}
        description={post.description[lang]}
        jsonLd={[
          {
            '@type': 'Article',
            headline: post.title[lang],
            datePublished: post.date,
            inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
            mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
            description: post.description[lang],
          },
        ]}
      />

      <Link to="/blog" className="btn-secondary !px-4 !py-2 text-xs">
        <ChevronLeft size={14} />
        {t('blog.backToList')}
      </Link>

      <article className="mt-8">
        <p className="text-xs font-medium text-muted">
          {t('blog.published', {
            date: new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          })}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {post.title[lang]}
        </h1>
        <p className="mt-4 border-l-4 border-brand/60 pl-4 text-[15px] leading-relaxed text-muted">
          {post.description[lang]}
        </p>

        <div className="mt-10 space-y-10">
          {post.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                <span className="mr-2.5 font-mono text-base text-brand">{String(i + 1).padStart(2, '0')}</span>
                {sec.h[lang]}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-[1.9] text-ink/90">
                {sec.p[lang].map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <div className="mt-14 rounded-2xl bg-gradient-to-br from-brand to-fuchsia-600 p-8 text-center text-white">
        <h2 className="text-xl font-extrabold">{t('blog.takeTestCta')}</h2>
        <Link
          to="/test?mode=full"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand transition-transform hover:scale-105"
        >
          <ArrowRight size={16} />
          {t('nav.start')}
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="card group flex items-center gap-2 p-4 text-sm transition-all hover:border-brand">
            <ChevronLeft size={16} className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{prev.title[lang]}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/blog/${next.slug}`} className="card group flex items-center justify-end gap-2 p-4 text-right text-sm transition-all hover:border-brand">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{next.title[lang]}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        <ArrowLeft size={12} className="mr-1 inline" />
        <Link to="/blog" className="transition-colors hover:text-brand">
          {t('blog.backToList')}
        </Link>
      </p>
    </div>
  );
}
