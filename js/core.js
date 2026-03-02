import { state } from './state.js';
import * as data from './data.js';
import * as ui from './ui.js';

// ============ UTILS ============
export function formatNumber(n) {
    if (n < 1000) return Number(n.toFixed(1)).toLocaleString('fr-FR');
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
    if (tier === 0) return Number(n.toFixed(1)).toLocaleString('fr-FR');
    const suffix = suffixes[tier] || `e${tier * 3}`;
    const scale = Math.pow(10, tier * 3);
    const scaled = n / scale;
    return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + suffix;
}

export function getCurrentUniverse() {
    const idx = Math.min(state.ascensionCount, data.UNIVERSES.length - 1);
    return data.UNIVERSES[idx];
}

// ============ ENGINE ============
export let clickTimestamps = [];

export function getBuildingCost(building) {
    return Math.floor(building.baseCost * Math.pow(building.costScale, building.count));
}

export function getMaxBuildings(building) {
    if (building.reqAscension && getAscensionUpgradeLevel(building.reqAscension) === 0) return 0;
    return building.baseMax + getBuildingCapBonus();
}

export function checkRequirement(req) {
    switch (req.type) {
        case 'clicks': return state.totalClicks >= req.value;
        case 'calories': return state.totalCalories >= req.value;
        case 'building':
            const b = data.BUILDINGS.find(b => b.id === req.building);
            return b && b.count >= req.value;
        default: return true;
    }
}

export function recalculateCps() {
    let totalCps = 0;
    for (const b of data.BUILDINGS) {
        let bCps = b.baseCps * b.count;
        for (const u of data.UPGRADES) {
            if (u.purchased && u.type === 'building' && u.target === b.id) {
                bCps *= u.multiplier;
            }
        }
        totalCps += bCps;
    }
    let globalMult = 1;
    for (const u of data.UPGRADES) {
        if (u.purchased && u.type === 'global') globalMult *= u.multiplier;
    }
    state.globalMultiplier = globalMult;
    
    const petMult = getPetMultiplier();
    const ascensionCpsMult = getCpsMultiplierBonus();
    const universeCpsMult = getCurrentUniverse().cpsMult; // Bonus Univers

    state.cps = totalCps * globalMult * petMult * ascensionCpsMult * universeCpsMult;

    let clickMult = 1;
    for (const u of data.UPGRADES) {
        if (u.purchased && u.type === 'click') clickMult *= u.multiplier;
    }
    const ascensionClickMult = getClickMultiplierBonus();
    state.clickMultiplier = clickMult;
    state.clickPower = 1 * clickMult * globalMult * petMult * ascensionClickMult * universeCpsMult;
}

export function handleClick(e) {
    const now = Date.now();
    clickTimestamps = clickTimestamps.filter(t => now - t < 1000);
    if (clickTimestamps.length >= 10) return;
    clickTimestamps.push(now);

    const amount = state.clickPower;
    state.calories += amount;
    state.totalCalories += amount;
    state.totalClicks++;

    ui.animateClick(e, amount);
    ui.updateDisplay();
    ui.checkMilestones();
}

// ============ PRESTIGE & ASCENSION ============
export function getAscensionUpgradeLevel(upgradeId) { return state.ascensionUpgrades[upgradeId] || 0; }
export function getAscensionUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, getAscensionUpgradeLevel(upgrade.id)));
}
export function getBuildingCapBonus() {
    let bonus = 0;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'buildingCap') bonus += getAscensionUpgradeLevel(u.id) * u.value;
    return bonus;
}
export function getPetSlotBonus() {
    let bonus = 0;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'petSlot') bonus += getAscensionUpgradeLevel(u.id) * u.value;
    return bonus;
}
export function getLuckBonus() {
    let bonus = 0;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'luck') bonus += getAscensionUpgradeLevel(u.id) * u.value;
    return bonus;
}
export function getClickMultiplierBonus() {
    let mult = 1;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'clickMult') mult *= Math.pow(u.value, getAscensionUpgradeLevel(u.id));
    return mult;
}
export function getCpsMultiplierBonus() {
    let mult = 1;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'cpsMult') mult *= Math.pow(u.value, getAscensionUpgradeLevel(u.id));
    return mult;
}
export function getRebirthBonus() {
    let bonus = 0;
    for (const u of data.ASCENSION_UPGRADES) if (u.type === 'rebirthBonus') bonus += getAscensionUpgradeLevel(u.id) * u.value;
    return bonus;
}

