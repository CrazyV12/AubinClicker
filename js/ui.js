import { state } from './state.js';
import * as data from './data.js';
import * as core from './core.js';

let lastQuoteIndex = -1;
let currentOrbitConfig = '';

let currentModalEgg = null;
let currentModalIsDiamond = false;

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

export function applyUniverseTheme() {
    const u = core.getCurrentUniverse();
    document.body.className = u.theme;
    const nameEl = document.getElementById('universe-name');
    if (nameEl) nameEl.textContent = u.name;
}

export function updateDiamondUI() {
    const dc = document.getElementById('diamond-count');
    const dp = document.getElementById('diamond-progress');
    const dt = document.getElementById('diamond-timer');
    
    const u = core.getCurrentUniverse();
    const classBonusLvl = state.diamondUpgradesPurchased['diamond_class'] || 0;
    const rate = Math.floor(u.diamondRate * Math.pow(2, classBonusLvl));

    if (dc) {
        dc.innerHTML = `${core.formatNumber(state.diamonds)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-left: 5px;">(+${core.formatNumber(rate)}/min)</span>`;
    }
    
    if (dp || dt) {
        const effectiveTick = 60; 
        
        if (dp) {
            const pct = (state.diamondProgress / effectiveTick) * 100;
            dp.style.width = `${Math.min(pct, 100)}%`;
        }
        
        if (dt) {
            const remainingSeconds = Math.max(0, effectiveTick - state.diamondProgress);
            const m = Math.floor(remainingSeconds / 60);
            const s = Math.floor(remainingSeconds % 60);
            dt.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }
}

export function renderDiamondShop() {
    const upList = document.getElementById('diamond-upgrades-list');
    if (upList) {
        upList.innerHTML = '';
        for (const u of data.DIAMOND_UPGRADES) {
            const currentLevel = state.diamondUpgradesPurchased[u.id] || 0;
            const isMaxed = currentLevel >= u.maxLevel;
            const cost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLevel));
            const canAfford = state.diamonds >= cost;
            
            const card = document.createElement('div');
            card.className = `ascension-card ${isMaxed ? 'maxed' : ''} ${!canAfford && !isMaxed ? 'cant-afford' : ''}`;
            card.dataset.id = u.id;
            card.innerHTML = `
                <div class="ascension-icon">${u.icon}</div>
                <div class="ascension-info">
                    <div class="ascension-name" style="color:#00d2ff">${u.name}</div>
                    <div class="ascension-desc">${u.desc}</div>
                    <div class="ascension-level">Niv. ${currentLevel}/${u.maxLevel}</div>
                </div>
                <button class="btn ascension-buy-btn" style="border-color:#00d2ff" ${isMaxed || !canAfford ? 'disabled' : ''}>
                    ${isMaxed ? 'MAX' : `${core.formatNumber(cost)} 💎`}
                </button>
            `;
            
            card.querySelector('.ascension-buy-btn').addEventListener('click', () => core.buyDiamondUpgrade(u.id));
            upList.appendChild(card);
        }
    }

    const eggSection = document.getElementById('diamond-eggs-section');
    if (eggSection) {
        eggSection.innerHTML = '';
        const maxInv = core.getMaxInventory();
        const isInvFull = state.inventoryPets.length >= maxInv;

        const eggList = document.createElement('div');
        eggList.id = 'diamond-eggs-list';
        eggList.className = 'egg-grid';
        eggSection.appendChild(eggList);

        for (const egg of data.DIAMOND_EGGS) {
            const totalCost = egg.cost; 
            const canAfford = state.diamonds >= totalCost;
            const card = document.createElement('div');
            card.className = `egg-card ${isInvFull || !canAfford ? 'locked' : 'can-afford'}`;
            card.dataset.id = egg.id;

            let statusHtml = '';
            if (isInvFull) statusHtml = `<span class="egg-req">Inventaire plein !</span>`;
            else if (!canAfford) statusHtml = `<span class="egg-req">${core.formatNumber(totalCost)} 💎</span>`;
            else {
                statusHtml = `<span class="egg-cost" style="color:#00d2ff">${core.formatNumber(totalCost)} 💎</span>`;
            }

            card.innerHTML = `<div class="egg-icon">${egg.icon}</div><div class="egg-name">${egg.name}</div><div class="egg-status-text">${statusHtml}</div>`;
            card.addEventListener('click', () => showEggModal(egg, true));
            eggList.appendChild(card);
        }
    }
}

export function renderSettings() {
    const controls = document.getElementById('auto-sell-controls');
    const lockedMsg = document.getElementById('auto-sell-locked-msg');
    if (!controls) return;

    const isUnlocked = state.diamondUpgradesPurchased['auto_sell'] > 0;
    if (lockedMsg) lockedMsg.style.display = isUnlocked ? 'none' : 'block';
    controls.style.opacity = isUnlocked ? '1' : '0.4';
    controls.style.pointerEvents = isUnlocked ? 'auto' : 'none';

    controls.innerHTML = '';
    const rarities = [
        { id: 'common', name: 'Commun', color: '#a0a0b0' },
        { id: 'rare', name: 'Rare', color: '#38bdf8' },
        { id: 'epic', name: 'Épique', color: '#a855f7' },
        { id: 'legendary', name: 'Légend.', color: '#ffc947' },
        { id: 'mythic', name: 'Mythique', color: '#ec4899' }
    ];

    rarities.forEach(r => {
        const isChecked = state.autoSellConfig[r.id];
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '5px';
        label.style.cursor = 'pointer';
        label.style.background = 'rgba(255,255,255,0.05)';
        label.style.padding = '6px 12px';
        label.style.borderRadius = '8px';
        label.style.border = `1px solid ${r.color}`;
        
        label.innerHTML = `
            <input type="checkbox" data-rarity="${r.id}" ${isChecked ? 'checked' : ''}>
            <span style="color: ${r.color}; font-weight: bold; font-size: 0.8rem;">${r.name}</span>
        `;
        
        label.querySelector('input').addEventListener('change', (e) => {
            state.autoSellConfig[r.id] = e.target.checked;
            core.saveGame();
        });
        
        controls.appendChild(label);
    });
}

