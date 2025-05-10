/**
 * نظام إدارة الأقساط
 * 
 * هذا الملف يحتوي على وظائف إدارة الأقساط للتكامل مع نظام إدارة الاستثمار
 */

// المتغيرات العالمية لنظام الأقساط
let installments = [];
let installmentItems = [];
let installmentPayments = [];
let borrowerCategories = [
    { id: 'investor', name: 'مستثمر' },
    { id: 'public', name: 'حشد شعبي' },
    { id: 'welfare', name: 'رعاية اجتماعية' },
    { id: 'employee', name: 'موظف' },
    { id: 'military', name: 'عسكري' },
    { id: 'business', name: 'كاسب' },
    { id: 'other', name: 'أخرى' }
];

let currentInstallmentId = null;
let currentInstallmentItemId = null;
let currentInstallmentPaymentId = null;

// ============ بنية البيانات ============

/**
 * هيكل بيانات القرض بالأقساط:
 * {
 *   id: string,
 *   borrowerType: string, // نوع المقترض: 'investor', 'public', 'welfare', etc.
 *   borrowerId: string, // معرف المستثمر (إذا كان مستثمر)
 *   borrowerName: string, // اسم المقترض (إذا لم يكن مستثمر)
 *   borrowerPhone: string, // رقم هاتف المقترض (إذا لم يكن مستثمر)
 *   borrowerAddress: string, // عنوان المقترض (إذا لم يكن مستثمر)
 *   borrowerIdCard: string, // رقم البطاقة الشخصية للمقترض (إذا لم يكن مستثمر)
 *   totalAmount: number, // المبلغ الإجمالي مع الفائدة
 *   interestRate: number, // معدل الفائدة السنوية
 *   startDate: string, // تاريخ بدء القرض
 *   durationMonths: number, // مدة القرض بالأشهر
 *   status: string, // حالة القرض: 'active', 'completed', 'defaulted'
 *   notes: string, // ملاحظات
 *   createdAt: string, // تاريخ الإنشاء
 *   updatedAt: string // تاريخ التحديث
 * }
 */

/**
 * هيكل بيانات عنصر القرض:
 * {
 *   id: string,
 *   installmentId: string, // معرف القرض بالأقساط
 *   name: string, // اسم العنصر
 *   price: number, // سعر العنصر الأصلي
 *   quantity: number, // الكمية
 *   totalPrice: number, // السعر الإجمالي (السعر * الكمية)
 *   createdAt: string // تاريخ الإنشاء
 * }
 */

/**
 * هيكل بيانات جدول الأقساط:
 * {
 *   id: string,
 *   installmentId: string, // معرف القرض بالأقساط
 *   number: number, // رقم القسط
 *   dueDate: string, // تاريخ استحقاق القسط
 *   amount: number, // مبلغ القسط
 *   status: string, // حالة القسط: 'pending', 'paid', 'late'
 *   paymentDate: string, // تاريخ الدفع (إذا تم الدفع)
 *   notes: string // ملاحظات
 * }
 */

// ============ وظائف المساعدة ============

/**
 * إنشاء معرف فريد
 */
function generateInstallmentId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * تنسيق المبلغ مع الفواصل
 */
function formatInstallmentAmount(amount) {
    if (isNaN(amount)) return "0";
    return parseFloat(amount).toLocaleString('ar-IQ');
}

/**
 * حساب المبلغ الإجمالي مع الفائدة
 * 
 * @param {number} principal - المبلغ الأصلي
 * @param {number} rate - معدل الفائدة السنوية (بالنسبة المئوية)
 * @param {number} durationMonths - مدة القرض بالأشهر
 * @returns {number} المبلغ الإجمالي مع الفائدة
 */
function calculateTotalWithInterest(principal, rate, durationMonths) {
    const yearlyRate = rate / 100;
    const monthlyRate = yearlyRate / 12;
    const totalInterest = principal * yearlyRate * (durationMonths / 12);
    return principal + totalInterest;
}

/**
 * حساب قيمة القسط الشهري
 * 
 * @param {number} principal - المبلغ الأصلي
 * @param {number} rate - معدل الفائدة السنوية (بالنسبة المئوية)
 * @param {number} durationMonths - مدة القرض بالأشهر
 * @returns {number} قيمة القسط الشهري
 */
function calculateMonthlyInstallment(principal, rate, durationMonths) {
    const totalAmount = calculateTotalWithInterest(principal, rate, durationMonths);
    return totalAmount / durationMonths;
}

/**
 * إنشاء جدول الأقساط
 * 
 * @param {string} installmentId - معرف القرض بالأقساط
 * @param {number} totalAmount - المبلغ الإجمالي مع الفائدة
 * @param {number} durationMonths - مدة القرض بالأشهر
 * @param {string} startDate - تاريخ بدء القرض
 * @returns {Array} مصفوفة من كائنات جدول الأقساط
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
 * التحقق من تاريخ الاستحقاق وتحديث الحالة
 */
function checkDueDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    installmentPayments.forEach(payment => {
        if (payment.status === 'pending') {
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                payment.status = 'late';
                
                // إنشاء إشعار للقسط المتأخر
                const installment = installments.find(inst => inst.id === payment.installmentId);
                if (installment) {
                    const borrowerName = getBorrowerName(installment);
                    createNotification(
                        'قسط متأخر',
                        `القسط رقم ${payment.number} للمقترض ${borrowerName} متأخر عن موعد استحقاقه (${payment.dueDate})`,
                        'warning',
                        payment.id,
                        'installmentPayment'
                    );
                }
            }
        }
    });
    
    // حفظ التغييرات
    saveInstallmentData();
}

/**
 * الحصول على اسم المقترض
 */
function getBorrowerName(installment) {
    if (installment.borrowerType === 'investor') {
        const investor = investors.find(inv => inv.id === installment.borrowerId);
        return investor ? investor.name : 'مستثمر غير معروف';
    } else {
        return installment.borrowerName || 'مقترض غير معروف';
    }
}

/**
 * الحصول على نوع المقترض كنص
 */
function getBorrowerTypeName(borrowerType) {
    const category = borrowerCategories.find(cat => cat.id === borrowerType);
    return category ? category.name : borrowerType;
}

/**
 * الحصول على مجموع الأسعار لعناصر قرض محدد
 */
function getTotalItemsPrice(installmentId) {
    return installmentItems
        .filter(item => item.installmentId === installmentId)
        .reduce((total, item) => total + (item.totalPrice || 0), 0);
}

/**
 * الحصول على إجمالي المدفوعات لقرض محدد
 */
function getTotalPayments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'paid')
        .reduce((total, payment) => total + payment.amount, 0);
}

/**
 * الحصول على عدد الأقساط المتبقية لقرض محدد
 */
function getRemainingInstallments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'pending')
        .length;
}

/**
 * الحصول على عدد الأقساط المتأخرة لقرض محدد
 */
function getLateInstallments(installmentId) {
    return installmentPayments
        .filter(payment => payment.installmentId === installmentId && payment.status === 'late')
        .length;
}

// ============ وظائف عمليات الأقساط ============

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
        
        // التحقق من تواريخ الاستحقاق وتحديث الحالات
        checkDueDates();
        
    } catch (error) {
        console.error('Error loading installment data:', error);
        createNotification('خطأ', 'حدث خطأ أثناء تحميل بيانات الأقساط', 'danger');
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
        if (syncActive) {
            syncInstallmentData();
        }
    } catch (error) {
        console.error('Error saving installment data:', error);
        createNotification('خطأ', 'حدث خطأ أثناء حفظ بيانات الأقساط', 'danger');
    }
}

/**
 * مزامنة بيانات الأقساط مع Firebase
 */
function syncInstallmentData() {
    if (window.firebaseApp && window.firebaseApp.currentUser) {
        const db = firebase.database();
        const userId = window.firebaseApp.currentUser.uid;
        
        db.ref('users/' + userId + '/installments').set(installments)
            .catch(error => console.error('Error syncing installments:', error));
        
        db.ref('users/' + userId + '/installmentItems').set(installmentItems)
            .catch(error => console.error('Error syncing installment items:', error));
        
        db.ref('users/' + userId + '/installmentPayments').set(installmentPayments)
            .catch(error => console.error('Error syncing installment payments:', error));
    }
}

