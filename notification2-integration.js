/**
 * تحسينات نظام الإشعارات وعرض التفاصيل
 * 
 * هذا الملف يضيف تحسينات لعرض تفاصيل المستثمر عند النقر على زر "عرض التفاصيل"
 * وإضافة أزرار "دفع الأرباح" لجميع الإشعارات المتعلقة بالأرباح
 */

// تحسين وظيفة عرض الكيان المتعلق بالإشعار
window.originalViewNotificationEntity = window.viewNotificationEntity;

window.viewNotificationEntity = function(entityId, entityType) {
    // إذا كان الكيان هو مستثمر أو نوع مرتبط بالأرباح
    if (entityType === 'investor' || entityType === 'profit-due' || entityType === 'accumulated-profit') {
        // الحصول على معرف المستثمر
        let investorId = entityId;
        
        // إذا كان النوع هو ربح مستحق أو ربح متراكم، فهذا يعني أن entityId هو بالفعل معرف المستثمر
        
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        
        if (investor) {
            // عرض تفاصيل المستثمر
            viewInvestor(investorId);
            
            // إغلاق لوحة الإشعارات
            toggleNotificationPanel();
            
            // إذا كان النوع متعلق بالأرباح، انتقل إلى علامة تبويب الأرباح
            if (entityType === 'profit-due' || entityType === 'accumulated-profit') {
                setTimeout(() => {
                    switchModalTab('investorProfits', 'viewInvestorModal');
                }, 300);
            }
            
            return;
        }
    }
    
    // إذا لم يكن مستثمر أو ربح، استخدم الوظيفة الأصلية
    if (window.originalViewNotificationEntity) {
        window.originalViewNotificationEntity(entityId, entityType);
    } else {
        // تنفيذ سلوك افتراضي إذا لم تكن الوظيفة الأصلية موجودة
        switch (entityType) {
            case 'investment':
                viewInvestment(entityId);
                break;
            case 'operation':
                viewOperation(entityId);
                break;
            case 'event':
                viewEvent(entityId);
                break;
        }
    }
};

// تحسين وظيفة تحميل الإشعارات لإضافة زر دفع الأرباح لجميع الإشعارات
window.originalLoadNotifications = window.loadNotifications;

