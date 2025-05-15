/**
 * تحسينات نظام الإشعارات
 * 
 * هذا الملف يحتوي على تحسينات لنظام الإشعارات في تطبيق إدارة الاستثمار
 * يضيف ميزات مثل: إشعارات المستثمرين المستحقين للأرباح، تصميم أفضل للإشعارات
 */

// تحديث تصميم لوحة الإشعارات
function enhanceNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;
    
    // تحديث تصميم رأس لوحة الإشعارات
    const header = panel.querySelector('.notification-header');
    if (header) {
        header.innerHTML = `
            <h2 class="notification-title">الإشعارات</h2>
            <div class="notification-actions-header">
                <button class="btn btn-sm btn-light" onclick="markAllAsRead()" title="تعيين الكل كمقروء">
                    <i class="fas fa-check-double"></i>
                </button>
                <div class="modal-close" onclick="toggleNotificationPanel()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
    }
    
    // إضافة تصفية للإشعارات
    const filterContainer = document.createElement('div');
    filterContainer.className = 'notification-filter';
    filterContainer.innerHTML = `
        <button class="btn btn-sm btn-primary active" onclick="filterNotifications('all')">الكل</button>
        <button class="btn btn-sm btn-light" onclick="filterNotifications('unread')">غير مقروءة</button>
        <button class="btn btn-sm btn-light" onclick="filterNotifications('profit')">أرباح مستحقة</button>
    `;
    
    // إضافة حاوية الإشعارات
    const listContainer = document.createElement('div');
    listContainer.className = 'notification-list-container';
    
    // نقل قائمة الإشعارات إلى الحاوية الجديدة
    const notificationList = panel.querySelector('.notification-list');
    if (notificationList) {
        listContainer.appendChild(notificationList);
    }
    
    // إضافة العناصر الجديدة إلى اللوحة
    panel.insertBefore(filterContainer, panel.querySelector('.notification-actions'));
    panel.insertBefore(listContainer, panel.querySelector('.notification-actions'));
    
    // إضافة CSS مخصص
    addCustomNotificationStyles();
}

// إضافة أنماط CSS مخصصة للإشعارات
function addCustomNotificationStyles() {
    if (document.getElementById('custom-notification-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-notification-styles';
    styleElement.textContent = `
        .notification-panel {
            width: 400px;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .notification-actions-header {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .notification-filter {
            display: flex;
            gap: 5px;
            padding: 10px 20px;
            border-bottom: 1px solid var(--gray-200);
            background-color: var(--gray-100);
        }
        
        .notification-list-container {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }
        
        .notification-list {
            max-height: none;
            overflow: visible;
            padding: 0;
        }
        
        .notification-item {
            padding: 15px 20px;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .notification-item:hover {
            background-color: var(--gray-100);
        }
        
        .notification-item.read {
            opacity: 0.7;
        }
        
        .notification-item.read .notification-icon {
            opacity: 0.5;
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
        
        .notification-icon.success {
            background-color: rgba(46, 204, 113, 0.15);
            color: var(--success-color);
        }
        
        .notification-icon.warning {
            background-color: rgba(243, 156, 18, 0.15);
            color: var(--warning-color);
        }
        
        .notification-icon.danger {
            background-color: rgba(231, 76, 60, 0.15);
            color: var(--danger-color);
        }
        
        .notification-icon.info {
            background-color: rgba(52, 152, 219, 0.15);
            color: var(--primary-color);
        }
        
        .notification-icon.profit {
            background-color: rgba(156, 39, 176, 0.15);
            color: #9c27b0;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: var(--gray-800);
        }
        
        .notification-text {
            font-size: 0.9rem;
            color: var(--gray-600);
            margin-bottom: 5px;
        }
        
        .notification-time {
            font-size: 0.75rem;
            color: var(--gray-500);
        }
        
        .notification-actions {
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid var(--gray-200);
            background-color: var(--gray-100);
        }
        
        .notification-item-actions {
            position: absolute;
            top: 15px;
            left: 20px;
            display: none;
        }
        
        .notification-item:hover .notification-item-actions {
            display: flex;
            gap: 5px;
        }
        
        .no-notifications {
            padding: 40px 20px;
            text-align: center;
            color: var(--gray-500);
        }
        
        .no-notifications i {
            font-size: 3rem;
            margin-bottom: 10px;
            opacity: 0.3;
        }
        
        /* إضافات خاصة بإشعارات الأرباح المستحقة */
        .profit-due-notification {
            border-right: 4px solid #9c27b0;
        }
        
        .profit-amount {
            font-weight: 600;
            color: #9c27b0;
        }
        
        /* مؤشر الإشعارات غير المقروءة */
        .unread-indicator {
            position: absolute;
            top: 15px;
            right: 10px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--primary-color);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// تصفية الإشعارات
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
}

// التحقق من وجود إشعارات بعد التصفية
function checkEmptyNotifications(filter) {
    const visibleItems = document.querySelectorAll('.notification-item[style=""]');
    const listContainer = document.querySelector('.notification-list-container');
    const noNotificationsMessage = document.getElementById('no-notifications-message');
    
    if (visibleItems.length === 0) {
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
            
            listContainer.appendChild(message);
        }
    } else {
        if (noNotificationsMessage) {
            noNotificationsMessage.remove();
        }
    }
}

// فحص المستثمرين المستحقين للأرباح هذا الشهر
function checkInvestorsDueProfit() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // الحصول على اليوم المحدد لتوزيع الأرباح
    const profitDistributionDay = settings.profitDistributionDay || 1;
    
    // إذا كان اليوم الحالي هو يوم توزيع الأرباح أو بعده بأسبوع (للتذكير)
    if (today.getDate() >= profitDistributionDay && today.getDate() <= profitDistributionDay + 7) {
        // حلقة على جميع المستثمرين الذين لديهم استثمارات نشطة
        investors.forEach(investor => {
            // الحصول على استثمارات المستثمر النشطة
            const activeInvestments = investments.filter(inv => 
                inv.investorId === investor.id && 
                inv.status === 'active'
            );
            
            if (activeInvestments.length === 0) return;
            
            // حساب إجمالي الأرباح المستحقة
            let totalDueProfit = 0;
            
            activeInvestments.forEach(investment => {
                // حساب الأرباح لهذا الشهر
                const investmentDate = new Date(investment.date);
                const monthsSinceInvestment = 
                    (currentYear - investmentDate.getFullYear()) * 12 + 
                    (currentMonth - investmentDate.getMonth());
                
                // تخطي الاستثمارات التي تمت في الشهر الحالي
                if (monthsSinceInvestment <= 0) return;
                
                // حساب أرباح الشهر
                const monthlyProfit = calculateMonthlyProfit(investment.amount);
                totalDueProfit += monthlyProfit;
            });
            
            // التحقق مما إذا كان المستثمر قد استلم أرباحًا لهذا الشهر
            const thisMonthStart = new Date(currentYear, currentMonth, 1);
            const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
            
            const profitPaymentsThisMonth = operations.filter(op => 
                op.investorId === investor.id && 
                op.type === 'profit' && 
                new Date(op.date) >= thisMonthStart && 
                new Date(op.date) <= thisMonthEnd
            );
            
            // إذا لم يكن هناك مدفوعات أرباح لهذا الشهر وهناك أرباح مستحقة
            if (profitPaymentsThisMonth.length === 0 && totalDueProfit > 0) {
                // التحقق مما إذا كان الإشعار موجودًا بالفعل
                const existingNotification = notifications.find(n => 
                    n.entityId === investor.id && 
                    n.entityType === 'profit-due' && 
                    n.month === currentMonth && 
                    n.year === currentYear
                );
                
                if (!existingNotification) {
                    // إنشاء إشعار جديد
                    const notification = {
                        id: generateId(),
                        title: `أرباح مستحقة: ${investor.name}`,
                        message: `أرباح شهرية مستحقة بقيمة ${formatCurrency(totalDueProfit.toFixed(2))}`,
                        type: 'profit',
                        entityId: investor.id,
                        entityType: 'profit-due',
                        month: currentMonth,
                        year: currentYear,
                        amount: totalDueProfit,
                        date: new Date().toISOString(),
                        read: false
                    };
                    
                    // إضافة الإشعار إلى القائمة
                    notifications.unshift(notification);
                    
                    // حذف الإشعارات القديمة إذا تجاوز العدد 100
                    if (notifications.length > 100) {
                        notifications = notifications.slice(0, 100);
                    }
                    
                    // حفظ الإشعارات
                    saveNotifications();
                    
                    // تحديث شارة الإشعارات
                    updateNotificationBadge();
                }
            }
        });
    }
}

// تحديث تحميل الإشعارات
function enhancedLoadNotifications() {
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
}

// فتح نافذة دفع الأرباح من إشعار
window.openPayProfitModalFromNotification = function(investorId, notificationId) {
    // تعيين الإشعار كمقروء
    markNotificationAsRead(notificationId);
    
    // إغلاق لوحة الإشعارات
    toggleNotificationPanel();
    
    // فتح نافذة دفع الأرباح
    openPayProfitModal(investorId);
}

// تحديث توقيت لظهور إشعارات الأرباح المستحقة
function scheduleProfitDueCheck() {
    // التحقق عند تحميل الصفحة
    checkInvestorsDueProfit();
    
    // جدولة التحقق يوميًا
    setInterval(checkInvestorsDueProfit, 24 * 60 * 60 * 1000);
}

// تهيئة تحسينات الإشعارات
function initNotificationEnhancements() {
    // تحسين لوحة الإشعارات
    enhanceNotificationPanel();
    
    // استبدال وظيفة تحميل الإشعارات الأصلية
    window.originalLoadNotifications = window.loadNotifications;
    window.loadNotifications = enhancedLoadNotifications;
    
    // جدولة التحقق من المستثمرين المستحقين للأرباح
    scheduleProfitDueCheck();
    
    console.log('تم تهيئة تحسينات الإشعارات بنجاح');
}

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل العناصر الأخرى
    setTimeout(initNotificationEnhancements, 1000);
});