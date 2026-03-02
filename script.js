/* ============================================
   AubinClicker - Game Logic
   ============================================ */

// >>>>>> DEBUG: Supprimer cette ligne pour retirer le multiplicateur de test <<<<<<

// >>>>>> FIN DEBUG <<<<<<

// ============ GAME DATA ============

const BUILDINGS = [
    {
        id: 'puff',
        name: 'Puff 20K',
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
        name: 'Puff 50K',
        icon: '🌬️',
        desc: 'Upgrade les Puffs en 50K ! Triple production',
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
        requiresQuest: 'q_unlock_poulet_upgrade',
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
        requiresQuest: 'q_unlock_pizza_upgrade',
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
        requiresQuest: 'q_unlock_estomac',
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
        requiresQuest: 'q_unlock_dimension',
        purchased: false,
    },
];

const QUESTS = [
    // Click quests
    {
        id: 'q_first_click',
        name: 'Première Bouchée',
        icon: '🍽️',
        desc: 'Clique 1 fois sur Aubin',
        check: () => state.totalClicks >= 1,
        reward: 10,
        rewardText: '+10 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_click_50',
        name: 'Échauffement',
        icon: '🏋️',
        desc: 'Clique 50 fois',
        check: () => state.totalClicks >= 50,
        reward: 100,
        rewardText: '+100 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_click_500',
        name: 'Tendinite du Pouce',
        icon: '👍',
        desc: 'Clique 500 fois',
        check: () => state.totalClicks >= 500,
        reward: 2000,
        rewardText: '+2 000 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_click_2000',
        name: 'Doigt Olympique',
        icon: '🥇',
        desc: 'Clique 2 000 fois',
        check: () => state.totalClicks >= 2000,
        reward: 15000,
        rewardText: '+15 000 Calories d\'Or',
        completed: false,
    },
    // Building quests
    {
        id: 'q_first_puff',
        name: 'La Première Puff',
        icon: '💨',
        desc: 'Achète ton premier Puff 20K',
        check: () => BUILDINGS.find(b => b.id === 'puff').count >= 1,
        reward: 50,
        rewardText: '+50 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_puff_10',
        name: 'Nuage Toxique',
        icon: '☁️',
        desc: 'Accumule 10 Puffs',
        check: () => BUILDINGS.find(b => b.id === 'puff').count >= 10,
        reward: 500,
        rewardText: '+500 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_first_burger',
        name: 'Menu Best Of',
        icon: '🍔',
        desc: 'Achète un Burger Double',
        check: () => BUILDINGS.find(b => b.id === 'burger').count >= 1,
        reward: 300,
        rewardText: '+300 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_first_kebab',
        name: 'Chez Ali',
        icon: '🥙',
        desc: 'Achète un Kebab Ketchup',
        check: () => BUILDINGS.find(b => b.id === 'kebab').count >= 1,
        reward: 1500,
        rewardText: '+1 500 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_all_buildings',
        name: 'Collectionneur Glouton',
        icon: '🏆',
        desc: 'Possède au moins 1 de chaque bâtiment',
        check: () => BUILDINGS.every(b => b.count >= 1),
        reward: 100000,
        rewardText: '+100 000 Calories d\'Or',
        completed: false,
    },
    // Calorie milestones
    {
        id: 'q_cal_1k',
        name: 'Casse-croûte',
        icon: '🥪',
        desc: 'Gagne 1 000 Calories d\'Or au total',
        check: () => state.totalCalories >= 1000,
        reward: 200,
        rewardText: '+200 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_cal_100k',
        name: 'Repas de Roi',
        icon: '👑',
        desc: 'Gagne 100 000 Calories d\'Or au total',
        check: () => state.totalCalories >= 100000,
        reward: 10000,
        rewardText: '+10 000 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_cal_1m',
        name: 'Empereur du Gras',
        icon: '🫅',
        desc: 'Gagne 1 000 000 Calories d\'Or au total',
        check: () => state.totalCalories >= 1000000,
        reward: 100000,
        rewardText: '+100 000 Calories d\'Or',
        completed: false,
    },
    // CPS quests
    {
        id: 'q_cps_10',
        name: 'Ça commence à chier',
        icon: '📈',
        desc: 'Atteins 10 cal/s',
        check: () => state.cps >= 10,
        reward: 500,
        rewardText: '+500 Calories d\'Or',
        completed: false,
    },
    {
        id: 'q_cps_1000',
        name: 'Usine à Ventre',
        icon: '🏭',
        desc: 'Atteins 1 000 cal/s',
        check: () => state.cps >= 1000,
        reward: 25000,
        rewardText: '+25 000 Calories d\'Or',
        completed: false,
    },
    // Special quests
    {
        id: 'q_upgrade_3',
        name: 'Investisseur Malin',
        icon: '💡',
        desc: 'Achète 3 améliorations',
        check: () => UPGRADES.filter(u => u.purchased).length >= 3,
        reward: 5000,
        rewardText: '+5 000 Calories d\'Or',
        completed: false,
    },
    // Unlock quests for advanced upgrades
    {
        id: 'q_unlock_poulet_upgrade',
        name: 'Roi du Poulet',
        icon: '🍗',
        desc: 'Possède 3 Buckets et 1 Buffet',
        check: () => BUILDINGS.find(b => b.id === 'poulet').count >= 3 && BUILDINGS.find(b => b.id === 'buffet').count >= 1,
        reward: 5000,
        rewardText: '+5 000 cal + Débloque "Aile en Plus"',
        completed: false,
    },
    {
        id: 'q_unlock_pizza_upgrade',
        name: 'Maître Pizzaïolo',
        icon: '🍕',
        desc: 'Possède 3 Pizzas et 1 Buffet',
        check: () => BUILDINGS.find(b => b.id === 'pizza').count >= 3 && BUILDINGS.find(b => b.id === 'buffet').count >= 1,
        reward: 10000,
        rewardText: '+10 000 cal + Débloque "Four à Bois"',
        completed: false,
    },
    {
        id: 'q_unlock_estomac',
        name: 'Ventre sans Limites',
        icon: '🕳️',
        desc: 'Atteins 100 000 cal totales et possède 5 bâtiments différents',
        check: () => state.totalCalories >= 100000 && BUILDINGS.filter(b => b.count >= 1).length >= 5,
        reward: 20000,
        rewardText: '+20 000 cal + Débloque "Estomac sans Fond"',
        completed: false,
    },
    {
        id: 'q_unlock_dimension',
        name: 'Transcendance Alimentaire',
        icon: '🌌',
        desc: 'Fais 1 Rebirth et possède 1 Usine à Tacos',
        check: () => state.rebirthCount >= 1 && BUILDINGS.find(b => b.id === 'usine').count >= 1,
        reward: 50000,
        rewardText: '+50 000 cal + Débloque "Dimension Bouffe"',
        completed: false,
    },
];

