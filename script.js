/* ============================================
   AubinClicker - Game Logic
   ============================================ */

// >>>>>> DEBUG: Vitesse du jeu (1 = normal, 100 = ultra rapide) <<<<<<
// const DEBUG_SPEED = 100000000000000000000000000000000;
// >>>>>> FIN DEBUG <<<<<<

// ============ GAME DATA ============

const BUILDINGS = [
    {
        id: 'puff',
        name: 'Puff 16k',
        icon: '💨',
        desc: 'Un curseur en forme de Puff qui clique automatiquement sur Aubin',
        baseCost: 15,
        baseCps: 0.5,
        count: 0,
    },
    {
        id: 'frite',
        name: 'Barquette de Frites',
        icon: '🍟',
        desc: 'Une bonne grosse barquette bien grasse',
        baseCost: 100,
        baseCps: 3,
        count: 0,
    },
    {
        id: 'burger',
        name: 'Burger Double',
        icon: '🍔',
        desc: 'Double steak, double cheese, double Aubin',
        baseCost: 500,
        baseCps: 15,
        count: 0,
    },
    {
        id: 'kebab',
        name: 'Kebab Ketchup',
        icon: '🥙',
        desc: 'Kebab au ketchup (Oui c\'est dégueulasse mais on dira rien)',
        baseCost: 2000,
        baseCps: 50,
        count: 0,
    },
    {
        id: 'poulet',
        name: 'Bucket de Poulet',
        icon: '🍗',
        desc: 'Le seau familial... pour Aubin tout seul',
        baseCost: 8000,
        baseCps: 150,
        count: 0,
    },
    {
        id: 'pizza',
        name: 'Pizza 4 Fromages',
        icon: '🍕',
        desc: 'Aubin pourrait en manger 3 d\'affilée',
        baseCost: 30000,
        baseCps: 500,
        count: 0,
    },
    {
        id: 'buffet',
        name: 'Buffet à Volonté',
        icon: '🍖',
        desc: 'Le patron le reconnaît et pleure quand il arrive',
        baseCost: 120000,
        baseCps: 2000,
        count: 0,
    },
    {
        id: 'usine',
        name: 'Usine à Tacos',
        icon: '🏭',
        desc: 'Production industrielle pour les besoins d\'Aubin',
        baseCost: 500000,
        baseCps: 8000,
        count: 0,
    },
    {
        id: 'labo',
        name: 'Labo de Calories',
        icon: '🧪',
        desc: 'Des scientifiques synthétisent de la calorie pure',
        baseCost: 2000000,
        baseCps: 30000,
        count: 0,
    },
    {
        id: 'portail',
        name: 'Portail Gastronomique',
        icon: '🌀',
        desc: 'Un portail vers une dimension 100% bouffe',
        baseCost: 10000000,
        baseCps: 100000,
        count: 0,
    },
];

const UPGRADES = [
    // Click power upgrades
    {
        id: 'double_click',
        name: 'Doigts Gras',
        icon: '👆',
        desc: 'Les doigts gra"ss"ieux d\'Aubin doublent la puissance de clic',
        cost: 100,
        type: 'click',
        multiplier: 2,
        requirement: { type: 'clicks', value: 50 },
        purchased: false,
    },
    {
        id: 'triple_click',
        name: 'Mains de Beurre',
        icon: '🧈',
        desc: 'Triple pouvoir de clic. Ça glisse.',
        cost: 1000,
        type: 'click',
        multiplier: 3,
        requirement: { type: 'clicks', value: 200 },
        purchased: false,
    },
    {
        id: 'mega_click',
        name: 'Poing Calorique',
        icon: '👊',
        desc: 'x5 puissance de clic brute (ARC SALLE)',
        cost: 50000,
        type: 'click',
        multiplier: 5,
        requirement: { type: 'calories', value: 25000 },
        purchased: false,
    },
    // Building-specific upgrades
    {
        id: 'puff_50k', 
        name: 'Puff 32k',
        icon: '🌬️',
        desc: 'Upgrade les Puffs en 32k ! Triple production',
        cost: 200,
        type: 'building',
        target: 'puff',
        multiplier: 3,
        requirement: { type: 'building', building: 'puff', value: 5 },
        purchased: false,
    },
    {
        id: 'sauce',
        name: 'Sauce en Plus',
        icon: '🫗',
        desc: 'Toutes les frites produisent x3 Calories d\'Or',
        cost: 1500,
        type: 'building',
        target: 'frite',
        multiplier: 3,
        requirement: { type: 'building', building: 'frite', value: 5 },
        purchased: false,
    },
    {
        id: 'triple_cheese',
        name: 'Triple Cheese',
        icon: '🧀',
        desc: 'Burgers passent au triple fromage ! x3 (Aubin ne prend plus de Mc Smart)',
        cost: 5000,
        type: 'building',
        target: 'burger',
        multiplier: 3,
        requirement: { type: 'building', building: 'burger', value: 5 },
        purchased: false,
    },
    {
        id: 'galette',
        name: 'Galette Maison',
        icon: '🫓',
        desc: 'Kebabs avec galette artisanale x3',
        cost: 20000,
        type: 'building',
        target: 'kebab',
        multiplier: 3,
        requirement: { type: 'building', building: 'kebab', value: 5 },
        purchased: false,
    },
    {
        id: 'aile_en_plus',
        name: 'Aile en Plus',
        icon: '🦴',
        desc: 'Chaque bucket contient 50% d\'ailes en plus x3',
        cost: 80000,
        type: 'building',
        target: 'poulet',
        multiplier: 3,
        requirement: { type: 'building', building: 'poulet', value: 5 },
        purchased: false,
    },
    {
        id: 'four_a_bois',
        name: 'Four à Bois',
        icon: '🪵',
        desc: 'Pizzas cuites au feu de bois = x3',
        cost: 300000,
        type: 'building',
        target: 'pizza',
        multiplier: 3,
        requirement: { type: 'building', building: 'pizza', value: 5 },
        purchased: false,
    },
    // Global multipliers
    {
        id: 'appetit_leger',
        name: 'Gros Appétit',
        icon: '😋',
        desc: 'Aubin a encore plus faim ! Tout x2 !',
        cost: 10000,
        type: 'global',
        multiplier: 2,
        requirement: { type: 'calories', value: 5000 },
        purchased: false,
    },
    {
        id: 'trou_noir',
        name: 'Estomac sans Fond',
        icon: '🕳️',
        desc: 'La science ne peut pas expliquer où ça va. Tout x3',
        cost: 500000,
        type: 'global',
        multiplier: 3,
        requirement: { type: 'calories', value: 200000 },
        purchased: false,
    },
    {
        id: 'dimension_bouffe',
        name: 'Dimension Bouffe',
        icon: '🌌',
        desc: 'Aubin transcende la réalité. Tout x5',
        cost: 5000000,
        type: 'global',
        multiplier: 5,
        requirement: { type: 'calories', value: 2000000 },
        purchased: false,
    },
];

const PETS = [
    { id: 'hamster', name: 'Hamster Boulimique', icon: '🐹', mult: 1.2, rarity: 'common', sellPrice: 500 },
    { id: 'chat', name: 'Chat Glouton', icon: '🐱', mult: 1.3, rarity: 'common', sellPrice: 1000 },
    { id: 'chien', name: 'Chien Pataud', icon: '🐶', mult: 1.5, rarity: 'rare', sellPrice: 5000 },
    { id: 'grenouille', name: 'Grenouille Grasse', icon: '🐸', mult: 1.8, rarity: 'rare', sellPrice: 15000 },
    { id: 'renard', name: 'Renard Malin', icon: '🦊', mult: 2.2, rarity: 'epic', sellPrice: 50000 },
    { id: 'cochon', name: 'Cochon d\'Or', icon: '🐷', mult: 3.0, rarity: 'epic', sellPrice: 200000 },
    { id: 'lion', name: 'Lion Affamé', icon: '🦁', mult: 5.0, rarity: 'legendary', sellPrice: 1000000 },
    { id: 'dragon', name: 'Dragon Calorique', icon: '🐉', mult: 10.0, rarity: 'legendary', sellPrice: 5000000 },
    { id: 'licorne', name: 'Licorne Calorique', icon: '🦄', mult: 25.0, rarity: 'mythic', sellPrice: 50000000 },
];

