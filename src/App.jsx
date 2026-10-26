import { useMemo, useState } from 'react';
import TimelineExplorer from './components/TimelineExplorer.jsx';
import MonumentAtlas from './components/MonumentAtlas.jsx';
import CurriculumExplorer from './components/CurriculumExplorer.jsx';
import haitiEvents from './data/haiti-history.js';
import worldEvents from './data/world.json';
import monuments from './data/monuments.json';
import leaders from './data/haiti-leaders.js';

const sections = [
  { id: 'haiti', label: 'Histoire d’Haïti', short: 'Haïti' },
  { id: 'leaders', label: 'Présidents et régimes', short: 'Dirigeants' },
  { id: 'world', label: 'Histoire du monde', short: 'Le monde' },
  { id: 'monuments', label: 'Lieux historiques', short: 'Les lieux' },
  { id: 'curriculum', label: 'Parcours scolaire', short: 'Programme' },
];

function SearchResults({ query, results, onPick, onClose }) {
  return (
    <div className="search-popover" role="dialog" aria-label="Résultats de recherche">
      <div className="search-popover-head">
        <span>Résultats pour <strong>« {query} »</strong></span>
        <button className="icon-button small" onClick={onClose} aria-label="Fermer les résultats">×</button>
      </div>
      {results.length ? results.map((result) => (
        <button className="search-result" key={`${result.kind}-${result.item.id}`} onClick={() => onPick(result)}>
          <span className={`result-kind ${result.kind}`}>{result.kindLabel}</span>
          <span><strong>{result.item.title || result.item.name}</strong><small>{result.item.dateLabel || result.item.period || result.item.location}</small></span>
          <span className="result-arrow" aria-hidden="true">↗</span>
        </button>
      )) : <p className="empty-search">Aucun résultat. Essaie un nom, un lieu ou une période.</p>}
    </div>
  );
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.4 4.4" /></svg>;
}

