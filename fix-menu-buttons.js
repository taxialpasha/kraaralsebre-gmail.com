/**
 * إصلاح مشكلة اختفاء الأزرار والقائمة الجانبية
 * ضع هذا الكود في نهاية صفحتك أو في ملف JavaScript منفصل ثم استدعه
 */

(function() {
    // انتظر تحميل النافذة بالكامل
    window.addEventListener('load', function() {
        console.log('بدء إصلاح مشكلة اختفاء الأزرار...');
        
        // إصلاح القائمة الجانبية
        fixSidebar();
        
        // إصلاح الأزرار في الواجهة الرئيسية
        fixButtons();
        
        // إعادة تهيئة نظام البطاقات
        reinitializeCardSystem();
        
        console.log('تم الانتهاء من إصلاح المشكلة');
    });
    
    /**
     * إصلاح القائمة الجانبية
     */
    function fixSidebar() {
        // التحقق من وجود القائمة الجانبية
        const sidebar = document.querySelector('.sidebar-menu');
        if (!sidebar) {
            console.error('لم يتم العثور على القائمة الجانبية');
            createSidebarIfNeeded();
            return;
        }
        
        // التحقق من وجود عناصر قائمة البطاقات
        const cardMenuItems = sidebar.querySelectorAll('.menu-item[onclick*="investor-cards"]');
        if (cardMenuItems.length === 0) {
            // إضافة عناصر قائمة البطاقات
            const cardMenuHTML = `
                <div class="menu-category">بطاقات المستثمرين</div>
                <a href="#investor-cards" class="menu-item" onclick="showPage('investor-cards-page')">
                    <span class="menu-icon"><i class="fas fa-id-card"></i></span>
                    <span>كل البطاقات</span>
                </a>
                <a href="#active-cards" class="menu-item" onclick="showPage('active-cards-page')">
                    <span class="menu-icon"><i class="fas fa-check-circle"></i></span>
                    <span>البطاقات النشطة</span>
                </a>
                <a href="#expired-cards" class="menu-item" onclick="showPage('expired-cards-page')">
                    <span class="menu-icon"><i class="fas fa-times-circle"></i></span>
                    <span>البطاقات المنتهية</span>
                </a>
                <a href="#barcode-scanner" class="menu-item" onclick="showPage('barcode-scanner-page')">
                    <span class="menu-icon"><i class="fas fa-qrcode"></i></span>
                    <span>مسح الباركود</span>
                </a>
                <a href="#new-card" class="menu-item" onclick="showPage('new-card-page')">
                    <span class="menu-icon"><i class="fas fa-plus-circle"></i></span>
                    <span>بطاقة جديدة</span>
                </a>
                <a href="#card-stats" class="menu-item" onclick="showPage('card-stats-page')">
                    <span class="menu-icon"><i class="fas fa-chart-pie"></i></span>
                    <span>إحصائيات البطاقات</span>
                </a>
            `;
            
            // إضافة عناصر القائمة
            const systemCategory = sidebar.querySelector('.menu-category:nth-last-child(2)');
            if (systemCategory) {
                systemCategory.insertAdjacentHTML('beforebegin', cardMenuHTML);
            } else {
                sidebar.insertAdjacentHTML('beforeend', cardMenuHTML);
            }
            
            console.log('تمت إضافة عناصر قائمة البطاقات');
        } else {
            // تأكد من أن العناصر مرئية
            cardMenuItems.forEach(item => {
                item.style.display = 'flex';
            });
            
            // حدث أحداث النقر
            cardMenuItems.forEach(item => {
                item.onclick = function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                    showPage(pageId);
                };
            });
            
            console.log('تم إصلاح عناصر قائمة البطاقات');
        }
    }
    
    /**
     * إنشاء شريط جانبي إذا لم يكن موجودًا
     */
    function createSidebarIfNeeded() {
        if (document.querySelector('.sidebar-menu')) return;
        
        // إنشاء شريط جانبي
        const sidebarHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <h2>نظام الاستثمار</h2>
                </div>
                <div class="sidebar-menu">
                    <div class="menu-category">لوحة التحكم</div>
                    <a href="#dashboard" class="menu-item" onclick="showPage('dashboard-page')">
                        <span class="menu-icon"><i class="fas fa-tachometer-alt"></i></span>
                        <span>لوحة التحكم</span>
                    </a>
                    
                    <div class="menu-category">بطاقات المستثمرين</div>
                    <a href="#investor-cards" class="menu-item" onclick="showPage('investor-cards-page')">
                        <span class="menu-icon"><i class="fas fa-id-card"></i></span>
                        <span>كل البطاقات</span>
                    </a>
                    <a href="#active-cards" class="menu-item" onclick="showPage('active-cards-page')">
                        <span class="menu-icon"><i class="fas fa-check-circle"></i></span>
                        <span>البطاقات النشطة</span>
                    </a>
                    <a href="#expired-cards" class="menu-item" onclick="showPage('expired-cards-page')">
                        <span class="menu-icon"><i class="fas fa-times-circle"></i></span>
                        <span>البطاقات المنتهية</span>
                    </a>
                    <a href="#barcode-scanner" class="menu-item" onclick="showPage('barcode-scanner-page')">
                        <span class="menu-icon"><i class="fas fa-qrcode"></i></span>
                        <span>مسح الباركود</span>
                    </a>
                    <a href="#new-card" class="menu-item" onclick="showPage('new-card-page')">
                        <span class="menu-icon"><i class="fas fa-plus-circle"></i></span>
                        <span>بطاقة جديدة</span>
                    </a>
                    <a href="#card-stats" class="menu-item" onclick="showPage('card-stats-page')">
                        <span class="menu-icon"><i class="fas fa-chart-pie"></i></span>
                        <span>إحصائيات البطاقات</span>
                    </a>
                    
                    <div class="menu-category">النظام</div>
                    <a href="#settings" class="menu-item" onclick="showPage('settings-page')">
                        <span class="menu-icon"><i class="fas fa-cog"></i></span>
                        <span>الإعدادات</span>
                    </a>
                </div>
            </div>
        `;
        
        // إضافة الشريط الجانبي
        const container = document.querySelector('.container') || document.body;
        container.insertAdjacentHTML('afterbegin', sidebarHTML);
        
        // إضافة أنماط CSS للشريط الجانبي
        const style = document.createElement('style');
        style.innerHTML = `
            .sidebar {
                width: 250px;
                height: 100vh;
                background-color: #2c3e50;
                color: white;
                position: fixed;
                top: 0;
                right: 0;
                overflow-y: auto;
                z-index: 1000;
            }
            
            .sidebar-header {
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #34495e;
            }
            
            .sidebar-header h2 {
                margin: 0;
                font-size: 1.5rem;
                color: white;
            }
            
            .sidebar-menu {
                padding: 20px 0;
            }
            
            .menu-category {
                padding: 10px 20px;
                font-size: 0.9rem;
                color: #bdc3c7;
                text-transform: uppercase;
                font-weight: bold;
                margin-top: 10px;
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                padding: 10px 20px;
                color: #ecf0f1;
                text-decoration: none;
                transition: all 0.3s;
            }
            
            .menu-item:hover, .menu-item.active {
                background-color: #34495e;
            }
            
            .menu-icon {
                margin-left: 10px;
                width: 20px;
                text-align: center;
            }
            
            .content {
                margin-right: 250px;
                padding: 20px;
                min-height: 100vh;
            }
            
            @media (max-width: 768px) {
                .sidebar {
                    width: 200px;
                }
                
                .content {
                    margin-right: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        console.log('تم إنشاء الشريط الجانبي');
    }
    
    /**
     * إصلاح الأزرار في الواجهة الرئيسية
     */
    function fixButtons() {
        // إصلاح أزرار البحث
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            if (input.style.display === 'none') {
                input.style.display = 'block';
            }
            
            // تحديث حدث البحث
            input.oninput = function() {
                if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.handleSearch === 'function') {
                    // تحديد نوع الفلتر من parent container
                    let filter = 'all';
                    if (input.closest('#active-cards-page')) {
                        filter = 'active';
                    } else if (input.closest('#expired-cards-page')) {
                        filter = 'expired';
                    }
                    
                    InvestorCardSystem.handleSearch(this.value, filter);
                }
            };
        });
        
        // إصلاح أزرار الإجراءات
        const actionButtons = document.querySelectorAll('.btn');
        actionButtons.forEach(button => {
            if (button.style.display === 'none') {
                button.style.display = 'inline-block';
            }
            
            // تأكد من وجود حدث النقر
            if (button.getAttribute('onclick')) {
                const onclickValue = button.getAttribute('onclick');
                button.onclick = function(e) {
                    e.preventDefault();
                    eval(onclickValue);
                };
            }
        });
        
        // إصلاح زر الإضافة العائم
        const floatingButton = document.querySelector('.floating-add-button');
        if (!floatingButton) {
            // إنشاء زر الإضافة العائم
            const buttonHTML = `
                <div class="floating-add-button" onclick="showPage('new-card-page')">
                    <i class="fas fa-plus"></i>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', buttonHTML);
            
            // إضافة أنماط CSS للزر
            const style = document.createElement('style');
            style.innerHTML = `
                .floating-add-button {
                    position: fixed;
                    bottom: 30px;
                    left: 30px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #007bff;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 1000;
                }
                
                .floating-add-button:hover {
                    transform: scale(1.1);
                    background: #0056b3;
                }
            `;
            
            document.head.appendChild(style);
            
            console.log('تم إنشاء زر الإضافة العائم');
        } else if (floatingButton.style.display === 'none') {
            floatingButton.style.display = 'flex';
        }
    }
    
    /**
     * إعادة تهيئة نظام البطاقات
     */
    function reinitializeCardSystem() {
        // التحقق من وجود نظام البطاقات
        if (typeof InvestorCardSystem === 'undefined') {
            console.error('نظام البطاقات غير موجود');
            return;
        }
        
        // إعادة تعريف دالة showPage
        window.showPage = function(pageId) {
            console.log('الانتقال إلى الصفحة:', pageId);
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            
            // إزالة الفئة النشطة من جميع عناصر القائمة
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // عرض الصفحة المطلوبة
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.style.display = 'block';
                
                // تفعيل عنصر القائمة المناسب
                const menuItem = document.querySelector(`.menu-item[onclick*="${pageId}"]`);
                if (menuItem) {
                    menuItem.classList.add('active');
                }
                
                // تنفيذ إجراءات خاصة بالصفحة
                switch (pageId) {
                    case 'investor-cards-page':
                        InvestorCardSystem.renderCards('all');
                        break;
                    case 'active-cards-page':
                        InvestorCardSystem.renderCards('active');
                        break;
                    case 'expired-cards-page':
                        InvestorCardSystem.renderCards('expired');
                        break;
                    case 'barcode-scanner-page':
                        InvestorCardSystem.initBarcodeScanner();
                        break;
                    case 'new-card-page':
                        InvestorCardSystem.updateInvestorSelect();
                        InvestorCardSystem.updateCardPreview();
                        break;
                    case 'card-stats-page':
                        InvestorCardSystem.renderCardStats();
                        break;
                }
            } else {
                console.error('الصفحة غير موجودة:', pageId);
            }
        };
        
        // تحديث أنماط CSS لعرض البطاقات
        const cardsGrids = document.querySelectorAll('.cards-grid');
        cardsGrids.forEach(grid => {
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
            grid.style.gap = '20px';
            grid.style.padding = '20px';
        });
        
        // تحديث طريقة عرض الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        // عرض الصفحة الرئيسية
        const homePage = document.getElementById('investor-cards-page');
        if (homePage) {
            homePage.style.display = 'block';
            
            // تنشيط عنصر القائمة
            const homeMenuItem = document.querySelector('.menu-item[onclick*="investor-cards-page"]');
            if (homeMenuItem) {
                homeMenuItem.classList.add('active');
            }
            
            // عرض البطاقات
            InvestorCardSystem.renderCards('all');
        } else {
            // إنشاء صفحات النظام إذا لم تكن موجودة
            createSystemPages();
        }
    }
    
    /**
     * إنشاء صفحات النظام إذا لم تكن موجودة
     */
    function createSystemPages() {
        // التحقق من وجود منطقة المحتوى
        let content = document.querySelector('.content');
        if (!content) {
            content = document.createElement('div');
            content.className = 'content';
            document.body.appendChild(content);
        }
        
        // إنشاء صفحات النظام
        const pagesHTML = `
            <!-- صفحة جميع البطاقات -->
            <div id="investor-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">بطاقات المستثمرين</h1>
                    <div class="header-actions">
                        <div class="search-bar">
                            <input type="text" class="search-input" placeholder="بحث عن بطاقة..." 
                                   oninput="InvestorCardSystem.handleSearch(this.value)">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <select class="form-select" onchange="InvestorCardSystem.filterByType(this.value)">
                            <option value="all">جميع الأنواع</option>
                            ${InvestorCardSystem.cardTypes ? InvestorCardSystem.cardTypes.map(type => `
                                <option value="${type.value}">${type.name}</option>
                            `).join('') : ''}
                        </select>
                        <button class="btn btn-primary" onclick="showPage('new-card-page')">
                            <i class="fas fa-plus"></i> بطاقة جديدة
                        </button>
                    </div>
                </div>
                <div class="cards-grid" id="cardsGrid"></div>
            </div>
            
            <!-- صفحة البطاقات النشطة -->
            <div id="active-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">البطاقات النشطة</h1>
                    <div class="header-actions">
                        <div class="search-bar">
                            <input type="text" class="search-input" placeholder="بحث عن بطاقة..." 
                                   oninput="InvestorCardSystem.handleSearch(this.value, 'active')">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button class="btn btn-primary" onclick="showPage('new-card-page')">
                            <i class="fas fa-plus"></i> بطاقة جديدة
                        </button>
                    </div>
                </div>
                <div class="cards-grid" id="activeCardsGrid"></div>
            </div>
            
            <!-- صفحة البطاقات المنتهية -->
            <div id="expired-cards-page" class="page">
                <div class="header">
                    <h1 class="page-title">البطاقات المنتهية</h1>
                    <div class="header-actions">
                        <div class="search-bar">
                            <input type="text" class="search-input" placeholder="بحث عن بطاقة..." 
                                   oninput="InvestorCardSystem.handleSearch(this.value, 'expired')">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button class="btn btn-warning" onclick="InvestorCardSystem.renewAllExpired()">
                            <i class="fas fa-redo"></i> تجديد الكل
                        </button>
                    </div>
                </div>
                <div class="cards-grid" id="expiredCardsGrid"></div>
            </div>
            
            <!-- صفحة ماسح الباركود -->
            <div id="barcode-scanner-page" class="page">
                <div class="header">
                    <h1 class="page-title">مسح الباركود</h1>
                </div>
                <div class="scanner-container">
                    <div id="reader"></div>
                    <div class="manual-search">
                        <h3>أو ابحث يدوياً</h3>
                        <div class="search-bar">
                            <input type="text" class="form-control" id="manualSearchInput" placeholder="أدخل رقم البطاقة">
                            <button class="btn btn-primary" onclick="InvestorCardSystem.manualSearch()">
                                <i class="fas fa-search"></i> بحث
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- صفحة إنشاء بطاقة جديدة -->
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
                                <select class="form-select" name="investorSelect" required onchange="InvestorCardSystem.updateCardPreview()">
                                    <option value="">اختر المستثمر</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>خصائص البطاقة</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">نوع البطاقة</label>
                                    <select class="form-select" name="cardType" onchange="InvestorCardSystem.updateCardPreview()">
                                        ${InvestorCardSystem.cardTypes ? InvestorCardSystem.cardTypes.map(type => `
                                            <option value="${type.value}" ${type.value === InvestorCardSystem.settings?.defaultCardType ? 'selected' : ''}>
                                                ${type.name}
                                            </option>
                                        `).join('') : '<option value="platinum">بلاتينية</option>'}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">مدة الصلاحية</label>
                                    <select class="form-select" name="cardValidity" onchange="InvestorCardSystem.updateCardPreview()">
                                        <option value="1">سنة واحدة</option>
                                        <option value="2">سنتان</option>
                                        <option value="3" selected>3 سنوات</option>
                                        <option value="5">5 سنوات</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasQRCode" onchange="InvestorCardSystem.updateCardPreview()">
                                    <span>إضافة QR Code</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasChip" checked onchange="InvestorCardSystem.updateCardPreview()">
                                    <span>شريحة ذكية</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasHologram" onchange="InvestorCardSystem.updateCardPreview()">
                                    <span>هولوغرام</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="hasPINCode" onchange="InvestorCardSystem.updateCardPreview()">
                                    <span>رقم PIN</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>معاينة البطاقة</h3>
                            <div id="cardPreviewContainer"></div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> إنشاء البطاقة
                            </button>
                            <button type="reset" class="btn btn-light" onclick="InvestorCardSystem.updateCardPreview()">
                                <i class="fas fa-redo"></i> إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- صفحة إحصائيات البطاقات -->
            <div id="card-stats-page" class="page">
                <div class="header">
                    <h1 class="page-title">إحصائيات البطاقات</h1>
                    <div class="header-actions">
                        <button class="btn btn-light" onclick="InvestorCardSystem.exportStats()">
                            <i class="fas fa-file-export"></i> تصدير التقرير
                        </button>
                    </div>
                </div>
                <div id="statsContainer"></div>
            </div>
            
            <!-- صفحة تفاصيل البطاقة -->
            <div id="card-detail-page" class="page">
                <div class="header">
                    <h1 class="page-title">تفاصيل البطاقة</h1>
                    <div class="header-actions">
                        <button class="btn btn-light" onclick="showPage('investor-cards-page')">
                            <i class="fas fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>
                <div id="cardDetailContainer"></div>
            </div>
        `;
        
        content.innerHTML = pagesHTML;
        
        // إضافة أنماط CSS للصفحات
        const pagesStyle = document.createElement('style');
        pagesStyle.innerHTML = `
            .page {
                display: none;
                padding: 20px;
            }
            
            .page.active {
                display: block;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .page-title {
                margin: 0;
                font-size: 1.8rem;
                color: #343a40;
            }
            
            .header-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .search-bar {
                position: relative;
            }
            
            .search-input {
                padding: 8px 15px;
                padding-left: 35px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                width: 200px;
            }
            
            .search-icon {
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }
            
            .form-select {
                padding: 8px;
                border: 1px solid #ced4da;
                border-radius: 4px;
            }
            
            .btn {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .btn i {
                margin-left: 5px;
            }
            
            .btn-primary {
                background-color: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background-color: #0069d9;
            }
            
            .btn-light {
                background-color: #f8f9fa;
                color: #212529;
            }
            
            .btn-light:hover {
                background-color: #e2e6ea;
            }
            
            .btn-warning {
                background-color: #ffc107;
                color: #212529;
            }
            
            .btn-warning:hover {
                background-color: #e0a800;
            }
            
            .btn-danger {
                background-color: #dc3545;
                color: white;
            }
            
            .btn-danger:hover {
                background-color: #c82333;
            }
            
            .empty-state {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }
            
            .empty-state i {
                font-size: 3rem;
                color: #dee2e6;
                margin-bottom: 20px;
            }
            
            .empty-state h3 {
                margin-bottom: 10px;
                color: #495057;
            }
            
            .empty-state p {
                margin-bottom: 20px;
                color: #6c757d;
            }
        `;
        
        document.head.appendChild(pagesStyle);
        
        console.log('تم إنشاء صفحات النظام');
        
        // عرض الصفحة الرئيسية
        const homePage = document.getElementById('investor-cards-page');
        if (homePage) {
            homePage.style.display = 'block';
            
            // تنشيط عنصر القائمة
            const homeMenuItem = document.querySelector('.menu-item[onclick*="investor-cards-page"]');
            if (homeMenuItem) {
                homeMenuItem.classList.add('active');
            }
            
            // عرض البطاقات
            if (typeof InvestorCardSystem !== 'undefined' && typeof InvestorCardSystem.renderCards === 'function') {
                InvestorCardSystem.renderCards('all');
            }
        }
    }
    
    /**
     * تأكد من تحميل Font Awesome
     */
    function ensureFontAwesome() {
        if (document.querySelector('link[href*="fontawesome"]')) {
            return; // Font Awesome موجود بالفعل
        }
        
        // إضافة Font Awesome
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(link);
        
        console.log('تم إضافة Font Awesome');
    }
    
    // تأكد من تحميل Font Awesome
    ensureFontAwesome();
})();
