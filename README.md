# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
# emenage_ui




1. SECURITE & AUTHENTIFICATION (Critique)
1.1 - Mot de passe oublie (Self-Service Password Reset)
Actuellement, seul un admin peut reset un mot de passe. Il faut un flux POST /auth/forgot-password + POST /auth/reset-password avec token par SMS (ou email). C'est indispensable pour un systeme en production.

1.2 - Rate Limiting sur le login
Aucun throttle n'est visible sur POST /auth/login. Un attaquant peut bruteforcer les comptes. Il faut un ThrottleRequests middleware (ex: 5 tentatives / minute).

1.3 - Validation cote serveur avec Form Requests
Toute la logique de validation semble dans les controllers. Il faut extraire ca dans des FormRequest dedies (StoreUserRequest, StorePaymentRequest, etc.) pour la maintenabilite et la securite.

1.4 - Audit Logs / Journal d'activites
Aucune tracabilite des actions critiques (qui a valide quoi, qui a supprime un utilisateur, etc.). Il faut un systeme de logs d'audit avec table activity_logs (action, user_id, target, old_value, new_value, timestamp). Le package spatie/laravel-activitylog est ideal pour ca.

1.5 - Verification d'email / telephone
Aucune verification que l'email ou le telephone sont reels. Il faut au minimum un OTP par SMS pour valider le numero au Burundi.

2. FONCTIONNALITES METIER (Haute Priorite)
2.1 - Inscription autonome des citoyens
Actuellement, seul un admin/autorite peut creer un compte citoyen. Il faut un POST /auth/register permettant a un citoyen de s'inscrire lui-meme, avec validation par l'autorite de sa zone (workflow en_attente -> valide).

2.2 - Messagerie Citoyen <-> Autorite
Les citoyens n'ont aucun moyen de communiquer directement avec leur autorite locale. Un module de messagerie simple (tickets ou chat) serait tres utile :

Table messages (sender_id, receiver_id, subject, body, read_at)
Vue conversation dans le dashboard
2.3 - Generation PDF de la Carte d'Identite / Carnet de Menage
L'endpoint /identity-card retourne du JSON, mais il faut pouvoir generer un PDF imprimable avec QR code de verification. Meme chose pour le carnet de menage complet. Package recommande : barryvdh/laravel-dompdf.

2.4 - QR Code de verification
Chaque carte d'identite numerique devrait avoir un QR code scannable qui pointe vers une URL de verification publique (GET /verify/{token}). Ca permet a la police de verifier rapidement un document.

2.5 - Notifications par SMS
Les notifications sont uniquement in-app. Au Burundi, beaucoup de citoyens n'ont pas un acces constant a internet. Il faut un canal SMS (via une API comme Twilio, Africa's Talking, ou un fournisseur local) pour les notifications critiques : validation de membre, changement de statut d'incident, etc.

2.6 - Historique des paiements avec rappels
Ajouter un systeme de rappels automatiques pour les paiements recurrents (poubelles, eau, etc.) avec notification quand la date approche.

3. EXPERIENCE UTILISATEUR (Moyenne Priorite)
3.1 - Recherche globale
Pas de barre de recherche globale. Les autorites devraient pouvoir chercher un citoyen par nom/telephone, un menage par adresse, un signalement par description, etc. Un endpoint GET /search?q=... centralise.

3.2 - Internationalisation (i18n) - Francais + Kirundi
L'interface est uniquement en francais. Le Kirundi est la langue nationale et beaucoup de citoyens ne lisent pas le francais. Il faut ajouter vue-i18n cote frontend et les fichiers de traduction fr / rn (Kirundi).

3.3 - Mode hors ligne / PWA
Dans les zones rurales du Burundi, la connexion est intermittente. Transformer l'app en Progressive Web App avec cache des donnees critiques et synchronisation quand la connexion revient serait un gros plus.

3.4 - Pagination et filtres avances
Verifier que toutes les listes (utilisateurs, menages, paiements, signalements) ont une pagination cote serveur et des filtres avances (par date, par statut, par zone).