export function recalcMaxPetSlots() {
    state.maxPetSlots = 3 + state.bonusPetSlots + getPetSlotBonus();
}

export function getRebirthTarget() { 
    const base = 100000 * Math.pow(5, state.rebirthCount); 
    const discountLvl = state.diamondUpgradesPurchased['rebirth_cost'] || 0;
    return base * (1 - (discountLvl * 0.05)); // Jusqu'à -50% avec les diamants
}
export function canRebirth() { return state.calories >= getRebirthTarget(); }
export function getAscensionCost() { return state.ascensionCount * 10 + 10; }
export function canAscend() { return state.rebirthCount >= getAscensionCost(); }
export function getAscensionPointsPerRebirth() { return 1 + Math.floor(state.rebirthCount / 10); }

export function doRebirth() {
    if (!canRebirth()) return;
    if (!confirm(`🔄 REBIRTH !\nTu vas :\n- Garder pets et tokens\n- Gagner 1 Rebirth Token\n- Perdre bâtiments, améliorations et calories\nContinuer ?`)) return;

    state.rebirthCount++;
    state.rebirthTokens += (1 + getRebirthBonus());
    recalcMaxPetSlots();

    state.calories = 0; state.totalCalories = 0; state.totalClicks = 0;
    state.clickPower = 1; state.cps = 0; state.clickMultiplier = 1; state.globalMultiplier = 1;
    state.milestonesReached = [];
    state.completedQuests = []; state.activeQuests = []; state.lastQuestTypes = [];
    state.stats = { eggsOpened: 0, petsFused: 0, petsSold: 0, timePlayed: 0 };

    for (const b of data.BUILDINGS) b.count = 0;
    for (const u of data.UPGRADES) u.purchased = false;

    recalculateCps();
    generateQuests(); 
    ui.updateAubinAppearance();
    ui.showMilestone(`🔄 Rebirth #${state.rebirthCount} ! +1 Token 🪙`);
    ui.showQuote(`"Aubin renaît de ses cendres... mais il a toujours faim."`);
    ui.renderAll();
}

export function doAscension() {
    if (!canAscend()) return;
    if (!confirm(`✨ ASCENSION !\nTu vas :\n- Changer d'Univers !\n- Recevoir ${getAscensionPointsPerRebirth()} Points d'Ascension ✨\n- Recommencer depuis le début (mais avec tes bonus permanents !)\n\nContinuer ?`)) return;

    state.ascensionCount++;
    state.ascensionPoints += getAscensionPointsPerRebirth();
    state.calories = 0; state.totalCalories = 0; state.totalClicks = 0;
    state.clickPower = 1; state.cps = 0; state.clickMultiplier = 1; state.globalMultiplier = 1;
    state.milestonesReached = []; state.rebirthTokens = 0;
    state.completedQuests = []; state.activeQuests = []; state.lastQuestTypes = [];
    state.stats = { eggsOpened: 0, petsFused: 0, petsSold: 0, timePlayed: 0 };
    state.codesUsed = []; state.isSelectionMode = false; state.selectedPetsToSell = [];
    
    for (const b of data.BUILDINGS) b.count = 0;
    for (const u of data.UPGRADES) u.purchased = false;
    
    ui.applyUniverseTheme();
    recalcMaxPetSlots();
    recalculateCps();
    generateQuests();
    ui.updateAubinAppearance();
    ui.showMilestone(`✨ Ascension #${state.ascensionCount} ! Nouveau Monde ! ✨`);
    ui.showQuote(`"Ce monde a un goût... différent."`);
    ui.renderAll();
}

