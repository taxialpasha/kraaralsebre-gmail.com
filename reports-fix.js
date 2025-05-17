/**
 * إصلاح مشاكل صفحة التقارير
 * 
 * هذا الملف يحتوي على الوظائف المفقودة في نظام التقارير ويعالج مشاكل عرض التقارير
 * وإضافة وظيفة إنشاء ملفات PDF
 */

// ========== الوظائف المفقودة ==========

/**
 * تحميل التقارير حسب علامة التبويب
 * @param {string} tabId معرف علامة التبويب
 */
function loadReportsForTab(tabId) {
    switch (tabId) {
        case 'recent':
            loadRecentReports();
            break;
        case 'saved':
            loadSavedReports();
            break;
        case 'create':
            prepareReportForm();
            break;
        case 'financial':
            loadFinancialReportsTab();
            break;
        default:
            loadRecentReports();
    }
}

/**
 * تحميل التقارير الأخيرة
 */
function loadRecentReports() {
    const tableBody = document.getElementById('recentReportsTableBody');
    if (!tableBody) return;
    
    // ترتيب التقارير حسب تاريخ الإنشاء (الأحدث أولاً)
    const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // عرض التقارير الأخيرة (أقصى 10 تقارير)
    const recentReports = sortedReports.slice(0, 10);
    
    if (recentReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">لا توجد تقارير</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = '';
    
    recentReports.forEach(report => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${report.title}</td>
            <td>${getReportTypeName(report.type) || 'غير محدد'}</td>
            <td>${formatDate(report.createdAt)} ${formatTime(report.createdAt)}</td>
            <td>${report.createdBy || 'غير محدد'}</td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="viewReport('${report.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-icon action-btn" onclick="generatePdfReport('${report.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="openDeleteConfirmationModal('${report.id}', 'report')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * تحميل التقارير المحفوظة
 */
function loadSavedReports() {
    const tableBody = document.getElementById('savedReportsTableBody');
    if (!tableBody) return;
    
    // ترتيب التقارير حسب تاريخ الإنشاء (الأحدث أولاً)
    const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (sortedReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">لا توجد تقارير محفوظة</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = '';
    
    sortedReports.forEach(report => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${report.title}</td>
            <td>${getReportTypeName(report.type) || 'غير محدد'}</td>
            <td>${formatDate(report.createdAt)} ${formatTime(report.createdAt)}</td>
            <td>${report.createdBy || 'غير محدد'}</td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="viewReport('${report.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-icon action-btn" onclick="generatePdfReport('${report.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="openDeleteConfirmationModal('${report.id}', 'report')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * تحميل علامة تبويب التقارير المالية
 */
function loadFinancialReportsTab() {
    // تحديث مربعات الاختيار والحقول إذا لزم الأمر
    const reportPeriodSelect = document.getElementById('financialReportPeriod');
    if (reportPeriodSelect) {
        toggleCustomDateRange();
    }
}

/**
 * تحضير نموذج إنشاء التقرير
 */
function prepareReportForm() {
    // تعيين التاريخ الافتراضي إلى اليوم
    const fromDateInput = document.getElementById('reportFromDate');
    const toDateInput = document.getElementById('reportToDate');
    
    if (fromDateInput && !fromDateInput.value) {
        // تعيين التاريخ الافتراضي إلى بداية الشهر الحالي
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDateInput.valueAsDate = firstDayOfMonth;
    }
    
    if (toDateInput && !toDateInput.value) {
        // تعيين التاريخ الافتراضي إلى اليوم
        toDateInput.valueAsDate = new Date();
    }
    
    // تعبئة قائمة المستثمرين
    populateReportInvestors();
}

/**
 * تعبئة قائمة المستثمرين في نموذج التقرير
 */
function populateReportInvestors() {
    const select = document.getElementById('reportInvestor');
    
    if (!select) return;
    
    // مسح القائمة
    select.innerHTML = '<option value="">جميع المستثمرين</option>';
    
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
 * الحصول على اسم نوع التقرير
 * @param {string} type نوع التقرير
 * @returns {string} اسم نوع التقرير
 */
function getReportTypeName(type) {
    switch (type) {
        case 'investors':
            return 'تقرير المستثمرين';
        case 'investments':
            return 'تقرير الاستثمارات';
        case 'profits':
            return 'تقرير الأرباح';
        case 'operations':
            return 'تقرير العمليات';
        case 'financial':
            return 'التقرير المالي';
        case 'summary':
            return 'التقرير العام';
        case 'income':
            return 'تقرير الدخل';
        case 'expense':
            return 'تقرير المصروفات';
        case 'cashflow':
            return 'تقرير التدفق النقدي';
        case 'profit':
            return 'تقرير الأرباح والخسائر';
        case 'balance':
            return 'تقرير الميزانية';
        default:
            return type || 'غير محدد';
    }
}

// ========== وظائف إنشاء محتوى التقارير ==========

/**
 * إنشاء محتوى تقرير المستثمرين
 * @param {string} investorId معرف المستثمر (اختياري)
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateInvestorsReportContent(investorId, fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // تصفية المستثمرين
    let filteredInvestors = [...investors];
    
    // تصفية حسب المستثمر إذا تم تحديده
    if (investorId) {
        filteredInvestors = filteredInvestors.filter(inv => inv.id === investorId);
    }
    
    // تصفية حسب تاريخ الانضمام
    filteredInvestors = filteredInvestors.filter(inv => {
        const joinDate = new Date(inv.joinDate);
        return joinDate >= startDate && joinDate <= endDate;
    });
    
    // إذا لم يتم العثور على مستثمرين
    if (filteredInvestors.length === 0) {
        return `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد بيانات</div>
                    <div class="alert-text">لم يتم العثور على مستثمرين خلال الفترة المحددة.</div>
                </div>
            </div>
        `;
    }
    
    // حساب إحصائيات المستثمرين
    let totalInvestors = filteredInvestors.length;
    let totalInvestmentsAmount = 0;
    let totalProfit = 0;
    
    const today = new Date();
    
    // حساب إجمالي الاستثمارات والأرباح لكل مستثمر
    filteredInvestors.forEach(investor => {
        // الحصول على استثمارات المستثمر النشطة
        const activeInvestments = investments.filter(inv => 
            inv.investorId === investor.id && inv.status === 'active'
        );
        
        // حساب إجمالي مبلغ الاستثمار
        const investmentAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        totalInvestmentsAmount += investmentAmount;
        
        // حساب إجمالي الأرباح
        activeInvestments.forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfit += profit;
        });
    });
    
    // إنشاء جدول المستثمرين
    let tableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>رقم الهاتف</th>
                    <th>العنوان</th>
                    <th>تاريخ الانضمام</th>
                    <th>إجمالي الاستثمار</th>
                    <th>إجمالي الأرباح</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredInvestors.forEach((investor, index) => {
        // الحصول على استثمارات المستثمر النشطة
        const activeInvestments = investments.filter(inv => 
            inv.investorId === investor.id && inv.status === 'active'
        );
        
        // حساب إجمالي مبلغ الاستثمار
        const investmentAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // حساب إجمالي الأرباح
        let investorTotalProfit = 0;
        activeInvestments.forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            investorTotalProfit += profit;
        });
        
        // إضافة صف للمستثمر
        tableContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${investor.name}</td>
                <td>${investor.phone}</td>
                <td>${investor.address || '-'}</td>
                <td>${formatDate(investor.joinDate)}</td>
                <td>${formatCurrency(investmentAmount)}</td>
                <td>${formatCurrency(investorTotalProfit.toFixed(2))}</td>
            </tr>
        `;
    });
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    // إنشاء محتوى التقرير الكامل
    const content = `
        <div class="report-header">
            <h2>تقرير المستثمرين</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">عدد المستثمرين</div>
                            <div class="card-value">${totalInvestors}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الاستثمارات</div>
                            <div class="card-value">${formatCurrency(totalInvestmentsAmount)}</div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الأرباح</div>
                            <div class="card-value">${formatCurrency(totalProfit.toFixed(2))}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">متوسط الاستثمار</div>
                            <div class="card-value">${formatCurrency((totalInvestmentsAmount / totalInvestors || 0).toFixed(2))}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>قائمة المستثمرين</h3>
            ${tableContent}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء محتوى تقرير الاستثمارات
 * @param {string} investorId معرف المستثمر (اختياري)
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateInvestmentsReportContent(investorId, fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // تصفية الاستثمارات
    let filteredInvestments = [...investments];
    
    // تصفية حسب المستثمر إذا تم تحديده
    if (investorId) {
        filteredInvestments = filteredInvestments.filter(inv => inv.investorId === investorId);
    }
    
    // تصفية حسب تاريخ الاستثمار
    filteredInvestments = filteredInvestments.filter(inv => {
        const investDate = new Date(inv.date);
        return investDate >= startDate && investDate <= endDate;
    });
    
    // إذا لم يتم العثور على استثمارات
    if (filteredInvestments.length === 0) {
        return `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد بيانات</div>
                    <div class="alert-text">لم يتم العثور على استثمارات خلال الفترة المحددة.</div>
                </div>
            </div>
        `;
    }
    
    // حساب إحصائيات الاستثمارات
    const totalInvestments = filteredInvestments.length;
    const totalActiveInvestments = filteredInvestments.filter(inv => inv.status === 'active').length;
    const totalClosedInvestments = filteredInvestments.filter(inv => inv.status === 'closed').length;
    
    const totalInvestmentsAmount = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalActiveAmount = filteredInvestments
        .filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    // حساب إجمالي الأرباح
    const today = new Date();
    let totalProfit = 0;
    
    filteredInvestments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfit += profit;
        });
    
    // إنشاء جدول الاستثمارات
    let tableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>المستثمر</th>
                    <th>المبلغ</th>
                    <th>تاريخ الاستثمار</th>
                    <th>الربح الشهري</th>
                    <th>إجمالي الأرباح</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // ترتيب الاستثمارات حسب التاريخ (الأحدث أولاً)
    filteredInvestments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredInvestments.forEach((investment, index) => {
        // الحصول على المستثمر
        const investor = investors.find(inv => inv.id === investment.investorId);
        
        if (!investor) return;
        
        // حساب الربح الشهري
        const monthlyProfit = calculateMonthlyProfit(investment.amount);
        
        // حساب إجمالي الأرباح
        const totalProfit = investment.status === 'active' ? 
            calculateProfit(investment.amount, investment.date, today.toISOString()) : 0;
        
        // إضافة صف للاستثمار
        tableContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${investor.name}</td>
                <td>${formatCurrency(investment.amount)}</td>
                <td>${formatDate(investment.date)}</td>
                <td>${formatCurrency(monthlyProfit.toFixed(2))}</td>
                <td>${formatCurrency(totalProfit.toFixed(2))}</td>
                <td><span class="status ${investment.status === 'active' ? 'active' : 'closed'}">${investment.status === 'active' ? 'نشط' : 'مغلق'}</span></td>
            </tr>
        `;
    });
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    // إنشاء محتوى التقرير الكامل
    const content = `
        <div class="report-header">
            <h2>تقرير الاستثمارات</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">عدد الاستثمارات</div>
                            <div class="card-value">${totalInvestments}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الاستثمارات النشطة</div>
                            <div class="card-value">${totalActiveInvestments}</div>
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
                            <div class="card-value">${formatCurrency(totalInvestmentsAmount)}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الأرباح</div>
                            <div class="card-value">${formatCurrency(totalProfit.toFixed(2))}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>قائمة الاستثمارات</h3>
            ${tableContent}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء محتوى تقرير الأرباح
 * @param {string} investorId معرف المستثمر (اختياري)
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateProfitsReportContent(investorId, fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // تصفية عمليات دفع الأرباح
    let filteredOperations = operations.filter(op => 
        op.type === 'profit' && op.status === 'active'
    );
    
    // تصفية حسب المستثمر إذا تم تحديده
    if (investorId) {
        filteredOperations = filteredOperations.filter(op => op.investorId === investorId);
    }
    
    // تصفية حسب تاريخ العملية
    filteredOperations = filteredOperations.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= startDate && opDate <= endDate;
    });
    
    // تجميع الاستثمارات النشطة للمستثمرين المعنيين
    let activeInvestments = [...investments].filter(inv => inv.status === 'active');
    
    // تصفية حسب المستثمر إذا تم تحديده
    if (investorId) {
        activeInvestments = activeInvestments.filter(inv => inv.investorId === investorId);
    }
    
    // إذا لم يتم العثور على عمليات دفع أرباح ولا استثمارات نشطة
    if (filteredOperations.length === 0 && activeInvestments.length === 0) {
        return `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد بيانات</div>
                    <div class="alert-text">لم يتم العثور على أرباح خلال الفترة المحددة.</div>
                </div>
            </div>
        `;
    }
    
    // حساب إجمالي الأرباح المدفوعة
    const totalPaidProfits = filteredOperations.reduce((sum, op) => sum + op.amount, 0);
    
    // حساب إجمالي الأرباح المتوقعة
    const today = new Date();
    let totalExpectedProfits = 0;
    
    activeInvestments.forEach(inv => {
        const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
        totalExpectedProfits += profit;
    });
    
    // حساب إجمالي الأرباح المستحقة
    const totalDueProfits = Math.max(0, totalExpectedProfits - totalPaidProfits);
    
    // تجميع الأرباح حسب المستثمر
    const investorProfits = {};
    
    // تجميع الأرباح المتوقعة
    activeInvestments.forEach(inv => {
        if (!investorProfits[inv.investorId]) {
            investorProfits[inv.investorId] = {
                expectedProfit: 0,
                paidProfit: 0,
                dueProfit: 0
            };
        }
        
        const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
        investorProfits[inv.investorId].expectedProfit += profit;
    });
    
    // تجميع الأرباح المدفوعة
    filteredOperations.forEach(op => {
        if (!investorProfits[op.investorId]) {
            investorProfits[op.investorId] = {
                expectedProfit: 0,
                paidProfit: 0,
                dueProfit: 0
            };
        }
        
        investorProfits[op.investorId].paidProfit += op.amount;
    });
    
    // حساب الأرباح المستحقة لكل مستثمر
    Object.keys(investorProfits).forEach(investorId => {
        investorProfits[investorId].dueProfit = Math.max(0, 
            investorProfits[investorId].expectedProfit - investorProfits[investorId].paidProfit
        );
    });
    
    // إنشاء جدول الأرباح
    let tableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>المستثمر</th>
                    <th>إجمالي الأرباح المتوقعة</th>
                    <th>الأرباح المدفوعة</th>
                    <th>الأرباح المستحقة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // إنشاء مصفوفة للمستثمرين مع أرباحهم
    const investorProfit = Object.keys(investorProfits).map(id => {
        return {
            id,
            ...investorProfits[id]
        };
    });
    
    // ترتيب المستثمرين حسب الأرباح المتوقعة (الأعلى أولاً)
    investorProfit.sort((a, b) => b.expectedProfit - a.expectedProfit);
    
    investorProfit.forEach((item, index) => {
        const investor = investors.find(inv => inv.id === item.id);
        
        if (!investor) return;
        
        tableContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${investor.name}</td>
                <td>${formatCurrency(item.expectedProfit.toFixed(2))}</td>
                <td>${formatCurrency(item.paidProfit.toFixed(2))}</td>
                <td>${formatCurrency(item.dueProfit.toFixed(2))}</td>
            </tr>
        `;
    });
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    // إنشاء جدول تفاصيل دفعات الأرباح
    let paymentsTableContent = '';
    
    if (filteredOperations.length > 0) {
        paymentsTableContent = `
            <h3>سجل دفعات الأرباح</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>رقم العملية</th>
                        <th>المستثمر</th>
                        <th>المبلغ</th>
                        <th>التاريخ</th>
                        <th>ملاحظات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
        filteredOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredOperations.forEach(op => {
            const investor = investors.find(inv => inv.id === op.investorId);
            
            if (!investor) return;
            
            paymentsTableContent += `
                <tr>
                    <td>${op.id}</td>
                    <td>${investor.name}</td>
                    <td>${formatCurrency(op.amount)}</td>
                    <td>${formatDate(op.date)}</td>
                    <td>${op.notes || '-'}</td>
                </tr>
            `;
        });
        
        paymentsTableContent += `
                </tbody>
            </table>
        `;
    }
    
    // إنشاء محتوى التقرير الكامل
    const content = `
        <div class="report-header">
            <h2>تقرير الأرباح</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الأرباح المتوقعة</div>
                            <div class="card-value">${formatCurrency(totalExpectedProfits.toFixed(2))}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأرباح المدفوعة</div>
                            <div class="card-value">${formatCurrency(totalPaidProfits.toFixed(2))}</div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأرباح المستحقة</div>
                            <div class="card-value">${formatCurrency(totalDueProfits.toFixed(2))}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">نسبة الربح الشهرية</div>
                            <div class="card-value">${settings.monthlyProfitRate}%</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>ملخص الأرباح حسب المستثمر</h3>
            ${tableContent}
        </div>
        
        <div class="report-payments">
            ${paymentsTableContent}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء محتوى تقرير العمليات
 * @param {string} investorId معرف المستثمر (اختياري)
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateOperationsReportContent(investorId, fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // تصفية العمليات
    let filteredOperations = [...operations];
    
    // تصفية حسب المستثمر إذا تم تحديده
    if (investorId) {
        filteredOperations = filteredOperations.filter(op => op.investorId === investorId);
    }
    
    // تصفية حسب تاريخ العملية
    filteredOperations = filteredOperations.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= startDate && opDate <= endDate;
    });
    
    // إذا لم يتم العثور على عمليات
    if (filteredOperations.length === 0) {
        return `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد بيانات</div>
                    <div class="alert-text">لم يتم العثور على عمليات خلال الفترة المحددة.</div>
                </div>
            </div>
        `;
    }
    
    // تجميع العمليات حسب النوع
    const operationsByType = {
        investment: [],
        withdrawal: [],
        profit: []
    };
    
    filteredOperations.forEach(op => {
        if (operationsByType[op.type]) {
            operationsByType[op.type].push(op);
        }
    });
    
    // حساب إحصائيات العمليات
    const totalOperations = filteredOperations.length;
    const totalInvestments = operationsByType.investment.length;
    const totalWithdrawals = operationsByType.withdrawal.length;
    const totalProfits = operationsByType.profit.length;
    
    const totalInvestmentsAmount = operationsByType.investment.reduce((sum, op) => sum + op.amount, 0);
    const totalWithdrawalsAmount = operationsByType.withdrawal.reduce((sum, op) => sum + op.amount, 0);
    const totalProfitsAmount = operationsByType.profit.reduce((sum, op) => sum + op.amount, 0);
    
    // إنشاء جدول العمليات
    let tableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>رقم العملية</th>
                    <th>المستثمر</th>
                    <th>نوع العملية</th>
                    <th>المبلغ</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
    filteredOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredOperations.forEach(op => {
        const investor = investors.find(inv => inv.id === op.investorId);
        
        if (!investor) return;
        
        tableContent += `
            <tr>
                <td>${op.id}</td>
                <td>${investor.name}</td>
                <td>${getOperationTypeName(op.type)}</td>
                <td>${formatCurrency(op.amount)}</td>
                <td>${formatDate(op.date)}</td>
                <td><span class="status ${op.status === 'pending' ? 'pending' : 'active'}">${op.status === 'pending' ? 'معلق' : 'مكتمل'}</span></td>
                <td>${op.notes || '-'}</td>
            </tr>
        `;
    });
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    // إنشاء محتوى التقرير الكامل
    const content = `
        <div class="report-header">
            <h2>تقرير العمليات</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي العمليات</div>
                            <div class="card-value">${totalOperations}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الاستثمارات</div>
                            <div class="card-value">${formatCurrency(totalInvestmentsAmount)}</div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">السحوبات</div>
                            <div class="card-value">${formatCurrency(totalWithdrawalsAmount)}</div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-money-bill-minus"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">الأرباح المدفوعة</div>
                            <div class="card-value">${formatCurrency(totalProfitsAmount)}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>قائمة العمليات</h3>
            ${tableContent}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء محتوى تقرير مالي
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateFinancialReportContent(fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // تصفية العمليات
    const filteredOperations = operations.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= startDate && opDate <= endDate;
    });
    
    // تصفية الاستثمارات
    const filteredInvestments = investments.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= startDate && invDate <= endDate;
    });
    
    // حساب إجمالي الإيرادات (الاستثمارات الجديدة)
    const totalRevenue = filteredOperations
        .filter(op => op.type === 'investment' && op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // حساب إجمالي المصروفات (السحوبات + الأرباح المدفوعة)
    const totalExpenses = filteredOperations
        .filter(op => (op.type === 'withdrawal' || op.type === 'profit') && op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // حساب صافي الربح
    const netProfit = totalRevenue - totalExpenses;
    
    // تجميع العمليات حسب الشهر
    const monthlyData = {};
    
    filteredOperations.forEach(op => {
        const opDate = new Date(op.date);
        const month = `${opDate.getFullYear()}-${(opDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[month]) {
            monthlyData[month] = {
                investments: 0,
                withdrawals: 0,
                profits: 0
            };
        }
        
        if (op.status === 'active') {
            if (op.type === 'investment') {
                monthlyData[month].investments += op.amount;
            } else if (op.type === 'withdrawal') {
                monthlyData[month].withdrawals += op.amount;
            } else if (op.type === 'profit') {
                monthlyData[month].profits += op.amount;
            }
        }
    });
    
    // إنشاء جدول البيانات المالية الشهرية
    let monthlyTableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>الشهر</th>
                    <th>الإيرادات</th>
                    <th>المصروفات</th>
                    <th>صافي الربح</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // ترتيب الأشهر تصاعدياً
    const sortedMonths = Object.keys(monthlyData).sort();
    
    sortedMonths.forEach(month => {
        const monthData = monthlyData[month];
        const revenue = monthData.investments;
        const expenses = monthData.withdrawals + monthData.profits;
        const profit = revenue - expenses;
        
        // تنسيق الشهر
        const [year, monthNum] = month.split('-');
        const monthDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthName = monthDate.toLocaleDateString('ar-IQ', { month: 'long', year: 'numeric' });
        
        monthlyTableContent += `
            <tr>
                <td>${monthName}</td>
                <td>${formatCurrency(revenue)}</td>
                <td>${formatCurrency(expenses)}</td>
                <td>${formatCurrency(profit)}</td>
            </tr>
        `;
    });
    
    monthlyTableContent += `
            </tbody>
        </table>
    `;
    
    // إنشاء محتوى التقرير الكامل
    const content = `
        <div class="report-header">
            <h2>التقرير المالي</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الإيرادات</div>
                            <div class="card-value">${formatCurrency(totalRevenue)}</div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-arrow-circle-up"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي المصروفات</div>
                            <div class="card-value">${formatCurrency(totalExpenses)}</div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-arrow-circle-down"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">صافي الربح</div>
                            <div class="card-value">${formatCurrency(netProfit)}</div>
                        </div>
                        <div class="card-icon ${netProfit >= 0 ? 'success' : 'danger'}">
                            <i class="fas ${netProfit >= 0 ? 'fa-calculator' : 'fa-calculator'}"></i>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">عدد العمليات</div>
                            <div class="card-value">${filteredOperations.length}</div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>التحليل الشهري</h3>
            ${monthlyTableContent}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء محتوى التقرير العام
 * @param {string} investorId معرف المستثمر (اختياري)
 * @param {string} fromDate تاريخ البداية
 * @param {string} toDate تاريخ النهاية
 * @param {string} format تنسيق التقرير
 * @returns {string} محتوى التقرير
 */
function generateSummaryReportContent(investorId, fromDate, toDate, format) {
    // تحويل التواريخ إلى كائنات Date
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // تعيين نهاية اليوم لتاريخ الانتهاء
    endDate.setHours(23, 59, 59, 999);
    
    // حساب الإحصائيات العامة
    const totalInvestors = investors.length;
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const totalInvestments = activeInvestments.length;
    const totalInvestmentAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // حساب إجمالي الأرباح
    const today = new Date();
    let totalProfit = 0;
    
    activeInvestments.forEach(inv => {
        const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
        totalProfit += profit;
    });
    
    // حساب الأرباح المدفوعة
    const totalPaidProfits = operations
        .filter(op => op.type === 'profit' && op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // حساب الأرباح المستحقة
    const totalDueProfit = Math.max(0, totalProfit - totalPaidProfits);
    
    // تصفية العمليات
    const filteredOperations = operations.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= startDate && opDate <= endDate;
    });
    
    // تجميع العمليات حسب النوع
    const operationsByType = {
        investment: [],
        withdrawal: [],
        profit: []
    };
    
    filteredOperations.forEach(op => {
        if (operationsByType[op.type]) {
            operationsByType[op.type].push(op);
        }
    });
    
    // حساب إحصائيات العمليات
    const periodInvestments = operationsByType.investment
        .filter(op => op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    const periodWithdrawals = operationsByType.withdrawal
        .filter(op => op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    const periodProfits = operationsByType.profit
        .filter(op => op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // إنشاء محتوى التقرير
    const content = `
        <div class="report-header">
            <h2>التقرير العام</h2>
            <p>الفترة: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
        </div>
        
        <div class="report-summary">
            <div style="margin-bottom: 20px;">
                <h3>ملخص الإحصائيات</h3>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">عدد المستثمرين</div>
                                <div class="card-value">${totalInvestors}</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">الاستثمارات النشطة</div>
                                <div class="card-value">${totalInvestments}</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الاستثمارات</div>
                                <div class="card-value">${formatCurrency(totalInvestmentAmount)}</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الأرباح</div>
                                <div class="card-value">${formatCurrency(totalProfit.toFixed(2))}</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-hand-holding-usd"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>نظرة عامة على الفترة (${formatDate(fromDate)} - ${formatDate(toDate)})</h3>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">استثمارات جديدة</div>
                                <div class="card-value">${formatCurrency(periodInvestments)}</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">السحوبات</div>
                                <div class="card-value">${formatCurrency(periodWithdrawals)}</div>
                            </div>
                            <div class="card-icon danger">
                                <i class="fas fa-minus-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأرباح المدفوعة</div>
                                <div class="card-value">${formatCurrency(periodProfits)}</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-money-bill"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">صافي التدفق</div>
                                <div class="card-value">${formatCurrency(periodInvestments - periodWithdrawals - periodProfits)}</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>معلومات الربحية</h3>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">نسبة الربح الشهرية</div>
                                <div class="card-value">${settings.monthlyProfitRate}%</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-percentage"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الأرباح</div>
                                <div class="card-value">${formatCurrency(totalProfit.toFixed(2))}</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-hand-holding-usd"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأرباح المدفوعة</div>
                                <div class="card-value">${formatCurrency(totalPaidProfits.toFixed(2))}</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأرباح المستحقة</div>
                                <div class="card-value">${formatCurrency(totalDueProfit.toFixed(2))}</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="report-details">
            <h3>توزيع الاستثمارات حسب المستثمر</h3>
            ${generateInvestorDistributionChart()}
        </div>
    `;
    
    return content;
}

/**
 * إنشاء مخطط توزيع الاستثمارات حسب المستثمر
 * @returns {string} كود HTML لعرض المخطط
 */
function generateInvestorDistributionChart() {
    // تجميع الاستثمارات حسب المستثمر
    const investorDistribution = {};
    
    investments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            if (!investorDistribution[inv.investorId]) {
                const investor = investors.find(i => i.id === inv.investorId);
                if (investor) {
                    investorDistribution[inv.investorId] = {
                        name: investor.name,
                        amount: 0
                    };
                }
            }
            
            if (investorDistribution[inv.investorId]) {
                investorDistribution[inv.investorId].amount += inv.amount;
            }
        });
    
    // تحويل الكائن إلى مصفوفة
    const distributionArray = Object.values(investorDistribution);
    
    // ترتيب المستثمرين حسب مبلغ الاستثمار (تنازلياً)
    distributionArray.sort((a, b) => b.amount - a.amount);
    
    // الحصول على أكبر 10 مستثمرين
    const top10Investors = distributionArray.slice(0, 10);
    
    // إذا لم يكن هناك بيانات، عرض رسالة
    if (top10Investors.length === 0) {
        return `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد بيانات</div>
                    <div class="alert-text">لا توجد استثمارات نشطة لعرض التوزيع.</div>
                </div>
            </div>
        `;
    }
    
    // إنشاء جدول التوزيع
    let tableContent = `
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>المستثمر</th>
                    <th>إجمالي الاستثمار</th>
                    <th>النسبة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // حساب إجمالي الاستثمارات
    const totalAmount = top10Investors.reduce((sum, inv) => sum + inv.amount, 0);
    
    top10Investors.forEach((inv, index) => {
        const percentage = ((inv.amount / totalAmount) * 100).toFixed(2);
        
        tableContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${inv.name}</td>
                <td>${formatCurrency(inv.amount)}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    return tableContent;
}

// ========== وظيفة إنشاء ملف PDF ==========

/**
 * إنشاء ملف PDF للتقرير
 * @param {string} reportId معرف التقرير
 */
function generatePdfReport(reportId) {
    // البحث عن التقرير
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
        createNotification('خطأ', 'التقرير غير موجود', 'danger');
        return;
    }
    
    // عرض التقرير للطباعة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        createNotification('خطأ', 'تم منع فتح نافذة جديدة. يرجى السماح بالنوافذ المنبثقة.', 'danger');
        return;
    }
    
    // إعداد محتوى الصفحة
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${report.title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 20px;
                    direction: rtl;
                }
                
                .report-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .logo {
                    margin-bottom: 20px;
                }
                
                h1 {
                    margin: 0;
                    color: #333;
                }
                
                .report-date {
                    color: #777;
                    font-size: 14px;
                }
                
                .company-info {
                    margin-top: 20px;
                    font-size: 14px;
                }
                
                .dashboard-cards {
                    display: flex;
                    flex-wrap: wrap;
                    margin: 0 -10px;
                    margin-bottom: 30px;
                }
                
                .card {
                    flex: 1 1 calc(25% - 20px);
                    margin: 0 10px 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                .card-title {
                    margin: 0;
                    color: #777;
                    font-size: 14px;
                }
                
                .card-value {
                    margin: 5px 0 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                
                th, td {
                    padding: 10px;
                    text-align: right;
                    border-bottom: 1px solid #ddd;
                }
                
                th {
                    background-color: #f2f2f2;
                    font-weight: 600;
                    border-bottom: 2px solid #ddd;
                }
                
                .status {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
                
                .status.active {
                    background-color: #e8f7ed;
                    color: #28a745;
                }
                
                .status.pending {
                    background-color: #fff8e1;
                    color: #ffc107;
                }
                
                .status.closed {
                    background-color: #feecec;
                    color: #dc3545;
                }
                
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                
                @media print {
                    .no-print {
                        display: none;
                    }
                    
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div class="logo">${settings.companyName}</div>
                <h1>${report.title}</h1>
                <div class="report-date">تاريخ التقرير: ${formatDate(new Date().toISOString())}</div>
                <div class="company-info">
                    <div>${settings.companyAddress || 'الحلة، بابل، العراق'}</div>
                    <div>${settings.companyPhone || '07701234567'} | ${settings.companyEmail || 'info@example.com'}</div>
                </div>
            </div>
            
            <div class="report-content">
                ${report.content}
            </div>
            
            <div class="footer">
                <div>جميع الحقوق محفوظة © ${new Date().getFullYear()} ${settings.companyName}</div>
                <div>تم إنشاء هذا التقرير بواسطة نظام إدارة الاستثمار</div>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                    طباعة التقرير
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px;">
                    إغلاق
                </button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // إظهار رسالة نجاح
    createNotification('نجاح', 'تم إنشاء التقرير بنجاح وجاهز للطباعة', 'success');
}

// ========== تسجيل الدوال الناقصة ==========

// تسجيل الدوال في النافذة العالمية
window.loadReportsForTab = loadReportsForTab;
window.generateInvestorsReportContent = generateInvestorsReportContent;
window.generateInvestmentsReportContent = generateInvestmentsReportContent;
window.generateProfitsReportContent = generateProfitsReportContent;
window.generateOperationsReportContent = generateOperationsReportContent;
window.generateFinancialReportContent = generateFinancialReportContent;
window.generateSummaryReportContent = generateSummaryReportContent;
window.generatePdfReport = generatePdfReport;

// تهيئة صفحة التقارير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // البحث عن علامة التبويب النشطة
    const activeTab = document.querySelector('#reports .tab.active');
    
    if (activeTab) {
        // استخراج معرف علامة التبويب
        const tabId = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        // تحميل المحتوى المناسب لعلامة التبويب
        loadReportsForTab(tabId);
    } else {
        // تحميل المحتوى الافتراضي
        loadRecentReports();
    }
    
    // تهيئة نموذج إنشاء التقرير
    prepareReportForm();
    
    console.log('تم تهيئة نظام التقارير بنجاح');
});