3.5 - Carte interactive pour les signalements
Le project.md mentionne Leaflet.js, mais il faut verifier que c'est bien implemente. Une vue carte avec tous les incidents de la zone, filtres par statut, serait tres utile pour la police et les autorites.

4. ARCHITECTURE & QUALITE DE CODE (Important)
4.1 - Service Layer
Toute la logique metier est dans les controllers. Il faut extraire dans des classes Service :

HouseholdService, PaymentService, CensusService, etc.
Les controllers ne devraient faire que : valider, appeler le service, retourner la reponse.
4.2 - API Resources / Transformers
Verifier que les reponses utilisent des JsonResource de Laravel pour standardiser le format de sortie et eviter d'exposer des colonnes sensibles.

4.3 - API Versioning
Aucun versioning API (/api/v1/...). Si l'app mobile arrive un jour, les anciennes versions ne pourront pas cohabiter avec les nouvelles.

4.4 - Tests automatises
Je ne vois pas de tests significatifs. Il faut au minimum :

Tests unitaires sur les Services/Models
Tests Feature sur chaque endpoint API
Tests de permissions (verifier que chaque role accede seulement a ce qu'il doit)
4.5 - Variable d'environnement pour l'URL API
L'URL http://localhost:8000/api est hardcodee dans api.js. Il faut utiliser import.meta.env.VITE_API_URL pour que ca marche en production.

5. FONCTIONNALITES AVANCEES (Pour la Suite)
5.1 - Tableau de bord analytique avance
Les stats actuelles sont basiques (compteurs + 2-3 graphiques). Ajouter :

Evolution temporelle (tendances mois par mois)
Taux de validation (% valide vs rejete)
Temps moyen de traitement des signalements
Heatmap des incidents par zone
Top zones par nombre de menages/paiements
5.2 - Systeme de documents officiels
Permettre aux citoyens de demander des documents officiels (attestation de residence, attestation de composition familiale) et aux autorites de les generer en PDF signe numeriquement.

5.3 - Integration Mobile Money
Au Burundi, Lumicash et Ecocash sont tres utilises. Integrer un paiement en ligne directement depuis la plateforme au lieu de simplement uploader un recu photo.

5.4 - Notifications push (temps reel)
Remplacer le polling toutes les 60 secondes par des WebSockets (Laravel Reverb ou Pusher) pour des notifications en temps reel.

5.5 - Export PDF des rapports
Les autorites devraient pouvoir generer un rapport PDF synthetique de leur zone : nombre de menages, membres, paiements, incidents, sur une periode donnee.

5.6 - Gestion des pieces jointes sur les signalements
Les reports n'ont qu'une description + GPS. Ajouter la possibilite de joindre des photos/videos de l'incident.

5.7 - Systeme de feedback / satisfaction
Apres resolution d'un incident, permettre au citoyen de noter la reactivite et la qualite de la resolution (1 a 5 etoiles + commentaire).

5.8 - Calendrier communautaire
Un module calendrier pour les evenements de la zone (reunions de colline, campagnes de vaccination, marches, etc.) lie aux annonces.

Resume par Priorite
Priorite	Fonctionnalite	Effort
Critique	Rate limiting login	Faible
Critique	Mot de passe oublie	Moyen
Critique	Form Request validation	Moyen
Critique	Audit logs	Moyen
Critique	URL API en variable d'env	Faible
Haute	Inscription autonome citoyen	Moyen
Haute	Notifications SMS	Moyen
Haute	Generation PDF (carte, carnet)	Moyen
Haute	QR Code verification	Faible
Haute	Service Layer refactoring	Eleve
Moyenne	Messagerie citoyen-autorite	Moyen
Moyenne	Recherche globale	Moyen
Moyenne	i18n (Kirundi)	Moyen
Moyenne	Tests automatises	Eleve
Moyenne	Photos sur signalements	Faible
Future	PWA / mode hors ligne	Eleve
Future	Mobile Money integration	Eleve
Future	WebSockets temps reel	Moyen
Future	Analytics avances	Moyen
Future	Documents officiels	Moyen
