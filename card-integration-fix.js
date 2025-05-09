// card-integration-fix.js
// ملف إصلاح مشاكل نظام بطاقات المستثمرين

// إصلاح مشكلة النقر مرتين
function fixMenuNavigation() {
    // تحديث معرفات الصفحات في القائمة الجانبية
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
        // البحث عن عناصر القائمة وتحديث معرفاتها
        const menuItems = sidebarMenu.querySelectorAll('a.menu-item');
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === '#investor-cards') {
                item.setAttribute('onclick', "showPage('investor-cards-page')");
            } else if (href === '#active-cards') {
                item.setAttribute('onclick', "showPage('active-cards-page')");
            } else if (href === '#expired-cards') {
                item.setAttribute('onclick', "showPage('expired-cards-page')");
            } else if (href === '#barcode-scanner') {
                item.setAttribute('onclick', "showPage('barcode-scanner-page')");
            } else if (href === '#new-card') {
                item.setAttribute('onclick', "showPage('new-card-page')");
            } else if (href === '#card-stats') {
                item.setAttribute('onclick', "showPage('card-stats-page')");
            }
        });
    }
}

// إصلاح دالة عرض الصفحة
function fixShowPageFunction() {
    const originalShowPage = window.showPage;
    window.showPage = function(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // عرض الصفحة المطلوبة
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
        
        // تحديث القائمة النشطة
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // البحث عن عنصر القائمة المناسب وتفعيله
        let menuSelector = '';
        switch(pageId) {
            case 'investor-cards-page':
                menuSelector = 'a[href="#investor-cards"]';
                break;
            case 'active-cards-page':
                menuSelector = 'a[href="#active-cards"]';
                break;
            case 'expired-cards-page':
                menuSelector = 'a[href="#expired-cards"]';
                break;
            case 'barcode-scanner-page':
                menuSelector = 'a[href="#barcode-scanner"]';
                break;
            case 'new-card-page':
                menuSelector = 'a[href="#new-card"]';
                break;
            case 'card-stats-page':
                menuSelector = 'a[href="#card-stats"]';
                break;
        }
        
        if (menuSelector) {
            const menuItem = document.querySelector(menuSelector);
            if (menuItem) {
                menuItem.classList.add('active');
            }
        }
        
        // استدعاء الدوال المناسبة للصفحة
        switch(pageId) {
            case 'investor-cards-page':
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.renderCards('all');
                }
                break;
            case 'active-cards-page':
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.renderCards('active');
                }
                break;
            case 'expired-cards-page':
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.renderCards('expired');
                }
                break;
            case 'barcode-scanner-page':
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.initBarcodeScanner();
                }
                break;
            case 'new-card-page':
                updateInvestorDropdown();
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.updateCardPreview();
                }
                break;
            case 'card-stats-page':
                if (typeof InvestorCardSystem !== 'undefined') {
                    InvestorCardSystem.renderCardStats();
                }
                break;
            default:
                if (typeof originalShowPage === 'function') {
                    originalShowPage(pageId);
                }
                break;
        }
    };
}

// إصلاح مشكلة عدم ظهور المستثمرين في قائمة الاختيار
function updateInvestorDropdown() {
    // البحث عن select بالمعرف الصحيح
    const select = document.querySelector('select[name="investorSelect"]');
    
    if (select && window.investors) {
        // مسح الخيارات السابقة
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // ترتيب المستثمرين أبجدياً
        const sortedInvestors = [...window.investors].sort((a, b) => a.name.localeCompare(b.name));
        
        // إضافة المستثمرين للقائمة
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = investor.name;
            select.appendChild(option);
        });
        
        // إضافة معالج للتغيير
        select.onchange = function() {
            if (typeof InvestorCardSystem !== 'undefined') {
                InvestorCardSystem.updateCardPreview();
            }
        };
    }
}

// إصلاح دالة إنشاء البطاقة
function fixCreateCardFunction() {
    if (typeof InvestorCardSystem !== 'undefined') {
        const originalCreateNewCard = InvestorCardSystem.createNewCard;
        
        InvestorCardSystem.createNewCard = function() {
            const form = document.getElementById('newCardForm');
            if (!form) return;
            
            const formData = new FormData(form);
            const investorId = formData.get('investorSelect');
            const cardType = formData.get('cardType');
            
            if (!investorId) {
                createNotification('خطأ', 'يرجى اختيار المستثمر', 'danger');
                return;
            }
            
            const options = {
                years: parseInt(formData.get('cardValidity') || '3'),
                hasQRCode: formData.get('hasQRCode') === 'on',
                hasChip: formData.get('hasChip') === 'on',
                hasHologram: formData.get('hasHologram') === 'on',
                hasPINCode: formData.get('hasPINCode') === 'on'
            };
            
            try {
                const card = InvestorCardSystem.createCard(investorId, cardType, options);
                showPage('card-detail-page');
                InvestorCardSystem.viewCardDetails(card.id);
                createNotification('نجاح', 'تم إنشاء البطاقة بنجاح', 'success');
            } catch(error) {
                createNotification('خطأ', error.message, 'danger');
            }
        };
    }
}

// دالة تهيئة الإصلاحات
function initializeFixes() {
    // تصحيح التنقل في القائمة
    fixMenuNavigation();
    
    // تصحيح دالة عرض الصفحة
    fixShowPageFunction();
    
    // تصحيح دالة إنشاء البطاقة
    fixCreateCardFunction();
    
    // التأكد من وجود زر إضافة بطاقة في صفحة المستثمرين
    addCardButtonToInvestors();
    
    console.log('✅ تم تطبيق إصلاحات نظام البطاقات بنجاح');
}

// إضافة زر إنشاء بطاقة إلى صفحة المستثمرين
function addCardButtonToInvestors() {
    const investorsPage = document.getElementById('investors');
    if (investorsPage) {
        const headerActions = investorsPage.querySelector('.header-actions');
        if (headerActions && !headerActions.querySelector('.create-card-btn')) {
            const createCardBtn = document.createElement('button');
            createCardBtn.className = 'btn btn-info create-card-btn';
            createCardBtn.innerHTML = '<i class="fas fa-id-card"></i> إنشاء بطاقة';
            createCardBtn.onclick = function() {
                showPage('new-card-page');
            };
            
            // إضافة الزر بعد زر إضافة مستثمر
            const addInvestorBtn = headerActions.querySelector('button[onclick="openAddInvestorModal()"]');
            if (addInvestorBtn) {
                addInvestorBtn.insertAdjacentElement('afterend', createCardBtn);
            }
        }
    }
}

// تهيئة الإصلاحات عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFixes);
} else {
    initializeFixes();
}

// مراقبة التغييرات في DOM للتأكد من تطبيق الإصلاحات
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            // إعادة تطبيق الإصلاحات عند إضافة عناصر جديدة
            fixMenuNavigation();
            addCardButtonToInvestors();
        }
    });
});

// بدء المراقبة
observer.observe(document.body, {
    childList: true,
    subtree: true
});