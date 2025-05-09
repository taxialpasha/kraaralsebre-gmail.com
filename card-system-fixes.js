// card-system-fixes.js
// إصلاح مشاكل توفر دوال نظام البطاقات في النطاق العالمي

// التأكد من توفر الدوال في النطاق العالمي
window.openCreateCardModal = function() {
    if (window.investorCardSystem && typeof window.investorCardSystem.openCreateCardModal === 'function') {
        window.investorCardSystem.openCreateCardModal();
    } else {
        console.warn('نظام البطاقات غير مهيأ بعد، محاولة تحميله...');
        // محاولة تهيئة النظام
        if (typeof initInvestorCardSystem === 'function') {
            initInvestorCardSystem();
            // المحاولة مرة أخرى
            if (window.investorCardSystem && typeof window.investorCardSystem.openCreateCardModal === 'function') {
                window.investorCardSystem.openCreateCardModal();
            }
        }
    }
};

window.switchCardsTab = function(tabId) {
    if (window.investorCardSystem && typeof window.investorCardSystem.switchCardsTab === 'function') {
        window.investorCardSystem.switchCardsTab(tabId);
    } else {
        console.warn('نظام البطاقات غير مهيأ بعد');
    }
};

window.scanBarcode = function() {
    if (window.investorCardSystem && typeof window.investorCardSystem.scanBarcode === 'function') {
        window.investorCardSystem.scanBarcode();
    } else {
        console.warn('نظام البطاقات غير مهيأ بعد');
    }
};

window.searchInvestorCards = function() {
    if (window.investorCardSystem && typeof window.investorCardSystem.searchInvestorCards === 'function') {
        window.investorCardSystem.searchInvestorCards();
    } else {
        console.warn('نظام البطاقات غير مهيأ بعد');
    }
};

window.createInvestorCard = function() {
    if (window.investorCardSystem && typeof window.investorCardSystem.createCard === 'function') {
        window.investorCardSystem.createCard();
    } else {
        console.warn('نظام البطاقات غير مهيأ بعد');
    }
};

// التأكد من تهيئة النظام عند تحميل الصفحة
window.addEventListener('load', function() {
    // التأكد من تحميل جميع المكتبات المطلوبة
    if (typeof initInvestorCardSystem === 'function') {
        console.log('تهيئة نظام البطاقات عند تحميل الصفحة');
        initInvestorCardSystem();
    } else {
        console.error('دالة initInvestorCardSystem غير موجودة');
    }
});

// إضافة مستمع أحداث لتهيئة النظام في حال لم يتم تهيئته
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (!window.investorCardSystem || !window.investorCardSystem.initialized) {
            console.log('النظام غير مهيأ، محاولة التهيئة...');
            if (typeof initInvestorCardSystem === 'function') {
                initInvestorCardSystem();
            }
        }
    }, 1000); // انتظار ثانية واحدة للتأكد من تحميل جميع الملفات
});