// إصلاح دالة حفظ القرض بالأقساط
function saveInstallment() {
    console.log('بدء حفظ القرض...'); // للتصحيح
    
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
    const modal = document.getElementById('addInstallmentModal');
    if (modal) {
        modal.remove();
    }
    
    // إعادة تحميل صفحة الأقساط
    if (document.getElementById('installments') && document.getElementById('installments').classList.contains('active')) {
        loadInstallmentsPage();
    }
    
    console.log('تم حفظ القرض بنجاح'); // للتصحيح
}

// إصلاح دالة إضافة تبويب الأقساط إلى نافذة المستثمر
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
        console.log('النقر على تبويب الأقساط'); // للتصحيح
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
                <button class="btn btn-primary" onclick="openAddInstallmentModal('${investorId}'); document.getElementById('viewInvestorModal').remove();">
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
                        <button class="btn btn-sm btn-primary" onclick="openAddInstallmentModal('${investorId}'); document.getElementById('viewInvestorModal').remove();">
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
                                        <button class="btn btn-info btn-icon action-btn" onclick="viewInstallment('${inst.id}'); document.getElementById('viewInvestorModal').remove();">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentFromInvestor('${inst.id}'); document.getElementById('viewInvestorModal').remove();">
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

// إصلاح دالة الحصول على صفوف جدول أقساط المستثمر
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
                    <button class="btn btn-success btn-icon action-btn" onclick="openPayInstallmentModal('${payment.id}'); document.getElementById('viewInvestorModal').remove();">
                        <i class="fas fa-money-bill"></i> دفع
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// إضافة دالة تصحيح لفتح نافذة إضافة القرض من النظام الرئيسي
window.openAddInstallmentModal = function(investorId = null) {
    console.log('فتح نافذة إضافة قرض جديد', investorId); // للتصحيح
    
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
                <button type="button" class="btn btn-primary" onclick="saveInstallment()">حفظ</button>
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
};

// إصلاح دالة تبديل علامة تبويب النافذة المنبثقة
window.switchModalTab = function(tabId, modalId) {
    console.log('تبديل علامة التبويب:', tabId, modalId); // للتصحيح
    
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // تحديث علامات التبويب
    modal.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // تفعيل التبويب المطلوب
    const activeTab = modal.querySelector(`[onclick="switchModalTab('${tabId}', '${modalId}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // تحديث محتوى علامات التبويب
    modal.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = modal.querySelector(`#${tabId}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
};

// تأكد من إضافة معالجات الأحداث في النطاق العالمي
window.saveInstallment = saveInstallment;
window.viewInstallment = viewInstallment;
window.editInstallment = editInstallment;
window.openPayInstallmentModal = openPayInstallmentModal;
window.openPayInstallmentFromInvestor = openPayInstallmentFromInvestor;
window.openDeleteInstallmentModal = openDeleteInstallmentModal;
window.confirmDeleteInstallment = confirmDeleteInstallment;
window.toggleBorrowerFields = toggleBorrowerFields;
window.calculateItemTotal = calculateItemTotal;
window.calculateInstallmentTotal = calculateInstallmentTotal;
window.addItemToList = addItemToList;
window.updateItemsTable = updateItemsTable;
window.removeItemFromList = removeItemFromList;
window.updateInstallment = updateInstallment;
window.confirmPayInstallment = confirmPayInstallment;
window.cancelInstallmentPayment = cancelInstallmentPayment;
window.viewInstallmentPayment = viewInstallmentPayment;
window.exportInstallments = exportInstallments;
window.printTable = printTable;
window.exportInstallmentsChart = exportInstallmentsChart;
window.switchInstallmentsTab = switchInstallmentsTab;
window.switchInstallmentsChartPeriod = switchInstallmentsChartPeriod;
window.searchInstallments = searchInstallments;
window.createBackup = createBackup;
window.saveInstallmentSettingsFromForm = saveInstallmentSettingsFromForm;
window.resetInstallmentSettings = resetInstallmentSettings;
window.restoreSelectedBackup = restoreSelectedBackup;
window.exportSelectedBackup = exportSelectedBackup;
window.deleteSelectedBackup = deleteSelectedBackup;
window.exportAllInstallmentData = exportAllInstallmentData;
window.openImportDataModal = openImportDataModal;
window.importInstallmentData = importInstallmentData;
window.printInstallmentDetails = printInstallmentDetails;

// إضافة معالج أحداث للأزرار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة معالجات أحداث الأقساط'); // للتصحيح
    
    // تأكد من إضافة المستمعين للأزرار
    const addButton = document.querySelector('[onclick="openAddInstallmentModal()"]');
    if (addButton) {
        console.log('تم العثور على زر إضافة القرض'); // للتصحيح
    }
});