// Catalogue SGDD Le Shop (default data; the admin space edits a copy in localStorage).
// Only one price is visible in the shop photos (59 € label next to the hoodies).
// Every other price is a placeholder to validate with Marco: priceConfirmed = false.
window.CATEGORIES = [
  { id: 'sgdd', name: 'La collection SGDD', short: 'Collection SGDD', blurb: 'Nos dessins maison : le phare, la vague, le chopper.' },
  { id: 'kids', name: 'SGDD Kids', short: 'Kids', blurb: 'Les mêmes dessins, en taille enfant.' },
  { id: 'jaym', name: "Jay'M Riding", short: "Jay'M Riding", blurb: 'La marque riding qui a sa place sur nos murs.' },
  { id: 'surf-skate', name: 'Surf & Skate', short: 'Surf & Skate', blurb: 'Decks, surfskates et dérives.' },
  { id: 'vintage', name: 'Déco & vintage US', short: 'Vintage US', blurb: "Fanions, stickers et pièces d'Amérique." }
];

const P = 'assets/photos/';
const F = 'assets/photos/fb/';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const KIDS = ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans'];

window.PRODUCTS = [
  {
    id: 'hoodie-phare-chopper', cat: 'sgdd', type: 'Hoodie', name: 'Hoodie Phare & Chopper',
    price: 59, priceConfirmed: true, badge: 'Best-seller', stock: 24,
    imgs: [F + 'hoodie-rose.jpg', P + 'crop-hoodie-creme.jpg', F + 'hoodie-rose-detail.jpg'],
    colors: [{ name: 'Rose', hex: '#f3c6cf' }, { name: 'Crème', hex: '#efe6d2' }], sizes: SIZES,
    desc: "Le chopper passe devant le phare, voile au vent. Grand visuel au dos, logo SGDD sur la poitrine.",
    details: ['Impression dos + poitrine', 'Molleton épais', 'Coupe unisexe']
  },
  {
    id: 'hoodie-phare-surf', cat: 'sgdd', type: 'Hoodie', name: 'Hoodie Phare & Surf',
    price: 59, priceConfirmed: true, stock: 12,
    imgs: [P + 'crop-hoodie-cyan.jpg', F + 'dessin-chien-surf.jpg'],
    colors: [{ name: 'Bleu lagon', hex: '#a9dedb' }], sizes: SIZES,
    desc: "Le surfeur en chemise hawaïenne devant le phare. Impression dos, logo SGDD poitrine.",
    details: ['Impression dos + poitrine', 'Molleton épais', 'Coupe unisexe']
  },
  {
    id: 'tee-phare-chopper', cat: 'sgdd', type: 'T-shirt', name: 'T-shirt Phare & Chopper',
    price: 29, priceConfirmed: false, badge: 'Nouveau', stock: 40,
    imgs: [F + 'tee-rose.jpg', F + 'tee-ciel.jpg', F + 'tee-creme-dos.jpg'],
    colors: [{ name: 'Rose', hex: '#f3c6cf' }, { name: 'Ciel', hex: '#c9dcef' }, { name: 'Crème', hex: '#efe6d2' }], sizes: SIZES,
    desc: "Le dessin phare et chopper au dos, petit logo devant. Le t-shirt de l'été à Saint-Georges.",
    details: ['Coton épais', 'Impression dos + poitrine', 'Coupe droite']
  },
  {
    id: 'sweat-sgdd-college', cat: 'sgdd', type: 'Sweat', name: 'Sweat SGDD College',
    price: 55, priceConfirmed: false, stock: 18,
    imgs: [F + 'sweats-college.jpg', F + 'sweat-vert.jpg', P + 'portant-sweats.jpg'],
    colors: [{ name: 'Bleu roi', hex: '#1f5fae' }, { name: 'Gris chiné', hex: '#b9b9b6' }, { name: 'Vert', hex: '#2f8f6b' }, { name: 'Rose', hex: '#efc0cc' }],
    sizes: SIZES,
    desc: "Le sweat col rond façon campus, gros lettrage SGDD sur la poitrine.",
    details: ['Lettrage poitrine', 'Molleton gratté', 'Bords côtes']
  },
  {
    id: 'veste-capuche-sgdd', cat: 'sgdd', type: 'Veste', name: 'Veste à capuche SGDD brodée',
    price: 79, priceConfirmed: false, stock: 8,
    imgs: [F + 'veste-capuche-noire.jpg', F + 'broderie-noir.jpg'],
    colors: [{ name: 'Noir', hex: '#16181d' }], sizes: SIZES,
    desc: "Veste zippée à capuche, logo SGDD skate brodé sur la poitrine. Pour les soirées sur le front de mer.",
    details: ['Logo brodé', 'Zip intégral', 'Poches côtés']
  },
  {
    id: 'polo-sgdd', cat: 'sgdd', type: 'Polo', name: 'Polo SGDD',
    price: 45, priceConfirmed: false, stock: 10,
    imgs: [F + 'polo-blanc.jpg', F + 'polo-golf.jpg', F + 'broderie-creme.jpg'],
    colors: [{ name: 'Blanc', hex: '#f7f7f5' }], sizes: SIZES,
    desc: "Polo blanc, logo SGDD brodé. Du golf au déjeuner en terrasse.",
    details: ['Piqué de coton', 'Logo brodé', 'Col boutonné']
  },
  {
    id: 'coach-monster-shop', cat: 'sgdd', type: 'Veste', name: 'Coach jacket SGDD Monster Shop',
    price: 69, priceConfirmed: false, stock: 6,
    imgs: [P + 'crop-coach-monster.jpg'],
    colors: [{ name: 'Noir', hex: '#16181d' }], sizes: SIZES,
    desc: "Coupe-vent léger, col chemise et boutons pression. Lettrage SGDD Monster Shop jaune et rouge.",
    details: ['Nylon déperlant', 'Doublure légère', 'Cordon de serrage']
  },
  {
    id: 'tee-sgdd-chopper', cat: 'sgdd', type: 'T-shirt', name: 'T-shirt SGDD Chopper',
    price: 29, priceConfirmed: false, stock: 15,
    imgs: [P + 'crop-tee-chopper.jpg'],
    colors: [{ name: 'Blanc', hex: '#f7f5ef' }], sizes: SIZES,
    desc: "Le chopper qui file au pied du phare, grand visuel couleur sur le devant.",
    details: ['Coton épais', 'Impression devant', 'Coupe droite']
  },
  {
    id: 'casquette-trucker-sgdd', cat: 'sgdd', type: 'Casquette', name: 'Casquette trucker SGDD',
    price: 28, priceConfirmed: false, badge: 'Nouveau', stock: 30,
    imgs: [F + 'casquettes-sgdd.jpg'],
    colors: [{ name: 'Rouge', hex: '#c9302c' }, { name: 'Orange', hex: '#e8762b' }, { name: 'Vert', hex: '#2f8f4e' }], sizes: ['Unique'],
    desc: "Trucker 5 pans, logo SGDD brodé. Rouge, orange ou vert, comme le feu de la place.",
    details: ['Filet arrière', 'Logo brodé', 'Réglable']
  },
  {
    id: 'tote-sgdd', cat: 'sgdd', type: 'Accessoire', name: 'Tote bag SGDD Chopper',
    price: 15, priceConfirmed: false, stock: 25,
    imgs: [P + 'crop-tote.jpg'],
    colors: [{ name: 'Écru', hex: '#efe9dc' }], sizes: ['Unique'],
    desc: "Le tote du marché du dimanche. Toile épaisse, visuel phare et chopper.",
    details: ['Toile de coton', 'Anses longues', '38 x 42 cm']
  },
  {
    id: 'hoodie-enfant', cat: 'kids', type: 'Hoodie', name: 'Hoodie enfant Phare & Chopper',
    price: 45, priceConfirmed: false, badge: 'Kids', stock: 14,
    imgs: [F + 'hoodie-enfant.jpg', F + 'hoodie-enfant-dos.jpg', F + 'hoodie-enfant-chariot.jpg'],
    colors: [{ name: 'Ciel', hex: '#b9cfe8' }], sizes: KIDS,
    desc: "Le hoodie des grands, en taille enfant. Le chopper au dos, logo SGDD devant.",
    details: ['Molleton doux', 'Impression dos', 'Du 4 au 12 ans']
  },
  {
    id: 'sweat-enfant', cat: 'kids', type: 'Sweat', name: 'Hoodie & sweat enfant gris',
    price: 42, priceConfirmed: false, stock: 9,
    imgs: [F + 'sweat-enfant-gris.jpg'],
    colors: [{ name: 'Gris chiné', hex: '#b9b9b6' }], sizes: KIDS,
    desc: "Gris chiné, logo SGDD brodé devant et dessin chopper au dos.",
    details: ['Molleton doux', 'Impression dos', 'Du 4 au 12 ans']
  },
  {
    id: 'tee-enfant', cat: 'kids', type: 'T-shirt', name: 'T-shirt enfant Phare & Chopper',
    price: 22, priceConfirmed: false, stock: 20,
    imgs: [F + 'tee-enfant-rose.jpg', F + 'tee-enfant-creme.jpg'],
    colors: [{ name: 'Rose', hex: '#f3c6cf' }, { name: 'Crème', hex: '#efe6d2' }], sizes: KIDS,
    desc: "Le t-shirt phare et chopper pour les petits riders.",
    details: ['Coton doux', 'Impression dos', 'Du 4 au 12 ans']
  },
  {
    id: 'sherpa-jaym', cat: 'jaym', type: 'Veste', name: "Veste sherpa Jay'M Riding",
    price: 89, priceConfirmed: false, badge: 'Nouveau', stock: 7,
    imgs: [F + 'sherpa-jaym.jpg', P + 'crop-jaym-sign.jpg'],
    colors: [{ name: 'Sable', hex: '#cdb999' }], sizes: SIZES,
    desc: "Veste polaire unisexe en sherpa, broderie Jay'M Riding. Matière principale 100 % recyclée.",
    details: ['Sherpa 100 % recyclé', 'Broderie poitrine', 'Unisexe']
  },
  {
    id: 'cap-jaym', cat: 'jaym', type: 'Casquette', name: "Casquette Jay'M Riding",
    price: 32, priceConfirmed: false, stock: 11,
    imgs: [P + 'crop-cap-jaym.jpg', F + 'jaym-logo.jpg'],
    colors: [{ name: 'Sable', hex: '#e2cf9f' }], sizes: ['Unique'],
    desc: "Casquette 6 pans couleur sable, logo Jay'M brodé. Réglable à l'arrière.",
    details: ['Coton sergé', 'Broderie devant', 'Réglable']
  },
  {
    id: 'derive-jaym', cat: 'jaym', type: 'Surf', name: "Dérive Jay'M Riding",
    price: 45, priceConfirmed: false, stock: 3,
    imgs: [P + 'crop-derives.jpg'], fit: 'contain',
    colors: [{ name: 'Résine ambrée', hex: '#e8d07a' }, { name: 'Résine fleurs', hex: '#e59a5a' }], sizes: ['Unique'],
    desc: "Dérive en résine teintée, logo Jay'M. Pour le longboard ou au mur.",
    details: ['Résine coulée', 'Boîtier US', 'Teinte unique']
  },
  {
    id: 'deck-santa-cruz', cat: 'surf-skate', type: 'Skate', name: 'Deck Santa Cruz Flame',
    price: 89, priceConfirmed: false, stock: 2,
    imgs: [P + 'crop-deck-santa-cruz.jpg'], fit: 'contain',
    colors: [{ name: 'Gris flammes', hex: '#8d8f93' }], sizes: ['Unique'],
    desc: "Réédition old school, shape large, damier et flammes. Pour rider ou pour le mur.",
    details: ['Érable 7 plis', 'Shape old school', 'Sans grip ni trucks']
  },
  {
    id: 'surfskate-wave', cat: 'surf-skate', type: 'Skate', name: 'Surfskate Bleu Océan',
    price: 189, priceConfirmed: false, stock: 0,
    imgs: [P + 'crop-surfskate.jpg'], fit: 'contain',
    colors: [{ name: 'Bleu océan', hex: '#8fcfe0' }], sizes: ['Unique'],
    desc: "Le surfskate pour travailler ses virages sur la promenade quand l'océan est à plat.",
    details: ['Truck avant surfskate', 'Roues 65 mm', 'Livré monté']
  },
  {
    id: 'sticker-fanion', cat: 'vintage', type: 'Déco', name: 'Sticker fanion SGDD',
    price: 5, priceConfirmed: false, stock: 120,
    imgs: [F + 'sticker-moto.jpg', F + 'sticker-casque.jpg'],
    colors: [{ name: 'Rouge & jaune', hex: '#c9302c' }], sizes: ['Unique'],
    desc: "Le fanion SGDD en sticker vinyle. Sur le réservoir, le casque ou la planche.",
    details: ['Vinyle extérieur', 'Résiste à la pluie', '12 cm']
  },
  {
    id: 'fanion-sgdd', cat: 'vintage', type: 'Déco', name: 'Fanion SGDD',
    price: 19, priceConfirmed: false, stock: 16,
    imgs: [P + 'crop-fanion.jpg'],
    colors: [{ name: 'Marine & jaune', hex: '#1c2f6b' }], sizes: ['Unique'],
    desc: "Le fanion feutrine façon campus américain, SGDD en lettres jaunes.",
    details: ['Feutrine', 'Lettrage cousu', '30 x 75 cm']
  },
  {
    id: 'veste-travail', cat: 'vintage', type: 'Veste', name: 'Veste de travail Bleu de Chine',
    price: 79, priceConfirmed: false, stock: 4,
    imgs: [P + 'crop-veste-travail.jpg'],
    colors: [{ name: 'Bleu de Chine', hex: '#23356e' }], sizes: SIZES,
    desc: "La veste de travail française, coton épais, trois poches plaquées.",
    details: ['Coton sergé', '3 poches plaquées', 'Boutons métal']
  },
  {
    id: 'ballon-harlem', cat: 'vintage', type: 'Déco', name: 'Ballon Spalding Harlem Globetrotters',
    price: 35, priceConfirmed: false, stock: 5,
    imgs: [P + 'crop-ballon.jpg'], fit: 'contain',
    colors: [{ name: 'Stars & Stripes', hex: '#c8323a' }], sizes: ['Taille 7'],
    desc: "Le ballon des Globetrotters, aux couleurs du drapeau.",
    details: ['Spalding', 'Taille 7', 'Livré dégonflé']
  },
  {
    id: 'affiche-surf-chopper', cat: 'vintage', type: 'Déco', name: 'Affiche encadrée Surf & Chopper',
    price: 45, priceConfirmed: false, stock: 3,
    imgs: [P + 'crop-cadre-pinup.jpg'], fit: 'contain',
    colors: [{ name: 'Cadre blanc', hex: '#f4f4f2' }], sizes: ['40 x 30 cm'],
    desc: "Illustration pin-up surf et chopper sur la plage, sous cadre blanc.",
    details: ['Impression giclée', 'Cadre bois blanc', '40 x 30 cm']
  },
  {
    id: 'carte-cadeau', cat: 'sgdd', type: 'Carte cadeau', name: 'Carte cadeau SGDD Le Shop',
    price: 50, priceConfirmed: false, giftCard: true, stock: 999,
    imgs: [],
    colors: [{ name: '25 €', hex: '#f7c623', price: 25 }, { name: '50 €', hex: '#d62b2b', price: 50 }, { name: '100 €', hex: '#1c2f6b', price: 100 }],
    sizes: ['E-carte'],
    desc: "À utiliser en ligne ou place de Verdun. Envoyée par email, valable un an.",
    details: ['Envoi par email', 'Valable 12 mois', 'En ligne et en boutique']
  }
];