export function buyAscensionUpgrade(upgradeId) {
    const upgrade = data.ASCENSION_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const currentLevel = getAscensionUpgradeLevel(upgradeId);
    if (currentLevel >= upgrade.maxLevel) { ui.showQuote("Niveau maximum atteint !"); return; }
    
    const cost = getAscensionUpgradeCost(upgrade);
    if (state.ascensionPoints < cost) { ui.showQuote("Pas assez de Points !"); return; }
    if (state.ascensionCount < upgrade.minAscension) { ui.showQuote("Atteins l'Ascension " + upgrade.minAscension); return; }
    
    state.ascensionPoints -= cost;
    state.ascensionUpgrades[upgradeId] = currentLevel + 1;
    recalcMaxPetSlots();
    recalculateCps();
    ui.showMilestone(`${upgrade.icon} ${upgrade.name} niveau ${currentLevel + 1} !`);
    ui.renderAll();
}

// ============ MARCHÉ NOIR (DIAMANTS) ============
export function buyDiamondUpgrade(uId) {
    const u = data.DIAMOND_UPGRADES.find(x => x.id === uId);
    if (!u) return;
    const currentLevel = state.diamondUpgradesPurchased[u.id] || 0;
    if (currentLevel >= u.maxLevel) return;
    
    const cost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLevel));
    if (state.diamonds >= cost) {
        state.diamonds -= cost;
        state.diamondUpgradesPurchased[u.id] = currentLevel + 1;
        recalcMaxPetSlots();
        ui.updateDiamondUI();
        ui.renderDiamondShop();
        ui.updateRebirthUI();
        ui.renderPetInventory();
        ui.showMilestone(`💎 Amélioration achetée : ${u.name}`);
    }
}

export function buyDiamondEgg(eggId) {
    const egg = data.DIAMOND_EGGS.find(x => x.id === eggId);
    if (!egg) return;
    if (state.diamonds < egg.cost) return;
    if (state.inventoryPets.length >= getMaxInventory()) { ui.showQuote("Inventaire plein !"); return; }

    state.diamonds -= egg.cost;
    state.stats.eggsOpened++;

    const totalWeight = egg.pool.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedId = egg.pool[0].id;
    for (const p of egg.pool) {
        rand -= p.weight;
        if (rand <= 0) { selectedId = p.id; break; }
    }

    const petData = data.PETS.find(p => p.id === selectedId);
    if (!state.discoveredPets.includes(selectedId)) state.discoveredPets.push(selectedId);

    state.inventoryPets.push({ uid: Date.now() + Math.random(), id: selectedId, fusionLevel: 0 });
    
    ui.showMilestone(`💎 Éclosion Divine : ${petData.icon} ${petData.name} !`);
    ui.updateDiamondUI();
    ui.renderDiamondShop();
    if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
    ui.renderPetIndex();
}

// ============ PETS & GACHA ============
export function getMaxInventory() {
    let bonus = 0;
    const u = state.ascensionUpgrades['inventory_cap'];
    if (u) bonus += u * 50;
    const diaU = state.diamondUpgradesPurchased['inv_space'];
    if (diaU) bonus += diaU * 10;
    return 100 + bonus;
}

export function getPetMultiplier() {
    let totalBonus = 0;
    for (const pInfo of state.equippedPets) {
        const pet = data.PETS.find(p => p.id === pInfo.id);
        if (pet) {
            const fLvl = pInfo.fusionLevel || 0;
            totalBonus += (pet.mult - 1) * (1 + (fLvl * 0.5));
        }
    }
    return 1 + totalBonus;
}

export function buyEgg(egg) {
    if (state.calories < egg.cost) return;
    if (state.inventoryPets.length >= getMaxInventory()) { ui.showQuote("Inventaire plein ! Vends des pets d'abord."); return; }

    state.calories -= egg.cost;
    state.stats.eggsOpened++;

    const totalWeight = egg.pool.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedId = egg.pool[0].id;

    for (const p of egg.pool) {
        rand -= p.weight;
        if (rand <= 0) { selectedId = p.id; break; }
    }

    const petData = data.PETS.find(p => p.id === selectedId);
    if (!state.discoveredPets.includes(selectedId)) {
        state.discoveredPets.push(selectedId);
        ui.showMilestone(`📖 Nouveau Pet découvert : ${petData.name} !`);
    }

    state.inventoryPets.push({ uid: Date.now() + Math.random(), id: selectedId, fusionLevel: 0 });
    ui.showMilestone(`🥚 Éclosion : ${petData.icon} ${petData.name} !`);
    
    ui.updateDisplay();
    ui.renderEggs();
    if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
    ui.renderPetIndex();
}

