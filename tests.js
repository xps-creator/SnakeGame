/* Tests de la logique du jeu, sans navigateur : node tests.js */
const assert = require('node:assert');
const { Partie } = require('./snake.js');

const tests = {
  'le serpent avance dans sa direction'() {
    const p = new Partie({ taille: 10 });
    const tete = { ...p.serpent[0] };
    p.avancer();
    assert.deepStrictEqual(p.serpent[0], { x: tete.x + 1, y: tete.y });
    assert.strictEqual(p.serpent.length, 3);
  },
  'un demi tour sur place est ignoré'() {
    const p = new Partie({ taille: 10 });
    p.changerDirection('gauche');
    p.avancer();
    assert.strictEqual(p.direction, 'droite');
  },
  'deux touches rapides ne permettent pas de revenir sur soi'() {
    const p = new Partie({ taille: 10 });
    p.changerDirection('haut');
    p.changerDirection('gauche');
    p.avancer();
    p.avancer();
    assert.strictEqual(p.terminee, false);
    assert.strictEqual(p.direction, 'gauche');
  },
  'manger une pomme fait grandir et marque un point'() {
    const p = new Partie({ taille: 10 });
    p.pomme = { x: p.serpent[0].x + 1, y: p.serpent[0].y };
    assert.strictEqual(p.avancer(), 'mange');
    assert.strictEqual(p.serpent.length, 4);
    assert.strictEqual(p.score, 1);
  },
  'la pomme n\'apparaît jamais sur le serpent'() {
    for (let i = 0; i < 200; i++) {
      const p = new Partie({ taille: 6 });
      assert.ok(!p.serpent.some((c) => c.x === p.pomme.x && c.y === p.pomme.y));
    }
  },
  'toucher un mur est mortel quand l\'option est active'() {
    const p = new Partie({ taille: 6 });
    let r;
    for (let i = 0; i < 6; i++) r = p.avancer();
    assert.strictEqual(r, 'mort');
  },
  'sans murs, le serpent réapparaît de l\'autre côté'() {
    const p = new Partie({ taille: 6, mursMortels: false });
    p.pomme = null;
    for (let i = 0; i < 3; i++) p.avancer();
    assert.strictEqual(p.serpent[0].x, 0);
    assert.strictEqual(p.terminee, false);
  },
  'se mordre la queue est mortel'() {
    const p = new Partie({ taille: 10 });
    p.serpent = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
    p.pomme = { x: 0, y: 0 };
    p.changerDirection('bas');
    assert.strictEqual(p.avancer(), 'mort');
  },
  'avancer dans la case que la queue quitte est permis'() {
    const p = new Partie({ taille: 10 });
    p.serpent = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }];
    p.direction = 'haut';
    p.pomme = { x: 0, y: 0 };
    p.changerDirection('gauche');
    assert.strictEqual(p.avancer(), 'avance');
  },
  'le jeu accélère avec le niveau'() {
    const p = new Partie();
    const lent = p.delai;
    p.score = 20;
    assert.ok(p.delai < lent);
  },
};

let echecs = 0;
for (const [nom, test] of Object.entries(tests)) {
  try { test(); console.log(`ok   ${nom}`); } catch (e) { echecs++; console.log(`ÉCHEC ${nom}\n     ${e.message}`); }
}
console.log(`\n${Object.keys(tests).length - echecs} réussis, ${echecs} en échec`);
process.exit(echecs ? 1 : 0);
