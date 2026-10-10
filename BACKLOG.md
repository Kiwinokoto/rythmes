# Rythmes — état et suite (2026-10-10)

## Terminé dans la branche de reprise
- Projet historique retrouvé sur Mint et dépôt public `Kiwinokoto/rythmes` identifié.
- Source GitHub `main` et copie Mint comparées, copie historique laissée intacte.
- Interface circulaire responsive, ajout/suppression de pistes, pas 3–32, activation et sourdine indépendantes.
- Instruments de percussion synthétisés avec Web Audio ; BPM commun et contrôle de volume.
- Génération euclidienne, décalage, exemples de compositions, persistance dans le navigateur.
- Séquenceur à programmation anticipée sur une horloge AudioContext unique.
- Suppression des dépendances PHP/MySQL dans la version courante.

## Vérifié (2026-10-10)
- 7 tests unitaires Node réussis : Euclide, subdivisions 3:5, programmation horodatée, tempo à la frontière commune.
- Chromium headless : rendu (60 points), démarrage/arrêt de l'audio, tempo, ajout/suppression, clic, sourdine, sauvegarde/rechargement du volume.
- Vue mobile Chromium 390 px sans débordement horizontal ; capture d'écran relue.

## À vérifier avant fusion
- **Écoute réelle par Kevin** sur Mint/Brave/Chromium, qualité des sons et sensation de groove.
- Validation visuelle sur un vrai téléphone et navigateurs mobiles.
- Diff finale, Git HEAD, lease et état du dépôt.
- Alerte sécurité : mot de passe MySQL exposé par historique public de l'ancien dépôt ; planifier rotation avec inventaire des consommateurs de la base, sans coupure aveugle.

## Suite envisagée (hors périmètre v2)
- Samples acoustiques sous licences vérifiées, glisser-déposer de WAV personnels.
- Sauvegarde/chargement de motifs nommés et export/import de projets JSON.
- Choix de métriques (3/4, 5/4), swing, accents, probabilités, humanisation.
- AudioWorklet pour meilleur maintien en arrière-plan ; export WAV/MIDI.
- Claviers/contrôleurs MIDI et partage de compositions via URL.
