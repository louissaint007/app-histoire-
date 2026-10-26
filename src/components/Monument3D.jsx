import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const monumentInfo = {
  'great-pyramid': {
    title: 'Les trois pyramides principales de Gizeh', era: 'Khéops · Khéphren · Mykérinos · IVe dynastie',
    dimensions: 'Nécropole de Gizeh · trois pyramides royales et complexes secondaires',
    note: 'Les trois pyramides royales sont accompagnées de pyramides de reines, temples et chaussées. La scène ajoute les principaux satellites connus; leur implantation reste schématique et ne constitue pas un plan topographique exhaustif. Khéops conserve une base d’environ 230 m et une hauteur d’origine de 146,5 m; les strates du noyau représentent des assises moyennes, tandis que les blocs réels varient fortement.',
  },
  'chichen-itza': {
    title: 'El Castillo, Chichén Itzá', era: 'Yucatán · période maya postclassique',
    dimensions: 'Noyau cérémoniel · trois pyramides · grand jeu de balle · plateformes et colonnades',
    note: 'Vue contextualisée du noyau cérémoniel, pas de toute la cité : El Castillo (base ≈ 55 m; 24 m jusqu’au temple, qui ajoute ≈ 6 m), le Temple des Guerriers, l’Osario, le jeu de balle (≈ 168 × 70 m), le Tzompantli, la plateforme de Vénus et les 224 colonnes du complexe des Mille Colonnes décrites par l’INAH. El Castillo a neuf corps et quatre escaliers de 91 marches; leurs hauteurs et profondeurs correspondent ici à la hauteur documentée. Les distances de plan entre groupes restent schématiques.',
  },
  parthenon: {
    title: 'Le Parthénon', era: 'Acropole d’Athènes · Ve siècle av. J.-C.',
    dimensions: '69,5 × 30,9 m · colonnes 10,4 m · hauteur totale ≈ 19 m',
    note: 'Restitution architecturale à l’échelle : stylobate à trois marches, 8 colonnes en façade et 17 sur les longs côtés; les colonnes mesurent environ 10,4 m. Le personnage témoin mesure 1,70 m. Les Propylaia, l’Érechthéion et le temple d’Athéna Nikè replacent l’édifice dans l’Acropole; leurs volumes et positions sont simplifiés. La sculpture, la polychromie antique et les altérations historiques ne sont pas reconstituées.',
  },
  colosseum: {
    title: 'Amphithéâtre Flavien (Colisée)', era: 'Rome · Ier siècle apr. J.-C.',
    dimensions: 'Environ 189 × 156 m · hauteur extérieure ≈ 48,5 m',
    note: 'Maquette à l’échelle de l’amphithéâtre : trois niveaux d’arcades, attique, arène et hypogée simplifié. Le personnage de 1,70 m montre le rapport avec l’édifice; les dimensions de chaque niveau suivent l’enveloppe réelle, sans prétendre reconstituer tous les détails structurels. La vue « Aujourd’hui » représente les deux anneaux sud manquants; la reconstitution ferme le périmètre.',
  },
};

function createMaterials() {
  // Small locally generated surface maps give the masonry a quiet mineral grain
  // without presenting a perspective photograph as a physically correct texture.
  const makeStoneMap = (base, seed, character = 'limestone') => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = base;
    context.fillRect(0, 0, 256, 256);
    let state = seed >>> 0;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < 1600; i += 1) {
      const alpha = .018 + random() * .065;
      context.fillStyle = random() > .52 ? `rgba(255,247,226,${alpha})` : `rgba(55,43,29,${alpha})`;
      if (character === 'travertine' && random() > .62) {
        const w = 2 + random() * 13;
        context.fillRect(random() * 256, random() * 256, w, .7 + random() * 2.4);
      } else {
        const radius = .35 + random() * (character === 'marble' ? 1.8 : 2.8);
        context.beginPath(); context.arc(random() * 256, random() * 256, radius, 0, Math.PI * 2); context.fill();
      }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    return map;
  };
  const stone = (color, roughness, seed, character) => {
    const map = makeStoneMap(color, seed, character);
    return new THREE.MeshStandardMaterial({ color: '#ffffff', map, roughness, bumpMap: map, bumpScale: .018 });
  };
  const materials = {
    sand: stone('#9b8157', 1, 11, 'sand'),
    limestone: stone('#cabb9e', .96, 21, 'limestone'),
    limestoneAlt: stone('#b09a74', .97, 43, 'limestone'),
    blockJoint: stone('#938267', .98, 53, 'limestone'),
    casing: stone('#e5dac1', .88, 65, 'limestone'),
    granite: stone('#8f6658', .92, 79, 'granite'),
    marble: stone('#d5cebf', .84, 91, 'marble'),
    marbleShade: stone('#aaa393', .91, 107, 'marble'),
    travertine: stone('#c9b28c', .94, 119, 'travertine'),
    romanBrick: stone('#936e58', .96, 131, 'limestone'),
    romanCore: stone('#a8997e', .98, 147, 'limestone'),
    chichenStone: stone('#b8a77e', .97, 159, 'limestone'),
    jungleGround: stone('#68725a', 1, 173, 'sand'),
    acropolisGround: stone('#b0a58d', .97, 187, 'limestone'),
    romanGround: stone('#8b8172', .98, 199, 'limestone'),
    shadow: new THREE.MeshStandardMaterial({ color: '#352d25', roughness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: '#a58c5d', roughness: .83 }),
    humanSkin: new THREE.MeshStandardMaterial({ color: '#9a6747', roughness: .88 }),
    humanHair: new THREE.MeshStandardMaterial({ color: '#302721', roughness: .95 }),
    humanShirt: new THREE.MeshStandardMaterial({ color: '#66786f', roughness: .96 }),
    humanTrousers: new THREE.MeshStandardMaterial({ color: '#393d3a', roughness: .96 }),
    humanShoes: new THREE.MeshStandardMaterial({ color: '#272a28', roughness: .92 }),
  };
  materials.dispose = () => {
    const textures = new Set();
    Object.values(materials).forEach((material) => {
      if (!material?.isMaterial) return;
      if (material.map) textures.add(material.map);
      if (material.bumpMap) textures.add(material.bumpMap);
      material.dispose();
    });
    textures.forEach((texture) => texture.dispose());
  };
  return materials;
}