function updateDiamondShopLive() {
    const uList = document.getElementById('diamond-upgrades-list');
    if (uList) {
        uList.querySelectorAll('.ascension-card').forEach(card => {
            const uId = card.dataset.id;
            const u = data.DIAMOND_UPGRADES.find(x => x.id === uId);
            if (u) {
                const currentLevel = state.diamondUpgradesPurchased[u.id] || 0;
                const isMaxed = currentLevel >= u.maxLevel;
                const cost = Math.floor(u.baseCost * Math.pow(u.costMult, currentLevel));
                const canAfford = state.diamonds >= cost;
                
                const btn = card.querySelector('.ascension-buy-btn');
                if (isMaxed) {
                    card.classList.add('maxed');
                    card.classList.remove('cant-afford');
                    if (btn) { btn.disabled = true; btn.textContent = 'MAX'; }
                } else {
                    card.classList.remove('maxed');
                    if (canAfford) {
                        card.classList.remove('cant-afford');
                        if (btn) { btn.disabled = false; btn.innerHTML = `${core.formatNumber(cost)} 💎`; }
                    } else {
                        card.classList.add('cant-afford');
                        if (btn) { btn.disabled = true; btn.innerHTML = `${core.formatNumber(cost)} 💎`; }
                    }
                }
            }
        });
    }

    const eggList = document.getElementById('diamond-eggs-list');
    if (eggList) {
        const maxInv = core.getMaxInventory();
        const isInvFull = state.inventoryPets.length >= maxInv;

        eggList.querySelectorAll('.egg-card').forEach(card => {
            const eggId = card.dataset.id;
            const egg = data.DIAMOND_EGGS.find(x => x.id === eggId);
            if (egg) {
                const totalCost = egg.cost; 
                const canAfford = state.diamonds >= totalCost;
                
                card.className = `egg-card ${isInvFull || !canAfford ? 'locked' : 'can-afford'}`;
                
                const statusEl = card.querySelector('.egg-status-text');
                if (statusEl) {
                    if (isInvFull) {
                        statusEl.innerHTML = `<span class="egg-req">Inventaire plein !</span>`;
                    } else if (!canAfford) {
                        statusEl.innerHTML = `<span class="egg-req">${core.formatNumber(totalCost)} 💎</span>`;
                    } else {
                        statusEl.innerHTML = `<span class="egg-cost" style="color:#00d2ff">${core.formatNumber(totalCost)} 💎</span>`;
                    }
                }
            }
        });
    }
}

// NOUVEAU : Fonction pour mettre à jour l'indicateur Auto-Roll flottant
export function updateAutoRollUI() {
    const indicator = document.getElementById('autoroll-indicator');
    const nameEl = document.getElementById('autoroll-indicator-name');
    if (!indicator || !nameEl) return;

    if (state.autoRollActive && state.autoRollEggId) {
        let egg = data.EGGS.find(e => e.id === state.autoRollEggId) || data.DIAMOND_EGGS.find(e => e.id === state.autoRollEggId);
        if (egg) {
            nameEl.textContent = `${egg.icon} ${egg.name}`;
            indicator.style.display = 'flex'; // On l'affiche
        } else {
            indicator.style.display = 'none';
        }
    } else {
        indicator.style.display = 'none'; // On le cache
    }
}

