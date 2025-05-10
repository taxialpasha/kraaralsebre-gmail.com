// ==================== ملف ربط الموظفين بالأقساط ====================
// employee-installment-integration.js

// المتغيرات العامة
let employeeInstallmentIntegrationInitialized = false;

// تهيئة نظام ربط الموظفين بالأقساط
function initEmployeeInstallmentIntegration() {
    if (employeeInstallmentIntegrationInitialized) {
        console.log('نظام ربط الموظفين بالأقساط مهيأ مسبقاً');
        return;
    }

    console.log('جاري تهيئة نظام ربط الموظفين بالأقساط...');
    
    // تعديل واجهة صفحة الموظفين
    enhanceEmployeeInterface();
    
    // تعديل نافذة صرف الراتب
    enhancePaySalaryModal();
    
    // إضافة معالج الأحداث
    addEmployeeInstallmentEventHandlers();
    
    // إضافة الحقول المخصصة لإعدادات الاستقطاع
    addInstallmentDeductionSettings();
    
    employeeInstallmentIntegrationInitialized = true;
    console.log('تم تهيئة نظام ربط الموظفين بالأقساط بنجاح');
}

// الحصول على أقساط الموظف النشطة
function getEmployeeActiveInstallments(employeeId) {
    if (typeof installments === 'undefined' || typeof installmentPayments === 'undefined') {
        console.warn('نظام الأقساط غير متوفر');
        return [];
    }
    
    // البحث عن القروض المرتبطة بالموظف
    const employeeInstallments = installments.filter(inst => 
        inst.borrowerType === 'employee' && 
        inst.borrowerId === employeeId && 
        inst.status === 'active'
    );
    
    const activePayments = [];
    
    employeeInstallments.forEach(installment => {
        // الحصول على الأقساط المستحقة
        const duePayments = installmentPayments.filter(payment => 
            payment.installmentId === installment.id && 
            (payment.status === 'pending' || payment.status === 'late') &&
            !payment.isPartial
        );
        
        duePayments.forEach(payment => {
            activePayments.push({
                installmentId: installment.id,
                paymentId: payment.id,
                paymentNumber: payment.number,
                amount: payment.amount,
                dueDate: payment.dueDate,
                status: payment.status,
                borrowerName: installment.borrowerName || 'موظف'
            });
        });
    });
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    activePayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return activePayments;
}

// حساب إجمالي الأقساط المستحقة للموظف
function calculateEmployeeTotalDueInstallments(employeeId) {
    const activeInstallments = getEmployeeActiveInstallments(employeeId);
    return activeInstallments.reduce((total, payment) => total + payment.amount, 0);
}

// تحسين واجهة صفحة الموظفين
function enhanceEmployeeInterface() {
    // إضافة عمود الأقساط في جدول الموظفين
    const employeesTable = document.getElementById('employeesTable');
    if (!employeesTable) return;
    
    // تعديل رأس الجدول
    const thead = employeesTable.querySelector('thead tr');
    if (thead) {
        const installmentHeader = document.createElement('th');
        installmentHeader.textContent = 'الأقساط';
        thead.insertBefore(installmentHeader, thead.cells[8]); // قبل عمود الإجراءات
    }
    
    // تحديث بيانات الجدول
    updateEmployeeTableWithInstallments();
}

// تحديث جدول الموظفين بمعلومات الأقساط
function updateEmployeeTableWithInstallments() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const employee = employees[index];
        if (!employee) return;
        
        // حساب إجمالي الأقساط المستحقة
        const totalDue = calculateEmployeeTotalDueInstallments(employee.id);
        const activeInstallments = getEmployeeActiveInstallments(employee.id);
        
        // إنشاء خلية الأقساط
        const installmentCell = document.createElement('td');
        
        if (activeInstallments.length > 0) {
            installmentCell.innerHTML = `
                <div class="installment-badge" title="${activeInstallments.length} قسط مستحق">
                    <span class="badge ${totalDue > 0 ? 'badge-warning' : 'badge-info'}">
                        ${activeInstallments.length} أقساط
                    </span>
                    <div class="installment-amount">
                        ${formatCurrency(totalDue)}
                    </div>
                </div>
            `;
        } else {
            installmentCell.innerHTML = '<span class="text-muted">لا يوجد</span>';
        }
        
        // إضافة الخلية قبل خلية الإجراءات
        row.insertBefore(installmentCell, row.cells[8]);
    });
}

// تحسين نافذة صرف الراتب
function enhancePaySalaryModal() {
    // تعديل دالة paySalary الأصلية
    const originalPaySalary = window.paySalary;
    
    window.paySalary = function(employeeId) {
        // استدعاء الدالة الأصلية
        originalPaySalary(employeeId);
        
        // إضافة معلومات الأقساط إلى النافذة
        setTimeout(() => {
            addInstallmentInfoToSalaryModal(employeeId);
        }, 100);
    };
}