const EGGS = [
    { id: 'egg_wood', name: 'Œuf en Bois', icon: '🥚', cost: 15000, minRebirth: 0, pool: [{id: 'hamster', weight: 70}, {id: 'chat', weight: 30}] },
    { id: 'egg_iron', name: 'Œuf en Fer', icon: '🍳', cost: 100000, minRebirth: 1, pool: [{id: 'chat', weight: 50}, {id: 'chien', weight: 40}, {id: 'grenouille', weight: 10}] },
    { id: 'egg_gold', name: 'Œuf en Or', icon: '✨', cost: 5000000, minRebirth: 3, pool: [{id: 'grenouille', weight: 60}, {id: 'renard', weight: 30}, {id: 'cochon', weight: 10}] },
    { id: 'egg_diamond', name: 'Œuf de Diamant', icon: '💎', cost: 150000000, minRebirth: 5, pool: [{id: 'cochon', weight: 60}, {id: 'lion', weight: 35}, {id: 'dragon', weight: 5}] },
    { id: 'egg_mythic', name: 'Œuf Cosmique', icon: '🌌', cost: 5000000000, minRebirth: 10, pool: [{id: 'dragon', weight: 90}, {id: 'licorne', weight: 10}] }
];

function getRebirthTarget() {
    return 100000 * Math.pow(5, state.rebirthCount);
}

const QUOTES = [
    "\"J'ai un petit creux...\"",
    "\"On passe au McDo ?\"",
    "\"C'est pas gras, c'est du gras sain.\"",
    "\"J'ai mangé et je mange avec vous.\"",
    "\"Un kebab sans la sauce d'Ali c'est pas un kebab.\"",
    "\"J'ai déjà mangé, mais j'ai RE-faim.\"",
    "\"C'est les os qui sont lourds.\"",
    "\"Je suis pas gros, téma les bras.\"",
    "\"Le régime commence lundi. Comme chaque semaine.\"",
    "\"Faut manger pour vivre !... et vivre pour manger.\"",
    "\"5 fruits et légumes ? La pizza a de la tomate dessus.\"",
    "\"Mon péché mignon c'est la nourriture. Toute.\"",
    "\"J'ai pas mangé depuis 20 minutes, c'est grave docteur ?\"",
    "\"Le nutella c'est pas une addiction, c'est un mode de vie.\"",
    "\"J'ai un métabolisme... généreux.\"",
    "\"Ah tu fais remarquer que j'ai repris du dessert ? Et toi t'as repris de l'oxygène non ?\"",
    "\"Je mange mes émotions. Et j'ai beaucoup d'émotions.\"",
    "\"Le menu enfant c'est l'entrée.\"",
    "\"Je mange pas beaucoup, je mange souvent.\"",
    "\"Mon sport préféré c'est la fourchette.\"",
    "\"Passe-moi la puff frérot.\"",
    "\"CLIQUE ! J'ai encore la dalle.\"",
];

const MILESTONES = [
    { at: 100, text: "🎉 100 Calories d'Or ! Aubin a eu son goûter !" },
    { at: 1000, text: "🔥 1 000 Calories d'Or ! Un bon repas pour Aubin !" },
    { at: 10000, text: "💪 10 000 Calories d'Or ! Aubin est en forme !" },
    { at: 100000, text: "🏆 100K ! Aubin est devenu un athlète du manger !" },
    { at: 1000000, text: "🌟 1 MILLION ! Aubin est un dieu de la bouffe !" },
    { at: 10000000, text: "🚀 10 MILLIONS ! Aubin pourrait nourrir un village !" },
    { at: 100000000, text: "🌍 100 MILLIONS ! Aubin absorbe plus qu'un trou noir !" },
    { at: 1000000000, text: "✨ 1 MILLIARD ! Aubin a transcendé l'humanité !" },
];

const FOOD_EMOJIS = ['🍔', '🍕', '🍟', '🍗', '🌮', '🌯', '🍖', '🍩', '🧁', '🍰', '🥐', '🥪', '🫔', '🍝', '🍜', '💨'];

// ============ ASCENSION SYSTEM ============

