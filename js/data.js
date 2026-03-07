export const DEBUG_SPEED = 1;

export const FUSION_NAMES = ["", "❄️ Éveillé", "🔥 Ardent", "🔮 Mystique", "👑 Divin"];

export const FUSION_BASE_COST = {
    'common': 5000,
    'rare': 50000,
    'epic': 500000,
    'legendary': 10000000,
    'mythic': 500000000
};

export const UNIVERSES = [
    { name: "Monde Classique", theme: "theme-classic", emojis: ['🍔', '🍕', '🍟', '🍗'], cpsMult: 1, questMult: 1, diamondRate: 1 },
    { name: "Cyber-Bouffe 2077", theme: "theme-cyber", emojis: ['🔋', '💊', '🦾', '💾'], cpsMult: 1.5, questMult: 1.5, diamondRate: 2 },
    { name: "Royaume Sucré", theme: "theme-candy", emojis: ['🍩', '🧁', '🍰', '🍭'], cpsMult: 2.5, questMult: 2.5, diamondRate: 4 },
    { name: "Cuisine de l'Enfer", theme: "theme-hell", emojis: ['🌶️', '🔥', '🥩', '🌋'], cpsMult: 5, questMult: 5, diamondRate: 8 },
    { name: "Banquet Divin", theme: "theme-divine", emojis: ['✨', '🍇', '🍞', '🍷'], cpsMult: 12, questMult: 10, diamondRate: 15 },
    { name: "Dimension Absolue", theme: "theme-absolute", emojis: ['🌌', '⭐', '☄️', '💫'], cpsMult: 25, questMult: 20, diamondRate: 30 }
];

export const DIAMOND_UPGRADES = [
    { id: 'inv_space', name: 'Extension Sac', icon: '🎒', desc: '+10 places d\'inventaire', baseCost: 10, costMult: 1.5, type: 'inventory', value: 10, maxLevel: 20 },
    { id: 'rebirth_cost', name: 'Charisme Divin', icon: '🗣️', desc: '-5% sur l\'objectif de Rebirth', baseCost: 25, costMult: 2.0, type: 'rebirthCost', value: 0.05, maxLevel: 10 },
    { id: 'diamond_class', name: 'Classe Supérieure', icon: '👑', desc: 'Double les diamants / min', baseCost: 50, costMult: 2.5, type: 'diamondRate', value: 2, maxLevel: 20 },
    { id: 'egg_batch', name: 'Éclosion Multiple', icon: '🥚', desc: '+1 œuf ouvert par clic', baseCost: 40, costMult: 2.5, type: 'eggBatch', value: 1, maxLevel: 9 },
    { id: 'auto_sell', name: 'Auto-Vente', icon: '🗑️', desc: 'Débloque la vente automatique', baseCost: 500, costMult: 1, type: 'unlock', value: 1, maxLevel: 1 },
    { id: 'auto_roll', name: 'Auto-Éclosion', icon: '🎰', desc: 'Ouvre des œufs en arrière-plan', baseCost: 2500, costMult: 1, type: 'unlock', value: 1, maxLevel: 1 }
];

const BASE_DIAMOND_EGGS = [
    { id: 'egg_crystal', name: 'Œuf de Cristal', icon: '🔮', cost: 500, pool: [{ id: 'dragon', weight: 80 }, { id: 'licorne', weight: 20 }] },
    { id: 'egg_void', name: 'Œuf du Néant', icon: '🕳️', cost: 5000, pool: [{ id: 'licorne', weight: 100 }] }
];

const BASE_PETS = [
    { id: 'hamster', name: 'Hamster Boulimique', icon: '🐹', mult: 1.05, rarity: 'common', sellPrice: 500 },
    { id: 'chat', name: 'Chat Glouton', icon: '🐱', mult: 1.10, rarity: 'common', sellPrice: 1000 },
    { id: 'chien', name: 'Chien Pataud', icon: '🐶', mult: 1.20, rarity: 'rare', sellPrice: 5000 },
    { id: 'grenouille', name: 'Grenouille Grasse', icon: '🐸', mult: 1.30, rarity: 'rare', sellPrice: 15000 },
    { id: 'renard', name: 'Renard Malin', icon: '🦊', mult: 1.50, rarity: 'epic', sellPrice: 50000 },
    { id: 'cochon', name: 'Cochon d\'Or', icon: '🐷', mult: 2.00, rarity: 'epic', sellPrice: 200000 },
    { id: 'lion', name: 'Lion Affamé', icon: '🦁', mult: 3.00, rarity: 'legendary', sellPrice: 1000000 },
    { id: 'dragon', name: 'Dragon Calorique', icon: '🐉', mult: 5.00, rarity: 'legendary', sellPrice: 5000000 },
    { id: 'licorne', name: 'Licorne Calorique', icon: '🦄', mult: 10.00, rarity: 'mythic', sellPrice: 50000000 },
];

