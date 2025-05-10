// employee-installment-integration.js
// ملف الربط بين نظام الموظفين ونظام الأقساط

// المتغيرات العامة
let employeeInstallmentIntegrationInitialized = false;

// تهيئة نظام الربط
function initEmployeeInstallmentIntegration() {
    if (employeeInstallmentIntegrationInitialized) return;
    
    console.log('تهيئة نظام الربط بين الموظفين والأقساط...');
    
    // التحقق من وجود كلا النظامين
    if (typeof employees === 'undefined' || typeof installments === 'undefined') {
        console.warn('أحد النظامين أو كلاهما غير متوفر');
        return;
    }
    
    // تعديل شاشة دفع الراتب لإضافة معلومات الأقساط
    modifyPaySalaryModal();
    
    // إضافة مستمع لحساب الاستقطاعات التلقائية
    setupAutomaticDeductionListener();
    
    // تعديل دالة حفظ الراتب لتحديث الأقساط
    modifySaveSalaryFunction();
    
    // إضافة علامة تبويب الأقساط في ملف الموظف
    integrateInstallmentsInEmployeeProfile();
    
    console.log('تم تهيئة نظام الربط بنجاح');
    employeeInstallmentIntegrationInitialized = true;
}

// التحقق من الأقساط المستحقة على الموظف
function getEmployeeInstallments(employeeId) {
    if (!employeeId) return [];
    
    // البحث عن القروض المرتبطة بالموظف
    const employeeInstallments = installments.filter(inst => 
        inst.borrowerType === 'employee' && 
        inst.borrowerId === employeeId &&
        inst.status === 'active'
    );
    
    const activeInstallments = [];
    
    employeeInstallments.forEach(installment => {
        // البحث عن القسط المستحق للشهر الحالي
        const currentMonth = document.getElementById('salaryMonth')?.value || new Date().toISOString().slice(0, 7);
        
        const duePayments = installmentPayments.filter(payment => 
            payment.installmentId === installment.id &&
            payment.status !== 'paid' &&
            payment.dueDate.slice(0, 7) <= currentMonth
        );
        
        if (duePayments.length > 0) {
            activeInstallments.push({
                installment,
                payments: duePayments,
                totalDue: duePayments.reduce((sum, payment) => sum + payment.amount, 0)
            });
        }
    });
    
    return activeInstallments;
}

// تعديل شاشة دفع الراتب
function modifyPaySalaryModal() {
    // حفظ الدالة الأصلية
    const originalPaySalary = window.paySalary;
    
    // استبدال الدالة بنسخة معدلة
    window.paySalary = function(employeeId) {
        // استدعاء الدالة الأصلية
        originalPaySalary(employeeId);
        
        // تأخير قصير للتأكد من إنشاء النافذة
        setTimeout(() => {
            // إضافة قسم الأقساط
            addInstallmentsSectionToPaySalaryModal(employeeId);
        }, 100);
    };
}