const PETS = [
    { id: 'hamster', name: 'Hamster Boulimique', icon: '🐹', mult: 1.2, rarity: 'common', weight: 30, minRebirth: 1 },
    { id: 'chat', name: 'Chat Glouton', icon: '🐱', mult: 1.3, rarity: 'common', weight: 25, minRebirth: 1 },
    { id: 'chien', name: 'Chien Pataud', icon: '🐶', mult: 1.5, rarity: 'rare', weight: 18, minRebirth: 2 },
    { id: 'grenouille', name: 'Grenouille Grasse', icon: '🐸', mult: 1.6, rarity: 'rare', weight: 12, minRebirth: 3 },
    { id: 'renard', name: 'Renard Malin', icon: '🦊', mult: 1.8, rarity: 'epic', weight: 8, minRebirth: 4 },
    { id: 'cochon', name: 'Cochon d\'Or', icon: '🐷', mult: 2.0, rarity: 'epic', weight: 4, minRebirth: 5 },
    { id: 'lion', name: 'Lion Affamé', icon: '🦁', mult: 2.5, rarity: 'legendary', weight: 2, minRebirth: 6 },
    { id: 'dragon', name: 'Dragon Calorique', icon: '🐉', mult: 3.0, rarity: 'legendary', weight: 1, minRebirth: 6 },
    { id: 'licorne', name: 'Licorne Calorique', icon: '🦄', mult: 5.0, rarity: 'mythic', weight: 0, minRebirth: Infinity },
];

// Returns only pets unlocked at current rebirth level (excludes weight-0 pets like licorne)
function getUnlockedPets() {
    return PETS.filter(p => p.minRebirth <= state.rebirthCount && p.weight > 0);
}

