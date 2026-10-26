import { useEffect, useMemo, useRef, useState } from 'react';
import { Fragment } from 'react';
import ImageLightbox from './ImageLightbox.jsx';

function chronologyValue(date) {
  if (typeof date === 'number' && Number.isFinite(date)) return date;
  const value = String(date ?? '').trim();
  // World-history BCE dates are stored as negative years, including when JSON
  // provides them as strings (for example, "-3300").
  const match = value.match(/^\s*(?:c\.?\s*)?(-?\d{1,6})/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function displayDate(event) {
  if (event?.dateLabel) return event.dateLabel;
  const value = chronologyValue(event?.date);
  if (!Number.isFinite(value)) return String(event?.date ?? 'Date non précisée');
  return value < 0 ? `${Math.abs(value)} av. J.-C.` : String(value);
}

function normalizeItems(value) {
  if (value == null || value === '') return [];
  const items = Array.isArray(value) ? value : [value];
  return items.map((item, index) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { key: `${index}-${item}`, label: String(item), description: '' };
    }
    if (!item || typeof item !== 'object') return null;
    const label = item.term ?? item.name ?? item.title ?? item.label ?? item.actor ?? item.concept ?? '';
    const description = item.description ?? item.definition ?? item.explanation ?? item.role ?? item.context ?? '';
    const fallback = Object.entries(item)
      .filter(([key]) => !['description', 'definition', 'explanation', 'role', 'context'].includes(key))
      .map(([, entry]) => typeof entry === 'string' || typeof entry === 'number' ? String(entry) : '')
      .filter(Boolean)
      .join(' · ');
    return {
      key: `${index}-${String(label || fallback || 'item')}`,
      label: String(label || fallback),
      description: typeof description === 'string' ? description : '',
    };
  }).filter((item) => item?.label);
}

function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

function DetailList({ value }) {
  const items = normalizeItems(value);
  if (!items.length) return null;
  return (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          {item.label}{item.description ? ` — ${item.description}` : ''}
        </li>
      ))}
    </ul>
  );
}

