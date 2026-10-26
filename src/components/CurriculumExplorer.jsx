import { curriculumSources, secondaryUnits } from '../data/curriculum.js';

function CurriculumExplorer({ onBack, onOpen }) {
  return (
    <section className="curriculum-page" aria-labelledby="curriculum-heading">
      <div className="explorer-topline">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span>Retour à l’accueil</button>
      </div>
      <header className="explorer-heading curriculum-heading">
        <span className="section-kicker">REPÈRES SCOLAIRES · MENFP 2024</span>
        <h1 id="curriculum-heading">Apprendre à lire l’histoire</h1>
        <p>Les programmes invitent à relier le milieu proche, Haïti, la Caraïbe et le monde, puis à expliquer le passé à partir de documents et de questions.</p>
      </header>

      <section className="curriculum-method" aria-labelledby="method-title">
        <div><span className="curriculum-index">7e–9e années</span><h2 id="method-title">Partir des traces autour de soi</h2><p>Un monument, un nom de rue, une photographie, un objet ou un récit familial peut devenir un point de départ. On vérifie sa provenance, on le compare à d’autres documents et on explique ce qu’il permet de savoir.</p></div>
        <ol><li>Poser une question historique.</li><li>Identifier qui a produit chaque document, quand et pourquoi.</li><li>Comparer les indices, repérer les limites et construire une explication.</li></ol>
        <button className="text-link curriculum-open" type="button" onClick={() => onOpen('monuments')}>Explorer les lieux historiques <span>→</span></button>
      </section>

      <div className="curriculum-units-heading"><div><span className="section-kicker">ENSEIGNEMENT SECONDAIRE</span><h2>Les douze unités d’histoire</h2></div><p>Les unités sont approfondies et reliées sur plusieurs années. La page n’attribue donc pas chaque thème à une classe précise.</p></div>
      <div className="curriculum-grid">
        {secondaryUnits.map((unit, index) => (
          <article className="curriculum-card" key={unit.id}>
            <span className="curriculum-card-meta">{String(index + 1).padStart(2, '0')} · {unit.area}</span>
            <h3>{unit.title}</h3>
            <p>{unit.theme}</p>
            <div className="curriculum-question"><span>QUESTION POUR ENQUÊTER</span><strong>{unit.question}</strong></div>
          </article>
        ))}
      </div>

      <section className="curriculum-sources" aria-labelledby="curriculum-sources-heading">
        <div><span className="section-kicker">TEXTES DE RÉFÉRENCE</span><h2 id="curriculum-sources-heading">Consulter les programmes</h2><p>Les copies consultées portent le nom du MENFP. Leur hébergement est indiqué avec chaque lien; l’affectation annuelle des unités secondaires n’est pas reproduite ici.</p></div>
        <div className="curriculum-source-links">
          {curriculumSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.title}</strong><span>{source.detail}</span><small>{source.publisher} ↗</small></a>)}
        </div>
      </section>
      <div className="curriculum-shortcuts" aria-label="Parcourir les contenus de l’application">
        <button className="button-primary" type="button" onClick={() => onOpen('haiti')}>Voir l’histoire d’Haïti <span>↗</span></button>
        <button className="button-secondary" type="button" onClick={() => onOpen('world')}>Voir l’histoire du monde <span>↗</span></button>
      </div>
    </section>
  );
}

export default CurriculumExplorer;
