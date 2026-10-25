(function () {
    const MG = window.MaintenanceGarage = window.MaintenanceGarage || {};

    function setActiveScreen(targetScreen) {
        const normalized = (targetScreen || 'home').toString().trim();
        const screenKey = normalized.endsWith('-screen') ? normalized : `${normalized}-screen`;

        document.querySelectorAll('.screen').forEach((screen) => {
            const isActive = screen.id === screenKey;
            screen.classList.toggle('active', isActive);
            screen.style.display = isActive ? 'block' : 'none';
            screen.hidden = !isActive;
            screen.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        document.querySelectorAll('.nav-button').forEach((button) => {
            const buttonScreen = (button.dataset.screen || button.getAttribute('data-screen') || '').toString();
            const isActive = buttonScreen === normalized || buttonScreen === screenKey;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        MG.activeScreen = normalized;
    }

    function showAlert(targetId, type, message) {
        const alertBox = document.getElementById(targetId);
        if (!alertBox) return;

        alertBox.className = `alert ${type}`;
        alertBox.textContent = message;
        alertBox.hidden = false;
    }

    function hideAlert(targetId) {
        const alertBox = document.getElementById(targetId);
        if (!alertBox) return;

        alertBox.hidden = true;
        alertBox.textContent = '';
    }

    Object.assign(MG, { showAlert, hideAlert, setActiveScreen });
})();
