(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function clearAllData() {
        if (!window.confirm('全ての給油履歴・整備履歴・削除履歴を削除しますか？\nこの操作は取り消せません。')) {
            return;
        }

        MG.appState.fuels = [];
        MG.appState.maintenance = [];
        MG.appState.deletedHistory = [];
        MG.appState.parts = [...MG.DEFAULT_PARTS];
        MG.saveData();
        MG.renderHome();
        MG.renderFuelHistory();
        MG.renderMaintenanceHistory();
        MG.renderDeleteHistory();
        MG.refreshFuelFilters();
        MG.refreshMaintenanceFilters();
        MG.showAlert('import-status', 'success', '全データをクリアしました。');
    }

    function addPart() {
        const input = document.getElementById('new-part-name');
        if (!input) return;

        const value = input.value.trim();
        if (!value) {
            MG.showAlert('part-add-alert', 'warning', '追加する部品名を入力してください。');
            return;
        }

        const cleaned = value.replace(/\s+/g, ' ');
        if (MG.appState.parts.includes(cleaned)) {
            MG.showAlert('part-add-alert', 'warning', 'その部品はすでに登録されています。');
            return;
        }

        MG.appState.parts.push(cleaned);
        MG.saveData();
        MG.renderPartSelect();

        const select = document.getElementById('part-name-select');
        if (select) select.value = cleaned;
        input.value = '';
        MG.showAlert('part-add-alert', 'success', `部品「${cleaned}」を追加しました。`);
    }

    function initNavigation() {
        document.querySelectorAll('.nav-button').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const screen = button.dataset.screen || button.getAttribute('data-screen');
                if (screen) {
                    MG.setActiveScreen(screen);
                }
            });
        });
    }

    function initForms() {
        const fuelForm = document.getElementById('fuel-form');
        const maintenanceForm = document.getElementById('maintenance-form');

        if (fuelForm) {
            fuelForm.addEventListener('submit', MG.handleFuelSubmit);
            fuelForm.date.value = MG.getTodayString();
        }

        if (maintenanceForm) {
            maintenanceForm.addEventListener('submit', MG.handleMaintenanceSubmit);
            maintenanceForm.date.value = MG.getTodayString();
        }

        const addPartBtn = document.getElementById('add-part-btn');
        if (addPartBtn) addPartBtn.addEventListener('click', addPart);

        const cancelFuel = document.getElementById('cancel-fuel-edit-btn');
        if (cancelFuel) {
            cancelFuel.addEventListener('click', () => {
                MG.resetFuelForm();
                MG.hideAlert('fuel-form-alert');
            });
        }

        const cancelMaintenance = document.getElementById('cancel-maintenance-edit-btn');
        if (cancelMaintenance) {
            cancelMaintenance.addEventListener('click', () => {
                MG.resetMaintenanceForm();
                MG.hideAlert('maintenance-form-alert');
            });
        }

        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', MG.confirmDelete);

        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', MG.hideDeleteConfirm);

        const exportFuelBtn = document.getElementById('export-fuel-csv-btn');
        if (exportFuelBtn) exportFuelBtn.addEventListener('click', MG.exportFuelCsv);

        const exportMaintenanceBtn = document.getElementById('export-maintenance-csv-btn');
        if (exportMaintenanceBtn) exportMaintenanceBtn.addEventListener('click', MG.exportMaintenanceCsv);

        const clearAllBtn = document.getElementById('clear-all-data-btn');
        if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllData);

        const importCsvBtn = document.getElementById('import-csv-btn');
        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => {
                const input = document.getElementById('import-csv-input');
                if (input) input.click();
            });
        }

        const importCsvInput = document.getElementById('import-csv-input');
        if (importCsvInput) {
            importCsvInput.addEventListener('change', (event) => {
                const [file] = event.target.files;
                if (!file) return;

                const fileName = file.name.toLowerCase();
                if (fileName.includes('fuel') || fileName.includes('給油')) {
                    MG.importFuelCsv(file);
                } else if (fileName.includes('maintenance') || fileName.includes('整備')) {
                    MG.importMaintenanceCsv(file);
                } else {
                    MG.importFuelCsv(file);
                }

                event.target.value = '';
            });
        }
    }

    function initHistoryTabs() {
        const tabs = document.querySelectorAll('.history-subtab');
        const panels = document.querySelectorAll('.history-panel');

        if (!tabs.length || !panels.length) return;

        function setHistoryTab(target) {
            const activeTab = target || 'fuel';

            tabs.forEach((tab) => {
                const isActive = tab.dataset.historyTab === activeTab;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.historyPanel === activeTab;
                panel.classList.toggle('active', isActive);
                panel.style.display = isActive ? 'block' : 'none';
            });
        }

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                setHistoryTab(tab.dataset.historyTab);
            });
        });

        setHistoryTab('fuel');
    }

    function init() {
        MG.loadAllData();
        MG.renderPartSelect();
        MG.renderHome();
        MG.renderFuelHistory();
        MG.renderMaintenanceHistory();
        MG.renderDeleteHistory();
        MG.refreshFuelFilters();
        MG.refreshMaintenanceFilters();
        initNavigation();
        initHistoryTabs();
        initForms();
        MG.setActiveScreen('home');
    }

    Object.assign(MG, { addPart, clearAllData });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
