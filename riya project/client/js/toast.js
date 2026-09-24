// Toast Notification System

function showToast({ title, message, type = 'info', duration = 4000 }) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);

    return toast;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Toast shortcuts
function showSuccess(message, title = 'Success') {
    return showToast({ title, message, type: 'success' });
}

function showError(message, title = 'Error') {
    return showToast({ title, message, type: 'error', duration: 5000 });
}

function showWarning(message, title = 'Warning') {
    return showToast({ title, message, type: 'warning' });
}

function showInfo(message, title = 'Info') {
    return showToast({ title, message, type: 'info' });
}

// Export
window.toast = {
    show: showToast,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
};