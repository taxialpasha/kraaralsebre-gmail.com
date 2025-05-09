// card-integration-fix.js - ملف تصحيح التكامل مع النظام الرئيسي

// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من وجود النظام الرئيسي
    if (typeof window.showPage === 'undefined') {
        console.error('دالة showPage غير موجودة');
        return;
    }
    
    // إضافة عناصر القائمة يدوياً
    function addCardMenuItems() {
        const sidebar = document.querySelector('.sidebar-menu');
        if (!sidebar) {
            console.error('القائمة الجانبية غير موجودة');
            return;
        }
        
        // البحث عن قسم النظام في القائمة
        const systemCategory = Array.from(sidebar.querySelectorAll('.menu-category'))
            .find(el => el.textContent.includes('النظام'));
            
        if (!systemCategory) {
            console.error('قسم النظام غير موجود في القائمة');
            return;
        }
        
        // إنشاء قسم بطاقات المستثمرين
        const cardMenuHTML = `
            <div class="menu-category">بطاقات المستثمرين</div>
            <a href="#investor-cards" class="menu-item" onclick="showCardPage('investor-cards')">
                <span class="menu-icon"><i class="fas fa-id-card"></i></span>
                <span>كل البطاقات</span>
            </a>
            <a href="#active-cards" class="menu-item" onclick="showCardPage('active-cards')">
                <span class="menu-icon"><i class="fas fa-check-circle"></i></span>
                <span>البطاقات النشطة</span>
            </a>
            <a href="#expired-cards" class="menu-item" onclick="showCardPage('expired-cards')">
                <span class="menu-icon"><i class="fas fa-times-circle"></i></span>
                <span>البطاقات المنتهية</span>
            </a>
            <a href="#barcode-scanner" class="menu-item" onclick="showCardPage('barcode-scanner')">
                <span class="menu-icon"><i class="fas fa-qrcode"></i></span>
                <span>مسح الباركود</span>
            </a>
            <a href="#new-card" class="menu-item" onclick="showCardPage('new-card')">
                <span class="menu-icon"><i class="fas fa-plus-circle"></i></span>
                <span>بطاقة جديدة</span>
            </a>
            <a href="#card-stats" class="menu-item" onclick="showCardPage('card-stats')">
                <span class="menu-icon"><i class="fas fa-chart-pie"></i></span>
                <span>إحصائيات البطاقات</span>
            </a>
        `;
        
        // إضافة القائمة قبل قسم النظام
        systemCategory.insertAdjacentHTML('beforebegin', cardMenuHTML);
        console.log('تم إضافة قائمة البطاقات بنجاح');
    }
    
    // دالة عرض صفحات البطاقات
    window.showCardPage = function(pageId) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إزالة الفئة النشطة من جميع عناصر القائمة
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // عرض الصفحة المطلوبة
        const cardPage = document.getElementById(`${pageId}-page`);
        if (cardPage) {
            cardPage.classList.add('active');
            
            // تنشيط النظام حسب الصفحة
            if (typeof InvestorCardSystem !== 'undefined') {
                switch(pageId) {
                    case 'investor-cards':
                        InvestorCardSystem.renderCards('all');
                        break;
                    case 'active-cards':
                        InvestorCardSystem.renderCards('active');
                        break;
                    case 'expired-cards':
                        InvestorCardSystem.renderCards('expired');
                        break;
                    case 'barcode-scanner':
                        InvestorCardSystem.initBarcodeScanner();
                        break;
                    case 'new-card':
                        InvestorCardSystem.updateInvestorSelect();
                        InvestorCardSystem.updateCardPreview();
                        break;
                    case 'card-stats':
                        InvestorCardSystem.renderCardStats();
                        break;
                }
            }
        } else {
            console.error('الصفحة غير موجودة:', pageId);
        }
        
        // تفعيل عنصر القائمة
        const activeMenuItem = document.querySelector(`.menu-item[onclick="showCardPage('${pageId}')"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
    };
    
    // إضافة الصفحات للمحتوى
    function addCardPages() {
        const content = document.querySelector('.content');
        if (!content) {
            console.error('منطقة المحتوى غير موجودة');
            return;
        }
        
        // التحقق من وجود الصفحات بالفعل
        if (document.getElementById('investor-cards-page')) {
            console.log('الصفحات موجودة بالفعل');
            return;
        }
        
        const cardPagesHTML = `
            <div id="investor-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">بطاقات المستثمرين</h1>
                    <div class="header-actions">
                        <div class="search-bar">
                            <input type="text" class="search-input" placeholder="بحث عن بطاقة..." 
                                   oninput="InvestorCardSystem.handleSearch(this.value)">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button class="btn btn-primary" onclick="showCardPage('new-card')">
                            <i class="fas fa-plus"></i> بطاقة جديدة
                        </button>
                    </div>
                </div>
                <div class="cards-grid" id="cardsGrid">
                    <div class="empty-state">
                        <i class="fas fa-credit-card fa-3x"></i>
                        <h3>لا توجد بطاقات</h3>
                        <p>ابدأ بإنشاء بطاقة جديدة للمستثمرين.</p>
                    </div>
                </div>
            </div>
            
            <div id="active-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">البطاقات النشطة</h1>
                </div>
                <div class="cards-grid" id="activeCardsGrid"></div>
            </div>
            
            <div id="expired-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">البطاقات المنتهية</h1>
                </div>
                <div class="cards-grid" id="expiredCardsGrid"></div>
            </div>
            
            <div id="barcode-scanner-page" class="page">
                <div class="header">
                    <h1 class="page-title">مسح الباركود</h1>
                </div>
                <div class="scanner-container">
                    <div id="reader"></div>
                    <div class="manual-search">
                        <h3>أو ابحث يدوياً</h3>
                        <div class="search-bar">
                            <input type="text" class="form-control" id="manualSearchInput" 
                                   placeholder="أدخل رقم البطاقة">
                            <button class="btn btn-primary" onclick="InvestorCardSystem.manualSearch()">
                                <i class="fas fa-search"></i> بحث
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="new-card-page" class="page">
                <div class="header">
                    <h1 class="page-title">إنشاء بطاقة جديدة</h1>
                </div>
                <div class="form-container">
                    <form id="newCardForm" onsubmit="event.preventDefault(); InvestorCardSystem.createNewCard()">
                        <div class="form-section">
                            <h3>معلومات المستثمر</h3>
                            <div class="form-group">
                                <label class="form-label">المستثمر</label>
                                <select class="form-select" name="investorSelect" required 
                                        onchange="InvestorCardSystem.updateCardPreview()">
                                    <option value="">اختر المستثمر</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>خصائص البطاقة</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">نوع البطاقة</label>
                                    <select class="form-select" name="cardType" 
                                            onchange="InvestorCardSystem.updateCardPreview()">
                                        <option value="platinum">بلاتينية</option>
                                        <option value="gold">ذهبية</option>
                                        <option value="premium">بريميوم</option>
                                        <option value="diamond">ماسية</option>
                                        <option value="islamic">إسلامية</option>
                                        <option value="custom">مخصصة</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">مدة الصلاحية</label>
                                    <select class="form-select" name="cardValidity">
                                        <option value="1">سنة واحدة</option>
                                        <option value="2">سنتان</option>
                                        <option value="3" selected>3 سنوات</option>
                                        <option value="5">5 سنوات</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasQRCode">
                                    <span>إضافة QR Code</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasChip" checked>
                                    <span>شريحة ذكية</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasHologram">
                                    <span>هولوغرام</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasPINCode">
                                    <span>رقم PIN</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>معاينة البطاقة</h3>
                            <div id="cardPreviewContainer">
                                <div class="empty-preview">
                                    <i class="fas fa-credit-card fa-3x"></i>
                                    <p>اختر المستثمر لمعاينة البطاقة</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> إنشاء البطاقة
                            </button>
                            <button type="reset" class="btn btn-light">
                                <i class="fas fa-redo"></i> إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div id="card-stats-page" class="page">
                <div class="header">
                    <h1 class="page-title">إحصائيات البطاقات</h1>
                </div>
                <div id="statsContainer">
                    <div class="empty-state">
                        <i class="fas fa-chart-pie fa-3x"></i>
                        <h3>لا توجد إحصائيات</h3>
                        <p>ستظهر الإحصائيات بعد إنشاء البطاقات.</p>
                    </div>
                </div>
            </div>
            
            <div id="card-detail-page" class="page">
                <div class="header">
                    <h1 class="page-title">تفاصيل البطاقة</h1>
                    <div class="header-actions">
                        <button class="btn btn-light" onclick="showCardPage('investor-cards')">
                            <i class="fas fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>
                <div id="cardDetailContainer"></div>
            </div>
        `;
        
        content.insertAdjacentHTML('beforeend', cardPagesHTML);
        console.log('تم إضافة صفحات البطاقات بنجاح');
    }
    
    // التنفيذ
    setTimeout(function() {
        addCardMenuItems();
        addCardPages();
        
        // تهيئة النظام إذا كان متاحاً
        if (typeof InvestorCardSystem !== 'undefined') {
            InvestorCardSystem.init();
            console.log('تم تهيئة نظام البطاقات بنجاح');
        } else {
            console.error('نظام البطاقات غير متاح');
        }
    }, 1000);
});