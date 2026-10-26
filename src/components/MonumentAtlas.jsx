import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import ImageLightbox from './ImageLightbox.jsx';
const Monument3D = lazy(() => import('./Monument3D.jsx'));

const uniqueValues = (places, field) => [...new Set(places.map((place) => place[field]).filter((value) => typeof value === 'string' && value.trim()))]
  .sort((a, b) => a.localeCompare(b, 'fr'));

function Schematic({ title }) {
  return (
    <div className="place-art" role="img" aria-label={`Illustration schématique, pas une photographie historique : ${title}`}>
      <span className="place-schematic" aria-hidden="true">⌂</span>
      <span className="place-art-label">Schéma · pas une photographie historique</span>
    </div>
  );
}

function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function PlaceVisual({ visual, title, detail = false, onImageOpen }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = safeHttpUrl(visual?.url);
  const sourceUrl = safeHttpUrl(typeof visual?.source === 'string' ? visual.source : visual?.source?.url);
  const sourceName = typeof visual?.source === 'object' ? visual.source.title || visual.source.publisher : '';
  const licenseUrl = safeHttpUrl(visual?.licenseUrl || visual?.rightsUrl);
  const hasDocumentedRights = Boolean(visual?.credit && visual?.license && (sourceUrl || sourceName));

  if (!imageUrl || !visual?.alt || !hasDocumentedRights || failed) {
    return (
      <>
        <Schematic title={title} />
        {detail && <p className="image-credit">Illustration schématique, pas une photographie historique.</p>}
      </>
    );
  }

  return (
    <>
      <button className={`place-art image-zoom-trigger${detail ? ' place-art-detail' : ''}`} type="button" onClick={() => onImageOpen?.(visual)} aria-label={`Agrandir : ${visual.alt}`}>
        <img
          src={imageUrl}
          alt={visual.alt}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span aria-hidden="true">Agrandir l’image ⤢</span>
      </button>
      <p className="image-credit">
        {visual.caption && <><span className="image-caption">{visual.caption}</span><br /></>}
        {visual.credit}{visual.title && <> · <cite>{visual.title}</cite></>}
        {' · '}Licence : {licenseUrl ? <a href={licenseUrl} target="_blank" rel="noopener noreferrer">{visual.license}</a> : visual.license}
        {' · '}{sourceUrl
          ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceName || 'Source de l’image'}</a>
          : `Source : ${sourceName}`}
      </p>
    </>
  );
}

function sourceLabel(source) {
  if (typeof source === 'string') return { label: source, url: '' };
  if (!source || typeof source !== 'object') return null;
  const label = source.title || source.name || source.institution || source.url;
  return label ? { label, url: safeHttpUrl(source.url) } : null;
}

function confirmedHeritageStatus(status) {
  if (typeof status === 'object' && status !== null && status.confirmed === true) {
    return status.label || status.status || status.name || '';
  }
  return '';
}