export function updateDisplay() {
    const el = (id) => document.getElementById(id);
    if(el('calorie-count')) el('calorie-count').textContent = core.formatNumber(state.calories);
    if(el('total-calories')) el('total-calories').textContent = core.formatNumber(state.totalCalories);
    if(el('cal-per-second')) el('cal-per-second').textContent = core.formatNumber(state.cps);
    if(el('cal-per-click')) el('cal-per-click').textContent = core.formatNumber(state.clickPower);
    if(el('total-clicks')) el('total-clicks').textContent = core.formatNumber(state.totalClicks);
    document.title = `${core.formatNumber(state.calories)} Calories - AubinClicker`;

    if(el('stat-time')) el('stat-time').textContent = core.formatTime(state.stats.timePlayed);
    if(el('stat-fusions')) el('stat-fusions').textContent = core.formatNumber(state.stats.petsFused);
    if(el('stat-eggs')) el('stat-eggs').textContent = core.formatNumber(state.stats.eggsOpened);
    if(el('stat-sold')) el('stat-sold').textContent = core.formatNumber(state.stats.petsSold);

    const bList = el('buildings-list');
    if(bList) {
        bList.querySelectorAll('.shop-row').forEach(row => {
            const b = data.BUILDINGS.find(x => x.id === row.dataset.id);
            if (!b) return;
            
            const item = row.querySelector('.shop-item');
            const maxBtn = row.querySelector('.btn-buy-max');

            const maxBuildings = core.getMaxBuildings(b);
            const isLockedByRebirth = state.rebirthCount < (b.minRebirth || 0);
            const isLockedByAscension = b.reqAscension ? core.getAscensionUpgradeLevel(b.reqAscension) === 0 : false;
            const isHardLocked = isLockedByRebirth || isLockedByAscension;
            const isMaxed = b.count >= maxBuildings;
            const cost = core.getBuildingCost(b);
            
            const canAfford = state.calories >= cost && !isMaxed && !isHardLocked;
            const isSoftLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;
            
            const maxStr = maxBuildings === Infinity ? '∞' : maxBuildings;

            if (item) {
                item.className = `shop-item ${canAfford ? 'can-afford' : ''} ${(isSoftLocked || isHardLocked) ? 'locked' : ''} ${isMaxed ? 'locked maxed' : ''}`;
                
                const nameEl = item.querySelector('.shop-item-name');
                if (nameEl) {
                    let cpsValue = core.getBuildingCps(b);
                    let cpsHtml = (isHardLocked || isSoftLocked) ? '' : `<span class="hover-cps">+${core.formatNumber(cpsValue)} cal/s</span>`;
                    nameEl.innerHTML = `${isHardLocked ? 'Bâtiment bloqué' : (isSoftLocked ? '???' : b.name)}${cpsHtml}`;
                }

                const costEl = item.querySelector('.shop-item-cost');
                if (costEl) {
                    if (isLockedByAscension) { costEl.textContent = '✨ Ascension requise'; costEl.classList.remove('too-expensive'); }
                    else if (isHardLocked) { costEl.textContent = `🔄 Rebirth ${b.minRebirth} requis`; costEl.classList.remove('too-expensive'); }
                    else if (isMaxed) { costEl.textContent = 'MAX'; costEl.classList.remove('too-expensive'); }
                    else { costEl.textContent = `${core.formatNumber(cost)} cal`; costEl.classList.toggle('too-expensive', !canAfford); }
                }
                const countEl = item.querySelector('.shop-item-count');
                if (countEl) countEl.textContent = isHardLocked ? '0' : `${b.count} / ${maxStr}`;
            }

            if (maxBtn) {
                if (isMaxed || isHardLocked || isSoftLocked) {
                    maxBtn.style.display = 'none';
                } else {
                    maxBtn.style.display = 'flex'; 
                    if (canAfford) {
                        maxBtn.classList.add('max-ready');
                        maxBtn.style.opacity = '1';
                        maxBtn.style.pointerEvents = 'auto';
                    } else {
                        maxBtn.classList.remove('max-ready');
                        maxBtn.style.opacity = '0.4';
                        maxBtn.style.pointerEvents = 'none';
                    }
                }
            }
        });
    }

    const uList = el('upgrades-list');
    if(uList) {
        const visibleCount = data.UPGRADES.filter(u => core.checkRequirement(u.requirement) || u.purchased).length;
        const renderedCount = uList.querySelectorAll('.upgrade-item').length;
        if (visibleCount !== renderedCount) {
            renderUpgrades(); 
        } else {
            uList.querySelectorAll('.upgrade-item').forEach(item => {
                const u = data.UPGRADES.find(x => x.id === item.dataset.id);
                if (!u) return;
                
                const cost = core.getUpgradeCost(u); 
                
                const canAfford = state.calories >= cost && !u.purchased;
                const isUnlocked = core.checkRequirement(u.requirement);
                const isLockedUI = !u.purchased && (!canAfford || !isUnlocked);
                item.className = `upgrade-item ${u.purchased ? 'purchased' : ''} ${isLockedUI ? 'locked' : ''}`;
                const costEl = item.querySelector('.upgrade-item-cost');
                if (costEl && !u.purchased) costEl.className = `upgrade-item-cost ${canAfford ? '' : 'too-expensive'}`;
            });
        }
    }

    ['egg-shop-grid'].forEach(gridId => {
        const grid = el(gridId);
        if (!grid) return;
        const isDiamond = false;
        const maxInv = core.getMaxInventory();
        const isInvFull = state.inventoryPets.length >= maxInv;

        grid.querySelectorAll('.egg-card').forEach(card => {
            const eggId = card.dataset.id;
            const egg = data.EGGS.find(x => x.id === eggId);
            if (!egg) return;

            const isLocked = state.rebirthCount < egg.minRebirth;
            const totalCost = egg.cost;
            const canAfford = state.calories >= totalCost;

            card.className = `egg-card ${isLocked || isInvFull ? 'locked' : ''} ${canAfford && !isInvFull && !isLocked ? 'can-afford' : ''}`;

            const statusEl = card.querySelector('.egg-status-text');
            if (statusEl) {
                let html = '';
                if (isLocked)      html = `<span class="egg-req">🔒 Rebirth ${egg.minRebirth}</span>`;
                else if (isInvFull) html = `<span class="egg-req">Inventaire plein !</span>`;
                else if (!canAfford) html = `<span class="egg-req">${core.formatNumber(totalCost)} cal</span>`;
                else html = `<span class="egg-cost">${core.formatNumber(totalCost)} cal</span>`;
                statusEl.innerHTML = html;
            }
        });
    });

    const qList = el('quests-list');
    if (qList) {
        qList.querySelectorAll('.quest-item').forEach((item, index) => {
            const q = state.activeQuests[index];
            if (!q) return;
            const progress = core.getQuestProgress(q);
            const ready = progress >= q.target;
            
            item.className = `quest-item ${ready ? 'quest-ready' : ''}`;
            const descEl = item.querySelector('.quest-desc small');
            if(descEl) descEl.textContent = `(${core.formatNumber(progress)} / ${core.formatNumber(q.target)})`;
            
            let btn = item.querySelector('.quest-claim-btn');
            if (ready && !btn) {
                btn = document.createElement('button');
                btn.className = 'quest-claim-btn';
                btn.textContent = 'Réclamer';
                btn.addEventListener('click', () => core.claimQuest(q.uid));
                item.appendChild(btn);
            } else if (!ready && btn) {
                btn.remove();
            }
        });
    }

    updateDiamondShopLive();
    updateAutoRollUI(); // On met à jour l'indicateur à chaque frame
}

