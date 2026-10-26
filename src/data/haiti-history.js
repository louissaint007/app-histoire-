import existingEvents from './haiti.json';
import supplementalEvents from './haiti-supplement.js';
import leaders from './haiti-leaders.js';

const correctedEvents = existingEvents.map((event) => {
  if (event.id === 'occupation-americaine-1915-1934') {
    return {
      ...event,
      summary: 'Du 28 juillet 1915 au 14 août 1934, les États-Unis occupent militairement Haïti. Quatre présidents haïtiens se succèdent sous cette occupation : Philippe Sudre Dartiguenave, Louis Borno, Louis-Eugène Roy et Sténio Vincent.',
      context: 'L’intervention suit une longue crise politique et l’assassinat du président Vilbrun Guillaume Sam. Les intérêts stratégiques et financiers américains, dont la dette haïtienne et la rivalité entre puissances, comptent aussi dans le contexte. Le traité du 16 septembre 1915 maintient des institutions haïtiennes, mais place les finances et des fonctions administratives essentielles sous contrôle américain.',
      causes: ['Crises politiques et conflits armés en Haïti au début du XXe siècle.', 'Intérêts américains dans les finances, les ports et la position stratégique d’Haïti dans les Caraïbes.', 'Assassinat de Vilbrun Guillaume Sam en juillet 1915, suivi du débarquement des Marines.'],
      development: 'Philippe Sudre Dartiguenave (1915–1922) est élu par l’Assemblée sous la présence des Marines. En 1917, le Parlement refuse un projet constitutionnel et est dissous; la Constitution de 1918 ouvre notamment la propriété foncière aux étrangers. La Gendarmerie d’Haïti est créée et des routes, ponts et services sanitaires sont développés, dans un cadre de contrôle financier et administratif américain. La corvée — travail forcé imposé pour les routes — et les violences de la gendarmerie alimentent les résistances cacos : Charlemagne Péralte est tué en 1919 et Benoît Batraville en 1920. Louis Borno (1922–1930), élu puis réélu par le Conseil d’État nommé, gouverne sans Parlement élu; son administration poursuit les travaux et les réorganisations, tandis que l’opposition critique la centralisation, la fiscalité et l’absence de représentation. Les grèves et manifestations de 1929, dont les tirs meurtriers de Les Cayes, conduisent à une commission d’enquête américaine et à une transition. Louis-Eugène Roy est président provisoire du 15 mai au 18 novembre 1930; les élections législatives ont lieu en octobre, puis l’Assemblée élit Sténio Vincent le 18 novembre. Vincent (1930–1941) gouverne pendant le retrait des Marines, officiellement achevé le 14 août 1934.',
      consequences: 'L’occupation transforme durablement l’armée, l’administration, les finances et les infrastructures; elle provoque également des pertes humaines, des déplacements, du travail forcé et une contestation nationaliste. Le départ des Marines en 1934 met fin à l’occupation militaire, mais ne supprime pas d’un coup les liens financiers et l’influence économique construits pendant cette période. Il faut donc distinguer fin de la présence militaire, restauration des institutions politiques et autonomie économique.',
      concepts: [...new Set([...(event.concepts || []), 'occupation militaire', 'tutelle financière', 'corvée', 'Cacos', 'souveraineté', 'résistance', 'nationalisme'])],
      actors: [...new Set([...(event.actors || []), 'Philippe Sudre Dartiguenave (1915–1922)', 'Louis Borno (1922–1930)', 'Louis-Eugène Roy (mai–novembre 1930)', 'Sténio Vincent (élu en 1930)', 'Charlemagne Péralte', 'Benoît Batraville', 'groupes patriotiques haïtiens'])],
      sources: [...(event.sources || []),
        { title: 'The United States Occupation, 1915–34', publisher: 'Library of Congress, Country Studies', url: 'https://countrystudies.us/haiti/15.htm', sourceType: 'étude historique' },
        { title: 'L’Occupation américaine d’Haïti (1915–1934) — guide de sources', publisher: 'Haiti Digital Library, Haiti Lab at Duke University', url: 'https://sites.duke.edu/haitilab/french/l%E2%80%99occupation-par-les-etats-unis-1915-1934/', sourceType: 'guide de sources, incluant des documents haïtiens' },
        { title: 'Rapport de la commission présidentielle sur Haïti (1930)', publisher: 'U.S. Department of State, FRUS', url: 'https://history.state.gov/historicaldocuments/frus1930v03/d185', sourceType: 'rapport officiel américain, à lire de façon critique' },
        { title: 'Election of Sténio Vincent, 18 November 1930', publisher: 'U.S. Department of State, FRUS', url: 'https://history.state.gov/historicaldocuments/frus1930v03/d220', sourceType: 'document diplomatique primaire' },
        { title: 'Haitian History: Primary Resources — U.S. Occupation in Haiti, 1915', publisher: 'Library of Congress, Research Guides', url: 'https://guides.loc.gov/haiti-reimagined/primary-resources', sourceType: 'guide de sources primaires' },
      ],
      curriculum: 'UA9 — occupation américaine, gouvernements haïtiens, souveraineté, constitution, résistances, travail, nationalisme et retrait de 1934.',
      uncertainty: 'Les archives américaines décrivent parfois les événements depuis le point de vue de l’occupant. Les bilans de victimes varient; les réalisations matérielles doivent être mises en regard des contraintes politiques, du travail forcé et des voix haïtiennes. Les présidences de Dartiguenave, Borno, Roy et Vincent sont détaillées dans leurs fiches individuelles.',
      learningPrompt: 'Compare le traité de 1915, les revendications haïtiennes, les rapports américains et les écrits de témoins : qui détient le pouvoir à chaque étape, et que signifie réellement le retrait de 1934 ?',
    };
  }
  if (event.id === 'independence-1804' && event.visual?.url?.includes('Deklarasyon_Endepandans')) {
    return {
      ...event,
      visual: {
        ...event.visual,
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Deklarasyon_Endepandans_Ayiti%2C_1804.djvu/page1-960px-Deklarasyon_Endepandans_Ayiti%2C_1804.djvu.jpg',
        caption: 'Numérisation de la Déclaration imprimée, conservée aux Archives nationales du Royaume-Uni; ce document n’est pas une photographie de la cérémonie de 1804.',
      },
    };
  }
  if (event.id === 'soulevement-janvier-1946-estime') {
    return {
      ...event,
      gallery: [...(event.gallery || []), {
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg',
        alt: 'Des personnes célèbrent devant la Garde d’Haïti après le départ de Lescot en 1946.',
        caption: 'Photographie de presse des célébrations après le départ de Lescot; elle n’illustre pas à elle seule toute la transition.',
        credit: 'Chicago Defender, 26 janvier 1946; photographe non identifié',
        license: 'Domaine public aux États-Unis selon la notice; statut à l’international à vérifier',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg',
        source: { title: 'Haitians celebrating in front of the Garde d’Haïti, 1946', publisher: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg' },
      }],
    };
  }
  if (event.id === 'seisme-haiti-2010') {
    const archiveImages = [
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Area_around_National_Palace%2C_Port-au-Prince_2010-01-30.jpg?width=1200',
        alt: 'Vue aérienne des environs du Palais national après le séisme de 2010.',
        caption: 'Vue aérienne prise le 30 janvier 2010 pendant l’opération Unified Response; elle documente les dégâts autour du Palais national.',
        credit: 'SCMS Spike Call / U.S. Navy', license: 'Domaine public aux États-Unis (œuvre d’un employé fédéral)',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Area_around_National_Palace,_Port-au-Prince_2010-01-30.jpg',
        source: { title: 'Area around National Palace, Port-au-Prince, 2010-01-30', publisher: 'U.S. Navy via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Area_around_National_Palace,_Port-au-Prince_2010-01-30.jpg' },
      },
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Haitian_men%2C_women_and_children_operate_heavy_equipment%2C_pick_up_trash_and_remove_debris_in_Port-au-Prince%2C_Haiti%2C_March_17%2C_2010%2C_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg?width=1200',
        alt: 'Des habitantes et habitants de Port-au-Prince enlèvent des débris en mars 2010.',
        caption: 'Des habitantes et habitants participent au déblaiement le 17 mars 2010; une image de la réponse locale après le séisme.',
        credit: 'U.S. Navy / MCC Spike Call', license: 'Domaine public aux États-Unis selon la notice Commons',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Haitian_men,_women_and_children_operate_heavy_equipment,_pick_up_trash_and_remove_debris_in_Port-au-Prince,_Haiti,_March_17,_2010,_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg',
        source: { title: 'Residents remove debris in Port-au-Prince, 17 March 2010', publisher: 'U.S. Navy via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Haitian_men,_women_and_children_operate_heavy_equipment,_pick_up_trash_and_remove_debris_in_Port-au-Prince,_Haiti,_March_17,_2010,_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg' },
      },
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/2010_Haiti_Earthquake_%28After%29.jpg?width=1200',
        alt: 'Image satellitaire des dégâts causés par le séisme de 2010 en Haïti.',
        caption: 'Image satellitaire de l’USGS montrant les dégâts après le séisme; ce n’est pas une photographie prise au sol.',
        credit: 'U.S. Geological Survey', license: 'CC0 1.0, domaine public consacré mondialement',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        source: { title: '2010 Haiti Earthquake (After)', publisher: 'U.S. Geological Survey via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2010_Haiti_Earthquake_(After).jpg' },
      },
    ];
    return { ...event, gallery: [...(event.gallery || []), ...archiveImages] };
  }
  return event;
});

const byId = new Set(correctedEvents.map((event) => event.id));
const leaderPortraits = new Map(leaders.map((leader) => [leader.id, leader.visual]).filter(([, visual]) => visual));
const portraitFor = (id) => leaderPortraits.get(id);
const enrichedSupplement = supplementalEvents
  .filter((event) => !byId.has(event.id))
  .map((event) => {
    const portraitId = {
      'unification-hispaniola-1822': 'boyer',
      'soulouque-1847-1859': 'soulouque',
      'crises-politiques-1869-1915': 'salomon',
      'resistance-cacos-1918-1920': 'peralte',
      'massacre-frontiere-1937': 'vincent',
      'shada-1941-1944': 'lescot',
      'duvalier-1957-1971': 'francois-duvalier',
      'duvalier-1971-1986': 'jean-claude-duvalier',
    }[event.id];
    const portrait = portraitFor(portraitId);
    return portrait ? { ...event, visual: portrait } : event;
  });

export default [...correctedEvents, ...enrichedSupplement];
