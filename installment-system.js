/**
 * نظام إدارة الأقساط المحسن - الإصدار 2.0
 * 
 * هذا الملف يحتوي على وظائف إدارة الأقساط للتكامل مع نظام إدارة الاستثمار
 * تم تحسين الكود لمعالجة مشاكل العرض والتخزين وإضافة ميزات جديدة
 */

// ============ المتغيرات العالمية لنظام الأقساط ============
let installments = [];
let installmentItems = [];
let installmentPayments = [];
let installmentSettings = {
    defaultInterestRate: 4, // معدل الفائدة الافتراضي
    defaultDurationMonths: 12, // مدة القرض الافتراضية بالأشهر
    lateFeePercentage: 0.5, // نسبة غرامة التأخير
    maxInstallmentAmount: 0, // الحد الأقصى لمبلغ القسط (0 = غير محدود)
    minInstallmentAmount: 50000, // الحد الأدنى لمبلغ القسط
    enableNotifications: true, // تفعيل الإشعارات
    notificationDaysBeforeDue: 3, // عدد أيام التذكير قبل موعد الاستحقاق
    allowPartialPayments: true, // السماح بالدفع الجزئي
    showInInvestorProfile: true, // إظهار الأقساط في ملف المستثمر
};

// فئات المقترضين
const borrowerCategories = [
    { id: 'investor', name: 'مستثمر' },
    { id: 'public', name: 'حشد شعبي' },
    { id: 'welfare', name: 'رعاية اجتماعية' },
    { id: 'employee', name: 'موظف' },
    { id: 'military', name: 'عسكري' },
    { id: 'business', name: 'كاسب' },
    { id: 'other', name: 'أخرى' }
];

// متغيرات الحالة
let currentInstallmentId = null;
let currentInstallmentItemId = null;
let currentInstallmentPaymentId = null;
let tempInstallmentItems = []; // قائمة مؤقتة للعناصر أثناء التعديل/الإضافة
let isInstallmentPageInitialized = false; // للتحقق مما إذا كانت صفحة الأقساط قد تم تهيئتها

// ============ وظائف التحميل والتهيئة ============

/**
 * تهيئة نظام الأقساط
 */
function initInstallmentSystem() {
    console.log('جاري تهيئة نظام الأقساط...');
    
    // تحميل البيانات من التخزين المحلي
    loadInstallmentData();
    
    // تحميل إعدادات الأقساط
    loadInstallmentSettings();
    
    // إنشاء صفحة الأقساط إذا لم تكن موجودة
    if (!document.getElementById('installments')) {
        createInstallmentsPage();
    }
    
    // إضافة رابط الأقساط في القائمة الجانبية
    addInstallmentsMenuLink();
    
    // التحقق من تواريخ استحقاق الأقساط
    checkDueDates();
    
    // تحديث شارة الأقساط
    updateInstallmentsBadge();
    
    // إضافة مستمع أحداث للتنقل بين الصفحات
    addPageNavigationListener();
    
    // تسجيل دالة عرض صفحة الأقساط في النظام الرئيسي
    registerInstallmentPageHandler();
    
    // جدولة التحقق التلقائي من الأقساط
    scheduleAutomaticChecks();
    
    // دمج الأقساط مع ملفات المستثمرين
    integrateWithInvestorProfiles();
    
    // تسجيل الإشعارات
    registerInstallmentNotifications();
    
    console.log('تم تهيئة نظام الأقساط بنجاح');
    isInstallmentPageInitialized = true;
}

/**
 * تحميل بيانات الأقساط من التخزين المحلي
 */
function loadInstallmentData() {
    try {
        const storedInstallments = localStorage.getItem('installments');
        const storedInstallmentItems = localStorage.getItem('installmentItems');
        const storedInstallmentPayments = localStorage.getItem('installmentPayments');
        
        if (storedInstallments) {
            installments = JSON.parse(storedInstallments);
        }
        
        if (storedInstallmentItems) {
            installmentItems = JSON.parse(storedInstallmentItems);
        }
        
        if (storedInstallmentPayments) {
            installmentPayments = JSON.parse(storedInstallmentPayments);
        }
        
        console.log(`تم تحميل ${installments.length} قرض و ${installmentItems.length} عنصر و ${installmentPayments.length} قسط`);
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأقساط:', error);
        
        // إنشاء نسخة احتياطية من البيانات إذا كانت موجودة
        if (installments.length > 0 || installmentItems.length > 0 || installmentPayments.length > 0) {
            createBackup('error_recovery');
        }
        
        // إعادة تعيين البيانات
        installments = [];
        installmentItems = [];
        installmentPayments = [];
        
        createNotification('خطأ', 'حدث خطأ أثناء تحميل بيانات الأقساط. تم إعادة تعيين البيانات.', 'danger');
    }
}

/**
 * تحميل إعدادات الأقساط
 */
function loadInstallmentSettings() {
    try {
        const storedSettings = localStorage.getItem('installmentSettings');
        
        if (storedSettings) {
            // دمج الإعدادات المخزنة مع الإعدادات الافتراضية
            installmentSettings = {...installmentSettings, ...JSON.parse(storedSettings)};
        }
        
        console.log('تم تحميل إعدادات الأقساط:', installmentSettings);
    } catch (error) {
        console.error('خطأ في تحميل إعدادات الأقساط:', error);
        // استخدام الإعدادات الافتراضية
    }
}

/**
 * حفظ إعدادات الأقساط
 */
function saveInstallmentSettings() {
    try {
        localStorage.setItem('installmentSettings', JSON.stringify(installmentSettings));
        console.log('تم حفظ إعدادات الأقساط');
        
        // تحديث الإجراءات المرتبطة بالإعدادات
        if (installmentSettings.showInInvestorProfile) {
            integrateWithInvestorProfiles();
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الأقساط:', error);
        createNotification('خطأ', 'حدث خطأ أثناء حفظ إعدادات الأقساط', 'danger');
        return false;
    }
}

/**
 * حفظ بيانات الأقساط في التخزين المحلي
 */
function saveInstallmentData() {
    try {
        localStorage.setItem('installments', JSON.stringify(installments));
        localStorage.setItem('installmentItems', JSON.stringify(installmentItems));
        localStorage.setItem('installmentPayments', JSON.stringify(installmentPayments));
        
        // إذا كانت المزامنة نشطة، قم بمزامنة البيانات مع Firebase
        if (typeof syncActive !== 'undefined' && syncActive) {
            syncInstallmentData();
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الأقساط:', error);
        createNotification('خطأ', 'حدث خطأ أثناء حفظ بيانات الأقساط', 'danger');
        
        // إنشاء نسخة احتياطية تلقائية في حالة الخطأ
        createBackup('auto_error');
        
        return false;
    }
}

/**
 * إضافة مستمع لأحداث التنقل بين الصفحات
 */
function addPageNavigationListener() {
    // تعديل لتجنب الإضافة المتكررة
    if (window.installmentPageListenerAdded) return;
    
    // استمع إلى أحداث تغيير الهاش (عند التنقل بين الصفحات)
    window.addEventListener('hashchange', function() {
        const pageId = window.location.hash.substring(1);
        
        // حفظ بيانات الأقساط قبل مغادرة الصفحة
        if (pageId !== 'installments' && document.getElementById('installments') && document.getElementById('installments').classList.contains('active')) {
            console.log('مغادرة صفحة الأقساط - حفظ البيانات');
            saveInstallmentData();
        }
        
        // تحميل البيانات عند الدخول إلى صفحة الأقساط
        if (pageId === 'installments') {
            console.log('الدخول إلى صفحة الأقساط');
            // تأكد من تهيئة الصفحة
            if (!isInstallmentPageInitialized) {
                createInstallmentsPage();
                isInstallmentPageInitialized = true;
            }
            
            // تأخير قصير للتأكد من ظهور الصفحة
            setTimeout(() => {
                loadInstallmentsPage();
            }, 100);
        }
    });
    
    // تعديل الروابط في القائمة الجانبية
    document.querySelectorAll('.menu-item').forEach(menuItem => {
        menuItem.addEventListener('click', function(e) {
            // التحقق مما إذا كان هذا هو رابط صفحة الأقساط
            if (this.getAttribute('href') === '#installments') {
                // تأكد من تهيئة الصفحة
                if (!isInstallmentPageInitialized) {
                    createInstallmentsPage();
                    isInstallmentPageInitialized = true;
                }
                
                // تأخير قصير للتأكد من ظهور الصفحة
                setTimeout(() => {
                    loadInstallmentsPage();
                }, 100);
            }
        });
    });
    
    window.installmentPageListenerAdded = true;
}

/**
 * تسجيل دالة عرض صفحة الأقساط في النظام الرئيسي
 */
function registerInstallmentPageHandler() {
    // التأكد من وجود دالة showPage في النظام الرئيسي
    if (typeof window.showPage === 'function') {
        // حفظ الدالة الأصلية
        const originalShowPage = window.showPage;
        
        // استبدال الدالة بنسخة معدلة
        window.showPage = function(pageId) {
            // استدعاء الدالة الأصلية أولاً
            originalShowPage(pageId);
            
            // إذا كانت الصفحة المطلوبة هي صفحة الأقساط
            if (pageId === 'installments') {
                console.log('تم طلب عرض صفحة الأقساط');
                // تأكد من تهيئة الصفحة
                if (!isInstallmentPageInitialized) {
                    createInstallmentsPage();
                    isInstallmentPageInitialized = true;
                }
                
                // تأخير قصير للتأكد من ظهور الصفحة
                setTimeout(() => {
                    loadInstallmentsPage();
                }, 100);
            }
        };
        
        console.log('تم تسجيل معالج صفحة الأقساط بنجاح');
    } else {
        console.warn('وظيفة showPage غير متوفرة في النظام الرئيسي');
    }
}

/**
 * جدولة التحقق التلقائي من الأقساط
 */
function scheduleAutomaticChecks() {
    // التحقق من تواريخ الاستحقاق عند بدء التشغيل
    checkDueDates();
    
    // التحقق من الأقساط المستحقة قريبًا كل 12 ساعة
    const HALF_DAY = 12 * 60 * 60 * 1000;
    setInterval(() => {
        checkDueDates();
        checkUpcomingInstallments();
    }, HALF_DAY);
    
    console.log('تم جدولة التحقق التلقائي من الأقساط');
}

// ============ وظائف التكامل مع نظام المستثمرين ============

/**
 * دمج الأقساط مع ملفات المستثمرين
 */
function integrateWithInvestorProfiles() {
    if (!installmentSettings.showInInvestorProfile) {
        console.log('تم تعطيل دمج الأقساط مع ملفات المستثمرين');
        return;
    }
    
    // تعديل دالة عرض المستثمر لإضافة تبويب الأقساط
    if (typeof window.viewInvestor === 'function') {
        const originalViewInvestor = window.viewInvestor;
        
        window.viewInvestor = function(investorId) {
            // استدعاء الدالة الأصلية أولاً
            originalViewInvestor(investorId);
            
            // إضافة تبويب الأقساط بعد تحميل بيانات المستثمر
            setTimeout(() => {
                addInstallmentsTabToInvestorModal(investorId);
            }, 200);
        };
        
        console.log('تم دمج الأقساط مع ملفات المستثمرين');
    } else {
        console.warn('وظيفة viewInvestor غير متوفرة في النظام الرئيسي');
    }
}

/**
 * إضافة تبويب الأقساط إلى نافذة المستثمر
 */
function addInstallmentsTabToInvestorModal(investorId) {
    // التحقق من وجود المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return;
    
    // التحقق من وجود نافذة المستثمر
    const investorModal = document.getElementById('viewInvestorModal');
    if (!investorModal) return;
    
    // التحقق من وجود شريط التبويبات
    const tabsList = investorModal.querySelector('.modal-tabs');
    if (!tabsList) return;
    
    // التحقق مما إذا كان تبويب الأقساط موجودًا بالفعل
    if (investorModal.querySelector('.modal-tab[data-tab="investorInstallments"]')) return;
    
    // إنشاء تبويب جديد للأقساط
    const installmentsTab = document.createElement('div');
    installmentsTab.className = 'modal-tab';
    installmentsTab.setAttribute('data-tab', 'investorInstallments');
    installmentsTab.textContent = 'الأقساط';
    installmentsTab.onclick = function() {
        switchModalTab('investorInstallments', 'viewInvestorModal');
    };
    
    // إضافة التبويب إلى شريط التبويبات
    tabsList.appendChild(installmentsTab);
    
    // إنشاء محتوى تبويب الأقساط
    const installmentsTabContent = document.createElement('div');
    installmentsTabContent.className = 'modal-tab-content';
    installmentsTabContent.id = 'investorInstallments';
    
    // البحث عن القروض المرتبطة بالمستثمر
    const investorInstallments = installments.filter(inst => 
        inst.borrowerType === 'investor' && inst.borrowerId === investorId
    );
    
    // إنشاء محتوى تبويب الأقساط
    if (investorInstallments.length === 0) {
        installmentsTabContent.innerHTML = `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد أقساط</div>
                    <div class="alert-text">لا توجد أقساط لهذا المستثمر.</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button class="btn btn-primary" onclick="openAddInstallmentModal('${investorId}')">
                    <i class="fas fa-plus"></i> إضافة قرض جديد
                </button>
            </div>
        `;
    } else {
        // جمع بيانات الأقساط المستحقة والمتأخرة
        let totalAmount = 0;
        let totalPaid = 0;
        let totalRemaining = 0;
        let latePaymentsCount = 0;
        let upcomingPaymentsCount = 0;
        
        investorInstallments.forEach(inst => {
            totalAmount += inst.totalAmount;
            
            // حساب المبالغ المدفوعة
            const paidPayments = installmentPayments
                .filter(payment => payment.installmentId === inst.id && payment.status === 'paid')
                .reduce((total, payment) => total + payment.amount, 0);
            
            totalPaid += paidPayments;
            
            // الأقساط المتأخرة
            latePaymentsCount += installmentPayments
                .filter(payment => payment.installmentId === inst.id && payment.status === 'late')
                .length;
            
            // الأقساط القادمة خلال الأيام القليلة المقبلة
            const today = new Date();
            const upcomingDays = installmentSettings.notificationDaysBeforeDue;
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + upcomingDays);
            
            upcomingPaymentsCount += installmentPayments
                .filter(payment => {
                    if (payment.installmentId !== inst.id || payment.status !== 'pending') return false;
                    const dueDate = new Date(payment.dueDate);
                    return dueDate >= today && dueDate <= futureDate;
                })
                .length;
        });
        
        totalRemaining = totalAmount - totalPaid;
        
        // إنشاء محتوى تبويب الأقساط
        installmentsTabContent.innerHTML = `
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي القروض</div>
                            <div class="card-value">${investorInstallments.length}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">المبلغ المتبقي</div>
                            <div class="card-value">${formatCurrency(totalRemaining)}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط المتأخرة</div>
                            <div class="card-value">${latePaymentsCount}</div>
                        </div>
                        <div class="card-icon ${latePaymentsCount > 0 ? 'danger' : 'info'}">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأقساط القادمة</div>
                            <div class="card-value">${upcomingPaymentsCount}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-container" style="margin-top: 15px;">
                <div class="table-header">
                    <div class="table-title">القروض بالأقساط</div>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="openAddInstallmentModal('${investorId}')">
                            <i class="fas fa-plus"></i> إضافة قرض جديد
                        </button>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>المبلغ الإجمالي</th>
                            <th>تاريخ البدء</th>
                            <th>المدة</th>
                            <th>المبلغ المتبقي</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investorInstallments.map((inst, index) => {
                            // حساب المبلغ المدفوع والمتبقي
                            const paidAmount = installmentPayments
                                .filter(payment => payment.installmentId === inst.id && payment.status === 'paid')
                                .reduce((total, payment) => total + payment.amount, 0);
                            
                            const remainingAmount = inst.totalAmount - paidAmount;
                            
                            // عدد الأقساط المتبقية
                            const remainingPayments = installmentPayments
                                .filter(payment => payment.installmentId === inst.id && payment.status !== 'paid')
                                .length;
                            
                            // حالة القرض مع مؤشر للتأخير
                            const hasLatePayments = installmentPayments
                                .some(payment => payment.installmentId === inst.id && payment.status === 'late');
                            
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${formatCurrency(inst.totalAmount)}</td>
                                    <td>${formatDate(inst.startDate)}</td>
                                    <td>${inst.durationMonths} شهر</td>
                                    <td>${formatCurrency(remainingAmount)}</td>
                                    <td>
                                        <span class="status ${
                                            inst.status === 'completed' ? 'success' : 
                                            hasLatePayments ? 'danger' : 'active'
                                        }">
                                            ${
                                                inst.status === 'completed' ? 'مكتمل' : 
                                                inst.status === 'defaulted' ? 'متعثر' : 
                                                hasLatePayments ? 'متأخر' : 'نشط'
                                            }
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-info btn-icon action-btn" onclick="viewInstallment('${inst.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentFromInvestor('${inst.id}')">
                                            <i class="fas fa-money-bill"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="table-container" style="margin-top: 15px;">
                <div class="table-header">
                    <div class="table-title">الأقساط المتأخرة والمستحقة قريبًا</div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${getInvestorPaymentsTableRows(investorId)}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // إضافة محتوى التبويب إلى منطقة المحتوى
    const modalBody = investorModal.querySelector('.modal-body');
    modalBody.appendChild(installmentsTabContent);
    
    console.log('تم إضافة تبويب الأقساط إلى نافذة المستثمر');
}

/**
 * الحصول على صفوف جدول أقساط المستثمر
 */
function getInvestorPaymentsTableRows(investorId) {
    // البحث عن القروض المرتبطة بالمستثمر
    const investorInstallmentIds = installments
        .filter(inst => inst.borrowerType === 'investor' && inst.borrowerId === investorId)
        .map(inst => inst.id);
    
    if (investorInstallmentIds.length === 0) {
        return '<tr><td colspan="5" style="text-align: center;">لا توجد أقساط</td></tr>';
    }
    
    // الحصول على الأقساط المتأخرة
    const latePayments = installmentPayments.filter(payment => 
        investorInstallmentIds.includes(payment.installmentId) && payment.status === 'late'
    );
    
    // الحصول على الأقساط المستحقة قريبًا
    const today = new Date();
    const upcomingDays = installmentSettings.notificationDaysBeforeDue;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + upcomingDays);
    
    const upcomingPayments = installmentPayments.filter(payment => {
        if (!investorInstallmentIds.includes(payment.installmentId) || payment.status !== 'pending') return false;
        const dueDate = new Date(payment.dueDate);
        return dueDate >= today && dueDate <= futureDate;
    });
    
    // دمج الأقساط وترتيبها حسب تاريخ الاستحقاق
    const combinedPayments = [...latePayments, ...upcomingPayments].sort((a, b) => 
        new Date(a.dueDate) - new Date(b.dueDate)
    );
    
    if (combinedPayments.length === 0) {
        return '<tr><td colspan="5" style="text-align: center;">لا توجد أقساط متأخرة أو مستحقة قريبًا</td></tr>';
    }
    
    return combinedPayments.map(payment => {
        // الحصول على معلومات القرض
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return '';
        
        // حساب عدد أيام التأخير أو الأيام المتبقية
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        const statusText = payment.status === 'late' ? 
            `متأخر بـ ${Math.abs(daysDiff)} يوم` : 
            `يستحق خلال ${daysDiff} يوم`;
        
        return `
            <tr>
                <td>${payment.number} / ${installment.durationMonths}</td>
                <td>${formatDate(payment.dueDate)}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td>
                    <span class="status ${payment.status === 'late' ? 'danger' : 'warning'}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentModal('${payment.id}')">
                        <i class="fas fa-money-bill"></i> دفع
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * فتح نافذة دفع قسط من ملف المستثمر
 */
function openPayInstallmentFromInvestor(installmentId) {
    // الحصول على أول قسط غير مدفوع
    const nextPayment = installmentPayments.find(payment => 
        payment.installmentId === installmentId && 
        (payment.status === 'pending' || payment.status === 'late')
    );
    
    if (!nextPayment) {
        createNotification('معلومات', 'لا توجد أقساط مستحقة لهذا القرض', 'info');
        return;
    }
    
    // فتح نافذة الدفع
    openPayInstallmentModal(nextPayment.id);
}

// ============ وظائف الأقساط الأساسية ============

/**
 * إنشاء معرف فريد
 */
function generateInstallmentId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount);
    }
    
    if (isNaN(amount)) return "0 " + settings.currency;
    
    return `${parseFloat(amount).toLocaleString('ar-IQ')} ${settings.currency}`;
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    if (!dateString) return "";
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ');
    } catch (e) {
        return dateString;
    }
}