function addMesh(parent, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.rotation.set(...rotation);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function addHumanScale(root, materials, metersPerUnit, position) {
  const person = new THREE.Group();
  person.position.set(...position);
  person.scale.setScalar(1 / metersPerUnit);
  root.add(person);
  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const ellipsoid = (material, dimensions, at) => {
    const mesh = addMesh(person, sphere, material, at);
    mesh.scale.set(...dimensions);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    return mesh;
  };
  const limb = (material, start, end, radius) => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const geometry = new THREE.CapsuleGeometry(radius, Math.max(.02, direction.length() - radius * 2), 3, 8);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(a.add(b).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    person.add(mesh);
  };

  // Modern neutral reference figure: 1.70 m from ground to crown.
  ellipsoid(materials.humanTrousers, [.205, .42, .12], [0, .96, 0]);
  limb(materials.humanTrousers, [-.105, .91, 0], [-.11, .43, 0], .075);
  limb(materials.humanTrousers, [.105, .91, 0], [.11, .43, 0], .075);
  limb(materials.humanShoes, [-.11, .13, .025], [-.11, .035, .09], .047);
  limb(materials.humanShoes, [.11, .13, .025], [.11, .035, .09], .047);
  ellipsoid(materials.humanShirt, [.235, .31, .145], [0, 1.24, 0]);
  ellipsoid(materials.humanShirt, [.26, .19, .15], [0, 1.39, 0]);
  limb(materials.humanShirt, [-.245, 1.36, 0], [-.30, 1.10, .01], .066);
  limb(materials.humanShirt, [.245, 1.36, 0], [.30, 1.10, .01], .066);
  limb(materials.humanSkin, [-.30, 1.10, .01], [-.29, .82, .02], .052);
  limb(materials.humanSkin, [.30, 1.10, .01], [.29, .82, .02], .052);
  ellipsoid(materials.humanSkin, [.065, .105, .064], [0, 1.51, 0]);
  ellipsoid(materials.humanSkin, [.105, .105, .103], [0, 1.585, 0]);
  ellipsoid(materials.humanHair, [.108, .035, .105], [0, 1.665, -.004]);
  return person;
}

function terrainHeight(x, z, reliefScale = 1) {
  return (Math.sin(x * .22) * .11 + Math.cos(z * .19) * .09 + Math.sin((x + z) * .12) * .13) * reliefScale;
}

function addGround(root, material, desert = false, height = 42, reliefScale = 1) {
  const geometry = new THREE.PlaneGeometry(height, height, desert ? 56 : 1, desert ? 56 : 1);
  if (desert) {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getY(i);
      positions.setZ(i, terrainHeight(x, z, reliefScale));
    }
    geometry.computeVertexNormals();
  }
  addMesh(root, geometry, material, [0, 0, 0], [-Math.PI / 2, 0, 0]);
}

function addPyramid(root, materials, { base, height, currentHeight, x, z, rise = 0, graniteBand = false, crownCasing = false }, view) {
  const pyramid = new THREE.Group();
  pyramid.position.set(x, rise, z);
  root.add(pyramid);
  const casing = view === 'origin';
  const visibleHeight = casing ? height : currentHeight;
  const courses = Math.max(24, Math.round(height * 42));
  const courseRows = new Map();
  const blockJoints = [];
  for (let row = 0; view === 'today' && row < courses; row += 1) {
    const y0 = (visibleHeight * row) / courses;
    const y1 = (visibleHeight * (row + 1)) / courses;
    const halfBottom = (base / 2) * (1 - y0 / height);
    const halfTop = Math.max(.035, (base / 2) * (1 - y1 / height));
    const layerHeight = y1 - y0;
    const inGraniteBand = graniteBand && y1 < height * .28;
    const material = inGraniteBand ? materials.granite : (row % 5 === 0 ? materials.limestoneAlt : materials.limestone);
    const materialRows = courseRows.get(material) || [];
    const joint = Math.min(.0018, layerHeight * .08);
    const courseY = (y0 + y1) / 2 + .12;
    const halfWidth = (halfBottom + halfTop) / 2;
    materialRows.push({ width: halfBottom + halfTop, height: layerHeight - joint, y: courseY });
    courseRows.set(material, materialRows);

    // Fine staggered joints mark individual stones across each visible face.
    const nominalBlockWidth = .052;
    const blockCount = Math.max(2, Math.round((halfWidth * 2) / nominalBlockWidth));
    const blockPitch = (halfWidth * 2) / blockCount;
    const stagger = row % 2 ? blockPitch / 2 : 0;
    const seamWidth = .0015;
    const seamDepth = .003;
    for (let seam = 1; seam < blockCount; seam += 1) {
      const across = -halfWidth + seam * blockPitch + stagger;
      if (across >= halfWidth - .01) continue;
      blockJoints.push({ x: across, z: -halfWidth - seamDepth / 2, y: courseY, sx: seamWidth, sy: layerHeight * .78, sz: seamDepth });
      blockJoints.push({ x: across, z: halfWidth + seamDepth / 2, y: courseY, sx: seamWidth, sy: layerHeight * .78, sz: seamDepth });
      blockJoints.push({ x: -halfWidth - seamDepth / 2, z: across, y: courseY, sx: seamDepth, sy: layerHeight * .78, sz: seamWidth });
      blockJoints.push({ x: halfWidth + seamDepth / 2, z: across, y: courseY, sx: seamDepth, sy: layerHeight * .78, sz: seamWidth });
    }
  }

  if (!casing) courseRows.forEach((rows, material) => {
    const geometry = new THREE.CylinderGeometry(.703, .707, 1, 4, 1);
    const blocks = new THREE.InstancedMesh(geometry, material, rows.length);
    const dummy = new THREE.Object3D();
    rows.forEach((row, index) => {
      dummy.position.set(0, row.y, 0);
      dummy.rotation.set(0, Math.PI / 4, 0);
      dummy.scale.set(row.width, row.height, row.width);
      dummy.updateMatrix(); blocks.setMatrixAt(index, dummy.matrix);
    });
    blocks.castShadow = true; blocks.receiveShadow = true; blocks.instanceMatrix.needsUpdate = true;
    pyramid.add(blocks);
  });
  if (!casing && blockJoints.length) {
    const jointGeometry = new THREE.BoxGeometry(1, 1, 1);
    const joints = new THREE.InstancedMesh(jointGeometry, materials.blockJoint, blockJoints.length);
    const transform = new THREE.Object3D();
    blockJoints.forEach((joint, index) => {
      transform.position.set(joint.x, joint.y, joint.z);
      transform.scale.set(joint.sx, joint.sy, joint.sz);
      transform.updateMatrix(); joints.setMatrixAt(index, transform.matrix);
    });
    joints.instanceMatrix.needsUpdate = true;
    pyramid.add(joints);
  }

  if (casing) {
    addMesh(pyramid, new THREE.ConeGeometry(base / Math.sqrt(2), height, 4, 1), materials.casing, [0, height / 2 + .12, 0], [0, Math.PI / 4, 0]);
    // Mykerinos' lower outer casing included granite; keep that material visible in the reconstruction.
    if (graniteBand) {
      const bandHeight = height * .27;
      const bandBottom = base / 2;
      const bandTop = bandBottom * (1 - bandHeight / height);
      addMesh(pyramid, new THREE.CylinderGeometry(bandTop * Math.SQRT2, bandBottom * Math.SQRT2, bandHeight, 4, 1), materials.granite, [0, bandHeight / 2 + .12, 0], [0, Math.PI / 4, 0]);
    }
  } else if (crownCasing) {
    const bottomY = height * .73;
    const sectionHeight = height - bottomY;
    const lower = (base / 2) * (1 - bottomY / height);
    addMesh(pyramid, new THREE.CylinderGeometry(.025, lower * Math.SQRT2, sectionHeight, 4, 1), materials.casing, [0, bottomY + sectionHeight / 2 + .12, 0], [0, Math.PI / 4, 0]);
  }

  addMesh(pyramid, new THREE.BoxGeometry(base + .28, .12, base + .28), materials.limestoneAlt, [0, .05, 0]);
  return pyramid;
}

