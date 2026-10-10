import { BookOpenText, FlaskConical, Globe, ShieldCheck, TriangleAlert } from 'lucide-react';
import Seo from '../components/Seo';
import { useLang } from '../i18n';

export default function About() {
  const { t } = useLang();

  const sections = [
    { icon: BookOpenText, title: t('about.introTitle'), paras: [t('about.introP1'), t('about.introP2')] },
    { icon: FlaskConical, title: t('about.methodTitle'), paras: [t('about.methodP1'), t('about.methodP2')] },
    { icon: ShieldCheck, title: t('about.privacyTitle'), paras: [t('about.privacyP')] },
    { icon: Globe, title: t('about.sourceTitle'), paras: [t('about.sourceP')] },
    { icon: TriangleAlert, title: t('about.disclaimerTitle'), paras: [t('about.disclaimerP')] },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={`${t('about.title')} · ${t('brand.name')}`} />

      <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="text-gradient">{t('about.title')}</span>
      </h1>

      <div className="mt-10 space-y-5">
        {sections.map(({ icon: Icon, title, paras }) => (
          <section key={title} className="card p-7">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon size={17} />
              </span>
              {title}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/90 sm:text-[15px]">
              {paras.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
