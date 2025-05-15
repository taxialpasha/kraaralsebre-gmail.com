/**
 * نظام الإشعارات المحسن - ملف التكامل والتجربة
 * 
 * هذا الملف يقوم بدمج كافة تحسينات نظام الإشعارات في تطبيق إدارة الاستثمار
 */

// ترتيب تحميل الملفات والتهيئة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل تصميم الإشعارات المحسن
    loadEnhancedNotificationStyles();
    
    // تهيئة تحسينات الإشعارات الرئيسية بعد تأخير بسيط
    setTimeout(initAllNotificationEnhancements, 500);
});

// تحميل تصميم الإشعارات المحسن
function loadEnhancedNotificationStyles() {
    if (document.getElementById('enhanced-notification-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'enhanced-notification-styles';
    
    // هنا يتم إضافة محتوى ملف CSS الخاص بالإشعارات
    // تم تضمينه في ملف notification-styles.css المنفصل
    
    document.head.appendChild(styleElement);
    
    console.log('تم تحميل تصميم الإشعارات المحسن');
}

// تهيئة جميع تحسينات الإشعارات
function initAllNotificationEnhancements() {
    // التحقق من وجود وظائف التحسين
    if (typeof enhanceNotificationPanel === 'function' && 
        typeof enhanceToastNotifications === 'function') {
        
        // تهيئة تحسينات لوحة الإشعارات
        enhanceNotificationPanel();
        
        // تهيئة تحسينات الإشعارات المنبثقة
        enhanceToastNotifications();
        
        // استبدال الوظائف الأصلية بالوظائف المحسنة
        replaceOriginalFunctions();
        
        // جدولة فحص الأرباح المستحقة
        scheduleEnhancedProfitCheck();
        
        // تنفيذ فحص أولي للأرباح المستحقة
        setTimeout(runInitialProfitCheck, 2000);
        
        console.log('تم تهيئة جميع تحسينات الإشعارات بنجاح');
    } else {
        console.error('لم يتم العثور على وظائف تحسين الإشعارات! تأكد من تحميل الملفات الضرورية.');
    }
}

// استبدال الوظائف الأصلية بالوظائف المحسنة
function replaceOriginalFunctions() {
    // حفظ مراجع للوظائف الأصلية
    if (!window.originalFunctions) {
        window.originalFunctions = {
            loadNotifications: window.loadNotifications,
            showNotificationToast: window.showNotificationToast,
            checkInvestorsDueProfit: window.checkInvestorsDueProfit
        };
    }
    
    // استبدال وظيفة تحميل الإشعارات
    window.loadNotifications = enhancedLoadNotifications;
    
    // استبدال وظيفة عرض الإشعارات المنبثقة
    window.showNotificationToast = enhancedShowNotificationToast;
    
    // استبدال وظيفة فحص المستثمرين المستحقين للأرباح
    window.checkInvestorsDueProfit = enhancedCheckInvestorsDueProfit;
    
    // إضافة وظيفة فتح نافذة دفع الأرباح من الإشعار
    if (!window.openPayProfitModalFromNotification) {
        window.openPayProfitModalFromNotification = function(investorId, notificationId) {
            // تعيين الإشعار كمقروء
            markNotificationAsRead(notificationId);
            
            // إغلاق لوحة الإشعارات
            toggleNotificationPanel();
            
            // فتح نافذة دفع الأرباح
            openPayProfitModal(investorId);
        };
    }
    
    // إضافة وظيفة تصفية الإشعارات
    if (!window.filterNotifications) {
        window.filterNotifications = function(filter) {
            // تحديث حالة الأزرار
            const buttons = document.querySelectorAll('.notification-filter button');
            buttons.forEach(btn => {
                btn.className = 'btn btn-sm btn-light';
            });
            
            const activeButton = document.querySelector(`.notification-filter button[onclick="filterNotifications('${filter}')"]`);
            if (activeButton) {
                activeButton.className = 'btn btn-sm btn-primary active';
            }
            
            // تصفية الإشعارات
            const items = document.querySelectorAll('.notification-item');
            
            items.forEach(item => {
                if (filter === 'all') {
                    item.style.display = '';
                } else if (filter === 'unread') {
                    item.style.display = item.classList.contains('read') ? 'none' : '';
                } else if (filter === 'profit') {
                    item.style.display = item.classList.contains('profit-due-notification') ? '' : 'none';
                }
            });
            
            // إظهار رسالة "لا توجد إشعارات" إذا لم تكن هناك إشعارات مرئية
            checkEmptyNotifications(filter);
        };
    }
    
    // إضافة وظيفة التحقق من الإشعارات الفارغة
    if (!window.checkEmptyNotifications) {
        window.checkEmptyNotifications = function(filter) {
            const visibleItems = Array.from(document.querySelectorAll('.notification-item')).filter(item => 
                item.style.display !== 'none'
            );
            
            const notificationList = document.querySelector('.notification-list');
            const noNotificationsMessage = document.getElementById('no-notifications-message');
            
            if (visibleItems.length === 0 && notificationList) {
                if (!noNotificationsMessage) {
                    const message = document.createElement('div');
                    message.id = 'no-notifications-message';
                    message.className = 'no-notifications';
                    
                    let messageText;
                    if (filter === 'all') {
                        messageText = 'لا توجد إشعارات';
                    } else if (filter === 'unread') {
                        messageText = 'لا توجد إشعارات غير مقروءة';
                    } else if (filter === 'profit') {
                        messageText = 'لا توجد إشعارات أرباح مستحقة';
                    }
                    
                    message.innerHTML = `
                        <i class="fas fa-bell-slash"></i>
                        <p>${messageText}</p>
                    `;
                    
                    notificationList.appendChild(message);
                }
            } else {
                if (noNotificationsMessage) {
                    noNotificationsMessage.remove();
                }
            }
        };
    }
}

// جدولة فحص محسن للأرباح المستحقة
function scheduleEnhancedProfitCheck() {
    // التحقق كل ساعة
    setInterval(() => {
        if (typeof enhancedCheckInvestorsDueProfit === 'function') {
            enhancedCheckInvestorsDueProfit();
            showDueProfitToasts();
        }
    }, 60 * 60 * 1000);
}

// تنفيذ فحص أولي للأرباح المستحقة
function runInitialProfitCheck() {
    if (typeof enhancedCheckInvestorsDueProfit === 'function') {
        enhancedCheckInvestorsDueProfit();
        
        // عرض إشعارات منبثقة للأرباح المستحقة
        if (typeof showDueProfitToasts === 'function') {
            showDueProfitToasts();
        }
    }
}

// وظيفة إضافية لإنشاء إشعارات تجريبية
window.createTestNotifications = function() {
    // إنشاء مستثمرين تجريبيين إذا لم يكن هناك مستثمرين
    if (investors.length === 0) {
        const testInvestor1 = {
            id: 'test-investor-1',
            name: 'أحمد المستثمر',
            phone: '07701234567',
            address: 'بغداد، العراق',
            joinDate: new Date().toISOString()
        };
        
        const testInvestor2 = {
            id: 'test-investor-2',
            name: 'محمد المستثمر',
            phone: '07709876543',
            address: 'البصرة، العراق',
            joinDate: new Date().toISOString()
        };
        
        investors.push(testInvestor1, testInvestor2);
    }
    
    // إنشاء عدة أنواع من الإشعارات للاختبار
    
    // إشعار نجاح
    createNotification(
        'تمت الإضافة بنجاح',
        'تم إضافة مستثمر جديد إلى النظام',
        'success'
    );
    
    // إشعار تحذير
    createNotification(
        'تنبيه هام',
        'هناك عملية سحب معلقة تحتاج للمراجعة',
        'warning'
    );
    
    // إشعار خطأ
    createNotification(
        'حدث خطأ',
        'فشلت عملية المزامنة مع الخادم',
        'danger'
    );
    
    // إشعار معلومات
    createNotification(
        'تحديث النظام',
        'تم تحديث النظام إلى الإصدار الجديد',
        'info'
    );
    
    // إشعارات أرباح مستحقة
    investors.forEach((investor, index) => {
        const testAmount = 5000000 + (index * 1000000);
        
        // إنشاء إشعار أرباح مستحقة
        const notification = {
            id: generateId(),
            title: `أرباح مستحقة: ${investor.name}`,
            message: `أرباح شهرية مستحقة بقيمة <span class="profit-amount">${formatCurrency(testAmount)}</span>`,
            type: 'profit',
            entityId: investor.id,
            entityType: 'profit-due',
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            amount: testAmount,
            date: new Date().toISOString(),
            read: false
        };
        
        // إضافة الإشعار إلى القائمة
        notifications.unshift(notification);
    });
    
    // الاحتفاظ بأحدث 100 إشعار فقط
    if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
    }
    
    // حفظ الإشعارات
    saveNotifications();
    
    // تحديث شارة الإشعارات
    updateNotificationBadge();
    
    // إعادة تحميل الإشعارات إذا كانت لوحة الإشعارات مفتوحة
    const panel = document.getElementById('notificationPanel');
    if (panel && panel.classList.contains('active')) {
        loadNotifications();
    }
    
    // عرض إشعار منبثق
    createNotification(
        'تم إنشاء إشعارات تجريبية',
        'تم إنشاء مجموعة من الإشعارات التجريبية لاختبار النظام',
        'success'
    );
};

// تصدير وظائف محسنة للنظام
window.notificationEnhancements = {
    checkDueProfits: enhancedCheckInvestorsDueProfit,
    showDueProfitToasts: showDueProfitToasts,
    createTestNotifications: window.createTestNotifications
};

// رسالة ترحيبية
console.log('تم تحميل نظام الإشعارات المحسن بنجاح!');
console.log('يمكنك استخدام الأمر التالي لإنشاء إشعارات تجريبية:');
console.log('createTestNotifications()');