function addGizaMastaba(root, materials, x, z, width = .72, depth = .48) {
  addMesh(root, new THREE.BoxGeometry(width, .12, depth), materials.limestoneAlt, [x, .08, z]);
  addMesh(root, new THREE.BoxGeometry(width * .86, .22, depth * .82), materials.limestone, [x, .25, z]);
}

function addGizaTemple(root, materials, x, z, rotation = 0) {
  const temple = new THREE.Group();
  temple.position.set(x, .01, z); temple.rotation.y = rotation; root.add(temple);
  addMesh(temple, new THREE.BoxGeometry(1.45, .16, .92), materials.limestoneAlt, [0, .08, 0]);
  addMesh(temple, new THREE.BoxGeometry(1.32, .35, .8), materials.limestone, [0, .335, 0]);
  addMesh(temple, new THREE.BoxGeometry(1.48, .13, .96), materials.limestoneAlt, [0, .575, 0]);
  for (const x of [-.48, -.16, .16, .48]) addMesh(temple, new THREE.CylinderGeometry(.065, .07, .38, 8), materials.granite, [x, .84, .32]);
  addMesh(temple, new THREE.BoxGeometry(1.48, .1, .12), materials.limestone, [0, 1.08, .32]);
}

function addSphinx(root, materials, x, z) {
  const sphinx = new THREE.Group(); sphinx.position.set(x, .02, z); root.add(sphinx);
  const body = addMesh(sphinx, new THREE.SphereGeometry(1, 20, 12), materials.limestoneAlt, [0, .25, 0]);
  body.scale.set(1.2, .35, .38);
  const chest = addMesh(sphinx, new THREE.SphereGeometry(1, 16, 10), materials.limestone, [.78, .43, 0]);
  chest.scale.set(.39, .46, .31);
  addMesh(sphinx, new THREE.BoxGeometry(.34, .66, .3), materials.limestoneAlt, [1.02, .76, 0]);
  const head = addMesh(sphinx, new THREE.SphereGeometry(1, 16, 12), materials.limestone, [1.04, 1.13, 0]);
  head.scale.set(.22, .28, .21);
  for (const side of [-1, 1]) {
    const paw = addMesh(sphinx, new THREE.BoxGeometry(.48, .16, .16), materials.limestoneAlt, [.37, .12, side * .27]);
    paw.rotation.z = -.08;
  }
}

