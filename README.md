# Rythmes — studio circulaire

Boîte à rythmes polyrythmique dans le navigateur, inspirée des expériences de déformation rythmique de [Mathémusique](https://www.youtube.com/watch?v=indkKkGX5wg). Reprise du projet PHP/JavaScript historique (2026).

## Démarrer

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Puis ouvrir http://127.0.0.1:5173/ dans Chromium, Firefox ou Brave. Un serveur HTTP **statique** suffit pour les modules JavaScript. Pas de dépendance npm, de PHP ni de base de données.

- **Écouter** : active l'audio dans le navigateur ; **Arrêter** stoppe le transport.
- **Tempo** : 40 à 220 BPM, commun à toutes les pistes ; les changements pendant la lecture s'appliquent à la prochaine mesure.
- **Pas** : subdivisions par cercle, de 3 à 32 ; chaque tour représente **une mesure de 4 temps**.
- **Frappes / décalage / Répartir** : générateur euclidien, ou cliquer directement sur les points pour une édition manuelle.
- Ajouter jusqu'à 7 pistes, supprimer, renommer, changer leur instrument, les rendre muettes.
- 9 sons de percussion synthétisés avec Web Audio, volume principal, trois exemples de rythmes.
- Sauvegarde automatique locale (localStorage) : aucune requête vers une API, aucun compte.

## Comment la synchronisation fonctionne

**Une seule horloge Web Audio** : tous les événements sont horodatés dans `AudioContext.currentTime`. Le planificateur se réveille environ toutes les 25 ms et programme à l'avance sur 140 ms ; les sons ne partent jamais directement depuis le callback du timer. Une mesure dure `240 / BPM` secondes ; chaque piste partage le début de mesure et calcule ses pas comme `début + index × durée / subdivisions`. L'animation suit cette horloge, mais ne la commande pas.

Limite : les navigateurs peuvent ralentir les timers en arrière-plan, ce qui peut interrompre le flux de programmation. Pour une vraie robustesse longue durée, passer le scheduler dans un AudioWorklet. Aucune promesse de synchronisation MIDI externe pour cette version.

## Développement

```sh
node --test tests/*.test.mjs
node tests/browser-smoke.mjs  # Nécessite Chromium local
```

`index.html` interface ; `style.css` responsive ; `app.js` état/UI ; `audio-engine.js` horloge et synthèse ; `rhythm.js` calculs. Le fichier WAV historique subsiste mais n'est pas joué.

**Sécurité** : les anciens fichiers PHP publiés contenaient des identifiants MySQL. Ils sont supprimés de la nouvelle branche, **pas** de l'historique Git public ; prévoir une rotation coordonnée sans interrompre les autres applications.
