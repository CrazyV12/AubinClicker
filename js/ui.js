import { state } from './state.js';
import * as data from './data.js';
import * as core from './core.js';

let lastQuoteIndex = -1;
let currentOrbitConfig = '';

// ============ DYNAMIC EVENTS ============
// Fonction magique pour attacher les clics de l'inventaire sans "onclick" dans le HTML
function bindPetEvents(container) {
    if(!container) return;
    container.querySelectorAll('.pet-card').forEach(card => {
        const uid = Number(card.dataset.uid);
        if (!uid) return;

        card.addEventListener('click', () => {
            if (state.isSelectionMode) core.togglePetSaleSelection(uid);
            else core.togglePetActions(uid);
        });

        card.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'fuse') core.fusePet(uid);
                else if (action === 'fuse-max') showQuote("Ce pet est déjà fusionné au maximum.");
                else if (action === 'unequip') core.unequipPet(uid);
                else if (action === 'equip') core.equipPet(uid);
                else if (action === 'sell-equip') core.sellPet(uid, true);
                else if (action === 'sell-inv') core.sellPet(uid, false);
            });
        });
    });
}

// ============ RENDER FUNCTIONS ============
export function updateDisplay() {
    const el = (id) => document.getElementById(id);
    if(el('calorie-count')) el('calorie-count').textContent = core.formatNumber(state.calories);
    if(el('total-calories')) el('total-calories').textContent = core.formatNumber(state.totalCalories);
    if(el('cal-per-second')) el('cal-per-second').textContent = core.formatNumber(state.cps);
    if(el('cal-per-click')) el('cal-per-click').textContent = core.formatNumber(state.clickPower);
    if(el('total-clicks')) el('total-clicks').textContent = core.formatNumber(state.totalClicks);
    document.title = `${core.formatNumber(state.calories)} Calories d'Or - AubinClicker 🍔`;

    const list = el('buildings-list');
    if(list) {
        list.querySelectorAll('.shop-item').forEach(item => {
            const b = data.BUILDINGS.find(b => b.id === item.dataset.id);
            if (!b) return;
            const maxBuildings = core.getMaxBuildings(b);
            const isHardLocked = state.rebirthCount < (b.minRebirth || 0);
            const isMaxed = b.count >= maxBuildings;
            const cost = core.getBuildingCost(b);
            const canAfford = state.calories >= cost && !isMaxed && !isHardLocked;
            const isSoftLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;
            
            item.classList.toggle('can-afford', canAfford);
            item.classList.toggle('locked', isMaxed || isSoftLocked || isHardLocked);
            
            const costEl = item.querySelector('.shop-item-cost');
            if (costEl) {
                if (isHardLocked) { costEl.textContent = `🔄 Rebirth ${b.minRebirth}`; costEl.classList.remove('too-expensive'); }
                else if (isMaxed) { costEl.textContent = 'MAX'; costEl.classList.remove('too-expensive'); }
                else { costEl.textContent = `${core.formatNumber(cost)} cal`; costEl.classList.toggle('too-expensive', !canAfford); }
            }
            const countEl = item.querySelector('.shop-item-count');
            if (countEl) countEl.textContent = isHardLocked ? '0' : `${b.count} / ${maxBuildings}`;
        });
    }
}

