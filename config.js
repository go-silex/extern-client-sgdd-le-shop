// Réglages du site SGDD Le Shop. C'est le seul fichier à modifier pour passer en ligne.
window.SGDD_CONFIG = {
  // 'demo' : site de démonstration (espace gérant de démo, rien n'est envoyé).
  // 'live' : vrai site. Chaque commande est envoyée par email à la boutique.
  mode: 'demo',

  // Adresse du formulaire qui transforme une commande en email (voir le guide, étape « Recevoir les commandes »).
  // Exemple : 'https://formspree.io/f/abcdwxyz'
  orderEndpoint: '',

  // Livraison et retrait affichés sur le site.
  settings: {
    freeShip: 80,        // livraison offerte dès ce montant (en euros)
    shipCost: 5.9,       // frais Colissimo (en euros)
    collect: true,       // proposer le retrait gratuit en boutique
    announce: '',        // message optionnel en haut du site
    hours: 'Horaires et arrivages publiés sur notre page Facebook.'
  }
};