/**
 * حساب المبلغ الإجمالي مع الفائدة
 */
function calculateTotalWithInterest(principal, rate, durationMonths) {
    const yearlyRate = rate / 100;
    const monthlyRate = yearlyRate / 12;
    const totalInterest = principal * yearlyRate * (durationMonths / 12);
    return principal + totalInterest;
}

/**
 * حساب قيمة القسط الشهري
 */
function calculateMonthlyInstallment(principal, rate, durationMonths) {
    const totalAmount = calculateTotalWithInterest(principal, rate, durationMonths);
    return totalAmount / durationMonths;
}

/**
 * إنشاء جدول الأقساط
 */
function generateInstallmentSchedule(installmentId, totalAmount, durationMonths, startDate) {
    const monthlyPayment = totalAmount / durationMonths;
    const startDateObj = new Date(startDate);
    const payments = [];
    
    for (let i = 0; i < durationMonths; i++) {
        const dueDate = new Date(startDateObj);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const payment = {
            id: generateInstallmentId(),
            installmentId,
            number: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: monthlyPayment,
            status: 'pending',
            paymentDate: null,
            notes: ''
        };
        
        payments.push(payment);
    }
    
    return payments;
}

/**
 * التحقق من تواريخ الاستحقاق وتحديث الحالة
 */
function checkDueDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let latePaymentsCount = 0;
    
    installmentPayments.forEach(payment => {
        if (payment.status === 'pending') {
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                // تحديث حالة القسط إلى متأخر
                payment.status = 'late';
                latePaymentsCount++;
                
                // إنشاء إشعار للقسط المتأخر
                const installment = installments.find(inst => inst.id === payment.installmentId);
                if (installment) {
                    const borrowerName = getBorrowerName(installment);
                    createNotification(
                        'قسط متأخر',
                        `القسط رقم ${payment.number} للمقترض ${borrowerName} متأخر عن موعد استحقاقه (${formatDate(payment.dueDate)})`,
                        'warning',
                        payment.id,
                        'installmentPayment'
                    );
                }
            }
        }
    });
    
    if (latePaymentsCount > 0) {
        console.log(`تم تحديث ${latePaymentsCount} قسط متأخر`);
        
        // حفظ التغييرات
        saveInstallmentData();
        
        // تحديث شارة الأقساط
        updateInstallmentsBadge();
    }
}

/**
 * التحقق من الأقساط المستحقة قريبًا
 */
function checkUpcomingInstallments() {
    if (!installmentSettings.enableNotifications) {
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingDays = installmentSettings.notificationDaysBeforeDue;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + upcomingDays);
    
    // الحصول على الأقساط المستحقة قريبًا
    const upcomingPayments = installmentPayments.filter(payment => {
        if (payment.status !== 'pending') return false;
        
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate >= today && dueDate <= futureDate;
    });
    
    // إنشاء إشعارات للأقساط المستحقة قريبًا
    upcomingPayments.forEach(payment => {
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return;
        
        const borrowerName = getBorrowerName(installment);
        const dueDate = new Date(payment.dueDate);
        const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        
        createNotification(
            'قسط مستحق قريبًا',
            `القسط رقم ${payment.number} للمقترض ${borrowerName} سيكون مستحقًا خلال ${daysDiff} يوم`,
            'info',
            payment.id,
            'installmentPayment'
        );
    });
}

/**
 * الحصول على اسم المقترض
 */
function getBorrowerName(installment) {
    if (!installment) return 'غير معروف';
    
    if (installment.borrowerType === 'investor') {
        const investor = investors.find(inv => inv.id === installment.borrowerId);
        return investor ? investor.name : 'مستثمر غير معروف';
    } else {
        return installment.borrowerName || 'مقترض غير معروف';
    }
}

/**
 * الحصول على اسم نوع المقترض
 */
function getBorrowerTypeName(borrowerType) {
    const category = borrowerCategories.find(cat => cat.id === borrowerType);
    return category ? category.name : borrowerType;
}

/**
 * الحصول على إجمالي سعر العناصر
 */
function getTotalItemsPrice(installmentId) {
    return installmentItems
        .filter(item => item.installmentId === installmentId)
        .reduce((total, item) => total + (item.totalPrice || 0), 0);
}

/**
 * الحصول على إجمالي المدفوعات
 */
function getTotalPayments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'paid')
        .reduce((total, payment) => total + payment.amount, 0);
}

/**
 * الحصول على عدد الأقساط المتبقية
 */
function getRemainingInstallments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status !== 'paid')
        .length;
}

/**
 * الحصول على عدد الأقساط المتأخرة
 */
function getLateInstallments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'late')
        .length;
}

// إصلاح دالة createNotification لمنع الاستدعاء الذاتي
function createNotification(title, message, type = 'info', entityId = null, entityType = null) {
    // التحقق من وجود وظيفة الإشعارات في النظام الرئيسي
    // والتأكد من أنها ليست نفس الدالة الحالية لتجنب الاستدعاء الذاتي
    if (typeof window.createNotification === 'function' && window.createNotification !== createNotification) {
        return window.createNotification(title, message, type, entityId, entityType);
    } else {
        // نسخة مبسطة من وظيفة الإشعارات
        console.log(`إشعار (${type}): ${title} - ${message}`);
        
        // إنشاء إشعار بسيط إذا لم يكن نظام الإشعارات الرئيسي متاحًا
        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.style.maxWidth = '500px';
        toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s ease';
        
        toast.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-text">${message}</div>
            </div>
            <div class="modal-close" style="position: absolute; top: 10px; left: 10px; cursor: pointer;" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }
}

/**
 * إضافة رابط الأقساط في القائمة الجانبية
 */
function addInstallmentsMenuLink() {
    // التحقق من وجود رابط الأقساط مسبقًا
    if (document.querySelector('.menu-item[href="#installments"]')) {
        // تحديث شارة الأقساط فقط
        updateInstallmentsBadge();
        return;
    }
    
    // التحقق من وجود شريط التنقل الجانبي
    const sidebar = document.querySelector('.sidebar-menu');
    if (!sidebar) {
        console.warn('لم يتم العثور على شريط التنقل الجانبي');
        return;
    }
    
    // التحقق من وجود قسم "إدارة الاستثمار"
    let investmentManagementCategory = Array.from(sidebar.querySelectorAll('.menu-category')).find(
        category => category.textContent.includes('إدارة الاستثمار')
    );
    
    if (!investmentManagementCategory) {
        // إنشاء القسم إذا لم يكن موجودًا
        investmentManagementCategory = document.createElement('div');
        investmentManagementCategory.className = 'menu-category';
        investmentManagementCategory.textContent = 'إدارة الاستثمار';
        
        // إضافة القسم بعد قسم "لوحة التحكم"
        const dashboardCategory = sidebar.querySelector('.menu-category:first-of-type');
        if (dashboardCategory) {
            dashboardCategory.insertAdjacentElement('afterend', investmentManagementCategory);
        } else {
            // إضافة القسم في بداية شريط التنقل إذا لم يكن هناك قسم "لوحة التحكم"
            sidebar.prepend(investmentManagementCategory);
        }
    }
    
    // إنشاء رابط الأقساط
    const installmentsLink = document.createElement('a');
    installmentsLink.href = '#installments';
    installmentsLink.className = 'menu-item';
    installmentsLink.innerHTML = `
        <span class="menu-icon"><i class="fas fa-receipt"></i></span>
        <span>نظام الأقساط</span>
        <span class="menu-badge" id="installmentsBadge" style="display:none;">0</span>
    `;
    
    // إضافة مستمع النقر
    installmentsLink.addEventListener('click', function(e) {
        // تأكد من إنشاء صفحة الأقساط قبل الانتقال إليها
        if (!document.getElementById('installments')) {
            createInstallmentsPage();
        }
        
        // عرض صفحة الأقساط
        if (typeof window.showPage === 'function') {
            window.showPage('installments');
        } else {
            // طريقة بديلة لعرض الصفحة إذا لم تكن دالة showPage متوفرة
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            const installmentsPage = document.getElementById('installments');
            if (installmentsPage) {
                installmentsPage.classList.add('active');
            }
            
            // تحديث حالة القائمة
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            installmentsLink.classList.add('active');
        }
        
        // تحميل محتوى صفحة الأقساط
        setTimeout(() => {
            loadInstallmentsPage();
        }, 100);
    });
    
    // البحث عن موقع مناسب لإضافة الرابط
    const operationsLink = sidebar.querySelector('a[href="#operations"]');
    const profitsLink = sidebar.querySelector('a[href="#profits"]');
    const reportsLink = sidebar.querySelector('a[href="#reports"]');
    
    if (operationsLink) {
        // إضافة بعد رابط العمليات
        operationsLink.insertAdjacentElement('afterend', installmentsLink);
    } else if (profitsLink) {
        // إضافة بعد رابط الأرباح
        profitsLink.insertAdjacentElement('afterend', installmentsLink);
    } else if (reportsLink) {
        // إضافة قبل رابط التقارير
        reportsLink.insertAdjacentElement('beforebegin', installmentsLink);
    } else {
        // إضافة في نهاية القسم
        investmentManagementCategory.insertAdjacentElement('afterend', installmentsLink);
    }
    
    // تحديث شارة الأقساط
    updateInstallmentsBadge();
    
    console.log('تم إضافة رابط الأقساط بنجاح');
}

/**
 * تحديث شارة الأقساط
 */