export function fusePet(uid) {
    let targetPet = state.inventoryPets.find(p => p.uid === uid) || state.equippedPets.find(p => p.uid === uid);
    if (!targetPet) return;

    const currentLevel = targetPet.fusionLevel || 0;
    if (currentLevel >= 4) { ui.showQuote("Pet fusionné au maximum."); return; }

    let allSameLevel = [...state.inventoryPets, ...state.equippedPets].filter(p => p.id === targetPet.id && (p.fusionLevel || 0) === currentLevel && p.uid !== targetPet.uid);
    if (allSameLevel.length < 4) { ui.showQuote(`Pas assez de pets identiques.`); return; }

    const petData = data.PETS.find(p=>p.id===targetPet.id);
    const fusionCost = data.FUSION_BASE_COST[petData.rarity] * Math.pow(10, currentLevel);
    if (state.calories < fusionCost) { ui.showQuote(`Pas assez de calories !`); return; }

    state.calories -= fusionCost;
    let toRemove = 4;
    state.inventoryPets = state.inventoryPets.filter(p => { if (toRemove > 0 && p.id === targetPet.id && (p.fusionLevel || 0) === currentLevel && p.uid !== targetPet.uid) { toRemove--; return false; } return true; });
    if (toRemove > 0) state.equippedPets = state.equippedPets.filter(p => { if (toRemove > 0 && p.id === targetPet.id && (p.fusionLevel || 0) === currentLevel && p.uid !== targetPet.uid) { toRemove--; return false; } return true; });

    targetPet.fusionLevel = currentLevel + 1;
    state.stats.petsFused++;
    
    const selIdx = state.selectedPetsToSell.indexOf(uid);
    if (selIdx > -1) state.selectedPetsToSell.splice(selIdx, 1);

    ui.showMilestone(`✨ Ton pet devient ${data.FUSION_NAMES[targetPet.fusionLevel]} !`);
    recalculateCps();
    if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
    ui.updateDisplay();
    ui.updateRebirthUI();
}

export function autoFusePets() {
    let fusedAny = false; let keepFusing = true; let fusionsCount = 0; let totalCost = 0;
    while (keepFusing) {
        keepFusing = false;
        let counts = {};
        [...state.inventoryPets, ...state.equippedPets].forEach(p => {
            const fLvl = p.fusionLevel || 0;
            if (fLvl < 4) { const key = `${p.id}_${fLvl}`; if (!counts[key]) counts[key] = { count: 0, items: [] }; counts[key].count++; counts[key].items.push(p); }
        });
        for (const key in counts) {
            if (counts[key].count >= 5) {
                const id = counts[key].items[0].id; const fLvl = counts[key].items[0].fusionLevel || 0;
                const petData = data.PETS.find(p=>p.id===id);
                const fusionCost = data.FUSION_BASE_COST[petData.rarity] * Math.pow(10, fLvl);
                if (state.calories >= fusionCost) {
                    state.calories -= fusionCost; totalCost += fusionCost;
                    let toRemove = 5;
                    state.inventoryPets = state.inventoryPets.filter(p => { if (toRemove > 0 && p.id === id && (p.fusionLevel || 0) === fLvl) { toRemove--; return false; } return true; });
                    if (toRemove > 0) state.equippedPets = state.equippedPets.filter(p => { if (toRemove > 0 && p.id === id && (p.fusionLevel || 0) === fLvl) { toRemove--; return false; } return true; });
                    state.inventoryPets.push({ uid: Date.now() + Math.random(), id: id, fusionLevel: fLvl + 1 });
                    fusedAny = true; keepFusing = true; fusionsCount++; break; 
                }
            }
        }
    }
    if (fusedAny) {
        state.stats.petsFused += fusionsCount;
        recalculateCps();
        if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
        ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
        ui.showMilestone(`✨ Auto-fusion : ${fusionsCount} fusions !`);
    } else ui.showQuote("Aucune fusion possible.");
}