function DetailSection({ title, children }) {
  if (!children) return null;
  return (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ArchiveVisual({ visual, title, onImageOpen }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = safeHttpUrl(visual?.url);
  const sourceUrl = safeHttpUrl(typeof visual?.source === 'string' ? visual.source : visual?.source?.url);
  const sourceName = typeof visual?.source === 'object' ? visual.source.title || visual.source.publisher : '';
  const licenseUrl = safeHttpUrl(visual?.licenseUrl || visual?.rightsUrl);
  const documented = Boolean(imageUrl && visual?.alt && visual?.credit && visual?.license && (sourceUrl || sourceName));

  if (!documented || failed) {
    return (
      <figure className="archive-visual archive-visual-missing">
        <div className="archive-visual-placeholder" role="img" aria-label={`Document d’archive indisponible pour ${title}`}>
          <span aria-hidden="true">✳</span>
          <small>VISUEL D’ARCHIVE À CONSULTER</small>
        </div>
        <figcaption>Visuel documenté indisponible pour cette fiche.</figcaption>
      </figure>
    );
  }

  return (
    <figure className="archive-visual">
      <button className="archive-image-open" type="button" onClick={() => onImageOpen?.(visual)} aria-label={`Agrandir : ${visual.alt}`}>
        <img src={imageUrl} alt={visual.alt} loading="lazy" onError={() => setFailed(true)} />
        <span aria-hidden="true">Agrandir l’image ⤢</span>
      </button>
      <figcaption>
        <span className="archive-caption">{visual.caption || visual.alt}</span>
        <span className="archive-credit">{visual.credit}{visual.title ? <> · <cite>{visual.title}</cite></> : ''}</span>
        <span className="archive-rights">
          Licence : {licenseUrl ? <a href={licenseUrl} target="_blank" rel="noopener noreferrer">{visual.license}</a> : visual.license}
          {' · '}{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceName || 'Consulter la source'}</a> : sourceName}
        </span>
      </figcaption>
    </figure>
  );
}

function ArchiveFilm({ film }) {
  const embedUrl = safeHttpUrl(film?.embedUrl);
  if (!embedUrl) return null;
  return (
    <section className="archive-film" aria-label={`Film d’archives : ${film.title}`}>
      <h3>Film d’archives</h3>
      {film.warning && <p className="film-warning">À savoir : {film.warning}</p>}
      {film.context && <p>{film.context}</p>}
      <iframe src={embedUrl} title={film.title} loading="lazy" allow="fullscreen" />
      <p className="film-credit">{film.title} · {film.credit} · {film.license}</p>
      {safeHttpUrl(film.sourceUrl) && <a href={film.sourceUrl} target="_blank" rel="noopener noreferrer">Consulter la notice et les droits</a>}
    </section>
  );
}

function TimelineDetail({ event, world, leadership, onClose, closeRef, onImageOpen, relatedLeaders = [], onLeaderOpen, onBackToEvent }) {
  const concepts = normalizeItems(event.concepts);
  const scope = [event.period, world ? event.region : ''].filter(Boolean).join(' · ');
  const sources = Array.isArray(event.sources) ? event.sources : event.sources ? [event.sources] : [];

  return (
    <div className="detail-overlay" role="presentation" onClick={onClose}>
    <article className="detail-card event-detail-dialog" role="dialog" aria-modal="true" aria-labelledby={`detail-title-${event.id}`} onClick={(click) => click.stopPropagation()} onKeyDown={(key) => key.key === 'Escape' && onClose()}>
      <button ref={closeRef} className="overlay-close" type="button" onClick={onClose} aria-label="Fermer les détails de l’événement">×</button>
      {onBackToEvent && <button className="detail-back-link" type="button" onClick={onBackToEvent}>← Retour à l’occupation</button>}
      <div className="detail-card-top">
        <span className="detail-tag">{leadership ? `${event.officeTitle || 'Autorité politique'} · ${scope}` : scope || (world ? 'Repère mondial' : 'Repère historique')}</span>
        <time className="detail-date">{displayDate(event)}</time>
      </div>
      <h2 id={`detail-title-${event.id}`}>{event.title || 'Repère historique'}</h2>
      {event.summary && <p className="detail-summary">{event.summary}</p>}
      <ArchiveVisual key={event.id} visual={event.visual} title={event.title || 'ce repère'} onImageOpen={onImageOpen} />
      {Array.isArray(event.gallery) && event.gallery.length > 0 && (
        <section className="archive-gallery" aria-label={`Autres images et documents : ${event.title}`}>
          <h3>Autres images et documents</h3>
          <div>{event.gallery.map((visual, index) => <ArchiveVisual key={`${event.id}-gallery-${index}`} visual={visual} title={event.title || 'ce repère'} onImageOpen={onImageOpen} />)}</div>
        </section>
      )}
      {relatedLeaders.length > 0 && (
        <section className="occupation-leaders" aria-label="Présidents pendant l’occupation américaine">
          <div className="occupation-leaders-heading"><span>PORTRAITS ET PARCOURS</span><h3>Les présidents haïtiens de l’occupation</h3><p>Choisis un portrait pour ouvrir sa fiche, ses réalisations et les limites de son gouvernement.</p></div>
          <div className="occupation-leader-grid">
            {relatedLeaders.map((leader) => (
              <button className="occupation-leader-card" type="button" key={leader.id} onClick={() => onLeaderOpen?.(leader.id)} aria-label={`Découvrir ${leader.title}, ${leader.dateLabel}`}>
                {leader.visual?.url ? <img src={leader.visual.url} alt={`Portrait de ${leader.title}`} loading="lazy" /> : <span className="occupation-leader-placeholder" aria-hidden="true">{leader.title?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>}
                <span><strong>{leader.title}</strong><small>{leader.dateLabel}</small><em>Découvrir la fiche ↗</em></span>
              </button>
            ))}
          </div>
        </section>
      )}
      <ArchiveFilm film={event.film} />
      <div className="detail-divider" />
      <div className="detail-sections">
        <DetailSection title="Contexte">{event.context && <p>{event.context}</p>}</DetailSection>
        <DetailSection title="Acteurs"><DetailList value={event.actors} /></DetailSection>
        <DetailSection title="Causes"><DetailList value={event.causes} /></DetailSection>
        <DetailSection title="Déroulement">{event.development && <p>{event.development}</p>}</DetailSection>
        <DetailSection title="Conséquences">{event.consequences && <p>{event.consequences}</p>}</DetailSection>
        <DetailSection title="Réalisations documentées"><DetailList value={event.achievements} /></DetailSection>
        <DetailSection title="Limites et controverses"><DetailList value={event.limitations} /></DetailSection>
        <DetailSection title="Lien avec le programme haïtien">{event.curriculum && <p>{event.curriculum}</p>}</DetailSection>
        <DetailSection title="Question d’enquête"><p className="uncertainty-note">{event.learningPrompt || 'Compare les sources : qui les a produites, à quelle date et dans quel but ? Qu’est-ce qui est établi, interprété ou encore discuté ?'}</p></DetailSection>
        <DetailSection title="Notions">
          {concepts.length > 0 && (
            <div className="concept-pills">
              {concepts.map((concept) => (
                <span className="concept-pill" key={concept.key}>
                  {concept.label}{concept.description ? ` — ${concept.description}` : ''}
                </span>
              ))}
            </div>
          )}
        </DetailSection>
        <DetailSection title="Incertitudes">
          {event.uncertainty && <p className="uncertainty-note">{event.uncertainty}</p>}
        </DetailSection>
        <DetailSection title="Sources">
          {sources.length > 0 && (
            <div className="source-list">
              {sources.map((source, index) => {
                const url = safeHttpUrl(source?.url);
                const title = source?.title || source?.name || 'Source consultée';
                const publisher = source?.publisher || source?.institution;
                return (
                  <div key={`${title}-${index}`}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
                    ) : <span>{title}</span>}
                    {publisher && <p>{publisher}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </DetailSection>
      </div>
    </article>
    </div>
  );
}

function TimelineExplorer({
  events = [],
  selectedEventId,
  onSelected,
  onBack,
  title,
  description,
  world = false,
  leadership = false,
  relatedLeaders = [],
  onBackLabel,
}) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [openEventId, setOpenEventId] = useState(null);
  const [openLeaderId, setOpenLeaderId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const closeEventRef = useRef(null);
  const returnFocusRef = useRef(null);

  const orderedEvents = useMemo(() => (
    (Array.isArray(events) ? events : [])
      .map((event, index) => ({ event, index, order: chronologyValue(event?.date) }))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(({ event }) => event)
  ), [events]);

  const periods = useMemo(() => (
    [...new Set(orderedEvents.map((event) => event.period).filter((value) => typeof value === 'string' && value.trim()))]
      .sort((a, b) => a.localeCompare(b, 'fr'))
  ), [orderedEvents]);

  const regions = useMemo(() => (
    [...new Set(orderedEvents.map((event) => event.region).filter((value) => typeof value === 'string' && value.trim()))]
      .sort((a, b) => a.localeCompare(b, 'fr'))
  ), [orderedEvents]);

  const visibleEvents = useMemo(() => orderedEvents.filter((event) => (
    (periodFilter === 'all' || event.period === periodFilter)
    && (!world || regionFilter === 'all' || event.region === regionFilter)
  )), [orderedEvents, periodFilter, regionFilter, world]);

  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) || visibleEvents[0] || null;
  const openEvent = visibleEvents.find((event) => event.id === openEventId) || null;
  const openLeader = relatedLeaders.find((leader) => leader.id === openLeaderId) || null;
  const detailEvent = openLeader || openEvent;
  const occupationPresidents = !leadership && openEvent?.id === 'occupation-americaine-1915-1934'
    ? ['dartiguenave', 'borno', 'roy', 'vincent'].map((id) => relatedLeaders.find((leader) => leader.id === id)).filter(Boolean)
    : [];

  useEffect(() => {
    if (selectedEvent && selectedEvent.id !== selectedEventId) onSelected?.(selectedEvent.id);
  }, [onSelected, selectedEvent, selectedEventId]);

  useEffect(() => {
    if (!openEvent) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeEventRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [openEvent]);

  const closeEvent = () => {
    setOpenEventId(null);
    setOpenLeaderId(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <section className="explorer-page" aria-label={title || 'Chronologie'}>
      <div className="explorer-topline">
        <button className="back-link" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span>{onBackLabel || 'Retour'}
        </button>
      </div>

      <header className="explorer-heading">
        <span className="section-kicker">{title}</span>
        <h1>{leadership ? 'Chefs d’État, régimes et transitions' : world ? 'Repères de l’histoire du monde' : 'La chronologie d’Haïti'}</h1>
        {description && <p>{description}</p>}
      </header>

      <div className="explorer-controls" aria-label="Filtres de la chronologie">
        <label className="filter-field">
          Période
          <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
            <option value="all">Toutes les périodes</option>
            {periods.map((period) => <option value={period} key={period}>{period}</option>)}
          </select>
        </label>
        {world && (
          <label className="filter-field">
            Région
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option value="all">Toutes les régions</option>
              {regions.map((region) => <option value={region} key={region}>{region}</option>)}
            </select>
          </label>
        )}
        <span className="filter-count" aria-live="polite">
          {visibleEvents.length} {visibleEvents.length > 1 ? 'repères' : 'repère'}
        </span>
      </div>

      {visibleEvents.length ? (
        <div className="timeline-layout">
          <div className="timeline-list" role="list" aria-label="Événements classés par ordre chronologique">
            {visibleEvents.map((event, index) => (
              <Fragment key={event.id || `${event.date}-${event.title}`}>
              {event.period && (index === 0 || visibleEvents[index - 1]?.period !== event.period) && (
                <div className="timeline-era-break" role="separator" aria-label={event.period}>
                  <span>{event.period}</span>
                </div>
              )}
              <div className={`timeline-event${selectedEvent?.id === event.id ? ' selected' : ''}`} role="listitem">
                <button className="timeline-thumb" type="button" onClick={() => event.visual?.url && setLightboxImage(event.visual)} aria-label={`Agrandir l’image : ${event.title}`} disabled={!event.visual?.url}>
                  {event.visual?.url ? <img src={event.visual.url} alt="" loading="lazy" /> : <span>✳</span>}
                  {event.film && <small>FILM</small>}
                </button>
                <button className="timeline-event-main" type="button" onClick={(click) => { onSelected?.(event.id); returnFocusRef.current = click.currentTarget; setOpenEventId(event.id); }} aria-label={`Ouvrir les informations : ${event.title}, ${displayDate(event)}`}>
                <time className="timeline-date">{displayDate(event)}</time>
                <span className="timeline-event-copy">
                  <span className="timeline-period">{leadership ? event.officeTitle : world && event.region ? `${event.period || 'Repère'} · ${event.region}` : event.period}</span>
                  <strong>{event.title}</strong>
                  {event.summary && <small>{event.summary}</small>}
                </span>
                <span className="timeline-chevron" aria-hidden="true">›</span>
                </button>
              </div>
              </Fragment>
            ))}
          </div>
          {detailEvent && <TimelineDetail event={detailEvent} world={world} leadership={Boolean(openLeader) || leadership} onClose={closeEvent} closeRef={closeEventRef} onImageOpen={setLightboxImage} relatedLeaders={openLeader ? [] : occupationPresidents} onLeaderOpen={setOpenLeaderId} onBackToEvent={openLeader ? () => setOpenLeaderId(null) : null} />}
        </div>
      ) : (
        <p className="empty-state" role="status">Aucun repère ne correspond à ces filtres.</p>
      )}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}

export default TimelineExplorer;
