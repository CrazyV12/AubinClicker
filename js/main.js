import { state } from './state.js';
import * as data from './data.js';
import * as core from './core.js';
import * as ui from './ui.js';
import * as cloud from './cloud.js';

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
                if (tab.dataset.tab === 'leaderboard') {
                    const container = document.getElementById('leaderboard-container');
                    if(container) container.innerHTML = '<div style="text-align:center; color:var(--text-muted);">Chargement du classement...</div>';
                    cloud.getLeaderboard().then(board => ui.renderLeaderboard(board));
                }
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
    
    addEv('reset-btn', core.resetGame);
    addEv('rebirth-btn', core.doRebirth);
    addEv('ascension-btn', core.doAscension);
    addEv('btn-equip-best', core.equipBestPets);
    addEv('btn-selection-mode', core.toggleSelectionMode);
    addEv('btn-delete-selected', core.sellSelectedPets);
    addEv('btn-sort-inventory', () => core.toggleSortInventory(false));
    addEv('btn-auto-fuse', core.autoFusePets);

// INITIALISATION DU CLOUD (Invisible et Intelligente)
    cloud.initAuth(async (user) => {
        ui.updateCloudUI(user);
        if (user) {
            await core.syncWithCloud();
            
            // NOUVEAU : On lance la surveillance anti-clonage en temps réel
            cloud.startSessionListener(async () => {
                // Cette fonction s'exécute si un autre appareil/onglet se connecte !
                window.alert("⚠️ Vous avez été déconnecté car ce compte vient d'être ouvert sur un autre appareil !");
                await cloud.logout();
                core.logoutReset(); // Remise à zéro locale immédiate
            });
        } else {
            cloud.stopSessionListener();
        }
    });

    const emailEl = document.getElementById('cloud-email');
    const passEl = document.getElementById('cloud-password');
    const msgEl = document.getElementById('cloud-auth-msg');

    addEv('btn-cloud-register', async () => {
        if(!emailEl.value || !passEl.value) return;
        msgEl.style.color = "var(--text-secondary)";
        msgEl.textContent = "Création du compte...";
        const res = await cloud.register(emailEl.value, passEl.value);
        if(!res.success) { msgEl.style.color = "var(--danger)"; msgEl.textContent = res.message; }
    });

    addEv('btn-cloud-login', async () => {
        if(!emailEl.value || !passEl.value) return;
        msgEl.style.color = "var(--text-secondary)";
        msgEl.textContent = "Connexion...";
        const res = await cloud.login(emailEl.value, passEl.value);
        if(!res.success) { msgEl.style.color = "var(--danger)"; msgEl.textContent = res.message; }
    });

    addEv('btn-cloud-google', async () => {
        msgEl.style.color = "var(--text-secondary)";
        msgEl.textContent = "Ouverture de Google...";
        const res = await cloud.loginWithGoogle();
        if(!res.success) { msgEl.style.color = "var(--danger)"; msgEl.textContent = res.message; }
    });
    
    addEv('btn-cloud-logout', async () => {
        await cloud.logout();
        core.logoutReset();
    });

    addEv('btn-save-username', async () => {
        const input = document.getElementById('player-username');
        if (!input) return;
        const newName = input.value.trim().substring(0, 15); // Limite à 15 caractères
        
        if (newName.length < 3) {
            ui.showQuote("❌ Ton pseudo doit faire au moins 3 caractères !");
            return;
        }

        if (state.username && newName.toLowerCase() === state.username.toLowerCase()) {
            ui.showQuote("⚠️ C'est déjà ton pseudo !");
            return;
        }

        // Filtre anti-insultes (Tu peux rajouter des mots dans ce tableau)
        const forbidden = ['admin', 'modérateur', 'conard', 'connard', 'pute', 'salope', 'bitch', 'fuck', 'shit', 'merde', 'hitler', 'nazi', 'pd', 'encule', 'enculé', 'salaud', 'bite', 'chatte', 'couille', 'porn', 'sex'];
        const lowerName = newName.toLowerCase();
        const isBad = forbidden.some(word => lowerName.includes(word));
        if (isBad) {
            ui.showQuote("🛑 Ce pseudo est interdit. Aubin est un jeu tout public !");
            return;
        }

        const isChange = (state.username && state.username.trim() !== "");
        const cost = 1000000;

        // Vérification de l'argent AVANT l'appel réseau
        if (isChange) {
            if (state.diamonds < cost) {
                ui.showQuote(`💎 Tu n'as pas assez de diamants (${core.formatNumber(cost)} requis) !`);
                return;
            }
            if(!confirm(`Changer de pseudo te coûtera ${core.formatNumber(cost)} 💎.\nEs-tu sûr de vouloir t'appeler "${newName}" ?`)) return;
        }

        // Feedback visuel pendant la vérification réseau
        const btn = document.getElementById('btn-save-username');
        const oldHtml = btn.innerHTML;
        btn.innerHTML = "⏳...";
        btn.disabled = true;

        // On interroge Firebase pour voir si le pseudo existe déjà
        const isAvailable = await cloud.checkUsernameAvailability(newName);
        
        btn.innerHTML = oldHtml;
        btn.disabled = false;

        if (!isAvailable) {
            ui.showQuote("❌ Ce pseudo est déjà pris par un autre joueur !");
            return;
        }

        // Tout est bon, on facture si besoin et on sauvegarde !
        if (isChange) {
            state.diamonds -= cost;
            ui.updateDiamondUI();
        }
        
        state.username = newName;
        core.saveGame(true); // Sauvegarde locale + Cloud immédiate
        ui.showMilestone(`✅ Nouveau pseudo : ${state.username} !`);
        ui.updateCloudUI(cloud.currentUser); // Met le bouton en mode "Payant"
    });

    addEv('btn-refresh-leaderboard', async () => {
        const container = document.getElementById('leaderboard-container');
        if(container) container.innerHTML = '<div style="text-align:center; color:var(--text-muted);">Chargement du classement...</div>';
        const board = await cloud.getLeaderboard();
        ui.renderLeaderboard(board);
    });

    // Désactivation flottante de l'Auto-Roll
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

    // AUTO-SAVE TOUTES LES 10 SECONDES INVISIBLEMENT
    setInterval(core.saveGame, 10000);
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