export function equipPet(uid) {
    if (state.equippedPets.length >= state.maxPetSlots) { ui.showQuote("Tu ne peux pas équiper plus de pets !"); return; }
    const index = state.inventoryPets.findIndex(p => p.uid === uid);
    if (index > -1) {
        state.equippedPets.push(state.inventoryPets.splice(index, 1)[0]);
        recalculateCps(); ui.renderPetInventory(); ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
    }
}
export function unequipPet(uid) {
    if (state.inventoryPets.length >= getMaxInventory()) { ui.showQuote("Inventaire plein !"); return; }
    const index = state.equippedPets.findIndex(p => p.uid === uid);
    if (index > -1) {
        state.inventoryPets.push(state.equippedPets.splice(index, 1)[0]);
        recalculateCps(); 
        if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
        ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
    }
}
export function sellPet(uid, fromEquipped = false) {
    const list = fromEquipped ? state.equippedPets : state.inventoryPets;
    const index = list.findIndex(p => p.uid === uid);
    if (index > -1) {
        const petData = data.PETS.find(p => p.id === list[index].id);
        const sellValue = petData.sellPrice * Math.pow(5, list[index].fusionLevel || 0);
        if(!confirm(`Vendre pour ${formatNumber(sellValue)} cal ?`)) return;
        list.splice(index, 1);
        state.calories += sellValue; state.totalCalories += sellValue; state.stats.petsSold++;
        recalculateCps(); ui.renderPetInventory(); ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
    }
}
export function equipBestPets() {
    while(state.equippedPets.length > 0) state.inventoryPets.push(state.equippedPets.pop());
    state.inventoryPets.sort((a, b) => {
        const petA = data.PETS.find(p => p.id === a.id); const petB = data.PETS.find(p => p.id === b.id);
        const multA = petA ? (petA.mult - 1) * (1 + (a.fusionLevel || 0) * 0.5) : 0;
        const multB = petB ? (petB.mult - 1) * (1 + (b.fusionLevel || 0) * 0.5) : 0;
        return multB - multA;
    });
    const toEquip = Math.min(state.maxPetSlots, state.inventoryPets.length);
    for(let i=0; i<toEquip; i++) state.equippedPets.push(state.inventoryPets.shift());
    recalculateCps();
    if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
    ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
}

export function toggleSelectionMode() {
    state.isSelectionMode = !state.isSelectionMode;
    state.selectedPetsToSell = []; 
    const btnMode = document.getElementById('btn-selection-mode');
    const btnDelete = document.getElementById('btn-delete-selected');
    if (state.isSelectionMode) {
        if(btnMode) { btnMode.textContent = 'Annuler Sélection'; btnMode.style.background = 'var(--text-muted)'; }
        if(btnDelete) { btnDelete.style.display = 'block'; btnDelete.textContent = 'Vendre (0)'; }
    } else {
        if(btnMode) { btnMode.textContent = 'Sélect. Multiple'; btnMode.style.background = ''; }
        if(btnDelete) btnDelete.style.display = 'none';
    }
    ui.renderPetInventory();
}

export function togglePetSaleSelection(uid) {
    if (!state.isSelectionMode) return;
    const idx = state.selectedPetsToSell.indexOf(uid);
    if (idx > -1) state.selectedPetsToSell.splice(idx, 1); else state.selectedPetsToSell.push(uid);
    const btnDelete = document.getElementById('btn-delete-selected');
    if(btnDelete) btnDelete.textContent = `Vendre (${state.selectedPetsToSell.length})`;
    ui.renderPetInventory(); 
}

export function togglePetActions(uid) {
    document.querySelectorAll('.pet-card').forEach(c => {
        if (c.dataset.uid === String(uid)) c.classList.toggle('selected');
        else c.classList.remove('selected');
    });
}