function App() {
  const [screen, setScreen] = useState('home');
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedHaiti, setSelectedHaiti] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [selectedWorld, setSelectedWorld] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (term.length < 2) return [];
    const matches = [];
    const collect = (items, kind, kindLabel) => items.forEach((item) => {
      const sourceItems = [...(Array.isArray(item.sources) ? item.sources : []), ...(item.source ? [item.source] : [])];
      const searchable = [
        item.title, item.name, item.summary, item.period, item.region, item.location,
        item.context, item.actors, item.causes, item.development, item.consequences,
        item.achievements, item.limitations, item.curriculum,
        item.uncertainty, item.function, item.history, item.importance, item.concepts,
        sourceItems.map((source) => typeof source === 'string' ? source : [source?.title, source?.publisher, source?.institution]),
      ]
        .flat(Infinity)
        .flatMap((value) => typeof value === 'string' ? [value] : value && typeof value === 'object' ? [value.term, value.name, value.definition] : [])
        .filter(Boolean).join(' ').toLocaleLowerCase('fr');
      if (searchable.includes(term)) matches.push({ item, kind, kindLabel });
    });
    collect(haitiEvents, 'haiti', 'Haïti');
    collect(leaders, 'leaders', 'Dirigeant');
    collect(worldEvents, 'world', 'Monde');
    collect(monuments, 'monuments', 'Lieu');
    return matches.slice(0, 8);
  }, [query]);

  const openResult = (result) => {
    setScreen(result.kind);
    if (result.kind === 'haiti') setSelectedHaiti(result.item.id);
    if (result.kind === 'leaders') setSelectedLeader(result.item.id);
    if (result.kind === 'world') setSelectedWorld(result.item.id);
    if (result.kind === 'monuments') setSelectedPlace(result.item.id);
    setQuery('');
    setShowResults(false);
  };

  const openSection = (id) => {
    setScreen(id);
    setQuery('');
    setShowResults(false);
  };

  const featured = haitiEvents.find((event) => event.id === 'independance-haiti-1804') || haitiEvents[0];
  const historicPlaces = monuments.length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Accueil Futur Haïti Histoire">
          <span className="brand-mark" aria-hidden="true"><span>F</span></span>
          <span className="brand-name">Futur Haïti <b>Histoire</b></span>
        </button>
        <nav className="main-nav" aria-label="Parcours principaux">
          {sections.map((section) => (
            <button key={section.id} className={screen === section.id ? 'nav-link active' : 'nav-link'} onClick={() => openSection(section.id)}>
              {section.label}
            </button>
          ))}
        </nav>
        <div className="topbar-tools">
          <label className="search-field">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setShowResults(true); }}
              onFocus={() => query.trim().length >= 2 && setShowResults(true)}
              onKeyDown={(event) => { if (event.key === 'Escape') setShowResults(false); }}
              placeholder="Chercher un repère…"
              aria-label="Rechercher dans les parcours"
            />
            <kbd>/</kbd>
          </label>
          {showResults && query.trim().length >= 2 && <SearchResults query={query} results={results} onPick={openResult} onClose={() => setShowResults(false)} />}
          <span className="language-pill" title="La version créole pourra être ajoutée">FR <i aria-hidden="true">⌄</i></span>
        </div>
      </header>

      <main id="main-content" className="page-main">
        {screen === 'home' && (
          <>
            <section className="home-hero">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-line" /> UN PARCOURS POUR COMPRENDRE</div>
                <h1>L’histoire d’Haïti,<br /><em>à hauteur d’élève.</em></h1>
                <p>Des sociétés qui ont habité l’île aux grandes transformations du pays : explore les repères, les voix et les lieux qui aident à comprendre notre histoire.</p>
                <div className="hero-actions">
                  <button className="button-primary" onClick={() => openSection('haiti')}>Explorer la chronologie <span aria-hidden="true">↗</span></button>
                  <span className="hero-note"><span className="note-dot" /> Des repères expliqués et sourcés</span>
                </div>
              </div>
              <div className="hero-art" aria-label="Illustration schématique de strates historiques haïtiennes">
                <div className="art-sun" />
                <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                <figure className="hero-map-wrap">
                  <img className="hero-map" src="https://commons.wikimedia.org/wiki/Special:FilePath/Hispaniola.png?width=1200" alt="Carte réelle de l’île d’Hispaniola montrant Haïti à l’ouest et la République dominicaine à l’est." />
                  <figcaption><a href="https://commons.wikimedia.org/wiki/File:Hispaniola.png" target="_blank" rel="noreferrer">Carte d’Hispaniola · Rémi Kaupp et Claude Zygiel · CC BY-SA 4.0</a></figcaption>
                </figure>
                <span className="art-caption">UNE HISTOIRE EN MOUVEMENT</span>
                <div className="art-date"><small>REPÈRE</small><strong>1492 <i>→</i> aujourd’hui</strong></div>
              </div>
            </section>

            <section className="home-section home-feature">
              <div className="section-heading"><div><span className="section-kicker">POUR COMMENCER</span><h2>Un repère à découvrir</h2></div><button className="text-link" onClick={() => openSection('haiti')}>Toute la chronologie <span>→</span></button></div>
              {featured ? (
                <button className="featured-card" onClick={() => { setSelectedHaiti(featured.id); openSection('haiti'); }}>
                  <span className="featured-date"><small>REPÈRE HAÏTIEN</small><strong>{featured.dateLabel}</strong><i aria-hidden="true">01</i></span>
                  <span className="featured-content"><span className="featured-period">{featured.period}</span><strong>{featured.title}</strong><span>{featured.summary}</span></span>
                  <span className="featured-open" aria-hidden="true">↗</span>
                </button>
              ) : <p className="notice-inline">Les repères sont en préparation.</p>}
            </section>

            <section className="home-section journeys-section">
              <div className="section-heading"><div><span className="section-kicker">TROIS FAÇONS D’EXPLORER</span><h2>Choisis ton parcours</h2></div><p>Commence par Haïti, puis élargis le regard.</p></div>
              <div className="journey-grid">
                <button className="journey-card journey-haiti" onClick={() => openSection('haiti')}>
                  <span className="journey-number">01 / PARCOURS PRINCIPAL</span><span className="journey-symbol symbol-timeline" aria-hidden="true"><i /><i /><i /></span>
                  <strong>Histoire<br />d’Haïti</strong><span className="journey-description">Des sociétés précoloniales à l’histoire contemporaine, avec les contextes et les débats qui éclairent chaque période.</span>
                  <span className="journey-footer"><span>{haitiEvents.length} repères</span><b aria-hidden="true">↗</b></span>
                </button>
                <button className="journey-card journey-world" onClick={() => openSection('world')}>
                  <span className="journey-number">02 / EN CONTEXTE</span><span className="journey-symbol symbol-world" aria-hidden="true">◎</span>
                  <strong>Histoire<br />du monde</strong><span className="journey-description">Quelques repères par époque et par région pour relier les transformations d’Haïti à d’autres histoires.</span>
                  <span className="journey-footer"><span>{worldEvents.length} repères</span><b aria-hidden="true">↗</b></span>
                </button>
                <button className="journey-card journey-places" onClick={() => openSection('monuments')}>
                  <span className="journey-number">03 / ATLAS</span><span className="journey-symbol symbol-place" aria-hidden="true">⌂</span>
                  <strong>Lieux<br />historiques</strong><span className="journey-description">Explore des sites d’Haïti et du monde, leur époque, leur fonction et la mémoire qu’ils portent.</span>
                  <span className="journey-footer"><span>{historicPlaces} lieux</span><b aria-hidden="true">↗</b></span>
                </button>
              </div>
              <button className="leaders-home-link" onClick={() => openSection('leaders')}>
                <span><small>PARCOURS SPÉCIAL · 1804–1986</small><strong>Présidents, pouvoirs et transitions</strong><span>Compare les gouvernements, leurs choix, leurs réalisations et leurs effets sur la population.</span></span>
                <b aria-hidden="true">Explorer les dirigeants ↗</b>
              </button>
            </section>

            <section className="source-note">
              <span className="source-note-icon" aria-hidden="true">✳</span>
              <div><strong>Comprendre avec des sources</strong><p>Les fiches distinguent les repères établis des interprétations et signalent les incertitudes. Les niveaux scolaires sont indiqués uniquement lorsque le programme les confirme.</p></div>
              <span className="source-note-mark">F·H</span>
            </section>
            <section className="curriculum-home-card">
              <div><span className="section-kicker">POUR LES ÉLÈVES ET LES ENSEIGNANTS</span><h2>Explorer l’histoire avec le programme scolaire</h2><p>Découvre les douze unités du secondaire, des questions pour enquêter et les documents de programme consultés.</p></div>
              <button className="button-primary" onClick={() => openSection('curriculum')}>Voir le parcours scolaire <span aria-hidden="true">↗</span></button>
            </section>
          </>
        )}
        {screen === 'haiti' && <TimelineExplorer key="haiti" events={haitiEvents} relatedLeaders={leaders} selectedEventId={selectedHaiti} onSelected={setSelectedHaiti} onBack={() => setScreen('home')} title="HISTOIRE D’HAÏTI" description="Parcours les périodes et ouvre un repère pour découvrir son contexte, ses acteurs et ce qu’on en retient." />}
        {screen === 'leaders' && <TimelineExplorer key="leaders" events={leaders} selectedEventId={selectedLeader} onSelected={setSelectedLeader} onBack={() => setScreen('home')} title="PRÉSIDENTS ET RÉGIMES" description="Des chefs d’État de 1804 à la chute des Duvalier : portraits, décisions, réalisations, limites et traces laissées dans la société." leadership />}
        {screen === 'world' && <TimelineExplorer key="world" events={worldEvents} selectedEventId={selectedWorld} onSelected={setSelectedWorld} onBack={() => setScreen('home')} title="HISTOIRE DU MONDE" description="Des repères par époque et par région pour mettre en contexte les histoires qui se croisent." world onBackLabel="Retour à l’accueil" />}
        {screen === 'monuments' && <MonumentAtlas places={monuments} selectedPlaceId={selectedPlace} onSelected={setSelectedPlace} onBack={() => setScreen('home')} />}
        {screen === 'curriculum' && <CurriculumExplorer onBack={() => setScreen('home')} onOpen={openSection} />}
      </main>
      <footer className="site-footer"><span><b>Futur Haïti · Histoire</b><span>Apprendre le passé pour comprendre le présent.</span></span><span>Contenus sourcés · Version française</span></footer>
      {showResults && <button className="popover-scrim" onClick={() => setShowResults(false)} aria-label="Fermer la recherche" />}
    </div>
  );
}

export default App;
