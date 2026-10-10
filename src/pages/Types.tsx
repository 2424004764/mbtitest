import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Seo from '../components/Seo';
import TypeCard from '../components/TypeCard';
import { useLang } from '../i18n';
import { useTypesData } from '../hooks/useBank';
import { ALL_TYPES, DIMENSIONS, typeColor } from '../data/dimensions';
import { SITE_URL } from '../lib/site';
import type { Dim } from '../data/schema';

const FILTER_LETTERS: { letter: string; dim: Dim }[] = [
  { letter: 'E', dim: 'EI' },
  { letter: 'I', dim: 'EI' },
  { letter: 'S', dim: 'SN' },
  { letter: 'N', dim: 'SN' },
  { letter: 'T', dim: 'TF' },
  { letter: 'F', dim: 'TF' },
  { letter: 'J', dim: 'JP' },
  { letter: 'P', dim: 'JP' },
];

export default function Types() {
  const { t, lang } = useLang();
  const types = useTypesData();
  const [filter, setFilter] = useState<string | null>(null);

  const visible = useMemo(
    () => ALL_TYPES.filter((code) => !filter || code.includes(filter)),
    [filter],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Seo
        title={`${t('types.title')} · ${t('brand.name')}`}
        description={t('types.subtitle')}
        jsonLd={[
          {
            '@type': 'ItemList',
            name: t('types.title'),
            numberOfItems: ALL_TYPES.length,
            itemListElement: ALL_TYPES.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/type/${c}`,
              name: types?.[c] ? `${c} ${types[c].name}` : c,
            })),
          },
        ]}
      />

      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">{t('types.title')}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">{t('types.subtitle')}</p>
      </div>

      {/* filters */}
      <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted">{t('types.filterHint')}:</span>
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            filter === null ? 'bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md' : 'border border-line bg-surface text-muted hover:border-brand hover:text-brand'
          }`}
        >
          {t('types.filterAll')}
        </button>
        {FILTER_LETTERS.map(({ letter, dim }) => {
          const meta = DIMENSIONS.find((d) => d.key === dim)!;
          const isLeft = meta.left === letter;
          const label = (isLeft ? meta.leftLabel : meta.rightLabel)[lang];
          const active = filter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => setFilter(active ? null : letter)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                active
                  ? 'bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md'
                  : 'border border-line bg-surface text-muted hover:border-brand hover:text-brand'
              }`}
            >
              <span className="font-mono">{letter}</span>
              <span className="ml-1.5 font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {/* grid */}
      {types ? (
        <motion.div layout className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((code) => (
            <TypeCard key={code} info={types[code]} color={typeColor(code)} />
          ))}
        </motion.div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((c) => (
            <div key={c} className="card h-36 animate-pulse bg-surface2/50" />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link to="/test?mode=full" className="btn-primary">
          {t('types.takeTest')}
        </Link>
      </div>
    </div>
  );
}