// Rebirth cap = 100K × 5^rebirthCount (chaque rebirth ×5, plus accessible)
function getCalorieCap() {
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
    "\"20K puffs et j'ai encore la dalle.\"",
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
    // Building limit upgrades
    { id: 'building_cap_1', name: 'Capacité Bâtiments +', icon: '🏗️', desc: '+10 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 10, baseCost: 1, costMult: 2, maxLevel: 10, minAscension: 0 },
    { id: 'building_cap_2', name: 'Usine Améliorée', icon: '🏭', desc: '+50 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 50, baseCost: 10, costMult: 2.5, maxLevel: 5, minAscension: 1 },
    { id: 'building_cap_3', name: 'Complexe Industrial', icon: '🌆', desc: '+200 au nombre maximum de chaque bâtiment', type: 'buildingCap', value: 200, baseCost: 50, costMult: 3, maxLevel: 3, minAscension: 3 },
    
    // Pet slot upgrades
    { id: 'pet_slots_1', name: 'Plus de Pets', icon: '🐾', desc: '+1 slot de pet', type: 'petSlot', value: 1, baseCost: 5, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'pet_slots_2', name: 'Famille de Pets', icon: '🐱', desc: '+3 slots de pets', type: 'petSlot', value: 3, baseCost: 25, costMult: 4, maxLevel: 3, minAscension: 2 },
    
    // Luck upgrades
    { id: 'luck_1', name: 'Chanceux', icon: '🍀', desc: '+10% de chance aux Pets', type: 'luck', value: 0.1, baseCost: 3, costMult: 2.5, maxLevel: 10, minAscension: 0 },
    { id: 'luck_2', name: 'Porteur de Chance', icon: '🌟', desc: '+25% de chance aux Pets', type: 'luck', value: 0.25, baseCost: 20, costMult: 3, maxLevel: 5, minAscension: 1 },
    { id: 'luck_3', name: 'Aimé des Dieux', icon: '🙏', desc: '+50% de chance aux Pets', type: 'luck', value: 0.5, baseCost: 100, costMult: 4, maxLevel: 3, minAscension: 3 },
    
    // Click power upgrades
    { id: 'click_1', name: 'Doigts Puissants', icon: '💪', desc: 'x1.5 au pouvoir de clic', type: 'clickMult', value: 1.5, baseCost: 5, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'click_2', name: 'Main de Fer', icon: '✊', desc: 'x2 au pouvoir de clic', type: 'clickMult', value: 2, baseCost: 30, costMult: 4, maxLevel: 3, minAscension: 2 },
    
    // CPS upgrades
    { id: 'cps_1', name: 'Production Boost', icon: '📈', desc: 'x1.25 au CPS global', type: 'cpsMult', value: 1.25, baseCost: 10, costMult: 3, maxLevel: 5, minAscension: 0 },
    { id: 'cps_2', name: 'Efficacité Max', icon: '⚡', desc: 'x1.5 au CPS global', type: 'cpsMult', value: 1.5, baseCost: 50, costMult: 4, maxLevel: 3, minAscension: 2 },
    
    // Rebirth token bonus
    { id: 'rebirth_bonus', name: 'Bonus de Rebirth', icon: '🎁', desc: '+1 Rebirth Token par rebirth', type: 'rebirthBonus', value: 1, baseCost: 100, costMult: 5, maxLevel: 3, minAscension: 4 },
    
    // Offline earnings
    { id: 'offline_1', name: 'Gains Passifs', icon: '🌙', desc: '+25% aux gains hors-ligne', type: 'offlineMult', value: 0.25, baseCost: 15, costMult: 3, maxLevel: 4, minAscension: 1 },
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
    pets: [],
    maxPetSlots: 3,
    bonusPetSlots: 0,
    codesUsed: [],
    // Ascension
    ascensionCount: 0,
    ascensionPoints: 0,
    ascensionUpgrades: {},
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
    // Rebirth
    rebirthCount: document.getElementById('rebirth-count'),
    rebirthBtn: document.getElementById('rebirth-btn'),
    rebirthRequire: document.getElementById('rebirth-require'),
    calorieCapDisplay: document.getElementById('calorie-cap-display'),
    petMultDisplay: document.getElementById('pet-multiplier-display'),
    calorieBar: document.getElementById('calorie-bar'),
    calorieBarText: document.getElementById('calorie-bar-text'),
    // Pets
    petSlots: document.getElementById('pet-slots'),
    petCountDisplay: document.getElementById('pet-count-display'),
    petsTab: document.getElementById('pets-tab'),
    wheel: document.getElementById('wheel'),
    spinBtn: document.getElementById('spin-btn'),
    spinResult: document.getElementById('spin-result'),
    rebirthTokensDisplay: document.getElementById('rebirth-tokens'),
    // Codes
    codeInput: document.getElementById('code-input'),
    codeSubmit: document.getElementById('code-submit'),
    codeResult: document.getElementById('code-result'),
    codesTab: document.getElementById('codes-tab'),
    // Ascension
    ascensionCount: document.getElementById('ascension-count'),
    ascensionPoints: document.getElementById('ascension-points'),
    ascensionBtn: document.getElementById('ascension-btn'),
    ascensionRequire: document.getElementById('ascension-require'),
    ascensionShop: document.getElementById('ascension-shop'),
    ascensionTab: document.getElementById('ascension-tab'),
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
    enforceCalorieCap();
    state.totalClicks++;

    // Bump animation
    dom.calorieCount.classList.add('bump');
    setTimeout(() => dom.calorieCount.classList.remove('bump'), 100);

    // Aubin bounce
    const img = dom.clickTarget.querySelector('.aubin-img');
    if (img) {
        img.classList.add('clicked');
        setTimeout(() => img.classList.remove('clicked'), 150);
    }

    // Burst ring
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    dom.clickTarget.appendChild(burst);
    setTimeout(() => burst.remove(), 500);

    // Floating text
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

// ============ SHOP RENDERING ============

function renderBuildings() {
    dom.buildingsList.innerHTML = '';
    for (const b of BUILDINGS) {
        const cost = getBuildingCost(b);
        const canAfford = state.calories >= cost;
        const isLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;

        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? 'can-afford' : ''} ${isLocked ? 'locked' : ''}`;
        item.dataset.id = b.id;

        item.innerHTML = `
            <div class="shop-item-icon">${b.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${isLocked ? '???' : b.name}</div>
                <div class="shop-item-cost ${canAfford ? '' : 'too-expensive'}">${formatNumber(cost)} cal</div>
            </div>
            <div class="shop-item-count">${b.count}</div>
        `;

        if (!isLocked) {
            item.addEventListener('click', () => buyBuilding(b));
        }
        dom.buildingsList.appendChild(item);
    }
}

function renderUpgrades() {
    dom.upgradesList.innerHTML = '';
    for (const u of UPGRADES) {
        // Hide quest-gated upgrades until quest is completed
        if (u.requiresQuest) {
            const quest = QUESTS.find(q => q.id === u.requiresQuest);
            if (quest && !quest.completed) continue;
        }
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

    const items = dom.buildingsList.querySelectorAll('.shop-item');
    items.forEach(item => {
        const b = BUILDINGS.find(b => b.id === item.dataset.id);
        if (!b) return;
        const cost = getBuildingCost(b);
        const canAfford = state.calories >= cost;
        item.classList.toggle('can-afford', canAfford);
        const costEl = item.querySelector('.shop-item-cost');
        if (costEl) {
            costEl.classList.toggle('too-expensive', !canAfford);
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

// ============ QUESTS ============

function renderQuests() {
    dom.questsList.innerHTML = '';
    for (const q of QUESTS) {
        const done = q.completed;
        const ready = !done && q.check();

        const item = document.createElement('div');
        item.className = `quest-item ${done ? 'quest-done' : ''} ${ready ? 'quest-ready' : ''}`;

        item.innerHTML = `
            <div class="quest-icon">${q.icon}</div>
            <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-reward ${done ? 'quest-claimed' : ''}">
                    ${done ? '✅ Réclamé' : '🎁 ' + q.rewardText}
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
    if (quest.completed || !quest.check()) return;
    quest.completed = true;
    state.calories += quest.reward;
    state.totalCalories += quest.reward;
    showMilestone(`🎯 Quête terminée : ${quest.name} ! ${quest.rewardText}`);
    showQuote(`"${quest.name}" accompli ! Aubin est fier ! 🎉`);
    renderQuests();
    updateDisplay();
}

function checkQuests() {
    let hasNew = false;
    for (const q of QUESTS) {
        if (!q.completed && q.check()) {
            hasNew = true;
            break;
        }
    }
    // Update tab badge
    const questTab = document.querySelector('[data-tab="quests"]');
    if (questTab) {
        questTab.textContent = hasNew ? '🎯 Quêtes ❗' : '🎯 Quêtes';
    }
}

// ============ REBIRTH SYSTEM ============

// getCalorieCap is now defined above with the data

function recalcMaxPetSlots() {
    const ascensionPetBonus = getPetSlotBonus();
    state.maxPetSlots = 3 + Math.floor(state.rebirthCount / 5) + state.bonusPetSlots + ascensionPetBonus;
}

function getPetMultiplier() {
    let mult = 1;
    for (const petId of state.pets) {
        const pet = PETS.find(p => p.id === petId);
        if (pet) mult *= pet.mult;
    }
    return mult;
}

function enforceCalorieCap() {
    const cap = getCalorieCap();
    if (state.calories > cap) {
        state.calories = cap;
    }
}

function canRebirth() {
    return state.calories >= getCalorieCap();
}

function doRebirth() {
    if (!canRebirth()) return;
    if (!confirm(`🔄 REBIRTH !\n\nTu vas :\n- Garder tes pets et tokens\n- Gagner 1 Rebirth Token 🪙\n- Perdre tous tes bâtiments, upgrades et calories\n\nContinuer ?`)) return;

    state.rebirthCount++;
    const rebirthBonus = getRebirthBonus();
    state.rebirthTokens += (1 + rebirthBonus);
    recalcMaxPetSlots();

    // Reset progress (but NOT pets/tokens/rebirthCount)
    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];

    for (const b of BUILDINGS) b.count = 0;
    for (const u of UPGRADES) u.purchased = false;
    for (const q of QUESTS) q.completed = false;

    currentOrbitCount = -1;
    dom.puffOrbit.innerHTML = '';

    // Show pets tab + inventory + codes tab after first rebirth
    if (state.rebirthCount >= 1 && dom.petsTab) {
        dom.petsTab.style.display = '';
    }
    if (state.rebirthCount >= 1 && dom.codesTab) {
        dom.codesTab.style.display = '';
    }
    const petInv = document.getElementById('pet-inventory');
    if (state.rebirthCount >= 1 && petInv) {
        petInv.style.display = '';
    }

    recalculateCps();
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    renderPetInventory();
    initWheel();
    updateDisplay();

    updateAubinAppearance();
    showMilestone(`🔄 Rebirth #${state.rebirthCount} ! +1 Token 🪙`);
    showQuote(`"Aubin renaît de ses cendres... mais il a toujours faim."`);
}

// ====== Aubin Appearance (image + aura) ======
// Images: aubin.png, aubin2.png, aubin3.png, aubin4.png, aubin5.png, aubin6.png → cycle of 6
const AUBIN_IMAGES = [
    'images/aubin/aubin.png',
    'images/aubin/aubin2.png',
    'images/aubin/aubin3.png',
    'images/aubin/aubin4.png',
    'images/aubin/aubin5.png',
    'images/aubin/aubin6.png',
];
const AUBIN_CYCLE = AUBIN_IMAGES.length; // 6

function getAubinBaseSrc() {
    const cyclePos = state.rebirthCount % AUBIN_CYCLE;
    return AUBIN_IMAGES[cyclePos];
}

function updateAubinAppearance() {
    const cycleNum = Math.floor(state.rebirthCount / AUBIN_CYCLE); // 0 = no aura

    const imgEl = document.getElementById('aubin-img');
    if (imgEl) {
        imgEl.src = getAubinBaseSrc();
    }

    // Aura: no aura on first cycle, then levels 1-4 (capped at 4)
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
    const cap = getCalorieCap();
    const ready = canRebirth();

    dom.rebirthCount.textContent = state.rebirthCount;
    dom.calorieCapDisplay.textContent = cap === Infinity ? '∞' : formatNumber(cap);
    dom.petMultDisplay.textContent = `x${getPetMultiplier().toFixed(1)}`;
    dom.rebirthTokensDisplay.textContent = state.rebirthTokens;

    dom.rebirthBtn.disabled = !ready;
    dom.rebirthBtn.classList.toggle('ready', ready);

    if (ready) {
        dom.rebirthRequire.textContent = 'Tu peux Rebirth maintenant !';
    } else {
        dom.rebirthRequire.textContent = `Atteins ${formatNumber(cap)} cal pour Rebirth`;
    }

    // Calorie bar
    const pct = Math.min((state.calories / cap) * 100, 100);
    dom.calorieBar.style.width = `${pct}%`;
    dom.calorieBar.classList.toggle('capped', state.calories >= cap);
    dom.calorieBarText.textContent = `${formatNumber(state.calories)} / ${formatNumber(cap)}`;
    
    // Show ascension UI after first rebirth
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
    // Points d'ascension basés sur le nombre de rebirths effectués
    return 1 + Math.floor(state.rebirthCount / 10);
}

function getAscensionCost() {
    // 10 rebirths = 1 ascension
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

// Calcul des bonus d'ascension
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
    if (!confirm(`✨ ASCENSION !\n\nTu vas :\n- Recevoir ${getAscensionPointsPerRebirth()} Points d'Ascension ✨\n- Consommer ${getAscensionCost()} Rebirths\n- Garder tes autres bonus d'ascension\n- Recommencer depuis le début (mais avec des永久 bonus !)\n\nContinuer ?`)) return;

    const pointsToAdd = getAscensionPointsPerRebirth();
    const rebirthsToConsume = getAscensionCost();
    
    state.ascensionCount++;
    state.ascensionPoints += pointsToAdd;
    state.rebirthCount -= rebirthsToConsume;
    
    // Reset tout sauf ascension
    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.rebirthTokens = 0;
    state.pets = [];
    state.bonusPetSlots = 0;
    state.codesUsed = [];
    
    for (const b of BUILDINGS) b.count = 0;
    for (const u of UPGRADES) u.purchased = false;
    for (const q of QUESTS) q.completed = false;
    
    currentOrbitCount = -1;
    dom.puffOrbit.innerHTML = '';
    
    // Recalcul des bonus
    recalcMaxPetSlots();
    recalculateCps();
    
    // Mise à jour de l'interface
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    updateAscensionUI();
    renderAscensionShop();
    initWheel();
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
    
    // Vérifier le niveau d'ascension minimum
    if (state.ascensionCount < upgrade.minAscension) {
        showQuote("Atteins l'Ascension " + upgrade.minAscension + " pour cet amelioration !");
        return;
    }
    
    state.ascensionPoints -= cost;
    state.ascensionUpgrades[upgradeId] = currentLevel + 1;
    
    // Recalcul des bonus
    recalcMaxPetSlots();
    recalculateCps();
    
    renderAscensionShop();
    updateAscensionUI();
    updateRebirthUI();
    updateDisplay();
    
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

// ============ PET SYSTEM ============

let wheelSpinning = false;
let wheelAngle = 0;

// Rarity color map for conic-gradient segments
const RARITY_COLORS = {
    common:    ['rgba(160,160,176,0.25)', 'rgba(160,160,176,0.12)'],
    rare:      ['rgba(56,189,248,0.25)',  'rgba(56,189,248,0.12)'],
    epic:      ['rgba(168,85,247,0.25)',  'rgba(168,85,247,0.12)'],
    legendary: ['rgba(255,201,71,0.25)',  'rgba(255,201,71,0.12)'],
    mythic:    ['rgba(236,72,153,0.25)',  'rgba(236,72,153,0.12)'],
};

function initWheel() {
    // Remove old labels
    dom.wheel.querySelectorAll('.wheel-label').forEach(el => el.remove());

    const unlocked = getUnlockedPets();
    const segCount = unlocked.length;

    // Fallback: if no pets unlocked, show a placeholder wheel
    if (segCount === 0) {
        dom.wheel.style.background = 'rgba(255,255,255,0.05)';
        return;
    }

    const segAngle = 360 / segCount;
    const radius = 100;

    // Build dynamic conic-gradient based on unlocked pets' rarities
    let gradientParts = [];
    for (let i = 0; i < segCount; i++) {
        const colors = RARITY_COLORS[unlocked[i].rarity] || RARITY_COLORS.common;
        const startDeg = segAngle * i;
        const midDeg = startDeg + segAngle / 2;
        const endDeg = startDeg + segAngle;
        gradientParts.push(`${colors[0]} ${startDeg}deg ${midDeg}deg`);
        gradientParts.push(`${colors[1]} ${midDeg}deg ${endDeg}deg`);
    }
    dom.wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;

    // Place emoji labels
    for (let i = 0; i < segCount; i++) {
        const angle = segAngle * i + segAngle / 2;
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        const label = document.createElement('span');
        label.className = 'wheel-label';
        label.textContent = unlocked[i].icon;
        label.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        dom.wheel.appendChild(label);
    }
}

function spinWheel() {
    if (wheelSpinning) return;
    if (state.rebirthTokens <= 0) {
        showQuote("\"Pas assez de tokens ! Fais un Rebirth d'abord.\"");
        return;
    }
    if (state.pets.length >= state.maxPetSlots) {
        showQuote("\"Inventaire plein ! Vends un pet d'abord.\"");
        return;
    }

    const unlocked = getUnlockedPets();
    if (unlocked.length === 0) {
        showQuote("\"Aucun pet disponible !\"");
        return;
    }

    wheelSpinning = true;
    state.rebirthTokens--;
    dom.spinBtn.disabled = true;
    dom.spinResult.classList.add('hidden');

    // Weighted random selection among unlocked pets only
    const totalWeight = unlocked.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < unlocked.length; i++) {
        rand -= unlocked[i].weight;
        if (rand <= 0) { selectedIndex = i; break; }
    }

    const segAngle = 360 / unlocked.length;
    // Calculate target angle: the selected segment should end up at top (pointer)
    const targetSegCenter = segAngle * selectedIndex + segAngle / 2;
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const targetAngle = 360 * extraSpins + (360 - targetSegCenter);

    wheelAngle += targetAngle;
    dom.wheel.style.transform = `rotate(${wheelAngle}deg)`;

    setTimeout(() => {
        const pet = unlocked[selectedIndex];
        addPet(pet);
        dom.spinResult.textContent = `${pet.icon} ${pet.name} (x${pet.mult}) !`;
        dom.spinResult.classList.remove('hidden');
        dom.spinBtn.disabled = false;
        wheelSpinning = false;
        updateRebirthUI();
        renderPetInventory();
        recalculateCps();
        updateDisplay();
        showMilestone(`🐾 Nouveau pet : ${pet.icon} ${pet.name} (x${pet.mult}) !`);
    }, 4200); // matches CSS transition duration + buffer
}

function addPet(pet) {
    if (state.pets.length >= state.maxPetSlots) return;
    state.pets.push(pet.id);
}

function sellPet(index) {
    if (index < 0 || index >= state.pets.length) return;
    const petId = state.pets[index];
    const pet = PETS.find(p => p.id === petId);
    if (!pet) return;

    // Sell price: some flat calories based on rarity
    const sellPrices = { common: 500, rare: 2000, epic: 10000, legendary: 50000 };
    const price = sellPrices[pet.rarity] || 500;

    if (!confirm(`Vendre ${pet.icon} ${pet.name} pour ${formatNumber(price)} Calories d'Or ?`)) return;

    state.pets.splice(index, 1);
    state.calories += price;
    state.totalCalories += price;

    recalculateCps();
    renderPetInventory();
    updateDisplay();
    showQuote(`"${pet.name}" vendu ! +${formatNumber(price)} Calories d'Or`);
}

function renderPetInventory() {
    // Dynamically generate slots based on maxPetSlots
    dom.petSlots.innerHTML = '';
    for (let i = 0; i < state.maxPetSlots; i++) {
        const slot = document.createElement('div');
        if (i < state.pets.length) {
            const pet = PETS.find(p => p.id === state.pets[i]);
            if (!pet) continue;
            slot.className = `pet-slot filled rarity-${pet.rarity}`;
            slot.innerHTML = `
                <button class="pet-sell-btn" title="Vendre">✕</button>
                <div class="pet-slot-icon">${pet.icon}</div>
                <div class="pet-slot-name">${pet.name}</div>
                <div class="pet-slot-mult">x${pet.mult}</div>
            `;
            const idx = i;
            slot.querySelector('.pet-sell-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                sellPet(idx);
            });
        } else {
            slot.className = 'pet-slot empty';
            slot.innerHTML = '<span class="pet-slot-empty">Vide</span>';
        }
        dom.petSlots.appendChild(slot);
    }
    dom.petCountDisplay.textContent = `(${state.pets.length}/${state.maxPetSlots})`;
}

// ============ CODES SYSTEM ============

const CODES = {
    'ROMAINJTM': {
        desc: 'Code de Romain - Licorne Calorique x5 + slot bonus',
        action: () => {
            // Add mythic pet + extra slot
            state.bonusPetSlots++;
            recalcMaxPetSlots();
            state.pets.push('licorne');
            recalculateCps();
            renderPetInventory();
            updateDisplay();
            return '🦄 Licorne Calorique x5 ajoutée + 1 slot bonus !';
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

let currentOrbitCount = 0;

function renderOrbitPuffs() {
    const puffBuilding = BUILDINGS.find(b => b.id === 'puff');
    const count = puffBuilding ? puffBuilding.count : 0;
    
    // Cap visual puffs at 20 for readability
    const displayCount = Math.min(count, 20);
    
    if (displayCount === currentOrbitCount) return;
    currentOrbitCount = displayCount;
    
    dom.puffOrbit.innerHTML = '';
    
    if (displayCount === 0) return;
    
    const radius = 130; // px from center
    for (let i = 0; i < displayCount; i++) {
        const angle = (360 / displayCount) * i;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + (radius / 260) * 100 * Math.cos(rad);
        const y = 50 + (radius / 260) * 100 * Math.sin(rad);
        
        // Rotation: mouthpiece points UP by default, rotate so it aims at center
        const rotation = angle - 90;
        
        const puff = document.createElement('div');
        puff.className = 'orbit-puff';
        
        const img = document.createElement('img');
        img.src = 'images/puffs/puff_bronze.png';
        img.alt = 'Puff 20K';
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
    lastTick = now;

    if (state.cps > 0) {
        const gained = state.cps * dt;
        state.calories += gained;
        state.totalCalories += gained;
        enforceCalorieCap();
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
        quests: QUESTS.filter(q => q.completed).map(q => q.id),
        rebirthCount: state.rebirthCount,
        rebirthTokens: state.rebirthTokens,
        pets: state.pets,
        bonusPetSlots: state.bonusPetSlots,
        codesUsed: state.codesUsed,
        // Ascension data
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

        if (data.quests) {
            for (const id of data.quests) {
                const q = QUESTS.find(q => q.id === id);
                if (q) q.completed = true;
            }
        }

        // Load rebirth & pets
        state.rebirthCount = data.rebirthCount || 0;
        state.rebirthTokens = data.rebirthTokens || 0;
        state.pets = data.pets || [];
        state.bonusPetSlots = data.bonusPetSlots || 0;
        state.codesUsed = data.codesUsed || [];
        // Load ascension
        state.ascensionCount = data.ascensionCount || 0;
        state.ascensionPoints = data.ascensionPoints || 0;
        state.ascensionUpgrades = data.ascensionUpgrades || {};
        recalcMaxPetSlots();

        // Offline earnings
        if (data.savedAt) {
            recalculateCps();
            const offlineSeconds = (Date.now() - data.savedAt) / 1000;
            if (offlineSeconds > 5 && state.cps > 0) {
                const cappedSeconds = Math.min(offlineSeconds, 86400);
                const offlineMult = getOfflineMultiplierBonus();
                const offlineGain = state.cps * cappedSeconds * 0.5 * offlineMult;
                state.calories += offlineGain;
                state.totalCalories += offlineGain;
                const timeText = cappedSeconds > 3600
                    ? `${Math.floor(cappedSeconds / 3600)}h`
                    : `${Math.floor(cappedSeconds / 60)}min`;
                setTimeout(() => {
                    showMilestone(`🌙 Gains hors-ligne (${timeText}) : +${formatNumber(offlineGain)} Calories d'Or`);
                }, 500);
            }
        }

        return true;
    } catch (e) {
        console.warn('Erreur de chargement:', e);
        return false;
    }
}

function resetGame() {
    if (!confirm("⚠️ Tout effacer ? Aubin va devoir recommencer son régime... enfin non, recommencer à manger.")) return;
    localStorage.removeItem('aubinclicker_save');

    // Reset state
    state.calories = 0;
    state.totalCalories = 0;
    state.totalClicks = 0;
    state.clickPower = 1;
    state.cps = 0;
    state.clickMultiplier = 1;
    state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.startTime = Date.now();

    // Reset buildings
    for (const b of BUILDINGS) {
        b.count = 0;
    }

    // Reset upgrades
    for (const u of UPGRADES) {
        u.purchased = false;
    }

    // Reset quests
    for (const q of QUESTS) {
        q.completed = false;
    }

    // Reset orbit — force re-render by using sentinel value
    currentOrbitCount = -1;
    dom.puffOrbit.innerHTML = '';

    // Hide milestone banner
    dom.mileStoneBanner.classList.add('hidden');

    // Reset quest tab badge
    const questTab = document.querySelector('[data-tab="quests"]');
    if (questTab) questTab.textContent = '🎯 Quêtes';

    // Reset rebirth & pets
    state.rebirthCount = 0;
    state.rebirthTokens = 0;
    state.pets = [];
    state.maxPetSlots = 3;
    state.bonusPetSlots = 0;
    state.codesUsed = [];
    // Reset ascension
    state.ascensionCount = 0;
    state.ascensionPoints = 0;
    state.ascensionUpgrades = {};
    wheelAngle = 0;
    if (dom.wheel) dom.wheel.style.transform = 'rotate(0deg)';
    if (dom.petsTab) dom.petsTab.style.display = 'none';
    const petInv = document.getElementById('pet-inventory');
    if (petInv) petInv.style.display = 'none';
    dom.spinResult.classList.add('hidden');

    // Re-render everything
    recalculateCps();
    renderBuildings();
    renderOrbitPuffs();
    renderUpgrades();
    renderQuests();
    checkQuests();
    updateRebirthUI();
    renderPetInventory();
    updateDisplay();
    showQuote("🔄 C'est reparti ! Aubin a encore faim !");
}

// ============ SHOP TABS ============

function initShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
            const target = tab.dataset.tab;
            document.getElementById(`${target}-list`).classList.add('active');
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
    renderPetInventory();
    initWheel();
    updateDisplay();
    updateAubinAppearance();

    // Show pets tab + inventory + codes tab if rebirth >= 1
    if (state.rebirthCount >= 1 && dom.petsTab) {
        dom.petsTab.style.display = '';
    }
    if (state.rebirthCount >= 1 && dom.codesTab) {
        dom.codesTab.style.display = '';
    }
    const petInv = document.getElementById('pet-inventory');
    if (petInv) {
        petInv.style.display = state.rebirthCount >= 1 ? '' : 'none';
    }

    dom.clickTarget.addEventListener('click', handleClick);
    dom.clickTarget.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(null);
        }
    });

    // Aubin pressed image
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

    dom.saveBtn.addEventListener('click', saveGame);
    dom.resetBtn.addEventListener('click', resetGame);
    dom.rebirthBtn.addEventListener('click', doRebirth);
    dom.spinBtn.addEventListener('click', spinWheel);
    if (dom.ascensionBtn) dom.ascensionBtn.addEventListener('click', doAscension);
    dom.codeSubmit.addEventListener('click', redeemCode);
    dom.codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') redeemCode();
    });

    initShopTabs();
    
    // Initialize ascension UI
    if (dom.ascensionShop) {
        renderAscensionShop();
        updateAscensionUI();
    }

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
    }, 2000);

    requestAnimationFrame(gameLoop);

    console.log("🍔 AubinClicker chargé ! Bon appétit !");
}

document.addEventListener('DOMContentLoaded', init);
