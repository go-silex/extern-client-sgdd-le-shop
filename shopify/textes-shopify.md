# Textes à coller dans Shopify

## Mode de règlement manuel
Réglages > Paiements > Modes de paiement manuels > Créer un mode personnalisé

- **Nom** : Règlement au retrait ou après confirmation
- **Informations complémentaires** : Aucun paiement en ligne. Marco vous contacte sous 24 h pour confirmer la commande et le règlement.
- **Instructions de paiement** : Nous avons bien reçu votre commande. Marco vous contacte sous 24 h. Règlement en boutique (carte, espèces) au retrait, ou par virement pour un envoi Colissimo.

## Email de confirmation de commande (client)
Réglages > Notifications > Confirmation de commande : remplacer la phrase d'introduction par

> Merci pour votre commande ! Aucun paiement n'a été pris en ligne. Marco vous contacte sous 24 h pour le règlement et le retrait ou l'envoi.

## Message de la page d'attente (avant lancement)
Boutique en ligne > Préférences > Protection par mot de passe

> La boutique en ligne ouvre très vite. En attendant, on vous attend place de Verdun.

## Pièges rencontrés à l'import
- Un champ `url` n'accepte comme valeur par défaut que `/collections` ou `/collections/all`. Une adresse externe (Google Maps) fait refuser la section sans message, et tous les modèles qui l'utilisent tombent avec. Theme Check ne le détecte pas.
- `config/settings_data.json` doit contenir toutes les valeurs : Shopify ne reprend pas les valeurs par défaut du schéma pour un preset vide.