const ASCENSION_UPGRADES = [
    { id: 'building_cap_1', name: 'Capacité Bâtiments +', icon: '🏗️', desc: '+10 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 10, baseCost: 1, costMult: 2, maxLevel: 10, minAscension: 0 },
    { id: 'building_cap_2', name: 'Usine Améliorée', icon: '🏭', desc: '+50 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 50, baseCost: 10, costMult: 2.5, maxLevel: 5, minAscension: 1 },
    { id: 'building_cap_3', name: 'Complexe Industrial', icon: '🌆', desc: '+200 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 200, baseCost: 50, costMult: 3, maxLevel: 3, minAscension: 3 },
    { id: 'pet_slots_1', name: 'Plus de Pets', icon: '🐾', desc: '+1 slot de pet', type: 'petSlot', value: 1, baseCost: 5, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'pet_slots_2', name: 'Famille de Pets', icon: '🐱', desc: '+3 slots de pets', type: 'petSlot', value: 3, baseCost: 25, costMult: 4, maxLevel: 3, minAscension: 2 },
    { id: 'luck_1', name: 'Chanceux', icon: '🍀', desc: '+10% de chance aux Pets', type: 'luck', value: 0.1, baseCost: 3, costMult: 2.5, maxLevel: 10, minAscension: 0 },
    { id: 'luck_2', name: 'Porteur de Chance', icon: '🌟', desc: '+25% de chance aux Pets', type: 'luck', value: 0.25, baseCost: 20, costMult: 3, maxLevel: 5, minAscension: 1 },
    { id: 'luck_3', name: 'Aimé des Dieux', icon: '🙏', desc: '+50% de chance aux Pets', type: 'luck', value: 0.5, baseCost: 100, costMult: 4, maxLevel: 3, minAscension: 3 },
    { id: 'click_1', name: 'Doigts Puissants', icon: '💪', desc: 'x1.5 au pouvoir de clic', type: 'clickMult', value: 1.5, baseCost: 5, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'click_2', name: 'Main de Fer', icon: '✊', desc: 'x2 au pouvoir de clic', type: 'clickMult', value: 2, baseCost: 30, costMult: 4, maxLevel: 3, minAscension: 2 },
    { id: 'cps_1', name: 'Production Boost', icon: '📈', desc: 'x1.25 au CPS global', type: 'cpsMult', value: 1.25, baseCost: 10, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'cps_2', name: 'Efficacité Max', icon: '⚡', desc: 'x1.5 au CPS global', type: 'cpsMult', value: 1.5, baseCost: 50, costMult: 4, maxLevel: 3, minAscension: 2 },
    { id: 'rebirth_bonus', name: 'Bonus de Rebirth', icon: '🎁', desc: '+1 Rebirth Token par rebirth', type: 'rebirthBonus', value: 1, baseCost: 100, costMult: 5, maxLevel: 3, minAscension: 4 },
    { id: 'inventory_cap', name: 'Sac sans Fond', icon: '🎒', desc: '+50 places dans l\'inventaire de pets', type: 'inventoryCap', value: 50, baseCost: 10, costMult: 2, maxLevel: 5, minAscension: 1 }
];

// ============ GAME STATE ============

let state = {
    calories: 0,
    totalCalories: 0,
    totalClicks: 0,
    clickPower: 1,
    cps: 0,
    clickMultiplier: 1,
    globalMultiplier: 1,
    lastSave: Date.now(),
    startTime: Date.now(),
    milestonesReached: [],
    rebirthCount: 0,
    rebirthTokens: 0, 
    equippedPets: [], 
    inventoryPets: [], 
    discoveredPets: [], 
    maxPetSlots: 3,
    bonusPetSlots: 0,
    codesUsed: [],
    ascensionCount: 0,
    ascensionPoints: 0,
    ascensionUpgrades: {},
    completedQuests: [], 
};

// ============ DOM ELEMENTS ============

const dom = {
    calorieCount: document.getElementById('calorie-count'),
    totalCalories: document.getElementById('total-calories'),
    calPerSecond: document.getElementById('cal-per-second'),
    calPerClick: document.getElementById('cal-per-click'),
    totalClicks: document.getElementById('total-clicks'),
    clickTarget: document.getElementById('click-target'),
    buildingsList: document.getElementById('buildings-list'),
    upgradesList: document.getElementById('upgrades-list'),
    questsList: document.getElementById('quests-list'),
    floatContainer: document.getElementById('float-text-container'),
    mileStoneBanner: document.getElementById('milestone-banner'),
    milestoneText: document.getElementById('milestone-text'),
    aubinQuote: document.getElementById('aubin-quote'),
    particles: document.getElementById('particles'),
    puffOrbit: document.getElementById('puff-orbit'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
    
    rebirthCount: document.getElementById('rebirth-count'),
    rebirthBtn: document.getElementById('rebirth-btn'),
    rebirthRequire: document.getElementById('rebirth-require'),
    calorieCapDisplay: document.getElementById('calorie-cap-display'),
    petMultDisplay: document.getElementById('pet-multiplier-display'),
    calorieBar: document.getElementById('calorie-bar'),
    calorieBarText: document.getElementById('calorie-bar-text'),
    
    petSlots: document.getElementById('pet-slots'),
    petCountDisplay: document.getElementById('pet-count-display'),
    
    codeInput: document.getElementById('code-input'),
    codeSubmit: document.getElementById('code-submit'),
    codeResult: document.getElementById('code-result'),
    codesTab: document.getElementById('codes-tab'),
    
    ascensionCount: document.getElementById('ascension-count'),
    ascensionPoints: document.getElementById('ascension-points'),
    ascensionBtn: document.getElementById('ascension-btn'),
    ascensionRequire: document.getElementById('ascension-require'),
    ascensionShop: document.getElementById('ascension-shop'),
    ascensionTab: document.getElementById('ascension-tab'),

    eggsTab: document.getElementById('eggs-tab'),
    inventoryTab: document.getElementById('inventory-tab'),
    indexTab: document.getElementById('index-tab')
};

// ============ NUMBER FORMATTING ============

function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toLocaleString('fr-FR');
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
    if (tier === 0) return Math.floor(n).toLocaleString('fr-FR');
    const suffix = suffixes[tier] || `e${tier * 3}`;
    const scale = Math.pow(10, tier * 3);
    const scaled = n / scale;
    return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + suffix;
}

// ============ COST CALCULATION ============

function getBuildingCost(building) {
    return Math.floor(building.baseCost * Math.pow(1.15, building.count));
}

// ============ CPS CALCULATION ============

function recalculateCps() {
    let totalCps = 0;
    for (const b of BUILDINGS) {
        let bCps = b.baseCps * b.count;
        for (const u of UPGRADES) {
            if (u.purchased && u.type === 'building' && u.target === b.id) {
                bCps *= u.multiplier;
            }
        }
        totalCps += bCps;
    }
    let globalMult = 1;
    for (const u of UPGRADES) {
        if (u.purchased && u.type === 'global') {
            globalMult *= u.multiplier;
        }
    }
    state.globalMultiplier = globalMult;
    const petMult = getPetMultiplier();
    const ascensionCpsMult = getCpsMultiplierBonus();
    state.cps = totalCps * globalMult * petMult * ascensionCpsMult * (typeof DEBUG_MULTIPLIER !== 'undefined' ? DEBUG_MULTIPLIER : 1);

    let clickMult = 1;
    for (const u of UPGRADES) {
        if (u.purchased && u.type === 'click') {
            clickMult *= u.multiplier;
        }
    }
    const ascensionClickMult = getClickMultiplierBonus();
    state.clickMultiplier = clickMult;
    const petMult2 = getPetMultiplier();
    state.clickPower = 1 * clickMult * globalMult * petMult2 * ascensionClickMult * (typeof DEBUG_MULTIPLIER !== 'undefined' ? DEBUG_MULTIPLIER : 1);
}

// ============ CLICK HANDLER ============

function handleClick(e) {
    const amount = state.clickPower;
    state.calories += amount;
    state.totalCalories += amount;
    state.totalClicks++;

    dom.calorieCount.classList.add('bump');
    setTimeout(() => dom.calorieCount.classList.remove('bump'), 100);

    const img = dom.clickTarget.querySelector('.aubin-img');
    if (img) {
        img.classList.add('clicked');
        setTimeout(() => img.classList.remove('clicked'), 150);
    }

    const burst = document.createElement('div');
    burst.className = 'click-burst';
    dom.clickTarget.appendChild(burst);
    setTimeout(() => burst.remove(), 500);

    spawnFloatText(e, `+${formatNumber(amount)}`);

    updateDisplay();
    checkMilestones();
}

function spawnFloatText(e, text) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;

    let x, y;
    if (e && e.clientX) {
        x = e.clientX + (Math.random() - 0.5) * 60;
        y = e.clientY - 20 + (Math.random() - 0.5) * 30;
    } else {
        const rect = dom.clickTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80;
        y = rect.top + (Math.random() - 0.5) * 40;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    dom.floatContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ============ MAX BUILDINGS CALCULATION ============

function getMaxBuildings() {
    return 100 + getBuildingCapBonus();
}

// ============ PET SYSTEM OVERHAUL ============

function getMaxInventory() {
    let bonus = 0;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'inventoryCap') {
            const level = getAscensionUpgradeLevel(u.id);
            bonus += level * u.value;
        }
    }
    return 100 + bonus;
}

function getPetMultiplier() {
    let mult = 1;
    for (const pInfo of state.equippedPets) {
        const pet = PETS.find(p => p.id === pInfo.id);
        if (pet) mult *= pet.mult;
    }
    return mult;
}

function renderEggs() {
    const container = document.getElementById('egg-shop-grid');
    if(!container) return;
    container.innerHTML = '';

    const maxInv = getMaxInventory();
    const isInvFull = state.inventoryPets.length >= maxInv;

    for (const egg of EGGS) {
        const isLocked = state.rebirthCount < egg.minRebirth;
        const canAfford = state.calories >= egg.cost;

        const card = document.createElement('div');
        // On ajoute la classe 'locked' si l'œuf est bloqué OU si l'inventaire est plein
        card.className = `egg-card ${isLocked || isInvFull ? 'locked' : ''} ${canAfford && !isInvFull ? 'can-afford' : ''}`;
        
        let statusText = '';
        if (isLocked) {
            statusText = `<div class="egg-req">Rebirth ${egg.minRebirth} requis</div>`;
        } else if (isInvFull) {
            statusText = `<div class="egg-req">Inventaire plein !</div>`;
        } else {
            statusText = `<div class="egg-cost">${formatNumber(egg.cost)} cal</div>`;
        }

        card.innerHTML = `
            <div class="egg-icon">${egg.icon}</div>
            <div class="egg-name">${egg.name}</div>
            ${statusText}
        `;

        if (!isLocked && !isInvFull && canAfford) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => buyEgg(egg));
        }
        container.appendChild(card);
    }
}

function buyEgg(egg) {
    if (state.calories < egg.cost) return;
    if (state.inventoryPets.length >= getMaxInventory()) {
        showQuote("Inventaire plein ! Vends des pets d'abord.");
        return;
    }

    state.calories -= egg.cost;

    const totalWeight = egg.pool.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedId = egg.pool[0].id;

    for (const p of egg.pool) {
        rand -= p.weight;
        if (rand <= 0) {
            selectedId = p.id;
            break;
        }
    }

    const petData = PETS.find(p => p.id === selectedId);
    
    if (!state.discoveredPets.includes(selectedId)) {
        state.discoveredPets.push(selectedId);
        showMilestone(`📖 Nouveau Pet découvert : ${petData.name} !`);
    }

    state.inventoryPets.push({
        uid: Date.now() + Math.random(),
        id: selectedId
    });

    showMilestone(`🥚 Tu as fait éclore : ${petData.icon} ${petData.name} !`);
    
    updateDisplay();
    renderEggs();
    renderPetInventory();
    renderPetIndex();
}

