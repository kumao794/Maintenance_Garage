(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function getYearMonthKey(dateValue) {
        if (!dateValue) return null;
        const date = new Date(`${dateValue}T00:00:00`);
        if (Number.isNaN(date.getTime())) return null;
        return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }

    function filterFuelRecordsByScope(records) {
        const yearEl = document.getElementById('fuel-year-filter');
        const monthEl = document.getElementById('fuel-month-filter');
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

    function populateFuelYearMonthFilters() {
        const yearEl = document.getElementById('fuel-year-filter');
        const monthEl = document.getElementById('fuel-month-filter');
        if (!yearEl || !monthEl) return;

        const years = [...new Set(MG.appState.fuels.map((record) => getYearMonthKey(record.date)?.year).filter(Boolean))].sort((a, b) => b - a);
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        yearEl.innerHTML = '<option value="all">全期間</option>' + years.map((year) => `<option value="${year}">${year}年</option>`).join('');
        monthEl.innerHTML = '<option value="all">全月</option>' + months.map((month) => `<option value="${month}">${month}月</option>`).join('');

        const currentYear = String(new Date().getFullYear());
        if (years.includes(Number(currentYear))) yearEl.value = currentYear;
    }

    function bindFuelFilterEvents() {
        const yearEl = document.getElementById('fuel-year-filter');
        const monthEl = document.getElementById('fuel-month-filter');
        if (!yearEl || !monthEl) return;

        yearEl.addEventListener('change', () => {
            renderFuelHistory();
        });

        monthEl.addEventListener('change', () => {
            renderFuelHistory();
        });
    }

    function refreshFuelFilters() {
        populateFuelYearMonthFilters();
        bindFuelFilterEvents();
    }

    function renderPartSelect() {
        const select = document.getElementById('part-name-select');
        if (!select) return;

        const uniqueParts = [...new Set((MG.appState.parts && MG.appState.parts.length ? MG.appState.parts : MG.DEFAULT_PARTS))];
        select.innerHTML = uniqueParts.map((part) => `<option value="${part}">${part}</option>`).join('');
    }

    function renderHome() {
        const currentOdometer = MG.appState.fuels.length
            ? Math.max(...MG.appState.fuels.map((record) => MG.safeNumber(record.odometer, 0)))
            : 0;
        const latestFuel = [...MG.appState.fuels]
            .sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`))
            .find((record) => Number.isFinite(record.mpg) && record.mpg > 0);

        const currentDistance = document.getElementById('home-current-distance');
        const latestFuelBox = document.getElementById('home-latest-fuel');
        const fuelCountBox = document.getElementById('home-fuel-count');
        const maintenanceCountBox = document.getElementById('home-maintenance-count');

        if (currentDistance) currentDistance.textContent = `${MG.formatNumber(currentOdometer)} km`;
        if (latestFuelBox) latestFuelBox.textContent = latestFuel ? `${MG.safeNumber(latestFuel.mpg, 0).toFixed(1)} km/L` : '未記録';
        if (fuelCountBox) fuelCountBox.textContent = `${MG.appState.fuels.length} 件`;
        if (maintenanceCountBox) maintenanceCountBox.textContent = `${MG.appState.maintenance.length} 件`;
    }

    function refreshFuelCalculations() {
        MG.appState.fuels = MG.sortFuelRecordsByDate(MG.appState.fuels).map((record, index, array) => {
            const previousRecord = index < array.length - 1 ? array[index + 1] : null;
            const distance = previousRecord ? Math.max(record.odometer - previousRecord.odometer, 0) : 0;
            const fuelAmount = MG.safeNumber(record.fuelAmount, 0);
            const mpg = distance > 0 && fuelAmount > 0 ? distance / fuelAmount : 0;
            return { ...record, distance, mpg };
        });

        MG.saveData();
        renderHome();
        renderFuelHistory();
    }

    function getFuelRecordById(id) {
        return MG.appState.fuels.find((record) => record.id === id) || null;
    }

    function populateFuelForm(record) {
        const form = document.getElementById('fuel-form');
        if (!form) return;

        form.date.value = record.date;
        form.odometer.value = record.odometer;
        form.fuelAmount.value = record.fuelAmount;
        form.price.value = record.price;
        MG.editingFuelState.id = record.id;

        const cancelButton = document.getElementById('cancel-fuel-edit-btn');
        if (cancelButton) {
            cancelButton.hidden = false;
            cancelButton.disabled = false;
        }
    }

    function resetFuelForm() {
        const form = document.getElementById('fuel-form');
        if (!form) return;

        form.reset();
        form.date.value = MG.getTodayString();
        MG.editingFuelState.id = null;

        const cancelButton = document.getElementById('cancel-fuel-edit-btn');
        if (cancelButton) {
            cancelButton.hidden = true;
            cancelButton.disabled = true;
        }
    }

    function handleFuelDelete(id) {
        const record = getFuelRecordById(id);
        if (!record) return;

        MG.deleteConfirmState.type = 'fuel';
        MG.deleteConfirmState.id = id;
        MG.deleteConfirmState.summary = `日付: ${MG.formatDate(record.date)} / 走行距離: ${MG.formatNumber(MG.safeNumber(record.odometer))} km / 給油量: ${MG.formatNumber(MG.safeNumber(record.fuelAmount), 1)} L / 金額: ${MG.formatCurrency(MG.safeNumber(record.price))} / 燃費: ${MG.safeNumber(record.mpg) > 0 ? `${MG.safeNumber(record.mpg).toFixed(1)} km/L` : '未計算'}`;

        const message = document.getElementById('delete-confirm-message');
        const modal = document.getElementById('delete-confirm-modal');
        if (message) message.innerHTML = `<strong>削除対象</strong><br>${MG.deleteConfirmState.summary.replace(/\n/g, '<br>')}`;
        if (modal) modal.classList.remove('hidden');
    }

    function handleFuelEdit(id) {
        const record = getFuelRecordById(id);
        if (!record) return;

        populateFuelForm(record);
        MG.setActiveScreen('fuel');
        MG.hideAlert('fuel-form-alert');
    }

    function handleFuelSubmit(event) {
        event.preventDefault();
        MG.hideAlert('fuel-form-alert');

        const form = event.currentTarget;
        const date = form.date.value;
        const odometer = MG.safeNumber(form.odometer.value, 0);
        const fuelAmount = MG.safeNumber(form.fuelAmount.value, 0);
        const price = MG.safeNumber(form.price.value, 0);

        if (!date || odometer <= 0 || fuelAmount <= 0 || price <= 0) {
            MG.showAlert('fuel-form-alert', 'danger', '日付・走行距離・給油量・金額を正しく入力してください。');
            return;
        }

        const isEditing = Boolean(MG.editingFuelState.id);
        const conflictingRecord = MG.appState.fuels
            .filter((record) => record.id !== MG.editingFuelState.id)
            .find((record) => MG.safeNumber(record.odometer, 0) > odometer);

        if (conflictingRecord) {
            MG.showAlert('fuel-form-alert', 'warning', '既存の走行距離より小さい値は登録できません。');
            return;
        }

        const nextRecord = {
            id: MG.editingFuelState.id || (crypto.randomUUID ? crypto.randomUUID() : `fuel-${Date.now()}`),
            date,
            odometer,
            fuelAmount,
            price
        };

        if (isEditing) {
            const targetIndex = MG.appState.fuels.findIndex((record) => record.id === MG.editingFuelState.id);
            if (targetIndex !== -1) MG.appState.fuels[targetIndex] = nextRecord;
        } else {
            MG.appState.fuels.push(nextRecord);
        }

        MG.appState.fuels = MG.sortFuelRecordsByDate(MG.appState.fuels);
        refreshFuelCalculations();
        const successMessage = isEditing ? '給油記録を更新しました。' : '給油記録を保存しました。';
        resetFuelForm();
        form.reset();
        form.date.value = MG.getTodayString();
        MG.showAlert('fuel-form-alert', 'success', successMessage);
    }

    function renderFuelHistory() {
        const list = document.getElementById('fuel-history-list');
        if (!list) return;

        const records = filterFuelRecordsByScope(MG.sortFuelRecordsByDate(MG.appState.fuels));
        if (!records.length) {
            list.innerHTML = '<div class="empty-state">給油記録はまだありません。</div>';
            return;
        }

        list.innerHTML = records.map((record) => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${MG.formatDate(record.date)}</div>
                    <div class="inline-actions" style="margin-top: 0;">
                        <button type="button" class="secondary-btn" data-action="edit-fuel" data-id="${record.id}">編集</button>
                        <button type="button" class="danger-btn" data-action="delete-fuel" data-id="${record.id}">削除</button>
                    </div>
                </div>
                <div class="list-item-grid">
                    <div><span class="label">走行距離</span><span>${MG.formatNumber(MG.safeNumber(record.distance, 0))} km</span></div>
                    <div><span class="label">給油量</span><span>${MG.formatNumber(MG.safeNumber(record.fuelAmount, 1), 1)} L</span></div>
                    <div><span class="label">金額</span><span>${MG.formatCurrency(MG.safeNumber(record.price))}</span></div>
                    <div><span class="label">燃費</span><span>${MG.safeNumber(record.mpg, 0) > 0 ? `${MG.safeNumber(record.mpg, 0).toFixed(1)} km/L` : 'ー'}</span></div>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('[data-action="edit-fuel"]').forEach((button) => {
            button.addEventListener('click', () => handleFuelEdit(button.dataset.id));
        });

        list.querySelectorAll('[data-action="delete-fuel"]').forEach((button) => {
            button.addEventListener('click', () => handleFuelDelete(button.dataset.id));
        });
    }

    function exportFuelCsv() {
        const rows = MG.sortFuelRecordsByDate(MG.appState.fuels).map((record, index, array) => {
            const previousRecord = index < array.length - 1 ? array[index + 1] : null;
            const distanceDiff = previousRecord ? Math.max(record.odometer - previousRecord.odometer, 0) : '';
            const unitPrice = MG.safeNumber(record.fuelAmount, 0) > 0 ? MG.safeNumber(record.price, 0) / MG.safeNumber(record.fuelAmount, 0) : '';

            return {
                '日付': MG.formatCsvDate(record.date),
                '距離(km)': record.odometer,
                '前回との差(km)': distanceDiff,
                '給油量(L)': record.fuelAmount,
                '燃費(km/l)': record.mpg && record.mpg > 0 ? Number(record.mpg).toFixed(2) : '',
                '支払額(円)': record.price,
                '単価(円)': unitPrice,
                'メモ': record.memo || ''
            };
        });

        const csv = MG.generateCsv(rows, ['日付', '距離(km)', '前回との差(km)', '給油量(L)', '燃費(km/l)', '支払額(円)', '単価(円)', 'メモ']);
        MG.downloadCsv('fuel_history.csv', csv);
    }

    function importFuelCsv(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = String(event.target.result || '');
                const rows = MG.parseCsvText(text);
                if (!rows.length) {
                    MG.showAlert('import-status', 'warning', 'CSVファイルの内容が空です。');
                    return;
                }

                const headers = Object.keys(rows[0]);
                const isFuelCsv =
                    (headers.includes('日付') && headers.includes('距離(km)') && headers.includes('給油量(L)') && headers.includes('支払額(円)')) ||
                    (headers.includes('date') && headers.includes('odometer') && headers.includes('fuelAmount') && headers.includes('price'));

                if (!isFuelCsv) {
                    MG.showAlert('import-status', 'warning', '給油CSVではありません。');
                    return;
                }

                const importedRecords = rows.map((item) => {
                    const date = item['日付'] || item.date || '';
                    const odometer = MG.safeNumber(item['距離(km)'] ?? item.odometer ?? item['distance(km)'], 0);
                    const fuelAmount = MG.safeNumber(item['給油量(L)'] ?? item.fuelAmount ?? item['fuel_amount'], 0);
                    const price = MG.safeNumber(item['支払額(円)'] ?? item.price ?? item['amount'], 0);
                    const memo = item['メモ'] ?? item.memo ?? '';
                    return MG.normalizeFuelRecord({
                        id: crypto.randomUUID ? crypto.randomUUID() : `fuel-${Date.now()}-${Math.random()}`,
                        date,
                        odometer,
                        fuelAmount,
                        price,
                        memo
                    });
                }).filter(Boolean);

                if (!importedRecords.length) {
                    MG.showAlert('import-status', 'warning', 'インポート対象の行がありませんでした。');
                    return;
                }

                MG.appState.fuels = MG.sortFuelRecordsByDate([...MG.appState.fuels, ...importedRecords]);
                refreshFuelCalculations();
                MG.showAlert('import-status', 'success', `${importedRecords.length}件の給油データをインポートしました。`);
            } catch (error) {
                console.error('CSV import error', error);
                MG.showAlert('import-status', 'danger', 'CSVの読み込みに失敗しました。');
            }
        };

        reader.readAsText(file);
    }

    Object.assign(MG, {
        renderPartSelect,
        renderHome,
        renderFuelHistory,
        refreshFuelCalculations,
        refreshFuelFilters,
        bindFuelFilterEvents,
        getFuelRecordById,
        populateFuelForm,
        resetFuelForm,
        handleFuelDelete,
        handleFuelEdit,
        handleFuelSubmit,
        exportFuelCsv,
        importFuelCsv
    });
})();