/**
 * إضافة قرض جديد بالأقساط
 */
function addInstallment(installmentData, items = []) {
    // إنشاء معرف فريد للقرض
    const installmentId = generateInstallmentId();
    
    // حساب المبلغ الإجمالي للعناصر
    const totalItemsPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(
        totalItemsPrice,
        installmentData.interestRate,
        installmentData.durationMonths
    );
    
    // إنشاء كائن القرض
    const newInstallment = {
        id: installmentId,
        borrowerType: installmentData.borrowerType,
        borrowerId: installmentData.borrowerId,
        borrowerName: installmentData.borrowerName || '',
        borrowerPhone: installmentData.borrowerPhone || '',
        borrowerAddress: installmentData.borrowerAddress || '',
        borrowerIdCard: installmentData.borrowerIdCard || '',
        totalAmount: totalWithInterest,
        interestRate: installmentData.interestRate,
        startDate: installmentData.startDate,
        durationMonths: installmentData.durationMonths,
        status: 'active',
        notes: installmentData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // إضافة القرض إلى المصفوفة
    installments.push(newInstallment);
    
    // إضافة العناصر
    items.forEach(item => {
        const newItem = {
            id: generateInstallmentId(),
            installmentId: installmentId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            createdAt: new Date().toISOString()
        };
        
        installmentItems.push(newItem);
    });
    
    // إنشاء جدول الأقساط
    const schedule = generateInstallmentSchedule(
        installmentId,
        totalWithInterest,
        installmentData.durationMonths,
        installmentData.startDate
    );
    
    // إضافة جدول الأقساط إلى المصفوفة
    installmentPayments = [...installmentPayments, ...schedule];
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity('installment', 'create', `تم إنشاء قرض بالأقساط جديد للمقترض ${getBorrowerName(newInstallment)}`);
    
    // إنشاء إشعار
    createNotification(
        'قرض جديد بالأقساط',
        `تم إنشاء قرض بالأقساط جديد للمقترض ${getBorrowerName(newInstallment)}`,
        'success',
        installmentId,
        'installment'
    );
    
    return installmentId;
}

/**
 * تحديث قرض بالأقساط
 */
function updateInstallment(installmentId, updateData) {
    // البحث عن القرض
    const index = installments.findIndex(inst => inst.id === installmentId);
    
    if (index === -1) {
        console.error('Installment not found:', installmentId);
        return false;
    }
    
    // تحديث بيانات القرض
    installments[index] = {
        ...installments[index],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity('installment', 'update', `تم تحديث بيانات القرض بالأقساط للمقترض ${getBorrowerName(installments[index])}`);
    
    return true;
}

/**
 * حذف قرض بالأقساط
 */
function deleteInstallment(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        console.error('Installment not found:', installmentId);
        return false;
    }
    
    // التحقق من حالة القرض
    if (installment.status === 'active' && getRemainingInstallments(installmentId) > 0) {
        const confirmation = confirm('هذا القرض نشط ويحتوي على أقساط غير مدفوعة. هل أنت متأكد من الحذف؟');
        if (!confirmation) {
            return false;
        }
    }
    
    // حذف القرض من المصفوفة
    installments = installments.filter(inst => inst.id !== installmentId);
    
    // حذف عناصر القرض
    installmentItems = installmentItems.filter(item => item.installmentId !== installmentId);
    
    // حذف جدول الأقساط
    installmentPayments = installmentPayments.filter(payment => payment.installmentId !== installmentId);
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity('installment', 'delete', `تم حذف القرض بالأقساط للمقترض ${getBorrowerName(installment)}`);
    
    // إنشاء إشعار
    createNotification(
        'حذف قرض بالأقساط',
        `تم حذف القرض بالأقساط للمقترض ${getBorrowerName(installment)}`,
        'info',
        null,
        null
    );
    
    return true;
}

/**
 * تسجيل دفع قسط
 */
function recordInstallmentPayment(paymentId, paymentData) {
    // البحث عن القسط
    const index = installmentPayments.findIndex(payment => payment.id === paymentId);
    
    if (index === -1) {
        console.error('Installment payment not found:', paymentId);
        return false;
    }
    
    // تحديث بيانات القسط
    installmentPayments[index] = {
        ...installmentPayments[index],
        status: 'paid',
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        notes: paymentData.notes || installmentPayments[index].notes
    };
    
    // الحصول على القرض
    const installmentId = installmentPayments[index].installmentId;
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        console.error('Parent installment not found:', installmentId);
        return false;
    }
    
    // التحقق مما إذا كانت جميع الأقساط مدفوعة
    const remainingPayments = installmentPayments.filter(
        payment => payment.installmentId === installmentId && payment.status !== 'paid'
    );
    
    if (remainingPayments.length === 0) {
        // تحديث حالة القرض إلى "مكتمل"
        const instIndex = installments.findIndex(inst => inst.id === installmentId);
        if (instIndex !== -1) {
            installments[instIndex].status = 'completed';
            installments[instIndex].updatedAt = new Date().toISOString();
            
            // إنشاء إشعار لاكتمال القرض
            createNotification(
                'اكتمال قرض بالأقساط',
                `تم سداد جميع أقساط القرض للمقترض ${getBorrowerName(installment)}`,
                'success',
                installmentId,
                'installment'
            );
        }
    }
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity(
        'installment',
        'payment',
        `تم تسجيل دفع القسط رقم ${installmentPayments[index].number} للمقترض ${getBorrowerName(installment)}`
    );
    
    // إنشاء إشعار
    createNotification(
        'دفع قسط',
        `تم تسجيل دفع القسط رقم ${installmentPayments[index].number} للمقترض ${getBorrowerName(installment)}`,
        'success',
        paymentId,
        'installmentPayment'
    );
    
    return true;
}

/**
 * إلغاء دفع قسط
 */
function cancelInstallmentPayment(paymentId) {
    // البحث عن القسط
    const index = installmentPayments.findIndex(payment => payment.id === paymentId);
    
    if (index === -1) {
        console.error('Installment payment not found:', paymentId);
        return false;
    }
    
    // التأكد من أن القسط مدفوع
    if (installmentPayments[index].status !== 'paid') {
        console.error('Cannot cancel a payment that is not paid');
        return false;
    }
    
    // الحصول على القرض
    const installmentId = installmentPayments[index].installmentId;
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        console.error('Parent installment not found:', installmentId);
        return false;
    }
    
    // إعادة القسط إلى حالة "معلق"
    const originalStatus = 'pending';
    const today = new Date();
    const dueDate = new Date(installmentPayments[index].dueDate);
    
    // إذا كان تاريخ الاستحقاق قبل اليوم، فقم بتعيين الحالة إلى "متأخر"
    if (dueDate < today) {
        originalStatus = 'late';
    }
    
    // تحديث بيانات القسط
    installmentPayments[index] = {
        ...installmentPayments[index],
        status: originalStatus,
        paymentDate: null,
        notes: `تم إلغاء الدفع في ${new Date().toISOString().split('T')[0]}`
    };
    
    // إذا كان القرض مكتمل، قم بتغيير حالته مرة أخرى إلى "نشط"
    if (installment.status === 'completed') {
        const instIndex = installments.findIndex(inst => inst.id === installmentId);
        if (instIndex !== -1) {
            installments[instIndex].status = 'active';
            installments[instIndex].updatedAt = new Date().toISOString();
        }
    }
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity(
        'installment',
        'payment_cancel',
        `تم إلغاء دفع القسط رقم ${installmentPayments[index].number} للمقترض ${getBorrowerName(installment)}`
    );
    
    // إنشاء إشعار
    createNotification(
        'إلغاء دفع قسط',
        `تم إلغاء دفع القسط رقم ${installmentPayments[index].number} للمقترض ${getBorrowerName(installment)}`,
        'warning',
        paymentId,
        'installmentPayment'
    );
    
    return true;
}