function togglePetActions(uid) {
    const allCards = document.querySelectorAll('.pet-card');
    allCards.forEach(c => {
        if (c.dataset.uid === String(uid)) {
            c.classList.toggle('selected');
        } else {
            c.classList.remove('selected');
        }
    });
}

function equipPet(uid) {
    if (state.equippedPets.length >= state.maxPetSlots) {
        showQuote("Tu ne peux pas équiper plus de pets !");
        return;
    }
    const index = state.inventoryPets.findIndex(p => p.uid === uid);
    if (index > -1) {
        const pet = state.inventoryPets.splice(index, 1)[0];
        state.equippedPets.push(pet);
        recalculateCps();
        renderPetInventory();
        renderEggs(); // Met à jour le shop d'oeufs instantanément
        updateDisplay();
        updateRebirthUI();
    }
}

function unequipPet(uid) {
    if (state.inventoryPets.length >= getMaxInventory()) {
        showQuote("Inventaire plein ! Impossible de déséquiper.");
        return;
    }
    const index = state.equippedPets.findIndex(p => p.uid === uid);
    if (index > -1) {
        const pet = state.equippedPets.splice(index, 1)[0];
        state.inventoryPets.push(pet);
        recalculateCps();
        renderPetInventory();
        renderEggs(); // Met à jour le shop d'oeufs instantanément
        updateDisplay();
        updateRebirthUI();
    }
}

function sellPet(uid, fromEquipped = false) {
    const list = fromEquipped ? state.equippedPets : state.inventoryPets;
    const index = list.findIndex(p => p.uid === uid);
    if (index > -1) {
        const petData = PETS.find(p => p.id === list[index].id);
        if(!confirm(`Vendre ${petData.icon} ${petData.name} pour ${formatNumber(petData.sellPrice)} cal ?`)) return;
        
        list.splice(index, 1);
        state.calories += petData.sellPrice;
        state.totalCalories += petData.sellPrice;
        
        recalculateCps();
        renderPetInventory();
        renderEggs(); // Met à jour le shop d'oeufs instantanément
        updateDisplay();
        updateRebirthUI();
    }
}

function equipBestPets() {
    while(state.equippedPets.length > 0) {
        state.inventoryPets.push(state.equippedPets.pop());
    }
    
    state.inventoryPets.sort((a, b) => {
        const petA = PETS.find(p => p.id === a.id);
        const petB = PETS.find(p => p.id === b.id);
        return petB.mult - petA.mult;
    });

    const toEquip = Math.min(state.maxPetSlots, state.inventoryPets.length);
    for(let i=0; i<toEquip; i++) {
        state.equippedPets.push(state.inventoryPets.shift());
    }

    recalculateCps();
    renderPetInventory();
    renderEggs(); // Met à jour le shop d'oeufs instantanément
    updateDisplay();
    updateRebirthUI();
}

function renderPetInventory() {
    const equippedContainer = document.getElementById('pet-slots');
    if (equippedContainer) {
        equippedContainer.innerHTML = '';
        for (let i = 0; i < state.maxPetSlots; i++) {
            const card = document.createElement('div');
            if (i < state.equippedPets.length) {
                const pInfo = state.equippedPets[i];
                const pet = PETS.find(p => p.id === pInfo.id);
                card.className = `pet-card rarity-${pet.rarity}`;
                card.dataset.uid = pInfo.uid;
                card.onclick = () => togglePetActions(pInfo.uid);
                
                card.innerHTML = `
                    <div class="pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>
                    <div class="pet-icon">${pet.icon}</div>
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-mult">x${pet.mult}</div>
                    <div class="btn-group">
                        <button class="btn-equip" onclick="event.stopPropagation(); unequipPet(${pInfo.uid})">Retirer</button>
                        <button class="btn-sell" onclick="event.stopPropagation(); sellPet(${pInfo.uid}, true)">Vendre</button>
                    </div>
                `;
            } else {
                card.className = 'pet-card';
                card.style.cursor = 'default';
                card.innerHTML = `<div class="pet-icon" style="opacity:0.2;">🐾</div><div class="pet-name" style="opacity:0.5;">Vide</div>`;
            }
            equippedContainer.appendChild(card);
        }
        document.getElementById('pet-count-display').textContent = `(${state.equippedPets.length}/${state.maxPetSlots})`;
    }

    const invContainer = document.getElementById('pet-inventory-grid');
    if (invContainer) {
        invContainer.innerHTML = '';
        for (const pInfo of state.inventoryPets) {
            const pet = PETS.find(p => p.id === pInfo.id);
            const card = document.createElement('div');
            card.className = `pet-card rarity-${pet.rarity}`;
            card.dataset.uid = pInfo.uid;
            card.onclick = () => togglePetActions(pInfo.uid);
            
            card.innerHTML = `
                <div class="pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-name">${pet.name}</div>
                <div class="pet-mult">x${pet.mult}</div>
                <div class="btn-group">
                    <button class="btn-equip" onclick="event.stopPropagation(); equipPet(${pInfo.uid})">Équiper</button>
                    <button class="btn-sell" onclick="event.stopPropagation(); sellPet(${pInfo.uid}, false)">Vendre</button>
                </div>
            `;
            invContainer.appendChild(card);
        }
        
        const maxInv = getMaxInventory();
        document.getElementById('inventory-count').textContent = state.inventoryPets.length;
        document.getElementById('inventory-max').textContent = maxInv;
    }
}

function renderPetIndex() {
    const container = document.getElementById('pet-index-grid');
    if(!container) return;
    container.innerHTML = '';

    for (const pet of PETS) {
        const discovered = state.discoveredPets.includes(pet.id);
        const card = document.createElement('div');
        
        if (discovered) {
            card.className = `index-card rarity-${pet.rarity}`;
            card.innerHTML = `
                <div class="index-icon">${pet.icon}</div>
                <div class="egg-name">${pet.name}</div>
                <div class="pet-mult">x${pet.mult}</div>
            `;
        } else {
            card.className = `index-card unknown`;
            card.innerHTML = `
                <div class="index-icon">❓</div>
                <div class="egg-name">Inconnu</div>
            `;
        }
        container.appendChild(card);
    }
}

// ============ SHOP RENDERING ============