export function renderBuildings() {
    const list = document.getElementById('buildings-list');
    if(!list) return;
    list.innerHTML = '';
    for (const b of data.BUILDINGS) {
        const maxBuildings = core.getMaxBuildings(b);
        const cost = core.getBuildingCost(b);
        const isMaxed = b.count >= maxBuildings;
        const isHardLocked = state.rebirthCount < (b.minRebirth || 0);
        const canAfford = state.calories >= cost && !isMaxed && !isHardLocked;
        const isSoftLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;

        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? 'can-afford' : ''} ${(isSoftLocked || isHardLocked) ? 'locked' : ''} ${isMaxed ? 'locked maxed' : ''}`;
        item.dataset.id = b.id;
        item.innerHTML = `
            <div class="shop-item-icon">${isHardLocked ? '🔒' : b.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${isHardLocked ? 'Bloqué' : (isSoftLocked ? '???' : b.name)}</div>
                <div class="shop-item-cost ${canAfford || isMaxed ? '' : 'too-expensive'}">${isHardLocked ? `🔄 Rebirth ${b.minRebirth}` : (isMaxed ? 'MAX' : core.formatNumber(cost) + ' cal')}</div>
            </div>
            <div class="shop-item-count">${isHardLocked ? '0' : b.count} / ${isHardLocked ? '0' : maxBuildings}</div>
        `;
        if (!isSoftLocked && !isHardLocked && !isMaxed) item.addEventListener('click', () => core.buyBuilding(b));
        list.appendChild(item);
    }
}

export function renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    if(!list) return;
    list.innerHTML = '';
    for (const u of data.UPGRADES) {
        if (!core.checkRequirement(u.requirement) && !u.purchased) continue;
        const canAfford = state.calories >= u.cost && !u.purchased;
        const item = document.createElement('div');
        item.className = `upgrade-item ${u.purchased ? 'purchased' : ''} ${!canAfford && !u.purchased ? 'locked' : ''}`;
        item.innerHTML = `
            <div class="upgrade-icon">${u.icon}</div>
            <div class="upgrade-item-info">
                <div class="upgrade-item-name">${u.name}</div>
                ${!u.purchased ? `<div class="upgrade-item-cost ${canAfford ? '' : 'too-expensive'}">${core.formatNumber(u.cost)} cal</div>` : ''}
            </div>
        `;
        if (!u.purchased && canAfford) item.addEventListener('click', () => core.buyUpgrade(u));
        list.appendChild(item);
    }
}

export function renderAscensionShop() {
    const shop = document.getElementById('ascension-shop');
    if (!shop) return;
    shop.innerHTML = '';
    for (const upgrade of data.ASCENSION_UPGRADES) {
        const currentLevel = core.getAscensionUpgradeLevel(upgrade.id);
        const isMaxed = currentLevel >= upgrade.maxLevel;
        const isUnlocked = state.ascensionCount >= upgrade.minAscension;
        const cost = core.getAscensionUpgradeCost(upgrade);
        const canAfford = state.ascensionPoints >= cost;
        
        const card = document.createElement('div');
        card.className = `ascension-card ${isMaxed ? 'maxed' : ''} ${!isUnlocked ? 'locked' : ''} ${!canAfford && !isMaxed ? 'cant-afford' : ''}`;
        card.innerHTML = `
            <div class="ascension-icon">${upgrade.icon}</div>
            <div class="ascension-info">
                <div class="ascension-name">${upgrade.name}</div>
                <div class="ascension-desc">${upgrade.desc}</div>
                <div class="ascension-level">Niveau ${currentLevel}/${upgrade.maxLevel}</div>
            </div>
            <button class="btn ascension-buy-btn" ${isMaxed || !canAfford || !isUnlocked ? 'disabled' : ''}>
                ${isMaxed ? 'MAX' : !isUnlocked ? `Ascension ${upgrade.minAscension}` : `${cost} ✨`}
            </button>
        `;
        if (!isMaxed && isUnlocked && canAfford) {
            card.querySelector('.ascension-buy-btn').addEventListener('click', () => core.buyAscensionUpgrade(upgrade.id));
        }
        shop.appendChild(card);
    }
}

export function renderPetInventory() {
    const slots = document.getElementById('pet-slots');
    if (slots) {
        slots.innerHTML = '';
        for (let i = 0; i < state.maxPetSlots; i++) {
            const card = document.createElement('div');
            if (i < state.equippedPets.length) {
                const pInfo = state.equippedPets[i];
                const pet = data.PETS.find(p => p.id === pInfo.id);
                const fLvl = pInfo.fusionLevel || 0;
                const bonusPct = (pet.mult - 1) * (1 + fLvl * 0.5) * 100;
                const totalSame = state.inventoryPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length + state.equippedPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length;
                const fusionCost = data.FUSION_BASE_COST[pet.rarity] * Math.pow(10, fLvl);
                
                let fuseBtnHtml = fLvl >= 4 
                    ? `<button class="btn-fuse maxed" data-action="fuse-max">✨ MAX ✨</button>`
                    : `<button class="btn-fuse ${totalSame >= 5 && state.calories >= fusionCost ? 'ready' : ''}" data-action="fuse" ${totalSame >= 5 ? '' : 'disabled'}>Fusion (${core.formatNumber(fusionCost)})</button>`;

                let badgeHtml = fLvl > 0 ? `<div class="fusion-badge badge-fusion-${fLvl}">${data.FUSION_NAMES[fLvl]}</div>` : `<div class="pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>`;

                card.className = `pet-card rarity-${pet.rarity} ${fLvl > 0 ? 'pet-fusion-' + fLvl : ''}`;
                card.dataset.uid = pInfo.uid;
                card.innerHTML = `
                    ${badgeHtml}
                    <div class="pet-icon">${pet.icon}</div>
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-mult">+${core.formatNumber(bonusPct)}%</div>
                    <div class="btn-group">
                        ${fuseBtnHtml}
                        <div style="display:flex; gap:0.5rem; width:100%;">
                            <button class="btn-equip" data-action="unequip">Retirer</button>
                            <button class="btn-sell" data-action="sell-equip">Vendre</button>
                        </div>
                    </div>
                `;
            } else {
                card.className = 'pet-card'; card.style.cursor = 'default';
                card.innerHTML = `<div class="pet-icon" style="opacity:0.2;">🐾</div><div class="pet-name" style="opacity:0.5;">Vide</div>`;
            }
            slots.appendChild(card);
        }
        const pc = document.getElementById('pet-count-display');
        if(pc) pc.textContent = `(${state.equippedPets.length}/${state.maxPetSlots})`;
        bindPetEvents(slots);
    }

    const grid = document.getElementById('pet-inventory-grid');
    if (grid) {
        grid.innerHTML = '';
        if(state.isSelectionMode) grid.classList.add('selection-mode-active');
        else grid.classList.remove('selection-mode-active');

        for (const pInfo of state.inventoryPets) {
            const pet = data.PETS.find(p => p.id === pInfo.id);
            const isSel = state.selectedPetsToSell.includes(pInfo.uid);
            const fLvl = pInfo.fusionLevel || 0;
            const bonusPct = (pet.mult - 1) * (1 + fLvl * 0.5) * 100;
            const totalSame = state.inventoryPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length + state.equippedPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length;
            const fusionCost = data.FUSION_BASE_COST[pet.rarity] * Math.pow(10, fLvl);
            
            let fuseBtnHtml = fLvl >= 4 
                ? `<button class="btn-fuse maxed" data-action="fuse-max">✨ MAX ✨</button>`
                : `<button class="btn-fuse ${totalSame >= 5 && state.calories >= fusionCost ? 'ready' : ''}" data-action="fuse" ${totalSame >= 5 ? '' : 'disabled'}>Fusion (${core.formatNumber(fusionCost)})</button>`;
            
            let badgeHtml = fLvl > 0 ? `<div class="fusion-badge badge-fusion-${fLvl}">${data.FUSION_NAMES[fLvl]}</div>` : `<div class="pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>`;
            
            const card = document.createElement('div');
            card.className = `pet-card rarity-${pet.rarity} ${state.isSelectionMode ? 'selectable' : ''} ${isSel ? 'selected-for-sale' : ''} ${fLvl > 0 ? 'pet-fusion-' + fLvl : ''}`;
            card.dataset.uid = pInfo.uid;
            card.innerHTML = `
                <div class="selection-checkbox"></div>
                ${badgeHtml}
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-name">${pet.name}</div>
                <div class="pet-mult">+${core.formatNumber(bonusPct)}%</div>
                <div class="btn-group">
                    ${fuseBtnHtml}
                    <div style="display:flex; gap:0.5rem; width:100%;">
                        <button class="btn-equip" data-action="equip">Équiper</button>
                        <button class="btn-sell" data-action="sell-inv">Vendre</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        }
        const ic = document.getElementById('inventory-count');
        const im = document.getElementById('inventory-max');
        if(ic) ic.textContent = state.inventoryPets.length;
        if(im) im.textContent = core.getMaxInventory();
        bindPetEvents(grid);
    }
}

export function renderEggs() {
    const container = document.getElementById('egg-shop-grid');
    if(!container) return;
    container.innerHTML = '';
    const isInvFull = state.inventoryPets.length >= core.getMaxInventory();

    for (const egg of data.EGGS) {
        const isLocked = state.rebirthCount < egg.minRebirth;
        const canAfford = state.calories >= egg.cost;
        const card = document.createElement('div');
        card.className = `egg-card ${isLocked || isInvFull ? 'locked' : ''} ${canAfford && !isInvFull ? 'can-afford' : ''}`;
        
        let statusText = isLocked ? `<div class="egg-req">Rebirth ${egg.minRebirth}</div>` : (isInvFull ? `<div class="egg-req">Inventaire plein !</div>` : `<div class="egg-cost">${core.formatNumber(egg.cost)} cal</div>`);

        card.innerHTML = `<div class="egg-icon">${egg.icon}</div><div class="egg-name">${egg.name}</div>${statusText}`;
        if (!isLocked && !isInvFull && canAfford) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => core.buyEgg(egg));
        }
        container.appendChild(card);
    }
}

export function renderPetIndex() {
    const container = document.getElementById('pet-index-grid');
    if(!container) return;
    container.innerHTML = '';
    for (const pet of data.PETS) {
        const discovered = state.discoveredPets.includes(pet.id);
        const card = document.createElement('div');
        if (discovered) {
            card.className = `index-card rarity-${pet.rarity}`;
            card.innerHTML = `<div class="index-icon">${pet.icon}</div><div class="egg-name">${pet.name}</div><div class="pet-mult">+${core.formatNumber((pet.mult - 1) * 100)}%</div>`;
        } else {
            card.className = `index-card unknown`;
            card.innerHTML = `<div class="index-icon">❓</div><div class="egg-name">Inconnu</div>`;
        }
        container.appendChild(card);
    }
}

export function renderQuests() {
    const list = document.getElementById('quests-list');
    if (!list) return;
    if (!state.activeQuests || state.activeQuests.length === 0) core.generateQuests();
    list.innerHTML = '';
    
    for (const q of state.activeQuests) {
        const progress = core.getQuestProgress(q);
        const ready = progress >= q.target;
        const item = document.createElement('div');
        item.className = `quest-item ${ready ? 'quest-ready' : ''}`;
        item.innerHTML = `
            <div class="quest-icon">${q.icon}</div>
            <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-desc">${q.desc} <br><small style="color:var(--text-muted)">(${core.formatNumber(progress)} / ${core.formatNumber(q.target)})</small></div>
                <div class="quest-reward">🎁 +${core.formatNumber(q.reward)} cal</div>
            </div>
            ${ready ? '<button class="quest-claim-btn">Réclamer</button>' : ''}
        `;
        if (ready) {
            item.querySelector('.quest-claim-btn').addEventListener('click', () => core.claimQuest(q.uid));
        }
        list.appendChild(item);
    }
}

export function checkQuests() {
    if (!state.activeQuests || state.activeQuests.length === 0) core.generateQuests();
    const hasNew = state.activeQuests.some(q => core.isQuestComplete(q));
    const tab = document.querySelector('[data-tab="quests"]');
    if (tab) tab.innerHTML = hasNew ? '🎯<span class="badge">!</span>' : '🎯';
}

export function checkMilestones() {
    for (const m of data.MILESTONES) {
        if (state.totalCalories >= m.at && !state.milestonesReached.includes(m.at)) {
            state.milestonesReached.push(m.at); showMilestone(m.text);
        }
    }
}

export function showMilestone(text) {
    const banner = document.getElementById('milestone-banner');
    const btext = document.getElementById('milestone-text');
    if(!banner || !btext) return;
    btext.textContent = text;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 4000);
}

export function showQuote(customQuote) {
    const qBox = document.getElementById('aubin-quote');
    if(!qBox) return;
    if (customQuote) { qBox.textContent = customQuote; } 
    else {
        let idx; do { idx = Math.floor(Math.random() * data.QUOTES.length); } while (idx === lastQuoteIndex && data.QUOTES.length > 1);
        lastQuoteIndex = idx; qBox.textContent = data.QUOTES[idx];
    }
    qBox.style.opacity = '0';
    requestAnimationFrame(() => qBox.style.opacity = '1');
}

export function updateRebirthUI() {
    const target = core.getRebirthTarget();
    const ready = core.canRebirth();
    const el = (id) => document.getElementById(id);
    
    if(el('rebirth-count')) el('rebirth-count').textContent = state.rebirthCount;
    if(el('calorie-cap-display')) el('calorie-cap-display').textContent = target === Infinity ? '∞' : core.formatNumber(target);
    if(el('pet-multiplier-display')) el('pet-multiplier-display').textContent = `+${core.formatNumber((core.getPetMultiplier() - 1) * 100)}%`;

    if(el('rebirth-btn')) { el('rebirth-btn').disabled = !ready; el('rebirth-btn').classList.toggle('ready', ready); }
    if(el('rebirth-require')) el('rebirth-require').textContent = ready ? 'Tu peux Rebirth !' : `Atteins ${core.formatNumber(target)} cal pour Rebirth`;

    if(el('calorie-bar')) {
        const pct = Math.min((state.calories / target) * 100, 100);
        el('calorie-bar').style.width = `${pct}%`;
        el('calorie-bar').classList.remove('capped'); 
    }
    if(el('calorie-bar-text')) el('calorie-bar-text').textContent = `${core.formatNumber(state.calories)} / ${core.formatNumber(target)}`;
    
    if (state.rebirthCount >= 10) {
        if (el('ascension-info')) el('ascension-info').style.display = '';
        if (el('ascension-details')) el('ascension-details').style.display = '';
        if (el('ascension-btn')) el('ascension-btn').style.display = '';
        if (el('ascension-require')) el('ascension-require').style.display = '';
        if (el('ascension-tab')) el('ascension-tab').style.display = '';
    }
}

export function updateAscensionUI() {
    const el = (id) => document.getElementById(id);
    if (!el('ascension-count')) return;
    el('ascension-count').textContent = state.ascensionCount;
    if(el('ascension-points')) el('ascension-points').textContent = state.ascensionPoints;
    
    const ready = core.canAscend();
    if(el('ascension-btn')) { el('ascension-btn').disabled = !ready; el('ascension-btn').classList.toggle('ready', ready); }
    if(el('ascension-require')) el('ascension-require').textContent = ready ? 'Tu peux Ascensionner !' : `Atteins ${core.getAscensionCost()} Rebirths`;
}

export function animateClick(e, amount) {
    const el = document.createElement('div');
    el.className = 'float-text'; el.textContent = `+${core.formatNumber(amount)}`;
    let x, y;
    const ct = document.getElementById('click-target');
    if (e && e.clientX) { x = e.clientX + (Math.random() - 0.5) * 60; y = e.clientY - 20 + (Math.random() - 0.5) * 30; } 
    else if(ct) {
        const rect = ct.getBoundingClientRect(); x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80; y = rect.top + (Math.random() - 0.5) * 40;
    } else return;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    const fc = document.getElementById('float-text-container');
    if(fc) { fc.appendChild(el); setTimeout(() => el.remove(), 1000); }
}

export function renderOrbitPuffs() {
    const puff = data.BUILDINGS.find(b => b.id === 'puff');
    let remaining = puff ? puff.count : 0;
    const tiers = [ { value: 10000, src: 'images/puffs/puff_diamant.png' }, { value: 1000, src: 'images/puffs/puff_platine.png' }, { value: 100, src: 'images/puffs/puff_or.png' }, { value: 10, src: 'images/puffs/puff_argent.png' }, { value: 1, src: 'images/puffs/puff_bronze.png' } ];
    
    let puffs = [];
    for (const t of tiers) { const qty = Math.floor(remaining / t.value); for (let i = 0; i < qty; i++) puffs.push(t.src); remaining %= t.value; }
    
    const configString = puffs.join('|');
    if (configString === currentOrbitConfig) return;
    currentOrbitConfig = configString;
    
    const orb = document.getElementById('puff-orbit');
    if(!orb) return; orb.innerHTML = '';
    if (puffs.length === 0) return;
    
    const maxPuffs = puffs.length; const radius = 130; 
    for (let i = 0; i < maxPuffs; i++) {
        const angle = (360 / maxPuffs) * i; const rad = (angle * Math.PI) / 180;
        const x = 50 + (radius / 260) * 100 * Math.cos(rad); const y = 50 + (radius / 260) * 100 * Math.sin(rad);
        const pEl = document.createElement('div'); pEl.className = 'orbit-puff';
        const img = document.createElement('img'); img.src = puffs[i]; img.draggable = false; pEl.appendChild(img);
        pEl.style.left = `${x}%`; pEl.style.top = `${y}%`; pEl.style.transform = `translate(-50%, -50%) rotate(${angle - 90}deg)`; pEl.style.animationDelay = `${(i * 0.3) % 2}s`;
        orb.appendChild(pEl);
    }
}

export function spawnBackgroundParticle() {
    const p = document.getElementById('particles');
    if(!p) return;
    const el = document.createElement('div'); el.className = 'particle';
    el.textContent = data.FOOD_EMOJIS[Math.floor(Math.random() * data.FOOD_EMOJIS.length)];
    el.style.left = `${Math.random() * 100}%`; el.style.animationDuration = `${5 + Math.random() * 8}s`; el.style.animationDelay = `${Math.random() * 2}s`; el.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    p.appendChild(el); setTimeout(() => el.remove(), 15000);
}

export function getAubinBaseSrc() { return data.AUBIN_IMAGES[state.rebirthCount % data.AUBIN_CYCLE]; }
export function updateAubinAppearance() {
    const cycleNum = Math.floor(state.rebirthCount / data.AUBIN_CYCLE); 
    const imgEl = document.getElementById('aubin-img'); if (imgEl) imgEl.src = getAubinBaseSrc();
    const auraEl = document.getElementById('aubin-aura');
    if (auraEl) { auraEl.className = ''; if (cycleNum >= 1) auraEl.classList.add(`aura-${Math.min(cycleNum, 4)}`); }
}

export function renderAll() {
    updateDisplay();
    renderBuildings();
    renderUpgrades();
    renderOrbitPuffs();
    renderPetInventory();
    renderEggs();
    renderPetIndex();
    renderQuests();
    renderAscensionShop();
    updateRebirthUI();
    updateAscensionUI();
    updateAubinAppearance();
}