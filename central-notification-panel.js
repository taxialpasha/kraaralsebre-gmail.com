/**
 * تحديث نافذة الإشعارات المركزية
 * 
 * هذا الملف يقوم بتحديث نافذة الإشعارات لتظهر في وسط التطبيق بدلاً من الجانب
 */

// تطبيق التصميم المركزي لنافذة الإشعارات
function applyCentralNotificationPanel() {
    // التحقق من وجود لوحة الإشعارات
    const existingPanel = document.getElementById('notificationPanel');
    if (!existingPanel) {
        console.error('لم يتم العثور على لوحة الإشعارات!');
        return;
    }
    
    // إزالة لوحة الإشعارات الحالية
    existingPanel.remove();
    
    // إنشاء خلفية شفافة للنافذة
    const overlay = document.createElement('div');
    overlay.id = 'notificationOverlay';
    overlay.className = 'notification-overlay';
    
    // إنشاء لوحة الإشعارات الجديدة
    const panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'notification-panel central';
    
    // إنشاء محتوى لوحة الإشعارات
    panel.innerHTML = `
        <div class="notification-header">
            <h2 class="notification-title">الإشعارات</h2>
            <div class="notification-actions-header">
                <button class="btn btn-sm btn-light" onclick="markAllAsRead()" title="تعيين الكل كمقروء">
                    <i class="fas fa-check-double"></i>
                </button>
                <div class="modal-close" onclick="toggleNotificationPanel()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>
        
        <div class="notification-filter">
            <button class="btn btn-sm btn-primary active" onclick="filterNotifications('all')">الكل</button>
            <button class="btn btn-sm btn-light" onclick="filterNotifications('unread')">غير مقروءة</button>
            <button class="btn btn-sm btn-light" onclick="filterNotifications('profit')">الأرباح</button>
            <button class="btn btn-sm btn-light" onclick="filterNotifications('accumulated')">متراكمة</button>
        </div>
        
        <div class="notification-list-container">
            <div class="notification-list" id="notificationList">
                <!-- سيتم ملء هذا القسم بواسطة JavaScript -->
            </div>
        </div>
        
        <div class="notification-actions">
            <button class="btn btn-light" onclick="markAllAsRead()">
                <i class="fas fa-check-double"></i> تعيين الكل كمقروء
            </button>
        </div>
    `;
    
    // إضافة لوحة الإشعارات إلى الخلفية الشفافة
    overlay.appendChild(panel);
    
    // إضافة الخلفية الشفافة إلى الصفحة
    document.body.appendChild(overlay);
    
    // إضافة نمط CSS مخصص للوحة الإشعارات المركزية
    addCentralNotificationStyles();
    
    // تحديث وظيفة toggleNotificationPanel
    updateToggleNotificationFunction();
    
    // تحديث وظيفة تصفية الإشعارات
    updateFilterNotificationsFunction();
    
    console.log('تم تطبيق التصميم المركزي للوحة الإشعارات');
}