export function renderBuildings() {
    const list = document.getElementById('buildings-list');
    if(!list) return;
    list.innerHTML = '';
    
    for (const b of data.BUILDINGS) {
        const maxBuildings = core.getMaxBuildings(b);
        const cost = core.getBuildingCost(b);
        const isMaxed = b.count >= maxBuildings;
        
        const isLockedByRebirth = state.rebirthCount < (b.minRebirth || 0);
        const isLockedByAscension = b.reqAscension ? core.getAscensionUpgradeLevel(b.reqAscension) === 0 : false;
        const isHardLocked = isLockedByRebirth || isLockedByAscension;
        
        const canAfford = state.calories >= cost && !isMaxed && !isHardLocked;
        const isSoftLocked = state.totalCalories < b.baseCost * 0.5 && b.count === 0;

        const maxStr = maxBuildings === Infinity ? '∞' : maxBuildings;

        const row = document.createElement('div');
        row.className = 'shop-row';
        row.dataset.id = b.id;

        const maxBtn = document.createElement('button');
        maxBtn.className = `btn-buy-max ${canAfford ? 'max-ready' : ''}`;
        maxBtn.textContent = 'MAX';
        if (isHardLocked || isSoftLocked || isMaxed) maxBtn.style.display = 'none';
        
        maxBtn.addEventListener('click', () => core.buyMaxBuilding(b));
        row.appendChild(maxBtn); 

        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? 'can-afford' : ''} ${(isSoftLocked || isHardLocked) ? 'locked' : ''} ${isMaxed ? 'locked maxed' : ''}`;
        
        let costText = '';
        if (isLockedByAscension) costText = '✨ Ascension requise';
        else if (isLockedByRebirth) costText = `🔄 Rebirth ${b.minRebirth} requis`;
        else if (isMaxed) costText = 'MAX';
        else costText = `${core.formatNumber(cost)} cal`;

        let cpsValue = core.getBuildingCps(b);
        let cpsHtml = (isHardLocked || isSoftLocked) ? '' : `<span class="hover-cps">+${core.formatNumber(cpsValue)} cal/s</span>`;

        item.innerHTML = `
            <div class="shop-item-icon">${isHardLocked ? '🔒' : b.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${isHardLocked ? 'Bâtiment bloqué' : (isSoftLocked ? '???' : b.name)}${cpsHtml}</div>
                <div class="shop-item-cost ${canAfford || isMaxed ? '' : 'too-expensive'}">${costText}</div>
            </div>
            <div class="shop-item-count" style="min-width: 45px; text-align: right;">
                ${isHardLocked ? '0' : b.count} / ${isHardLocked ? '0' : maxStr}
            </div>
        `;
        
        item.addEventListener('click', () => core.buyBuilding(b));
        row.appendChild(item); 

        list.appendChild(row);
    }
}

export function renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    if(!list) return;
    list.innerHTML = '';
    
    for (const u of data.UPGRADES) {
        const isUnlocked = core.checkRequirement(u.requirement);
        if (!isUnlocked && !u.purchased) continue; 

        const cost = core.getUpgradeCost(u); 
        const canAfford = state.calories >= cost && !u.purchased;

        const item = document.createElement('div');
        const isLockedUI = !u.purchased && (!canAfford || !isUnlocked);
        item.className = `upgrade-item ${u.purchased ? 'purchased' : ''} ${isLockedUI ? 'locked' : ''}`;
        item.dataset.id = u.id;

        let descHtml = `<div class="upgrade-item-desc">${u.desc}</div>`;
        let costHtml = u.purchased ? '' : `<div class="upgrade-item-cost ${canAfford ? '' : 'too-expensive'}">${core.formatNumber(cost)} cal</div>`;

        item.innerHTML = `
            <div class="upgrade-icon">${u.icon}</div>
            <div class="upgrade-item-info">
                <div class="upgrade-item-name">${u.name}</div>
                ${descHtml}
                ${costHtml}
            </div>
        `;
        
        item.addEventListener('click', () => core.buyUpgrade(u));
        
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
        
        card.querySelector('.ascension-buy-btn').addEventListener('click', () => core.buyAscensionUpgrade(upgrade.id));
        
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
                const bonusPct = (pet.mult - 1) * (1 + fLvl * 0.2) * 100;
                const totalSame = state.inventoryPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length + state.equippedPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length;
                const fusionCost = data.FUSION_BASE_COST[pet.rarity] * Math.pow(10, fLvl);
                
                let fuseBtnHtml = fLvl >= 4 
                    ? `<button class="btn-fuse maxed" data-action="fuse-max" style="width:100%; margin:0;">✨ MAX ✨</button>`
                    : `<button class="btn-fuse ${totalSame >= 5 && state.calories >= fusionCost ? 'ready' : ''}" data-action="fuse" style="width:100%; margin:0;" ${totalSame >= 5 ? '' : 'disabled'}>Fusion (${core.formatNumber(fusionCost)})</button>`;

                let badgeHtml = fLvl > 0 ? `<div class="fusion-badge badge-fusion-${fLvl}">${data.FUSION_NAMES[fLvl]}</div>` : `<div class="pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>`;

                card.className = `pet-card rarity-${pet.rarity} ${fLvl > 0 ? 'pet-fusion-' + fLvl : ''}`;
                card.dataset.uid = pInfo.uid;
                card.innerHTML = `
                    ${badgeHtml}
                    <div class="pet-icon">${pet.icon}</div>
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-mult">+${core.formatNumber(bonusPct)}%</div>
                    
                    <div class="btn-group" style="display:flex; flex-direction:column; gap:4px; width:100%; box-sizing:border-box; padding:4px;">
                        ${fuseBtnHtml}
                        <button class="btn-equip" data-action="unequip" style="width:100%; margin:0;">Retirer</button>
                        <button class="btn-sell" data-action="sell-equip" style="width:100%; margin:0;">Vendre</button>
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

        const visiblePets = state.inventoryPets.filter(p => !p.isHatching);

        for (const pInfo of visiblePets) {
            const pet = data.PETS.find(p => p.id === pInfo.id);
            const isSel = state.selectedPetsToSell.includes(pInfo.uid);
            const fLvl = pInfo.fusionLevel || 0;
            const bonusPct = (pet.mult - 1) * (1 + fLvl * 0.2) * 100;
            const totalSame = state.inventoryPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length + state.equippedPets.filter(p=>p.id===pInfo.id && (p.fusionLevel||0)===fLvl).length;
            const fusionCost = data.FUSION_BASE_COST[pet.rarity] * Math.pow(10, fLvl);
            
            let fuseBtnHtml = fLvl >= 4 
                ? `<button class="btn-fuse maxed" data-action="fuse-max" style="width:100%; margin:0;">✨ MAX ✨</button>`
                : `<button class="btn-fuse ${totalSame >= 5 && state.calories >= fusionCost ? 'ready' : ''}" data-action="fuse" style="width:100%; margin:0;" ${totalSame >= 5 ? '' : 'disabled'}>Fusion (${core.formatNumber(fusionCost)})</button>`;
            
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
                
                <div class="btn-group" style="display:flex; flex-direction:column; gap:4px; width:100%; box-sizing:border-box; padding:4px;">
                    ${fuseBtnHtml}
                    <button class="btn-equip" data-action="equip" style="width:100%; margin:0;">Équiper</button>
                    <button class="btn-sell" data-action="sell-inv" style="width:100%; margin:0;">Vendre</button>
                </div>
            `;
            grid.appendChild(card);
        }
        const ic = document.getElementById('inventory-count');
        const im = document.getElementById('inventory-max');
        if(ic) ic.textContent = visiblePets.length; 
        if(im) im.textContent = core.getMaxInventory();
        bindPetEvents(grid);
    }
}