function updateInstallmentsBadge() {
    const latePayments = installmentPayments.filter(payment => payment.status === 'late').length;
    const badge = document.getElementById('installmentsBadge');
    
    if (badge) {
        badge.textContent = latePayments;
        badge.style.display = latePayments > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * إنشاء نسخة احتياطية من البيانات
 */
function createBackup(reason = 'manual') {
    // إنشاء اسم النسخة الافتراضي
    const defaultName = `نسخة احتياطية للأقساط ${new Date().toLocaleDateString('ar-IQ')}`;
    
    // طلب اسم للنسخة الاحتياطية إذا كانت يدوية
    let backupName = defaultName;
    if (reason === 'manual') {
        const userInput = prompt('أدخل اسماً للنسخة الاحتياطية:', defaultName);
        if (userInput === null) return; // المستخدم ألغى العملية
        if (userInput.trim() !== '') backupName = userInput;
    }
    
    // إنشاء كائن النسخة الاحتياطية
    const backup = {
        id: generateInstallmentId(),
        name: backupName,
        date: new Date().toISOString(),
        reason,
        data: {
            installments,
            installmentItems,
            installmentPayments,
            installmentSettings
        }
    };
    
    try {
        // التحقق من وجود قائمة النسخ الاحتياطية في التخزين المحلي
        let backupList = [];
        const storedBackupList = localStorage.getItem('installmentBackupList');
        
        if (storedBackupList) {
            backupList = JSON.parse(storedBackupList);
        }
        
        // إضافة النسخة الاحتياطية إلى القائمة
        backupList.push(backup);
        
        // الاحتفاظ بآخر 10 نسخ فقط
        if (backupList.length > 10) {
            backupList = backupList.slice(-10);
        }
        
        // حفظ قائمة النسخ الاحتياطية
        localStorage.setItem('installmentBackupList', JSON.stringify(backupList));
        
        // حفظ النسخة الاحتياطية نفسها في التخزين المحلي
        localStorage.setItem(`installmentBackup_${backup.id}`, JSON.stringify(backup));
        
        console.log(`تم إنشاء نسخة احتياطية: ${backupName}`);
        
        if (reason === 'manual') {
            createNotification('نجاح', 'تم إنشاء نسخة احتياطية بنجاح', 'success');
        }
        
        return backup.id;
    } catch (error) {
        console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
        
        if (reason === 'manual') {
            createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'danger');
        }
        
        return null;
    }
}

/**
 * استعادة نسخة احتياطية
 */
function restoreBackup(backupId) {
    try {
        // البحث عن النسخة الاحتياطية في التخزين المحلي
        const storedBackup = localStorage.getItem(`installmentBackup_${backupId}`);
        
        if (!storedBackup) {
            createNotification('خطأ', 'لم يتم العثور على النسخة الاحتياطية', 'danger');
            return false;
        }
        
        // تحليل النسخة الاحتياطية
        const backup = JSON.parse(storedBackup);
        
        // استعادة البيانات
        if (backup.data) {
            // إنشاء نسخة احتياطية قبل الاستعادة
            createBackup('before_restore');
            
            // استعادة البيانات
            if (backup.data.installments) installments = backup.data.installments;
            if (backup.data.installmentItems) installmentItems = backup.data.installmentItems;
            if (backup.data.installmentPayments) installmentPayments = backup.data.installmentPayments;
            if (backup.data.installmentSettings) installmentSettings = backup.data.installmentSettings;
            
            // حفظ البيانات المستعادة
            saveInstallmentData();
            saveInstallmentSettings();
            
            // إعادة تحميل صفحة الأقساط إذا كانت مفتوحة
            if (document.getElementById('installments') && document.getElementById('installments').classList.contains('active')) {
                loadInstallmentsPage();
            }
            
            // تحديث شارة الأقساط
            updateInstallmentsBadge();
            
            createNotification('نجاح', `تم استعادة النسخة الاحتياطية "${backup.name}" بنجاح`, 'success');
            return true;
        } else {
            createNotification('خطأ', 'النسخة الاحتياطية غير صالحة', 'danger');
            return false;
        }
    } catch (error) {
        console.error('خطأ في استعادة النسخة الاحتياطية:', error);
        createNotification('خطأ', 'حدث خطأ أثناء استعادة النسخة الاحتياطية', 'danger');
        return false;
    }
}

/**
 * الحصول على قائمة النسخ الاحتياطية
 */
function getBackupList() {
    try {
        const storedBackupList = localStorage.getItem('installmentBackupList');
        
        if (storedBackupList) {
            return JSON.parse(storedBackupList);
        }
        
        return [];
    } catch (error) {
        console.error('خطأ في الحصول على قائمة النسخ الاحتياطية:', error);
        return [];
    }
}

// ============ واجهة المستخدم وصفحة الأقساط ============

/**
 * إنشاء صفحة الأقساط
 */
function createInstallmentsPage() {
    console.log('إنشاء صفحة الأقساط...');
    
    // التحقق من وجود منطقة المحتوى
    const content = document.querySelector('.content');
    if (!content) {
        console.error('لم يتم العثور على منطقة المحتوى');
        return;
    }
    
    // التحقق من وجود صفحة الأقساط مسبقًا
    if (document.getElementById('installments')) {
        console.log('صفحة الأقساط موجودة بالفعل');
        return;
    }
    
    // إنشاء صفحة الأقساط
    const installmentsPage = document.createElement('div');
    installmentsPage.id = 'installments';
    installmentsPage.className = 'page';
    installmentsPage.innerHTML = `
        <div class="header">
            <h1 class="page-title">نظام الأقساط</h1>
            <div class="header-actions">
                <div class="search-bar">
                    <input type="text" class="search-input" id="installmentSearchInput" placeholder="بحث..." oninput="searchInstallments()">
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" onclick="openAddInstallmentModal()">
                    <i class="fas fa-plus"></i> إضافة قرض جديد
                </button>
                <div class="notification-btn" onclick="toggleNotificationPanel()">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notificationBadgeHeader">0</span>
                </div>
                <div class="menu-toggle" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </div>
            </div>
        </div>

        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">القروض النشطة</div>
                        <div class="card-value" id="totalActiveInstallments">0</div>
                    </div>
                    <div class="card-icon primary">
                        <i class="fas fa-receipt"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">القروض المكتملة</div>
                        <div class="card-value" id="totalCompletedInstallments">0</div>
                    </div>
                    <div class="card-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">إجمالي المبالغ</div>
                        <div class="card-value" id="totalInstallmentAmount">0 د.ع</div>
                    </div>
                    <div class="card-icon warning">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">المبالغ المدفوعة</div>
                        <div class="card-value" id="totalPaidInstallments">0 د.ع</div>
                    </div>
                    <div class="card-icon info">
                        <i class="fas fa-coins"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">المبالغ المتبقية</div>
                        <div class="card-value" id="totalRemainingInstallments">0 د.ع</div>
                    </div>
                    <div class="card-icon danger">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">الأقساط المتأخرة</div>
                        <div class="card-value" id="totalLatePayments">0</div>
                    </div>
                    <div class="card-icon danger">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">الأقساط المستحقة</div>
                        <div class="card-value" id="totalPendingPayments">0</div>
                    </div>
                    <div class="card-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" onclick="switchInstallmentsTab('all')">جميع القروض</div>
            <div class="tab" onclick="switchInstallmentsTab('active')">القروض النشطة</div>
            <div class="tab" onclick="switchInstallmentsTab('completed')">القروض المكتملة</div>
            <div class="tab" onclick="switchInstallmentsTab('defaulted')">القروض المتعثرة</div>
            <div class="tab" onclick="switchInstallmentsTab('upcoming')">الأقساط المستحقة قريباً</div>
            <div class="tab" onclick="switchInstallmentsTab('late')">الأقساط المتأخرة</div>
            <div class="tab" onclick="switchInstallmentsTab('statistics')">الإحصائيات</div>
            <div class="tab" onclick="switchInstallmentsTab('settings')">الإعدادات</div>
        </div>

        <div class="table-container" id="mainInstallmentsTable">
            <div class="table-header">
                <div class="table-title">قائمة القروض بالأقساط</div>
                <div class="table-actions">
                    <button class="btn btn-light" onclick="exportInstallments()">
                        <i class="fas fa-file-export"></i> تصدير
                    </button>
                    <button class="btn btn-light" onclick="printTable('installmentsTable')">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                    <button class="btn btn-primary" onclick="createBackup('manual')">
                        <i class="fas fa-save"></i> نسخة احتياطية
                    </button>
                </div>
            </div>
            <table class="table" id="installmentsTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المقترض</th>
                        <th>النوع</th>
                        <th>المبلغ الإجمالي</th>
                        <th>المبلغ المدفوع</th>
                        <th>المبلغ المتبقي</th>
                        <th>الأقساط المتبقية</th>
                        <th>تاريخ البدء</th>
                        <th>الحالة</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody id="installmentsTableBody">
                    <!-- سيتم ملؤها بواسطة JavaScript -->
                </tbody>
            </table>
        </div>

        <div class="grid-layout" id="installmentsDetailsGrids" style="display: none;">
            <div class="table-container" id="upcomingPaymentsContainer">
                <div class="table-header">
                    <div class="table-title">الأقساط المستحقة قريباً</div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>المقترض</th>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>النوع</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="upcomingPaymentsTableBody">
                        <!-- سيتم ملؤها بواسطة JavaScript -->
                    </tbody>
                </table>
            </div>

            <div class="table-container" id="latePaymentsContainer">
                <div class="table-header">
                    <div class="table-title">الأقساط المتأخرة</div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>المقترض</th>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>التأخير</th>
                            <th>المبلغ</th>
                            <th>النوع</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="latePaymentsTableBody">
                        <!-- سيتم ملؤها بواسطة JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="chart-container" id="installmentsChartContainer" style="display: none;">
            <div class="chart-header">
                <div class="chart-title">تحليل الأقساط</div>
                <div class="chart-actions">
                    <button class="btn btn-sm btn-light active" onclick="switchInstallmentsChartPeriod('monthly')">شهري</button>
                    <button class="btn btn-sm btn-light" onclick="switchInstallmentsChartPeriod('quarterly')">ربع سنوي</button>
                    <button class="btn btn-sm btn-light" onclick="switchInstallmentsChartPeriod('yearly')">سنوي</button>
                    <button class="btn btn-sm btn-light" onclick="exportInstallmentsChart()"><i class="fas fa-download"></i> تصدير</button>
                </div>
            </div>
            <div id="installmentsChart" style="height: 300px; width: 100%;">
                <!-- سيتم رسم المخطط البياني هنا -->
            </div>
        </div>
        
        <div id="installmentsSettings" style="display: none;">
            <div class="form-container">
                <h2>إعدادات نظام الأقساط</h2>
                
                <form id="installmentSettingsForm">
                    <div class="form-group">
                        <h3>الإعدادات العامة</h3>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">معدل الفائدة الافتراضي (%)</label>
                            <input type="number" class="form-control" id="defaultInterestRate" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">مدة القرض الافتراضية (بالأشهر)</label>
                            <input type="number" class="form-control" id="defaultDurationMonths" min="1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">نسبة غرامة التأخير (%)</label>
                            <input type="number" class="form-control" id="lateFeePercentage" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الحد الأدنى لمبلغ القسط</label>
                            <input type="number" class="form-control" id="minInstallmentAmount" min="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الحد الأقصى لمبلغ القسط (0 = غير محدود)</label>
                            <input type="number" class="form-control" id="maxInstallmentAmount" min="0">
                        </div>
                        <div class="form-group">
                            <div class="form-check" style="margin-top: 30px;">
                                <input type="checkbox" class="form-check-input" id="allowPartialPayments">
                                <label class="form-check-label" for="allowPartialPayments">السماح بالدفع الجزئي</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3>إعدادات الإشعارات</h3>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="enableNotifications">
                                <label class="form-check-label" for="enableNotifications">تفعيل الإشعارات</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">عدد أيام التذكير قبل موعد الاستحقاق</label>
                            <input type="number" class="form-control" id="notificationDaysBeforeDue" min="1" max="30">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3>إعدادات التكامل</h3>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="showInInvestorProfile">
                                <label class="form-check-label" for="showInInvestorProfile">إظهار الأقساط في ملف المستثمر</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" onclick="saveInstallmentSettingsFromForm()">
                                <i class="fas fa-save"></i> حفظ الإعدادات
                            </button>
                            <button type="button" class="btn btn-light" onclick="resetInstallmentSettings()">
                                <i class="fas fa-undo"></i> استعادة الإعدادات الافتراضية
                            </button>
                        </div>
                    </div>
                </form>
                
                <div class="form-group" style="margin-top: 20px;">
                    <h3>النسخ الاحتياطية</h3>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">النسخ الاحتياطية المتوفرة</label>
                        <select class="form-select" id="backupListSelect" style="width: 100%;">
                            <option value="">-- اختر نسخة احتياطية --</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <button type="button" class="btn btn-primary" onclick="createBackup('manual')">
                            <i class="fas fa-save"></i> إنشاء نسخة احتياطية
                        </button>
                        <button type="button" class="btn btn-warning" onclick="restoreSelectedBackup()">
                            <i class="fas fa-undo"></i> استعادة النسخة المحددة
                        </button>
                        <button type="button" class="btn btn-info" onclick="exportSelectedBackup()">
                            <i class="fas fa-download"></i> تصدير النسخة المحددة
                        </button>
                        <button type="button" class="btn btn-danger" onclick="deleteSelectedBackup()">
                            <i class="fas fa-trash"></i> حذف النسخة المحددة
                        </button>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 20px;">
                    <h3>تصدير واستيراد البيانات</h3>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <button type="button" class="btn btn-primary" onclick="exportAllInstallmentData()">
                            <i class="fas fa-file-export"></i> تصدير جميع البيانات
                        </button>
                        <button type="button" class="btn btn-warning" onclick="openImportDataModal()">
                            <i class="fas fa-file-import"></i> استيراد بيانات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى منطقة المحتوى
    content.appendChild(installmentsPage);
    
    console.log('تم إنشاء صفحة الأقساط بنجاح');
    isInstallmentPageInitialized = true;
}

/**
 * تحميل صفحة الأقساط
 */
function loadInstallmentsPage() {
    console.log('تحميل صفحة الأقساط...');
    
    // تأكد من تحميل البيانات
    loadInstallmentData();
    
    // تحديث البطاقات الرئيسية
    updateInstallmentsDashboardCards();
    
    // تحميل جدول الأقساط
    loadInstallmentsTable();
    
    // تحديث شارة الأقساط
    updateInstallmentsBadge();
    
    // التحقق من تواريخ استحقاق الأقساط
    checkDueDates();
    
    // ملء قائمة النسخ الاحتياطية في إعدادات الأقساط
    populateBackupList();
    
    // ملء نموذج إعدادات الأقساط
    populateInstallmentSettingsForm();
    
    console.log('تم تحميل صفحة الأقساط بنجاح');
}

/**
 * ملء نموذج إعدادات الأقساط
 */
function populateInstallmentSettingsForm() {
    // التحقق من وجود النموذج
    const form = document.getElementById('installmentSettingsForm');
    if (!form) return;
    
    // ملء الحقول بالإعدادات الحالية
    document.getElementById('defaultInterestRate').value = installmentSettings.defaultInterestRate;
    document.getElementById('defaultDurationMonths').value = installmentSettings.defaultDurationMonths;
    document.getElementById('lateFeePercentage').value = installmentSettings.lateFeePercentage;
    document.getElementById('minInstallmentAmount').value = installmentSettings.minInstallmentAmount;
    document.getElementById('maxInstallmentAmount').value = installmentSettings.maxInstallmentAmount;
    document.getElementById('allowPartialPayments').checked = installmentSettings.allowPartialPayments;
    document.getElementById('enableNotifications').checked = installmentSettings.enableNotifications;
    document.getElementById('notificationDaysBeforeDue').value = installmentSettings.notificationDaysBeforeDue;
    document.getElementById('showInInvestorProfile').checked = installmentSettings.showInInvestorProfile;
}

/**
 * حفظ إعدادات الأقساط من النموذج
 */
function saveInstallmentSettingsFromForm() {
    // الحصول على قيم الحقول
    const defaultInterestRate = parseFloat(document.getElementById('defaultInterestRate').value);
    const defaultDurationMonths = parseInt(document.getElementById('defaultDurationMonths').value);
    const lateFeePercentage = parseFloat(document.getElementById('lateFeePercentage').value);
    const minInstallmentAmount = parseFloat(document.getElementById('minInstallmentAmount').value);
    const maxInstallmentAmount = parseFloat(document.getElementById('maxInstallmentAmount').value);
    const allowPartialPayments = document.getElementById('allowPartialPayments').checked;
    const enableNotifications = document.getElementById('enableNotifications').checked;
    const notificationDaysBeforeDue = parseInt(document.getElementById('notificationDaysBeforeDue').value);
    const showInInvestorProfile = document.getElementById('showInInvestorProfile').checked;
    
    // التحقق من صحة القيم
    if (isNaN(defaultInterestRate) || isNaN(defaultDurationMonths) || isNaN(lateFeePercentage) || 
        isNaN(minInstallmentAmount) || isNaN(maxInstallmentAmount) || isNaN(notificationDaysBeforeDue)) {
        createNotification('خطأ', 'يرجى التأكد من صحة جميع القيم', 'danger');
        return;
    }
    
    // تحديث الإعدادات
    installmentSettings.defaultInterestRate = defaultInterestRate;
    installmentSettings.defaultDurationMonths = defaultDurationMonths;
    installmentSettings.lateFeePercentage = lateFeePercentage;
    installmentSettings.minInstallmentAmount = minInstallmentAmount;
    installmentSettings.maxInstallmentAmount = maxInstallmentAmount;
    installmentSettings.allowPartialPayments = allowPartialPayments;
    installmentSettings.enableNotifications = enableNotifications;
    installmentSettings.notificationDaysBeforeDue = notificationDaysBeforeDue;
    installmentSettings.showInInvestorProfile = showInInvestorProfile;
    
    // حفظ الإعدادات
    if (saveInstallmentSettings()) {
        createNotification('نجاح', 'تم حفظ الإعدادات بنجاح', 'success');
        
        // إعادة دمج الأقساط مع ملفات المستثمرين إذا تم تفعيل الخيار
        if (showInInvestorProfile) {
            integrateWithInvestorProfiles();
        }
    }
}

/**
 * إعادة تعيين إعدادات الأقساط إلى القيم الافتراضية
 */
function resetInstallmentSettings() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
        return;
    }
    
    // إعادة تعيين الإعدادات
    installmentSettings = {
        defaultInterestRate: 4,
        defaultDurationMonths: 12,
        lateFeePercentage: 0.5,
        maxInstallmentAmount: 0,
        minInstallmentAmount: 50000,
        enableNotifications: true,
        notificationDaysBeforeDue: 3,
        allowPartialPayments: true,
        showInInvestorProfile: true
    };
    
    // حفظ الإعدادات
    if (saveInstallmentSettings()) {
        // إعادة ملء النموذج
        populateInstallmentSettingsForm();
        
        createNotification('نجاح', 'تم إعادة تعيين الإعدادات بنجاح', 'success');
    }
}

/**
 * ملء قائمة النسخ الاحتياطية
 */
function populateBackupList() {
    const select = document.getElementById('backupListSelect');
    if (!select) return;
    
    // مسح القائمة
    select.innerHTML = '<option value="">-- اختر نسخة احتياطية --</option>';
    
    // الحصول على قائمة النسخ الاحتياطية
    const backupList = getBackupList();
    
    if (backupList.length === 0) {
        select.innerHTML = '<option value="">لا توجد نسخ احتياطية</option>';
        return;
    }
    
    // ترتيب النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
    backupList.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إضافة النسخ الاحتياطية إلى القائمة
    backupList.forEach(backup => {
        const option = document.createElement('option');
        option.value = backup.id;
        option.textContent = `${backup.name} (${new Date(backup.date).toLocaleString('ar-IQ')})`;
        select.appendChild(option);
    });
}

/**
 * استعادة النسخة الاحتياطية المحددة
 */
function restoreSelectedBackup() {
    const select = document.getElementById('backupListSelect');
    if (!select || !select.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية المحددة؟ سيتم استبدال جميع البيانات الحالية.')) {
        return;
    }
    
    // استعادة النسخة الاحتياطية
    restoreBackup(select.value);
}

/**
 * تصدير النسخة الاحتياطية المحددة
 */
function exportSelectedBackup() {
    const select = document.getElementById('backupListSelect');
    if (!select || !select.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    try {
        // الحصول على النسخة الاحتياطية
        const storedBackup = localStorage.getItem(`installmentBackup_${select.value}`);
        
        if (!storedBackup) {
            createNotification('خطأ', 'لم يتم العثور على النسخة الاحتياطية', 'danger');
            return;
        }
        
        // تحليل النسخة الاحتياطية
        const backup = JSON.parse(storedBackup);
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(backup, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // إنشاء عنصر لتنزيل الملف
        const a = document.createElement('a');
        a.href = url;
        a.download = `installments_backup_${new Date(backup.date).toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        createNotification('نجاح', 'تم تصدير النسخة الاحتياطية بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير النسخة الاحتياطية:', error);
        createNotification('خطأ', 'حدث خطأ أثناء تصدير النسخة الاحتياطية', 'danger');
    }
}

/**
 * حذف النسخة الاحتياطية المحددة
 */
function deleteSelectedBackup() {
    const select = document.getElementById('backupListSelect');
    if (!select || !select.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    if (!confirm('هل أنت متأكد من حذف النسخة الاحتياطية المحددة؟')) {
        return;
    }
    
    try {
        const backupId = select.value;
        
        // الحصول على قائمة النسخ الاحتياطية
        let backupList = getBackupList();
        
        // البحث عن النسخة الاحتياطية
        const backupIndex = backupList.findIndex(b => b.id === backupId);
        
        if (backupIndex === -1) {
            createNotification('خطأ', 'لم يتم العثور على النسخة الاحتياطية', 'danger');
            return;
        }
        
        // حذف النسخة الاحتياطية من القائمة
        backupList.splice(backupIndex, 1);
        
        // حفظ قائمة النسخ الاحتياطية
        localStorage.setItem('installmentBackupList', JSON.stringify(backupList));
        
        // حذف النسخة الاحتياطية نفسها
        localStorage.removeItem(`installmentBackup_${backupId}`);
        
        // إعادة ملء قائمة النسخ الاحتياطية
        populateBackupList();
        
        createNotification('نجاح', 'تم حذف النسخة الاحتياطية بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حذف النسخة الاحتياطية:', error);
        createNotification('خطأ', 'حدث خطأ أثناء حذف النسخة الاحتياطية', 'danger');
    }
}

/**
 * استكمال كود نظام إدارة الأقساط المحسن
 */

// استكمال دالة تصدير جميع بيانات الأقساط
function exportAllInstallmentData() {
    try {
        // إنشاء كائن البيانات
        const exportData = {
            installments,
            installmentItems,
            installmentPayments,
            installmentSettings,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // إنشاء عنصر لتنزيل الملف
        const a = document.createElement('a');
        a.href = url;
        a.download = `installments_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        createNotification('نجاح', 'تم تصدير جميع البيانات بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        createNotification('خطأ', 'حدث خطأ أثناء تصدير البيانات', 'danger');
    }
}

/**
 * فتح نافذة استيراد البيانات
 */
function openImportDataModal() {
    // إنشاء نافذة الاستيراد
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'importDataModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">استيراد بيانات الأقساط</h2>
                <div class="modal-close" onclick="document.getElementById('importDataModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-warning">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">تنبيه</div>
                        <div class="alert-text">سيؤدي استيراد البيانات إلى استبدال جميع البيانات الحالية. يرجى التأكد من إنشاء نسخة احتياطية قبل المتابعة.</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">ملف البيانات (JSON)</label>
                    <input type="file" class="form-control" id="importDataFile" accept=".json">
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="importSettings">
                        <label class="form-check-label" for="importSettings">استيراد الإعدادات</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="mergeData">
                        <label class="form-check-label" for="mergeData">دمج البيانات مع البيانات الحالية</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('importDataModal').remove()">إلغاء</button>
                <button class="btn btn-primary" onclick="importInstallmentData()">استيراد</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * استيراد بيانات الأقساط
 */
function importInstallmentData() {
    const fileInput = document.getElementById('importDataFile');
    const importSettings = document.getElementById('importSettings').checked;
    const mergeData = document.getElementById('mergeData').checked;
    
    if (!fileInput || !fileInput.files.length) {
        createNotification('خطأ', 'يرجى اختيار ملف', 'danger');
        return;
    }
    
    if (!mergeData && !confirm('سيؤدي استيراد البيانات إلى استبدال جميع البيانات الحالية. هل أنت متأكد من المتابعة؟')) {
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // التحقق من صحة البيانات
            if (!importedData.installments || !Array.isArray(importedData.installments) ||
                !importedData.installmentItems || !Array.isArray(importedData.installmentItems) ||
                !importedData.installmentPayments || !Array.isArray(importedData.installmentPayments)) {
                createNotification('خطأ', 'الملف المستورد غير صالح', 'danger');
                return;
            }
            
            // إنشاء نسخة احتياطية قبل الاستيراد
            createBackup('before_import');
            
            if (mergeData) {
                // دمج البيانات المستوردة مع البيانات الحالية
                mergeImportedData(importedData);
            } else {
                // استبدال البيانات الحالية بالبيانات المستوردة
                installments = importedData.installments;
                installmentItems = importedData.installmentItems;
                installmentPayments = importedData.installmentPayments;
                
                if (importSettings && importedData.installmentSettings) {
                    installmentSettings = importedData.installmentSettings;
                }
            }
            
            // حفظ البيانات
            saveInstallmentData();
            if (importSettings) saveInstallmentSettings();
            
            // إغلاق النافذة
            document.getElementById('importDataModal').remove();
            
            // إعادة تحميل صفحة الأقساط
            loadInstallmentsPage();
            
            createNotification('نجاح', 'تم استيراد البيانات بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            createNotification('خطأ', 'حدث خطأ أثناء استيراد البيانات', 'danger');
        }
    };
    
    reader.readAsText(file);
}

/**
 * دمج البيانات المستوردة مع البيانات الحالية
 */
function mergeImportedData(importedData) {
    // دمج الأقساط
    const existingInstallmentIds = installments.map(inst => inst.id);
    
    importedData.installments.forEach(importedInst => {
        if (!existingInstallmentIds.includes(importedInst.id)) {
            // إضافة قرض جديد
            installments.push(importedInst);
        } else {
            // تحديث قرض موجود (اختياري حسب سياسة الدمج)
            // في هذا المثال، نحتفظ بالبيانات الحالية
        }
    });
    
    // دمج عناصر الأقساط
    const existingItemIds = installmentItems.map(item => item.id);
    
    importedData.installmentItems.forEach(importedItem => {
        if (!existingItemIds.includes(importedItem.id)) {
            // إضافة عنصر جديد
            installmentItems.push(importedItem);
        }
    });
    
    // دمج مدفوعات الأقساط
    const existingPaymentIds = installmentPayments.map(payment => payment.id);
    
    importedData.installmentPayments.forEach(importedPayment => {
        if (!existingPaymentIds.includes(importedPayment.id)) {
            // إضافة دفعة جديدة
            installmentPayments.push(importedPayment);
        }
    });
}

/**
 * تحديث بطاقات لوحة التحكم
 */
function updateInstallmentsDashboardCards() {
    // حساب عدد القروض النشطة
    const activeInstallments = installments.filter(inst => inst.status === 'active').length;
    document.getElementById('totalActiveInstallments').textContent = activeInstallments;
    
    // حساب عدد القروض المكتملة
    const completedInstallments = installments.filter(inst => inst.status === 'completed').length;
    document.getElementById('totalCompletedInstallments').textContent = completedInstallments;
    
    // حساب إجمالي المبالغ
    const totalAmount = installments.reduce((total, inst) => total + inst.totalAmount, 0);
    document.getElementById('totalInstallmentAmount').textContent = formatCurrency(totalAmount);
    
    // حساب المبالغ المدفوعة
    const totalPaid = installmentPayments
        .filter(payment => payment.status === 'paid')
        .reduce((total, payment) => total + payment.amount, 0);
    document.getElementById('totalPaidInstallments').textContent = formatCurrency(totalPaid);
    
    // حساب المبالغ المتبقية
    const totalRemaining = totalAmount - totalPaid;
    document.getElementById('totalRemainingInstallments').textContent = formatCurrency(totalRemaining);
    
    // حساب عدد الأقساط المتأخرة
    const latePayments = installmentPayments.filter(payment => payment.status === 'late').length;
    document.getElementById('totalLatePayments').textContent = latePayments;
    
    // حساب عدد الأقساط المستحقة
    const pendingPayments = installmentPayments.filter(payment => payment.status === 'pending').length;
    document.getElementById('totalPendingPayments').textContent = pendingPayments;
}

/**
 * تحميل جدول الأقساط
 */
function loadInstallmentsTable(status = 'all') {
    const tbody = document.getElementById('installmentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تصفية الأقساط حسب الحالة
    let filteredInstallments = [...installments];
    if (status !== 'all') {
        filteredInstallments = installments.filter(inst => inst.status === status);
    }
    
    // ترتيب الأقساط حسب تاريخ البدء (الأحدث أولاً)
    filteredInstallments.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    if (filteredInstallments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="10" style="text-align: center;">لا توجد أقساط ${
            status === 'active' ? 'نشطة' : 
            status === 'completed' ? 'مكتملة' : 
            status === 'defaulted' ? 'متعثرة' : ''
        }</td>`;
        tbody.appendChild(row);
        return;
    }
    
    filteredInstallments.forEach((installment, index) => {
        const totalPaid = getTotalPayments(installment.id);
        const remaining = installment.totalAmount - totalPaid;
        const remainingInstallments = getRemainingInstallments(installment.id);
        const lateInstallments = getLateInstallments(installment.id);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${getBorrowerName(installment)}</td>
            <td>${getBorrowerTypeName(installment.borrowerType)}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${formatCurrency(totalPaid)}</td>
            <td>${formatCurrency(remaining)}</td>
            <td>${remainingInstallments} / ${installment.durationMonths}</td>
            <td>${formatDate(installment.startDate)}</td>
            <td>
                <span class="status ${
                    installment.status === 'active' ? 'active' : 
                    installment.status === 'completed' ? 'success' : 
                    'danger'
                }">
                    ${
                        installment.status === 'active' ? 'نشط' : 
                        installment.status === 'completed' ? 'مكتمل' : 
                        'متعثر'
                    }
                    ${lateInstallments > 0 ? ` <span class="badge-warning">${lateInstallments} متأخر</span>` : ''}
                </span>
            </td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="viewInstallment('${installment.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-icon action-btn" onclick="editInstallment('${installment.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="openDeleteInstallmentModal('${installment.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * تبديل علامة تبويب الأقساط
 */
function switchInstallmentsTab(tabId) {
    // تحديث علامات التبويب
    document.querySelectorAll('#installments .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`#installments .tab[onclick="switchInstallmentsTab('${tabId}')"]`).classList.add('active');
    
    // إخفاء/إظهار العناصر حسب علامة التبويب
    const mainTable = document.getElementById('mainInstallmentsTable');
    const grids = document.getElementById('installmentsDetailsGrids');
    const chartContainer = document.getElementById('installmentsChartContainer');
    const settingsContainer = document.getElementById('installmentsSettings');
    
    // إخفاء جميع العناصر أولاً
    mainTable.style.display = 'none';
    grids.style.display = 'none';
    chartContainer.style.display = 'none';
    settingsContainer.style.display = 'none';
    
    // إظهار العناصر حسب علامة التبويب
    switch (tabId) {
        case 'all':
        case 'active':
        case 'completed':
        case 'defaulted':
            // تحديث عنوان الجدول
            const tableTitle = mainTable.querySelector('.table-title');
            tableTitle.textContent = `قائمة القروض ${
                tabId === 'active' ? 'النشطة' : 
                tabId === 'completed' ? 'المكتملة' : 
                tabId === 'defaulted' ? 'المتعثرة' : ''
            }`;
            
            // تحميل جدول الأقساط
            loadInstallmentsTable(tabId);
            
            // إظهار جدول الأقساط
            mainTable.style.display = 'block';
            break;
            
        case 'upcoming':
        case 'late':
            // تحميل الأقساط المستحقة قريباً والمتأخرة
            loadUpcomingPayments();
            loadLatePayments();
            
            // إظهار الشبكة
            grids.style.display = 'grid';
            break;
            
        case 'statistics':
            // تحميل الرسم البياني
            loadInstallmentsChart();
            
            // إظهار الرسم البياني
            chartContainer.style.display = 'block';
            break;
            
        case 'settings':
            // ملء نموذج الإعدادات
            populateInstallmentSettingsForm();
            
            // ملء قائمة النسخ الاحتياطية
            populateBackupList();
            
            // إظهار الإعدادات
            settingsContainer.style.display = 'block';
            break;
    }
}

/**
 * تحميل الأقساط المستحقة قريباً
 */
function loadUpcomingPayments() {
    const tbody = document.getElementById('upcomingPaymentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // الحصول على الأقساط المستحقة قريباً
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingDays = installmentSettings.notificationDaysBeforeDue;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + upcomingDays);
    
    const upcomingPayments = installmentPayments.filter(payment => {
        if (payment.status !== 'pending') return false;
        
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate >= today && dueDate <= futureDate;
    });
    
    if (upcomingPayments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center;">لا توجد أقساط مستحقة قريباً</td>`;
        tbody.appendChild(row);
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    upcomingPayments.forEach(payment => {
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return;
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${getBorrowerName(installment)}</td>
            <td>${payment.number} / ${installment.durationMonths}</td>
            <td>${formatDate(payment.dueDate)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${getBorrowerTypeName(installment.borrowerType)}</td>
            <td>
                <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentModal('${payment.id}')">
                    <i class="fas fa-money-bill"></i> دفع
                </button>
                <button class="btn btn-info btn-icon action-btn" onclick="viewInstallmentPayment('${payment.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * تحميل الأقساط المتأخرة
 */
function loadLatePayments() {
    const tbody = document.getElementById('latePaymentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // الحصول على الأقساط المتأخرة
    const latePayments = installmentPayments.filter(payment => payment.status === 'late');
    
    if (latePayments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center;">لا توجد أقساط متأخرة</td>`;
        tbody.appendChild(row);
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    latePayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    latePayments.forEach(payment => {
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return;
        
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${getBorrowerName(installment)}</td>
            <td>${payment.number} / ${installment.durationMonths}</td>
            <td>${formatDate(payment.dueDate)}</td>
            <td>${daysDiff} يوم</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${getBorrowerTypeName(installment.borrowerType)}</td>
            <td>
                <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentModal('${payment.id}')">
                    <i class="fas fa-money-bill"></i> دفع
                </button>
                <button class="btn btn-info btn-icon action-btn" onclick="viewInstallmentPayment('${payment.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * تحميل الرسم البياني للأقساط
 */
function loadInstallmentsChart(period = 'monthly') {
    const chartContainer = document.getElementById('installmentsChart');
    if (!chartContainer) return;
    
    // إنشاء بيانات الرسم البياني
    let labels = [];
    let totalAmountData = [];
    let paidAmountData = [];
    let remainingAmountData = [];
    
    const now = new Date();
    let startDate;
    let endDate = new Date(now);
    
    // تحديد الفترة
    switch (period) {
        case 'monthly':
            // آخر 12 شهر
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 11);
            
            for (let i = 0; i < 12; i++) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                
                const monthName = date.toLocaleDateString('ar', { month: 'long' });
                labels.push(monthName);
                
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                
                // حساب إجمالي مبالغ الأقساط المستحقة في هذا الشهر
                const monthlyTotal = installmentPayments
                    .filter(payment => {
                        const paymentDate = new Date(payment.dueDate);
                        return paymentDate >= monthStart && paymentDate <= monthEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المدفوعة في هذا الشهر
                const monthlyPaid = installmentPayments
                    .filter(payment => {
                        if (payment.status !== 'paid' || !payment.paymentDate) return false;
                        const paymentDate = new Date(payment.paymentDate);
                        return paymentDate >= monthStart && paymentDate <= monthEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المتبقية
                const monthlyRemaining = monthlyTotal - monthlyPaid;
                
                totalAmountData.push(monthlyTotal);
                paidAmountData.push(monthlyPaid);
                remainingAmountData.push(monthlyRemaining);
            }
            break;
            
        case 'quarterly':
            // آخر 4 أرباع سنة
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 11);
            
            for (let i = 0; i < 4; i++) {
                const quarter = i + 1;
                labels.push(`الربع ${quarter}`);
                
                const quarterStart = new Date(startDate);
                quarterStart.setMonth(quarterStart.getMonth() + (i * 3));
                
                const quarterEnd = new Date(quarterStart);
                quarterEnd.setMonth(quarterEnd.getMonth() + 3);
                quarterEnd.setDate(0);
                
                // حساب إجمالي مبالغ الأقساط المستحقة في هذا الربع
                const quarterlyTotal = installmentPayments
                    .filter(payment => {
                        const paymentDate = new Date(payment.dueDate);
                        return paymentDate >= quarterStart && paymentDate <= quarterEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المدفوعة في هذا الربع
                const quarterlyPaid = installmentPayments
                    .filter(payment => {
                        if (payment.status !== 'paid' || !payment.paymentDate) return false;
                        const paymentDate = new Date(payment.paymentDate);
                        return paymentDate >= quarterStart && paymentDate <= quarterEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المتبقية
                const quarterlyRemaining = quarterlyTotal - quarterlyPaid;
                
                totalAmountData.push(quarterlyTotal);
                paidAmountData.push(quarterlyPaid);
                remainingAmountData.push(quarterlyRemaining);
            }
            break;
            
        case 'yearly':
            // آخر 5 سنوات
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 4);
            
            for (let i = 0; i < 5; i++) {
                const year = startDate.getFullYear() + i;
                labels.push(year.toString());
                
                const yearStart = new Date(year, 0, 1);
                const yearEnd = new Date(year, 11, 31);
                
                // حساب إجمالي مبالغ الأقساط المستحقة في هذه السنة
                const yearlyTotal = installmentPayments
                    .filter(payment => {
                        const paymentDate = new Date(payment.dueDate);
                        return paymentDate >= yearStart && paymentDate <= yearEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المدفوعة في هذه السنة
                const yearlyPaid = installmentPayments
                    .filter(payment => {
                        if (payment.status !== 'paid' || !payment.paymentDate) return false;
                        const paymentDate = new Date(payment.paymentDate);
                        return paymentDate >= yearStart && paymentDate <= yearEnd;
                    })
                    .reduce((total, payment) => total + payment.amount, 0);
                
                // حساب المبالغ المتبقية
                const yearlyRemaining = yearlyTotal - yearlyPaid;
                
                totalAmountData.push(yearlyTotal);
                paidAmountData.push(yearlyPaid);
                remainingAmountData.push(yearlyRemaining);
            }
            break;
    }
    
    // رسم المخطط البياني
    // تنظيف الحاوية
    chartContainer.innerHTML = '';
    
    // إنشاء عنصر canvas
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // إنشاء الرسم البياني
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'المبالغ المستحقة',
                    data: totalAmountData,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
                    borderWidth: 1
                },
                {
                    label: 'المبالغ المدفوعة',
                    data: paidAmountData,
                    backgroundColor: 'rgba(46, 204, 113, 0.6)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                },
                {
                    label: 'المبالغ المتبقية',
                    data: remainingAmountData,
                    backgroundColor: 'rgba(231, 76, 60, 0.6)',
                    borderColor: '#e74c3c',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value).replace(` ${settings.currency}`, '');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * تبديل فترة الرسم البياني للأقساط
 */
function switchInstallmentsChartPeriod(period) {
    // تحديث حالة الأزرار
    document.querySelectorAll('#installmentsChartContainer .chart-actions button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`#installmentsChartContainer .chart-actions button[onclick="switchInstallmentsChartPeriod('${period}')"]`).classList.add('active');
    
    // تحميل الرسم البياني
    loadInstallmentsChart(period);
}

/**
 * البحث في الأقساط
 */
function searchInstallments() {
    const searchTerm = document.getElementById('installmentSearchInput').value.toLowerCase();
    const tbody = document.getElementById('installmentsTableBody');
    
    if (!tbody) return;
    
    // إذا كان مصطلح البحث فارغًا، إعادة تحميل الجدول
    if (!searchTerm) {
        const activeTab = document.querySelector('#installments .tab.active');
        const tabId = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        if (['all', 'active', 'completed', 'defaulted'].includes(tabId)) {
            loadInstallmentsTable(tabId);
        }
        
        return;
    }
    
    // الحصول على جميع صفوف الجدول
    const rows = tbody.querySelectorAll('tr');
    
    let matchFound = false;
    
    // تصفية الصفوف
    rows.forEach(row => {
        // جمع النص من جميع الخلايا باستثناء خلية الإجراءات
        const rowText = Array.from(row.querySelectorAll('td:not(:last-child)'))
            .map(cell => cell.textContent.toLowerCase())
            .join(' ');
        
        // إظهار الصف إذا كان النص يحتوي على مصطلح البحث
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
            matchFound = true;
        } else {
            row.style.display = 'none';
        }
    });
    
    // إظهار رسالة إذا لم يتم العثور على تطابقات
    if (!matchFound && rows.length > 0) {
        // إذا كان هناك صف واحد فقط وهو صف "لا توجد أقساط"، لا نقوم بإضافة صف جديد
        const singleRow = rows[0];
        const singleCell = singleRow.querySelector('td[colspan]');
        
        if (singleRow && singleCell) {
            // لا نفعل شيئًا، الصف موجود بالفعل
        } else {
            // إضافة صف للإشارة إلى عدم وجود تطابقات
            const noMatchRow = document.createElement('tr');
            noMatchRow.innerHTML = `<td colspan="10" style="text-align: center;">لا توجد نتائج مطابقة لـ "${searchTerm}"</td>`;
            tbody.appendChild(noMatchRow);
        }
    }
}

/**
 * فتح النافذة المنبثقة لإضافة قرض جديد بالأقساط
 */
function openAddInstallmentModal(investorId = null) {
    // تنظيف قائمة العناصر المؤقتة
    tempInstallmentItems = [];
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إضافة قرض جديد بالأقساط</h2>
                <div class="modal-close" onclick="document.getElementById('addInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('borrowerInfo', 'addInstallmentModal')">معلومات المقترض</div>
                    <div class="modal-tab" onclick="switchModalTab('itemsInfo', 'addInstallmentModal')">العناصر</div>
                    <div class="modal-tab" onclick="switchModalTab('installmentInfo', 'addInstallmentModal')">معلومات القرض</div>
                </div>
                <div class="modal-tab-content active" id="borrowerInfo">
                    <form id="borrowerForm">
                        <div class="form-group">
                            <label class="form-label">نوع المقترض</label>
                            <select class="form-select" id="borrowerType" onchange="toggleBorrowerFields()">
                                ${borrowerCategories.map(cat => `
                                    <option value="${cat.id}" ${cat.id === 'investor' ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div id="investorField">
                            <div class="form-group">
                                <label class="form-label">المستثمر</label>
                                <select class="form-select" id="borrowerId">
                                    <option value="">اختر المستثمر</option>
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </select>
                            </div>
                        </div>
                        
                        <div id="otherBorrowerFields" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">الاسم الكامل</label>
                                    <input type="text" class="form-control" id="borrowerName" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف</label>
                                    <input type="text" class="form-control" id="borrowerPhone" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">العنوان</label>
                                    <input type="text" class="form-control" id="borrowerAddress" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم البطاقة الشخصية</label>
                                    <input type="text" class="form-control" id="borrowerIdCard" required>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-tab-content" id="itemsInfo">
                    <form id="itemsForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">نوع المادة</label>
                                <input type="text" class="form-control" id="itemName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر</label>
                                <input type="number" class="form-control" id="itemPrice" required oninput="calculateItemTotal()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">الكمية</label>
                                <input type="number" class="form-control" id="itemQuantity" value="1" min="1" required oninput="calculateItemTotal()">
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر الإجمالي</label>
                                <input type="text" class="form-control" id="itemTotalPrice" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" onclick="addItemToList()">
                                <i class="fas fa-plus"></i> إضافة العنصر
                            </button>
                        </div>
                        
                        <div class="table-container" style="margin-top: 20px;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>نوع المادة</th>
                                        <th>السعر</th>
                                        <th>الكمية</th>
                                        <th>السعر الإجمالي</th>
                                        <th>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="itemsTableBody">
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                    <tr>
                                        <td colspan="6" class="text-center">لم تتم إضافة عناصر بعد</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colspan="4">المجموع</th>
                                        <th id="itemsTotalSum">0</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </form>
                </div>
                <div class="modal-tab-content" id="installmentInfo">
                    <form id="installmentForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input type="date" class="form-control" id="startDate" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض (بالأشهر)</label>
                                <input type="number" class="form-control" id="durationMonths" min="1" required oninput="calculateInstallmentTotal()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة السنوية (%)</label>
                                <input type="number" class="form-control" id="interestRate" min="0" step="0.1" required oninput="calculateInstallmentTotal()">
                            </div>
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي للعناصر</label>
                                <input type="text" class="form-control" id="totalItemsAmount" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي مع الفائدة</label>
                                <input type="text" class="form-control" id="totalWithInterest" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة القسط الشهري</label>
                                <input type="text" class="form-control" id="monthlyInstallment" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="installmentNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('addInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-primary" onclick="saveInstallment()">حفظ</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تعيين القيم الافتراضية
    document.getElementById('startDate').valueAsDate = new Date();
    document.getElementById('durationMonths').value = installmentSettings.defaultDurationMonths;
    document.getElementById('interestRate').value = installmentSettings.defaultInterestRate;
    
    // ملء قائمة المستثمرين
    populateInvestorsList();
    
    // إذا تم تحديد مستثمر، اختره تلقائيًا
    if (investorId) {
        document.getElementById('borrowerId').value = investorId;
    }
    
    // حساب المجموع الأولي
    calculateItemTotal();
    calculateInstallmentTotal();
}

/**
 * إضافة عنصر إلى القائمة
 */
function addItemToList() {
    const itemName = document.getElementById('itemName').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    
    if (!itemName || !itemPrice) {
        createNotification('خطأ', 'يرجى ملء جميع حقول العنصر', 'danger');
        return;
    }
    
    // إضافة العنصر إلى القائمة
    const item = {
        id: generateInstallmentId(),
        name: itemName,
        price: itemPrice,
        quantity: itemQuantity,
        totalPrice: itemPrice * itemQuantity
    };
    
    tempInstallmentItems.push(item);
    
    // تحديث الجدول
    updateItemsTable();
    
    // مسح حقول النموذج
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemQuantity').value = '1';
    document.getElementById('itemTotalPrice').value = '';
    
    // التركيز على حقل اسم العنصر
    document.getElementById('itemName').focus();
    
    // حساب إجمالي المبلغ
    calculateInstallmentTotal();
}

/**
 * تحديث جدول العناصر
 */
function updateItemsTable() {
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;
    
    if (tempInstallmentItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">لم تتم إضافة عناصر بعد</td></tr>`;
        document.getElementById('itemsTotalSum').textContent = '0';
        return;
    }
    
    tbody.innerHTML = '';
    
    let totalSum = 0;
    
    tempInstallmentItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${formatNumber(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatNumber(item.totalPrice)}</td>
            <td>
                <button class="btn btn-danger btn-icon action-btn" onclick="removeItemFromList('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        totalSum += item.totalPrice;
    });
    
    // تحديث المجموع
    document.getElementById('itemsTotalSum').textContent = formatNumber(totalSum) + ' ' + settings.currency;
}

/**
 * إزالة عنصر من القائمة
 */
function removeItemFromList(itemId) {
    tempInstallmentItems = tempInstallmentItems.filter(item => item.id !== itemId);
    
    // تحديث الجدول
    updateItemsTable();
    
    // إعادة حساب إجمالي المبلغ
    calculateInstallmentTotal();
}

/**
 * حساب إجمالي العنصر
 */
function calculateItemTotal() {
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    const totalPrice = price * quantity;
    
    document.getElementById('itemTotalPrice').value = formatNumber(totalPrice) + ' ' + settings.currency;
}

/**
 * حساب إجمالي القرض بالأقساط
 */
function calculateInstallmentTotal() {
    // حساب إجمالي العناصر
    const totalItemsPrice = tempInstallmentItems.reduce((total, item) => total + item.totalPrice, 0);
    
    // الحصول على معدل الفائدة ومدة القرض
    const interestRate = parseFloat(document.getElementById('interestRate').value) || installmentSettings.defaultInterestRate;
    const durationMonths = parseInt(document.getElementById('durationMonths').value) || installmentSettings.defaultDurationMonths;
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(totalItemsPrice, interestRate, durationMonths);
    
    // حساب قيمة القسط الشهري
    const monthlyInstallment = totalWithInterest / durationMonths;
    
    // تحديث الحقول
    document.getElementById('totalItemsAmount').value = formatNumber(totalItemsPrice) + ' ' + settings.currency;
    document.getElementById('totalWithInterest').value = formatNumber(totalWithInterest) + ' ' + settings.currency;
    document.getElementById('monthlyInstallment').value = formatNumber(monthlyInstallment) + ' ' + settings.currency;
}

/**
 * تبديل حقول المقترض بناءً على نوع المقترض
 */
function toggleBorrowerFields() {
    const borrowerType = document.getElementById('borrowerType').value;
    const investorField = document.getElementById('investorField');
    const otherBorrowerFields = document.getElementById('otherBorrowerFields');
    
    if (borrowerType === 'investor') {
        investorField.style.display = 'block';
        otherBorrowerFields.style.display = 'none';
    } else {
        investorField.style.display = 'none';
        otherBorrowerFields.style.display = 'block';
    }
}

/**
 * ملء قائمة المستثمرين
 */
function populateInvestorsList() {
    const select = document.getElementById('borrowerId');
    
    if (!select) return;
    
    // مسح القائمة
    select.innerHTML = '<option value="">اختر المستثمر</option>';
    
    // التأكد من وجود مصفوفة المستثمرين
    if (typeof investors === 'undefined' || !Array.isArray(investors)) {
        console.warn('مصفوفة المستثمرين غير متوفرة');
        return;
    }
    
    // ترتيب المستثمرين حسب الاسم
    const sortedInvestors = [...investors].sort((a, b) => a.name.localeCompare(b.name));
    
    // إضافة المستثمرين إلى القائمة
    sortedInvestors.forEach(investor => {
        const option = document.createElement('option');
        option.value = investor.id;
        option.textContent = investor.name;
        select.appendChild(option);
    });
}

/**
 * حفظ قرض بالأقساط
 */
function saveInstallment() {
    // التحقق من وجود عناصر
    if (tempInstallmentItems.length === 0) {
        createNotification('خطأ', 'يرجى إضافة عنصر واحد على الأقل', 'danger');
        switchModalTab('itemsInfo', 'addInstallmentModal');
        return;
    }
    
    // الحصول على نوع المقترض
    const borrowerType = document.getElementById('borrowerType').value;
    let borrowerId = '';
    let borrowerName = '';
    let borrowerPhone = '';
    let borrowerAddress = '';
    let borrowerIdCard = '';
    
    if (borrowerType === 'investor') {
        borrowerId = document.getElementById('borrowerId').value;
        
        if (!borrowerId) {
            createNotification('خطأ', 'يرجى اختيار المستثمر', 'danger');
            switchModalTab('borrowerInfo', 'addInstallmentModal');
            return;
        }
        
        // الحصول على بيانات المستثمر
        const investor = investors.find(inv => inv.id === borrowerId);
        if (investor) {
            borrowerName = investor.name;
            borrowerPhone = investor.phone;
            borrowerAddress = investor.address || '';
            borrowerIdCard = investor.idCard || '';
        }
    } else {
        borrowerName = document.getElementById('borrowerName').value;
        borrowerPhone = document.getElementById('borrowerPhone').value;
        borrowerAddress = document.getElementById('borrowerAddress').value;
        borrowerIdCard = document.getElementById('borrowerIdCard').value;
        
        if (!borrowerName || !borrowerPhone) {
            createNotification('خطأ', 'يرجى ملء حقول المقترض الإلزامية', 'danger');
            switchModalTab('borrowerInfo', 'addInstallmentModal');
            return;
        }
    }
    
    // الحصول على بيانات القرض
    const startDate = document.getElementById('startDate').value;
    const durationMonths = parseInt(document.getElementById('durationMonths').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const notes = document.getElementById('installmentNotes').value;
    
    if (!startDate || !durationMonths || isNaN(interestRate)) {
        createNotification('خطأ', 'يرجى ملء جميع حقول القرض الإلزامية', 'danger');
        switchModalTab('installmentInfo', 'addInstallmentModal');
        return;
    }
    
    // حساب إجمالي العناصر
    const totalItemsPrice = tempInstallmentItems.reduce((total, item) => total + item.totalPrice, 0);
    
    // التحقق من الحد الأدنى للقرض
    if (totalItemsPrice < installmentSettings.minInstallmentAmount) {
        createNotification('خطأ', `يجب أن يكون المبلغ الإجمالي أكبر من ${formatNumber(installmentSettings.minInstallmentAmount)} ${settings.currency}`, 'danger');
        switchModalTab('itemsInfo', 'addInstallmentModal');
        return;
    }
    
    // التحقق من الحد الأقصى للقرض إذا كان محدداً
    if (installmentSettings.maxInstallmentAmount > 0 && totalItemsPrice > installmentSettings.maxInstallmentAmount) {
        createNotification('خطأ', `يجب أن يكون المبلغ الإجمالي أقل من ${formatNumber(installmentSettings.maxInstallmentAmount)} ${settings.currency}`, 'danger');
        switchModalTab('itemsInfo', 'addInstallmentModal');
        return;
    }
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(totalItemsPrice, interestRate, durationMonths);
    
    // إنشاء معرف فريد للقرض
    const installmentId = generateInstallmentId();
    
    // إنشاء كائن القرض
    const newInstallment = {
        id: installmentId,
        borrowerType,
        borrowerId,
        borrowerName,
        borrowerPhone,
        borrowerAddress,
        borrowerIdCard,
        totalAmount: totalWithInterest,
        interestRate,
        startDate,
        durationMonths,
        status: 'active',
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // إضافة القرض إلى المصفوفة
    installments.push(newInstallment);
    
    // إضافة العناصر إلى المصفوفة
    tempInstallmentItems.forEach(item => {
        const newItem = {
            id: item.id,
            installmentId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            createdAt: new Date().toISOString()
        };
        
        installmentItems.push(newItem);
    });
    
    // إنشاء جدول الأقساط
    const payments = generateInstallmentSchedule(
        installmentId,
        totalWithInterest,
        durationMonths,
        startDate
    );
    
    // إضافة الأقساط إلى المصفوفة
    installmentPayments = [...installmentPayments, ...payments];
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء إشعار
    createNotification(
        'قرض جديد بالأقساط',
        `تم إنشاء قرض جديد بالأقساط للمقترض ${borrowerName} بمبلغ ${formatNumber(totalWithInterest)} ${settings.currency}`,
        'success',
        installmentId,
        'installment'
    );
    
    // إغلاق النافذة المنبثقة
    document.getElementById('addInstallmentModal').remove();
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
}

/**
 * عرض تفاصيل القرض بالأقساط
 */
function viewInstallment(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // الحصول على قائمة العناصر
    const items = installmentItems.filter(item => item.installmentId === installmentId);
    
    // الحصول على جدول الأقساط
    const payments = installmentPayments.filter(payment => payment.installmentId === installmentId);
    
    // ترتيب الأقساط حسب رقم القسط
    payments.sort((a, b) => a.number - b.number);
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'viewInstallmentModal';
    
    // حساب الإحصائيات
    const totalPaid = getTotalPayments(installmentId);
    const remaining = installment.totalAmount - totalPaid;
    const remainingInstallments = getRemainingInstallments(installmentId);
    const lateInstallments = getLateInstallments(installmentId);
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تفاصيل القرض بالأقساط</h2>
                <div class="modal-close" onclick="document.getElementById('viewInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('installmentDetails', 'viewInstallmentModal')">معلومات القرض</div>
                    <div class="modal-tab" onclick="switchModalTab('borrowerDetails', 'viewInstallmentModal')">معلومات المقترض</div>
                    <div class="modal-tab" onclick="switchModalTab('itemsList', 'viewInstallmentModal')">قائمة العناصر</div>
                    <div class="modal-tab" onclick="switchModalTab('paymentsSchedule', 'viewInstallmentModal')">جدول الأقساط</div>
                </div>
                
                <div class="modal-tab-content active" id="installmentDetails">
                    <div class="dashboard-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المبلغ الإجمالي</div>
                                    <div class="card-value">${formatCurrency(installment.totalAmount)}</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-money-bill-wave"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المبلغ المدفوع</div>
                                    <div class="card-value">${formatCurrency(totalPaid)}</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المبلغ المتبقي</div>
                                    <div class="card-value">${formatCurrency(remaining)}</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">الأقساط المتبقية</div>
                                    <div class="card-value">${remainingInstallments} / ${installment.durationMonths}</div>
                                    ${lateInstallments > 0 ? `<div class="card-text" style="color: var(--danger-color);">${lateInstallments} أقساط متأخرة</div>` : ''}
                                </div>
                                <div class="card-icon ${lateInstallments > 0 ? 'danger' : 'info'}">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-container" style="box-shadow: none; padding: 0; margin-bottom: 20px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input type="text" class="form-control" value="${formatDate(installment.startDate)}" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض</label>
                                <input type="text" class="form-control" value="${installment.durationMonths} شهر" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة السنوية</label>
                                <input type="text" class="form-control" value="${installment.interestRate}%" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">حالة القرض</label>
                                <input type="text" class="form-control" value="${
                                    installment.status === 'active' ? 'نشط' : 
                                    installment.status === 'completed' ? 'مكتمل' : 'متعثر'
                                }" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" rows="3" readonly>${installment.notes || 'لا توجد ملاحظات'}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="modal-tab-content" id="borrowerDetails">
                    <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                        <div style="width: 120px; height: 120px; background: var(--gray-200); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--gray-600); font-size: 3rem;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div style="flex: 1; min-width: 250px;">
                            <h2 style="margin-bottom: 10px; color: var(--gray-800);">${getBorrowerName(installment)}</h2>
                            <p style="margin-bottom: 5px;"><i class="fas fa-tag" style="width: 20px; color: var(--gray-600);"></i> ${getBorrowerTypeName(installment.borrowerType)}</p>
                            <p style="margin-bottom: 5px;"><i class="fas fa-phone" style="width: 20px; color: var(--gray-600);"></i> ${installment.borrowerPhone || '-'}</p>
                            <p style="margin-bottom: 5px;"><i class="fas fa-map-marker-alt" style="width: 20px; color: var(--gray-600);"></i> ${installment.borrowerAddress || '-'}</p>
                            <p style="margin-bottom: 5px;"><i class="fas fa-id-card" style="width: 20px; color: var(--gray-600);"></i> ${installment.borrowerIdCard || '-'}</p>
                        </div>
                    </div>
                    
                    ${installment.borrowerType === 'investor' ? `
                        <div class="alert alert-info">
                            <div class="alert-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title">معلومات المستثمر</div>
                                <div class="alert-text">هذا القرض مرتبط بمستثمر موجود في النظام. يمكنك عرض المزيد من التفاصيل عن المستثمر من صفحة المستثمرين.</div>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="document.getElementById('viewInstallmentModal').remove(); showPage('investors'); setTimeout(() => viewInvestor('${installment.borrowerId}'), 100);">
                            <i class="fas fa-user"></i> عرض معلومات المستثمر
                        </button>
                    ` : ''}
                </div>
                
                <div class="modal-tab-content" id="itemsList">
                    <div class="table-container" style="box-shadow: none; padding: 0;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>نوع المادة</th>
                                    <th>السعر</th>
                                    <th>الكمية</th>
                                    <th>السعر الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.length > 0 ? items.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.name}</td>
                                        <td>${formatCurrency(item.price)}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="5" style="text-align: center;">لا توجد عناصر لهذا القرض</td>
                                    </tr>
                                `}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="4">المجموع</th>
                                    <th>${formatCurrency(items.reduce((total, item) => total + item.totalPrice, 0))}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                <div class="modal-tab-content" id="paymentsSchedule">
                    <div class="table-container" style="box-shadow: none; padding: 0;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>رقم القسط</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الدفع</th>
                                    <th>ملاحظات</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.length > 0 ? payments.map(payment => `
                                    <tr>
                                        <td>${payment.number}</td>
                                        <td>${formatDate(payment.dueDate)}</td>
                                        <td>${formatCurrency(payment.amount)}</td>
                                        <td>
                                            <span class="status ${
                                                payment.status === 'paid' ? 'success' : 
                                                payment.status === 'late' ? 'danger' : 'pending'
                                            }">
                                                ${
                                                    payment.status === 'paid' ? 'مدفوع' : 
                                                    payment.status === 'late' ? 'متأخر' : 'معلق'
                                                }
                                            </span>
                                        </td>
                                        <td>${payment.paymentDate ? formatDate(payment.paymentDate) : '-'}</td>
                                        <td>${payment.notes || '-'}</td>
                                        <td>
                                            ${payment.status !== 'paid' ? `
                                                <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentModal('${payment.id}')">
                                                    <i class="fas fa-money-bill"></i>
                                                </button>
                                            ` : `
                                                <button class="btn btn-warning btn-icon action-btn" onclick="cancelInstallmentPayment('${payment.id}'); document.getElementById('viewInstallmentModal').remove(); setTimeout(() => viewInstallment('${installmentId}'), 100);">
                                                    <i class="fas fa-undo"></i>
                                                </button>
                                            `}
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="7" style="text-align: center;">لا توجد أقساط لهذا القرض</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('viewInstallmentModal').remove()">إغلاق</button>
                <button class="btn btn-warning" onclick="editInstallment('${installmentId}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger" onclick="openDeleteInstallmentModal('${installmentId}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
                <button class="btn btn-primary" onclick="printInstallmentDetails('${installmentId}')">
                    <i class="fas fa-print"></i> طباعة
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * طباعة تفاصيل القرض بالأقساط
 */
function printInstallmentDetails(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // الحصول على قائمة العناصر
    const items = installmentItems.filter(item => item.installmentId === installmentId);
    
    // الحصول على جدول الأقساط
    const payments = installmentPayments.filter(payment => payment.installmentId === installmentId);
    
    // ترتيب الأقساط حسب رقم القسط
    payments.sort((a, b) => a.number - b.number);
    
    // حساب الإحصائيات
    const totalPaid = getTotalPayments(installmentId);
    const remaining = installment.totalAmount - totalPaid;
    const remainingInstallments = getRemainingInstallments(installmentId);
    const lateInstallments = getLateInstallments(installmentId);
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تفاصيل القرض بالأقساط</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    direction: rtl;
                    padding: 20px;
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .subtitle {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                
                .section {
                    margin-bottom: 20px;
                }
                
                .stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .stat-card {
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    padding: 10px;
                    min-width: 200px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .stat-title {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                
                th {
                    background-color: #f2f2f2;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .info-item {
                    margin-bottom: 5px;
                }
                
                .info-label {
                    font-weight: bold;
                    margin-left: 5px;
                }
                
                .status {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .status.success {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .status.danger {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .status.pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                
                @media print {
                    button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1 class="title">تفاصيل القرض بالأقساط</h1>
                    <div>رقم القرض: ${installmentId}</div>
                </div>
                <div>
                    <div>${settings.companyName || 'شركة الاستثمار العراقية'}</div>
                    <div>تاريخ الطباعة: ${formatDate(new Date().toISOString())}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-title">المبلغ الإجمالي</div>
                        <div class="stat-value">${formatCurrency(installment.totalAmount)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">المبلغ المدفوع</div>
                        <div class="stat-value">${formatCurrency(totalPaid)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">المبلغ المتبقي</div>
                        <div class="stat-value">${formatCurrency(remaining)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">الأقساط المتبقية</div>
                        <div class="stat-value">${remainingInstallments} / ${installment.durationMonths}</div>
                        ${lateInstallments > 0 ? `<div style="color: red;">${lateInstallments} أقساط متأخرة</div>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="subtitle">معلومات القرض</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">تاريخ البدء:</span>
                        <span>${formatDate(installment.startDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">مدة القرض:</span>
                        <span>${installment.durationMonths} شهر</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">معدل الفائدة السنوية:</span>
                        <span>${installment.interestRate}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">حالة القرض:</span>
                        <span>${
                            installment.status === 'active' ? 'نشط' : 
                            installment.status === 'completed' ? 'مكتمل' : 'متعثر'
                        }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="info-label">ملاحظات:</span>
                    <span>${installment.notes || 'لا توجد ملاحظات'}</span>
                </div>
            </div>
            
            <div class="section">
                <h2 class="subtitle">معلومات المقترض</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">الاسم:</span>
                        <span>${getBorrowerName(installment)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">نوع المقترض:</span>
                        <span>${getBorrowerTypeName(installment.borrowerType)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">رقم الهاتف:</span>
                        <span>${installment.borrowerPhone || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">العنوان:</span>
                        <span>${installment.borrowerAddress || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">رقم البطاقة الشخصية:</span>
                        <span>${installment.borrowerIdCard || '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="subtitle">قائمة العناصر</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>نوع المادة</th>
                            <th>السعر</th>
                            <th>الكمية</th>
                            <th>السعر الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.length > 0 ? items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.name}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.totalPrice)}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" style="text-align: center;">لا توجد عناصر لهذا القرض</td>
                            </tr>
                        `}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="4">المجموع</th>
                            <th>${formatCurrency(items.reduce((total, item) => total + item.totalPrice, 0))}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="section">
                <h2 class="subtitle">جدول الأقساط</h2>
                <table>
                    <thead>
                        <tr>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>تاريخ الدفع</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.length > 0 ? payments.map(payment => `
                            <tr>
                                <td>${payment.number}</td>
                                <td>${formatDate(payment.dueDate)}</td>
                                <td>${formatCurrency(payment.amount)}</td>
                                <td>
                                    <span class="status ${
                                        payment.status === 'paid' ? 'success' : 
                                        payment.status === 'late' ? 'danger' : 'pending'
                                    }">
                                        ${
                                            payment.status === 'paid' ? 'مدفوع' : 
                                            payment.status === 'late' ? 'متأخر' : 'معلق'
                                        }
                                    </span>
                                </td>
                                <td>${payment.paymentDate ? formatDate(payment.paymentDate) : '-'}</td>
                                <td>${payment.notes || '-'}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center;">لا توجد أقساط لهذا القرض</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <div>تم إنشاء هذا التقرير بواسطة نظام إدارة الأقساط - ${settings.companyName || 'شركة الاستثمار العراقية'}</div>
                <div>© ${new Date().getFullYear()} - جميع الحقوق محفوظة</div>
            </div>
            
            <button onclick="window.print();" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                طباعة
            </button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
}

/**
 * فتح نافذة تأكيد حذف القرض بالأقساط
 */
function openDeleteInstallmentModal(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // إغلاق النوافذ المنبثقة المفتوحة
    const viewModal = document.getElementById('viewInstallmentModal');
    if (viewModal) {
        viewModal.remove();
    }
    
    // حساب الإحصائيات
    const remainingInstallments = getRemainingInstallments(installmentId);
    const lateInstallments = getLateInstallments(installmentId);
    const paidInstallments = installment.durationMonths - remainingInstallments;
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'deleteInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h2 class="modal-title">تأكيد الحذف</h2>
                <div class="modal-close" onclick="document.getElementById('deleteInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">تحذير</div>
                        <div class="alert-text">
                            هل أنت متأكد من حذف القرض بالأقساط للمقترض "${getBorrowerName(installment)}"؟
                            <br>
                            سيتم حذف جميع البيانات المرتبطة بهذا القرض بالأقساط.
                            ${paidInstallments > 0 ? `<br><strong>تنبيه:</strong> تم دفع ${paidInstallments} قسط من أصل ${installment.durationMonths}.` : ''}
                            ${remainingInstallments > 0 ? `<br><strong>تنبيه:</strong> يوجد ${remainingInstallments} أقساط غير مدفوعة.` : ''}
                            ${lateInstallments > 0 ? `<br><strong>تحذير:</strong> يوجد ${lateInstallments} أقساط متأخرة.` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('deleteInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-danger" onclick="confirmDeleteInstallment('${installmentId}')">
                    <i class="fas fa-trash"></i> تأكيد الحذف
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ... استكمال دالة confirmDeleteInstallment
function confirmDeleteInstallment(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        document.getElementById('deleteInstallmentModal').remove();
        return;
    }
    
    try {
        // حذف القرض من المصفوفة
        const installmentIndex = installments.findIndex(inst => inst.id === installmentId);
        installments.splice(installmentIndex, 1);
        
        // حذف العناصر المرتبطة بالقرض
        installmentItems = installmentItems.filter(item => item.installmentId !== installmentId);
        
        // حذف الأقساط المرتبطة بالقرض
        installmentPayments = installmentPayments.filter(payment => payment.installmentId !== installmentId);
        
        // حفظ البيانات
        saveInstallmentData();
        
        // إنشاء إشعار بنجاح الحذف
        createNotification('نجاح', 'تم حذف القرض بالأقساط بنجاح', 'success');
        
        // إغلاق النافذة المنبثقة
        document.getElementById('deleteInstallmentModal').remove();
        
        // إعادة تحميل صفحة الأقساط
        loadInstallmentsPage();
    } catch (error) {
        console.error('خطأ في حذف القرض:', error);
        createNotification('خطأ', 'حدث خطأ أثناء حذف القرض', 'danger');
    }
}

/**
 * فتح نافذة تعديل القرض بالأقساط
 */
function editInstallment(installmentId) {
    // إغلاق أي نوافذ منبثقة مفتوحة
    const viewModal = document.getElementById('viewInstallmentModal');
    if (viewModal) {
        viewModal.remove();
    }
    
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // الحصول على قائمة العناصر
    const items = installmentItems.filter(item => item.installmentId === installmentId);
    
    // تحميل العناصر إلى القائمة المؤقتة
    tempInstallmentItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice
    }));
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تعديل القرض بالأقساط</h2>
                <div class="modal-close" onclick="document.getElementById('editInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('borrowerInfo', 'editInstallmentModal')">معلومات المقترض</div>
                    <div class="modal-tab" onclick="switchModalTab('itemsInfo', 'editInstallmentModal')">العناصر</div>
                    <div class="modal-tab" onclick="switchModalTab('installmentInfo', 'editInstallmentModal')">معلومات القرض</div>
                </div>
                <div class="modal-tab-content active" id="borrowerInfo">
                    <form id="borrowerForm">
                        <div class="form-group">
                            <label class="form-label">نوع المقترض</label>
                            <select class="form-select" id="borrowerType" onchange="toggleBorrowerFields()" disabled>
                                ${borrowerCategories.map(cat => `
                                    <option value="${cat.id}" ${cat.id === installment.borrowerType ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                            <small style="color: #666;">لا يمكن تغيير نوع المقترض بعد إنشاء القرض</small>
                        </div>
                        
                        <div id="investorField" ${installment.borrowerType !== 'investor' ? 'style="display: none;"' : ''}>
                            <div class="form-group">
                                <label class="form-label">المستثمر</label>
                                <select class="form-select" id="borrowerId" disabled>
                                    <option value="">اختر المستثمر</option>
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </select>
                                <small style="color: #666;">لا يمكن تغيير المستثمر بعد إنشاء القرض</small>
                            </div>
                        </div>
                        
                        <div id="otherBorrowerFields" ${installment.borrowerType === 'investor' ? 'style="display: none;"' : ''}>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">الاسم الكامل</label>
                                    <input type="text" class="form-control" id="borrowerName" value="${installment.borrowerName || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف</label>
                                    <input type="text" class="form-control" id="borrowerPhone" value="${installment.borrowerPhone || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">العنوان</label>
                                    <input type="text" class="form-control" id="borrowerAddress" value="${installment.borrowerAddress || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم البطاقة الشخصية</label>
                                    <input type="text" class="form-control" id="borrowerIdCard" value="${installment.borrowerIdCard || ''}" required>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-tab-content" id="itemsInfo">
                    <form id="itemsForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">نوع المادة</label>
                                <input type="text" class="form-control" id="itemName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر</label>
                                <input type="number" class="form-control" id="itemPrice" required oninput="calculateItemTotal()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">الكمية</label>
                                <input type="number" class="form-control" id="itemQuantity" value="1" min="1" required oninput="calculateItemTotal()">
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر الإجمالي</label>
                                <input type="text" class="form-control" id="itemTotalPrice" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" onclick="addItemToList()">
                                <i class="fas fa-plus"></i> إضافة العنصر
                            </button>
                        </div>
                        
                        <div class="table-container" style="margin-top: 20px;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>نوع المادة</th>
                                        <th>السعر</th>
                                        <th>الكمية</th>
                                        <th>السعر الإجمالي</th>
                                        <th>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="itemsTableBody">
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colspan="4">المجموع</th>
                                        <th id="itemsTotalSum">0</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="alert alert-warning" style="margin-top: 15px;">
                            <div class="alert-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title">تنبيه</div>
                                <div class="alert-text">تغيير العناصر قد يؤثر على المبلغ الإجمالي للقرض وجدول الأقساط</div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-tab-content" id="installmentInfo">
                    <form id="installmentForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input type="date" class="form-control" id="startDate" value="${installment.startDate}" disabled>
                                <small style="color: #666;">لا يمكن تغيير تاريخ البدء بعد بدء الدفعات</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض (بالأشهر)</label>
                                <input type="number" class="form-control" id="durationMonths" value="${installment.durationMonths}" min="1" disabled>
                                <small style="color: #666;">لا يمكن تغيير مدة القرض بعد بدء الدفعات</small>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة السنوية (%)</label>
                                <input type="number" class="form-control" id="interestRate" value="${installment.interestRate}" min="0" step="0.1" disabled>
                                <small style="color: #666;">لا يمكن تغيير معدل الفائدة بعد بدء الدفعات</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي للعناصر</label>
                                <input type="text" class="form-control" id="totalItemsAmount" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي مع الفائدة</label>
                                <input type="text" class="form-control" id="totalWithInterest" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة القسط الشهري</label>
                                <input type="text" class="form-control" id="monthlyInstallment" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="installmentNotes" rows="3">${installment.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('editInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-primary" onclick="updateInstallment('${installmentId}')">حفظ التعديلات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ملء قائمة المستثمرين
    if (installment.borrowerType === 'investor') {
        populateInvestorsList();
        document.getElementById('borrowerId').value = installment.borrowerId;
    }
    
    // تحديث جدول العناصر
    updateItemsTable();
    
    // حساب المجاميع
    calculateInstallmentTotal();
}

/**
 * تحديث القرض بالأقساط
 */
function updateInstallment(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // الحصول على البيانات المحدثة
    let borrowerName = '';
    let borrowerPhone = '';
    let borrowerAddress = '';
    let borrowerIdCard = '';
    
    if (installment.borrowerType === 'investor') {
        // بيانات المستثمر لا تحدث من هنا
        borrowerName = installment.borrowerName;
        borrowerPhone = installment.borrowerPhone;
        borrowerAddress = installment.borrowerAddress;
        borrowerIdCard = installment.borrowerIdCard;
    } else {
        borrowerName = document.getElementById('borrowerName').value;
        borrowerPhone = document.getElementById('borrowerPhone').value;
        borrowerAddress = document.getElementById('borrowerAddress').value;
        borrowerIdCard = document.getElementById('borrowerIdCard').value;
        
        if (!borrowerName || !borrowerPhone) {
            createNotification('خطأ', 'يرجى ملء جميع حقول المقترض الإلزامية', 'danger');
            switchModalTab('borrowerInfo', 'editInstallmentModal');
            return;
        }
    }
    
    const notes = document.getElementById('installmentNotes').value;
    
    // تحديث بيانات القرض
    installment.borrowerName = borrowerName;
    installment.borrowerPhone = borrowerPhone;
    installment.borrowerAddress = borrowerAddress;
    installment.borrowerIdCard = borrowerIdCard;
    installment.notes = notes;
    installment.updatedAt = new Date().toISOString();
    
    // تحديث العناصر
    // حذف العناصر القديمة
    installmentItems = installmentItems.filter(item => item.installmentId !== installmentId);
    
    // إضافة العناصر الجديدة
    tempInstallmentItems.forEach(item => {
        const newItem = {
            id: item.id,
            installmentId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            createdAt: new Date().toISOString()
        };
        
        installmentItems.push(newItem);
    });
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إغلاق النافذة المنبثقة
    document.getElementById('editInstallmentModal').remove();
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
    
    createNotification('نجاح', 'تم تحديث بيانات القرض بنجاح', 'success');
}

/**
 * فتح نافذة دفع قسط
 */
function openPayInstallmentModal(paymentId) {
    // إغلاق أي نوافذ منبثقة مفتوحة
    const viewModal = document.getElementById('viewInstallmentModal');
    if (viewModal) {
        viewModal.remove();
    }
    
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        createNotification('خطأ', 'القسط غير موجود', 'danger');
        return;
    }
    
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === payment.installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // التحقق من حالة القسط
    if (payment.status === 'paid') {
        createNotification('خطأ', 'هذا القسط مدفوع بالفعل', 'danger');
        return;
    }
    
    // حساب غرامة التأخير إذا كان القسط متأخراً
    let lateFee = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
        const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        lateFee = payment.amount * (installmentSettings.lateFeePercentage / 100) * daysLate;
    }
    
    const totalAmount = payment.amount + lateFee;
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'payInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="modal-title">دفع قسط</h2>
                <div class="modal-close" onclick="document.getElementById('payInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">المقترض</label>
                        <input type="text" class="form-control" value="${getBorrowerName(installment)}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم القسط</label>
                        <input type="text" class="form-control" value="${payment.number} / ${installment.durationMonths}" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">تاريخ الاستحقاق</label>
                        <input type="text" class="form-control" value="${formatDate(payment.dueDate)}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">مبلغ القسط الأصلي</label>
                        <input type="text" class="form-control" value="${formatCurrency(payment.amount)}" readonly>
                    </div>
                </div>
                ${lateFee > 0 ? `
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">غرامة التأخير</label>
                            <input type="text" class="form-control" value="${formatCurrency(lateFee)}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">إجمالي المبلغ المستحق</label>
                            <input type="text" class="form-control" value="${formatCurrency(totalAmount)}" readonly>
                        </div>
                    </div>
                ` : ''}
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">تاريخ الدفع</label>
                        <input type="date" class="form-control" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">المبلغ المدفوع</label>
                        <input type="number" class="form-control" id="paymentAmount" value="${totalAmount}" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">طريقة الدفع</label>
                    <select class="form-select" id="paymentMethod">
                        <option value="cash">نقداً</option>
                        <option value="check">شيك</option>
                        <option value="transfer">حوالة مصرفية</option>
                        <option value="other">أخرى</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="paymentNotes" rows="3"></textarea>
                </div>
                ${installmentSettings.allowPartialPayments ? `
                    <div class="alert alert-info">
                        <div class="alert-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">الدفع الجزئي مسموح</div>
                            <div class="alert-text">يمكنك دفع جزء من المبلغ المستحق إذا لزم الأمر</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('payInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-primary" onclick="confirmPayInstallment('${paymentId}')">تأكيد الدفع</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * تأكيد دفع القسط
 */
function confirmPayInstallment(paymentId) {
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        createNotification('خطأ', 'القسط غير موجود', 'danger');
        return;
    }
    
    // الحصول على البيانات
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentNotes = document.getElementById('paymentNotes').value;
    
    // التحقق من صحة البيانات
    if (!paymentDate || isNaN(paymentAmount) || paymentAmount <= 0) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول الإلزامية', 'danger');
        return;
    }
    
    // حساب المبلغ المستحق مع الغرامة
    let lateFee = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
        const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        lateFee = payment.amount * (installmentSettings.lateFeePercentage / 100) * daysLate;
    }
    
    const totalAmountDue = payment.amount + lateFee;
    
    // التحقق من الدفع الجزئي
    if (!installmentSettings.allowPartialPayments && paymentAmount < totalAmountDue) {
        createNotification('خطأ', 'الدفع الجزئي غير مسموح', 'danger');
        return;
    }
    
    // تحديث بيانات القسط
    if (paymentAmount >= totalAmountDue) {
        payment.status = 'paid';
        payment.paymentDate = paymentDate;
        payment.amount = paymentAmount; // في حالة دفع أكثر من المستحق
    } else {
        // دفع جزئي
        payment.status = 'partial';
        payment.amount = payment.amount - paymentAmount;
        payment.paymentDate = null;
        
        // إنشاء دفعة جديدة للمبلغ المدفوع
        const partialPayment = {
            id: generateInstallmentId(),
            installmentId: payment.installmentId,
            number: payment.number,
            dueDate: payment.dueDate,
            amount: paymentAmount,
            status: 'paid',
            paymentDate: paymentDate,
            notes: `دفعة جزئية: ${paymentNotes || 'بدون ملاحظات'}`,
            paymentMethod,
            isPartial: true
        };
        
        installmentPayments.push(partialPayment);
    }
    
    payment.notes = paymentNotes || '';
    payment.paymentMethod = paymentMethod;
    
    // التحقق مما إذا تم دفع جميع الأقساط لهذا القرض
    const installment = installments.find(inst => inst.id === payment.installmentId);
    const remainingPayments = installmentPayments.filter(p => 
        p.installmentId === installment.id && 
        p.status !== 'paid' &&
        !p.isPartial
    );
    
    if (remainingPayments.length === 0) {
        installment.status = 'completed';
        
        createNotification(
            'قرض مكتمل',
            `تم استكمال دفع جميع أقساط القرض للمقترض ${getBorrowerName(installment)}`,
            'success',
            installment.id,
            'installment'
        );
    }
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إغلاق النافذة المنبثقة
    document.getElementById('payInstallmentModal').remove();
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
    
    createNotification('نجاح', 'تم تسجيل دفع القسط بنجاح', 'success');
}

/**
 * إلغاء دفع القسط
 */
function cancelInstallmentPayment(paymentId) {
    if (!confirm('هل أنت متأكد من إلغاء دفع هذا القسط؟')) {
        return;
    }
    
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        createNotification('خطأ', 'القسط غير موجود', 'danger');
        return;
    }
    
    // التحقق من حالة القسط
    if (payment.status !== 'paid') {
        createNotification('خطأ', 'لا يمكن إلغاء دفع قسط غير مدفوع', 'danger');
        return;
    }
    
    // إرجاع القسط إلى حالة معلق أو متأخر
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    payment.status = dueDate < today ? 'late' : 'pending';
    payment.paymentDate = null;
    payment.paymentMethod = null;
    payment.notes = '';
    
    // تحديث حالة القرض إذا كان مكتملاً
    const installment = installments.find(inst => inst.id === payment.installmentId);
    if (installment.status === 'completed') {
        installment.status = 'active';
    }
    
    // حفظ البيانات
    saveInstallmentData();
    
    createNotification('نجاح', 'تم إلغاء دفع القسط بنجاح', 'success');
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
}

/**
 * عرض تفاصيل دفعة قسط
 */
function viewInstallmentPayment(paymentId) {
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        createNotification('خطأ', 'القسط غير موجود', 'danger');
        return;
    }
    
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === payment.installmentId);
    
    if (!installment) {
        createNotification('خطأ', 'القرض غير موجود', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'viewPaymentModal';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h2 class="modal-title">تفاصيل القسط</h2>
                <div class="modal-close" onclick="document.getElementById('viewPaymentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">المقترض</label>
                        <input type="text" class="form-control" value="${getBorrowerName(installment)}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم القسط</label>
                        <input type="text" class="form-control" value="${payment.number} / ${installment.durationMonths}" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">تاريخ الاستحقاق</label>
                        <input type="text" class="form-control" value="${formatDate(payment.dueDate)}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">المبلغ</label>
                        <input type="text" class="form-control" value="${formatCurrency(payment.amount)}" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <input type="text" class="form-control" value="${
                            payment.status === 'paid' ? 'مدفوع' : 
                            payment.status === 'late' ? 'متأخر' : 
                            payment.status === 'partial' ? 'دفع جزئي' : 'معلق'
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تاريخ الدفع</label>
                        <input type="text" class="form-control" value="${payment.paymentDate ? formatDate(payment.paymentDate) : '-'}" readonly>
                    </div>
                </div>
                ${payment.paymentMethod ? `
                    <div class="form-group">
                        <label class="form-label">طريقة الدفع</label>
                        <input type="text" class="form-control" value="${
                            payment.paymentMethod === 'cash' ? 'نقداً' :
                            payment.paymentMethod === 'check' ? 'شيك' :
                            payment.paymentMethod === 'transfer' ? 'حوالة مصرفية' : 'أخرى'
                        }" readonly>
                    </div>
                ` : ''}
                <div class="form-group">
                    <label class="form-label">ملاحظات</label>
                    <textarea class="form-control" rows="3" readonly>${payment.notes || 'لا توجد ملاحظات'}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('viewPaymentModal').remove()">إغلاق</button>
                ${payment.status !== 'paid' ? `
                    <button class="btn btn-success" onclick="document.getElementById('viewPaymentModal').remove(); openPayInstallmentModal('${paymentId}')">
                        <i class="fas fa-money-bill"></i> دفع
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * تبديل علامة تبويب النافذة المنبثقة
 */
function switchModalTab(tabId, modalId) {
    const modal = document.getElementById(modalId);
    
    if (!modal) return;
    
    // تحديث علامات التبويب
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    modal.querySelector(`[onclick="switchModalTab('${tabId}', '${modalId}')"]`).classList.add('active');
    
    // تحديث محتوى علامات التبويب
    modal.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    modal.querySelector(`#${tabId}`).classList.add('active');
}

/**
 * تصدير بيانات الأقساط
 */
function exportInstallments() {
    try {
        // إنشاء عناصر الشيت
        const sheet = [
            // العناوين
            ['معلومات القروض بالأقساط'],
            ['تاريخ التصدير', formatDate(new Date().toISOString())],
            [],
            ['#', 'المقترض', 'النوع', 'المبلغ الإجمالي', 'المبلغ المدفوع', 'المبلغ المتبقي', 'الأقساط المتبقية', 'تاريخ البدء', 'معدل الفائدة', 'الحالة', 'ملاحظات']
        ];
        
        // البيانات
        installments.forEach((installment, index) => {
            const totalPaid = getTotalPayments(installment.id);
            const remaining = installment.totalAmount - totalPaid;
            const remainingInstallments = getRemainingInstallments(installment.id);
            
            sheet.push([
                index + 1,
                getBorrowerName(installment),
                getBorrowerTypeName(installment.borrowerType),
                installment.totalAmount,
                totalPaid,
                remaining,
                `${remainingInstallments} / ${installment.durationMonths}`,
                formatDate(installment.startDate),
                `${installment.interestRate}%`,
                installment.status === 'active' ? 'نشط' : installment.status === 'completed' ? 'مكتمل' : 'متعثر',
                installment.notes || ''
            ]);
        });
        
        // إنشاء ملف Excel
        const worksheet = XLSX.utils.aoa_to_sheet(sheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'القروض بالأقساط');
        
        // إضافة شيت العناصر
        const itemsSheet = [
            ['عناصر القروض'],
            [],
            ['#', 'رقم القرض', 'المقترض', 'نوع المادة', 'السعر', 'الكمية', 'السعر الإجمالي']
        ];
        
        installmentItems.forEach((item, index) => {
            const installment = installments.find(inst => inst.id === item.installmentId);
            
            itemsSheet.push([
                index + 1,
                item.installmentId,
                installment ? getBorrowerName(installment) : 'غير معروف',
                item.name,
                item.price,
                item.quantity,
                item.totalPrice
            ]);
        });
        
        const itemsWorksheet = XLSX.utils.aoa_to_sheet(itemsSheet);
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'العناصر');
        
        // إضافة شيت جدول الأقساط
        const paymentsSheet = [
            ['جدول الأقساط'],
            [],
            ['#', 'رقم القرض', 'المقترض', 'رقم القسط', 'تاريخ الاستحقاق', 'المبلغ', 'الحالة', 'تاريخ الدفع', 'طريقة الدفع', 'ملاحظات']
        ];
        
        installmentPayments.forEach((payment, index) => {
            const installment = installments.find(inst => inst.id === payment.installmentId);
            
            paymentsSheet.push([
                index + 1,
                payment.installmentId,
                installment ? getBorrowerName(installment) : 'غير معروف',
                payment.number,
                formatDate(payment.dueDate),
                payment.amount,
                payment.status === 'paid' ? 'مدفوع' : payment.status === 'late' ? 'متأخر' : payment.status === 'partial' ? 'دفع جزئي' : 'معلق',
                payment.paymentDate ? formatDate(payment.paymentDate) : '',
                payment.paymentMethod === 'cash' ? 'نقداً' : payment.paymentMethod === 'check' ? 'شيك' : payment.paymentMethod === 'transfer' ? 'حوالة مصرفية' : payment.paymentMethod || '',
                payment.notes || ''
            ]);
        });
        
        const paymentsWorksheet = XLSX.utils.aoa_to_sheet(paymentsSheet);
        XLSX.utils.book_append_sheet(workbook, paymentsWorksheet, 'جدول الأقساط');
        
        // تصدير الملف
        XLSX.writeFile(workbook, `installments_${new Date().toISOString().slice(0, 10)}.xlsx`);
        
        createNotification('نجاح', 'تم تصدير بيانات الأقساط بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير بيانات الأقساط:', error);
        createNotification('خطأ', 'حدث خطأ أثناء تصدير البيانات', 'danger');
    }
}

/**
 * طباعة جدول الأقساط
 */
function printTable(tableId) {
    const table = document.getElementById(tableId);
    
    if (!table) {
        createNotification('خطأ', 'الجدول غير موجود', 'danger');
        return;
    }
    
    // نسخ الجدول
    const clonedTable = table.cloneNode(true);
    
    // إزالة أعمدة الإجراءات
    const actionColumns = clonedTable.querySelectorAll('td:last-child, th:last-child');
    actionColumns.forEach(column => column.remove());
    
    // إنشاء نافذة الطباعة
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة جدول الأقساط</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    direction: rtl;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                
                .status {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .status.active {
                    background-color: #e3f2fd;
                    color: #1976d2;
                }
                
                .status.success {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .status.danger {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .status.pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                
                @media print {
                    button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <h1>جدول القروض بالأقساط</h1>
            <p>تاريخ الطباعة: ${formatDate(new Date().toISOString())}</p>
            ${clonedTable.outerHTML}
            <button onclick="window.print();" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                طباعة
            </button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
}

/**
 * تصدير الرسم البياني للأقساط
 */
function exportInstallmentsChart() {
    const chartContainer = document.getElementById('installmentsChart');
    
    if (!chartContainer) {
        createNotification('خطأ', 'الرسم البياني غير موجود', 'danger');
        return;
    }
    
    const canvas = chartContainer.querySelector('canvas');
    
    if (!canvas) {
        createNotification('خطأ', 'لا يوجد رسم بياني لتصديره', 'danger');
        return;
    }
    
    // تحويل الرسم البياني إلى صورة
    const imageURL = canvas.toDataURL('image/png');
    
    // إنشاء عنصر لتنزيل الصورة
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `installments_chart_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    createNotification('نجاح', 'تم تصدير الرسم البياني بنجاح', 'success');
}

/**
 * تنسيق الأرقام
 */
function formatNumber(number) {
    if (typeof number !== 'number') {
        number = parseFloat(number);
    }
    
    if (isNaN(number)) return "0";
    
    return number.toLocaleString('ar-IQ');
}

/**
 * تسجيل إشعارات الأقساط
 */
function registerInstallmentNotifications() {
    // التحقق من وجود نظام الإشعارات
    if (typeof window.notifications === 'undefined') {
        console.log('نظام الإشعارات غير متوفر');
        return;
    }
    
    // تسجيل أنواع إشعارات الأقساط
    const installmentNotificationTypes = [
        { type: 'installment', title: 'قرض بالأقساط', icon: 'fa-receipt' },
        { type: 'installmentPayment', title: 'قسط', icon: 'fa-money-bill' },
        { type: 'lateInstallment', title: 'قسط متأخر', icon: 'fa-exclamation-triangle' },
        { type: 'upcomingInstallment', title: 'قسط قادم', icon: 'fa-calendar-day' }
    ];
    
    // تسجيل أنواع الإشعارات
    installmentNotificationTypes.forEach(notificationType => {
        if (window.notifications.registerType) {
            window.notifications.registerType(notificationType);
        }
    });
    
    console.log('تم تسجيل إشعارات الأقساط');
}

/**
 * مزامنة بيانات الأقساط مع Firebase
 */
function syncInstallmentData() {
    // التحقق من وجود Firebase وتفعيل المزامنة
    if (typeof firebase === 'undefined' || typeof db === 'undefined' || !syncActive) {
        console.log('Firebase غير متوفر أو المزامنة غير مفعلة');
        return;
    }
    
    // مزامنة القروض
    db.ref('installments').set(installments)
        .then(() => console.log('تمت مزامنة القروض'))
        .catch(error => console.error('خطأ في مزامنة القروض:', error));
    
    // مزامنة العناصر
    db.ref('installmentItems').set(installmentItems)
        .then(() => console.log('تمت مزامنة عناصر القروض'))
        .catch(error => console.error('خطأ في مزامنة عناصر القروض:', error));
    
    // مزامنة جدول الأقساط
    db.ref('installmentPayments').set(installmentPayments)
        .then(() => console.log('تمت مزامنة جدول الأقساط'))
        .catch(error => console.error('خطأ في مزامنة جدول الأقساط:', error));
    
    // مزامنة الإعدادات
    db.ref('installmentSettings').set(installmentSettings)
        .then(() => console.log('تمت مزامنة إعدادات الأقساط'))
        .catch(error => console.error('خطأ في مزامنة إعدادات الأقساط:', error));
}

// ============ نقطة البدء ============

// التحقق من وجود نظام إدارة الاستثمار الرئيسي
if (typeof window.showPage === 'function' && typeof investors !== 'undefined') {
    // النظام الرئيسي متوفر، يمكن تهيئة نظام الأقساط
    document.addEventListener('DOMContentLoaded', initInstallmentSystem);
} else {
    console.warn('نظام إدارة الاستثمار الرئيسي غير متوفر. قد لا تعمل بعض الميزات بشكل صحيح.');
    // تهيئة محدودة لنظام الأقساط
    document.addEventListener('DOMContentLoaded', () => {
        loadInstallmentData();
        loadInstallmentSettings();
        // يمكن تنفيذ عمليات أخرى لا تعتمد على النظام الرئيسي
    });
}













// تصدير الدوال التي قد تحتاجها النظم الأخرى
window.installmentFunctions = {
    initInstallmentSystem,
    loadInstallmentsPage,
    openAddInstallmentModal,
    viewInstallment,
    openPayInstallmentModal,
    getTotalPayments,
    getRemainingInstallments,
    getLateInstallments,
    getBorrowerName,
    formatCurrency,
    formatDate
};

// نهاية نظام إدارة الأقساط المحسن
console.log('نظام إدارة الأقساط المحسن - الإصدار 2.0 - تم التحميل بنجاح');
