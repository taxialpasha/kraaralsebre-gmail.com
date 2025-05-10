// investor-cards-delete-fix.js

/**
 * إصلاح مشكلة حذف بطاقات المستثمرين
 * يحل مشكلة عدم عمل زر الحذف وتفاعله
 */

// إصلاح دالة حذف البطاقة من قاعدة البيانات
window.deleteCardFromDatabase = function(cardId) {
    if (!cardSettings.enableDatabaseSync) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        // التحقق من توفر Firebase
        if (!window.checkFirebaseAvailability || !window.checkFirebaseAvailability()) {
            console.warn("Firebase غير متاح لحذف البيانات");
            return resolve();
        }
        
        // التحقق من تسجيل الدخول
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            console.warn("المستخدم غير مسجل الدخول");
            return resolve();
        }
        
        try {
            const db = firebase.database();
            const userId = currentUser.uid;
            const cardRef = db.ref(`users/${userId}/investorCards/${cardId}`);
            
            cardRef.remove()
                .then(() => {
                    console.log(`تم حذف البطاقة ${cardId} من قاعدة البيانات بنجاح`);
                    resolve();
                })
                .catch((error) => {
                    console.error("حدث خطأ أثناء حذف البطاقة من قاعدة البيانات:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("خطأ في الوصول إلى Firebase:", error);
            reject(error);
        }
    });
};

// إصلاح دالة حذف بطاقة المستثمر
window.deleteInvestorCard = function(investorId) {
    console.log("محاولة حذف بطاقة المستثمر:", investorId);
    
    // البحث عن بطاقة المستثمر
    const card = investorCards[investorId];
    if (!card) {
        console.error("البطاقة غير موجودة:", investorId);
        createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
        return;
    }
    
    // تأكيد الحذف
    if (!confirm('هل أنت متأكد من حذف البطاقة؟')) {
        return;
    }
    
    // حذف البطاقة محلياً
    delete investorCards[investorId];
    
    // حفظ البطاقات محلياً
    localStorage.setItem('investorCards', JSON.stringify(investorCards));
    
    // تحديث جدول البطاقات فوراً
    if (typeof updateInvestorCardsTable === 'function') {
        updateInvestorCardsTable();
    }
    
    // حذف البطاقة من قاعدة البيانات
    if (cardSettings.enableDatabaseSync) {
        deleteCardFromDatabase(card.id)
            .then(() => {
                console.log("تم حذف البطاقة من قاعدة البيانات بنجاح");
                createNotification('نجاح', 'تم حذف البطاقة بنجاح', 'success');
            })
            .catch(error => {
                console.error("فشل حذف البطاقة من قاعدة البيانات:", error);
                createNotification('تحذير', 'تم حذف البطاقة محلياً ولكن فشل حذفها من قاعدة البيانات', 'warning');
            });
    } else {
        createNotification('نجاح', 'تم حذف البطاقة بنجاح', 'success');
    }
    
    // إنشاء نشاط للمستثمر
    if (typeof createInvestorActivity === 'function') {
        createInvestorActivity(investorId, 'card', `تم حذف بطاقة المستثمر`);
    }
};

// إصلاح مشكلة الأحداث على أزرار الحذف
function fixDeleteButtonEvents() {
    // استخدام event delegation للتعامل مع الأزرار الديناميكية
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // التحقق من النقر على زر الحذف أو الأيقونة داخله
        let deleteButton = null;
        
        if (target.classList.contains('btn-danger') && target.querySelector('.fa-trash')) {
            deleteButton = target;
        } else if (target.classList.contains('fa-trash')) {
            deleteButton = target.closest('.btn-danger');
        }
        
        if (deleteButton) {
            // استخراج معرف المستثمر من الدالة onclick
            const onclickAttr = deleteButton.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('deleteInvestorCard')) {
                // استخراج معرف المستثمر من النص
                const match = onclickAttr.match(/deleteInvestorCard\(['"]([^'"]+)['"]\)/);
                if (match && match[1]) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const investorId = match[1];
                    console.log("تم النقر على زر حذف البطاقة للمستثمر:", investorId);
                    
                    // استدعاء دالة الحذف
                    window.deleteInvestorCard(investorId);
                }
            }
        }
    }, true);
}

// التحقق من أن دالة التحديث موجودة
if (!window.updateInvestorCardsTable) {
    window.updateInvestorCardsTable = function() {
        console.log("دالة تحديث جدول البطاقات غير موجودة - يتم إعادة تحميل البطاقات");
        
        // محاولة إيجاد الجدول وتحديثه يدوياً
        const tbody = document.getElementById('investorCardsTableBody');
        if (tbody) {
            // إعادة رسم الجدول من الصفر
            tbody.innerHTML = '';
            
            // تحويل كائن البطاقات إلى مصفوفة
            const cardsArray = Object.values(window.investorCards || {});
            
            if (cardsArray.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="7" style="text-align: center;">لا توجد بطاقات مستثمرين</td>`;
                tbody.appendChild(row);
                return;
            }
            
            // ترتيب البطاقات حسب تاريخ الإنشاء (الأحدث أولاً)
            cardsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            cardsArray.forEach((card, index) => {
                const investor = window.investors?.find(inv => inv.id === card.investorId);
                if (!investor) return;
                
                const now = new Date();
                const expiryDate = new Date(card.expiryDate);
                const isExpired = expiryDate < now;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${investor.name}</td>
                    <td>${card.cardNumber}</td>
                    <td>${formatDate(card.createdAt)}</td>
                    <td>${formatDate(card.expiryDate)}</td>
                    <td><span class="status ${isExpired ? 'closed' : 'active'}">${isExpired ? 'منتهية' : 'فعالة'}</span></td>
                    <td>
                        <button class="btn btn-info btn-icon action-btn" onclick="openInvestorCard('${card.investorId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-success btn-icon action-btn" onclick="printInvestorCard('${card.investorId}')">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-warning btn-icon action-btn" onclick="renewInvestorCard('${card.investorId}')">
                            <i class="fas fa-sync"></i>
                        </button>
                        <button class="btn btn-danger btn-icon action-btn" onclick="deleteInvestorCard('${card.investorId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }
    };
}

// تطبيق الإصلاحات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات حذف بطاقات المستثمرين');
    
    // إصلاح أحداث أزرار الحذف
    fixDeleteButtonEvents();
    
    // إضافة دالة التحقق من Firebase إذا لم تكن موجودة
    if (!window.checkFirebaseAvailability) {
        window.checkFirebaseAvailability = function() {
            if (typeof firebase === 'undefined') return false;
            if (!firebase.apps || firebase.apps.length === 0) return false;
            
            try {
                const db = firebase.database();
                return db !== null && db !== undefined;
            } catch (error) {
                return false;
            }
        };
    }
});

// مراقبة التغييرات في DOM لإعادة تطبيق الإصلاحات
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // التحقق من إضافة جدول البطاقات
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.id === 'investorCardsTableBody') {
                    console.log('تم اكتشاف جدول البطاقات الجديد - إعادة تطبيق الإصلاحات');
                    fixDeleteButtonEvents();
                }
            });
        }
    });
});

// مراقبة التغييرات في الجسم
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('تم تحميل إصلاحات حذف بطاقات المستثمرين');