const BASE_EGGS = [
    { id: 'egg_wood', name: 'Œuf en Bois', icon: '🥚', cost: 15000, minRebirth: 0, pool: [{ id: 'hamster', weight: 70 }, { id: 'chat', weight: 30 }] },
    { id: 'egg_iron', name: 'Œuf en Fer', icon: '🍳', cost: 500000, minRebirth: 1, pool: [{ id: 'chat', weight: 50 }, { id: 'chien', weight: 40 }, { id: 'grenouille', weight: 10 }] },
    { id: 'egg_gold', name: 'Œuf en Or', icon: '✨', cost: 50000000, minRebirth: 3, pool: [{ id: 'grenouille', weight: 60 }, { id: 'renard', weight: 30 }, { id: 'cochon', weight: 10 }] },
    { id: 'egg_diamond', name: 'Œuf de Diamant', icon: '💎', cost: 10000000000, minRebirth: 5, pool: [{ id: 'cochon', weight: 60 }, { id: 'lion', weight: 35 }, { id: 'dragon', weight: 5 }] },
    { id: 'egg_mythic', name: 'Œuf Cosmique', icon: '🌌', cost: 5000000000000, minRebirth: 10, pool: [{ id: 'dragon', weight: 90 }, { id: 'licorne', weight: 10 }] }
];

export const PETS = [];
export const EGGS = [];
export const DIAMOND_EGGS = [];

export function updateDynamicContent(ascensionCount) {
    PETS.length = 0;
    EGGS.length = 0;
    DIAMOND_EGGS.length = 0;

    PETS.push(...BASE_PETS);
    EGGS.push(...BASE_EGGS);

    const suffixes = ["", "Cyber", "Sucré", "Infernal", "Divin", "Absolu"];

    for (let a = 1; a <= ascensionCount; a++) {
        const suffixStr = suffixes[Math.min(a, suffixes.length - 1)] || `Tier ${a}`;
        const suffix = ` (${suffixStr})`;

        const multPower = Math.pow(1.2, a); 
        const costPower = Math.pow(50, a); 

        const aPets = [
            { id: `hamster_${a}`, name: `Hamster${suffix}`, icon: '🐹', mult: 1.05 * multPower, rarity: 'common', sellPrice: 500 * costPower },
            { id: `chien_${a}`, name: `Chien${suffix}`, icon: '🐶', mult: 1.20 * multPower, rarity: 'rare', sellPrice: 5000 * costPower },
            { id: `cochon_${a}`, name: `Cochon${suffix}`, icon: '🐷', mult: 2.00 * multPower, rarity: 'epic', sellPrice: 200000 * costPower },
            { id: `dragon_${a}`, name: `Dragon${suffix}`, icon: '🐉', mult: 5.00 * multPower, rarity: 'legendary', sellPrice: 5000000 * costPower },
            { id: `licorne_${a}`, name: `Licorne${suffix}`, icon: '🦄', mult: 10.00 * multPower, rarity: 'mythic', sellPrice: 50000000 * costPower }
        ];
        PETS.push(...aPets);

        const aEggs = [
            { id: `egg_wood_${a}`, name: `Œuf Basique${suffix}`, icon: '🥚', cost: 15000 * costPower, minRebirth: 0, pool: [{ id: `hamster_${a}`, weight: 70 }, { id: `chien_${a}`, weight: 30 }] },
            { id: `egg_gold_${a}`, name: `Œuf Majeur${suffix}`, icon: '✨', cost: 50000000 * costPower, minRebirth: 2, pool: [{ id: `chien_${a}`, weight: 60 }, { id: `cochon_${a}`, weight: 30 }, { id: `dragon_${a}`, weight: 10 }] },
            { id: `egg_mythic_${a}`, name: `Œuf Suprême${suffix}`, icon: '🌌', cost: 5000000000000 * costPower, minRebirth: 5, pool: [{ id: `dragon_${a}`, weight: 90 }, { id: `licorne_${a}`, weight: 10 }] }
        ];
        EGGS.push(...aEggs);
    }

    const maxTier = ascensionCount === 0 ? '' : `_${ascensionCount}`;
    const dragonId = ascensionCount === 0 ? 'dragon' : `dragon${maxTier}`;
    const licorneId = ascensionCount === 0 ? 'licorne' : `licorne${maxTier}`;

    DIAMOND_EGGS.push(
        { id: 'egg_crystal', name: 'Œuf de Cristal', icon: '🔮', cost: 500, pool: [{ id: dragonId, weight: 80 }, { id: licorneId, weight: 20 }] },
        { id: 'egg_void', name: 'Œuf du Néant', icon: '🕳️', cost: 5000, pool: [{ id: licorneId, weight: 100 }] }
    );
}