/**
 * إضافة عنصر جديد إلى قرض بالأقساط
 */
function addInstallmentItem(installmentId, itemData) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        console.error('Installment not found:', installmentId);
        return false;
    }
    
    // إنشاء كائن العنصر
    const newItem = {
        id: generateInstallmentId(),
        installmentId,
        name: itemData.name,
        price: itemData.price,
        quantity: itemData.quantity || 1,
        totalPrice: itemData.price * (itemData.quantity || 1),
        createdAt: new Date().toISOString()
    };
    
    // إضافة العنصر إلى المصفوفة
    installmentItems.push(newItem);
    
    // إعادة حساب المبلغ الإجمالي للقرض
    recalculateInstallmentTotal(installmentId);
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity(
        'installment',
        'add_item',
        `تم إضافة عنصر جديد (${itemData.name}) إلى القرض للمقترض ${getBorrowerName(installment)}`
    );
    
    return newItem.id;
}

/**
 * حذف عنصر من قرض بالأقساط
 */
function deleteInstallmentItem(itemId) {
    // البحث عن العنصر
    const item = installmentItems.find(it => it.id === itemId);
    
    if (!item) {
        console.error('Installment item not found:', itemId);
        return false;
    }
    
    // الحصول على القرض
    const installmentId = item.installmentId;
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        console.error('Parent installment not found:', installmentId);
        return false;
    }
    
    // حذف العنصر من المصفوفة
    installmentItems = installmentItems.filter(it => it.id !== itemId);
    
    // إعادة حساب المبلغ الإجمالي للقرض
    recalculateInstallmentTotal(installmentId);
    
    // حفظ البيانات
    saveInstallmentData();
    
    // إنشاء نشاط
    createActivity(
        'installment',
        'delete_item',
        `تم حذف عنصر (${item.name}) من القرض للمقترض ${getBorrowerName(installment)}`
    );
    
    return true;
}

/**
 * إعادة حساب المبلغ الإجمالي للقرض
 */
function recalculateInstallmentTotal(installmentId) {
    // البحث عن القرض
    const index = installments.findIndex(inst => inst.id === installmentId);
    
    if (index === -1) {
        console.error('Installment not found:', installmentId);
        return false;
    }
    
    // حساب المبلغ الإجمالي للعناصر
    const totalItemsPrice = getTotalItemsPrice(installmentId);
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(
        totalItemsPrice,
        installments[index].interestRate,
        installments[index].durationMonths
    );
    
    // تحديث المبلغ الإجمالي للقرض
    installments[index].totalAmount = totalWithInterest;
    installments[index].updatedAt = new Date().toISOString();
    
    // إعادة حساب قيم الأقساط
    const monthlyPayment = totalWithInterest / installments[index].durationMonths;
    
    // تحديث قيم الأقساط
    installmentPayments.forEach(payment => {
        if (payment.installmentId === installmentId && payment.status === 'pending') {
            payment.amount = monthlyPayment;
        }
    });
    
    return true;
}

/**
 * جلب الأقساط المستحقة قريباً
 */
function getUpcomingInstallmentPayments(days = 7) {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return installmentPayments.filter(payment => {
        if (payment.status !== 'pending') return false;
        
        const dueDate = new Date(payment.dueDate);
        return dueDate >= today && dueDate <= futureDate;
    });
}

/**
 * جلب الأقساط المتأخرة
 */
function getLateInstallmentPayments() {
    return installmentPayments.filter(payment => payment.status === 'late');
}

/**
 * جلب ملخص الأقساط
 */
function getInstallmentsSummary() {
    const activeInstallments = installments.filter(inst => inst.status === 'active').length;
    const completedInstallments = installments.filter(inst => inst.status === 'completed').length;
    const defaultedInstallments = installments.filter(inst => inst.status === 'defaulted').length;
    
    const totalAmount = installments.reduce((total, inst) => total + inst.totalAmount, 0);
    const totalPaid = installmentPayments
        .filter(payment => payment.status === 'paid')
        .reduce((total, payment) => total + payment.amount, 0);
    
    const pendingPayments = installmentPayments.filter(payment => payment.status === 'pending').length;
    const latePayments = installmentPayments.filter(payment => payment.status === 'late').length;
    
    return {
        activeInstallments,
        completedInstallments,
        defaultedInstallments,
        totalInstallments: installments.length,
        totalAmount,
        totalPaid,
        totalRemaining: totalAmount - totalPaid,
        pendingPayments,
        latePayments
    };
}

// ============ وظائف واجهة المستخدم ============

/**
 * تحميل صفحة الأقساط
 */
function loadInstallmentsPage() {
    // التأكد من تحميل البيانات
    loadInstallmentData();
    
    // تحديث البطاقات الرئيسية
    updateInstallmentsDashboardCards();
    
    // تحميل جدول الأقساط
    loadInstallmentsTable();
    
    // تحميل الأقساط المستحقة قريباً والمتأخرة
    loadUpcomingPayments();
    loadLatePayments();
    
    // تحميل الرسم البياني
    loadInstallmentsChart();
}

/**
 * تحديث بطاقات لوحة تحكم الأقساط
 */
function updateInstallmentsDashboardCards() {
    const summary = getInstallmentsSummary();
    
    // تحديث البطاقات
    document.getElementById('totalActiveInstallments').textContent = summary.activeInstallments;
    document.getElementById('totalCompletedInstallments').textContent = summary.completedInstallments;
    document.getElementById('totalInstallmentAmount').textContent = formatInstallmentAmount(summary.totalAmount) + ' ' + settings.currency;
    document.getElementById('totalPaidInstallments').textContent = formatInstallmentAmount(summary.totalPaid) + ' ' + settings.currency;
    document.getElementById('totalRemainingInstallments').textContent = formatInstallmentAmount(summary.totalRemaining) + ' ' + settings.currency;
    document.getElementById('totalLatePayments').textContent = summary.latePayments;
    document.getElementById('totalPendingPayments').textContent = summary.pendingPayments;
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
        row.innerHTML = `<td colspan="9" style="text-align: center;">لا توجد أقساط ${
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
            <td>${formatInstallmentAmount(installment.totalAmount)} ${settings.currency}</td>
            <td>${formatInstallmentAmount(totalPaid)} ${settings.currency}</td>
            <td>${formatInstallmentAmount(remaining)} ${settings.currency}</td>
            <td>${remainingInstallments} / ${installment.durationMonths}</td>
            <td>
                <span class="status ${
                    installment.status === 'active' ? 'active' : 
                    installment.status === 'completed' ? 'success' : 'danger'
                }">
                    ${
                        installment.status === 'active' ? 'نشط' : 
                        installment.status === 'completed' ? 'مكتمل' : 'متعثر'
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
 * تحميل الأقساط المستحقة قريباً
 */
function loadUpcomingPayments() {
    const tbody = document.getElementById('upcomingPaymentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // الحصول على الأقساط المستحقة قريباً
    const upcomingPayments = getUpcomingInstallmentPayments(7);
    
    if (upcomingPayments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center;">لا توجد أقساط مستحقة قريباً</td>`;
        tbody.appendChild(row);
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    upcomingPayments.forEach((payment) => {
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return;
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${getBorrowerName(installment)}</td>
            <td>${payment.number} / ${installment.durationMonths}</td>
            <td>${payment.dueDate}</td>
            <td>${formatInstallmentAmount(payment.amount)} ${settings.currency}</td>
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
    const latePayments = getLateInstallmentPayments();
    
    if (latePayments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center;">لا توجد أقساط متأخرة</td>`;
        tbody.appendChild(row);
        return;
    }
    
    // ترتيب الأقساط حسب تاريخ الاستحقاق
    latePayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    latePayments.forEach((payment) => {
        const installment = installments.find(inst => inst.id === payment.installmentId);
        if (!installment) return;
        
        const dueDate = new Date(payment.dueDate);
        const today = new Date();
        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${getBorrowerName(installment)}</td>
            <td>${payment.number} / ${installment.durationMonths}</td>
            <td>${payment.dueDate}</td>
            <td>${daysDiff} يوم</td>
            <td>${formatInstallmentAmount(payment.amount)} ${settings.currency}</td>
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
function loadInstallmentsChart() {
    const chartContainer = document.getElementById('installmentsChart');
    if (!chartContainer) return;
    
    // إعداد بيانات الرسم البياني
    const data = [];
    const today = new Date();
    
    // إعداد بيانات للأشهر الستة الماضية
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today);
        month.setMonth(month.getMonth() - i);
        
        const monthName = month.toLocaleDateString('ar', { month: 'long' });
        const monthYear = month.getFullYear();
        const monthStart = new Date(monthYear, month.getMonth(), 1);
        const monthEnd = new Date(monthYear, month.getMonth() + 1, 0);
        
        // حساب المبالغ المدفوعة في هذا الشهر
        const paidAmount = installmentPayments
            .filter(payment => {
                if (payment.status !== 'paid' || !payment.paymentDate) return false;
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate >= monthStart && paymentDate <= monthEnd;
            })
            .reduce((total, payment) => total + payment.amount, 0);
        
        // حساب المبالغ المستحقة في هذا الشهر
        const dueAmount = installmentPayments
            .filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return dueDate >= monthStart && dueDate <= monthEnd;
            })
            .reduce((total, payment) => total + payment.amount, 0);
        
        data.push({
            month: monthName,
            paid: paidAmount,
            due: dueAmount
        });
    }
    
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
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: 'المبالغ المدفوعة',
                    data: data.map(d => d.paid),
                    backgroundColor: 'rgba(46, 204, 113, 0.6)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                },
                {
                    label: 'المبالغ المستحقة',
                    data: data.map(d => d.due),
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
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
                            return formatInstallmentAmount(value) + ' ' + settings.currency;
                        }
                    }
                }
            }
        }
    });
}