export function sellSelectedPets() {
    if (state.selectedPetsToSell.length === 0) return;
    let totalGain = 0;
    const petsToSell = state.inventoryPets.filter(p => state.selectedPetsToSell.includes(p.uid));
    for(const p of petsToSell) {
        const petData = data.PETS.find(pd => pd.id === p.id);
        if(petData) totalGain += petData.sellPrice * Math.pow(5, p.fusionLevel || 0);
    }
    if(!confirm(`Vendre ces ${state.selectedPetsToSell.length} pets ?`)) return;
    
    state.calories += totalGain; state.totalCalories += totalGain; state.stats.petsSold += petsToSell.length;
    state.inventoryPets = state.inventoryPets.filter(p => !state.selectedPetsToSell.includes(p.uid));
    state.isSelectionMode = false; state.selectedPetsToSell = [];
    const btnMode = document.getElementById('btn-selection-mode');
    const btnDelete = document.getElementById('btn-delete-selected');
    if (btnMode) { btnMode.textContent = 'Sélect. Multiple'; btnMode.style.background = ''; }
    if (btnDelete) btnDelete.style.display = 'none';
    
    recalculateCps(); ui.renderPetInventory(); ui.renderEggs(); ui.updateDisplay(); ui.updateRebirthUI();
    ui.showQuote(`Vente massive ! +${formatNumber(totalGain)} cal`);
}

export function toggleSortInventory(forceSort = false) {
    if (!forceSort) state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
    else if (!state.sortOrder) state.sortOrder = 'desc';
    
    state.inventoryPets.sort((a, b) => {
        const petA = data.PETS.find(p => p.id === a.id); const petB = data.PETS.find(p => p.id === b.id);
        const multA = petA ? (petA.mult - 1) * (1 + (a.fusionLevel || 0) * 0.5) : 0;
        const multB = petB ? (petB.mult - 1) * (1 + (b.fusionLevel || 0) * 0.5) : 0;
        return state.sortOrder === 'desc' ? multB - multA : multA - multB;
    });
    const btnSort = document.getElementById('btn-sort-inventory');
    if (btnSort) btnSort.innerHTML = state.sortOrder === 'desc' ? '🔽 Trier (Max)' : '🔼 Trier (Min)';
    ui.renderPetInventory();
}

// ============ QUESTS ============
export function getStatValue(statName) {
    switch(statName) {
        case 'buildings': return data.BUILDINGS.reduce((sum, b) => sum + b.count, 0);
        case 'cps': return state.cps;
        case 'timePlayed': return Math.floor(state.stats.timePlayed / 60);
        default: return state.stats[statName] || 0;
    }
}

export function generateQuests() {
    const maxQuests = 4;
    const r = state.rebirthCount;
    const uniQuestMult = getCurrentUniverse().questMult; // Bonus Univers

    while (state.activeQuests.length < maxQuests) {
        const availableTemplates = data.QUEST_TEMPLATES.filter(t => !state.lastQuestTypes.includes(t.id));
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        const target = Math.max(1, template.calcTarget(r));
        const avgTarget = Math.max(1, template.calcTarget(r)); 
        const difficultyMult = target / avgTarget; 
        
        const reward = Math.floor(template.baseReward * Math.pow(5, r) * difficultyMult * uniQuestMult);
        
        state.activeQuests.push({
            uid: Date.now() + Math.random(), templateId: template.id, name: template.name,
            icon: template.icon, desc: template.desc.replace('{target}', template.stat === 'cps' ? formatNumber(target) : target),
            target: target, reward: reward, stat: template.stat, isAction: template.isAction,
            startValue: template.isAction ? getStatValue(template.stat) : 0
        });
        state.lastQuestTypes.push(template.id);
        if (state.lastQuestTypes.length > 3) state.lastQuestTypes.shift(); 
    }
}

export function getQuestProgress(q) {
    const current = getStatValue(q.stat);
    if (q.isAction) return Math.max(0, current - q.startValue);
    return current;
}
export function isQuestComplete(q) { return getQuestProgress(q) >= q.target; }

