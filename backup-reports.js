/**
 * وظائف توليد تقارير النسخ الاحتياطي
 * هذا الملف يقدم وظائف إضافية لإنشاء تقارير مفصلة عن النسخ الاحتياطية
 */

// كائن عام لإدارة تقارير النسخ الاحتياطي
window.BackupReportGenerator = {
    /**
     * إنشاء تقرير مفصل عن النسخة الاحتياطية
     * @param {Object} backup - كائن النسخة الاحتياطية
     * @returns {string} - محتوى التقرير بصيغة HTML
     */
    generateDetailedReport: function(backup) {
        if (!backup) return null;
        
        // إنشاء تاريخ التقرير
        const reportDate = new Date();
        
        // حساب الإحصائيات
        const stats = this.calculateBackupStats(backup);
        
        // إنشاء محتوى التقرير
        const reportContent = `
        <div class="backup-report">
            <div class="report-header">
                <h1>تقرير النسخة الاحتياطية الشامل</h1>
                <p class="report-date">تاريخ التقرير: ${reportDate.toLocaleDateString('ar-IQ')} ${reportDate.toLocaleTimeString('ar-IQ')}</p>
            </div>
            
            <div class="report-section">
                <h2>معلومات النسخة الاحتياطية</h2>
                <table class="report-table">
                    <tr>
                        <th>الاسم:</th>
                        <td>${backup.name}</td>
                    </tr>
                    <tr>
                        <th>تاريخ الإنشاء:</th>
                        <td>${new Date(backup.createdAt).toLocaleDateString('ar-IQ')} ${new Date(backup.createdAt).toLocaleTimeString('ar-IQ')}</td>
                    </tr>
                    <tr>
                        <th>المعرف:</th>
                        <td>${backup.id}</td>
                    </tr>
                    <tr>
                        <th>حجم النسخة:</th>
                        <td>${this.formatFileSize(backup.size || 0)}</td>
                    </tr>
                    <tr>
                        <th>التنسيقات:</th>
                        <td>${this.getFormatsString(backup.formats)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="report-section">
                <h2>إحصائيات البيانات</h2>
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${stats.investorsCount}</div>
                        <div class="stat-label">المستثمرين</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="stat-value">${stats.investmentsCount}</div>
                        <div class="stat-label">الاستثمارات</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-exchange-alt"></i></div>
                        <div class="stat-value">${stats.operationsCount}</div>
                        <div class="stat-label">العمليات</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                        <div class="stat-value">${stats.eventsCount}</div>
                        <div class="stat-label">الأحداث</div>
                    </div>
                </div>
                
                <div class="report-subsection">
                    <h3>التفاصيل المالية</h3>
                    <table class="report-table">
                        <tr>
                            <th>إجمالي قيمة الاستثمارات النشطة:</th>
                            <td>${this.formatCurrency(stats.totalActiveInvestments)}</td>
                        </tr>
                        <tr>
                            <th>إجمالي الأرباح المحسوبة:</th>
                            <td>${this.formatCurrency(stats.totalCalculatedProfits)}</td>
                        </tr>
                        <tr>
                            <th>إجمالي الأرباح المدفوعة:</th>
                            <td>${this.formatCurrency(stats.totalPaidProfits)}</td>
                        </tr>
                        <tr>
                            <th>إجمالي السحوبات:</th>
                            <td>${this.formatCurrency(stats.totalWithdrawals)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="report-section">
                <h2>سلامة النسخة الاحتياطية</h2>
                <div class="integrity-status ${stats.integrityCheck ? 'success' : 'danger'}">
                    <i class="fas fa-${stats.integrityCheck ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${stats.integrityCheck ? 'تم التحقق من سلامة النسخة الاحتياطية' : 'هناك مشكلة في سلامة النسخة الاحتياطية'}</span>
                </div>
                ${!stats.integrityCheck ? `
                <div class="integrity-issues">
                    <h3>المشاكل المكتشفة:</h3>
                    <ul>
                        ${stats.integrityIssues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            
            <div class="report-section">
                <h2>توزيع البيانات</h2>
                <div class="chart-container">
                    <canvas id="dataDistributionChart" width="400" height="300"></canvas>
                </div>
                <script>
                    // إنشاء الرسم البياني عند عرض التقرير
                    const ctx = document.getElementById('dataDistributionChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: ['المستثمرين', 'الاستثمارات', 'العمليات', 'الأحداث', 'الإشعارات', 'التقارير'],
                            datasets: [{
                                data: [
                                    ${stats.investorsCount},
                                    ${stats.investmentsCount},
                                    ${stats.operationsCount},
                                    ${stats.eventsCount},
                                    ${stats.notificationsCount},
                                    ${stats.reportsCount}
                                ],
                                backgroundColor: [
                                    'rgba(52, 152, 219, 0.8)',
                                    'rgba(46, 204, 113, 0.8)',
                                    'rgba(155, 89, 182, 0.8)',
                                    'rgba(241, 196, 15, 0.8)',
                                    'rgba(231, 76, 60, 0.8)',
                                    'rgba(52, 73, 94, 0.8)'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'right'
                                }
                            }
                        }
                    });
                </script>
            </div>
            
            <div class="report-section">
                <h2>استثمارات حسب المستثمر</h2>
                <div class="chart-container">
                    <canvas id="investorInvestmentsChart" width="600" height="400"></canvas>
                </div>
                <script>
                    // إنشاء الرسم البياني عند عرض التقرير
                    const investorsCtx = document.getElementById('investorInvestmentsChart').getContext('2d');
                    new Chart(investorsCtx, {
                        type: 'bar',
                        data: {
                            labels: ${JSON.stringify(stats.topInvestors.map(i => i.name))},
                            datasets: [{
                                label: 'قيمة الاستثمارات',
                                data: ${JSON.stringify(stats.topInvestors.map(i => i.totalInvestment))},
                                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                                borderColor: 'rgba(52, 152, 219, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                </script>
            </div>
            
            <div class="report-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام النسخ الاحتياطي الشامل</p>
                <p>© ${new Date().getFullYear()} ${window.settings?.companyName || 'شركة الاستثمار العراقية'}</p>
            </div>
        </div>
        `;
        
        return reportContent;
    },
    
    /**
     * حساب إحصائيات النسخة الاحتياطية
     * @param {Object} backup - كائن النسخة الاحتياطية
     * @returns {Object} - كائن يحتوي على الإحصائيات
     */
    calculateBackupStats: function(backup) {
        const data = backup.data || {};
        const investors = data.investors || [];
        const investments = data.investments || [];
        const operations = data.operations || [];
        const events = data.events || [];
        const notifications = data.notifications || [];
        const reports = data.reports || [];
        
        // حساب القيم الإجمالية
        const activeInvestments = investments.filter(inv => inv.status === 'active');
        const totalActiveInvestments = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // حساب إجمالي الأرباح المحسوبة (تقريبي)
        let totalCalculatedProfits = 0;
        const today = new Date();
        
        activeInvestments.forEach(inv => {
            // استخدام الوظيفة العامة لحساب الربح إن وجدت
            if (typeof calculateProfit === 'function') {
                const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
                totalCalculatedProfits += profit;
            } else {
                // حساب تقريبي بناءً على نسبة الربح الشهرية والمدة
                const monthlyRate = backup.data.settings?.monthlyProfitRate || 1.75;
                const startDate = new Date(inv.date);
                const months = (today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth();
                const profit = (inv.amount * monthlyRate / 100) * months;
                totalCalculatedProfits += profit;
            }
        });
        
        // حساب العمليات
        const profitOperations = operations.filter(op => op.type === 'profit' && op.status === 'active');
        const withdrawalOperations = operations.filter(op => op.type === 'withdrawal' && op.status === 'active');
        
        const totalPaidProfits = profitOperations.reduce((sum, op) => sum + op.amount, 0);
        const totalWithdrawals = withdrawalOperations.reduce((sum, op) => sum + op.amount, 0);
        
        // حساب أكبر 5 مستثمرين
        const investorTotals = {};
        
        investments.forEach(inv => {
            if (!investorTotals[inv.investorId]) {
                investorTotals[inv.investorId] = 0;
            }
            investorTotals[inv.investorId] += inv.amount;
        });
        
        // تحويل إلى مصفوفة وترتيبها
        const topInvestors = Object.keys(investorTotals)
            .map(id => {
                const investor = investors.find(inv => inv.id === id);
                return {
                    id,
                    name: investor ? investor.name : 'مستثمر غير معروف',
                    totalInvestment: investorTotals[id]
                };
            })
            .sort((a, b) => b.totalInvestment - a.totalInvestment)
            .slice(0, 5); // أخذ أكبر 5 مستثمرين
        
        // فحص سلامة النسخة الاحتياطية
        const integrityCheck = this.checkBackupIntegrity(backup);
        
        return {
            investorsCount: investors.length,
            investmentsCount: investments.length,
            operationsCount: operations.length,
            eventsCount: events.length,
            notificationsCount: notifications.length,
            reportsCount: reports.length,
            totalActiveInvestments,
            totalCalculatedProfits,
            totalPaidProfits,
            totalWithdrawals,
            topInvestors,
            integrityCheck: integrityCheck.valid,
            integrityIssues: integrityCheck.issues
        };
    },
    
    /**
     * فحص سلامة النسخة الاحتياطية
     * @param {Object} backup - كائن النسخة الاحتياطية
     * @returns {Object} - نتيجة الفحص
     */
    checkBackupIntegrity: function(backup) {
        const issues = [];
        
        // التحقق من وجود البيانات الأساسية
        if (!backup.data) {
            issues.push('لا توجد بيانات في النسخة الاحتياطية');
            return { valid: false, issues };
        }
        
        // التحقق من وجود المستثمرين والاستثمارات والعمليات
        if (!backup.data.investors || !Array.isArray(backup.data.investors)) {
            issues.push('بيانات المستثمرين غير موجودة أو غير صالحة');
        }
        
        if (!backup.data.investments || !Array.isArray(backup.data.investments)) {
            issues.push('بيانات الاستثمارات غير موجودة أو غير صالحة');
        }
        
        if (!backup.data.operations || !Array.isArray(backup.data.operations)) {
            issues.push('بيانات العمليات غير موجودة أو غير صالحة');
        }
        
        // التحقق من تطابق البيانات
        if (backup.data.investments && backup.data.investors) {
            // التحقق من أن جميع الاستثمارات مرتبطة بمستثمرين موجودين
            const investorIds = new Set(backup.data.investors.map(inv => inv.id));
            
            const orphanedInvestments = backup.data.investments.filter(inv => !investorIds.has(inv.investorId));
            
            if (orphanedInvestments.length > 0) {
                issues.push(`هناك ${orphanedInvestments.length} استثمار غير مرتبط بمستثمرين موجودين`);
            }
        }
        
        if (backup.data.operations && backup.data.investments) {
            // التحقق من أن جميع العمليات مرتبطة باستثمارات موجودة
            const investmentIds = new Set(backup.data.investments.map(inv => inv.id));
            
            const operationsWithInvestments = backup.data.operations.filter(op => op.investmentId);
            const orphanedOperations = operationsWithInvestments.filter(op => !investmentIds.has(op.investmentId));
            
            if (orphanedOperations.length > 0) {
                issues.push(`هناك ${orphanedOperations.length} عملية غير مرتبطة باستثمارات موجودة`);
            }
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    },
    
    /**
     * الحصول على سلسلة نصية للتنسيقات المتاحة
     * @param {Object} formats - كائن التنسيقات
     * @returns {string} - سلسلة نصية للتنسيقات
     */
    getFormatsString: function(formats) {
        if (!formats) return 'غير محدد';
        
        const enabledFormats = [];
        
        if (formats.json) enabledFormats.push('JSON');
        if (formats.pdf) enabledFormats.push('PDF');
        if (formats.excel) enabledFormats.push('Excel');
        if (formats.word) enabledFormats.push('Word');
        
        return enabledFormats.join(', ') || 'لا يوجد';
    },
    
    /**
     * تنسيق حجم الملف
     * @param {number} bytes - حجم الملف بالبايت
     * @returns {string} - حجم الملف منسق
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * تنسيق المبلغ بالعملة
     * @param {number} amount - المبلغ
     * @returns {string} - المبلغ منسق
     */
    formatCurrency: function(amount) {
        // استخدام الوظيفة العامة لتنسيق العملة إن وجدت
        if (typeof formatCurrency === 'function') {
            return formatCurrency(amount);
        }
        
        // تنسيق افتراضي
        const currency = window.settings?.currency || 'IQD';
        return amount.toLocaleString('ar-IQ') + ' ' + currency;
    },
    
    /**
     * عرض التقرير المفصل للنسخة الاحتياطية
     * @param {string} backupId - معرف النسخة الاحتياطية
     */
    showDetailedReport: function(backupId) {
        // الحصول على النسخة الاحتياطية
        const backup = this.getBackupById(backupId);
        
        if (!backup) {
            createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
            return;
        }
        
        // إنشاء نافذة التقرير
        const reportWindow = window.open('', '_blank', 'width=800,height=600');
        
        // إنشاء محتوى التقرير
        const reportContent = this.generateDetailedReport(backup);
        
        // إنشاء محتوى الصفحة
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تقرير النسخة الاحتياطية - ${backup.name}</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        direction: rtl;
                        padding: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                        background-color: #f9f9f9;
                    }
                    
                    .backup-report {
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                    }
                    
                    .report-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #eee;
                    }
                    
                    .report-header h1 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
                    
                    .report-date {
                        color: #7f8c8d;
                        font-size: 14px;
                    }
                    
                    .report-section {
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .report-section h2 {
                        color: #3498db;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .report-subsection h3 {
                        color: #2c3e50;
                        margin-top: 20px;
                        margin-bottom: 15px;
                    }
                    
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    .report-table th, .report-table td {
                        padding: 12px;
                        text-align: right;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .report-table th {
                        background-color: #f8f9fa;
                        color: #2c3e50;
                        font-weight: 600;
                    }
                    
                    .stats-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .stat-card {
                        flex: 1;
                        min-width: 200px;
                        background: white;
                        border-radius: 10px;
                        padding: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        text-align: center;
                        transition: transform 0.3s ease;
                    }
                    
                    .stat-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                    }
                    
                    .stat-icon {
                        font-size: 2rem;
                        color: #3498db;
                        margin-bottom: 10px;
                    }
                    
                    .stat-value {
                        font-size: 1.8rem;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 5px;
                    }
                    
                    .stat-label {
                        color: #7f8c8d;
                        font-size: 0.9rem;
                    }
                    
                    .chart-container {
                        height: 400px;
                        margin-bottom: 30px;
                    }
                    
                    .integrity-status {
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        font-weight: 600;
                    }
                    
                    .integrity-status.success {
                        background-color: rgba(46, 204, 113, 0.1);
                        color: #27ae60;
                    }
                    
                    .integrity-status.danger {
                        background-color: rgba(231, 76, 60, 0.1);
                        color: #c0392b;
                    }
                    
                    .integrity-status i {
                        font-size: 1.5rem;
                        margin-left: 10px;
                    }
                    
                    .integrity-issues {
                        background-color: rgba(231, 76, 60, 0.05);
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .integrity-issues h3 {
                        color: #c0392b;
                        margin-top: 0;
                        margin-bottom: 10px;
                    }
                    
                    .integrity-issues ul {
                        margin: 0;
                        padding-right: 20px;
                    }
                    
                    .integrity-issues li {
                        margin-bottom: 5px;
                    }
                    
                    .report-footer {
                        text-align: center;
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #7f8c8d;
                        font-size: 0.9rem;
                    }
                    
                    @media print {
                        body {
                            background-color: white;
                        }
                        
                        .backup-report {
                            box-shadow: none;
                        }
                        
                        .stat-card {
                            box-shadow: none;
                            border: 1px solid #eee;
                        }
                        
                        .report-section {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                ${reportContent}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-print"></i> طباعة التقرير
                    </button>
                </div>
            </body>
            </html>
        `);
        
        reportWindow.document.close();
    },
    
    /**
     * الحصول على النسخة الاحتياطية بالمعرف
     * @param {string} backupId - معرف النسخة الاحتياطية
     * @returns {Object|null} - كائن النسخة الاحتياطية
     */
    getBackupById: function(backupId) {
        if (window.ComprehensiveBackupSystem) {
            return window.ComprehensiveBackupSystem.backups.find(b => b.id === backupId);
        }
        
        return null;
    }
};

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام توليد التقارير
    // يمكن إضافة وظائف إضافية هنا
});

/**
 * عرض تقرير مفصل للنسخة الاحتياطية
 * @param {string} backupId - معرف النسخة الاحتياطية
 */
function showBackupDetailedReport(backupId) {
    if (window.BackupReportGenerator) {
        window.BackupReportGenerator.showDetailedReport(backupId);
    }
}

/**
 * إضافة زر التقرير المفصل إلى واجهة النسخ الاحتياطية
 */
function addReportButtonToBackupUI() {
    // التحقق من وجود قائمة النسخ الاحتياطية
    const backupListActions = document.querySelector('.backup-list-actions');
    
    if (backupListActions) {
        // إنشاء زر التقرير
        const reportButton = document.createElement('button');
        reportButton.className = 'btn btn-info';
        reportButton.innerHTML = '<i class="fas fa-chart-bar"></i> تقرير مفصل';
        reportButton.onclick = function() {
            const backupSelect = document.getElementById('comprehensiveBackupsList');
            
            if (!backupSelect || !backupSelect.value) {
                createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
                return;
            }
            
            const backupId = backupSelect.value;
            showBackupDetailedReport(backupId);
        };
        
        // إضافة الزر بعد زر الاستعادة
        const restoreButton = backupListActions.querySelector('button:nth-child(2)');
        if (restoreButton) {
            backupListActions.insertBefore(reportButton, restoreButton.nextSibling);
        } else {
            backupListActions.appendChild(reportButton);
        }
    }
}

// إضافة زر التقرير المفصل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر التقرير المفصل بعد لحظة لضمان وجود العناصر
    setTimeout(addReportButtonToBackupUI, 1000);
});