# SGDD Le Shop : le site internet

Le site de **SGDD Le Shop**, concept store surf, skate et chopper au 7 place de Verdun, Saint-Georges-de-Didonne.

## Par où commencer

**Ouvre le guide** : [le guide de mise en ligne](https://demo.gosilex.com/sgdd-863f/guide.html) (aussi dans ce dossier : `guide.html`). Il explique tout, pas à pas, pour mettre la boutique en ligne :

- **Chemin A, Shopify** : la boutique toute prête, avec une vraie arrière-boutique et l'appli sur téléphone.
- **Chemin B, ton propre site** : ce site-ci, hébergé gratuitement, les commandes arrivent par email.

Le guide compare les deux (pour et contre) et détaille chaque étape clic par clic.

## Les liens

- **Démo du site** : https://unkill.si/sgdd
- **Thème Shopify et liste d'articles à télécharger** : [page Releases](https://github.com/go-silex/extern-client-sgdd-le-shop/releases/latest)
- **Télécharger tout le site** : bouton vert `Code` puis `Download ZIP`

## Ce qu'il y a dans ce dossier

| Fichier ou dossier | À quoi il sert |
|---|---|
| `config.js` | Les réglages : mode démo ou vrai site, adresse qui reçoit les commandes, livraison. À modifier en premier. |
| `products.js` | Le catalogue : nom, prix, stock, photos, couleurs, tailles de chaque article. |
| `assets/photos/` | Les photos de la boutique et des articles. |
| `index.html`, `styles.css`, `app.js` | Le site lui-même (pages, design, panier, commande). |
| `admin.js` | L'espace gérant de démonstration (désactivé en mode vrai site). |
| `guide.html` | Le guide de mise en ligne. |
| `shopify/` | Tout pour Shopify : le thème (`sgdd-le-shop-theme-v3.zip` et ses sources dans `theme/`), la liste d'articles (`import/produits-shopify.csv`), les textes des pages (`pages/`), la procédure (`LANCEMENT.md`). |
| `scripts/smoke.mjs` | Contrôle automatique facultatif : `node scripts/smoke.mjs` vérifie qu'aucune photo ni aucun article ne manque. |

## Passer le site en vrai (chemin B, résumé)

1. Crée un formulaire sur [formspree.io](https://formspree.io) avec l'email de la boutique.
2. Dans `config.js` : `mode: 'live'` et `orderEndpoint: 'https://formspree.io/f/...'`.
3. Glisse le dossier sur [app.netlify.com/drop](https://app.netlify.com/drop).

Le détail est dans le guide.

## Bon à savoir

- Aucun paiement en ligne : le client valide sa commande, la boutique le rappelle, il règle en boutique ou par virement.
- Les prix sont à confirmer (seul le prix des hoodies, 59 €, est certain) et les stocks sont fictifs.
- Les photos viennent de la page Facebook de la boutique.

Préparé par Pierre Paris, Unkillable Companies : p@unkillablecompanies.com
