/**
 * تحسينات نظام الإشعارات - إشعارات الأرباح المتراكمة
 * 
 * هذا الملف يضيف وظائف تحسين لاكتشاف وعرض الأرباح المتراكمة من الشهور السابقة
 */

// دالة للتحقق من الأرباح المتراكمة (الشهر الحالي والشهور السابقة)
function checkAccumulatedProfits() {
    console.log("فحص الأرباح المتراكمة...");
    
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
                // إنشاء إشعار للأرباح المستحقة للشهر الحالي
                createDueProfitNotification(
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
                // إنشاء إشعار للأرباح المتراكمة
                createAccumulatedProfitNotification(
                    investor, 
                    accumulatedPastProfit,
                    unpaidMonths
                );
            }
        }
    });
}

// إنشاء إشعار أرباح مستحقة مع تحديد الفترة
function createDueProfitNotification(investor, amount, month, year, periodText) {
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

// إنشاء إشعار خاص بالأرباح المتراكمة
function createAccumulatedProfitNotification(investor, amount, unpaidMonths) {
    const notification = {
        id: generateId(),
        title: `أرباح متراكمة: ${investor.name}`,
        message: `أرباح متراكمة من ${unpaidMonths} شهر سابق بقيمة <span class="profit-amount">${formatCurrency(amount.toFixed(2))}</span>`,
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

// فتح نافذة دفع الأرباح المتراكمة
window.openAccumulatedProfitModalFromNotification = function(investorId, notificationId) {
    // تعيين الإشعار كمقروء
    markNotificationAsRead(notificationId);
    
    // إغلاق لوحة الإشعارات
    toggleNotificationPanel();
    
    // العثور على الإشعار
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // فتح نافذة دفع الأرباح مع معلومات خاصة بالأرباح المتراكمة
    openPayProfitModal(investorId, notification.amount, true, notification.unpaidMonths);
}

// تعديل وظيفة فتح نافذة دفع الأرباح لتدعم الأرباح المتراكمة
const originalOpenPayProfitModal = window.openPayProfitModal;
window.openPayProfitModal = function(investorId, suggestedAmount, isAccumulated, unpaidMonths) {
    // استدعاء الوظيفة الأصلية أولاً
    originalOpenPayProfitModal(investorId);
    
    // إذا كان هناك مبلغ مقترح، قم بتعيينه في حقل المبلغ
    if (suggestedAmount) {
        setTimeout(() => {
            const profitAmountInput = document.getElementById('profitAmount');
            if (profitAmountInput) {
                profitAmountInput.value = suggestedAmount.toFixed(0);
            }
            
            // إذا كانت الدفعة لأرباح متراكمة، قم بتعديل عنوان النافذة ومعلومات إضافية
            if (isAccumulated && unpaidMonths) {
                const modalTitle = document.querySelector('#payProfitModal .modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'دفع أرباح متراكمة';
                }
                
                // إضافة معلومات عن الأرباح المتراكمة
                const noteInput = document.getElementById('profitNotes');
                if (noteInput) {
                    noteInput.value = `دفع أرباح متراكمة لـ ${unpaidMonths} شهر سابق`;
                }
                
                // إضافة معلومات توضيحية في النافذة
                const modalBody = document.querySelector('#payProfitModal .modal-body');
                if (modalBody) {
                    // التحقق من وجود تنبيه الأرباح المتراكمة
                    if (!document.getElementById('accumulated-profit-alert')) {
                        const alert = document.createElement('div');
                        alert.id = 'accumulated-profit-alert';
                        alert.className = 'alert alert-warning';
                        alert.style.marginBottom = '15px';
                        alert.innerHTML = `
                            <div class="alert-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title">أرباح متراكمة</div>
                                <div class="alert-text">هذه دفعة أرباح متراكمة لـ ${unpaidMonths} شهر سابق بقيمة إجمالية ${formatCurrency(suggestedAmount.toFixed(2))}</div>
                            </div>
                        `;
                        
                        // إضافة التنبيه في بداية النافذة
                        const form = modalBody.querySelector('form');
                        if (form) {
                            form.insertBefore(alert, form.firstChild);
                        } else {
                            modalBody.insertBefore(alert, modalBody.firstChild);
                        }
                    }
                }
            }
        }, 100);
    }
}

// تحديث الوظيفة المحسنة لفحص الأرباح المستحقة لتتضمن الأرباح المتراكمة
const enhancedCheckInvestorsDueProfitOriginal = window.enhancedCheckInvestorsDueProfit;
window.enhancedCheckInvestorsDueProfit = function() {
    // استدعاء الوظيفة الأصلية للشهر الحالي
    if (enhancedCheckInvestorsDueProfitOriginal) {
        enhancedCheckInvestorsDueProfitOriginal();
    }
    
    // فحص الأرباح المتراكمة
    checkAccumulatedProfits();
}

// الكشف عن وظائف الأرباح المتراكمة
window.accumulatedProfitFeatures = {
    checkAccumulatedProfits: checkAccumulatedProfits,
    createAccumulatedProfitNotification: createAccumulatedProfitNotification,
    openAccumulatedProfitModalFromNotification: window.openAccumulatedProfitModalFromNotification
};

// تنفيذ فحص أولي عند تحميل الملف
setTimeout(checkAccumulatedProfits, 2500);

console.log("تم تحميل تحسينات إشعارات الأرباح المتراكمة");