// إضافة معلومات الأقساط إلى نافذة صرف الراتب
function addInstallmentInfoToSalaryModal(employeeId) {
    const modal = document.getElementById('paySalaryModal');
    if (!modal) return;
    
    const activeInstallments = getEmployeeActiveInstallments(employeeId);
    const totalDue = calculateEmployeeTotalDueInstallments(employeeId);
    
    // إنشاء قسم الأقساط في النافذة
    const installmentSection = document.createElement('div');
    installmentSection.className = 'installment-section';
    installmentSection.innerHTML = `
        <div class="form-group">
            <h4>الأقساط المستحقة</h4>
        </div>
        ${activeInstallments.length > 0 ? `
            <div class="alert alert-warning">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">أقساط مستحقة</div>
                    <div class="alert-text">
                        يوجد ${activeInstallments.length} قسط مستحق بإجمالي ${formatCurrency(totalDue)}
                    </div>
                </div>
            </div>
            
            <div class="table-container" style="max-height: 200px; overflow-y: auto;">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>رقم القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>خصم تلقائي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeInstallments.map(payment => `
                            <tr>
                                <td>${payment.paymentNumber}</td>
                                <td>${formatDate(payment.dueDate)}</td>
                                <td>${formatCurrency(payment.amount)}</td>
                                <td>
                                    <span class="status ${payment.status === 'late' ? 'danger' : 'pending'}">
                                        ${payment.status === 'late' ? 'متأخر' : 'مستحق'}
                                    </span>
                                </td>
                                <td>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" 
                                               id="autoDeduct_${payment.paymentId}" 
                                               value="${payment.paymentId}"
                                               data-amount="${payment.amount}"
                                               checked>
                                        <label class="form-check-label" for="autoDeduct_${payment.paymentId}">
                                            خصم
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="form-row" style="margin-top: 10px;">
                <div class="form-group">
                    <label class="form-label">إجمالي القسط المخصوم</label>
                    <input type="number" class="form-control" id="totalInstallmentDeduction" value="${totalDue}" readonly>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-warning btn-sm" onclick="toggleAllInstallmentDeductions()">
                        <i class="fas fa-check-double"></i> تحديد/إلغاء الكل
                    </button>
                </div>
            </div>
        ` : `
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">لا توجد أقساط</div>
                    <div class="alert-text">لا توجد أقساط مستحقة على هذا الموظف</div>
                </div>
            </div>
        `}
    `;
    
    // إضافة قسم الأقساط قبل الملاحظات
    const notesRow = modal.querySelector('.form-group:has(#salaryNotes)').parentNode;
    notesRow.parentNode.insertBefore(installmentSection, notesRow);
    
    // إضافة معالجات الأحداث للخانات
    if (activeInstallments.length > 0) {
        addInstallmentCheckboxHandlers();
        updateTotalSalaryWithDeductions();
    }
}

// إضافة معالجات أحداث خانات الاختيار للأقساط
function addInstallmentCheckboxHandlers() {
    const checkboxes = document.querySelectorAll('[id^="autoDeduct_"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateInstallmentDeductionTotal();
            updateTotalSalaryWithDeductions();
        });
    });
}

// تحديث إجمالي الأقساط المخصومة
function updateInstallmentDeductionTotal() {
    const checkboxes = document.querySelectorAll('[id^="autoDeduct_"]:checked');
    let total = 0;
    
    checkboxes.forEach(checkbox => {
        total += parseFloat(checkbox.dataset.amount) || 0;
    });
    
    document.getElementById('totalInstallmentDeduction').value = total;
}

// تحديث إجمالي الراتب مع الاستقطاعات
function updateTotalSalaryWithDeductions() {
    const basicSalary = parseFloat(document.getElementById('salaryBasicAmount').value) || 0;
    const commission = parseFloat(document.getElementById('salaryCommission').value) || 0;
    const allowances = parseFloat(document.getElementById('salaryAllowances').value) || 0;
    const deductions = parseFloat(document.getElementById('salaryDeductions').value) || 0;
    const installmentDeduction = parseFloat(document.getElementById('totalInstallmentDeduction').value) || 0;
    
    const totalAmount = basicSalary + commission + allowances - deductions - installmentDeduction;
    document.getElementById('salaryTotalAmount').value = totalAmount;
}

// تبديل تحديد جميع الأقساط
function toggleAllInstallmentDeductions() {
    const checkboxes = document.querySelectorAll('[id^="autoDeduct_"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
    
    updateInstallmentDeductionTotal();
    updateTotalSalaryWithDeductions();
}

// إضافة معالجات الأحداث
function addEmployeeInstallmentEventHandlers() {
    // تعديل دالة saveSalary الأصلية
    const originalSaveSalary = window.saveSalary;
    
    window.saveSalary = function() {
        // معالجة الأقساط المحددة للخصم
        processInstallmentDeductions();
        
        // استدعاء الدالة الأصلية
        originalSaveSalary();
    };
    
    // تعديل دالة calculateTotalSalary الأصلية
    const originalCalculateTotalSalary = window.calculateTotalSalary;
    
    window.calculateTotalSalary = function() {
        // استدعاء الدالة الأصلية
        originalCalculateTotalSalary();
        
        // تحديث القيمة مع الأقساط
        if (document.getElementById('totalInstallmentDeduction')) {
            updateTotalSalaryWithDeductions();
        }
    };
}

// معالجة استقطاعات الأقساط
function processInstallmentDeductions() {
    const employeeId = document.getElementById('salaryEmployeeId').value;
    const month = document.getElementById('salaryMonth').value;
    
    // الحصول على الأقساط المحددة للخصم
    const selectedInstallments = [];
    const checkboxes = document.querySelectorAll('[id^="autoDeduct_"]:checked');
    
    checkboxes.forEach(checkbox => {
        const paymentId = checkbox.value;
        const amount = parseFloat(checkbox.dataset.amount);
        
        selectedInstallments.push({
            paymentId,
            amount
        });
    });
    
    // إنشاء سجل لاستقطاعات الأقساط
    if (selectedInstallments.length > 0) {
        selectedInstallments.forEach(item => {
            // تحديث حالة القسط
            const payment = installmentPayments.find(p => p.id === item.paymentId);
            if (payment) {
                payment.status = 'paid';
                payment.paymentDate = new Date().toISOString().split('T')[0];
                payment.paymentMethod = 'salary_deduction';
                payment.notes = `تم الخصم من راتب شهر ${formatMonth(month)}`;
            }
        });
        
        // حفظ تغييرات الأقساط
        if (typeof saveInstallmentData === 'function') {
            saveInstallmentData();
        } else {
            localStorage.setItem('installmentPayments', JSON.stringify(installmentPayments));
        }
        
        // إنشاء إشعار
        createNotification(
            'استقطاع أقساط',
            `تم استقطاع ${selectedInstallments.length} قسط من راتب الموظف`,
            'success'
        );
    }
}

// إضافة إعدادات استقطاع الأقساط
function addInstallmentDeductionSettings() {
    // إنشاء قسم إعدادات في صفحة الموظفين
    const settingsSection = document.createElement('div');
    settingsSection.className = 'settings-section';
    settingsSection.innerHTML = `
        <div class="form-group">
            <h4>إعدادات استقطاع الأقساط</h4>
        </div>
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="autoDeductInstallments" checked>
            <label class="form-check-label" for="autoDeductInstallments">
                استقطاع الأقساط تلقائياً عند صرف الراتب
            </label>
        </div>
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="notifyOnDeduction" checked>
            <label class="form-check-label" for="notifyOnDeduction">
                إرسال إشعار عند استقطاع الأقساط
            </label>
        </div>
    `;
    
    // إضافة الإعدادات إلى صفحة الموظفين إذا كانت موجودة
    const employeesPage = document.getElementById('employees');
    if (employeesPage) {
        const settingsTab = employeesPage.querySelector('.tabs');
        if (settingsTab) {
            const newTab = document.createElement('div');
            newTab.className = 'tab';
            newTab.textContent = 'إعدادات الأقساط';
            newTab.onclick = function() { switchEmployeeInstallmentTab('settings'); };
            settingsTab.appendChild(newTab);
        }
    }
}

// تبديل علامة تبويب إعدادات الأقساط
function switchEmployeeInstallmentTab(tabId) {
    if (tabId === 'settings') {
        // إظهار إعدادات الأقساط
        // يمكن إضافة المزيد من الإعدادات هنا
    }
}

// إضافة أنماط CSS مخصصة
function addEmployeeInstallmentStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .installment-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }
        
        .installment-badge .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
        }
        
        .installment-badge .installment-amount {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--warning-color);
        }
        
        .installment-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }
        
        .installment-section h4 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }
        
        .installment-section .table-container {
            margin-bottom: 10px;
        }
        
        .installment-section .table-sm {
            font-size: 0.85rem;
        }
        
        .installment-section .form-check {
            margin: 0;
        }
        
        .installment-section .form-check-input {
            margin-top: 0.25rem;
        }
        
        .badge-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .badge-info {
            background-color: #17a2b8;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // انتظار تحميل كلا النظامين
    const checkSystemsLoaded = setInterval(function() {
        if (typeof employees !== 'undefined' && 
            typeof installments !== 'undefined' && 
            typeof installmentPayments !== 'undefined' &&
            isInitialized && 
            typeof isInstallmentPageInitialized !== 'undefined') {
            
            clearInterval(checkSystemsLoaded);
            
            // تهيئة نظام الربط
            initEmployeeInstallmentIntegration();
            
            // إضافة الأنماط المخصصة
            addEmployeeInstallmentStyles();
            
            console.log('تم تحميل نظام ربط الموظفين بالأقساط بنجاح');
        }
    }, 100);
});

// تصدير الدوال للاستخدام الخارجي
window.employeeInstallmentIntegration = {
    getEmployeeActiveInstallments,
    calculateEmployeeTotalDueInstallments,
    processInstallmentDeductions
};