function makePyramid(root, materials, interior, view) {
  addGround(root, materials.sand, true, 78, .18);
  const trio = [
    { name: 'Khéops', base: 7.55, height: 4.8, currentHeight: 4.52, x: 5.2, z: -5.8 },
    { name: 'Khéphren', base: 7.06, height: 4.70, currentHeight: 4.48, x: -1.0, z: .1, rise: .31, crownCasing: true },
    { name: 'Mykérinos', base: 3.39, height: 2.13, currentHeight: 2.0, x: -6.1, z: 5.2, rise: .05, graniteBand: true },
  ];
  trio.forEach((pyramid) => addPyramid(root, materials, pyramid, view));

  // Satellite pyramids documented around the three royal complexes: the three
  // Khufu queens' pyramids, Khafre's G II-a and the three Menkaure queens' pyramids.
  [
    { base: 1.62, height: 1.02, currentHeight: .96, x: 10.0, z: -7.85 },
    { base: 1.62, height: 1.02, currentHeight: .96, x: 10.0, z: -5.8 },
    { base: 1.55, height: .98, currentHeight: .91, x: 10.0, z: -3.75 },
    { base: .76, height: .48, currentHeight: .43, x: 10.1, z: -1.7 },
    { base: .86, height: .48, currentHeight: .43, x: 3.25, z: -2.6 },
    { base: 1.13, height: .67, currentHeight: .62, x: -3.45, z: 4.05 },
    { base: 1.13, height: .67, currentHeight: .62, x: -3.45, z: 5.2 },
    { base: 1.08, height: .62, currentHeight: .57, x: -3.45, z: 6.35 },
  ].forEach((pyramid) => addPyramid(root, materials, pyramid, view));

  // A contextual sample of the temples, causeway, Sphinx and mastaba cemeteries.
  addGizaTemple(root, materials, 9.0, -10.0, Math.PI / 2);
  addGizaTemple(root, materials, 3.75, .05, Math.PI / 2);
  addGizaTemple(root, materials, -2.25, 8.2, Math.PI / 2);
  addSphinx(root, materials, 5.4, .05);
  const causeway = addMesh(root, new THREE.BoxGeometry(2.1, .05, .46), materials.limestoneAlt, [4.65, .025, .05]);
  causeway.rotation.y = Math.PI / 2;
  for (const [x, z] of [[1.1, -13], [2.35, -13.4], [-2.7, 11], [-1.6, 11.3], [-11, -1.2], [-10.5, 1.2]]) addGizaMastaba(root, materials, x, z);
  // A 1.70 m visitor stands on the approach to Khufu's complex, in the same model units.
  addHumanScale(root, materials, 30.5, [5.2, terrainHeight(5.2, -1.85, .18), -1.85]);

  if (interior) {
    const cutaway = new THREE.Group();
    root.add(cutaway);
    const outlineShape = new THREE.Shape();
    const height = 4.8;
    const base = 7.55;
    outlineShape.moveTo(-base / 2, 0); outlineShape.lineTo(0, height); outlineShape.lineTo(base / 2, 0); outlineShape.closePath();
    const outline = new THREE.Mesh(new THREE.ShapeGeometry(outlineShape), new THREE.MeshBasicMaterial({ color: '#dfc99f', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false }));
    outline.position.set(5.2, .12, -1.97);
    cutaway.add(outline);

    const tubeMaterial = new THREE.MeshStandardMaterial({ color: '#e9b765', roughness: .72, emissive: '#34200c' });
    const tunnel = (points, radius = .065) => {
      const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x + 5.2, y + .12, -1.92)));
      cutaway.add(addMesh(new THREE.Group(), new THREE.TubeGeometry(curve, Math.max(8, points.length * 6), radius, 8, false), tubeMaterial));
    };
    tunnel([[-3.36, 3.75], [-2.75, 3.27], [-1.9, 2.35], [-.55, .78], [.05, .53]]);
    tunnel([[-2.55, 3.12], [-1.52, 3.45], [-.55, 3.7], [.25, 3.65], [1.2, 3.65]]);
    tunnel([[-1.65, 2.85], [-.95, 2.45], [-.2, 2.18], [.3, 2.18]]);
    const chamber = (x, y, w, h, color = '#dec08a') => {
      addMesh(cutaway, new THREE.BoxGeometry(w, h, .08), new THREE.MeshStandardMaterial({ color, roughness: .82 }), [x + 5.2, y + .12, -1.92]);
    };
    chamber(.2, 3.66, .9, .34); // King’s Chamber
    chamber(.1, 2.18, .75, .28); // Queen’s Chamber
    chamber(.02, .38, .82, .3, '#aa8861'); // Subterranean chamber
  }
}

function addInstancedStair(root, material, direction, count, startEdge, run, totalRise, width, offset = [0, 0]) {
  const tread = run / count;
  const rise = totalRise / count;
  const geometry = direction === 'north' || direction === 'south'
    ? new THREE.BoxGeometry(width, Math.max(.035, rise * .76), tread * 1.12)
    : new THREE.BoxGeometry(tread * 1.12, Math.max(.035, rise * .76), width);
  const stairs = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    const progress = (i + .5) / count;
    const edge = startEdge - progress * run;
    const y = .14 + progress * totalRise;
    if (direction === 'north' || direction === 'south') {
      dummy.position.set(offset[0], y, offset[1] + (direction === 'north' ? -edge : edge));
    } else {
      dummy.position.set(offset[0] + (direction === 'east' ? edge : -edge), y, offset[1]);
    }
    dummy.updateMatrix(); stairs.setMatrixAt(i, dummy.matrix);
  }
  stairs.castShadow = true; stairs.receiveShadow = true; root.add(stairs);
}

function addSteppedMayaPyramid(root, materials, { x, z, baseWidth, tiers, tierHeight, topWidth, stairFlights = 4, steps, stairWidth: requestedStairWidth, temple = true, material = materials.chichenStone }) {
  const totalRise = tiers * tierHeight;
  for (let tier = 0; tier < tiers; tier += 1) {
    const bottomWidth = baseWidth - (baseWidth - topWidth) * tier / tiers;
    const upperWidth = baseWidth - (baseWidth - topWidth) * (tier + 1) / tiers;
    const y = tier * tierHeight + tierHeight / 2 + .14;
    const body = new THREE.CylinderGeometry(upperWidth / Math.SQRT2, bottomWidth / Math.SQRT2, tierHeight, 4, 1);
    addMesh(root, body, tier % 3 === 1 ? materials.limestoneAlt : material, [x, y, z], [0, Math.PI / 4, 0]);
    addMesh(root, new THREE.BoxGeometry(upperWidth * 1.015, .035, upperWidth * 1.015), materials.limestone, [x, (tier + 1) * tierHeight + .14, z]);
  }
  const flights = stairFlights;
  const stepCount = steps || Math.max(tiers * 4, Math.round(totalRise * 7.42 / .264));
  const run = (baseWidth - topWidth) * .48;
  const edge = baseWidth / 2 + .015;
  const stairWidth = requestedStairWidth || Math.min(.88, baseWidth * .17);
  const directions = flights === 4 ? ['north', 'south', 'east', 'west'] : ['west'];
  directions.forEach((direction) => addInstancedStair(root, materials.limestone, direction, stepCount, edge, run, totalRise, stairWidth, [x, z]));
  if (temple) {
    const templeBase = totalRise + .15;
    addMesh(root, new THREE.BoxGeometry(baseWidth * .22, .12, baseWidth * .18), materials.chichenStone, [x, templeBase + .06, z]);
    addMesh(root, new THREE.BoxGeometry(baseWidth * .18, .45, baseWidth * .14), materials.chichenStone, [x, templeBase + .345, z - .04]);
    addMesh(root, new THREE.BoxGeometry(baseWidth * .205, .1, baseWidth * .16), materials.limestoneAlt, [x, templeBase + .62, z - .04]);
    addMesh(root, new THREE.BoxGeometry(baseWidth * .06, .33, .025), materials.shadow, [x, templeBase + .315, z - baseWidth * .075]);
  }
  return { totalRise, run, edge, stairWidth };
}