export const BUILDINGS = [
    // NOUVEAU : baseMax passe à Infinity et costScale à 1.04 !
    { id: 'puff', name: 'Puff 16k', icon: '💨', desc: 'Un curseur en forme de Puff qui clique automatiquement sur Aubin', baseCost: 15, baseCps: 0.5, count: 0, minRebirth: 0, baseMax: Infinity, costScale: 1.05 },
    { id: 'frite', name: 'Barquette de Frites', icon: '🍟', desc: 'Une bonne grosse barquette bien grasse', baseCost: 100, baseCps: 3, count: 0, minRebirth: 0, baseMax: 50, costScale: 1.12 },
    { id: 'burger', name: 'Burger Double', icon: '🍔', desc: 'Double steak, double cheese, double Aubin', baseCost: 500, baseCps: 15, count: 0, minRebirth: 0, baseMax: 50, costScale: 1.14 },
    { id: 'kebab', name: 'Kebab Ketchup', icon: '🥙', desc: 'Kebab au ketchup', baseCost: 2000, baseCps: 50, count: 0, minRebirth: 1, baseMax: 50, costScale: 1.15 },
    { id: 'poulet', name: 'Bucket de Poulet', icon: '🍗', desc: 'Le seau familial... pour Aubin tout seul', baseCost: 8000, baseCps: 150, count: 0, minRebirth: 1, baseMax: 40, costScale: 1.16 },
    { id: 'pizza', name: 'Pizza 4 Fromages', icon: '🍕', desc: 'Aubin pourrait en manger 3 d\'affilée', baseCost: 35000, baseCps: 500, count: 0, minRebirth: 2, baseMax: 40, costScale: 1.18 },
    { id: 'buffet', name: 'Buffet à Volonté', icon: '🍖', desc: 'Le patron le reconnaît et pleure quand il arrive', baseCost: 200000, baseCps: 2000, count: 0, minRebirth: 3, baseMax: 30, costScale: 1.20 },
    { id: 'usine', name: 'Usine à Tacos', icon: '🏭', desc: 'Production industrielle pour les besoins d\'Aubin', baseCost: 1500000, baseCps: 8000, count: 0, minRebirth: 5, baseMax: 30, costScale: 1.22 },
    { id: 'labo', name: 'Labo de Calories', icon: '🧪', desc: 'Des scientifiques synthétisent de la calorie pure', baseCost: 20000000, baseCps: 40000, count: 0, minRebirth: 10, baseMax: 20, costScale: 1.25, reqAscension: 'unlock_labo' },
    { id: 'portail', name: 'Portail Gastronomique', icon: '🌀', desc: 'Un portail vers une dimension 100% bouffe', baseCost: 500000000, baseCps: 250000, count: 0, minRebirth: 15, baseMax: 10, costScale: 1.30, reqAscension: 'unlock_portail' },
];

