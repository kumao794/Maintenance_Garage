(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    MG.STORAGE_KEYS = {
        fuels: 'maintenanceGarage.fuels',
        maintenance: 'maintenanceGarage.maintenance',
        parts: 'maintenanceGarage.parts',
        deletedHistory: 'maintenanceGarage.deletedHistory'
    };

    MG.DEFAULT_PARTS = [
        'エンジンオイル',
        'オイルフィルター',
        'タイヤ',
        'バッテリー',
        'ブレーキパッド',
        'イリジウムプラグ',
        'ウォーターポンプ',
        'タイミングベルト'
    ];

    MG.appState = {
        fuels: [],
        maintenance: [],
        parts: [],
        deletedHistory: []
    };

    MG.screenMap = {
        home: 'home-screen',
        fuel: 'fuel-screen',
        maintenance: 'maintenance-screen',
        history: 'history-screen'
    };

    MG.editingFuelState = { id: null };
    MG.editingMaintenanceState = { id: null };
    MG.deleteConfirmState = { type: null, id: null, summary: null };
})();
