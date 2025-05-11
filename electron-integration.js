const { ipcRenderer } = require('electron');

// معالجة أزرار شريط العنوان
document.getElementById('minimizeButton').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

document.getElementById('maximizeButton').addEventListener('click', () => {
    ipcRenderer.send('maximize-window');
});

document.getElementById('closeButton').addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

// معالجة زر التحديث
document.getElementById('refreshButton').addEventListener('click', () => {
    const btn = document.getElementById('refreshButton');
    btn.classList.add('spinning');
    ipcRenderer.send('reload-app');
    
    setTimeout(() => {
        btn.classList.remove('spinning');
    }, 1000);
});

// تحديث الساعة
function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}

// بدء تحديث الساعة
setInterval(updateClock, 1000);
updateClock();

// تحديث سعر الصرف
async function updateExchangeRate() {
    try {
        const rate = await ipcRenderer.invoke('get-exchange-rate');
        const rateElement = document.getElementById('exchangeRateValue');
        rateElement.textContent = `1$ = ${rate} IQD`;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        document.getElementById('exchangeRateValue').textContent = '1$ = 1460 IQD';
    }
}

// بدء تحديث سعر الصرف
updateExchangeRate();
// تحديث كل 30 دقيقة
setInterval(updateExchangeRate, 30 * 60 * 1000);

// إضافة اختصارات لوحة المفاتيح
document.addEventListener('keydown', (e) => {
    // F5 لإعادة التحميل
    if (e.key === 'F5') {
        ipcRenderer.send('reload-app');
    }
    
    // Ctrl+R لإعادة التحميل
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        ipcRenderer.send('reload-app');
    }
});