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

    // AUTO-ROLL EXECUTION
    core.processAutoRoll(debugDt);

    state.diamondProgress += debugDt;
    const effectiveTick = 60; // 1 MINUTE AU LIEU DE 5 !

    if (state.diamondProgress >= effectiveTick) {
        const cycles = Math.floor(state.diamondProgress / effectiveTick);
        state.diamondProgress -= (effectiveTick * cycles);
        
        const u = core.getCurrentUniverse();
        const classBonusLvl = state.diamondUpgradesPurchased['diamond_class'] || 0;
        const totalDiamonds = Math.floor(u.diamondRate * Math.pow(2, classBonusLvl)) * cycles;
        
        state.diamonds += totalDiamonds;
        ui.showMilestone(`💎 +${totalDiamonds} Diamants récoltés !`);
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

    if (state.rebirthCount >= 1) {
        ['eggs-tab', 'inventory-tab', 'index-tab', 'codes-tab', 'pet-inventory', 'diamonds-tab'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = '';
        });
    }

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

    // NOUVEAU BOUTON : Désactivation flottante de l'Auto-Roll
    addEv('autoroll-indicator-btn', () => {
        state.autoRollActive = false;
        state.autoRollEggId = null;
        ui.updateAutoRollUI();
        if (typeof ui.updateEggModalControls === 'function') ui.updateEggModalControls();
        ui.showQuote("🎰 Auto-Roll désactivé.");
    });

    const codeSubmit = document.getElementById('code-submit');
    const codeInput = document.getElementById('code-input');
    if (codeSubmit && codeInput) {
        codeSubmit.addEventListener('click', () => core.redeemCode(codeInput.value));
        codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') core.redeemCode(codeInput.value); });
    }

    document.addEventListener('click', (e) => {
        if (!state.isSelectionMode && !e.target.closest('.pet-card')) {
            document.querySelectorAll('.pet-card.selected').forEach(c => c.classList.remove('selected'));
        }
    });

    initShopTabs();

    setInterval(core.saveGame, 30000);
    window.addEventListener('beforeunload', core.saveGame);
    setInterval(() => ui.showQuote(), 30000);
    
    setInterval(ui.spawnBackgroundParticle, 2000);
    for (let i = 0; i < 5; i++) setTimeout(() => ui.spawnBackgroundParticle(), i * 400);
    
    setInterval(() => {
        ui.updateDisplay();
        ui.checkQuests();
        ui.updateRebirthUI();
        ui.updateAscensionUI();
        ui.updateDiamondUI();
    }, 1000);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);