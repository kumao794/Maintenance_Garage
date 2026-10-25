(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function getYearMonthKey(dateValue) {
        if (!dateValue) return null;
        const date = new Date(`${dateValue}T00:00:00`);
        if (Number.isNaN(date.getTime())) return null;
        return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }

    function filterMaintenanceRecordsByScope(records) {
        const yearEl = document.getElementById('maintenance-year-filter');
        const monthEl = document.getElementById('maintenance-month-filter');
        if (!yearEl || !monthEl) return records;

        const selectedYear = yearEl.value;
        const selectedMonth = monthEl.value;
        if (selectedYear === 'all' && selectedMonth === 'all') return records;

        return records.filter((record) => {
            const key = getYearMonthKey(record.date);
            if (!key) return false;
            const matchesYear = selectedYear === 'all' || String(key.year) === selectedYear;
            const matchesMonth = selectedMonth === 'all' || String(key.month) === selectedMonth;
            return matchesYear && matchesMonth;
        });
    }

    function populateMaintenanceYearMonthFilters() {
        const yearEl = document.getElementById('maintenance-year-filter');
        const monthEl = document.getElementById('maintenance-month-filter');
        if (!yearEl || !monthEl) return;

        const years = [...new Set(MG.appState.maintenance.map((record) => getYearMonthKey(record.date)?.year).filter(Boolean))].sort((a, b) => b - a);
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        yearEl.innerHTML = '<option value="all">全期間</option>' + years.map((year) => `<option value="${year}">${year}年</option>`).join('');
        monthEl.innerHTML = '<option value="all">全月</option>' + months.map((month) => `<option value="${month}">${month}月</option>`).join('');

        const currentYear = String(new Date().getFullYear());
        if (years.includes(Number(currentYear))) yearEl.value = currentYear;
    }

    function renderMaintenanceHistory() {
        const list = document.getElementById('maintenance-history-list');
        if (!list) return;

        const records = filterMaintenanceRecordsByScope(MG.sortMaintenanceRecordsByDate(MG.appState.maintenance));
        if (!records.length) {
            list.innerHTML = '<div class="empty-state">整備履歴はまだありません。</div>';
            return;
        }

        list.innerHTML = records.map((record) => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${record.partName}</div>
                    <div class="inline-actions" style="margin-top: 0;">
                        <button type="button" class="secondary-btn" data-action="edit-maintenance" data-id="${record.id}">編集</button>
                        <button type="button" class="danger-btn" data-action="delete-maintenance" data-id="${record.id}">削除</button>
                    </div>
                </div>
                <div class="list-item-grid">
                    <div><span class="label">日付</span><span>${MG.formatDate(record.date)}</span></div>
                    <div><span class="label">走行距離</span><span>${MG.formatNumber(MG.safeNumber(record.odometer))} km</span></div>
                    <div><span class="label">費用</span><span>${MG.formatCurrency(MG.safeNumber(record.cost))}</span></div>
                    <div><span class="label">メモ</span><span>${record.memo || 'ー'}</span></div>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('[data-action="edit-maintenance"]').forEach((button) => {
            button.addEventListener('click', () => handleMaintenanceEdit(button.dataset.id));
        });

        list.querySelectorAll('[data-action="delete-maintenance"]').forEach((button) => {
            button.addEventListener('click', () => handleMaintenanceDelete(button.dataset.id));
        });
    }

    function bindMaintenanceFilterEvents() {
        const yearEl = document.getElementById('maintenance-year-filter');
        const monthEl = document.getElementById('maintenance-month-filter');
        if (!yearEl || !monthEl) return;

        yearEl.addEventListener('change', () => {
            renderMaintenanceHistory();
        });

        monthEl.addEventListener('change', () => {
            renderMaintenanceHistory();
        });
    }

    function refreshMaintenanceFilters() {
        populateMaintenanceYearMonthFilters();
        bindMaintenanceFilterEvents();
    }

    Object.assign(MG, {
        getYearMonthKey,
        filterMaintenanceRecordsByScope,
        populateMaintenanceYearMonthFilters,
        bindMaintenanceFilterEvents,
        refreshMaintenanceFilters,
        renderMaintenanceHistory
    });
})();