// إضافة قسم الأقساط في نافذة دفع الراتب
function addInstallmentsSectionToPaySalaryModal(employeeId) {
    const modalBody = document.querySelector('#paySalaryModal .modal-body form');
    if (!modalBody) return;
    
    // التحقق من وجود قسم الأقساط مسبقاً
    if (document.getElementById('installmentsSection')) return;
    
    // الحصول على الأقساط المستحقة
    const employeeInstallments = getEmployeeInstallments(employeeId);
    
    // إنشاء قسم الأقساط
    const installmentsSection = document.createElement('div');
    installmentsSection.id = 'installmentsSection';
    installmentsSection.style.marginTop = '20px';
    installmentsSection.style.borderTop = '2px solid #dee2e6';
    installmentsSection.style.paddingTop = '20px';
    
    if (employeeInstallments.length === 0) {
        installmentsSection.innerHTML = `
            <div class="form-group">
                <h4 style="color: #3498db;">معلومات الأقساط</h4>
                <div class="alert alert-info" style="margin-top: 10px;">
                    <div class="alert-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-text">لا توجد أقساط مستحقة على هذا الموظف</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        let totalInstallments = 0;
        let installmentsHTML = employeeInstallments.map((item, index) => {
            totalInstallments += item.totalDue;
            
            return `
                <div class="installment-item" style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <div class="form-row">
                        <div class="form-group" style="flex: 2;">
                            <label class="form-label">رقم القرض: ${item.installment.id.slice(-6)}</label>
                            <div>عدد الأقساط المستحقة: ${item.payments.length}</div>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label">المبلغ المستحق</label>
                            <input type="text" class="form-control" value="${formatCurrency(item.totalDue)}" readonly>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label">المبلغ المستقطع</label>
                            <input type="number" class="form-control installment-deduction" 
                                id="installmentDeduction_${index}" 
                                value="${item.totalDue}" 
                                max="${item.totalDue}"
                                min="0"
                                data-installment-id="${item.installment.id}"
                                data-payment-ids="${item.payments.map(p => p.id).join(',')}"
                                oninput="updateInstallmentDeduction(${index})">
                        </div>
                    </div>
                    <div class="form-check" style="margin-top: 5px;">
                        <input type="checkbox" class="form-check-input" id="includeInstallment_${index}" checked
                            onchange="toggleInstallmentDeduction(${index})">
                        <label class="form-check-label" for="includeInstallment_${index}">
                            استقطاع هذا القسط
                        </label>
                    </div>
                </div>
            `;
        }).join('');
        
        installmentsSection.innerHTML = `
            <div class="form-group">
                <h4 style="color: #3498db;">
                    <i class="fas fa-receipt"></i> معلومات الأقساط
                    <span class="badge badge-warning" style="margin-left: 10px;">${employeeInstallments.length}</span>
                </h4>
                
                <div class="alert alert-warning" style="margin-top: 10px;">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-text">يوجد ${employeeInstallments.length} قرض مع أقساط مستحقة</div>
                    </div>
                </div>
                
                ${installmentsHTML}
                
                <div class="form-row" style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">إجمالي الأقساط المستحقة</label>
                        <input type="text" class="form-control" id="totalInstallmentsDue" 
                            value="${formatCurrency(totalInstallments)}" readonly>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">إجمالي الاستقطاعات</label>
                        <input type="text" class="form-control" id="totalInstallmentsDeduction" 
                            value="${formatCurrency(totalInstallments)}" readonly>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 10px;">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="autoDeductInstallments" checked>
                        <label class="form-check-label" for="autoDeductInstallments">
                            استقطاع الأقساط تلقائياً
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    // إدراج قسم الأقساط بعد الاستقطاعات
    const deductionsField = document.getElementById('salaryDeductions').closest('.form-row');
    if (deductionsField) {
        deductionsField.insertAdjacentElement('afterend', installmentsSection);
    } else {
        modalBody.appendChild(installmentsSection);
    }
    
    // تحديث الاستقطاعات الكلية
    updateTotalDeductions();
}

// تحديث استقطاع قسط معين
function updateInstallmentDeduction(index) {
    const deductionInput = document.getElementById(`installmentDeduction_${index}`);
    const includeCheckbox = document.getElementById(`includeInstallment_${index}`);
    
    if (deductionInput && includeCheckbox) {
        // التأكد من أن المبلغ لا يتجاوز الحد الأقصى
        const maxValue = parseFloat(deductionInput.getAttribute('max'));
        const currentValue = parseFloat(deductionInput.value);
        
        if (currentValue > maxValue) {
            deductionInput.value = maxValue;
        }
        
        // تحديث إجمالي الاستقطاعات
        updateTotalInstallmentDeductions();
    }
}

// تبديل استقطاع قسط معين
function toggleInstallmentDeduction(index) {
    const deductionInput = document.getElementById(`installmentDeduction_${index}`);
    const includeCheckbox = document.getElementById(`includeInstallment_${index}`);
    
    if (deductionInput && includeCheckbox) {
        deductionInput.disabled = !includeCheckbox.checked;
        
        if (!includeCheckbox.checked) {
            deductionInput.value = '0';
        } else {
            // استرجاع القيمة الأصلية
            const maxValue = parseFloat(deductionInput.getAttribute('max'));
            deductionInput.value = maxValue;
        }
        
        updateTotalInstallmentDeductions();
    }
}

// تحديث إجمالي استقطاعات الأقساط
function updateTotalInstallmentDeductions() {
    let totalDeductions = 0;
    
    document.querySelectorAll('.installment-deduction').forEach(input => {
        if (!input.disabled) {
            totalDeductions += parseFloat(input.value) || 0;
        }
    });
    
    const totalDeductionsInput = document.getElementById('totalInstallmentsDeduction');
    if (totalDeductionsInput) {
        totalDeductionsInput.value = formatCurrency(totalDeductions);
    }
    
    // تحديث الاستقطاعات الكلية في النموذج
    updateTotalDeductions();
}

// تحديث إجمالي الاستقطاعات (بما في ذلك الأقساط)
function updateTotalDeductions() {
    const originalDeductions = parseFloat(document.getElementById('salaryDeductions').value) || 0;
    let installmentDeductions = 0;
    
    // حساب استقطاعات الأقساط
    document.querySelectorAll('.installment-deduction').forEach(input => {
        if (!input.disabled) {
            installmentDeductions += parseFloat(input.value) || 0;
        }
    });
    
    // تحديث حقل الاستقطاعات ليشمل الأقساط
    const autoDeductCheckbox = document.getElementById('autoDeductInstallments');
    
    if (autoDeductCheckbox && autoDeductCheckbox.checked) {
        const totalDeductions = originalDeductions + installmentDeductions;
        document.getElementById('salaryDeductions').value = totalDeductions;
        
        // إطلاق حدث لإعادة حساب الراتب النهائي
        calculateTotalSalary();
    }
}

// إعداد مستمع الاستقطاع التلقائي
function setupAutomaticDeductionListener() {
    // تعديل دالة حساب الراتب الإجمالي
    const originalCalculateTotalSalary = window.calculateTotalSalary;
    
    window.calculateTotalSalary = function() {
        // استدعاء الدالة الأصلية
        originalCalculateTotalSalary();
        
        // تحديث الاستقطاعات لتشمل الأقساط
        updateTotalDeductions();
    };
}

// تعديل دالة حفظ الراتب لتحديث الأقساط
function modifySaveSalaryFunction() {
    // حفظ الدالة الأصلية
    const originalSaveSalary = window.saveSalary;
    
    // استبدال الدالة بنسخة معدلة
    window.saveSalary = function() {
        // الحصول على معرف الموظف
        const employeeId = document.getElementById('salaryEmployeeId').value;
        
        // جمع معلومات الأقساط المستقطعة
        const deductedInstallments = [];
        
        document.querySelectorAll('.installment-deduction').forEach((input, index) => {
            const includeCheckbox = document.getElementById(`includeInstallment_${index}`);
            
            if (includeCheckbox && includeCheckbox.checked && !input.disabled) {
                const deductedAmount = parseFloat(input.value) || 0;
                
                if (deductedAmount > 0) {
                    const installmentId = input.getAttribute('data-installment-id');
                    const paymentIds = input.getAttribute('data-payment-ids').split(',');
                    
                    deductedInstallments.push({
                        installmentId,
                        paymentIds,
                        deductedAmount
                    });
                }
            }
        });
        
        // استدعاء الدالة الأصلية أولاً
        originalSaveSalary();
        
        // تحديث حالة الأقساط المدفوعة
        if (deductedInstallments.length > 0) {
            updateInstallmentPayments(deductedInstallments, employeeId);
        }
    };
}

// تحديث حالة الأقساط المدفوعة
function updateInstallmentPayments(deductedInstallments, employeeId) {
    const paymentDate = new Date().toISOString().split('T')[0];
    const salaryMonth = document.getElementById('salaryMonth').value;
    
    deductedInstallments.forEach(item => {
        let remainingAmount = item.deductedAmount;
        
        // ترتيب الأقساط حسب تاريخ الاستحقاق
        const sortedPaymentIds = item.paymentIds.sort((a, b) => {
            const paymentA = installmentPayments.find(p => p.id === a);
            const paymentB = installmentPayments.find(p => p.id === b);
            return new Date(paymentA.dueDate) - new Date(paymentB.dueDate);
        });
        
        // تطبيق الدفع على الأقساط حسب الترتيب
        sortedPaymentIds.forEach(paymentId => {
            if (remainingAmount <= 0) return;
            
            const payment = installmentPayments.find(p => p.id === paymentId);
            if (!payment) return;
            
            if (remainingAmount >= payment.amount) {
                // دفع القسط بالكامل
                payment.status = 'paid';
                payment.paymentDate = paymentDate;
                payment.paymentMethod = 'salary_deduction';
                payment.notes = `استقطاع من راتب شهر ${formatMonth(salaryMonth)}`;
                
                remainingAmount -= payment.amount;
            } else {
                // دفع جزئي
                const originalAmount = payment.amount;
                payment.amount = originalAmount - remainingAmount;
                payment.status = 'partial';
                
                // إنشاء سجل للدفعة الجزئية
                const partialPayment = {
                    id: generateInstallmentId(),
                    installmentId: payment.installmentId,
                    number: payment.number,
                    dueDate: payment.dueDate,
                    amount: remainingAmount,
                    status: 'paid',
                    paymentDate: paymentDate,
                    paymentMethod: 'salary_deduction',
                    notes: `دفعة جزئية - استقطاع من راتب شهر ${formatMonth(salaryMonth)}`,
                    isPartial: true
                };
                
                installmentPayments.push(partialPayment);
                remainingAmount = 0;
            }
        });
        
        // التحقق من اكتمال القرض
        const installment = installments.find(inst => inst.id === item.installmentId);
        if (installment) {
            const remainingPayments = installmentPayments.filter(p => 
                p.installmentId === installment.id && 
                p.status !== 'paid' &&
                !p.isPartial
            );
            
            if (remainingPayments.length === 0) {
                installment.status = 'completed';
                
                createNotification(
                    'قرض مكتمل',
                    `تم استكمال دفع جميع أقساط القرض للموظف ${installment.borrowerName}`,
                    'success',
                    installment.id,
                    'installment'
                );
            }
        }
    });
    
    // حفظ بيانات الأقساط
    if (typeof saveInstallmentData === 'function') {
        saveInstallmentData();
    }
    
    // إنشاء إشعار
    createNotification(
        'استقطاع أقساط',
        `تم استقطاع ${deductedInstallments.length} قسط/أقساط من راتب الموظف`,
        'success'
    );
}

// دمج الأقساط في ملف الموظف
function integrateInstallmentsInEmployeeProfile() {
    // تعديل دالة عرض الموظف
    const originalViewEmployee = window.viewEmployee;
    
    window.viewEmployee = function(employeeId) {
        // استدعاء الدالة الأصلية
        originalViewEmployee(employeeId);
        
        // إضافة تبويب الأقساط بعد تحميل بيانات الموظف
        setTimeout(() => {
            addInstallmentsTabToEmployeeModal(employeeId);
        }, 200);
    };
}

// إضافة تبويب الأقساط في نافذة الموظف
function addInstallmentsTabToEmployeeModal(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const employeeModal = document.getElementById('viewEmployeeModal');
    if (!employeeModal) return;
    
    // البحث عن القروض المرتبطة بالموظف
    const employeeInstallments = installments.filter(inst => 
        inst.borrowerType === 'employee' && inst.borrowerId === employeeId
    );
    
    // إنشاء محتوى تبويب الأقساط
    const installmentsContent = document.createElement('div');
    installmentsContent.className = 'employee-installments-section';
    installmentsContent.style.marginTop = '20px';
    installmentsContent.style.borderTop = '2px solid #dee2e6';
    installmentsContent.style.paddingTop = '20px';
    
    if (employeeInstallments.length === 0) {
        installmentsContent.innerHTML = `
            <h3 style="color: #3498db;">معلومات الأقساط</h3>
            <div class="alert alert-info">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-text">لا توجد أقساط لهذا الموظف</div>
                </div>
            </div>
        `;
    } else {
        // جمع الإحصائيات
        let totalLoans = employeeInstallments.length;
        let activeLoans = employeeInstallments.filter(i => i.status === 'active').length;
        let totalAmount = employeeInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0);
        let totalPaid = 0;
        let totalRemaining = 0;
        
        employeeInstallments.forEach(inst => {
            const paid = getTotalPayments(inst.id);
            totalPaid += paid;
            totalRemaining += (inst.totalAmount - paid);
        });
        
        installmentsContent.innerHTML = `
            <h3 style="color: #3498db;">
                <i class="fas fa-receipt"></i> معلومات الأقساط
                <span class="badge badge-info" style="margin-left: 10px;">${totalLoans}</span>
            </h3>
            
            <div class="dashboard-cards" style="margin: 15px 0;">
                <div class="card" style="flex: 1; min-width: 200px;">
                    <div class="card-header">
                        <div>
                            <div class="card-title">القروض النشطة</div>
                            <div class="card-value">${activeLoans}</div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                </div>
                <div class="card" style="flex: 1; min-width: 200px;">
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي المبلغ</div>
                            <div class="card-value">${formatCurrency(totalAmount)}</div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                <div class="card" style="flex: 1; min-width: 200px;">
                    <div class="card-header">
                        <div>
                            <div class="card-title">المبلغ المتبقي</div>
                            <div class="card-value">${formatCurrency(totalRemaining)}</div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-container" style="margin-top: 15px;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>تاريخ البدء</th>
                            <th>المبلغ الإجمالي</th>
                            <th>المدة</th>
                            <th>المبلغ المتبقي</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeeInstallments.map((inst, index) => {
                            const paidAmount = getTotalPayments(inst.id);
                            const remainingAmount = inst.totalAmount - paidAmount;
                            
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${formatDate(inst.startDate)}</td>
                                    <td>${formatCurrency(inst.totalAmount)}</td>
                                    <td>${inst.durationMonths} شهر</td>
                                    <td>${formatCurrency(remainingAmount)}</td>
                                    <td>
                                        <span class="status ${
                                            inst.status === 'completed' ? 'success' : 
                                            inst.status === 'defaulted' ? 'danger' : 'active'
                                        }">
                                            ${
                                                inst.status === 'completed' ? 'مكتمل' : 
                                                inst.status === 'defaulted' ? 'متعثر' : 'نشط'
                                            }
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-info btn-icon action-btn" onclick="viewInstallment('${inst.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // إضافة المحتوى إلى النافذة
    const modalBody = employeeModal.querySelector('.employee-details');
    if (modalBody) {
        modalBody.appendChild(installmentsContent);
    }
}

// دالة مساعدة لتنسيق الشهر
function formatMonth(monthString) {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' });
}

// دالة مساعدة لإنشاء معرف فريد
function generateInstallmentId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// دالة مساعدة للحصول على إجمالي المدفوعات
function getTotalPayments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'paid')
        .reduce((total, payment) => total + payment.amount, 0);
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود كلا النظامين
    if (typeof employees !== 'undefined' && typeof installments !== 'undefined') {
        initEmployeeInstallmentIntegration();
    } else {
        console.log('في انتظار تحميل نظام الموظفين والأقساط...');
        
        // محاولة التهيئة بعد فترة قصيرة
        setTimeout(() => {
            if (typeof employees !== 'undefined' && typeof installments !== 'undefined') {
                initEmployeeInstallmentIntegration();
            }
        }, 2000);
    }
});

// تصدير الدوال لاستخدامها في أماكن أخرى
window.employeeInstallmentIntegration = {
    init: initEmployeeInstallmentIntegration,
    getEmployeeInstallments,
    updateInstallmentPayments
};

console.log('تم تحميل نظام الربط بين الموظفين والأقساط');