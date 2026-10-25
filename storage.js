(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function loadAllData() {
        try {
            const storedFuel = JSON.parse(localStorage.getItem(MG.STORAGE_KEYS.fuels) || '[]');
            const storedMaintenance = JSON.parse(localStorage.getItem(MG.STORAGE_KEYS.maintenance) || '[]');
            const storedParts = JSON.parse(localStorage.getItem(MG.STORAGE_KEYS.parts) || '[]');
            const storedDeletedHistory = JSON.parse(localStorage.getItem(MG.STORAGE_KEYS.deletedHistory) || '[]');

            MG.appState.fuels = MG.normalizeFuelRecords(storedFuel);
            MG.appState.maintenance = Array.isArray(storedMaintenance) ? storedMaintenance : [];
            MG.appState.parts = Array.isArray(storedParts) && storedParts.length > 0 ? storedParts : [...MG.DEFAULT_PARTS];
            MG.appState.deletedHistory = Array.isArray(storedDeletedHistory) ? storedDeletedHistory : [];
        } catch (error) {
            console.error('LocalStorage読み込みに失敗しました。', error);
            MG.appState.fuels = [];
            MG.appState.maintenance = [];
            MG.appState.parts = [...MG.DEFAULT_PARTS];
            MG.appState.deletedHistory = [];
        }

        if (!MG.appState.parts.length) {
            MG.appState.parts = [...MG.DEFAULT_PARTS];
        }
    }

    function saveData() {
        localStorage.setItem(MG.STORAGE_KEYS.fuels, JSON.stringify(MG.appState.fuels));
        localStorage.setItem(MG.STORAGE_KEYS.maintenance, JSON.stringify(MG.appState.maintenance));
        localStorage.setItem(MG.STORAGE_KEYS.parts, JSON.stringify(MG.appState.parts));
        localStorage.setItem(MG.STORAGE_KEYS.deletedHistory, JSON.stringify(MG.appState.deletedHistory));
    }

    Object.assign(MG, { loadAllData, saveData });
})();