export function claimQuest(uid) {
    const questIndex = state.activeQuests.findIndex(q => q.uid === uid);
    if (questIndex === -1) return;
    const quest = state.activeQuests[questIndex];
    if (!isQuestComplete(quest)) return;
    
    state.calories += quest.reward; state.totalCalories += quest.reward;
    state.completedQuests.push(quest.templateId); 
    state.activeQuests.splice(questIndex, 1);
    
    generateQuests();
    ui.showMilestone(`🎯 Quête terminée : ${quest.name} !`);
    ui.showQuote(`"Une quête de plus de finie... ça donne faim."`);
    ui.renderQuests(); ui.updateDisplay(); ui.updateRebirthUI(); 
}

// ============ SHOP ============
export function buyBuilding(building) {
    if (building.count >= getMaxBuildings(building)) return;
    const cost = getBuildingCost(building);
    if (state.calories < cost) return;
    state.calories -= cost; building.count++;
    recalculateCps(); ui.updateDisplay(); ui.renderBuildings(); ui.renderOrbitPuffs(); ui.renderUpgrades();
    const el = document.querySelector(`[data-id="${building.id}"]`);
    if (el) { el.classList.add('purchase-flash'); setTimeout(() => el.classList.remove('purchase-flash'), 500); }
}

export function buyUpgrade(upgrade) {
    if (state.calories < upgrade.cost || upgrade.purchased) return;
    state.calories -= upgrade.cost; upgrade.purchased = true;
    recalculateCps(); ui.updateDisplay(); ui.renderBuildings(); ui.renderUpgrades();
    ui.showQuote(`"${upgrade.name}" débloqué ! 🎉`);
}

// ============ CODES ============
export function redeemCode(inputRaw) {
    const input = inputRaw.trim().toUpperCase();
    const domCodeResult = document.getElementById('code-result');
    if(!domCodeResult) return;
    if (!input) { domCodeResult.textContent = '❌ Entre un code !'; domCodeResult.className = 'code-result error'; return; }
    if (state.codesUsed.includes(input)) { domCodeResult.textContent = '⚠️ Code déjà utilisé !'; domCodeResult.className = 'code-result error'; return; }
    
    if (input === 'ROMAINJTM') {
        state.codesUsed.push(input);
        state.bonusPetSlots++; recalcMaxPetSlots();
        state.inventoryPets.push({ uid: Date.now() + Math.random(), id: 'licorne', fusionLevel: 0 });
        if (!state.discoveredPets.includes('licorne')) state.discoveredPets.push('licorne');
        recalculateCps();
        if (state.sortOrder) toggleSortInventory(true); else ui.renderPetInventory();
        ui.renderPetIndex(); ui.updateDisplay();
        const msg = '🦄 Licorne Calorique ajoutée + 1 slot bonus !';
        domCodeResult.textContent = msg; domCodeResult.className = 'code-result success';
        ui.showMilestone(msg);
    } else {
        domCodeResult.textContent = '❌ Code invalide !'; domCodeResult.className = 'code-result error';
    }
}

// ============ SAVE/LOAD ============
export function saveGame() {
    const saveData = {
        calories: state.calories, totalCalories: state.totalCalories, totalClicks: state.totalClicks,
        startTime: state.startTime, milestonesReached: state.milestonesReached,
        buildings: data.BUILDINGS.map(b => ({ id: b.id, count: b.count })),
        upgrades: data.UPGRADES.filter(u => u.purchased).map(u => u.id),
        rebirthCount: state.rebirthCount, rebirthTokens: state.rebirthTokens,
        equippedPets: state.equippedPets, inventoryPets: state.inventoryPets,
        discoveredPets: state.discoveredPets, bonusPetSlots: state.bonusPetSlots,
        codesUsed: state.codesUsed, ascensionCount: state.ascensionCount,
        ascensionPoints: state.ascensionPoints, ascensionUpgrades: state.ascensionUpgrades,
        sortOrder: state.sortOrder, completedQuests: state.completedQuests,
        activeQuests: state.activeQuests, lastQuestTypes: state.lastQuestTypes,
        stats: state.stats, savedAt: Date.now(),
        // Diamants
        diamonds: state.diamonds, diamondProgress: state.diamondProgress, diamondUpgradesPurchased: state.diamondUpgradesPurchased
    };
    localStorage.setItem('aubinclicker_save', JSON.stringify(saveData));
    ui.showQuote("💾 Partie sauvegardée !");
}