function renderBuildings() {
    dom.buildingsList.innerHTML = '';
    const maxBuildings = getMaxBuildings();
    
    for (const b of BUILDINGS) {
        const cost = getBuildingCost(b);
        const isMaxed = b.count >= maxBuildings;
        const canAfford = state.calories >= cost && !isMaxed;
        const isLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;

        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? 'can-afford' : ''} ${isLocked ? 'locked' : ''} ${isMaxed ? 'locked maxed' : ''}`;
        item.dataset.id = b.id;

        item.innerHTML = `
            <div class="shop-item-icon">${b.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${isLocked ? '???' : b.name}</div>
                <div class="shop-item-cost ${canAfford || isMaxed ? '' : 'too-expensive'}">${isMaxed ? 'MAX' : formatNumber(cost) + ' cal'}</div>
            </div>
            <div class="shop-item-count">${b.count} / ${maxBuildings}</div>
        `;

        if (!isLocked && !isMaxed) {
            item.addEventListener('click', () => buyBuilding(b));
        }
        dom.buildingsList.appendChild(item);
    }
}

function renderUpgrades() {
    dom.upgradesList.innerHTML = '';
    for (const u of UPGRADES) {
        const isVisible = checkRequirement(u.requirement);
        if (!isVisible && !u.purchased) continue;

        const canAfford = state.calories >= u.cost && !u.purchased;

        const item = document.createElement('div');
        item.className = `upgrade-item ${u.purchased ? 'purchased' : ''} ${!canAfford && !u.purchased ? 'locked' : ''}`;

        item.innerHTML = `
            <div class="upgrade-icon">${u.icon}</div>
            <div class="upgrade-item-info">
                <div class="upgrade-item-name">${u.name}</div>
                ${!u.purchased ? `<div class="upgrade-item-cost ${canAfford ? '' : 'too-expensive'}">${formatNumber(u.cost)} cal</div>` : ''}
            </div>
        `;

        if (!u.purchased && canAfford) {
            item.addEventListener('click', () => buyUpgrade(u));
        }
        dom.upgradesList.appendChild(item);
    }
}

function checkRequirement(req) {
    switch (req.type) {
        case 'clicks':
            return state.totalClicks >= req.value;
        case 'calories':
            return state.totalCalories >= req.value;
        case 'building':
            const b = BUILDINGS.find(b => b.id === req.building);
            return b && b.count >= req.value;
        default:
            return true;
    }
}

// ============ BUY ACTIONS ============

function buyBuilding(building) {
    if (building.count >= getMaxBuildings()) return;

    const cost = getBuildingCost(building);
    if (state.calories < cost) return;

    state.calories -= cost;
    building.count++;

    recalculateCps();
    updateDisplay();
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();

    const el = dom.buildingsList.querySelector(`[data-id="${building.id}"]`);
    if (el) {
        el.classList.add('purchase-flash');
        setTimeout(() => el.classList.remove('purchase-flash'), 500);
    }
}

function buyUpgrade(upgrade) {
    if (state.calories < upgrade.cost || upgrade.purchased) return;

    state.calories -= upgrade.cost;
    upgrade.purchased = true;

    recalculateCps();
    updateDisplay();
    renderBuildings();
    renderUpgrades();

    showQuote(`"${upgrade.name}" débloqué ! 🎉`);
}

// ============ DISPLAY UPDATE ============

function updateDisplay() {
    dom.calorieCount.textContent = formatNumber(state.calories);
    dom.totalCalories.textContent = formatNumber(state.totalCalories);
    dom.calPerSecond.textContent = formatNumber(state.cps);
    dom.calPerClick.textContent = formatNumber(state.clickPower);
    dom.totalClicks.textContent = formatNumber(state.totalClicks);

    document.title = `${formatNumber(state.calories)} Calories d'Or - AubinClicker 🍔`;

    const maxBuildings = getMaxBuildings();
    const items = dom.buildingsList.querySelectorAll('.shop-item');
    
    items.forEach(item => {
        const b = BUILDINGS.find(b => b.id === item.dataset.id);
        if (!b) return;
        
        const isMaxed = b.count >= maxBuildings;
        const cost = getBuildingCost(b);
        const canAfford = state.calories >= cost && !isMaxed;
        
        item.classList.toggle('can-afford', canAfford);
        item.classList.toggle('locked', isMaxed || (state.totalCalories < b.baseCost * 0.5 && b.count === 0));
        
        const costEl = item.querySelector('.shop-item-cost');
        if (costEl) {
            if (isMaxed) {
                costEl.textContent = 'MAX';
                costEl.classList.remove('too-expensive');
            } else {
                costEl.textContent = `${formatNumber(cost)} cal`;
                costEl.classList.toggle('too-expensive', !canAfford);
            }
        }
        
        const countEl = item.querySelector('.shop-item-count');
        if (countEl) {
            countEl.textContent = `${b.count} / ${maxBuildings}`;
        }
    });
}

// ============ MILESTONES ============

function checkMilestones() {
    for (const m of MILESTONES) {
        if (state.totalCalories >= m.at && !state.milestonesReached.includes(m.at)) {
            state.milestonesReached.push(m.at);
            showMilestone(m.text);
        }
    }
}

function showMilestone(text) {
    dom.milestoneText.textContent = text;
    dom.mileStoneBanner.classList.remove('hidden');
    setTimeout(() => {
        dom.mileStoneBanner.classList.add('hidden');
    }, 4000);
}

// ============ QUOTES ============

let lastQuoteIndex = -1;

function showQuote(customQuote) {
    if (customQuote) {
        dom.aubinQuote.textContent = customQuote;
    } else {
        let idx;
        do {
            idx = Math.floor(Math.random() * QUOTES.length);
        } while (idx === lastQuoteIndex && QUOTES.length > 1);
        lastQuoteIndex = idx;
        dom.aubinQuote.textContent = QUOTES[idx];
    }
    dom.aubinQuote.style.opacity = '0';
    requestAnimationFrame(() => {
        dom.aubinQuote.style.opacity = '1';
    });
}

// ============ EVOLVING QUESTS SYSTEM ============

function getActiveQuests() {
    const r = state.rebirthCount;
    return [
        {
            id: 'q_variety',
            name: `Menu Varié (Palier ${r + 1})`,
            icon: '🍽️',
            desc: `Posséder au moins 1 exemplaire de ${Math.min(2 + Math.floor(r / 2), 10)} bâtiments différents.`,
            check: () => BUILDINGS.filter(b => b.count >= 1).length >= Math.min(2 + Math.floor(r / 2), 10),
            reward: Math.floor(1000 * Math.pow(5, r)),
        },
        {
            id: 'q_buildings',
            name: `Empire Immobilier (Palier ${r + 1})`,
            icon: '🏗️',
            desc: `Posséder un total de ${20 + r * 10} bâtiments.`,
            check: () => BUILDINGS.reduce((sum, b) => sum + b.count, 0) >= 20 + r * 10,
            reward: Math.floor(5000 * Math.pow(5, r)),
        },
        {
            id: 'q_upgrades',
            name: `Acheteur Compulsif (Palier ${r + 1})`,
            icon: '💡',
            desc: `Posséder ${Math.min(2 + r, 9)} améliorations.`,
            check: () => UPGRADES.filter(u => u.purchased).length >= Math.min(2 + r, 9),
            reward: Math.floor(10000 * Math.pow(5, r)),
        },
        {
            id: 'q_cps',
            name: `Usine à Calories (Palier ${r + 1})`,
            icon: '📈',
            desc: `Atteindre ${formatNumber(Math.floor(10 * Math.pow(5, r)))} cal/s.`,
            check: () => state.cps >= 10 * Math.pow(5, r),
            reward: Math.floor(15000 * Math.pow(5, r)),
        }
    ];
}

function renderQuests() {
    dom.questsList.innerHTML = '';
    const activeQuests = getActiveQuests();
    
    for (const q of activeQuests) {
        const done = state.completedQuests.includes(q.id);
        const ready = !done && q.check();

        const item = document.createElement('div');
        item.className = `quest-item ${done ? 'quest-done' : ''} ${ready ? 'quest-ready' : ''}`;

        item.innerHTML = `
            <div class="quest-icon">${q.icon}</div>
            <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-reward ${done ? 'quest-claimed' : ''}">
                    ${done ? '✅ Terminée' : '🎁 +' + formatNumber(q.reward) + ' cal'}
                </div>
            </div>
            ${ready ? '<button class="quest-claim-btn">Réclamer</button>' : ''}
            ${done ? '<span class="quest-check">✔</span>' : ''}
        `;

        if (ready) {
            item.querySelector('.quest-claim-btn').addEventListener('click', () => claimQuest(q));
        }
        dom.questsList.appendChild(item);
    }
}

function claimQuest(quest) {
    if (state.completedQuests.includes(quest.id) || !quest.check()) return;
    state.completedQuests.push(quest.id);
    state.calories += quest.reward;
    state.totalCalories += quest.reward;
    showMilestone(`🎯 Quête terminée : ${quest.name} !`);
    showQuote(`"Une quête de plus de finie... ça donne faim."`);
    renderQuests();
    updateDisplay();
    updateRebirthUI(); 
}

function checkQuests() {
    let hasNew = false;
    const activeQuests = getActiveQuests();
    for (const q of activeQuests) {
        if (!state.completedQuests.includes(q.id) && q.check()) {
            hasNew = true;
            break;
        }
    }
    const questTab = document.querySelector('[data-tab="quests"]');
    if (questTab) {
        if(hasNew) {
            questTab.innerHTML = '🎯<span class="badge">!</span>';
        } else {
            questTab.innerHTML = '🎯';
        }
    }
}

// ============ REBIRTH SYSTEM ============

function recalcMaxPetSlots() {
    const ascensionPetBonus = getPetSlotBonus();
    state.maxPetSlots = 3 + state.bonusPetSlots + ascensionPetBonus;
}

function canRebirth() {
    if (state.calories < getRebirthTarget()) return false;
    
    const activeQuests = getActiveQuests();
    for (const q of activeQuests) {
        if (!state.completedQuests.includes(q.id)) {
            return false;
        }
    }
    return true;
}

function doRebirth() {
    if (!canRebirth()) return;
    if (!confirm(`🔄 REBIRTH !\n\nTu vas :\n- Garder tes pets et tokens\n- Gagner 1 Rebirth Token 🪙\n- Perdre tous tes bâtiments, améliorations et calories\n\nContinuer ?`)) return;

    state.rebirthCount++;
    const rebirthBonus = getRebirthBonus();
    state.rebirthTokens += (1 + rebirthBonus);
    recalcMaxPetSlots();

    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.completedQuests = [];

    for (const b of BUILDINGS) b.count = 0;
    for (const u of UPGRADES) u.purchased = false;

    currentOrbitConfig = ''; 
    dom.puffOrbit.innerHTML = '';

    if (state.rebirthCount >= 1 && dom.eggsTab) dom.eggsTab.style.display = '';
    if (state.rebirthCount >= 1 && dom.inventoryTab) dom.inventoryTab.style.display = '';
    if (state.rebirthCount >= 1 && dom.indexTab) dom.indexTab.style.display = '';
    if (state.rebirthCount >= 1 && dom.codesTab) dom.codesTab.style.display = '';
    
    const petInv = document.getElementById('pet-inventory');
    if (state.rebirthCount >= 1 && petInv) petInv.style.display = '';

    recalculateCps();
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    renderEggs();
    renderPetInventory();
    renderPetIndex();
    updateDisplay();

    updateAubinAppearance();
    showMilestone(`🔄 Rebirth #${state.rebirthCount} ! +1 Token 🪙`);
    showQuote(`"Aubin renaît de ses cendres... mais il a toujours faim."`);
}

// ====== Aubin Appearance (image + aura) ======
const AUBIN_IMAGES = [
    'images/aubin/aubin.png',
    'images/aubin/aubin2.png',
    'images/aubin/aubin3.png',
    'images/aubin/aubin4.png',
    'images/aubin/aubin5.png',
    'images/aubin/aubin6.png',
];
const AUBIN_CYCLE = AUBIN_IMAGES.length;

function getAubinBaseSrc() {
    const cyclePos = state.rebirthCount % AUBIN_CYCLE;
    return AUBIN_IMAGES[cyclePos];
}

function updateAubinAppearance() {
    const cycleNum = Math.floor(state.rebirthCount / AUBIN_CYCLE); 

    const imgEl = document.getElementById('aubin-img');
    if (imgEl) {
        imgEl.src = getAubinBaseSrc();
    }

    const auraEl = document.getElementById('aubin-aura');
    if (auraEl) {
        auraEl.className = '';
        if (cycleNum >= 1) {
            const auraLevel = Math.min(cycleNum, 4);
            auraEl.classList.add(`aura-${auraLevel}`);
        }
    }
}

function updateRebirthUI() {
    const target = getRebirthTarget();
    const ready = canRebirth();

    dom.rebirthCount.textContent = state.rebirthCount;
    dom.calorieCapDisplay.textContent = target === Infinity ? '∞' : formatNumber(target);
    
    if (dom.calorieCapDisplay.previousElementSibling) {
        dom.calorieCapDisplay.previousElementSibling.textContent = 'Objectif Rebirth';
    }

    dom.petMultDisplay.textContent = `x${getPetMultiplier().toFixed(1)}`;

    dom.rebirthBtn.disabled = !ready;
    dom.rebirthBtn.classList.toggle('ready', ready);

    const activeQuests = getActiveQuests();
    const questsDone = activeQuests.every(q => state.completedQuests.includes(q.id));

    if (ready) {
        dom.rebirthRequire.textContent = 'Tu peux Rebirth maintenant !';
    } else if (state.calories < target && !questsDone) {
        dom.rebirthRequire.textContent = `Atteins ${formatNumber(target)} cal et réclame tes quêtes`;
    } else if (state.calories < target) {
        dom.rebirthRequire.textContent = `Atteins ${formatNumber(target)} cal pour Rebirth`;
    } else if (!questsDone) {
        dom.rebirthRequire.textContent = `Réclame tes quêtes pour Rebirth`;
    }

    const pct = Math.min((state.calories / target) * 100, 100);
    dom.calorieBar.style.width = `${pct}%`;
    dom.calorieBar.classList.remove('capped'); 
    dom.calorieBarText.textContent = `${formatNumber(state.calories)} / ${formatNumber(target)}`;
    
    const ascensionInfo = document.getElementById('ascension-info');
    const ascensionDetails = document.getElementById('ascension-details');
    const ascensionBtn = document.getElementById('ascension-btn');
    const ascensionRequire = document.getElementById('ascension-require');
    const ascensionTab = document.getElementById('ascension-tab');
    
    if (state.rebirthCount >= 10) {
        if (ascensionInfo) ascensionInfo.style.display = '';
        if (ascensionDetails) ascensionDetails.style.display = '';
        if (ascensionBtn) ascensionBtn.style.display = '';
        if (ascensionRequire) ascensionRequire.style.display = '';
        if (ascensionTab) ascensionTab.style.display = '';
    }
}

// ============ ASCENSION SYSTEM ============

function getAscensionPointsPerRebirth() {
    return 1 + Math.floor(state.rebirthCount / 10);
}

function getAscensionCost() {
    return state.ascensionCount * 10 + 10;
}

function canAscend() {
    return state.rebirthCount >= getAscensionCost();
}

function getAscensionUpgradeCost(upgrade) {
    const currentLevel = state.ascensionUpgrades[upgrade.id] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel));
}