/**
 * فتح النافذة المنبثقة لإضافة قرض جديد بالأقساط
 */
function openAddInstallmentModal() {
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
                                <option value="investor">مستثمر</option>
                                <option value="public">حشد شعبي</option>
                                <option value="welfare">رعاية اجتماعية</option>
                                <option value="employee">موظف</option>
                                <option value="military">عسكري</option>
                                <option value="business">كاسب</option>
                                <option value="other">أخرى</option>
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
                                <input type="number" class="form-control" id="durationMonths" value="12" min="1" required oninput="calculateInstallmentTotal()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة السنوية (%)</label>
                                <input type="number" class="form-control" id="interestRate" value="4" min="0" step="0.1" required oninput="calculateInstallmentTotal()">
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
    
    // تعيين التاريخ الافتراضي لتاريخ البدء
    document.getElementById('startDate').valueAsDate = new Date();
    
    // ملء قائمة المستثمرين
    populateInvestorsList();
    
    // إضافة المستمعين للأحداث
    document.getElementById('itemPrice').addEventListener('input', calculateItemTotal);
    document.getElementById('itemQuantity').addEventListener('input', calculateItemTotal);
    document.getElementById('interestRate').addEventListener('input', calculateInstallmentTotal);
    document.getElementById('durationMonths').addEventListener('input', calculateInstallmentTotal);
    
    // تهيئة قائمة العناصر
    window.installmentItemsList = [];
    
    // حساب المجموع الأولي
    calculateItemTotal();
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
    
    // تنظيف القائمة
    select.innerHTML = '<option value="">اختر المستثمر</option>';
    
    // ترتيب المستثمرين حسب الاسم
    const sortedInvestors = [...investors].sort((a, b) => a.name.localeCompare(b.name));
    
    // إضافة الخيارات
    sortedInvestors.forEach(investor => {
        const option = document.createElement('option');
        option.value = investor.id;
        option.textContent = investor.name;
        select.appendChild(option);
    });
}

/**
 * حساب إجمالي العنصر
 */
function calculateItemTotal() {
    const price = parseFloat(document.getElementById('itemPrice').value) || 0;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    const totalPrice = price * quantity;
    
    document.getElementById('itemTotalPrice').value = formatInstallmentAmount(totalPrice) + ' ' + settings.currency;
}

/**
 * إضافة عنصر إلى القائمة
 */