function addBallcourt(root, materials, centerX, centerZ, scale) {
  // INAH gives 168 x 70 m; the scene uses the same 7.42 m per world unit as El Castillo.
  const length = 168 / scale;
  const width = 70 / scale;
  const wallHeight = 1.05;
  for (const x of [centerX - width / 2, centerX + width / 2]) {
    addMesh(root, new THREE.BoxGeometry(.23, wallHeight, length), materials.chichenStone, [x, wallHeight / 2, centerZ]);
    addMesh(root, new THREE.BoxGeometry(.28, .12, length + .12), materials.limestoneAlt, [x, wallHeight + .06, centerZ]);
  }
  for (const z of [centerZ - length / 2, centerZ + length / 2]) {
    addMesh(root, new THREE.BoxGeometry(width, .55, .23), materials.chichenStone, [centerX, .275, z]);
  }
  // The sloped playing surfaces are represented as simple ramps, with the ring markers omitted.
  for (const x of [centerX - width * .31, centerX + width * .31]) {
    const ramp = addMesh(root, new THREE.BoxGeometry(.22, .07, length * .82), materials.limestoneAlt, [x, .5, centerZ]);
    ramp.rotation.z = x < centerX ? -.32 : .32;
  }
}

function addWarriorsAndColumns(root, materials, x, z) {
  const base = 4.9;
  const pyramid = addSteppedMayaPyramid(root, materials, { x, z, baseWidth: base, tiers: 4, tierHeight: .45, topWidth: 1.25, stairFlights: 1, material: materials.limestoneAlt });
  // Temple of the Warriors and the adjacent Thousand Columns complex (224 columns in INAH's documentation).
  const columnGeometry = new THREE.CylinderGeometry(.025, .03, .32, 7);
  const columnInstances = new THREE.InstancedMesh(columnGeometry, materials.chichenStone, 224);
  const columnTransform = new THREE.Object3D();
  let instance = 0;
  for (let row = 0; row < 16; row += 1) for (let column = 0; column < 14; column += 1) {
    columnTransform.position.set(x + 3.2 + column * .28, .16, z - 1.95 + row * .26);
    columnTransform.updateMatrix();
    columnInstances.setMatrixAt(instance++, columnTransform.matrix);
  }
  columnInstances.castShadow = true; columnInstances.receiveShadow = true;
  root.add(columnInstances);
  // The entire 224-column count documented by the INAH is included in this reduced colonnade.
  return pyramid;
}

function makeSteppedPyramid(root, materials) {
  const metersPerUnit = 7.42;
  addGround(root, materials.jungleGround, true, 60);
  const tiers = 9;
  const baseWidth = 7.45;
  const topWidth = 1.18;
  const tierHeight = .36;
  addSteppedMayaPyramid(root, materials, { x: 0, z: 0, baseWidth, tiers, tierHeight, topWidth, steps: 91, stairWidth: 1.25 });
  // The four main flights have 91 steps; the 24 m body rise gives about 26 cm per riser.
  // Documented core laid out schematically: ballcourt, Warriors/columns, Venus platform, Tzompantli, Osario and Caracol.
  addBallcourt(root, materials, -12.8, -4.5, metersPerUnit);
  addWarriorsAndColumns(root, materials, 8.4, -1.8);
  addMesh(root, new THREE.CylinderGeometry(.82, .9, .18, 4), materials.limestoneAlt, [3.3, .09, -5.25], [0, Math.PI / 4, 0]);
  addMesh(root, new THREE.BoxGeometry(.8, .24, .58), materials.limestone, [3.3, .3, -5.25]);
  addMesh(root, new THREE.CylinderGeometry(.82, .92, .22, 4), materials.chichenStone, [-2.7, .11, -3.9], [0, Math.PI / 4, 0]); // Tzompantli
  addSteppedMayaPyramid(root, materials, { x: -4.0, z: 8.5, baseWidth: 3.31, tiers: 7, tierHeight: 1.28 / 7, topWidth: .6, stairFlights: 4, steps: 36, temple: true }); // Osario, south of Castillo
  // Caracol: round observatory on a rectangular platform, shown schematically at its relative distance.
  addMesh(root, new THREE.BoxGeometry(2.25, .2, 1.65), materials.limestoneAlt, [11, .1, 8]);
  addMesh(root, new THREE.CylinderGeometry(.72, .82, .78, 20), materials.chichenStone, [11, .59, 8]);
  addMesh(root, new THREE.CylinderGeometry(.38, .54, .72, 20), materials.limestoneAlt, [11, 1.34, 8]);
  // Venus platform north of Castillo; real person is placed near the main staircase.
  addHumanScale(root, materials, metersPerUnit, [0, terrainHeight(0, -4.15), -4.15]);
}