function getAscensionUpgradeLevel(upgradeId) {
    return state.ascensionUpgrades[upgradeId] || 0;
}

function getBuildingCapBonus() {
    let bonus = 0;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'buildingCap') {
            const level = getAscensionUpgradeLevel(u.id);
            bonus += level * u.value;
        }
    }
    return bonus;
}

function getPetSlotBonus() {
    let bonus = 0;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'petSlot') {
            const level = getAscensionUpgradeLevel(u.id);
            bonus += level * u.value;
        }
    }
    return bonus;
}

function getLuckBonus() {
    let bonus = 0;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'luck') {
            const level = getAscensionUpgradeLevel(u.id);
            bonus += level * u.value;
        }
    }
    return bonus;
}

function getClickMultiplierBonus() {
    let mult = 1;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'clickMult') {
            const level = getAscensionUpgradeLevel(u.id);
            mult *= Math.pow(u.value, level);
        }
    }
    return mult;
}

function getCpsMultiplierBonus() {
    let mult = 1;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'cpsMult') {
            const level = getAscensionUpgradeLevel(u.id);
            mult *= Math.pow(u.value, level);
        }
    }
    return mult;
}

function getRebirthBonus() {
    let bonus = 0;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'rebirthBonus') {
            const level = getAscensionUpgradeLevel(u.id);
            bonus += level * u.value;
        }
    }
    return bonus;
}

function getOfflineMultiplierBonus() {
    let mult = 1;
    for (const u of ASCENSION_UPGRADES) {
        if (u.type === 'offlineMult') {
            const level = getAscensionUpgradeLevel(u.id);
            mult *= (1 + level * u.value);
        }
    }
    return mult;
}

function doAscension() {
    if (!canAscend()) return;
    if (!confirm(`✨ ASCENSION !\n\nTu vas :\n- Recevoir ${getAscensionPointsPerRebirth()} Points d'Ascension ✨\n- Conserver ton nombre total de Rebirths\n- Garder tes autres bonus d'ascension\n- Recommencer depuis le début (mais avec des bonus permanents !)\n\nContinuer ?`)) return;

    const pointsToAdd = getAscensionPointsPerRebirth();
    
    state.ascensionCount++;
    state.ascensionPoints += pointsToAdd;
    
    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.rebirthTokens = 0;
    state.completedQuests = [];
    state.codesUsed = [];
    
    for (const b of BUILDINGS) b.count = 0;
    for (const u of UPGRADES) u.purchased = false;
    
    currentOrbitConfig = '';
    dom.puffOrbit.innerHTML = '';
    
    recalcMaxPetSlots();
    recalculateCps();
    
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    updateAscensionUI();
    renderAscensionShop();
    updateDisplay();
    
    updateAubinAppearance();
    showMilestone(`✨ Ascension #${state.ascensionCount} ! +${pointsToAdd} Points ✨`);
    showQuote(`"Aubin a transcendé... sa faim est désormais légendaire."`);
}

