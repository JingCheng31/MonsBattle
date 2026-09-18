const playerHealthFill = document.getElementById('playerHealthFill');
const enemyHealthFill = document.getElementById('enemyHealthFill');
const playerHealthText = document.getElementById('playerHealthText');
const enemyHealthText = document.getElementById('enemyHealthText');
const playerLevel = document.getElementById('playerLevel');
const playerMonsterName = document.getElementById('playerMonsterName');
const playerPortraitLabel = document.getElementById('playerPortraitLabel');
const battleLog = document.getElementById('battleLog');
const moveButtons = document.querySelectorAll('.move-button');
const menuButtons = document.querySelectorAll('.menu-button');
const mainMenu = document.getElementById('mainMenu');
const skillsMenu = document.getElementById('skillsMenu');
const backToMainMenu = document.getElementById('backToMainMenu');
const monsterMenu = document.getElementById('monsterMenu');
const monsterButtons = document.querySelectorAll('.monster-choice');
const backFromMonsterMenu = document.getElementById('backFromMonsterMenu');
const partyRows = document.querySelectorAll('[data-party]');
const battlePrompt = document.getElementById('battlePrompt');
const turnBadge = document.getElementById('turnBadge');

const state = {
  playerHp: 164,
  playerMaxHp: 164,
  enemyHp: 132,
  enemyMaxHp: 132,
  turn: 1,
  battleOver: false,
  playerGuard: 0,
  activeMonster: 'Vinegrove',
};

const monsters = {
  Vinegrove: {
    level: 26,
    maxHp: 164,
    currentHp: 164,
    portrait: 'PLAYER<br />MON',
    moves: [
      { name: 'Flame Burst', type: 'fire', power: 26 },
      { name: 'Vine Slash', type: 'grass', power: 22 },
      { name: 'Quick Step', type: 'speed', power: 18 },
      { name: 'Guard', type: 'shield', power: 0 },
    ],
  },
  Emberbyte: {
    level: 24,
    maxHp: 121,
    currentHp: 121,
    portrait: 'EMBER<br />MON',
    moves: [
      { name: 'Ember Shot', type: 'fire', power: 24 },
      { name: 'Heat Wave', type: 'fire', power: 29 },
      { name: 'Focus', type: 'speed', power: 16 },
      { name: 'Guard', type: 'shield', power: 0 },
    ],
  },
  Fleet: {
    level: 22,
    maxHp: 104,
    currentHp: 104,
    portrait: 'FLEET<br />MON',
    moves: [
      { name: 'Tackle', type: 'speed', power: 20 },
      { name: 'Gale Dash', type: 'speed', power: 25 },
      { name: 'Tailwind', type: 'grass', power: 17 },
      { name: 'Guard', type: 'shield', power: 0 },
    ],
  },
};

function getActiveMonster() {
  return monsters[state.activeMonster];
}

function addLog(message) {
  const line = document.createElement('p');
  line.textContent = message;
  battleLog.prepend(line);

  while (battleLog.children.length > 6) {
    battleLog.removeChild(battleLog.lastChild);
  }
}

function setPrompt(message) {
  battlePrompt.textContent = message;
}

function updateTurnBadge() {
  turnBadge.textContent = `Turn ${state.turn}`;
}

function showMainMenu() {
  mainMenu.classList.remove('is-hidden');
  skillsMenu.classList.add('is-hidden');
  monsterMenu.classList.add('is-hidden');
  setPrompt('Your turn. Choose an action.');
}

function showSkillsMenu() {
  mainMenu.classList.add('is-hidden');
  skillsMenu.classList.remove('is-hidden');
  monsterMenu.classList.add('is-hidden');
  setPrompt('Choose a skill.');
}

function showMonsterMenu() {
  mainMenu.classList.add('is-hidden');
  skillsMenu.classList.add('is-hidden');
  monsterMenu.classList.remove('is-hidden');
  setPrompt('Choose a monster.');
}

function updateActivePartyRow() {
  partyRows.forEach((row) => {
    row.classList.toggle('active', row.dataset.party === state.activeMonster);
    const monster = monsters[row.dataset.party];
    row.querySelector('strong').textContent = `${monster.currentHp}/${monster.maxHp}`;
  });
}

function renderMonsterMenu() {
  monsterButtons.forEach((button) => {
    const monster = monsters[button.dataset.monster];
    button.querySelector('small').textContent = `Lv. ${monster.level}`;
    button.querySelector('.monster-hp').textContent = `${monster.currentHp}/${monster.maxHp}`;
    button.disabled = monster.currentHp <= 0 || button.dataset.monster === state.activeMonster;
  });
}

function renderSkills() {
  const activeMonster = getActiveMonster();
  moveButtons.forEach((button, index) => {
    const move = activeMonster.moves[index];
    button.dataset.move = move.name;
    button.querySelector('.move-name').textContent = move.name;
    button.querySelector('.move-type').textContent = move.type.toUpperCase();
    button.querySelector('.move-type').className = `move-type ${move.type}`;
  });
}

function switchMonster(monsterName) {
  if (state.battleOver || monsterName === state.activeMonster) {
    return;
  }

  getActiveMonster().currentHp = state.playerHp;
  const monster = monsters[monsterName];
  state.activeMonster = monsterName;
  state.playerHp = monster.currentHp;
  state.playerMaxHp = monster.maxHp;
  playerLevel.textContent = `Lv. ${monster.level}`;
  playerMonsterName.textContent = monsterName.toUpperCase();
  playerPortraitLabel.innerHTML = monster.portrait;
  renderSkills();
  updateActivePartyRow();
  renderMonsterMenu();
  updateHealth();
  addLog(`BLAIR sent out ${monsterName}.`);
  showMainMenu();
  setPrompt(`${monsterName} is ready!`);
  setTimeout(enemyTurn, 500);
}