function flutedColumnGeometry(radius, height, flutes = 20) {
  const around = 100;
  const rings = 12;
  const positions = [];
  const indices = [];
  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    const y = t * height;
    const taper = 1.04 - .08 * t + .018 * Math.sin(Math.PI * t);
    for (let side = 0; side <= around; side += 1) {
      const angle = side / around * Math.PI * 2;
      const flute = Math.pow(Math.max(0, Math.cos(angle * flutes / 2)), 9);
      const r = radius * taper * (1 - .075 * flute);
      positions.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
  }
  for (let ring = 0; ring < rings; ring += 1) for (let side = 0; side < around; side += 1) {
    const a = ring * (around + 1) + side;
    const b = a + around + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function makeColumn(parent, materials, x, z, height, radius = .1, baseY = .12) {
  const shaftHeight = height - .34;
  addMesh(parent, new THREE.CylinderGeometry(radius * 1.24, radius * 1.3, .105, 32), materials.marbleShade, [x, baseY + .052, z]);
  addMesh(parent, flutedColumnGeometry(radius, shaftHeight), materials.marble, [x, baseY + .105, z]);
  // Doric echinus and abacus, with restrained profile rather than a plain drum cap.
  addMesh(parent, new THREE.CylinderGeometry(radius * 1.48, radius * 1.04, .13, 32), materials.marbleShade, [x, baseY + shaftHeight + .13, z]);
  addMesh(parent, new THREE.BoxGeometry(radius * 3.05, .11, radius * 3.05), materials.marble, [x, baseY + height - .045, z]);
}

function addAcropolisContext(root, materials, x, z, length, width, columnCount = 4) {
  const platform = new THREE.Group(); platform.position.set(x, .015, z); root.add(platform);
  addMesh(platform, new THREE.BoxGeometry(length, .06, width), materials.marbleShade, [0, .03, 0]);
  addMesh(platform, new THREE.BoxGeometry(length - .06, .04, width - .06), materials.marble, [0, .08, 0]);
  const spacing = (length - .28) / Math.max(1, columnCount - 1);
  for (let i = 0; i < columnCount; i += 1) {
    const px = -length / 2 + .14 + i * spacing;
    for (const pz of [-width / 2 + .12, width / 2 - .12]) {
      addMesh(platform, new THREE.CylinderGeometry(.045, .05, .43, 12), materials.marble, [px, .315, pz]);
    }
  }
  addMesh(platform, new THREE.BoxGeometry(length + .04, .12, width + .04), materials.marbleShade, [0, .59, 0]);
  addMesh(platform, new THREE.BoxGeometry(length + .1, .035, width + .1), materials.marble, [0, .67, 0]);
}

function makeParthenon(root, materials) {
  addGround(root, materials.acropolisGround, false, 32);
  const length = 7.0;
  const width = 3.12;
  for (let layer = 0; layer < 3; layer += 1) {
    const inset = layer * .035;
    addMesh(root, new THREE.BoxGeometry(length - inset * 2, .03, width - inset * 2), layer === 1 ? materials.marbleShade : materials.marble, [0, .015 + layer * .03, 0]);
  }
  // Scale the height to the temple's broad 2.24:1 footprint; the former columns
  // and roof made the building far too tall relative to its real plan.
  const columnH = 1.04;
  const xStep = (length - .58) / 16;
  const zStep = width - .52;
  for (let i = 0; i < 17; i += 1) {
    const x = -length / 2 + .4 + i * xStep;
    makeColumn(root, materials, x, -zStep / 2, columnH, .096, .09);
    makeColumn(root, materials, x, zStep / 2, columnH, .096, .09);
  }
  for (let i = 1; i < 7; i += 1) {
    const z = -zStep / 2 + i * zStep / 7;
    makeColumn(root, materials, -length / 2 + .29, z, columnH, .096, .09);
    makeColumn(root, materials, length / 2 - .29, z, columnH, .096, .09);
  }
  const top = .09 + columnH;
  // Cella mass behind the peristyle. Its lower profile remains visible through the colonnade.
  addMesh(root, new THREE.BoxGeometry(length - 1.05, .78, width - 1.1), materials.marbleShade, [0, .15 + .39, 0]);
  addMesh(root, new THREE.BoxGeometry(length + .06, .1, width + .06), materials.marble, [0, top + .05, 0]);
  addMesh(root, new THREE.BoxGeometry(length + .12, .15, width + .12), materials.marbleShade, [0, top + .175, 0]);
  addMesh(root, new THREE.BoxGeometry(length + .12, .082, width + .12), materials.marble, [0, top + .291, 0]);
  // Restrained triglyph rhythm distinguishes the Doric frieze without inventing sculpture.
  const bay = (length - .58) / 16;
  for (const z of [-width / 2 - .02, width / 2 + .02]) for (let i = 0; i < 17; i += 1) {
    const x = -length / 2 + .29 + i * bay;
    addMesh(root, new THREE.BoxGeometry(.11, .075, .045), materials.marble, [x, top + .11, z]);
  }
  // Front and rear triangular pediments; the missing sculpture is intentionally not reconstructed.
  const pediment = new THREE.Shape();
  pediment.moveTo(-length / 2, 0); pediment.lineTo(length / 2, 0); pediment.lineTo(0, .345); pediment.closePath();
  const gable = new THREE.ExtrudeGeometry(pediment, { depth: .12, bevelEnabled: false });
  const eaves = top + .332;
  addMesh(root, gable, materials.marbleShade, [0, eaves, width / 2 - .06]);
  addMesh(root, gable, materials.marbleShade, [0, eaves, -width / 2 + .06], [0, Math.PI, 0]);
  const roofWidth = width / 2 + .12;
  const ridgeRise = .345;
  const roofThickness = .045;
  const roofAngle = Math.atan2(ridgeRise, roofWidth);
  const slopeLength = Math.hypot(roofWidth, ridgeRise);
  for (const side of [-1, 1]) {
    addMesh(root, new THREE.BoxGeometry(length + .2, roofThickness, slopeLength), materials.marble, [0, eaves + ridgeRise / 2, side * roofWidth / 2], [side * roofAngle, 0, 0]);
  }
  // Other attested monuments on the Acropolis plateau, reduced to legible architectural massing.
  addAcropolisContext(root, materials, -10.1, -.4, 2.55, 1.45, 5); // Propylaia
  addAcropolisContext(root, materials, 6.0, -4.1, 2.05, 1.2, 4); // Erechtheion
  addAcropolisContext(root, materials, -8.1, -4.0, .9, .72, 4); // Temple of Athena Nike
  addHumanScale(root, materials, 9.93, [0, 0, 2.0]);
}

function makeColosseumArchBay(width, height, depth, openingWidth, openingHeight) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(-width / 2, height * .72);
  shape.quadraticCurveTo(-width / 2, height, 0, height);
  shape.quadraticCurveTo(width / 2, height, width / 2, height * .72);
  shape.lineTo(width / 2, 0); shape.closePath();
  const opening = new THREE.Path();
  opening.moveTo(-openingWidth / 2, .04);
  opening.lineTo(-openingWidth / 2, openingHeight * .68);
  opening.quadraticCurveTo(-openingWidth / 2, openingHeight, 0, openingHeight);
  opening.quadraticCurveTo(openingWidth / 2, openingHeight, openingWidth / 2, openingHeight * .68);
  opening.lineTo(openingWidth / 2, .04); opening.closePath();
  shape.holes.push(opening);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 5 });
}

