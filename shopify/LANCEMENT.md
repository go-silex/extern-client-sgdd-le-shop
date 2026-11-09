# SGDD Le Shop : mise en ligne sur Shopify

Commande sans paiement en ligne : le client valide, Marco reçoit la commande par email et dans Shopify, puis encaisse en boutique ou par virement.

## Ce que Marco fournit
- **Compte Shopify** : créé par Marco à son nom (il en est propriétaire), forfait Basic. Il nous ajoute en collaborateur.
- **Infos légales** : raison sociale, forme, capital, SIRET, RCS, n° TVA, email et téléphone de contact.
- **Email de réception des commandes** : l'adresse où il veut recevoir chaque commande.
- **Prix** : validation des 22 prix marqués `prix-a-valider` (seul le 59 € des hoodies est confirmé).
- **Stock réel** : comptage par taille et couleur (l'import contient un stock de départ fictif).
- **Nom de domaine** : un domaine à lui (ex. sgdd-leshop.fr), ou l'achat dans Shopify.
- **Photos** : idéalement des photos produits en meilleure définition (celles de Facebook font 414 px).

## Installation (dans l'ordre)
1. **Thème** : Boutique en ligne > Thèmes > Ajouter un thème > Importer un fichier ZIP > `sgdd-le-shop-theme-v3.zip`. Publier.
2. **Produits** : Produits > Importer > `import/produits-shopify.csv`. Les images se téléchargent depuis demo.gosilex.com : laisser la démo en ligne jusqu'à la fin de l'import.
3. **Collections automatisées** (Produits > Collections > Créer, condition « Balise produit est égale à ») :
   - Collection SGDD : `Collection SGDD`
   - SGDD Kids : `Kids`
   - Jay'M Riding : `Jay'M Riding`
   - Surf & Skate : `Surf & Skate`
   - Déco & vintage US : `Vintage US`
4. **Pages** (Boutique en ligne > Pages), contenu dans `pages/` :
   - La boutique : modèle `page.boutique`
   - Contact : modèle `page.contact`
   - Livraison & retours : modèle par défaut
   - Mentions légales : modèle par défaut, remplacer les champs en MAJUSCULES
5. **Menus** (Boutique en ligne > Navigation) :
   - `main-menu` : Tout le shop, les 5 collections, La boutique
   - `footer` (titre « Le shop ») : les 5 collections, Carte cadeau
   - `infos` (titre « Infos ») : Livraison & retours, Contact, Mentions légales
   - Thème > Personnaliser > Pied de page : menu colonne 2 = `infos`
6. **Accueil** : Thème > Personnaliser > Rayons : ajouter les 5 collections. Sélection d'articles : choisir la collection SGDD.
7. **Paiement** : ne pas activer Shopify Payments. Créer le mode manuel (texte dans `textes-shopify.md`).
8. **Livraison** (Réglages > Expédition et livraison) :
   - Zone France : Colissimo 5,90 € de 0 à 79,99 €, gratuit dès 80 €
   - Retrait en magasin : activer pour le 7 place de Verdun, « Prêt sous 24 h »
9. **Taxes** : prix TTC, TVA France 20 % (Réglages > Taxes et droits).
10. **Notifications** : Réglages > Notifications > destinataires des commandes = email de Marco. Adapter la confirmation client (texte fourni).
11. **Politiques** : Réglages > Politiques > créer à partir des modèles Shopify (remboursement, confidentialité, conditions de vente, expédition), puis relire.
12. **Carte cadeau** : vérifier que le produit importé « Carte cadeau » est bien de type carte cadeau.
13. **Domaine** : Réglages > Domaines > connecter le domaine de Marco.

## Avant d'ouvrir
- **Commande test** : passer une commande en retrait et une en Colissimo. Vérifier l'email reçu par Marco, l'email client, la décrémentation du stock.
- **Mobile** : parcourir accueil, fiche, panier, commande sur téléphone.
- **Ouverture** : retirer le mot de passe (Boutique en ligne > Préférences).
- **Après** : connecter le canal Facebook & Instagram pour vendre depuis sa page (optionnel).

## Pour plus tard
- **Paiement en ligne** : activer Shopify Payments (SIRET, IBAN, pièce d'identité) ; le thème n'a rien à changer.
- **Caisse en boutique** : Shopify POS sur téléphone, mêmes stocks qu'en ligne.