export const UPGRADES = [
    { id: 'double_click', name: 'Doigts Gras', icon: '👆', desc: 'Double la puissance de clic', cost: 100, type: 'click', multiplier: 2, requirement: { type: 'clicks', value: 50 }, purchased: false },
    { id: 'triple_click', name: 'Mains de Beurre', icon: '🧈', desc: 'Triple pouvoir de clic. Ça glisse.', cost: 1000, type: 'click', multiplier: 3, requirement: { type: 'clicks', value: 200 }, purchased: false },
    { id: 'mega_click', name: 'Poing Calorique', icon: '👊', desc: 'x5 puissance de clic brute (ARC SALLE)', cost: 50000, type: 'click', multiplier: 5, requirement: { type: 'calories', value: 25000 }, purchased: false },
    { id: 'puff_50k', name: 'Puff 32k', icon: '🌬️', desc: 'Upgrade les Puffs en 32k ! Triple production', cost: 200, type: 'building', target: 'puff', multiplier: 3, requirement: { type: 'building', building: 'puff', value: 5 }, purchased: false },
    { id: 'sauce', name: 'Sauce en Plus', icon: '🫗', desc: 'Toutes les frites produisent x3 Calories d\'Or', cost: 1500, type: 'building', target: 'frite', multiplier: 3, requirement: { type: 'building', building: 'frite', value: 5 }, purchased: false },
    { id: 'triple_cheese', name: 'Triple Cheese', icon: '🧀', desc: 'Burgers passent au triple fromage ! x3', cost: 5000, type: 'building', target: 'burger', multiplier: 3, requirement: { type: 'building', building: 'burger', value: 5 }, purchased: false },
    { id: 'galette', name: 'Galette Maison', icon: '🫓', desc: 'Kebabs avec galette artisanale x3', cost: 20000, type: 'building', target: 'kebab', multiplier: 3, requirement: { type: 'building', building: 'kebab', value: 5 }, purchased: false },
    { id: 'aile_en_plus', name: 'Aile en Plus', icon: '🦴', desc: 'Chaque bucket contient 50% d\'ailes en plus x3', cost: 80000, type: 'building', target: 'poulet', multiplier: 3, requirement: { type: 'building', building: 'poulet', value: 5 }, purchased: false },
    { id: 'four_a_bois', name: 'Four à Bois', icon: '🪵', desc: 'Pizzas cuites au feu de bois = x3', cost: 300000, type: 'building', target: 'pizza', multiplier: 3, requirement: { type: 'building', building: 'pizza', value: 5 }, purchased: false },
    { id: 'appetit_leger', name: 'Gros Appétit', icon: '😋', desc: 'Aubin a encore plus faim ! Tout x1.5 !', cost: 10000, type: 'global', multiplier: 1.5, requirement: { type: 'calories', value: 5000 }, purchased: false },
    { id: 'trou_noir', name: 'Estomac sans Fond', icon: '🕳️', desc: 'La science ne peut pas expliquer où ça va. Tout x2', cost: 500000, type: 'global', multiplier: 2.0, requirement: { type: 'calories', value: 200000 }, purchased: false },
    { id: 'dimension_bouffe', name: 'Dimension Bouffe', icon: '🌌', desc: 'Aubin transcende la réalité. Tout x3', cost: 10000000, type: 'global', multiplier: 3.0, requirement: { type: 'calories', value: 2000000 }, purchased: false },
];

