import { useMemo } from 'react';
import { GlowCard } from '../../ui/GlowCard.jsx';
import { SkillIcon } from '../../ui/Media.jsx';
import { SKILL_LEVELS } from '../../../utils/constants.js';
import { SectionHead } from '../shared.jsx';

const LEVEL_KEYS = ['experto', 'avanzado', 'intermedio', 'basico'];
const levelIndex = (l) => Object.keys(SKILL_LEVELS).indexOf(l) + 1; // 1..4

function Dots({ level }) {
  const n = levelIndex(level);
  return (
    <span className="pf-dots" aria-label={SKILL_LEVELS[level]?.label}>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} />
      ))}
    </span>
  );
}

function Ring({ value }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg className="pf-ring" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r={r} className="pf-ring__track" />
      <circle cx="36" cy="36" r={r} className="pf-ring__fill" style={{ '--len': c, '--val': (value / 100) * c }} />
    </svg>
  );
}

/** Habilidades: 5 plantillas. */
export function SkillsSection({ layout, skills }) {
  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((s) => {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category).push(s);
    });
    return [...map.entries()];
  }, [skills]);

  const head = <SectionHead eyebrow="Stack" title={<>Mis <span className="gradient-text">habilidades</span></>} />;
  const delay = (i) => ({ '--delay': `${(i % 3) * 90}ms` });

  if (layout === 'chips') {
    return (
      <section className="pf-section" id="habilidades">
        {head}
        <div className="pf-chipgroups">
          {groups.map(([cat, list], gi) => (
            <div key={cat} className="pf-chipgroup reveal" style={delay(gi)}>
              <h3 className="pf-skill-group__title">{cat}</h3>
              <div className="pf-chipgroup__list">
                {list.map((s) => (
                  <span key={s.id} className="pf-skillchip">
                    {s.icon && !s.icon.startsWith('http') && !s.icon.startsWith('/') && <span>{s.icon}</span>}
                    {s.name}
                    <Dots level={s.level} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'mosaico') {
    return (
      <section className="pf-section" id="habilidades">
        {head}
        <div className="pf-mosaic">
          {skills.map((s, i) => (
            <GlowCard key={s.id} className="pf-mosaic__tile reveal" style={{ '--delay': `${(i % 6) * 50}ms` }}>
              <SkillIcon skill={s} size={56} />
              <strong>{s.name}</strong>
              <span className="pf-mosaic__cat">{s.category}</span>
              <Dots level={s.level} />
            </GlowCard>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'anillos') {
    return (
      <section className="pf-section" id="habilidades">
        {head}
        <div className="pf-rings">
          {skills.map((s, i) => (
            <div key={s.id} className="pf-rings__item reveal" style={{ '--delay': `${(i % 6) * 50}ms` }}>
              <div className="pf-rings__circle">
                <Ring value={SKILL_LEVELS[s.level]?.value || 0} />
                <span className="pf-rings__icon">
                  <SkillIcon skill={s} size={36} />
                </span>
              </div>
              <strong>{s.name}</strong>
              <span className="pf-mosaic__cat">{SKILL_LEVELS[s.level]?.label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'niveles') {
    const byLevel = LEVEL_KEYS.map((l) => [l, skills.filter((s) => s.level === l)]).filter(([, l]) => l.length);
    return (
      <section className="pf-section" id="habilidades">
        {head}
        <div className="pf-levels">
          {byLevel.map(([level, list], i) => (
            <div key={level} className="pf-levels__row reveal" style={{ '--delay': `${i * 80}ms` }}>
              <div className="pf-levels__label">
                <Dots level={level} />
                <strong>{SKILL_LEVELS[level].label}</strong>
              </div>
              <div className="pf-chipgroup__list">
                {list.map((s) => (
                  <span key={s.id} className="pf-skillchip pf-skillchip--lg">
                    <SkillIcon skill={s} size={28} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // barras (por defecto)
  return (
    <section className="pf-section" id="habilidades">
      {head}
      <div className="pf-skills">
        {groups.map(([cat, list], gi) => (
          <GlowCard key={cat} className="pf-skill-group reveal" style={delay(gi)}>
            <h3 className="pf-skill-group__title">{cat}</h3>
            <div className="pf-skill-list">
              {list.map((s) => (
                <div key={s.id} className="pf-skill">
                  <SkillIcon skill={s} />
                  <div className="skill-row__main">
                    <div className="skill-row__name">
                      {s.name}
                      <span className="skill-row__level">{SKILL_LEVELS[s.level]?.label}</span>
                    </div>
                    <div className="level-bar">
                      <div className="level-bar__fill pf-level" style={{ '--w': `${SKILL_LEVELS[s.level]?.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        ))}
      </div>
    </section>
  );
}
