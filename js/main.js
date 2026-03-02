import { state } from './state.js';
import * as data from './data.js';
import * as core from './core.js';
import * as ui from './ui.js';

function initShopTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    const panelTitle = document.getElementById('panel-title');
    const shopPanel = document.getElementById('shop-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const wasActive = tab.classList.contains('active');
            
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
            
            if (wasActive) {
                if(shopPanel) shopPanel.style.display = 'none';
            } 
            else {
                tab.classList.add('active');
                if(panelTitle) panelTitle.textContent = tab.dataset.title;
                const targetEl = document.getElementById(`${tab.dataset.tab}-list`);
                if (targetEl) targetEl.classList.add('active');
                if(shopPanel) shopPanel.style.display = 'flex';
            }
        });
    });
}

let lastTick = performance.now();
function gameLoop(now) {
    const dt = (now - lastTick) / 1000;
    const debugDt = dt * data.DEBUG_SPEED;
    lastTick = now;
    state.stats.timePlayed += debugDt;

    // Logique Diamants Passifs
    state.diamondProgress += debugDt;
    const speedBonusLvl = state.diamondUpgradesPurchased['diamond_speed'] || 0;
    const speedMult = 1 + (speedBonusLvl * 0.1);
    const effectiveTick = 300 / speedMult; // 300s = 5 minutes

    if (state.diamondProgress >= effectiveTick) {
        state.diamondProgress -= effectiveTick;
        const u = core.getCurrentUniverse();
        state.diamonds += u.diamondRate;
        ui.showMilestone(`💎 +${u.diamondRate} Diamants récoltés !`);
        ui.updateDiamondUI();
    }

    if (state.cps > 0) {
        const gained = state.cps * debugDt;
        state.calories += gained;
        state.totalCalories += gained;
        ui.updateDisplay();
        ui.checkMilestones();
    }
    requestAnimationFrame(gameLoop);
}

function init() {
    core.loadGame();
    ui.applyUniverseTheme();
    core.recalculateCps();
    core.generateQuests();
    ui.renderAll();

    // Onglets dynamiques (affichés si rebirth > 0)
    if (state.rebirthCount >= 1) {
        ['eggs-tab', 'inventory-tab', 'index-tab', 'codes-tab', 'pet-inventory', 'diamonds-tab'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = '';
        });
    }

    // Gestion du clic sur Aubin
    const clickTarget = document.getElementById('click-target');
    if(clickTarget) {
        clickTarget.addEventListener('click', core.handleClick);
        const _setAubinPressed = () => { const imgEl = document.getElementById('aubin-img'); if (imgEl) imgEl.src = 'images/aubin/aubinappuye.png'; };
        const _setAubinReleased = () => { const imgEl = document.getElementById('aubin-img'); if (imgEl) imgEl.src = ui.getAubinBaseSrc(); };
        
        clickTarget.addEventListener('mousedown', _setAubinPressed);
        clickTarget.addEventListener('mouseup', _setAubinReleased);
        clickTarget.addEventListener('mouseleave', _setAubinReleased);
        clickTarget.addEventListener('touchstart', _setAubinPressed, { passive: true });
        clickTarget.addEventListener('touchend', _setAubinReleased);
        clickTarget.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); core.handleClick(null); } });
    }

    // Boutons Globaux
    const addEv = (id, fn) => { const el = document.getElementById(id); if(el) el.addEventListener('click', fn); };
    addEv('save-btn', core.saveGame);
    addEv('reset-btn', core.resetGame);
    addEv('rebirth-btn', core.doRebirth);
    addEv('ascension-btn', core.doAscension);
    addEv('btn-equip-best', core.equipBestPets);
    addEv('btn-selection-mode', core.toggleSelectionMode);
    addEv('btn-delete-selected', core.sellSelectedPets);
    addEv('btn-sort-inventory', () => core.toggleSortInventory(false));
    addEv('btn-auto-fuse', core.autoFusePets);

    // Codes
    const codeSubmit = document.getElementById('code-submit');
    const codeInput = document.getElementById('code-input');
    if (codeSubmit && codeInput) {
        codeSubmit.addEventListener('click', () => core.redeemCode(codeInput.value));
        codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') core.redeemCode(codeInput.value); });
    }

    // Clic pour désélectionner un pet (en dehors)
    document.addEventListener('click', (e) => {
        if (!state.isSelectionMode && !e.target.closest('.pet-card')) {
            document.querySelectorAll('.pet-card.selected').forEach(c => c.classList.remove('selected'));
        }
    });

    initShopTabs();

    // Boucles
    setInterval(core.saveGame, 30000);
    window.addEventListener('beforeunload', core.saveGame);
    setInterval(() => ui.showQuote(), 30000);
    
    setInterval(ui.spawnBackgroundParticle, 2000);
    for (let i = 0; i < 5; i++) setTimeout(() => ui.spawnBackgroundParticle(), i * 400);
    
    // RAFRAÎCHISSEMENT DE L'INTERFACE TOUTES LES SECONDES (1000ms au lieu de 2000ms)
    setInterval(() => {
        ui.renderBuildings();
        ui.renderUpgrades();
        ui.renderQuests();
        ui.checkQuests();
        ui.updateRebirthUI();
        ui.updateAscensionUI();
        ui.renderEggs(); 
        ui.renderDiamondShop();
        ui.updateDiamondUI();
    }, 1000);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);