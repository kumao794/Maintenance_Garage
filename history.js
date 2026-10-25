(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function renderDeleteHistory() {
        const list = document.getElementById('delete-history-list');
        if (!list) return;

        if (!MG.appState.deletedHistory.length) {
            list.innerHTML = '<div class="empty-state">削除履歴はまだありません。</div>';
            return;
        }

        list.innerHTML = [...MG.appState.deletedHistory]
            .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
            .map((item) => `
                <div class="list-item">
                    <div class="list-item-header">
                        <div class="list-item-title">${item.type === 'fuel' ? '給油' : '整備'}</div>
                        <div class="list-item-date">${MG.formatDateTime(item.deletedAt)}</div>
                    </div>
                    <div class="list-item-grid">
                        <div><span class="label">種別</span><span>${item.type === 'fuel' ? '給油記録' : '整備記録'}</span></div>
                        <div><span class="label">内容</span><span>${item.summary}</span></div>
                    </div>
                </div>
            `).join('');
    }

    function recordDeleteHistory(type, summary) {
        MG.appState.deletedHistory.unshift({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type,
            summary,
            deletedAt: new Date().toISOString()
        });

        MG.appState.deletedHistory = MG.appState.deletedHistory.slice(0, 20);
        MG.saveData();
        renderDeleteHistory();
    }

    function hideDeleteConfirm() {
        MG.deleteConfirmState.type = null;
        MG.deleteConfirmState.id = null;
        MG.deleteConfirmState.summary = null;
        const modal = document.getElementById('delete-confirm-modal');
        if (modal) modal.classList.add('hidden');
    }

    function confirmDelete() {
        if (!MG.deleteConfirmState.type || !MG.deleteConfirmState.id) {
            hideDeleteConfirm();
            return;
        }

        if (MG.deleteConfirmState.type === 'fuel') {
            const targetIndex = MG.appState.fuels.findIndex((record) => record.id === MG.deleteConfirmState.id);
            if (targetIndex !== -1) {
                const deletedRecord = MG.appState.fuels[targetIndex];
                MG.appState.fuels.splice(targetIndex, 1);
                MG.refreshFuelCalculations();
                if (MG.editingFuelState.id === MG.deleteConfirmState.id) {
                    MG.resetFuelForm();
                }
                recordDeleteHistory('fuel', `日付:${MG.formatDate(deletedRecord.date)} / 走行距離:${MG.formatNumber(MG.safeNumber(deletedRecord.odometer))}km / 給油量:${MG.formatNumber(MG.safeNumber(deletedRecord.fuelAmount), 1)}L / 金額:${MG.formatCurrency(MG.safeNumber(deletedRecord.price))}`);
                MG.showAlert('fuel-form-alert', 'success', '給油記録を削除しました。');
            }
        }

        if (MG.deleteConfirmState.type === 'maintenance') {
            const targetIndex = MG.appState.maintenance.findIndex((record) => record.id === MG.deleteConfirmState.id);
            if (targetIndex !== -1) {
                const deletedRecord = MG.appState.maintenance[targetIndex];
                MG.appState.maintenance.splice(targetIndex, 1);
                MG.appState.maintenance = MG.sortMaintenanceRecordsByDate(MG.appState.maintenance);
                MG.saveData();
                MG.renderHome();
                MG.renderMaintenanceHistory();
                if (MG.editingMaintenanceState.id === MG.deleteConfirmState.id) {
                    MG.resetMaintenanceForm();
                }
                recordDeleteHistory('maintenance', `部品:${deletedRecord.partName} / 交換日:${MG.formatDate(deletedRecord.date)} / 走行距離:${MG.formatNumber(MG.safeNumber(deletedRecord.odometer))}km / 費用:${MG.formatCurrency(MG.safeNumber(deletedRecord.cost))}`);
                MG.showAlert('maintenance-form-alert', 'success', '整備記録を削除しました。');
            }
        }

        hideDeleteConfirm();
    }

    Object.assign(MG, {
        renderDeleteHistory,
        recordDeleteHistory,
        hideDeleteConfirm,
        confirmDelete
    });
})();