function MonumentAtlas({ places = [], selectedPlaceId, onSelected, onBack }) {
  const [region, setRegion] = useState('');
  const [period, setPeriod] = useState('');
  const [siteType, setSiteType] = useState('');
  const [openPlaceId, setOpenPlaceId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const closePlaceRef = useRef(null);
  const returnFocusRef = useRef(null);

  const regions = useMemo(() => uniqueValues(places, 'region'), [places]);
  const periods = useMemo(() => uniqueValues(places, 'period'), [places]);
  const types = useMemo(() => uniqueValues(places, 'siteType'), [places]);
  const filteredPlaces = useMemo(() => places.filter((place) => (
    (!region || place.region === region)
    && (!period || place.period === period)
    && (!siteType || place.siteType === siteType)
  )), [places, region, period, siteType]);
  const selectedPlace = filteredPlaces.find((place) => place.id === openPlaceId) || null;
  const selectedCardId = filteredPlaces.some((place) => place.id === selectedPlaceId) ? selectedPlaceId : '';

  useEffect(() => {
    if (!selectedPlace) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closePlaceRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedPlace]);

  const closePlace = () => {
    setOpenPlaceId(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  const renderFilter = (label, value, setValue, options) => (
    <label className="filter-field" key={label}>
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="">Toutes</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );

  return (
    <section className="explorer-page" aria-labelledby="monument-heading">
      <div className="explorer-topline">
        <button className="back-link" onClick={onBack}>
          <span aria-hidden="true">←</span> Retour à l’accueil
        </button>
      </div>

      <header className="explorer-heading">
        <span className="section-kicker">ATLAS DES LIEUX</span>
        <h1 id="monument-heading">Monuments et lieux historiques</h1>
        <p>Explore des lieux d’Haïti et du monde, leur époque, leurs usages et ce qu’ils nous apprennent.</p>
      </header>

      <div className="explorer-controls" aria-label="Filtres des lieux historiques">
        {renderFilter('Région', region, setRegion, regions)}
        {renderFilter('Période', period, setPeriod, periods)}
        {renderFilter('Type de lieu', siteType, setSiteType, types)}
        <span className="filter-count" aria-live="polite">{filteredPlaces.length} lieu{filteredPlaces.length === 1 ? '' : 'x'}</span>
      </div>

      {filteredPlaces.length ? (
        <div className="atlas-layout">
          <div className="place-grid" aria-label="Lieux historiques">
            {filteredPlaces.map((place) => {
              const title = place.title || place.name || 'Lieu historique';
              const selected = selectedCardId === place.id;
              return (
                <article
                  className={`place-card${selected ? ' selected' : ''}`}
                  key={place.id}
                >
                  <PlaceVisual visual={place.visual} title={title} onImageOpen={setLightboxImage} />
                  <button className="place-body place-details-trigger" type="button" onClick={(click) => { onSelected?.(place.id); returnFocusRef.current = click.currentTarget; setOpenPlaceId(place.id); }} aria-label={`Ouvrir la fiche : ${title}`}>
                    <span className="place-meta"><span>{place.dateLabel || 'Date à préciser'}</span><span>{place.siteType || 'Lieu'}</span></span>
                    <strong>{title}</strong>
                    <small>{place.location || place.region}</small>
                    <span className="place-open-hint">{selected ? 'Fiche affichée ↓' : 'Découvrir son histoire →'}</span>
                  </button>
                </article>
              );
            })}
          </div>

          {selectedPlace && (
            <div className="detail-overlay" role="presentation" onClick={closePlace}>
            <article id="place-detail" className="detail-card place-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="place-detail-title" onClick={(click) => click.stopPropagation()} onKeyDown={(key) => key.key === 'Escape' && closePlace()}>
              <button ref={closePlaceRef} className="overlay-close" type="button" onClick={closePlace} aria-label="Fermer les détails du lieu">×</button>
              <div className="detail-card-top">
                <span className="detail-tag">Fiche du lieu</span>
                <span className="detail-date">{selectedPlace.dateLabel || 'Date à préciser'}</span>
              </div>
              <h2 id="place-detail-title">{selectedPlace.title || selectedPlace.name || 'Lieu historique'}</h2>
              <p className="detail-summary">{selectedPlace.location}{selectedPlace.region ? ` · ${selectedPlace.region}` : ''}</p>
              <div className="detail-divider" />
              <div className="detail-sections">
                <section>
                  <h3>Époque de construction</h3>
                  <p>{selectedPlace.dateLabel || 'Date non précisée dans les sources disponibles.'}</p>
                </section>
                <section>
                  <h3>Période historique</h3>
                  <p>{selectedPlace.period || 'Période à préciser'}</p>
                </section>
                {selectedPlace.siteType && <section><h3>Type de lieu</h3><p>{selectedPlace.siteType}</p></section>}
                {selectedPlace.function && <section><h3>Fonction ou origine</h3><p>{selectedPlace.function}</p></section>}
                {selectedPlace.history && <section><h3>Histoire</h3><p>{selectedPlace.history}</p></section>}
                {selectedPlace.importance && <section><h3>Pourquoi ce lieu compte</h3><p>{selectedPlace.importance}</p></section>}
                {selectedPlace.model3d && (
                  <section className="place-model-section">
                    <h3>Explorer en trois dimensions</h3>
                    <p>Fais glisser la maquette pour la faire tourner; utilise le zoom pour observer les volumes.</p>
                    <Suspense fallback={<p className="model-loading" role="status">Préparation de la maquette 3D…</p>}>
                      <Monument3D key={`${selectedPlace.id}-${selectedPlace.model3d}`} modelKey={selectedPlace.model3d} />
                    </Suspense>
                  </section>
                )}
                {confirmedHeritageStatus(selectedPlace.heritageStatus) && (
                  <section><h3>Reconnaissance patrimoniale vérifiée</h3><p>{confirmedHeritageStatus(selectedPlace.heritageStatus)}</p></section>
                )}
                <section>
                  <h3>Visuel</h3>
                  <PlaceVisual key={`${selectedPlace.id}-${selectedPlace.visual?.url || 'schematic'}`} visual={selectedPlace.visual} title={selectedPlace.title || selectedPlace.name || 'Lieu historique'} detail onImageOpen={setLightboxImage} />
                </section>
                {Array.isArray(selectedPlace.gallery) && selectedPlace.gallery.length > 0 && (
                  <section className="place-gallery" aria-label={`Autres images du lieu : ${selectedPlace.title || selectedPlace.name}`}>
                    <h3>Autres vues du lieu</h3>
                    <div>{selectedPlace.gallery.map((visual, index) => <PlaceVisual key={`${selectedPlace.id}-gallery-${index}`} visual={visual} title={selectedPlace.title || selectedPlace.name || 'Lieu historique'} detail onImageOpen={setLightboxImage} />)}</div>
                  </section>
                )}
                <section>
                  <h3>Sources</h3>
                  {(() => {
                    const rawSources = selectedPlace.source || [];
                    const sources = (Array.isArray(rawSources) ? rawSources : [rawSources]).map(sourceLabel).filter(Boolean);
                    return sources.length ? (
                      <ul className="source-list">
                        {sources.map((source, index) => (
                          <li key={`${source.label}-${index}`}>
                            {source.url
                              ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
                              : source.label}
                          </li>
                        ))}
                      </ul>
                    ) : <p>Source non renseignée.</p>;
                  })()}
                </section>
              </div>
            </article>
            </div>
          )}
        </div>
      ) : (
        <p className="empty-state">Aucun lieu ne correspond à ces filtres. Modifie un filtre pour continuer.</p>
      )}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}

export default MonumentAtlas;
