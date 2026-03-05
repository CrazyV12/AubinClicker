export let state = {
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
    
    diamonds: 0,
    diamondProgress: 0,
    diamondUpgradesPurchased: {},
    
    isSelectionMode: false,
    selectedPetsToSell: [],
    sortOrder: 'desc', 
    completedQuests: [],
    activeQuests: [],
    lastQuestTypes: [],
    stats: { eggsOpened: 0, petsFused: 0, petsSold: 0, timePlayed: 0 },
    
    isOpeningEgg: false,
    eggQtySelected: 1,
    
    // NOUVELLES VARIABLES AUTO
    autoSellConfig: { common: false, rare: false, epic: false, legendary: false, mythic: false },
    autoRollActive: false,
    autoRollEggId: null
};