export function renderEggs() {
    const section = document.getElementById('egg-shop-section');
    if (!section) return;
    section.innerHTML = '';

    const isInvFull = state.inventoryPets.length >= core.getMaxInventory();

    const grid = document.createElement('div');
    grid.id = 'egg-shop-grid';
    grid.className = 'egg-grid';
    section.appendChild(grid);

    for (const egg of data.EGGS) {
        const isLocked = state.rebirthCount < egg.minRebirth;
        const totalCost = egg.cost; 
        const canAfford = state.calories >= totalCost;

        const card = document.createElement('div');
        card.className = `egg-card ${isLocked || isInvFull ? 'locked' : ''} ${canAfford && !isInvFull && !isLocked ? 'can-afford' : ''}`;
        card.dataset.id = egg.id;

        let statusHtml = '';
        if (isLocked) statusHtml = `<span class="egg-req">🔒 Rebirth ${egg.minRebirth}</span>`;
        else if (isInvFull) statusHtml = `<span class="egg-req">Inventaire plein !</span>`;
        else if (!canAfford) statusHtml = `<span class="egg-req">${core.formatNumber(totalCost)} cal</span>`;
        else {
            statusHtml = `<span class="egg-cost">${core.formatNumber(totalCost)} cal</span>`;
        }

        card.innerHTML = `<div class="egg-icon">${egg.icon}</div><div class="egg-name">${egg.name}</div><div class="egg-status-text">${statusHtml}</div>`;

        card.addEventListener('click', () => showEggModal(egg, false));
        
        grid.appendChild(card);
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
    
    // CORRECTION DU BUG : On force le masquage quand on retombe à 0 Rebirth
    const showRebirthTabs = state.rebirthCount >= 1;
    ['eggs-tab', 'inventory-tab', 'index-tab', 'codes-tab', 'pet-inventory', 'diamonds-tab'].forEach(id => {
        const element = document.getElementById(id);
        if(element) element.style.display = showRebirthTabs ? '' : 'none';
    });

    const showAscension = state.rebirthCount >= 10;
    ['ascension-info', 'ascension-details', 'ascension-btn', 'ascension-require', 'ascension-tab'].forEach(id => {
        const aEl = document.getElementById(id);
        if(aEl) aEl.style.display = showAscension ? '' : 'none';
    });
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
    const emojis = core.getCurrentUniverse().emojis;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 100}%`; el.style.animationDuration = `${5 + Math.random() * 8}s`; el.style.animationDelay = `${Math.random() * 2}s`; el.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    p.appendChild(el); setTimeout(() => el.remove(), 15000);
}

export function getAubinBaseSrc() { return data.AUBIN_IMAGES[state.rebirthCount % data.AUBIN_CYCLE]; }

export function updateAubinAppearance() {
    const imgEl = document.getElementById('aubin-img'); 
    if (imgEl) imgEl.src = getAubinBaseSrc();
    
    const auraEl = document.getElementById('aubin-aura');
    if (auraEl) { 
        auraEl.className = ''; 
        const classLevel = state.diamondUpgradesPurchased['diamond_class'] || 0;
        if (classLevel >= 1) {
            const auraLevel = Math.min(classLevel, 10);
            auraEl.classList.add(`aura-${auraLevel}`); 
        }
    }
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
    renderDiamondShop();
    updateDiamondUI();
    updateRebirthUI();
    updateAscensionUI();
    updateAubinAppearance();
    renderSettings();
}

// ============ MODALE DES OEUFS (DETAILS ET ACHAT) ============

function getOrCreateEggModal() {
    let modal = document.getElementById('egg-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'egg-detail-modal';
        modal.className = 'hidden';
        modal.innerHTML = `
            <div class="egg-modal-overlay"></div>
            <div class="glass-panel egg-modal-content">
                <button class="egg-modal-close" id="em-close-btn">×</button>
                <div class="egg-modal-header">
                    <div class="em-icon" id="em-icon"></div>
                    <div class="em-name" id="em-name"></div>
                </div>
                <div class="em-section-title">Probabilités des pets :</div>
                <div id="em-pool" class="index-grid"></div>
                <div id="em-controls" style="margin-top: 10px;"></div>
                <div id="em-autoroll-container"></div>
                <button id="em-buy-btn" class="btn-buy-max max-ready" style="width:100%; height: 50px; font-size: 1.1rem; margin-top:5px; border-radius: 12px;">Acheter</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.egg-modal-overlay').addEventListener('click', closeEggModal);
        modal.querySelector('#em-close-btn').addEventListener('click', closeEggModal);
    }
    return modal;
}

export function closeEggModal() {
    const modal = document.getElementById('egg-detail-modal');
    if (modal) modal.classList.add('hidden');
    currentModalEgg = null;
}

export function showEggModal(egg, isDiamond) {
    currentModalEgg = egg;
    currentModalIsDiamond = isDiamond;
    const modal = getOrCreateEggModal();
    
    document.getElementById('em-icon').textContent = egg.icon;
    document.getElementById('em-name').textContent = egg.name;
    
    const poolEl = document.getElementById('em-pool');
    poolEl.innerHTML = '';
    
    const totalWeight = egg.pool.reduce((sum, p) => sum + p.weight, 0);
    const sortedPool = [...egg.pool].sort((a,b) => b.weight - a.weight);
    
    sortedPool.forEach(pItem => {
        const pData = data.PETS.find(x => x.id === pItem.id);
        const isDiscovered = state.discoveredPets.includes(pItem.id);
        const pct = (pItem.weight / totalWeight * 100).toFixed(1);
        
        const card = document.createElement('div');
        card.className = `index-card rarity-${pData.rarity}`;
        card.style.position = 'relative';
        
        const pctHtml = `<div style="position:absolute; top:-6px; right:-6px; background:var(--glass-bg); padding:2px 5px; border-radius:6px; font-size:0.6rem; border:1px solid var(--glass-border); font-weight:bold; backdrop-filter:blur(4px); box-shadow: 0 2px 5px rgba(0,0,0,0.5);">${pct}%</div>`;
        
        if (isDiscovered) {
            card.innerHTML = `${pctHtml}<div class="index-icon">${pData.icon}</div><div class="egg-name">${pData.name}</div>`;
        } else {
            card.innerHTML = `${pctHtml}<div class="index-icon" style="filter:brightness(0); opacity:0.6;">❓</div><div class="egg-name" style="opacity:0.8;">Inconnu</div>`;
        }
        poolEl.appendChild(card);
    });
    
    updateEggModalControls();
    modal.classList.remove('hidden');
}