// Photos the admin can pick from (shop photos + Facebook page).
window.PHOTO_LIBRARY = [
  ...['hoodie-rose', 'hoodie-rose-detail', 'tee-rose', 'tee-ciel', 'tee-creme-dos', 'sweats-college', 'sweat-vert', 'veste-capuche-noire', 'broderie-noir', 'polo-blanc', 'polo-golf', 'broderie-creme', 'casquettes-sgdd', 'hoodie-enfant', 'hoodie-enfant-dos', 'hoodie-enfant-chariot', 'sweat-enfant-gris', 'tee-enfant-rose', 'tee-enfant-creme', 'sherpa-jaym', 'jaym-logo', 'sticker-moto', 'sticker-casque', 'casque-sweat', 'dessin-surf', 'dessin-velo', 'dessin-chien-surf', 'logo-moto'].map(n => F + n + '.jpg'),
  ...['crop-hoodie-cyan', 'crop-hoodie-creme', 'crop-coach-monster', 'crop-tee-chopper', 'crop-tote', 'crop-cap-jaym', 'crop-derives', 'crop-deck-santa-cruz', 'crop-surfskate', 'crop-fanion', 'crop-veste-travail', 'crop-ballon', 'crop-cadre-pinup', 'crop-jaym-sign', 'portant-sweats'].map(n => P + n + '.jpg')
];
