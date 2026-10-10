# AGENTS.md — Rythmes

- Source de vérité : GitHub `Kiwinokoto/rythmes` (`main`). Branche de reprise `dev/audio-engine-v2`, base `568f97e` ; ne pas réécrire l'historique.
- Copie historique Mint non Git : `~/Bureau/www/rythmes`, laissée intacte ; elle diffère de `main`. Copie de travail : `~/Bureau/rythmes-reprise`.
- Avant d'écrire/committer/pousser : vérifier Git et conflits, AgentCtl et lease exclusif `repo:Kiwinokoto/rythmes`. Projet AgentCtl enregistré `rythmes`.
- Stack v2 : fichiers HTML, CSS, modules JS. Sans API, base MySQL, PHP, framework ni dépendances.
- `audio-engine.js` possède le transport musical unique (horloge `AudioContext.currentTime`, scheduling anticipé). Jamais de `setInterval` sonore par piste.
- Une mesure 4/4 = un tour = 240/BPM secondes. Les subdivisions indépendantes partagent son point de départ.
- `rhythm.js` contient les fonctions pures et doit rester couvert par `tests/rhythm.test.mjs`. Tester aussi réellement l'UI et l'écoute avant fusion.
- Stockage JSON `localStorage` uniquement ; ne stocker aucun secret ou identifiant.
- Risque non résolu : mot de passe MySQL historique présent dans l'historique **public** du repo ; suppression de HEAD insuffisante, rotation nécessaire après inventaire des dépendants (notamment la base commune). Ne pas forcer l'historique ni couper les accès sans accord.
- Ne pas fusionner dans `main` tant que l'écoute humaine et les limitations navigateur ne sont pas revues.