export const ASCENSION_UPGRADES = [
    { id: 'building_cap_1', name: 'Capacité Bâtiments +', icon: '🏗️', desc: '+10 au max de chaque bâtiment', type: 'buildingCap', value: 10, baseCost: 1, costMult: 2, maxLevel: 10, minAscension: 0 },
    { id: 'building_cap_2', name: 'Usine Améliorée', icon: '🏭', desc: '+25 au max de chaque bâtiment', type: 'buildingCap', value: 25, baseCost: 10, costMult: 2.5, maxLevel: 5, minAscension: 1 },
    { id: 'building_cap_3', name: 'Complexe Industriel', icon: '🌆', desc: '+50 au max de chaque bâtiment', type: 'buildingCap', value: 50, baseCost: 50, costMult: 3, maxLevel: 3, minAscension: 3 },
    { id: 'unlock_labo', name: 'Savoir Scientifique', icon: '🧪', desc: 'Débloque le Labo de Calories', type: 'unlock', value: 1, baseCost: 3, costMult: 1, maxLevel: 1, minAscension: 1 },
    { id: 'unlock_portail', name: 'Maître Dimensionnel', icon: '🌀', desc: 'Débloque le Portail Gastronomique', type: 'unlock', value: 1, baseCost: 6, costMult: 1, maxLevel: 1, minAscension: 2 },
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

export const QUEST_TEMPLATES = [
    { id: 'q_buildings', name: 'Empire Immobilier', icon: '🏗️', desc: 'Posséder un total de {target} bâtiments.', stat: 'buildings', isAction: false, calcTarget: (r) => Math.floor((20 + r * 10) * (0.8 + Math.random() * 0.4)), baseReward: 5000 },
    { id: 'q_cps', name: 'Usine à Calories', icon: '📈', desc: 'Atteindre {target} cal/s.', stat: 'cps', isAction: false, calcTarget: (r) => Math.floor((10 * Math.pow(5, r)) * (0.8 + Math.random() * 0.4)), baseReward: 15000 },
    { id: 'q_fuse', name: 'Alchimiste', icon: '✨', desc: 'Fusionner {target} pets.', stat: 'petsFused', isAction: true, calcTarget: (r) => Math.floor((5 + r * 2) * (0.8 + Math.random() * 0.4)), baseReward: 8000 },
    { id: 'q_sell', name: 'Ménage', icon: '🗑️', desc: 'Vendre {target} pets.', stat: 'petsSold', isAction: true, calcTarget: (r) => Math.floor((10 + r * 5) * (0.8 + Math.random() * 0.4)), baseReward: 6000 },
    { id: 'q_eggs', name: 'Gacha Addict', icon: '🥚', desc: 'Ouvrir {target} œufs.', stat: 'eggsOpened', isAction: true, calcTarget: (r) => Math.floor((3 + r * 2) * (0.8 + Math.random() * 0.4)), baseReward: 12000 },
    { id: 'q_time', name: 'Joueur Assidu', icon: '⏱️', desc: 'Jouer {target} minutes de plus.', stat: 'timePlayed', isAction: true, calcTarget: (r) => Math.floor(5 + Math.random() * 10), baseReward: 4000 }
];

export const QUOTES = [
    "\"J'ai un petit creux...\"", "\"On passe au McDo ?\"", "\"C'est pas gras, c'est du gras sain.\"", "\"J'ai mangé et je mange avec vous.\"",
    "\"Un kebab sans la sauce d'Ali c'est pas un kebab.\"", "\"J'ai déjà mangé, mais j'ai RE-faim.\"", "\"C'est les os qui sont lourds.\"",
    "\"Je suis pas gros, téma les bras.\"", "\"Le régime commence lundi. Comme chaque semaine.\"", "\"Faut manger pour vivre !... et vivre pour manger.\"",
    "\"5 fruits et légumes ? La pizza a de la tomate dessus.\"", "\"Mon péché mignon c'est la nourriture. Toute.\"", "\"J'ai pas mangé depuis 20 minutes, c'est grave docteur ?\"",
    "\"Le nutella c'est pas une addiction, c'est un mode de vie.\"", "\"J'ai un métabolisme... généreux.\"", "\"Ah tu fais remarquer que j'ai repris du dessert ? Et toi t'as repris de l'oxygène non ?\"",
    "\"Je mange mes émotions. Et j'ai beaucoup d'émotions.\"", "\"Le menu enfant c'est l'entrée.\"", "\"Je mange pas beaucoup, je mange souvent.\"",
    "\"Mon sport préféré c'est la fourchette.\"", "\"Passe-moi la puff frérot.\"", "\"CLIQUE ! J'ai encore la dalle.\""
];

export const MILESTONES = [
    { at: 100, text: "🎉 100 Calories d'Or ! Aubin a eu son goûter !" },
    { at: 1000, text: "🔥 1 000 Calories d'Or ! Un bon repas pour Aubin !" },
    { at: 10000, text: "💪 10 000 Calories d'Or ! Aubin est en forme !" },
    { at: 100000, text: "🏆 100K ! Aubin est devenu un athlète du manger !" },
    { at: 1000000, text: "🌟 1 MILLION ! Aubin est un dieu de la bouffe !" },
    { at: 10000000, text: "🚀 10 MILLIONS ! Aubin pourrait nourrir un village !" },
    { at: 100000000, text: "🌍 100 MILLIONS ! Aubin absorbe plus qu'un trou noir !" },
    { at: 1000000000, text: "✨ 1 MILLIARD ! Aubin a transcendé l'humanité !" },
];

export const FOOD_EMOJIS = ['🍔', '🍕', '🍟', '🍗', '🌮', '🌯', '🍖', '🍩', '🧁', '🍰', '🥐', '🥪', '🫔', '🍝', '🍜', '💨'];

export const AUBIN_IMAGES = [
    'images/aubin/aubin.png', 'images/aubin/aubin2.png', 'images/aubin/aubin3.png',
    'images/aubin/aubin4.png', 'images/aubin/aubin5.png', 'images/aubin/aubin6.png',
];

export const AUBIN_CYCLE = AUBIN_IMAGES.length;