(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function safeNumber(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function formatNumber(value, digits = 0) {
        if (!Number.isFinite(value)) {
            return '-';
        }

        return new Intl.NumberFormat('ja-JP', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(value);
    }

    function formatCurrency(value) {
        if (!Number.isFinite(value)) {
            return '-';
        }

        return `${new Intl.NumberFormat('ja-JP').format(value)} 円`;
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    }

    function getTodayString() {
        return new Date().toISOString().slice(0, 10);
    }

    function toIsoDate(input) {
        if (!input) {
            return '';
        }

        const value = String(input).trim();
        if (!value) {
            return '';
        }

        const normalized = value.replace(/\//g, '-');
        const date = new Date(normalized);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatCsvDate(value) {
        const iso = toIsoDate(value);
        if (!iso) {
            return '';
        }

        const date = new Date(`${iso}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}/${month}/${day}`;
    }

    function normalizeFuelRecord(rawRecord) {
        if (!rawRecord || typeof rawRecord !== 'object') {
            return null;
        }

        const record = {
            id: rawRecord.id || (crypto.randomUUID ? crypto.randomUUID() : `fuel-${Date.now()}-${Math.random()}`),
            date: toIsoDate(rawRecord.date || rawRecord['日付'] || rawRecord['年月日'] || ''),
            odometer: safeNumber(rawRecord.odometer ?? rawRecord['距離(km)'] ?? rawRecord.distance ?? rawRecord.km, 0),
            fuelAmount: safeNumber(rawRecord.fuelAmount ?? rawRecord['給油量(L)'] ?? rawRecord.amount ?? rawRecord.liters, 0),
            price: safeNumber(rawRecord.price ?? rawRecord['支払額(円)'] ?? rawRecord.cost ?? rawRecord.amountPrice, 0),
            memo: rawRecord.memo ?? rawRecord['メモ'] ?? ''
        };

        if (!record.date || record.odometer <= 0 || record.fuelAmount <= 0) {
            return null;
        }

        return record;
    }

    function normalizeFuelRecords(records) {
        if (!Array.isArray(records)) {
            return [];
        }

        return records
            .map((record) => normalizeFuelRecord(record))
            .filter(Boolean)
            .sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`));
    }

    function sortFuelRecordsByDate(records) {
        return [...records].sort((a, b) => {
            const dateA = new Date(`${a.date}T00:00:00`).getTime();
            const dateB = new Date(`${b.date}T00:00:00`).getTime();
            return dateB - dateA;
        });
    }

    function sortMaintenanceRecordsByDate(records) {
        return [...records].sort((a, b) => {
            const dateA = new Date(`${a.date}T00:00:00`).getTime();
            const dateB = new Date(`${b.date}T00:00:00`).getTime();
            return dateB - dateA;
        });
    }

    function formatDateTime(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function parseCsvText(csvText) {
        const normalizedText = String(csvText || '').replace(/^\uFEFF/, '');
        const rows = normalizedText.trim().split(/\r?\n/).filter(Boolean);
        if (rows.length < 2) {
            return [];
        }

        const headers = rows[0]
            .split(',')
            .map((header) => header.trim().replace(/^\uFEFF/, '').replace(/^"|"$/g, ''));

        return rows.slice(1).map((line) => {
            const values = line.match(/(?:"[^"]*(?:""[^"]*)*"|[^,]+)/g) || [];
            const obj = {};
            headers.forEach((header, index) => {
                const rawValue = values[index] ?? '';
                const value = rawValue.replace(/^"|"$/g, '').replace(/""/g, '"');
                obj[header] = value;
            });
            return obj;
        });
    }

    function generateCsv(rows, headers) {
        const lines = [headers.join(',')];
        rows.forEach((row) => {
            const values = headers.map((header) => {
                const value = row[header] ?? '';
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            lines.push(values.join(','));
        });
        return lines.join('\n');
    }

    function downloadCsv(filename, csvText) {
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    Object.assign(MG, {
        safeNumber,
        formatNumber,
        formatCurrency,
        formatDate,
        getTodayString,
        toIsoDate,
        formatCsvDate,
        normalizeFuelRecord,
        normalizeFuelRecords,
        sortFuelRecordsByDate,
        sortMaintenanceRecordsByDate,
        formatDateTime,
        parseCsvText,
        generateCsv,
        downloadCsv
    });
})();