function addItemToList() {
    const itemName = document.getElementById('itemName').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value) || 1;
    
    if (!itemName || !itemPrice) {
        alert('يرجى ملء جميع حقول العنصر');
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
    
    window.installmentItemsList.push(item);
    
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
    
    if (window.installmentItemsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">لم تتم إضافة عناصر بعد</td></tr>`;
        document.getElementById('itemsTotalSum').textContent = '0';
        return;
    }
    
    tbody.innerHTML = '';
    
    let totalSum = 0;
    
    window.installmentItemsList.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${formatInstallmentAmount(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatInstallmentAmount(item.totalPrice)}</td>
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
    document.getElementById('itemsTotalSum').textContent = formatInstallmentAmount(totalSum) + ' ' + settings.currency;
}

/**
 * إزالة عنصر من القائمة
 */
function removeItemFromList(itemId) {
    window.installmentItemsList = window.installmentItemsList.filter(item => item.id !== itemId);
    
    // تحديث الجدول
    updateItemsTable();
    
    // إعادة حساب إجمالي المبلغ
    calculateInstallmentTotal();
}

/**
 * حساب إجمالي القرض بالأقساط
 */
function calculateInstallmentTotal() {
    // حساب إجمالي العناصر
    const totalItemsPrice = window.installmentItemsList.reduce((total, item) => total + item.totalPrice, 0);
    
    // الحصول على معدل الفائدة ومدة القرض
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 4;
    const durationMonths = parseInt(document.getElementById('durationMonths').value) || 12;
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(totalItemsPrice, interestRate, durationMonths);
    
    // حساب قيمة القسط الشهري
    const monthlyInstallment = totalWithInterest / durationMonths;
    
    // تحديث الحقول
    document.getElementById('totalItemsAmount').value = formatInstallmentAmount(totalItemsPrice) + ' ' + settings.currency;
    document.getElementById('totalWithInterest').value = formatInstallmentAmount(totalWithInterest) + ' ' + settings.currency;
    document.getElementById('monthlyInstallment').value = formatInstallmentAmount(monthlyInstallment) + ' ' + settings.currency;
}

/**
 * حفظ القرض بالأقساط
 */
function saveInstallment() {
    // التحقق من وجود عناصر
    if (window.installmentItemsList.length === 0) {
        alert('يرجى إضافة عنصر واحد على الأقل');
        switchModalTab('itemsInfo', 'addInstallmentModal');
        return;
    }
    
    // جمع البيانات من النموذج
    const borrowerType = document.getElementById('borrowerType').value;
    let borrowerId = '';
    let borrowerName = '';
    let borrowerPhone = '';
    let borrowerAddress = '';
    let borrowerIdCard = '';
    
    if (borrowerType === 'investor') {
        borrowerId = document.getElementById('borrowerId').value;
        
        if (!borrowerId) {
            alert('يرجى اختيار المستثمر');
            switchModalTab('borrowerInfo', 'addInstallmentModal');
            return;
        }
        
        // الحصول على بيانات المستثمر
        const investor = investors.find(inv => inv.id === borrowerId);
        if (investor) {
            borrowerName = investor.name;
            borrowerPhone = investor.phone;
            borrowerAddress = investor.address;
            borrowerIdCard = investor.idCard;
        }
    } else {
        borrowerName = document.getElementById('borrowerName').value;
        borrowerPhone = document.getElementById('borrowerPhone').value;
        borrowerAddress = document.getElementById('borrowerAddress').value;
        borrowerIdCard = document.getElementById('borrowerIdCard').value;
        
        if (!borrowerName || !borrowerPhone || !borrowerAddress || !borrowerIdCard) {
            alert('يرجى ملء جميع حقول المقترض');
            switchModalTab('borrowerInfo', 'addInstallmentModal');
            return;
        }
    }
    
    // جمع بيانات القرض
    const startDate = document.getElementById('startDate').value;
    const durationMonths = parseInt(document.getElementById('durationMonths').value) || 12;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 4;
    const notes = document.getElementById('installmentNotes').value;
    
    if (!startDate) {
        alert('يرجى تحديد تاريخ البدء');
        switchModalTab('installmentInfo', 'addInstallmentModal');
        return;
    }
    
    // إنشاء كائن بيانات القرض
    const installmentData = {
        borrowerType,
        borrowerId,
        borrowerName,
        borrowerPhone,
        borrowerAddress,
        borrowerIdCard,
        interestRate,
        startDate,
        durationMonths,
        notes
    };
    
    // إضافة القرض الجديد
    const installmentId = addInstallment(installmentData, window.installmentItemsList);
    
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
        alert('القرض غير موجود');
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
                                    <div class="card-value">${formatInstallmentAmount(installment.totalAmount)} ${settings.currency}</div>
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
                                    <div class="card-value">${formatInstallmentAmount(totalPaid)} ${settings.currency}</div>
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
                                    <div class="card-value">${formatInstallmentAmount(remaining)} ${settings.currency}</div>
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
                                <input type="text" class="form-control" value="${installment.startDate}" readonly>
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
                                        <td>${formatInstallmentAmount(item.price)} ${settings.currency}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatInstallmentAmount(item.totalPrice)} ${settings.currency}</td>
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
                                    <th>${formatInstallmentAmount(items.reduce((total, item) => total + item.totalPrice, 0))} ${settings.currency}</th>
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
                                        <td>${payment.dueDate}</td>
                                        <td>${formatInstallmentAmount(payment.amount)} ${settings.currency}</td>
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
                                        <td>${payment.paymentDate || '-'}</td>
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
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * فتح نافذة دفع قسط
 */
function openPayInstallmentModal(paymentId) {
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        alert('القسط غير موجود');
        return;
    }
    
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === payment.installmentId);
    
    if (!installment) {
        alert('القرض غير موجود');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'payInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">دفع القسط</h2>
                <div class="modal-close" onclick="document.getElementById('payInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-container" style="box-shadow: none; padding: 0;">
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
                            <input type="text" class="form-control" value="${payment.dueDate}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">مبلغ القسط</label>
                            <input type="text" class="form-control" value="${formatInstallmentAmount(payment.amount)} ${settings.currency}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">تاريخ الدفع</label>
                            <input type="date" class="form-control" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">طريقة الدفع</label>
                            <select class="form-select" id="paymentMethod">
                                <option value="cash">نقداً</option>
                                <option value="check">شيك</option>
                                <option value="transfer">حوالة بنكية</option>
                                <option value="card">بطاقة ائتمان</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-control" id="paymentNotes" rows="3"></textarea>
                    </div>
                    
                    ${payment.status === 'late' ? `
                        <div class="alert alert-warning">
                            <div class="alert-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title">تنبيه</div>
                                <div class="alert-text">هذا القسط متأخر عن موعد استحقاقه. تاريخ الاستحقاق كان ${payment.dueDate}.</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('payInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-success" onclick="confirmPayInstallment('${paymentId}')">
                    <i class="fas fa-check"></i> تأكيد الدفع
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * تأكيد دفع قسط
 */
function confirmPayInstallment(paymentId) {
    // البحث عن القسط
    const payment = installmentPayments.find(p => p.id === paymentId);
    
    if (!payment) {
        alert('القسط غير موجود');
        return;
    }
    
    // جمع البيانات من النموذج
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentNotes = document.getElementById('paymentNotes').value;
    
    if (!paymentDate) {
        alert('يرجى تحديد تاريخ الدفع');
        return;
    }
    
    // تسجيل الدفع
    const paymentData = {
        paymentDate,
        notes: `تم الدفع بواسطة ${
            paymentMethod === 'cash' ? 'نقداً' : 
            paymentMethod === 'check' ? 'شيك' : 
            paymentMethod === 'transfer' ? 'حوالة بنكية' : 
            'بطاقة ائتمان'
        }${paymentNotes ? ` - ${paymentNotes}` : ''}`
    };
    
    recordInstallmentPayment(paymentId, paymentData);
    
    // إغلاق النافذة المنبثقة
    document.getElementById('payInstallmentModal').remove();
    
    // إذا كانت نافذة عرض القرض مفتوحة، قم بتحديثها
    const viewInstallmentModal = document.getElementById('viewInstallmentModal');
    if (viewInstallmentModal) {
        const installmentId = payment.installmentId;
        viewInstallmentModal.remove();
        setTimeout(() => viewInstallment(installmentId), 100);
    }
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
}

/**
 * استكمال نظام إدارة الأقساط
 * 
 * هذا الملف يحتوي على استكمال وظائف إدارة الأقساط للتكامل مع نظام إدارة الاستثمار
 */

/**
 * تحرير قرض بالأقساط
 */
function editInstallment(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        alert('القرض غير موجود');
        return;
    }
    
    // إغلاق النافذة المنبثقة إذا كانت مفتوحة
    const viewModal = document.getElementById('viewInstallmentModal');
    if (viewModal) {
        viewModal.remove();
    }
    
    // الحصول على العناصر المرتبطة بالقرض
    const items = installmentItems.filter(item => item.installmentId === installmentId);
    
    // إنشاء نسخة محلية من العناصر
    window.installmentItemsList = JSON.parse(JSON.stringify(items));
    
    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editInstallmentModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تعديل قرض بالأقساط</h2>
                <div class="modal-close" onclick="document.getElementById('editInstallmentModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('editBorrowerInfo', 'editInstallmentModal')">معلومات المقترض</div>
                    <div class="modal-tab" onclick="switchModalTab('editItemsInfo', 'editInstallmentModal')">العناصر</div>
                    <div class="modal-tab" onclick="switchModalTab('editInstallmentInfo', 'editInstallmentModal')">معلومات القرض</div>
                </div>
                
                <div class="modal-tab-content active" id="editBorrowerInfo">
                    <form id="editBorrowerForm">
                        <div class="form-group">
                            <label class="form-label">نوع المقترض</label>
                            <select class="form-select" id="editBorrowerType" onchange="toggleEditBorrowerFields()" ${installment.borrowerType === 'investor' ? 'disabled' : ''}>
                                ${borrowerCategories.map(cat => `
                                    <option value="${cat.id}" ${installment.borrowerType === cat.id ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                            ${installment.borrowerType === 'investor' ? `
                                <p class="form-text">لا يمكن تغيير نوع المقترض من مستثمر إلى نوع آخر.</p>
                            ` : ''}
                        </div>
                        
                        <div id="editInvestorField" style="${installment.borrowerType === 'investor' ? 'display: block;' : 'display: none;'}">
                            <div class="form-group">
                                <label class="form-label">المستثمر</label>
                                <select class="form-select" id="editBorrowerId" ${installment.borrowerType === 'investor' ? 'disabled' : ''}>
                                    <option value="">اختر المستثمر</option>
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </select>
                                ${installment.borrowerType === 'investor' ? `
                                    <p class="form-text">لا يمكن تغيير المستثمر المرتبط بالقرض.</p>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div id="editOtherBorrowerFields" style="${installment.borrowerType !== 'investor' ? 'display: block;' : 'display: none;'}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">الاسم الكامل</label>
                                    <input type="text" class="form-control" id="editBorrowerName" value="${installment.borrowerName || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم الهاتف</label>
                                    <input type="text" class="form-control" id="editBorrowerPhone" value="${installment.borrowerPhone || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">العنوان</label>
                                    <input type="text" class="form-control" id="editBorrowerAddress" value="${installment.borrowerAddress || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">رقم البطاقة الشخصية</label>
                                    <input type="text" class="form-control" id="editBorrowerIdCard" value="${installment.borrowerIdCard || ''}" required>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-tab-content" id="editItemsInfo">
                    <form id="editItemsForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">نوع المادة</label>
                                <input type="text" class="form-control" id="editItemName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر</label>
                                <input type="number" class="form-control" id="editItemPrice" required oninput="calculateEditItemTotal()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">الكمية</label>
                                <input type="number" class="form-control" id="editItemQuantity" value="1" min="1" required oninput="calculateEditItemTotal()">
                            </div>
                            <div class="form-group">
                                <label class="form-label">السعر الإجمالي</label>
                                <input type="text" class="form-control" id="editItemTotalPrice" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" onclick="addEditItemToList()">
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
                                <tbody id="editItemsTableBody">
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colspan="4">المجموع</th>
                                        <th id="editItemsTotalSum">0</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </form>
                </div>
                
                <div class="modal-tab-content" id="editInstallmentInfo">
                    <form id="editInstallmentForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تاريخ البدء</label>
                                <input type="date" class="form-control" id="editStartDate" value="${installment.startDate}" required ${getRemainingInstallments(installmentId) < installment.durationMonths ? 'disabled' : ''}>
                                ${getRemainingInstallments(installmentId) < installment.durationMonths ? `
                                    <p class="form-text">لا يمكن تغيير تاريخ البدء بعد دفع بعض الأقساط.</p>
                                ` : ''}
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة القرض (بالأشهر)</label>
                                <input type="number" class="form-control" id="editDurationMonths" value="${installment.durationMonths}" min="1" required oninput="calculateEditInstallmentTotal()" ${getRemainingInstallments(installmentId) < installment.durationMonths ? 'disabled' : ''}>
                                ${getRemainingInstallments(installmentId) < installment.durationMonths ? `
                                    <p class="form-text">لا يمكن تغيير مدة القرض بعد دفع بعض الأقساط.</p>
                                ` : ''}
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">معدل الفائدة السنوية (%)</label>
                                <input type="number" class="form-control" id="editInterestRate" value="${installment.interestRate}" min="0" step="0.1" required oninput="calculateEditInstallmentTotal()" ${getRemainingInstallments(installmentId) < installment.durationMonths ? 'disabled' : ''}>
                                ${getRemainingInstallments(installmentId) < installment.durationMonths ? `
                                    <p class="form-text">لا يمكن تغيير معدل الفائدة بعد دفع بعض الأقساط.</p>
                                ` : ''}
                            </div>
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي للعناصر</label>
                                <input type="text" class="form-control" id="editTotalItemsAmount" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي مع الفائدة</label>
                                <input type="text" class="form-control" id="editTotalWithInterest" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">قيمة القسط الشهري</label>
                                <input type="text" class="form-control" id="editMonthlyInstallment" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="editInstallmentNotes" rows="3">${installment.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('editInstallmentModal').remove()">إلغاء</button>
                <button class="btn btn-primary" onclick="updateInstallmentDetails('${installmentId}')">حفظ التغييرات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ملء قائمة المستثمرين
    populateInvestorsList('editBorrowerId');
    if (installment.borrowerType === 'investor') {
        document.getElementById('editBorrowerId').value = installment.borrowerId;
    }
    
    // إضافة المستمعين للأحداث
    document.getElementById('editItemPrice').addEventListener('input', calculateEditItemTotal);
    document.getElementById('editItemQuantity').addEventListener('input', calculateEditItemTotal);
    
    // تحديث جدول العناصر
    updateEditItemsTable();
    
    // حساب الإجماليات
    calculateEditInstallmentTotal();
}

/**
 * تبديل حقول المقترض في نموذج التعديل
 */
function toggleEditBorrowerFields() {
    const borrowerType = document.getElementById('editBorrowerType').value;
    const investorField = document.getElementById('editInvestorField');
    const otherBorrowerFields = document.getElementById('editOtherBorrowerFields');
    
    if (borrowerType === 'investor') {
        investorField.style.display = 'block';
        otherBorrowerFields.style.display = 'none';
    } else {
        investorField.style.display = 'none';
        otherBorrowerFields.style.display = 'block';
    }
}

/**
 * حساب إجمالي العنصر في نموذج التعديل
 */
function calculateEditItemTotal() {
    const price = parseFloat(document.getElementById('editItemPrice').value) || 0;
    const quantity = parseInt(document.getElementById('editItemQuantity').value) || 1;
    const totalPrice = price * quantity;
    
    document.getElementById('editItemTotalPrice').value = formatInstallmentAmount(totalPrice) + ' ' + settings.currency;
}

/**
 * إضافة عنصر إلى القائمة في نموذج التعديل
 */
function addEditItemToList() {
    const itemName = document.getElementById('editItemName').value;
    const itemPrice = parseFloat(document.getElementById('editItemPrice').value);
    const itemQuantity = parseInt(document.getElementById('editItemQuantity').value) || 1;
    
    if (!itemName || !itemPrice) {
        alert('يرجى ملء جميع حقول العنصر');
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
    
    window.installmentItemsList.push(item);
    
    // تحديث الجدول
    updateEditItemsTable();
    
    // مسح حقول النموذج
    document.getElementById('editItemName').value = '';
    document.getElementById('editItemPrice').value = '';
    document.getElementById('editItemQuantity').value = '1';
    document.getElementById('editItemTotalPrice').value = '';
    
    // التركيز على حقل اسم العنصر
    document.getElementById('editItemName').focus();
    
    // حساب إجمالي المبلغ
    calculateEditInstallmentTotal();
}

/**
 * تحديث جدول العناصر في نموذج التعديل
 */
function updateEditItemsTable() {
    const tbody = document.getElementById('editItemsTableBody');
    if (!tbody) return;
    
    if (window.installmentItemsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">لم تتم إضافة عناصر بعد</td></tr>`;
        document.getElementById('editItemsTotalSum').textContent = '0';
        return;
    }
    
    tbody.innerHTML = '';
    
    let totalSum = 0;
    
    window.installmentItemsList.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${formatInstallmentAmount(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatInstallmentAmount(item.totalPrice)}</td>
            <td>
                <button class="btn btn-danger btn-icon action-btn" onclick="removeEditItemFromList('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        totalSum += item.totalPrice;
    });
    
    // تحديث المجموع
    document.getElementById('editItemsTotalSum').textContent = formatInstallmentAmount(totalSum) + ' ' + settings.currency;
}

/**
 * إزالة عنصر من القائمة في نموذج التعديل
 */
function removeEditItemFromList(itemId) {
    window.installmentItemsList = window.installmentItemsList.filter(item => item.id !== itemId);
    
    // تحديث الجدول
    updateEditItemsTable();
    
    // إعادة حساب إجمالي المبلغ
    calculateEditInstallmentTotal();
}

/**
 * حساب إجمالي القرض بالأقساط في نموذج التعديل
 */
function calculateEditInstallmentTotal() {
    // حساب إجمالي العناصر
    const totalItemsPrice = window.installmentItemsList.reduce((total, item) => total + item.totalPrice, 0);
    
    // الحصول على معدل الفائدة ومدة القرض
    const interestRate = parseFloat(document.getElementById('editInterestRate').value) || 4;
    const durationMonths = parseInt(document.getElementById('editDurationMonths').value) || 12;
    
    // حساب المبلغ الإجمالي مع الفائدة
    const totalWithInterest = calculateTotalWithInterest(totalItemsPrice, interestRate, durationMonths);
    
    // حساب قيمة القسط الشهري
    const monthlyInstallment = totalWithInterest / durationMonths;
    
    // تحديث الحقول
    document.getElementById('editTotalItemsAmount').value = formatInstallmentAmount(totalItemsPrice) + ' ' + settings.currency;
    document.getElementById('editTotalWithInterest').value = formatInstallmentAmount(totalWithInterest) + ' ' + settings.currency;
    document.getElementById('editMonthlyInstallment').value = formatInstallmentAmount(monthlyInstallment) + ' ' + settings.currency;
}

/**
 * تحديث بيانات القرض بالأقساط
 */
function updateInstallmentDetails(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        alert('القرض غير موجود');
        return;
    }
    
    // التحقق من وجود عناصر
    if (window.installmentItemsList.length === 0) {
        alert('يرجى إضافة عنصر واحد على الأقل');
        switchModalTab('editItemsInfo', 'editInstallmentModal');
        return;
    }
    
    // جمع البيانات من النموذج
    const borrowerType = document.getElementById('editBorrowerType').value;
    let borrowerId = installment.borrowerId;
    let borrowerName = installment.borrowerName;
    let borrowerPhone = installment.borrowerPhone;
    let borrowerAddress = installment.borrowerAddress;
    let borrowerIdCard = installment.borrowerIdCard;
    
    if (borrowerType === 'investor') {
        if (installment.borrowerType !== 'investor') {
            borrowerId = document.getElementById('editBorrowerId').value;
            
            if (!borrowerId) {
                alert('يرجى اختيار المستثمر');
                switchModalTab('editBorrowerInfo', 'editInstallmentModal');
                return;
            }
            
            // الحصول على بيانات المستثمر
            const investor = investors.find(inv => inv.id === borrowerId);
            if (investor) {
                borrowerName = investor.name;
                borrowerPhone = investor.phone;
                borrowerAddress = investor.address;
                borrowerIdCard = investor.idCard;
            }
        }
    } else {
        borrowerId = '';
        borrowerName = document.getElementById('editBorrowerName').value;
        borrowerPhone = document.getElementById('editBorrowerPhone').value;
        borrowerAddress = document.getElementById('editBorrowerAddress').value;
        borrowerIdCard = document.getElementById('editBorrowerIdCard').value;
        
        if (!borrowerName || !borrowerPhone || !borrowerAddress || !borrowerIdCard) {
            alert('يرجى ملء جميع حقول المقترض');
            switchModalTab('editBorrowerInfo', 'editInstallmentModal');
            return;
        }
    }
    
    // جمع بيانات القرض
    const startDate = document.getElementById('editStartDate').value;
    const durationMonths = parseInt(document.getElementById('editDurationMonths').value) || 12;
    const interestRate = parseFloat(document.getElementById('editInterestRate').value) || 4;
    const notes = document.getElementById('editInstallmentNotes').value;
    
    if (!startDate) {
        alert('يرجى تحديد تاريخ البدء');
        switchModalTab('editInstallmentInfo', 'editInstallmentModal');
        return;
    }
    
    // تحديث القرض
    const updateData = {
        borrowerType,
        borrowerId,
        borrowerName,
        borrowerPhone,
        borrowerAddress,
        borrowerIdCard,
        startDate,
        durationMonths,
        interestRate,
        notes
    };
    
    // إذا لم يتم دفع أي أقساط، يمكننا تحديث المزيد من البيانات
    if (getRemainingInstallments(installmentId) === installment.durationMonths) {
        // إنشاء عناصر جديدة
        // حذف العناصر القديمة
        installmentItems = installmentItems.filter(item => item.installmentId !== installmentId);
        
        // إضافة العناصر الجديدة
        window.installmentItemsList.forEach(item => {
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
        
        // حذف جدول الأقساط القديم
        installmentPayments = installmentPayments.filter(payment => payment.installmentId !== installmentId);
        
        // حساب المبلغ الإجمالي الجديد
        const totalItemsPrice = window.installmentItemsList.reduce((total, item) => total + item.totalPrice, 0);
        const totalWithInterest = calculateTotalWithInterest(totalItemsPrice, interestRate, durationMonths);
        
        // تحديث المبلغ الإجمالي للقرض
        updateData.totalAmount = totalWithInterest;
        
        // إنشاء جدول الأقساط الجديد
        const schedule = generateInstallmentSchedule(
            installmentId,
            totalWithInterest,
            durationMonths,
            startDate
        );
        
        // إضافة جدول الأقساط الجديد
        installmentPayments = [...installmentPayments, ...schedule];
    } else {
        // لا يمكن تغيير بعض البيانات بعد دفع بعض الأقساط
        alert('تم تحديث بيانات القرض بالأقساط. لا يمكن تغيير بعض البيانات بعد دفع بعض الأقساط.');
    }
    
    // تحديث القرض
    updateInstallment(installmentId, updateData);
    
    // إغلاق النافذة المنبثقة
    document.getElementById('editInstallmentModal').remove();
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
}

/**
 * فتح نافذة تأكيد حذف القرض بالأقساط
 */
function openDeleteInstallmentModal(installmentId) {
    // البحث عن القرض
    const installment = installments.find(inst => inst.id === installmentId);
    
    if (!installment) {
        alert('القرض غير موجود');
        return;
    }
    
    // إغلاق النوافذ المنبثقة المفتوحة
    const viewModal = document.getElementById('viewInstallmentModal');
    if (viewModal) {
        viewModal.remove();
    }
    
    const editModal = document.getElementById('editInstallmentModal');
    if (editModal) {
        editModal.remove();
    }
    
    // حساب الإحصائيات
    const remainingInstallments = getRemainingInstallments(installmentId);
    const lateInstallments = getLateInstallments(installmentId);
    
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

/**
 * تأكيد حذف القرض بالأقساط
 */
function confirmDeleteInstallment(installmentId) {
    // حذف القرض
    deleteInstallment(installmentId);
    
    // إغلاق النافذة المنبثقة
    document.getElementById('deleteInstallmentModal').remove();
    
    // إعادة تحميل صفحة الأقساط
    loadInstallmentsPage();
}

/**
 * إضافة رابط في شريط التنقل الجانبي
 */
function addInstallmentsMenuLink() {
    // التحقق من وجود شريط التنقل الجانبي
    const sidebar = document.querySelector('.sidebar-menu');
    if (!sidebar) return;
    
    // التحقق من وجود قسم "إدارة الاستثمار"
    let investmentManagementCategory = sidebar.querySelector('.menu-category:nth-of-type(2)');
    
    if (!investmentManagementCategory) {
        // إنشاء القسم إذا لم يكن موجودًا
        investmentManagementCategory = document.createElement('div');
        investmentManagementCategory.className = 'menu-category';
        investmentManagementCategory.textContent = 'إدارة الاستثمار';
        
        // إضافة القسم بعد قسم "لوحة التحكم"
        const dashboardCategory = sidebar.querySelector('.menu-category:first-of-type');
        if (dashboardCategory) {
            dashboardCategory.after(investmentManagementCategory);
        } else {
            // إضافة القسم في بداية شريط التنقل إذا لم يكن هناك قسم "لوحة التحكم"
            sidebar.prepend(investmentManagementCategory);
        }
    }
    
    // إنشاء رابط الأقساط
    const installmentsLink = document.createElement('a');
    installmentsLink.href = '#installments';
    installmentsLink.className = 'menu-item';
    installmentsLink.onclick = function() { showPage('installments'); };
    installmentsLink.innerHTML = `
        <span class="menu-icon"><i class="fas fa-receipt"></i></span>
        <span>نظام الأقساط</span>
        <span class="menu-badge" id="installmentsBadge">0</span>
    `;
    
    // إضافة الرابط بعد رابط "العمليات"
    const operationsLink = sidebar.querySelector('a[href="#operations"]');
    if (operationsLink) {
        operationsLink.after(installmentsLink);
    } else {
        // إضافة الرابط بعد قسم "إدارة الاستثمار" إذا لم يكن هناك رابط "العمليات"
        investmentManagementCategory.after(installmentsLink);
    }
    
    // تحديث عدد الأقساط المتأخرة
    updateInstallmentsBadge();
}

/**
 * تحديث شارة الأقساط
 */
function updateInstallmentsBadge() {
    const latePayments = getLateInstallmentPayments().length;
    const badge = document.getElementById('installmentsBadge');
    
    if (badge) {
        badge.textContent = latePayments;
        badge.style.display = latePayments > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * إنشاء صفحة الأقساط
 */
function createInstallmentsPage() {
    // التحقق من وجود منطقة المحتوى
    const content = document.querySelector('.content');
    if (!content) return;
    
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
                    <span class="notification-badge">0</span>
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
        </div>

        <div class="table-container">
            <div class="table-header">
                <div class="table-title">قائمة القروض بالأقساط</div>
                <div class="table-actions">
                    <button class="btn btn-light" onclick="exportInstallments()">
                        <i class="fas fa-file-export"></i> تصدير
                    </button>
                    <button class="btn btn-light" onclick="printTable('installmentsTable')">
                        <i class="fas fa-print"></i> طباعة
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
                        <th>الحالة</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody id="installmentsTableBody">
                    <!-- سيتم ملؤها بواسطة JavaScript -->
                </tbody>
            </table>
        </div>

        <div class="grid-layout">
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

        <div class="chart-container" id="installmentsChartContainer">
            <div class="chart-header">
                <div class="chart-title">تحليل الأقساط</div>
                <div class="chart-actions">
                    <button class="btn btn-sm btn-light" onclick="switchInstallmentsChartPeriod('monthly')">شهري</button>
                    <button class="btn btn-sm btn-primary" onclick="switchInstallmentsChartPeriod('quarterly')">ربع سنوي</button>
                    <button class="btn btn-sm btn-light" onclick="switchInstallmentsChartPeriod('yearly')">سنوي</button>
                    <button class="btn btn-sm btn-light" onclick="exportInstallmentsChart()"><i class="fas fa-download"></i> تصدير</button>
                </div>
            </div>
            <div id="installmentsChart" style="height: 300px; width: 100%;">
                <!-- سيتم رسم المخطط البياني هنا -->
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى منطقة المحتوى
    content.appendChild(installmentsPage);
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
    const installmentsTable = document.querySelector('#installments .table-container:nth-of-type(3)');
    const upcomingPaymentsContainer = document.getElementById('upcomingPaymentsContainer');
    const latePaymentsContainer = document.getElementById('latePaymentsContainer');
    const installmentsChartContainer = document.getElementById('installmentsChartContainer');
    
    // إخفاء جميع العناصر أولاً
    installmentsTable.style.display = 'none';
    upcomingPaymentsContainer.style.display = 'none';
    latePaymentsContainer.style.display = 'none';
    installmentsChartContainer.style.display = 'none';
    
    // إظهار العناصر حسب علامة التبويب
    switch (tabId) {
        case 'all':
        case 'active':
        case 'completed':
        case 'defaulted':
            // تحديث عنوان الجدول
            const tableTitle = installmentsTable.querySelector('.table-title');
            tableTitle.textContent = `قائمة القروض ${
                tabId === 'active' ? 'النشطة' : 
                tabId === 'completed' ? 'المكتملة' : 
                tabId === 'defaulted' ? 'المتعثرة' : ''
            }`;
            
            // تحميل جدول الأقساط
            loadInstallmentsTable(tabId);
            
            // إظهار جدول الأقساط
            installmentsTable.style.display = 'block';
            break;
            
        case 'upcoming':
            // تحميل الأقساط المستحقة قريباً
            loadUpcomingPayments();
            
            // إظهار جدول الأقساط المستحقة قريباً
            upcomingPaymentsContainer.style.display = 'block';
            break;
            
        case 'late':
            // تحميل الأقساط المتأخرة
            loadLatePayments();
            
            // إظهار جدول الأقساط المتأخرة
            latePaymentsContainer.style.display = 'block';
            break;
            
        case 'statistics':
            // تحميل الرسم البياني
            loadInstallmentsChart();
            
            // إظهار الرسم البياني
            installmentsChartContainer.style.display = 'block';
            break;
    }
}

/**
 * تبديل فترة الرسم البياني للأقساط
 */
function switchInstallmentsChartPeriod(period) {
    // تحديث حالة الأزرار
    document.querySelectorAll('#installmentsChartContainer .chart-actions button').forEach(btn => {
        btn.className = 'btn btn-sm btn-light';
    });
    
    document.querySelector(`#installmentsChartContainer .chart-actions button[onclick="switchInstallmentsChartPeriod('${period}')"]`).className = 'btn btn-sm btn-primary';
    
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
    
    // تصفية الصفوف
    rows.forEach(row => {
        const borrower = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const type = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const totalAmount = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        const status = row.querySelector('td:nth-child(8)').textContent.toLowerCase();
        
        // إظهار الصف إذا كان أي حقل يطابق مصطلح البحث
        if (borrower.includes(searchTerm) || 
            type.includes(searchTerm) || 
            totalAmount.includes(searchTerm) || 
            status.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * تصدير بيانات الأقساط
 */
function exportInstallments() {
    if (installments.length === 0) {
        createNotification('تنبيه', 'لا توجد أقساط للتصدير', 'warning');
        return;
    }
    
    // إنشاء كائن التصدير
    const exportData = {
        installments,
        installmentItems,
        installmentPayments,
        exportDate: new Date().toISOString(),
        systemInfo: {
            version: '1.0',
            currency: settings.currency
        }
    };
    
    // تحويل البيانات إلى JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // إنشاء ملف للتنزيل
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `installments_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    createNotification('نجاح', 'تم تصدير بيانات الأقساط بنجاح', 'success');
}

/**
 * تصدير الرسم البياني للأقساط
 */
function exportInstallmentsChart() {
    // الحصول على عنصر الرسم البياني
    const chartContainer = document.getElementById('installmentsChart');
    if (!chartContainer) return;
    
    // الحصول على عنصر canvas
    const canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
        createNotification('خطأ', 'لا يمكن تصدير الرسم البياني', 'danger');
        return;
    }
    
    // تحويل canvas إلى URL
    try {
        const imageUrl = canvas.toDataURL('image/png');
        
        // إنشاء رابط التنزيل
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `installments_chart_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        createNotification('نجاح', 'تم تصدير الرسم البياني بنجاح', 'success');
    } catch (error) {
        console.error('Error exporting chart:', error);
        createNotification('خطأ', 'حدث خطأ أثناء تصدير الرسم البياني', 'danger');
    }
}

/**
 * تهيئة نظام الأقساط
 */
function initInstallmentSystem() {
    // تحميل بيانات الأقساط
    loadInstallmentData();
    
    // إضافة رابط في شريط التنقل الجانبي
    addInstallmentsMenuLink();
    
    // إنشاء صفحة الأقساط
    createInstallmentsPage();
    
    // التحقق من تواريخ الاستحقاق وتحديث الحالات
    checkDueDates();
    
    // تحديث شارة الأقساط
    updateInstallmentsBadge();
    
    // إضافة مستمع حدث لتحديث الأقساط يوميًا
    // سيتم استدعاء checkDueDates() مرة واحدة يوميًا عند منتصف الليل
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // غدًا
        0, 0, 0 // منتصف الليل
    );
    const msToMidnight = night.getTime() - now.getTime();
    
    // ضبط المؤقت للتشغيل عند منتصف الليل، ثم كل 24 ساعة بعد ذلك
    setTimeout(() => {
        checkDueDates();
        // ضبط المؤقت للتشغيل كل 24 ساعة
        setInterval(checkDueDates, 24 * 60 * 60 * 1000);
    }, msToMidnight);
    
    console.log('تم تهيئة نظام الأقساط بنجاح');
}

// التسجيل للحصول على إشعارات الأقساط قبل موعد استحقاقها
function registerInstallmentNotifications() {
    // تشغيل وظيفة للتحقق من الأقساط المستحقة قريبًا
    function checkUpcomingInstallments() {
        const upcomingPayments = getUpcomingInstallmentPayments(3); // أقساط مستحقة خلال 3 أيام
        
        upcomingPayments.forEach(payment => {
            const installment = installments.find(inst => inst.id === payment.installmentId);
            if (!installment) return;
            
            const borrowerName = getBorrowerName(installment);
            const daysUntilDue = Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            createNotification(
                'قسط مستحق قريبًا',
                `القسط رقم ${payment.number} للمقترض ${borrowerName} سيكون مستحقًا خلال ${daysUntilDue} يوم${daysUntilDue === 1 ? '' : 'ين'}`,
                'info',
                payment.id,
                'installmentPayment'
            );
        });
    }
    
    // التحقق من الأقساط المستحقة قريبًا عند بدء التشغيل
    checkUpcomingInstallments();
    
    // التحقق من الأقساط المستحقة قريبًا كل 12 ساعة
    setInterval(checkUpcomingInstallments, 12 * 60 * 60 * 1000);
}

// الدمج مع التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام الأقساط بعد تحميل الصفحة
    setTimeout(initInstallmentSystem, 1000);
    
    // التسجيل للحصول على إشعارات الأقساط
    setTimeout(registerInstallmentNotifications, 2000);
});