function buyAscensionUpgrade(upgradeId) {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const currentLevel = getAscensionUpgradeLevel(upgradeId);
    if (currentLevel >= upgrade.maxLevel) {
        showQuote("Niveau maximum atteint pour cette amelioration !");
        return;
    }
    
    const cost = getAscensionUpgradeCost(upgrade);
    if (state.ascensionPoints < cost) {
        showQuote("Pas assez de Points d'Ascension !");
        return;
    }
    
    if (state.ascensionCount < upgrade.minAscension) {
        showQuote("Atteins l'Ascension " + upgrade.minAscension + " pour cet amelioration !");
        return;
    }
    
    state.ascensionPoints -= cost;
    state.ascensionUpgrades[upgradeId] = currentLevel + 1;
    
    recalcMaxPetSlots();
    recalculateCps();
    
    renderAscensionShop();
    updateAscensionUI();
    updateRebirthUI();
    updateDisplay();
    renderPetInventory(); 
    
    showMilestone(`${upgrade.icon} ${upgrade.name} niveau ${currentLevel + 1} !`);
}

function updateAscensionUI() {
    if (!dom.ascensionCount) return;
    
    dom.ascensionCount.textContent = state.ascensionCount;
    dom.ascensionPoints.textContent = state.ascensionPoints;
    
    const ready = canAscend();
    dom.ascensionBtn.disabled = !ready;
    dom.ascensionBtn.classList.toggle('ready', ready);
    
    if (ready) {
        dom.ascensionRequire.textContent = 'Tu peux Ascensionner maintenant !';
    } else {
        const need = getAscensionCost();
        dom.ascensionRequire.textContent = `Atteins ${need} Rebirths pour Ascensionner`;
    }
}

function renderAscensionShop() {
    if (!dom.ascensionShop) return;
    
    dom.ascensionShop.innerHTML = '';
    
    for (const upgrade of ASCENSION_UPGRADES) {
        const currentLevel = getAscensionUpgradeLevel(upgrade.id);
        const isMaxed = currentLevel >= upgrade.maxLevel;
        const isUnlocked = state.ascensionCount >= upgrade.minAscension;
        const cost = getAscensionUpgradeCost(upgrade);
        const canAfford = state.ascensionPoints >= cost;
        
        const card = document.createElement('div');
        card.className = `ascension-card ${isMaxed ? 'maxed' : ''} ${!isUnlocked ? 'locked' : ''} ${!canAfford && !isMaxed ? 'cant-afford' : ''}`;
        
        card.innerHTML = `
            <div class="ascension-icon">${upgrade.icon}</div>
            <div class="ascension-info">
                <div class="ascension-name">${upgrade.name}</div>
                <div class="ascension-desc">${upgrade.desc}</div>
                <div class="ascension-level">Niveau ${currentLevel}/${upgrade.maxLevel}</div>
                <div class="ascension-bonus">${upgrade.type === 'clickMult' || upgrade.type === 'cpsMult' ? `x${Math.pow(upgrade.value, currentLevel + 1).toFixed(2)}` : `+${upgrade.value * (currentLevel + 1)}${upgrade.type === 'luck' ? '%' : ''}`}</div>
            </div>
            <button class="btn ascension-buy-btn" ${isMaxed || !canAfford || !isUnlocked ? 'disabled' : ''}>
                ${isMaxed ? 'MAX' : !isUnlocked ? `Ascension ${upgrade.minAscension}` : `${cost} ✨`}
            </button>
        `;
        
        if (!isMaxed && isUnlocked && canAfford) {
            card.querySelector('.ascension-buy-btn').addEventListener('click', () => buyAscensionUpgrade(upgrade.id));
        }
        
        dom.ascensionShop.appendChild(card);
    }
}

// ============ CODES SYSTEM ============

const CODES = {
    'ROMAINJTM': {
        desc: 'Code de Romain - Licorne Calorique + slot bonus',
        action: () => {
            state.bonusPetSlots++;
            recalcMaxPetSlots();
            
            state.inventoryPets.push({
                uid: Date.now() + Math.random(),
                id: 'licorne'
            });
            if (!state.discoveredPets.includes('licorne')) {
                state.discoveredPets.push('licorne');
            }
            
            recalculateCps();
            renderPetInventory();
            renderPetIndex();
            updateDisplay();
            return '🦄 Licorne Calorique ajoutée + 1 slot bonus !';
        }
    }
};

function redeemCode() {
    const input = dom.codeInput.value.trim().toUpperCase();
    dom.codeInput.value = '';

    if (!input) {
        dom.codeResult.textContent = '❌ Entre un code !';
        dom.codeResult.className = 'code-result error';
        return;
    }

    if (state.codesUsed.includes(input)) {
        dom.codeResult.textContent = '⚠️ Code déjà utilisé !';
        dom.codeResult.className = 'code-result error';
        return;
    }

    const code = CODES[input];
    if (!code) {
        dom.codeResult.textContent = '❌ Code invalide !';
        dom.codeResult.className = 'code-result error';
        return;
    }

    state.codesUsed.push(input);
    const message = code.action();
    dom.codeResult.textContent = message;
    dom.codeResult.className = 'code-result success';
    showMilestone(message);
}

// ============ ORBIT PUFFS ============

let currentOrbitConfig = '';

function renderOrbitPuffs() {
    const puffBuilding = BUILDINGS.find(b => b.id === 'puff');
    const count = puffBuilding ? puffBuilding.count : 0;
    
    let remaining = count;
    const tiers = [
        { value: 10000, src: 'images/puffs/puff_diamant.png' },
        { value: 1000, src: 'images/puffs/puff_platine.png' },
        { value: 100, src: 'images/puffs/puff_or.png' },
        { value: 10, src: 'images/puffs/puff_argent.png' },
        { value: 1, src: 'images/puffs/puff_bronze.png' }
    ];
    
    let puffsToRender = [];
    for (const tier of tiers) {
        const qty = Math.floor(remaining / tier.value);
        for (let i = 0; i < qty; i++) {
            puffsToRender.push(tier.src);
        }
        remaining %= tier.value;
    }
    
    const configString = puffsToRender.join('|');
    if (configString === currentOrbitConfig) return;
    currentOrbitConfig = configString;
    
    dom.puffOrbit.innerHTML = '';
    
    if (puffsToRender.length === 0) return;
    
    const displayCount = puffsToRender.length;
    const radius = 130; 
    
    for (let i = 0; i < displayCount; i++) {
        const angle = (360 / displayCount) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + (radius / 260) * 100 * Math.cos(rad);
        const y = 50 + (radius / 260) * 100 * Math.sin(rad);
        
        const rotation = angle - 90;
        
        const puff = document.createElement('div');
        puff.className = 'orbit-puff';
        
        const img = document.createElement('img');
        img.src = puffsToRender[i];
        img.alt = 'Puff 16k';
        img.draggable = false;
        puff.appendChild(img);
        
        puff.style.left = `${x}%`;
        puff.style.top = `${y}%`;
        puff.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        puff.style.animationDelay = `${(i * 0.3) % 2}s`;
        
        dom.puffOrbit.appendChild(puff);
    }
}

// ============ BACKGROUND PARTICLES ============

function spawnBackgroundParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${5 + Math.random() * 8}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    particle.style.fontSize = `${1 + Math.random() * 1.5}rem`;

    dom.particles.appendChild(particle);
    setTimeout(() => particle.remove(), 15000);
}

// ============ GAME LOOP ============

let lastTick = performance.now();

