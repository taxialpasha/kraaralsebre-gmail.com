/**
 * تحسينات الإشعارات المنبثقة (Toast)
 * 
 * هذا الملف يحتوي على تحسينات لنظام الإشعارات المنبثقة في تطبيق إدارة الاستثمار
 */

// تحسين عرض الإشعارات المنبثقة (Toast)
function enhanceToastNotifications() {
    // استبدال الوظيفة الأصلية بوظيفة محسنة
    window.originalShowNotificationToast = window.showNotificationToast;
    window.showNotificationToast = enhancedShowNotificationToast;
}

// عرض إشعار منبثق محسن
function enhancedShowNotificationToast(notification) {
    // إزالة أي إشعارات منبثقة سابقة
    const existingToasts = document.querySelectorAll('.notification-toast');
    existingToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // إنشاء إشعار منبثق جديد
    const toast = document.createElement('div');
    toast.className = `notification-toast ${notification.type}`;
    
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
    
    toast.innerHTML = `
        <div class="notification-icon ${notification.type}">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-text">${notification.message}</div>
        </div>
        <div class="toast-close" onclick="this.parentNode.classList.remove('show'); setTimeout(() => this.parentNode.remove(), 300)">
            <i class="fas fa-times"></i>
        </div>
        ${notification.entityType === 'profit-due' ? `
            <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                <button class="btn btn-sm btn-primary" onclick="openPayProfitModalFromNotification('${notification.entityId}', '${notification.id}')">
                    <i class="fas fa-money-bill"></i> دفع الأرباح
                </button>
            </div>
        ` : ''}
    `;
    
    document.body.appendChild(toast);
    
    // عرض الإشعار بعد إضافته للصفحة
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // إخفاء الإشعار بعد 5 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// دالة جديدة لتنبيه المستثمرين المستحقين للأرباح بشكل منبثق
function showDueProfitToasts() {
    // الحصول على الإشعارات غير المقروءة من نوع الأرباح المستحقة
    const dueProfitNotifications = notifications.filter(n => 
        !n.read && 
        n.entityType === 'profit-due'
    );
    
    if (dueProfitNotifications.length === 0) return;
    
    // عرض أول إشعار فقط بشكل منبثق (لتجنب الإزعاج)
    enhancedShowNotificationToast(dueProfitNotifications[0]);
    
    // إضافة تصنيف نبض للشارة إذا كان هناك إشعارات أرباح مستحقة غير مقروءة
    const notificationBadge = document.getElementById('notificationBadgeHeader');
    if (notificationBadge) {
        notificationBadge.classList.add('pulse');
    }
}

// إنشاء إشعار أرباح مستحقة
function createDueProfitNotification(investor, amount) {
    const notification = {
        id: generateId(),
        title: `أرباح مستحقة: ${investor.name}`,
        message: `أرباح شهرية مستحقة بقيمة <span class="profit-amount">${formatCurrency(amount.toFixed(2))}</span>`,
        type: 'profit',
        entityId: investor.id,
        entityType: 'profit-due',
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        amount: amount,
        date: new Date().toISOString(),
        read: false
    };
    
    // إضافة الإشعار
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

// دالة محسنة لجدولة فحص الأرباح المستحقة
function enhancedScheduleProfitDueCheck() {
    // التحقق عند تحميل الصفحة
    setTimeout(() => {
        checkInvestorsDueProfit();
        
        // عرض الإشعارات المنبثقة للأرباح المستحقة
        showDueProfitToasts();
    }, 2000);
    
    // جدولة التحقق كل ساعة
    setInterval(() => {
        checkInvestorsDueProfit();
        showDueProfitToasts();
    }, 60 * 60 * 1000);
}

// تحديث وظيفة فحص المستثمرين المستحقين للأرباح
function enhancedCheckInvestorsDueProfit() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // الحصول على اليوم المحدد لتوزيع الأرباح
    const profitDistributionDay = settings.profitDistributionDay || 1;
    
    // في حالة اقتراب موعد توزيع الأرباح (قبل 3 أيام أو بعدها ب 7 أيام)
    const daysUntilDistribution = profitDistributionDay - today.getDate();
    const showNotification = daysUntilDistribution <= 3 && daysUntilDistribution >= -7;
    
    if (showNotification) {
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
                // حساب أرباح الشهر
                const monthlyProfit = calculateMonthlyProfit(investment.amount);
                totalDueProfit += monthlyProfit;
            });
            
            if (totalDueProfit <= 0) return;
            
            // التحقق مما إذا كان المستثمر قد استلم أرباحًا لهذا الشهر
            const thisMonthStart = new Date(currentYear, currentMonth, 1);
            const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
            
            const profitPaymentsThisMonth = operations.filter(op => 
                op.investorId === investor.id && 
                op.type === 'profit' && 
                op.status === 'active' &&
                new Date(op.date) >= thisMonthStart && 
                new Date(op.date) <= thisMonthEnd
            );
            
            // إذا لم يكن هناك مدفوعات أرباح لهذا الشهر وهناك أرباح مستحقة
            if (profitPaymentsThisMonth.length === 0) {
                // التحقق مما إذا كان الإشعار موجودًا بالفعل
                const existingNotification = notifications.find(n => 
                    n.entityId === investor.id && 
                    n.entityType === 'profit-due' && 
                    n.month === currentMonth && 
                    n.year === currentYear
                );
                
                if (!existingNotification) {
                    // إنشاء إشعار جديد
                    createDueProfitNotification(investor, totalDueProfit);
                }
            }
        });
    }
}

// تهيئة تحسينات الإشعارات المنبثقة
function initToastEnhancements() {
    // تحسين الإشعارات المنبثقة
    enhanceToastNotifications();
    
    // استبدال وظيفة فحص الأرباح المستحقة
    window.checkInvestorsDueProfit = enhancedCheckInvestorsDueProfit;
    
    // تعيين الجدولة المحسنة
    enhancedScheduleProfitDueCheck();
    
    console.log('تم تهيئة تحسينات الإشعارات المنبثقة بنجاح');
}

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل العناصر الأخرى
    setTimeout(initToastEnhancements, 1500);
});