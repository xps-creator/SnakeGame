/*
 * Snake : la logique du jeu (classe Partie) est séparée de l'affichage,
 * ce qui permet de la tester sans navigateur (voir tests.js).
 */
const DIRECTIONS = {
  haut: { x: 0, y: -1 }, bas: { x: 0, y: 1 }, gauche: { x: -1, y: 0 }, droite: { x: 1, y: 0 },
};
const OPPOSEES = { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' };

class Partie {
  constructor({ taille = 20, mursMortels = true, aleatoire = Math.random } = {}) {
    this.taille = taille;
    this.mursMortels = mursMortels;
    this.aleatoire = aleatoire;
    const milieu = Math.floor(taille / 2);
    this.serpent = [{ x: milieu, y: milieu }, { x: milieu - 1, y: milieu }, { x: milieu - 2, y: milieu }];
    this.direction = 'droite';
    this.fileDirections = [];
    this.score = 0;
    this.terminee = false;
    this.pomme = this.placerPomme();
  }

  get niveau() { return 1 + Math.floor(this.score / 5); }

  /* Délai entre deux déplacements : le jeu accélère à chaque niveau */
  get delai() { return Math.max(55, 150 - (this.niveau - 1) * 12); }

  /* Les changements de direction sont mis en file pour ne perdre aucune touche
     et pour empêcher un demi tour sur place en appuyant vite sur deux touches. */
  changerDirection(dir) {
    const derniere = this.fileDirections.at(-1) ?? this.direction;
    if (dir !== derniere && dir !== OPPOSEES[derniere] && this.fileDirections.length < 3) {
      this.fileDirections.push(dir);
    }
  }

  placerPomme() {
    const libres = [];
    for (let y = 0; y < this.taille; y++) {
      for (let x = 0; x < this.taille; x++) {
        if (!this.serpent.some((c) => c.x === x && c.y === y)) libres.push({ x, y });
      }
    }
    return libres.length ? libres[Math.floor(this.aleatoire() * libres.length)] : null;
  }

  /* Avance d'une case. Renvoie 'mange', 'mort' ou 'avance'. */
  avancer() {
    if (this.terminee) return 'mort';
    if (this.fileDirections.length) this.direction = this.fileDirections.shift();
    const d = DIRECTIONS[this.direction];
    let tete = { x: this.serpent[0].x + d.x, y: this.serpent[0].y + d.y };

    const dehors = tete.x < 0 || tete.y < 0 || tete.x >= this.taille || tete.y >= this.taille;
    if (dehors) {
      if (this.mursMortels) { this.terminee = true; return 'mort'; }
      tete = { x: (tete.x + this.taille) % this.taille, y: (tete.y + this.taille) % this.taille };
    }

    const mange = this.pomme && tete.x === this.pomme.x && tete.y === this.pomme.y;
    /* La queue se libère pendant ce tour, sauf si le serpent grandit */
    const corps = mange ? this.serpent : this.serpent.slice(0, -1);
    if (corps.some((c) => c.x === tete.x && c.y === tete.y)) { this.terminee = true; return 'mort'; }

    this.serpent = [tete, ...corps];
    if (mange) {
      this.score += 1;
      this.pomme = this.placerPomme();
      if (!this.pomme) this.terminee = true;
      return 'mange';
    }
    return 'avance';
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Partie };
} else {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const ecran = document.getElementById('ecran');
  const TAILLE = 20;
  const CASE = canvas.width / TAILLE;
  let partie = null;
  let enPause = false;
  let dernier = 0;

  const lireRecord = () => { try { return Number(localStorage.getItem('snake-record')) || 0; } catch { return 0; } };
  const ecrireRecord = (v) => { try { localStorage.setItem('snake-record', v); } catch { /* stockage indisponible */ } };
  document.getElementById('record').textContent = lireRecord();

  const dessiner = () => {
    ctx.fillStyle = '#0f1a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < TAILLE; y++) {
      for (let x = 0; x < TAILLE; x++) {
        if ((x + y) % 2) { ctx.fillStyle = '#13211a'; ctx.fillRect(x * CASE, y * CASE, CASE, CASE); }
      }
    }
    if (!partie) return;
    if (partie.pomme) {
      ctx.fillStyle = '#ff5a5f';
      ctx.beginPath();
      ctx.arc((partie.pomme.x + 0.5) * CASE, (partie.pomme.y + 0.5) * CASE, CASE * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    partie.serpent.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? '#b8f35a' : `hsl(${95 - Math.min(i, 30)}, 70%, ${55 - Math.min(i, 20)}%)`;
      ctx.beginPath();
      ctx.roundRect(c.x * CASE + 1.5, c.y * CASE + 1.5, CASE - 3, CASE - 3, 6);
      ctx.fill();
    });
  };

  const afficherEcran = (titre, texte, bouton) => {
    document.getElementById('ecran-titre').textContent = titre;
    document.getElementById('ecran-texte').textContent = texte;
    document.getElementById('jouer').textContent = bouton;
    ecran.hidden = false;
  };

  const majScores = () => {
    document.getElementById('score').textContent = partie.score;
    document.getElementById('niveau').textContent = partie.niveau;
  };

  const boucle = (t) => {
    if (!partie || partie.terminee) return;
    if (!enPause && t - dernier >= partie.delai) {
      dernier = t;
      const r = partie.avancer();
      if (r === 'mange') majScores();
      if (partie.terminee) {
        const record = Math.max(partie.score, lireRecord());
        ecrireRecord(record);
        document.getElementById('record').textContent = record;
        dessiner();
        afficherEcran(partie.pomme ? 'Perdu' : 'Gagné !', `Score : ${partie.score}. Record : ${record}.`, 'Rejouer');
        return;
      }
      dessiner();
    }
    requestAnimationFrame(boucle);
  };

  const demarrer = () => {
    partie = new Partie({ taille: TAILLE, mursMortels: document.getElementById('murs').checked });
    enPause = false;
    ecran.hidden = true;
    majScores();
    dessiner();
    requestAnimationFrame(boucle);
  };

  const pause = () => {
    if (!partie || partie.terminee) return;
    enPause = !enPause;
    if (enPause) afficherEcran('Pause', 'Appuyez sur Espace ou sur Reprendre.', 'Reprendre');
    else ecran.hidden = true;
  };

  document.getElementById('jouer').addEventListener('click', () => (enPause ? pause() : demarrer()));

  const touches = { ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite', z: 'haut', s: 'bas', q: 'gauche', d: 'droite' };
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (partie && !partie.terminee) pause(); else demarrer(); return; }
    const dir = touches[e.key] || touches[e.key.toLowerCase()];
    if (dir && partie) { e.preventDefault(); partie.changerDirection(dir); }
  });

  document.querySelectorAll('.manette button').forEach((b) => b.addEventListener('click', () => partie && partie.changerDirection(b.dataset.dir)));

  /* Glissements du doigt sur le plateau */
  let depart = null;
  canvas.addEventListener('touchstart', (e) => { depart = e.touches[0]; }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!depart || !partie) return;
    const dx = e.changedTouches[0].clientX - depart.clientX;
    const dy = e.changedTouches[0].clientY - depart.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
      partie.changerDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut'));
    }
    depart = null;
  });

  dessiner();
}