function handleMenuChoice(menuName) {
  if (state.battleOver) {
    return;
  }

  if (menuName === 'skills') {
    showSkillsMenu();
    return;
  }

  if (menuName === 'monster') {
    showMonsterMenu();
    return;
  }

  const labels = {
    item: 'Items are not available yet.',
    run: 'Running is not available yet.',
  };

  setPrompt(labels[menuName]);
  addLog(labels[menuName]);
}

function animateFighter(side, type) {
  const fighter = document.querySelector(`.fighter.${side === 'player' ? 'trainer' : 'enemy'}`);
  fighter.classList.remove('player-attack', 'enemy-attack', 'hurt-flash');
  void fighter.offsetWidth;
  fighter.classList.add(type === 'attack' ? (side === 'player' ? 'player-attack' : 'enemy-attack') : 'hurt-flash');
  setTimeout(() => {
    fighter.classList.remove('player-attack', 'enemy-attack', 'hurt-flash');
  }, 380);
}

function updateHealth() {
  const playerPercent = (state.playerHp / state.playerMaxHp) * 100;
  const enemyPercent = (state.enemyHp / state.enemyMaxHp) * 100;

  playerHealthFill.style.width = `${Math.max(playerPercent, 0)}%`;
  enemyHealthFill.style.width = `${Math.max(enemyPercent, 0)}%`;

  if (playerPercent <= 35) {
    playerHealthFill.style.background = 'linear-gradient(90deg, #f2b94b, #f9d66d)';
  } else {
    playerHealthFill.style.background = 'linear-gradient(90deg, #66de8f, #9ce7a5)';
  }

  if (enemyPercent <= 35) {
    enemyHealthFill.style.background = 'linear-gradient(90deg, #f26d6d, #ffb06b)';
  } else {
    enemyHealthFill.style.background = 'linear-gradient(90deg, #ff8b65, #ffb86b)';
  }

  playerHealthText.textContent = `${state.playerHp} / ${state.playerMaxHp}`;
  enemyHealthText.textContent = `${state.enemyHp} / ${state.enemyMaxHp}`;
}

function endBattle(win) {
  state.battleOver = true;
  setPrompt(win ? 'Victory! The wild foe was defeated.' : 'Defeat! The battle is over.');
  moveButtons.forEach((button) => {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'default';
  });
  menuButtons.forEach((button) => {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'default';
  });
  backToMainMenu.disabled = true;
  backFromMonsterMenu.disabled = true;
  monsterButtons.forEach((button) => {
    button.disabled = true;
  });
  addLog(win ? 'Victory! Wild Mightyena has fainted.' : 'Your team was overwhelmed.');
}

function enemyTurn() {
  if (state.battleOver) {
    return;
  }

  const moves = [
    { name: 'Bite', power: 14 },
    { name: 'Snarl', power: 18 },
    { name: 'Roar', power: 11 },
  ];

  const move = moves[Math.floor(Math.random() * moves.length)];
  let damage = move.power + Math.floor(Math.random() * 10);

  if (state.playerGuard > 0) {
    damage = Math.max(3, Math.floor(damage * 0.6));
    state.playerGuard = 0;
  }

  state.playerHp = Math.max(0, state.playerHp - damage);
  getActiveMonster().currentHp = state.playerHp;
  animateFighter('enemy', 'attack');
  document.querySelector('.fighter.trainer').classList.add('hurt-flash');
  setPrompt('Mightyena attacks!');
  addLog(`Mightyena used ${move.name} and dealt ${damage} damage.`);
  updateHealth();

  if (state.playerHp <= 0) {
    endBattle(false);
    return;
  }

  state.turn += 1;
  updateTurnBadge();
  setPrompt('Your turn. Choose an action.');
}

function handleMove(moveName) {
  if (state.battleOver) {
    return;
  }

  let damage = 0;
  let message = '';
  const activeMonster = getActiveMonster();
  const selectedMove = activeMonster.moves.find((move) => move.name === moveName);

  if (selectedMove?.name === 'Guard') {
      state.playerGuard = 1;
      const gain = Math.min(12, state.playerMaxHp - state.playerHp);
      state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 10);
      message = `${state.activeMonster} guarded and recovered ${gain > 0 ? 10 : 0} HP.`;
      activeMonster.currentHp = state.playerHp;
  } else {
    damage = (selectedMove?.power || 18) + Math.floor(Math.random() * 8);
    message = `${state.activeMonster} used ${moveName} for ${damage} damage.`;
  }

  if (selectedMove?.name !== 'Guard') {
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    animateFighter('player', 'attack');
    setPrompt(`${moveName}!`);
    addLog(message);
    updateHealth();

    if (state.enemyHp <= 0) {
      endBattle(true);
      return;
    }
  } else {
    animateFighter('player', 'attack');
    setPrompt('Guard up!');
    addLog(message);
    updateHealth();
  }

  updateActivePartyRow();
  renderMonsterMenu();

  setTimeout(enemyTurn, 500);
}

moveButtons.forEach((button) => {
  button.addEventListener('click', () => handleMove(button.dataset.move));
});

menuButtons.forEach((button) => {
  button.addEventListener('click', () => handleMenuChoice(button.dataset.menu));
});

backToMainMenu.addEventListener('click', showMainMenu);
backFromMonsterMenu.addEventListener('click', showMainMenu);

monsterButtons.forEach((button) => {
  button.addEventListener('click', () => switchMonster(button.dataset.monster));
});

renderSkills();
updateActivePartyRow();
renderMonsterMenu();
updateHealth();
updateTurnBadge();
setPrompt('Your turn. Choose an action.');
addLog('Wild Mightyena appeared!');
addLog('BLAIR sent out Vinegrove.');