function gameLoop(now) {
    const dt = (now - lastTick) / 1000;
    const debugDt = dt * DEBUG_SPEED;
    lastTick = now;

    if (state.cps > 0) {
        const gained = state.cps * debugDt;
        state.calories += gained;
        state.totalCalories += gained;
        
        updateDisplay();
        checkMilestones();
    }

    requestAnimationFrame(gameLoop);
}

// ============ SAVE / LOAD ============

function saveGame() {
    const saveData = {
        calories: state.calories,
        totalCalories: state.totalCalories,
        totalClicks: state.totalClicks,
        startTime: state.startTime,
        milestonesReached: state.milestonesReached,
        buildings: BUILDINGS.map(b => ({ id: b.id, count: b.count })),
        upgrades: UPGRADES.filter(u => u.purchased).map(u => u.id),
        completedQuests: state.completedQuests,
        rebirthCount: state.rebirthCount,
        rebirthTokens: state.rebirthTokens,
        equippedPets: state.equippedPets,
        inventoryPets: state.inventoryPets,
        discoveredPets: state.discoveredPets,
        bonusPetSlots: state.bonusPetSlots,
        codesUsed: state.codesUsed,
        ascensionCount: state.ascensionCount,
        ascensionPoints: state.ascensionPoints,
        ascensionUpgrades: state.ascensionUpgrades,
        savedAt: Date.now(),
    };
    localStorage.setItem('aubinclicker_save', JSON.stringify(saveData));
    showQuote("💾 Partie sauvegardée !");
}

function loadGame() {
    const raw = localStorage.getItem('aubinclicker_save');
    if (!raw) return false;

    try {
        const data = JSON.parse(raw);
        state.calories = data.calories || 0;
        state.totalCalories = data.totalCalories || 0;
        state.totalClicks = data.totalClicks || 0;
        state.startTime = data.startTime || Date.now();
        state.milestonesReached = data.milestonesReached || [];

        if (data.buildings) {
            for (const saved of data.buildings) {
                const b = BUILDINGS.find(b => b.id === saved.id);
                if (b) b.count = saved.count;
            }
        }

        if (data.upgrades) {
            for (const id of data.upgrades) {
                const u = UPGRADES.find(u => u.id === id);
                if (u) u.purchased = true;
            }
        }

        state.completedQuests = data.completedQuests || [];
        state.rebirthCount = data.rebirthCount || 0;
        state.rebirthTokens = data.rebirthTokens || 0;
        state.bonusPetSlots = data.bonusPetSlots || 0;
        state.codesUsed = data.codesUsed || [];
        
        state.equippedPets = data.equippedPets || [];
        state.inventoryPets = data.inventoryPets || [];
        state.discoveredPets = data.discoveredPets || [];
        
        if (data.pets && Array.isArray(data.pets) && data.pets.length > 0 && state.equippedPets.length === 0 && state.inventoryPets.length === 0) {
            for(let petId of data.pets) {
                state.inventoryPets.push({
                    uid: Date.now() + Math.random(),
                    id: petId
                });
                if(!state.discoveredPets.includes(petId)) {
                    state.discoveredPets.push(petId);
                }
            }
        }

        state.ascensionCount = data.ascensionCount || 0;
        state.ascensionPoints = data.ascensionPoints || 0;
        state.ascensionUpgrades = data.ascensionUpgrades || {};
        
        recalcMaxPetSlots();

        return true;
    } catch (e) {
        console.warn('Erreur de chargement:', e);
        return false;
    }
}

function resetGame() {
    if (!confirm("⚠️ Tout effacer ? Aubin va devoir recommencer son régime... enfin non, recommencer à manger.")) return;
    localStorage.removeItem('aubinclicker_save');

    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.startTime = Date.now();
    state.completedQuests = [];

    for (const b of BUILDINGS) b.count = 0;
    for (const u of UPGRADES) u.purchased = false;

    currentOrbitConfig = ''; 
    dom.puffOrbit.innerHTML = '';
    dom.mileStoneBanner.classList.add('hidden');

    const questTab = document.querySelector('[data-tab="quests"]');
    if (questTab) questTab.innerHTML = '🎯';

    state.rebirthCount = 0;
    state.rebirthTokens = 0;
    state.equippedPets = [];
    state.inventoryPets = [];
    state.discoveredPets = [];
    state.maxPetSlots = 3;
    state.bonusPetSlots = 0;
    state.codesUsed = [];
    
    state.ascensionCount = 0;
    state.ascensionPoints = 0;
    state.ascensionUpgrades = {};
    
    if (dom.eggsTab) dom.eggsTab.style.display = 'none';
    if (dom.inventoryTab) dom.inventoryTab.style.display = 'none';
    if (dom.indexTab) dom.indexTab.style.display = 'none';
    if (dom.codesTab) dom.codesTab.style.display = 'none';
    
    const petInv = document.getElementById('pet-inventory');
    if (petInv) petInv.style.display = 'none';

    recalculateCps();
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    renderEggs();
    renderPetInventory();
    renderPetIndex();
    updateDisplay();
    showQuote("🔄 C'est reparti ! Aubin a encore faim !");
}

// ============ SHOP TABS ============

function initShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    const panelTitle = document.getElementById('panel-title');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if(panelTitle) panelTitle.textContent = tab.dataset.title;

            document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
            const target = tab.dataset.tab;
            const targetEl = document.getElementById(`${target}-list`);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

// ============ INIT ============

function init() {
    loadGame();
    recalculateCps();

    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    renderEggs();
    renderPetInventory();
    renderPetIndex();
    updateDisplay();
    updateAubinAppearance();

    if (state.rebirthCount >= 1) {
        if(dom.eggsTab) dom.eggsTab.style.display = '';
        if(dom.inventoryTab) dom.inventoryTab.style.display = '';
        if(dom.indexTab) dom.indexTab.style.display = '';
        if(dom.codesTab) dom.codesTab.style.display = '';
        const petInv = document.getElementById('pet-inventory');
        if(petInv) petInv.style.display = '';
    }

    dom.clickTarget.addEventListener('click', handleClick);
    
    const _setAubinPressed = () => {
        const imgEl = document.getElementById('aubin-img');
        if (imgEl) imgEl.src = 'images/aubin/aubinappuye.png';
    };
    const _setAubinReleased = () => {
        const imgEl = document.getElementById('aubin-img');
        if (imgEl) imgEl.src = getAubinBaseSrc();
    };
    
    dom.clickTarget.addEventListener('mousedown', _setAubinPressed);
    dom.clickTarget.addEventListener('mouseup', _setAubinReleased);
    dom.clickTarget.addEventListener('mouseleave', _setAubinReleased);
    dom.clickTarget.addEventListener('touchstart', _setAubinPressed, { passive: true });
    dom.clickTarget.addEventListener('touchend', _setAubinReleased);
    
    dom.clickTarget.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(null);
        }
    });

    dom.saveBtn.addEventListener('click', saveGame);
    dom.resetBtn.addEventListener('click', resetGame);
    dom.rebirthBtn.addEventListener('click', doRebirth);
    if (dom.ascensionBtn) dom.ascensionBtn.addEventListener('click', doAscension);
    dom.codeSubmit.addEventListener('click', redeemCode);
    dom.codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') redeemCode();
    });

    const btnEquipBest = document.getElementById('btn-equip-best');
    if(btnEquipBest) btnEquipBest.addEventListener('click', equipBestPets);
    
    initShopTabs();
    if (dom.ascensionShop) {
        renderAscensionShop();
        updateAscensionUI();
    }

    // Gestion du clic extérieur pour fermer les menus de Pets
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pet-card')) {
            document.querySelectorAll('.pet-card.selected').forEach(c => c.classList.remove('selected'));
        }
    });

    setInterval(saveGame, 30000);
    window.addEventListener('beforeunload', saveGame);
    setInterval(() => showQuote(), 30000);
    
    setInterval(spawnBackgroundParticle, 2000);
    for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnBackgroundParticle(), i * 400);
    }
    
    setInterval(() => {
        renderBuildings();
        renderUpgrades();
        renderQuests();
        checkQuests();
        updateRebirthUI();
        updateAscensionUI();
        renderEggs(); 
    }, 2000);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);