window.loadNotifications = function() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-item">
                <div class="notification-content">
                    <div class="notification-title">لا توجد إشعارات</div>
                    <div class="notification-text">لا توجد إشعارات حالياً.</div>
                </div>
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
        
        item.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${
                    notification.type === 'success' ? 'check-circle' : 
                    notification.type === 'danger' ? 'exclamation-circle' :
                    notification.type === 'warning' ? 'exclamation-triangle' :
                    notification.type === 'profit' ? 'hand-holding-usd' :
                    notification.type === 'accumulated-profit' ? 'coins' :
                    'info-circle'
                }"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-text">${notification.message}</div>
                <div class="notification-time">${formatDate(notification.date)} ${formatTime(notification.date)}</div>
            </div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="btn btn-sm btn-light" onclick="markNotificationAsRead('${notification.id}')" title="تعيين كمقروء">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                ${notification.entityId ? `
                    <button class="btn btn-sm btn-info" onclick="viewNotificationEntity('${notification.entityId}', '${notification.entityType}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                ` : ''}
                ${notification.entityType === 'profit-due' || notification.entityType === 'accumulated-profit' ? `
                    <button class="btn btn-sm btn-success" onclick="openPayProfitModalFromNotification('${notification.entityId}', '${notification.id}')" title="دفع الأرباح">
                        <i class="fas fa-money-bill"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        notificationList.appendChild(item);
    });
};

// تعديل وظيفة فتح نافذة دفع الأرباح من الإشعار
window.openPayProfitModalFromNotification = function(investorId, notificationId) {
    // تعيين الإشعار كمقروء
    markNotificationAsRead(notificationId);
    
    // إغلاق لوحة الإشعارات
    toggleNotificationPanel();
    
    // العثور على الإشعار
    const notification = notifications.find(n => n.id === notificationId);
    
    // فتح نافذة دفع الأرباح
    if (notification && notification.entityType === 'accumulated-profit' && notification.amount) {
        // استخدام الوظيفة المحسنة مع المبلغ وعدد الشهور
        openPayProfitModal(investorId, notification.amount, true, notification.unpaidMonths || 0);
    } else {
        // استخدام الوظيفة الأصلية مع المبلغ إذا كان موجودًا
        openPayProfitModal(investorId, notification.amount || 0);
    }
};

// تحسين وظيفة فحص الأرباح المستحقة لإضافة معلومات إضافية في الإشعارات
function enhancedCreateDueProfitNotification(investor, amount, month, year, periodText) {
    const notification = {
        id: generateId(),
        title: `أرباح مستحقة: ${investor.name}`,
        message: `أرباح مستحقة لـ${periodText} بقيمة <span class="profit-amount">${formatCurrency(amount.toFixed(2))}</span>`,
        type: 'profit',
        entityId: investor.id,
        entityType: 'profit-due',
        month: month,
        year: year,
        amount: amount,
        date: new Date().toISOString(),
        read: false
    };
    
    // إضافة الإشعار إلى القائمة
    notifications.unshift(notification);
    
    // الاحتفاظ بأحدث 100 إشعار فقط
    if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
    }
    
    // حفظ الإشعارات
    saveNotifications();
    
    // تحديث شارة الإشعارات
    updateNotificationBadge();
    
    return notification;
}

// تحسين وظيفة إنشاء إشعار الأرباح المتراكمة
function enhancedCreateAccumulatedProfitNotification(investor, amount, unpaidMonths) {
    const notification = {
        id: generateId(),
        title: `أرباح متراكمة: ${investor.name}`,
        message: `أرباح متراكمة من ${unpaidMonths} شهر سابق بقيمة <span class="accumulated-amount">${formatCurrency(amount.toFixed(2))}</span>`,
        type: 'accumulated-profit',
        entityId: investor.id,
        entityType: 'accumulated-profit',
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        amount: amount,
        unpaidMonths: unpaidMonths,
        date: new Date().toISOString(),
        read: false
    };
    
    // إضافة الإشعار إلى القائمة
    notifications.unshift(notification);
    
    // الاحتفاظ بأحدث 100 إشعار فقط
    if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
    }
    
    // حفظ الإشعارات
    saveNotifications();
    
    // تحديث شارة الإشعارات
    updateNotificationBadge();
    
    return notification;
}

// تحديث وظائف الفحص للاستخدام الوظائف المحسنة
function updateProfitCheckFunctions() {
    if (typeof window.checkAccumulatedProfits === 'function') {
        const originalCheckAccumulatedProfits = window.checkAccumulatedProfits;
        
        window.checkAccumulatedProfits = function() {
            console.log("فحص الأرباح المتراكمة باستخدام الوظيفة المحسنة...");
            
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // اليوم المحدد لتوزيع الأرباح
            const profitDistributionDay = settings.profitDistributionDay || 1;
            
            // حلقة على جميع المستثمرين الذين لديهم استثمارات نشطة
            investors.forEach(investor => {
                // الحصول على استثمارات المستثمر النشطة
                const activeInvestments = investments.filter(inv => 
                    inv.investorId === investor.id && 
                    inv.status === 'active'
                );
                
                if (activeInvestments.length === 0) return;
                
                // إعداد متغيرات لتخزين معلومات الأرباح
                let currentMonthProfit = 0;
                let accumulatedPastProfit = 0;
                let unpaidMonths = 0;
                
                // تاريخ بداية الشهر الحالي
                const currentMonthStart = new Date(currentYear, currentMonth, 1);
                
                // تاريخ بداية الشهر السابق
                const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
                if (lastMonthStart.getMonth() < 0) {
                    lastMonthStart.setFullYear(currentYear - 1);
                    lastMonthStart.setMonth(11);
                }
                
                // حلقة على جميع الاستثمارات النشطة للمستثمر
                activeInvestments.forEach(investment => {
                    // تحويل تاريخ الاستثمار إلى كائن Date
                    const investmentDate = new Date(investment.date);
                    
                    // حساب عدد الشهور منذ بداية الاستثمار حتى الآن
                    const totalMonths = (currentYear - investmentDate.getFullYear()) * 12 + 
                                        (currentMonth - investmentDate.getMonth());
                    
                    // الربح الشهري لهذا الاستثمار
                    const monthlyProfit = calculateMonthlyProfit(investment.amount);
                    
                    // إذا مضى شهر على الأقل منذ الاستثمار
                    if (totalMonths >= 1) {
                        // تضاف إلى الربح الحالي (الشهر الحالي)
                        currentMonthProfit += monthlyProfit;
                        
                        // حساب عدد الأشهر للأرباح المتراكمة (الشهور السابقة)
                        // نفحص الشهور الستة الماضية كحد أقصى
                        const monthsToCheck = Math.min(totalMonths - 1, 6);
                        
                        // حلقة على الشهور السابقة للتحقق من الأرباح المدفوعة
                        for (let i = 1; i <= monthsToCheck; i++) {
                            // حساب تاريخ بداية الشهر
                            const monthStart = new Date(currentYear, currentMonth - i, 1);
                            if (monthStart.getMonth() < 0) {
                                monthStart.setFullYear(monthStart.getFullYear() - 1);
                                monthStart.setMonth(12 + monthStart.getMonth());
                            }
                            
                            // حساب تاريخ نهاية الشهر
                            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
                            
                            // التحقق من وجود دفعات أرباح لهذا الشهر
                            const profitPaymentsForMonth = operations.filter(op => 
                                op.investorId === investor.id && 
                                op.type === 'profit' && 
                                op.status === 'active' &&
                                new Date(op.date) >= monthStart && 
                                new Date(op.date) <= monthEnd
                            );
                            
                            // إذا لم يكن هناك دفعات أرباح لهذا الشهر
                            if (profitPaymentsForMonth.length === 0 && 
                                new Date(investmentDate) < monthStart) {
                                // إضافة الربح الشهري للأرباح المتراكمة
                                accumulatedPastProfit += monthlyProfit;
                                unpaidMonths++;
                            }
                        }
                    }
                });
                
                // التحقق من دفعات الأرباح للشهر الحالي
                const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
                const profitPaymentsCurrentMonth = operations.filter(op => 
                    op.investorId === investor.id && 
                    op.type === 'profit' && 
                    op.status === 'active' &&
                    new Date(op.date) >= currentMonthStart && 
                    new Date(op.date) <= currentMonthEnd
                );
                
                // إنشاء إشعار للشهر الحالي إذا لم يكن هناك دفعات وهناك ربح مستحق
                if (profitPaymentsCurrentMonth.length === 0 && currentMonthProfit > 0) {
                    // التحقق مما إذا كان الإشعار موجودًا بالفعل
                    const existingCurrentNotification = notifications.find(n => 
                        n.entityId === investor.id && 
                        n.entityType === 'profit-due' && 
                        n.month === currentMonth && 
                        n.year === currentYear
                    );
                    
                    if (!existingCurrentNotification) {
                        // إنشاء إشعار للأرباح المستحقة للشهر الحالي باستخدام الوظيفة المحسنة
                        enhancedCreateDueProfitNotification(
                            investor, 
                            currentMonthProfit,
                            currentMonth,
                            currentYear,
                            'الشهر الحالي'
                        );
                    }
                }
                
                // إنشاء إشعار للأرباح المتراكمة إذا كانت أكبر من صفر
                if (accumulatedPastProfit > 0) {
                    // التحقق مما إذا كان الإشعار موجودًا بالفعل
                    const existingAccumulatedNotification = notifications.find(n => 
                        n.entityId === investor.id && 
                        n.entityType === 'accumulated-profit' && 
                        n.month === currentMonth && 
                        n.year === currentYear
                    );
                    
                    if (!existingAccumulatedNotification) {
                        // إنشاء إشعار للأرباح المتراكمة باستخدام الوظيفة المحسنة
                        enhancedCreateAccumulatedProfitNotification(
                            investor, 
                            accumulatedPastProfit,
                            unpaidMonths
                        );
                    }
                }
            });
        };
        
        // تطبيق التحديث
        window.originalCheckAccumulatedProfits = originalCheckAccumulatedProfits;
    }
}

// تسجيل وظائف التحسين
window.notificationImprovements = {
    viewNotificationEntity: window.viewNotificationEntity,
    loadNotifications: window.loadNotifications,
    openPayProfitModalFromNotification: window.openPayProfitModalFromNotification,
    enhancedCreateDueProfitNotification: enhancedCreateDueProfitNotification,
    enhancedCreateAccumulatedProfitNotification: enhancedCreateAccumulatedProfitNotification,
    updateProfitCheckFunctions: updateProfitCheckFunctions
};

// تطبيق التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث وظائف فحص الأرباح
    updateProfitCheckFunctions();
    
    // تحديث أي إشعارات مخزنة
    setTimeout(() => {
        // إعادة فحص الأرباح المستحقة والمتراكمة
        if (typeof window.enhancedCheckInvestorsDueProfit === 'function') {
            window.enhancedCheckInvestorsDueProfit();
        }
        
        if (typeof window.checkAccumulatedProfits === 'function') {
            window.checkAccumulatedProfits();
        }
    }, 2000);
});

console.log("تم تحميل تحسينات نظام الإشعارات وعرض التفاصيل");