function buildQtySelectorDOM(qty, maxBatch, onMinus, onPlus) {
    const bar = document.createElement('div');
    bar.className = 'egg-qty-bar glass-panel-inner';
    bar.style.marginBottom = '0'; 

    const discount = core.getEggBulkDiscount(qty);
    const discountPct = Math.round((1 - discount) * 100);
    const discTag = qty > 1 ? `<span class="qty-discount-tag">−${discountPct}% / œuf</span>` : '';

    bar.innerHTML = `
        <span class="qty-label">Acheter :</span>
        <div class="qty-stepper">
            <button class="qty-btn" id="modal-qty-minus">&#8722;</button>
            <span class="qty-num">${qty}</span>
            <button class="qty-btn" id="modal-qty-plus">+</button>
            <span class="qty-max">/ ${maxBatch}</span>
        </div>
        ${discTag}
    `;
    
    bar.querySelector('#modal-qty-minus').onclick = onMinus;
    bar.querySelector('#modal-qty-plus').onclick = onPlus;
    
    return bar;
}

export function updateEggModalControls() {
    if (!currentModalEgg) return;
    const controlsEl = document.getElementById('em-controls');
    const buyBtn = document.getElementById('em-buy-btn');
    
    const egg = currentModalEgg;
    const isDiamond = currentModalIsDiamond;
    
    const maxBatch = core.getEggBatchSize();
    state.eggQtySelected = Math.max(1, Math.min(state.eggQtySelected, maxBatch));
    const qty = state.eggQtySelected;
    
    controlsEl.innerHTML = '';
    if (maxBatch > 1) {
        const stepper = buildQtySelectorDOM(
            qty, 
            maxBatch, 
            () => core.setEggQty(qty - 1),
            () => core.setEggQty(qty + 1)
        );
        controlsEl.appendChild(stepper);
    }
    
    const maxInv = core.getMaxInventory();
    const spaceLeft = maxInv - state.inventoryPets.length;
    
    const autoRollContainer = document.getElementById('em-autoroll-container');
    if (autoRollContainer) {
        if (state.diamondUpgradesPurchased['auto_roll'] > 0) {
            const isActive = state.autoRollActive && state.autoRollEggId === egg.id;
            
            autoRollContainer.innerHTML = `
                <div style="margin-top:10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top:15px; width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.9rem; font-weight:bold; color:var(--accent-secondary);">🎰 Auto-Roll</span>
                        <button id="em-autoroll-btn" class="btn" style="padding: 5px 15px; font-size: 0.8rem; color: #fff; background: ${isActive ? 'var(--danger)' : 'var(--success)'}; border:none;">
                            ${isActive ? 'Désactiver' : 'Activer'}
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('em-autoroll-btn').onclick = () => {
                if (isActive) {
                    state.autoRollActive = false;
                    state.autoRollEggId = null;
                } else {
                    if (spaceLeft <= 0) {
                        showQuote("Tu n'as pas de place pour lancer l'Auto-Roll !");
                        return;
                    }
                    state.autoRollActive = true;
                    state.autoRollEggId = egg.id;
                    let safeQty = Math.min(qty, spaceLeft);
                    showQuote(`🎰 Auto-Roll activé ! (Quantité : x${safeQty})`);
                }
                updateEggModalControls(); 
                updateAutoRollUI(); // Actualise aussi l'interface flottante
            };
        } else {
            autoRollContainer.innerHTML = '';
        }
    }

    let actualQty = Math.min(qty, spaceLeft);
    if (actualQty < 0) actualQty = 0;

    const totalCost = core.getEggTotalCost(egg, actualQty, isDiamond);
    const canAfford = isDiamond ? state.diamonds >= totalCost : state.calories >= totalCost;
    
    if (spaceLeft <= 0) {
        buyBtn.textContent = "Inventaire Plein !";
        buyBtn.className = "btn-buy-max";
        buyBtn.style.opacity = "0.5";
        buyBtn.disabled = true;
    } else if (!canAfford) {
        buyBtn.innerHTML = `Trop cher <span style="font-size:0.8em; margin-left:5px;">(${core.formatNumber(totalCost)} ${isDiamond ? '💎' : 'cal'})</span>`;
        buyBtn.className = "btn-buy-max";
        buyBtn.style.opacity = "0.5";
        buyBtn.disabled = true;
    } else {
        buyBtn.innerHTML = `Acheter ${actualQty < qty ? 'x'+actualQty : ''} <span style="font-size:0.8em; margin-left:5px;">(${core.formatNumber(totalCost)} ${isDiamond ? '💎' : 'cal'})</span>`;
        buyBtn.className = "btn-buy-max max-ready";
        buyBtn.style.opacity = "1";
        buyBtn.disabled = false;
    }
    
    buyBtn.onclick = () => {
        if (buyBtn.disabled) return;
        closeEggModal();
        if (isDiamond) core.buyDiamondEgg(egg.id);
        else core.buyEgg(egg);
    };
}


// ============ ANIMATION FUSION ============
export function playFusionAnimation(participants, petData, currentLevel, callback) {
    const modal = document.getElementById('fusion-modal');
    const arena = document.getElementById('fusion-arena');
    const resultZone = document.getElementById('fusion-result');
    const resultIcon = document.getElementById('fusion-result-icon');
    const resultName = document.getElementById('fusion-result-name');
    const resultBadge = document.getElementById('fusion-result-badge');
    const closeBtn = document.getElementById('fusion-close-btn');

    if (!modal || !arena) {
        callback();
        return;
    }

    // Reset
    arena.innerHTML = '';
    resultZone.classList.add('hidden');
    closeBtn.classList.remove('show-action');
    modal.classList.remove('hidden');

    // --- Son de fusion ---
    _playFusionSound();

    // --- Placer les 5 pets en étoile ---
    const positions = [
        { x: 50, y: 8  },   // haut
        { x: 90, y: 35 },   // haut-droite
        { x: 78, y: 80 },   // bas-droite
        { x: 22, y: 80 },   // bas-gauche
        { x: 10, y: 35 },   // haut-gauche
    ];

    const petEls = participants.map((p, idx) => {
        const petInfo = data.PETS.find(x => x.id === p.id);
        const el = document.createElement('div');
        el.className = 'fusion-pet-node';
        el.style.left = `${positions[idx].x}%`;
        el.style.top  = `${positions[idx].y}%`;
        el.innerHTML  = `<span>${petInfo ? petInfo.icon : '❓'}</span>`;
        arena.appendChild(el);
        return el;
    });

    // --- Phase 1 (800ms) : secousse d'anticipation ---
    petEls.forEach(el => el.classList.add('fusion-shaking'));

    setTimeout(() => {
        // --- Phase 2 (700ms) : convergence vers le centre ---
        petEls.forEach(el => {
            el.classList.remove('fusion-shaking');
            el.classList.add('fusion-converging');
        });

        setTimeout(() => {
            // --- Phase 3 : explosion de particules ---
            _spawnFusionExplosion(arena);

            // Cacher les 5 nodes
            petEls.forEach(el => el.style.opacity = '0');

            // Exécuter la mutation d'état
            callback();

            // Afficher le résultat fusionné
            const newLevel = currentLevel + 1;
            const fusionNames = data.FUSION_NAMES || ['Sauvage', 'Élu', 'Sacré', 'Légendaire', 'Divin'];
            resultIcon.textContent = petData.icon;
            resultName.textContent = `${petData.name}`;
            resultBadge.textContent = fusionNames[newLevel] || `Fusion ${newLevel}`;
            resultBadge.className = `fusion-level-badge badge-fusion-${newLevel}`;

            setTimeout(() => {
                resultZone.classList.remove('hidden');
                setTimeout(() => closeBtn.classList.add('show-action'), 600);
            }, 300);

            closeBtn.onclick = () => {
                modal.classList.add('hidden');
            };
        }, 750);
    }, 800);
}

/** Son synthétique de fusion via Web Audio API */
function _playFusionSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Build : un accord montant + un whoosh
        const play = (freq, startTime, dur, type = 'sine', gainVal = 0.18) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 2.5, ctx.currentTime + startTime + dur * 0.7);
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + dur);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + dur + 0.05);
        };

        // Accord magique ascendant
        play(220,  0,    0.6, 'sine',     0.12);
        play(330,  0.08, 0.6, 'sine',     0.10);
        play(440,  0.16, 0.6, 'sine',     0.10);
        play(880,  0.30, 0.5, 'sine',     0.20);
        // Impact final
        play(110,  0.75, 0.4, 'sawtooth', 0.08);
        play(1760, 0.75, 0.3, 'sine',     0.15);
    } catch(e) {
        // Web Audio non disponible, silence
    }
}

/** Spawn de particules d'explosion au centre de l'arena */
function _spawnFusionExplosion(arena) {
    const colors = ['#ff6b35', '#ffc947', '#a855f7', '#22c55e', '#fff', '#00d2ff', '#ec4899'];
    const count  = 22;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'fusion-particle';
        const angle  = (360 / count) * i + (Math.random() - 0.5) * 20;
        const dist   = 60 + Math.random() * 80;
        const rad    = (angle * Math.PI) / 180;
        const tx     = Math.round(Math.cos(rad) * dist);
        const ty     = Math.round(Math.sin(rad) * dist);
        const size   = 6 + Math.round(Math.random() * 10);
        const color  = colors[Math.floor(Math.random() * colors.length)];
        p.style.cssText = `
            left: 50%; top: 50%;
            width: ${size}px; height: ${size}px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px ${color};
            --tx: ${tx}px; --ty: ${ty}px;
            animation-delay: ${Math.random() * 0.1}s;
        `;
        arena.appendChild(p);
    }
}

// ============ ANIMATION GACHA ============

/** Son synthétique exclusif pour les Œufs (Web Audio API) */
function _playEggSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const play = (freq, typeOsc, startTime, dur, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = typeOsc;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            if(typeOsc === 'sine' || typeOsc === 'triangle') {
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + startTime + dur);
            }
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + dur);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + dur + 0.05);
        };

        if (type === 'pop') { 
            // Petit son quand l'œuf apparaît
            play(600, 'sine', 0, 0.15, 0.1);
            play(800, 'triangle', 0.05, 0.2, 0.1);
        } else if (type === 'roulette-tick') {
            // Son très court pendant que la roulette tourne
            play(800, 'square', 0, 0.05, 0.015);
        } else if (type === 'reveal-single') { 
            // Fanfare triomphante pour un pet unique
            play(440, 'square', 0, 0.2, 0.05);
            play(554, 'square', 0.1, 0.2, 0.05);
            play(659, 'square', 0.2, 0.4, 0.05);
            play(880, 'square', 0.3, 0.7, 0.05);
        } else if (type === 'reveal-multi') {
            // Accord d'apparition multiple rapide
            play(523.25, 'sine', 0, 0.3, 0.1); // Do
            play(659.25, 'sine', 0.1, 0.3, 0.1); // Mi
            play(783.99, 'sine', 0.2, 0.5, 0.1); // Sol
        }
    } catch(e) {
        // Silencieux si l'API audio n'est pas supportée
    }
}

/** Point d'entrée Gacha : Nettoyage strict puis redirection */
export function playMultiEggAnimation(egg, petsArray, callback) {
    const modal = document.getElementById('gacha-modal');
    if (!modal) { callback(); return; }

    // HARD RESET : On cache TOUT formellement pour éviter les superpositions
    document.getElementById('gacha-egg').classList.add('hidden');
    document.getElementById('gacha-roulette').classList.add('hidden');
    document.getElementById('gacha-multi-open').classList.add('hidden');
    document.getElementById('gacha-result').classList.add('hidden');
    document.getElementById('gacha-close-btn').classList.remove('show-action');
    document.getElementById('gacha-multi-close').classList.remove('show-action');

    // Nettoyage de la vue Résultat Unique
    document.getElementById('gacha-result-icon').textContent = '';
    document.getElementById('gacha-result-name').textContent = '';
    document.getElementById('gacha-result-rarity').textContent = '';
    document.getElementById('gacha-result-rarity').className = '';

    if (petsArray.length === 1) {
        _playSingleRoulette(egg, petsArray[0], callback);
    } else {
        _playSimultaneousOpen(egg, petsArray, callback);
    }
}

// --- Roulette classique (1 œuf) ---
function _playSingleRoulette(egg, wonPet, callback) {
    const modal    = document.getElementById('gacha-modal');
    const eggDiv   = document.getElementById('gacha-egg');
    const roulette = document.getElementById('gacha-roulette');
    const track    = document.getElementById('gacha-track');
    const resultDiv= document.getElementById('gacha-result');
    const closeBtn = document.getElementById('gacha-close-btn');

    modal.classList.remove('hidden');
    eggDiv.classList.remove('hidden');
    eggDiv.textContent = egg.icon;

    _playEggSound('pop');

    setTimeout(() => {
        eggDiv.classList.add('hidden');
        roulette.classList.remove('hidden');
        
        track.innerHTML = '';
        const numSpins = 30;
        for (let i = 0; i < numSpins; i++) {
            const rp = data.PETS[Math.floor(Math.random() * data.PETS.length)];
            const s  = document.createElement('div'); s.className = 'gacha-slot';
            s.innerHTML = `<div class="slot-icon">${rp.icon}</div>`;
            track.appendChild(s);
        }
        const win = document.createElement('div'); win.className = 'gacha-slot';
        win.innerHTML = `<div class="slot-icon" style="filter:drop-shadow(0 0 20px var(--accent-secondary))">${wonPet.icon}</div>`;
        track.appendChild(win);
        for (let i = 0; i < 3; i++) {
            const p = data.PETS[Math.floor(Math.random() * data.PETS.length)];
            const s = document.createElement('div'); s.className = 'gacha-slot';
            s.innerHTML = `<div class="slot-icon">${p.icon}</div>`;
            track.appendChild(s);
        }
        
        track.style.transition = 'none';
        track.style.transform  = 'translateY(0px)';
        
        // Son de tick pendant que la roulette tourne
        let ticks = 0;
        const tickInterval = setInterval(() => {
            _playEggSound('roulette-tick');
            ticks++;
            if(ticks > 15) clearInterval(tickInterval);
        }, 150);

        void track.offsetWidth; 
        track.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)';
        track.style.transform  = `translateY(-${numSpins * 150}px)`;

        setTimeout(() => {
            roulette.classList.add('hidden');
            resultDiv.classList.remove('hidden');
            
            _playEggSound('reveal-single');

            document.getElementById('gacha-result-icon').textContent = wonPet.icon;
            document.getElementById('gacha-result-name').textContent = wonPet.name;
            const rarityEl = document.getElementById('gacha-result-rarity');
            rarityEl.textContent = wonPet.rarity;
            rarityEl.className  = `gacha-rarity badge-fusion-0 rarity-${wonPet.rarity}`;
            
            setTimeout(() => closeBtn.classList.add('show-action'), 1000);
            
            closeBtn.onclick = () => { 
                modal.classList.add('hidden'); 
                resultDiv.classList.add('hidden'); // CRUCIAL : on cache la div de résultat !
                callback(); 
            };
        }, 4200);
    }, 1000);
}

// --- Animation simultanée en pods (N œufs) ---
function _playSimultaneousOpen(egg, petsArray, callback) {
    const modal   = document.getElementById('gacha-modal');
    const podsDiv = document.getElementById('gacha-multi-open');
    const podsCtn = document.getElementById('gacha-pods-container');
    const closeBtn= document.getElementById('gacha-multi-close');

    modal.classList.remove('hidden');
    podsDiv.classList.remove('hidden');
    
    podsCtn.innerHTML = '';
    const pods = petsArray.map((pet, idx) => {
        const pod = document.createElement('div');
        pod.className = 'egg-pod';
        pod.innerHTML = `
            <div class="pod-egg" id="pod-egg-${idx}">${egg.icon}</div>
            <div class="pod-reveal hidden" id="pod-reveal-${idx}">
                <div class="pod-pet-icon">${pet.icon}</div>
                <div class="pod-pet-name">${pet.name}</div>
                <div class="pod-pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>
            </div>
        `;
        podsCtn.appendChild(pod);
        return { pod, pet, idx };
    });

    _playEggSound('pop');

    // Crack & Reveal
    setTimeout(() => {
        _playEggSound('reveal-multi');

        pods.forEach(({ idx }) => {
            const podEgg    = document.getElementById(`pod-egg-${idx}`);
            const podReveal = document.getElementById(`pod-reveal-${idx}`);
            if (podEgg) podEgg.classList.add('cracking');

            setTimeout(() => {
                if (podEgg)    podEgg.classList.add('hidden');
                if (podReveal) podReveal.classList.remove('hidden');
            }, 400);
        });

        setTimeout(() => closeBtn.classList.add('show-action'), 900);
        
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
            podsDiv.classList.add('hidden'); // CRUCIAL : on cache la div multi !
            callback();
        };
    }, 900);
}

// ============ CLOUD UI ============
export function updateCloudUI(user) {
    const unauthUI = document.getElementById('cloud-unauth-ui');
    const authUI = document.getElementById('cloud-auth-ui');
    const emailDisplay = document.getElementById('cloud-user-email');
    const msg = document.getElementById('cloud-auth-msg');
    
    if (!unauthUI || !authUI) return;

    if (user) {
        unauthUI.style.display = 'none';
        authUI.style.display = 'flex';
        if(emailDisplay) emailDisplay.textContent = user.email;
    } else {
        unauthUI.style.display = 'block';
        authUI.style.display = 'none';
        document.getElementById('cloud-email').value = '';
        document.getElementById('cloud-password').value = '';
        if(msg) msg.textContent = '';
    }
}

// Remet l'interface sur l'onglet de base (Bâtiments) lors d'un Reset
export function resetToMainTab() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
    
    const bTab = document.querySelector('[data-tab="buildings"]');
    if (bTab) bTab.classList.add('active');
    
    const bList = document.getElementById('buildings-list');
    if (bList) bList.classList.add('active');
    
    const panelTitle = document.getElementById('panel-title');
    if (panelTitle) panelTitle.textContent = "🏗️ Bâtiments";
}