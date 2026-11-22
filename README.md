# Snake

Le jeu du serpent en JavaScript, jouable dans le navigateur, au clavier comme sur téléphone.

## Jouer

Ouvrir `index.html` dans un navigateur.

* Flèches ou touches Z, Q, S, D pour diriger le serpent
* Espace pour démarrer, mettre en pause ou reprendre
* Sur téléphone : glisser le doigt sur le plateau ou utiliser les boutons
* Option « murs mortels » : décochée, le serpent traverse les bords et réapparaît de l'autre côté

Le serpent accélère tous les cinq points. Le record est gardé dans le navigateur.

## Comment c'est construit

* **Logique séparée de l'affichage** : la classe `Partie` gère le serpent, la pomme, les collisions et le score sans toucher au navigateur. L'affichage sur `canvas` se contente de la dessiner.
* **File de directions** : les touches sont mises en file pour qu'aucune ne soit perdue, et un demi tour sur place est impossible même en appuyant très vite sur deux touches.
* **Collisions justes** : le serpent peut entrer dans la case que sa queue vient de quitter.
* **Pomme toujours sur une case libre**, tirée parmi les cases que le serpent n'occupe pas.
* **Boucle de jeu** avec `requestAnimationFrame` et un délai qui diminue avec le niveau.

## Tests

```bash
node tests.js
```

Dix tests couvrent les déplacements, la file de directions, la croissance, les murs, les collisions et l'accélération.

## Auteur

Nizar, élève ingénieur en Data Science et IA à CESI.
[LinkedIn](https://www.linkedin.com/in/nizar-outski-549941383/)