function ellipseRing(root, rx, rz, y, material, tube = .075, brokenSouth = false) {
  let geometry;
  if (brokenSouth) {
    // Leave an open span on the south side where the upper exterior is missing today.
    const arc = new THREE.EllipseCurve(0, 0, rx, rz, 2.82, Math.PI * 2 + .33, false, 0);
    const points = arc.getPoints(160).map((point) => new THREE.Vector3(point.x, y, point.y));
    geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, tube, 8, false);
  } else {
    geometry = new THREE.TorusGeometry(1, tube, 8, 128);
  }
  const ring = new THREE.Mesh(geometry, material);
  if (!brokenSouth) { ring.scale.set(rx, rz, 1); ring.rotation.x = Math.PI / 2; ring.position.y = y; }
  ring.castShadow = true; ring.receiveShadow = true; root.add(ring);
}

function makeColosseum(root, materials, view) {
  addGround(root, materials.romanGround, false, 26);
  const rx = 3.72;
  const rz = 3.07;
  const bays = 80;
  const floorHeight = .47;
  const floorsY = [.05, .55, 1.05];
  const outerScales = [1, .975, .95];
  for (let floor = 0; floor < 3; floor += 1) {
    const scale = outerScales[floor];
    const outerX = rx * scale;
    const outerZ = rz * scale;
    const averageCircumference = Math.PI * (3 * (outerX + outerZ) - Math.sqrt((3 * outerX + outerZ) * (outerX + 3 * outerZ)));
    const bayWidth = averageCircumference / bays * 1.02;
    const openingWidth = bayWidth * .62;
    const openingHeight = floorHeight * .75;
    const arch = makeColosseumArchBay(bayWidth, floorHeight, .52, openingWidth, openingHeight);
    for (let i = 0; i < bays; i += 1) {
      const angle = i / bays * Math.PI * 2;
      const x = outerX * Math.cos(angle);
      const z = outerZ * Math.sin(angle);
      const isSouth = Math.sin(angle) > .08;
      // In the present-day view, the south-facing upper ambulatory is partly collapsed.
      if (view === 'today' && floor === 2 && isSouth && Math.sin(angle) > .32) continue;
      const bayMesh = addMesh(root, arch, floor === 1 ? materials.romanBrick : materials.travertine,
        [x, floorsY[floor], z], [0, angle, 0]);
      bayMesh.receiveShadow = true;
    }
    ellipseRing(root, outerX, outerZ, floorsY[floor] + floorHeight, materials.romanCore, .055,
      view === 'today' && floor === 2);
  }

  const atticY = 1.55;
  const atticRx = rx * .925;
  const atticRz = rz * .925;
  ellipseRing(root, atticRx, atticRz, atticY, materials.travertine, .09, view === 'today');
  for (let i = 0; i < bays; i += 1) {
    const angle = i / bays * Math.PI * 2;
    const x = atticRx * Math.cos(angle);
    const z = atticRz * Math.sin(angle);
    if (view === 'today' && Math.sin(angle) > .32) continue;
    const panel = addMesh(root, new THREE.BoxGeometry(.09, .35, .48), materials.travertine,
      [x, atticY + .175, z], [0, angle, 0]);
    if (i % 2 === 0) addMesh(root, new THREE.BoxGeometry(.045, .12, .12), materials.shadow,
      [x * 1.006, atticY + .19, z * 1.006], [0, angle, 0]);
    panel.receiveShadow = true;
  }
  ellipseRing(root, atticRx, atticRz, atticY + .36, materials.travertine, .11, view === 'today');

  // Exposed hypogeum corridors, arena perimeter and a restrained fragment of seating.
  const arena = addMesh(root, new THREE.CircleGeometry(1.71, 96), materials.romanCore, [0, .17, 0], [-Math.PI / 2, 0, 0]);
  arena.scale.set(1, .63, 1);
  for (const x of [-1.3, -.65, 0, .65, 1.3]) {
    addMesh(root, new THREE.BoxGeometry(.055, .1, 2.1), materials.romanBrick, [x, .21, 0]);
  }
  for (const z of [-.72, .0, .72]) addMesh(root, new THREE.BoxGeometry(2.55, .1, .05), materials.romanBrick, [0, .21, z]);
  for (let row = 0; row < 4; row += 1) {
    const seat = new THREE.Mesh(new THREE.TorusGeometry(3.02 - row * .15, .065, 6, 96), row % 2 ? materials.limestoneAlt : materials.travertine);
    seat.scale.set(1, .76, 1); seat.rotation.x = Math.PI / 2; seat.position.y = .32 + row * .17;
    seat.castShadow = true; seat.receiveShadow = true; root.add(seat);
  }
  addHumanScale(root, materials, 25.4, [3.83, 0, 0]);
}

function makeModel(modelKey, root, materials, { interior, pyramidView, colosseumView }) {
  if (modelKey === 'great-pyramid') return makePyramid(root, materials, interior, pyramidView);
  if (modelKey === 'chichen-itza') return makeSteppedPyramid(root, materials);
  if (modelKey === 'parthenon') return makeParthenon(root, materials);
  return makeColosseum(root, materials, colosseumView);
}