// إضافة أنماط CSS مخصصة للوحة الإشعارات المركزية
function addCentralNotificationStyles() {
    if (document.getElementById('central-notification-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'central-notification-styles';
    styleElement.textContent = `
        /* خلفية شفافة للنافذة */
        .notification-overlay {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .notification-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        /* لوحة الإشعارات المركزية */
        .notification-panel.central {
            position: relative;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            height: auto;
            margin: 0 auto;
            right: auto;
            top: auto;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            overflow: hidden;
            background-color: white;
            display: flex;
            flex-direction: column;
        }
        
        .notification-overlay.active .notification-panel.central {
            transform: translateY(0);
        }
        
        /* تعديل عناصر لوحة الإشعارات */
        .notification-header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 12px 12px 0 0;
        }
        
        .notification-title {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .notification-filter {
            display: flex;
            gap: 5px;
            padding: 10px 20px;
            background-color: var(--gray-100);
        }
        
        .notification-filter button {
            flex: 1;
        }
        
        .notification-list-container {
            flex: 1;
            overflow-y: auto;
            max-height: 60vh;
        }
        
        .notification-list {
            padding: 0;
        }
        
        .notification-item {
            padding: 15px 20px;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            position: relative;
            transition: background-color 0.2s ease;
        }
        
        .notification-item:hover {
            background-color: var(--gray-100);
        }
        
        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 15px;
            flex-shrink: 0;
        }
        
        .notification-icon.profit {
            background-color: rgba(156, 39, 176, 0.15);
            color: #9c27b0;
        }
        
        .notification-icon.accumulated-profit {
            background-color: rgba(255, 152, 0, 0.15);
            color: #ff9800;
        }
        
        .profit-due-notification {
            border-right: 4px solid #9c27b0;
        }
        
        .accumulated-profit-notification {
            border-right: 4px solid #ff9800;
        }
        
        .notification-actions {
            padding: 10px 20px;
            display: flex;
            justify-content: flex-end;
            border-top: 1px solid var(--gray-200);
            background-color: var(--gray-100);
            border-radius: 0 0 12px 12px;
        }
        
        /* انيميشن لعرض النافذة */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
        
        /* زر إغلاق النافذة */
        .notification-header .modal-close {
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            transition: background-color 0.2s ease;
        }
        
        .notification-header .modal-close:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        /* تعديلات ألوان الإشعارات */
        .notification-icon.accumulated-profit i {
            color: #ff9800;
        }
        
        .profit-amount {
            font-weight: 600;
            color: #9c27b0;
        }
        
        .accumulated-amount {
            font-weight: 600;
            color: #ff9800;
        }
        
        /* تعديلات للجوال */
        @media screen and (max-width: 600px) {
            .notification-panel.central {
                width: 95%;
                max-height: 85vh;
            }
            
            .notification-filter {
                overflow-x: auto;
                padding: 10px 15px;
            }
            
            .notification-filter button {
                flex: 0 0 auto;
                min-width: 80px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// تحديث وظيفة toggleNotificationPanel
function updateToggleNotificationFunction() {
    window.originalToggleNotificationPanel = window.toggleNotificationPanel;
    
    window.toggleNotificationPanel = function() {
        const overlay = document.getElementById('notificationOverlay');
        
        if (!overlay) return;
        
        if (overlay.classList.contains('active')) {
            // إغلاق النافذة
            overlay.classList.remove('active');
        } else {
            // فتح النافذة وتحميل الإشعارات
            overlay.classList.add('active');
            loadNotifications();
        }
    };
}

// تحديث وظيفة تصفية الإشعارات
function updateFilterNotificationsFunction() {
    window.originalFilterNotifications = window.filterNotifications;
    
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
            } else if (filter === 'accumulated') {
                item.style.display = item.classList.contains('accumulated-profit-notification') ? '' : 'none';
            }
        });
        
        // إظهار رسالة "لا توجد إشعارات" إذا لم تكن هناك إشعارات مرئية
        checkEmptyNotifications(filter);
    };
}

// تحديث وظيفة تحميل الإشعارات لتدعم الأرباح المتراكمة
function updateLoadNotificationsFunction() {
    window.originalEnhancedLoadNotifications = window.enhancedLoadNotifications;
    
    window.enhancedLoadNotifications = function() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;
        
        notificationList.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }
        
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? 'read' : ''}`;
            
            // إضافة فئة خاصة للإشعارات المتعلقة بالأرباح المستحقة
            if (notification.entityType === 'profit-due') {
                item.classList.add('profit-due-notification');
            }
            
            // إضافة فئة خاصة للإشعارات المتعلقة بالأرباح المتراكمة
            if (notification.entityType === 'accumulated-profit') {
                item.classList.add('accumulated-profit-notification');
            }
            
            // إنشاء أيقونة مناسبة حسب نوع الإشعار
            let icon;
            if (notification.type === 'success') {
                icon = 'check-circle';
            } else if (notification.type === 'danger') {
                icon = 'exclamation-circle';
            } else if (notification.type === 'warning') {
                icon = 'exclamation-triangle';
            } else if (notification.type === 'profit') {
                icon = 'hand-holding-usd';
            } else if (notification.type === 'accumulated-profit') {
                icon = 'coins';
            } else {
                icon = 'info-circle';
            }
            
            item.innerHTML = `
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.message}</div>
                    <div class="notification-time">${formatDate(notification.date)} ${formatTime(notification.date)}</div>
                </div>
                <div class="notification-item-actions">
                    ${!notification.read ? `
                        <button class="btn btn-sm btn-light" onclick="markNotificationAsRead('${notification.id}')" title="تعيين كمقروء">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${notification.entityType === 'profit-due' ? `
                        <button class="btn btn-sm btn-success" onclick="openPayProfitModalFromNotification('${notification.entityId}', '${notification.id}')" title="دفع الأرباح">
                            <i class="fas fa-money-bill"></i>
                        </button>
                    ` : ''}
                    ${notification.entityType === 'accumulated-profit' ? `
                        <button class="btn btn-sm btn-warning" onclick="openAccumulatedProfitModalFromNotification('${notification.entityId}', '${notification.id}')" title="دفع الأرباح المتراكمة">
                            <i class="fas fa-coins"></i>
                        </button>
                    ` : ''}
                    ${notification.entityId ? `
                        <button class="btn btn-sm btn-info" onclick="viewNotificationEntity('${notification.entityId}', '${notification.entityType}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            notificationList.appendChild(item);
        });
        
        // تطبيق التصفية الحالية
        const activeFilter = document.querySelector('.notification-filter button.active');
        if (activeFilter) {
            const filter = activeFilter.getAttribute('onclick').match(/'([^']+)'/)[1];
            window.filterNotifications(filter);
        } else {
            window.filterNotifications('all');
        }
    };
    
    // استبدال الوظيفة
    window.enhancedLoadNotifications = window.enhancedLoadNotifications;
}

// تطبيق التعديلات على النظام
function initCentralNotificationPanel() {
    // تطبيق النافذة المركزية
    applyCentralNotificationPanel();
    
    // تحديث وظيفة تحميل الإشعارات
    updateLoadNotificationsFunction();
    
    // تنفيذ فحص أولي للأرباح المستحقة والمتراكمة
    if (typeof window.enhancedCheckInvestorsDueProfit === 'function') {
        setTimeout(window.enhancedCheckInvestorsDueProfit, 2000);
    }
}

// الكشف عن الوظائف للنظام
window.centralNotificationFeatures = {
    initCentralNotificationPanel: initCentralNotificationPanel,
    applyCentralNotificationPanel: applyCentralNotificationPanel
};

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل العناصر الأخرى
    setTimeout(initCentralNotificationPanel, 1000);
});

console.log("تم تحميل تحسينات نافذة الإشعارات المركزية");