export function loadGame() {
    const raw = localStorage.getItem('aubinclicker_save');
    if (!raw) return false;
    try {
        const d = JSON.parse(raw);
        state.calories = Number(d.calories) || 0; state.totalCalories = Number(d.totalCalories) || 0;
        if (isNaN(state.calories) || !isFinite(state.calories)) state.calories = 0;
        if (isNaN(state.totalCalories) || !isFinite(state.totalCalories)) state.totalCalories = 0;
        state.totalClicks = d.totalClicks || 0; state.startTime = d.startTime || Date.now();
        state.milestonesReached = d.milestonesReached || [];
        if (d.buildings) for (const saved of d.buildings) { const b = data.BUILDINGS.find(b => b.id === saved.id); if (b) b.count = saved.count; }
        if (d.upgrades) for (const id of d.upgrades) { const u = data.UPGRADES.find(u => u.id === id); if (u) u.purchased = true; }
        state.rebirthCount = d.rebirthCount || 0; state.rebirthTokens = d.rebirthTokens || 0;
        state.bonusPetSlots = d.bonusPetSlots || 0; state.codesUsed = d.codesUsed || [];
        state.sortOrder = d.sortOrder || 'desc';
        state.completedQuests = d.completedQuests || []; state.activeQuests = d.activeQuests || [];
        state.lastQuestTypes = d.lastQuestTypes || []; state.stats = d.stats || { eggsOpened: 0, petsFused: 0, petsSold: 0, timePlayed: 0 };
        state.equippedPets = d.equippedPets || []; state.inventoryPets = d.inventoryPets || []; state.discoveredPets = d.discoveredPets || [];
        
        state.diamonds = d.diamonds || 0; state.diamondProgress = d.diamondProgress || 0; state.diamondUpgradesPurchased = d.diamondUpgradesPurchased || {};

        const migrateFusion = (p) => { if (p.isFused) { p.fusionLevel = 1; delete p.isFused; } if (p.fusionLevel === undefined) p.fusionLevel = 0; };
        state.equippedPets.forEach(migrateFusion); state.inventoryPets.forEach(migrateFusion);
        state.ascensionCount = d.ascensionCount || 0; state.ascensionPoints = d.ascensionPoints || 0; state.ascensionUpgrades = d.ascensionUpgrades || {};
        recalcMaxPetSlots();
        return true;
    } catch (e) { console.warn('Erreur chargement:', e); return false; }
}

export function resetGame() {
    if (!confirm("⚠️ Tout effacer ? Aubin va devoir recommencer son régime...")) return;
    localStorage.removeItem('aubinclicker_save');
    state.calories = 0; state.totalCalories = 0; state.totalClicks = 0; state.clickPower = 1;
    state.cps = 0; state.clickMultiplier = 1; state.globalMultiplier = 1;
    state.milestonesReached = []; state.startTime = Date.now();
    state.completedQuests = []; state.activeQuests = []; state.lastQuestTypes = [];
    state.stats = { eggsOpened: 0, petsFused: 0, petsSold: 0, timePlayed: 0 };
    for (const b of data.BUILDINGS) b.count = 0;
    for (const u of data.UPGRADES) u.purchased = false;
    
    state.rebirthCount = 0; state.rebirthTokens = 0; state.equippedPets = [];
    state.inventoryPets = []; state.discoveredPets = []; state.maxPetSlots = 3;
    state.bonusPetSlots = 0; state.codesUsed = []; state.sortOrder = 'desc';
    state.ascensionCount = 0; state.ascensionPoints = 0; state.ascensionUpgrades = {};
    state.isSelectionMode = false; state.selectedPetsToSell = [];
    state.diamonds = 0; state.diamondProgress = 0; state.diamondUpgradesPurchased = {};
    
    ui.applyUniverseTheme();
    recalculateCps();
    generateQuests();
    ui.renderAll();
    ui.showQuote("🔄 C'est reparti ! Aubin a encore faim !");
}