function Monument3D({ modelKey }) {
  const canvasRef = useRef(null);
  const [interior, setInterior] = useState(false);
  const [pyramidView, setPyramidView] = useState('today');
  const [colosseumView, setColosseumView] = useState('today');
  const [scaleView, setScaleView] = useState(false);
  const [sceneError, setSceneError] = useState('');
  const info = monumentInfo[modelKey] || monumentInfo['great-pyramid'];

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    setSceneError('');
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d8d0bd');
    scene.fog = new THREE.Fog('#d8d0bd', 28, modelKey === 'chichen-itza' ? 82 : 58);
    const isGizaGroup = modelKey === 'great-pyramid';
    const camera = isGizaGroup
      ? new THREE.OrthographicCamera(-9.5, 9.5, 9.5, -9.5, .1, 180)
      : new THREE.PerspectiveCamera(34, 1, .1, 180);
    const cameraFrames = {
      'chichen-itza': { position: [26, 18, 29], target: [0, 2.05, 0], min: 10, max: 72 },
      parthenon: { position: [8, 5, 10], target: [0, .75, 0], min: 7.5, max: 30 },
      colosseum: { position: [8, 3.9, 9], target: [0, 1.05, 0], min: 4.5, max: 30 },
    };
    const scaleFrames = {
      'great-pyramid': { position: [5.38, .21, -1.05], target: [5.2, .07, -1.85] },
      'chichen-itza': { position: [.28, .45, -5.05], target: [0, .12, -4.05] },
      parthenon: { position: [.8, .85, 4.2], target: [0, .085, 2.0] },
      colosseum: { position: [4.1, .12, .2], target: [3.83, .035, 0] },
    };
    const cameraFrame = scaleView ? scaleFrames[modelKey] : cameraFrames[modelKey];
    camera.position.set(...(isGizaGroup ? (scaleView ? scaleFrames[modelKey].position : [20, 15, 22]) : cameraFrame?.position || [10, 7, 12]));
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .96;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .065;
    controls.minDistance = scaleView ? .12 : (isGizaGroup ? 9 : (cameraFrames[modelKey]?.min || 6));
    controls.maxDistance = isGizaGroup ? 58 : (cameraFrames[modelKey]?.max || 80);
    controls.maxPolarAngle = Math.PI * .48;
    const hemisphere = new THREE.HemisphereLight('#fff6e6', '#75624a', 1.45);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight('#fff1d6', 2.25);
    sun.position.set(-7, 10, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#b7c8d0', .55);
    fill.position.set(7, 5, -6);
    scene.add(fill);
    const root = new THREE.Group();
    scene.add(root);
    const materials = createMaterials();
    try {
      makeModel(modelKey, root, materials, { interior, pyramidView, colosseumView });
    } catch (error) {
      setSceneError('La maquette n’a pas pu être affichée. Les informations et les sources du lieu restent accessibles.');
      console.error('Échec de création de la maquette 3D', error);
    }
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      camera.aspect = bounds.width / bounds.height;
      if (camera.isOrthographicCamera) {
        const halfHeight = scaleView ? .29 : 9.5;
        camera.left = -halfHeight * camera.aspect;
        camera.right = halfHeight * camera.aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const target = scaleView ? scaleFrames[modelKey].target : (isGizaGroup ? [0, 1.5, -0.5] : (cameraFrames[modelKey]?.target || [0, 1.2, 0]));
    controls.target.set(...target);
    const frame = () => {
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(frame);
    };
    let animationId = requestAnimationFrame(frame);
    const preventTouchScroll = (event) => event.preventDefault();
    canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('touchmove', preventTouchScroll);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
        else object.material?.dispose?.();
      });
      materials.dispose();
      renderer.dispose();
    };
  }, [modelKey, interior, pyramidView, colosseumView, scaleView]);

  return (
    <section className="monument-model" aria-label={`Maquette 3D : ${info.title}`}>
      <div className="monument-model-heading">
        <div><span>ATELIER PATRIMOINE · 3D</span><h3>{info.title}</h3><p>{info.era}</p></div>
        <div className="model-gesture-hint" aria-hidden="true">Glisser pour tourner · Pincer ou molette pour zoomer</div>
      </div>
      <div className="model-controls" aria-label="Comparaison d’échelle">
        <button type="button" aria-pressed={!scaleView} className={!scaleView ? 'active' : ''} onClick={() => setScaleView(false)}>Vue d’ensemble</button>
        <button type="button" aria-pressed={scaleView} className={scaleView ? 'active' : ''} onClick={() => setScaleView(true)}>Comparer à une personne · 1,70 m</button>
      </div>
      <div className="monument-model-stage">
        <canvas ref={canvasRef} tabIndex={0} aria-label={`${info.title}, maquette 3D manipulable. ${info.dimensions}`} />
        <div className="model-stage-label"><span>{scaleView ? 'PERSONNAGE TÉMOIN · 1,70 M À L’ÉCHELLE' : 'MAQUETTE PÉDAGOGIQUE'}</span><span>{modelKey === 'great-pyramid' ? (pyramidView === 'origin' ? 'Restitution d’origine · Khéops ≈ 146,5 m' : 'État actuel schématique · Khéops ≈ 138 m') : modelKey === 'colosseum' ? (colosseumView === 'today' ? 'État actuel · secteur sud partiellement effondré' : 'Reconstitution des quatre niveaux extérieurs') : info.dimensions}</span></div>
        {sceneError && <p className="model-fallback" role="status">{sceneError}</p>}
      </div>
      {modelKey === 'great-pyramid' && (
        <div className="model-controls" aria-label="Vues de la Grande Pyramide">
          <button type="button" aria-pressed={!interior && pyramidView === 'today'} className={!interior && pyramidView === 'today' ? 'active' : ''} onClick={() => { setInterior(false); setPyramidView('today'); }}>Aujourd’hui</button>
          <button type="button" aria-pressed={!interior && pyramidView === 'origin'} className={!interior && pyramidView === 'origin' ? 'active' : ''} onClick={() => { setInterior(false); setPyramidView('origin'); }}>À l’origine</button>
          <button type="button" aria-pressed={interior} className={interior ? 'active' : ''} onClick={() => setInterior(true)}>Coupe intérieure</button>
        </div>
      )}
      {modelKey === 'colosseum' && (
        <div className="model-controls" aria-label="Vues du Colisée">
          <button type="button" aria-pressed={colosseumView === 'today'} className={colosseumView === 'today' ? 'active' : ''} onClick={() => setColosseumView('today')}>Aujourd’hui</button>
          <button type="button" aria-pressed={colosseumView === 'restored'} className={colosseumView === 'restored' ? 'active' : ''} onClick={() => setColosseumView('restored')}>Reconstitution</button>
        </div>
      )}
      <p className="monument-model-note">{info.note}</p>
      <p className="monument-model-credit">Modèle paramétrique créé pour l’application · rotation, zoom et cadrage libres · source des proportions : fiche patrimoniale du lieu.</p>
    </section>
  );
}

export default Monument3D;
