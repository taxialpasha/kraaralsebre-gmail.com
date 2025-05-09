/**
 * نظام بطاقات المستثمرين المتكامل - الإصدار المحسن
 * @version 2.0.0
 * @description نظام متكامل لإدارة بطاقات المستثمرين مع إصلاح مشاكل النقر المزدوج وأخطاء إنشاء البطاقات
 */

const InvestorCardSystem = (function() {
    // المتغيرات الخاصة بالنظام
    let cards = [];
    let activities = [];
    let settings = {
        defaultCardType: 'platinum',
        defaultYears: 3,
        printOptions: {
            size: 'credit',
            dpi: 300,
            sides: 'both'
        },
        scannerOptions: {
            sound: true,
            vibrate: true,
            continuous: false
        },
        darkMode: false
    };
    
    // أنواع البطاقات المتاحة
    const cardTypes = [
        {
            value: 'platinum',
            name: 'بلاتينية',
            description: 'بطاقة بلاتينية مع مزايا حصرية',
            colors: {
                primary: '#1a1a2e',
                gradient: '#16213e',
                text: '#ffffff',
                chip: '#f4a261'
            }
        },
        {
            value: 'gold',
            name: 'ذهبية',
            description: 'بطاقة ذهبية مع مزايا متميزة',
            colors: {
                primary: '#ff9a00',
                gradient: '#ff6c00',
                text: '#000000',
                chip: '#333333'
            }
        },
        {
            value: 'premium',
            name: 'بريميوم',
            description: 'بطاقة بريميوم للمستثمرين المميزين',
            colors: {
                primary: '#2c3e50',
                gradient: '#3498db',
                text: '#ffffff',
                chip: '#ecf0f1'
            }
        },
        {
            value: 'diamond',
            name: 'ماسية',
            description: 'بطاقة ماسية للنخبة',
            colors: {
                primary: '#e0f7fa',
                gradient: '#80deea',
                text: '#000000',
                chip: '#006064'
            }
        },
        {
            value: 'islamic',
            name: 'إسلامية',
            description: 'بطاقة متوافقة مع الشريعة الإسلامية',
            colors: {
                primary: '#1b5e20',
                gradient: '#66bb6a',
                text: '#ffffff',
                chip: '#ffc107'
            }
        },
        {
            value: 'custom',
            name: 'مخصصة',
            description: 'بطاقة مخصصة حسب الطلب',
            colors: {
                primary: '#6c757d',
                gradient: '#adb5bd',
                text: '#000000',
                chip: '#343a40'
            }
        }
    ];
    
    /**
     * دالة توليد رقم البطاقة مع خوارزمية Luhn
     * @returns {string} رقم بطاقة صحيح من 16 رقم
     */
    function generateCardNumber() {
        const prefix = "529987"; // البادئة المخصصة
        let randomDigits = "";
        
        for(let i = 0; i < 9; i++) {
            randomDigits += Math.floor(Math.random() * 10);
        }
        
        const partialNumber = prefix + randomDigits;
        const checkDigit = calculateLuhnCheckDigit(partialNumber);
        
        return partialNumber + checkDigit;
    }
    
    /**
     * حساب رقم التحقق وفق خوارزمية Luhn
     * @param {string} partialNumber - رقم البطاقة الجزئي
     * @returns {number} رقم التحقق
     */
    function calculateLuhnCheckDigit(partialNumber) {
        let sum = 0;
        let isEven = false;
        
        for(let i = partialNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(partialNumber[i]);
            
            if(isEven) {
                digit *= 2;
                if(digit > 9) {
                    digit = digit - 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return (10 - (sum % 10)) % 10;
    }
    
    /**
     * التحقق من صحة رقم البطاقة
     * @param {string} cardNumber - رقم البطاقة للتحقق
     * @returns {boolean} النتيجة
     */
    function validateCardNumber(cardNumber) {
        if(!/^\d{16}$/.test(cardNumber)) return false;
        
        let sum = 0;
        let isEven = false;
        
        for(let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if(isEven) {
                digit *= 2;
                if(digit > 9) {
                    digit = digit - 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    /**
     * تنسيق رقم البطاقة بإضافة مسافات
     * @param {string} cardNumber - رقم البطاقة
     * @returns {string} رقم البطاقة المنسّق
     */
    function formatCardNumber(cardNumber) {
        if (!cardNumber) return "0000 0000 0000 0000";
        return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    /**
     * توليد رقم CVV للبطاقة
     * @returns {string} رقم CVV من 3 أرقام
     */
    function generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }
    
    /**
     * توليد رقم PIN للبطاقة
     * @returns {string} رقم PIN من 4 أرقام
     */
    function generatePIN() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    /**
     * حساب تاريخ انتهاء البطاقة
     * @param {number} yearsToAdd - عدد السنوات
     * @returns {string} تاريخ الانتهاء بصيغة MM/YY
     */
    function calculateExpiryDate(yearsToAdd = settings.defaultYears) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + yearsToAdd);
        
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        
        return `${month}/${year}`;
    }
    
    /**
     * توليد معرّف فريد
     * @returns {string} معرّف فريد
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * تنسيق التاريخ
     * @param {string} dateString - سلسلة التاريخ
     * @returns {string} التاريخ المنسّق
     */
    function formatDate(dateString) {
        if (!dateString) return "غير محدد";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-IQ');
        } catch (error) {
            return dateString;
        }
    }
    
    /**
     * تنسيق الوقت
     * @param {string} dateString - سلسلة التاريخ والوقت
     * @returns {string} الوقت المنسّق
     */
    function formatTime(dateString) {
        if (!dateString) return "";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('ar-IQ');
        } catch (error) {
            return "";
        }
    }
    
    /**
     * تحميل البطاقات من التخزين المحلي
     * @returns {boolean} نجاح العملية
     */
    function loadCards() {
        console.log('جاري تحميل البطاقات...');
        
        try {
            const savedCards = localStorage.getItem('investorCards');
            if (savedCards) {
                cards = JSON.parse(savedCards);
                console.log(`تم تحميل ${cards.length} بطاقة من التخزين المحلي`);
                return true;
            } else {
                console.log('لم يتم العثور على بطاقات مخزنة');
                cards = [];
                return true;
            }
        } catch (error) {
            console.error('خطأ في تحميل البطاقات:', error);
            cards = [];
            return false;
        }
    }
    
    /**
     * حفظ البطاقات في التخزين المحلي
     * @returns {boolean} نجاح العملية
     */
    function saveCards() {
        console.log('جاري حفظ البطاقات...');
        
        try {
            localStorage.setItem('investorCards', JSON.stringify(cards));
            console.log(`تم حفظ ${cards.length} بطاقة في التخزين المحلي`);
            
            // مزامنة مع Firebase إذا كان متاحاً
            if (window.firebase && window.firebase.database && window.firebaseApp && window.firebaseApp.user) {
                try {
                    firebase.database().ref('investorCards').set(cards);
                    console.log('تمت المزامنة مع Firebase');
                } catch (fbError) {
                    console.error('خطأ في المزامنة مع Firebase:', fbError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البطاقات:', error);
            // محاولة حفظ بديلة
            try {
                for (let i = 0; i < cards.length; i++) {
                    localStorage.setItem(`card_${i}`, JSON.stringify(cards[i]));
                }
                localStorage.setItem('cardsCount', cards.length.toString());
                console.log('تم حفظ البطاقات بطريقة بديلة');
                return true;
            } catch (backupError) {
                console.error('فشل الحفظ البديل للبطاقات:', backupError);
                return false;
            }
        }
    }
    
    /**
     * تحميل الأنشطة من التخزين المحلي
     * @returns {boolean} نجاح العملية
     */
    function loadActivities() {
        try {
            const savedActivities = localStorage.getItem('cardActivities');
            if (savedActivities) {
                activities = JSON.parse(savedActivities);
                return true;
            } else {
                activities = [];
                return true;
            }
        } catch (error) {
            console.error('خطأ في تحميل الأنشطة:', error);
            activities = [];
            return false;
        }
    }
    
    /**
     * حفظ الأنشطة في التخزين المحلي
     * @returns {boolean} نجاح العملية
     */
    function saveActivities() {
        try {
            localStorage.setItem('cardActivities', JSON.stringify(activities));
            
            // مزامنة مع Firebase إذا كان متاحاً
            if (window.firebase && window.firebase.database && window.firebaseApp && window.firebaseApp.user) {
                try {
                    firebase.database().ref('cardActivities').set(activities);
                } catch (fbError) {
                    console.error('خطأ في مزامنة الأنشطة مع Firebase:', fbError);
                }
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الأنشطة:', error);
            return false;
        }
    }
    
    /**
     * تسجيل نشاط جديد
     * @param {string} action - نوع النشاط
     * @param {object} card - البطاقة المتعلقة بالنشاط
     * @param {object} details - تفاصيل إضافية
     * @returns {object} كائن النشاط
     */
    function recordActivity(action, card, details = {}) {
        if (!card) {
            console.error('معلومات البطاقة غير متوفرة لتسجيل النشاط');
            return null;
        }
        
        const activity = {
            id: generateId(),
            action: action,
            cardId: card.id,
            investorId: card.investorId,
            investorName: card.investorName || 'غير معروف',
            timestamp: new Date().toISOString(),
            details: details
        };
        
        activities.unshift(activity);
        saveActivities();
        
        return activity;
    }
    
    /**
     * التحقق من انتهاء صلاحية البطاقة
     * @param {object} card - البطاقة المراد فحصها
     * @returns {boolean} نتيجة الفحص
     */
    function isExpired(card) {
        if (!card || !card.expiryDate) return false;
        
        const [month, year] = card.expiryDate.split('/');
        const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
        const today = new Date();
        
        return expiryDate < today;
    }
    
    /**
     * إنشاء بطاقة جديدة
     * @param {string} investorId - معرّف المستثمر
     * @param {string} cardType - نوع البطاقة
     * @param {object} options - خيارات إضافية
     * @returns {object} البطاقة المنشأة
     */
    function createCard(investorId, cardType = settings.defaultCardType, options = {}) {
        console.log('إنشاء بطاقة جديدة:', { investorId, cardType, options });
        
        // التحقق من وجود المستثمر
        if (!window.investors || !Array.isArray(window.investors)) {
            console.error('بيانات المستثمرين غير متوفرة');
            throw new Error('بيانات المستثمرين غير متوفرة');
        }
        
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            console.error('المستثمر غير موجود:', investorId);
            throw new Error('المستثمر غير موجود');
        }
        
        // التحقق من نوع البطاقة
        const cardTypeObj = cardTypes.find(t => t.value === cardType);
        if (!cardTypeObj) {
            console.error('نوع البطاقة غير صالح:', cardType);
            cardType = settings.defaultCardType;
        }
        
        // إنشاء كائن البطاقة
        const cardId = generateId();
        const card = {
            id: cardId,
            cardNumber: generateCardNumber(),
            cardType: cardType,
            investorId: investorId,
            investorName: investor.name,
            expiryDate: calculateExpiryDate(options.years || settings.defaultYears),
            cvv: generateCVV(),
            status: 'active',
            issueDate: new Date().toISOString().split('T')[0],
            lastUsed: null,
            hasQRCode: options.hasQRCode || false,
            hasChip: options.hasChip !== undefined ? options.hasChip : true,
            hasHologram: options.hasHologram || false,
            pinCode: options.hasPINCode ? generatePIN() : null,
            cardColors: cardTypeObj.colors
        };
        
        // إضافة البطاقة إلى المصفوفة
        cards.push(card);
        
        // حفظ البطاقات
        saveCards();
        
        // تسجيل نشاط
        recordActivity('create', card);
        
        console.log('تم إنشاء البطاقة بنجاح:', card.id);
        
        return card;
    }
    
    /**
     * إنشاء إشعار للمستخدم
     * @param {string} title - عنوان الإشعار
     * @param {string} message - نص الإشعار
     * @param {string} type - نوع الإشعار (success, danger, warning, info)
     */
    function createNotification(title, message, type = 'info') {
        // استخدام دالة الإشعارات من النظام الرئيسي إذا كانت متاحة
        if (typeof window.createNotification === 'function') {
            window.createNotification(title, message, type);
            return;
        }
        
        // إنشاء إشعار بديل
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        notification.style.borderRadius = '5px';
        notification.style.padding = '15px';
        
        notification.innerHTML = `
            <div class="alert-icon" style="float: right; margin-left: 15px;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}-circle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title" style="font-weight: bold;">${title}</div>
                <div class="alert-text">${message}</div>
            </div>
            <div style="position: absolute; top: 10px; left: 10px; cursor: pointer;" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار تلقائياً بعد 3 ثوانٍ
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
    
    /**
     * عرض HTML البطاقة
     * @param {object} card - بيانات البطاقة
     * @param {boolean} showBack - عرض الوجه الخلفي
     * @returns {string} HTML البطاقة
     */
    function renderCard(card, showBack = false) {
        if (!card) {
            console.error('بيانات البطاقة غير متوفرة للعرض');
            return '';
        }
        
        const cardType = cardTypes.find(t => t.value === card.cardType) || cardTypes[0];
        const colors = card.cardColors || cardType.colors;
        
        return `
            <div class="investor-card ${card.cardType} ${showBack ? 'flipped' : ''}" data-card-id="${card.id}">
                <div class="card-inner">
                    <div class="card-front" style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.gradient} 100%);">
                        <div class="card-background"></div>
                        ${card.hasChip ? '<div class="card-chip" style="background-color: ' + colors.chip + '"></div>' : ''}
                        ${card.hasHologram ? '<div class="card-hologram"></div>' : ''}
                        <div class="card-logo" style="color: ${colors.text}">شركة الاستثمار العراقية</div>
                        <div class="card-number" style="color: ${colors.text}">${formatCardNumber(card.cardNumber)}</div>
                        <div class="card-holder" style="color: ${colors.text}">
                            <div class="label">CARD HOLDER</div>
                            <div class="name">${card.investorName}</div>
                        </div>
                        <div class="card-expires" style="color: ${colors.text}">
                            <div class="label">EXPIRES</div>
                            <div class="date">${card.expiryDate}</div>
                        </div>
                        <div class="card-type-icon">
                            <i class="fas fa-credit-card" style="color: ${colors.text}"></i>
                        </div>
                    </div>
                    <div class="card-back">
                        <div class="magnetic-strip"></div>
                        <div class="signature-strip">
                            <div class="signature-area"></div>
                            <div class="cvv">${card.cvv}</div>
                        </div>
                        ${card.hasQRCode ? `
                            <div class="qr-code">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(JSON.stringify({
                                    cardNumber: card.cardNumber,
                                    investorId: card.investorId,
                                    type: card.cardType
                                }))}" alt="QR Code">
                            </div>
                        ` : ''}
                        <div class="card-info">
                            <p>للاستفسار: 07701234567</p>
                            <p>www.iraqinvest.com</p>
                            <p class="card-number-back">${formatCardNumber(card.cardNumber)}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * عرض البطاقات بناءً على معيار تصفية معين
     * @param {string} filter - معيار التصفية (all, active, expired)
     */
    function renderCards(filter = 'all') {
        console.log('عرض البطاقات:', filter);
        
        // تحديد العنصر المستهدف بناءً على الفلتر
        let gridId;
        
        switch (filter) {
            case 'active':
                gridId = 'activeCardsGrid';
                break;
            case 'expired':
                gridId = 'expiredCardsGrid';
                break;
            default:
                gridId = 'cardsGrid';
        }
        
        const cardsGrid = document.getElementById(gridId);
        if (!cardsGrid) {
            console.error('عنصر عرض البطاقات غير موجود:', gridId);
            return;
        }
        
        // تطبيق الفلتر
        let filteredCards = [...cards];
        
        if (filter === 'active') {
            filteredCards = cards.filter(card => card.status === 'active' && !isExpired(card));
        } else if (filter === 'expired') {
            filteredCards = cards.filter(card => isExpired(card));
        }
        
        // إذا لم توجد بطاقات
        if (filteredCards.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card fa-3x"></i>
                    <h3>لا توجد بطاقات</h3>
                    <p>لا توجد بطاقات ${
                        filter === 'active' ? 'نشطة' : 
                        filter === 'expired' ? 'منتهية الصلاحية' : ''
                    } في النظام.</p>
                    <button class="btn btn-primary" onclick="showPage('new-card-page')">
                        <i class="fas fa-plus"></i> إنشاء بطاقة جديدة
                    </button>
                </div>
            `;
            return;
        }
        
        // عرض البطاقات
        const cardsHTML = filteredCards.map(card => `
            <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
                ${renderCard(card)}
                <div class="card-info-overlay">
                    <h4>${card.investorName || 'غير معروف'}</h4>
                    <p>${cardTypes.find(t => t.value === card.cardType)?.name || card.cardType}</p>
                    <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                        ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                    </p>
                </div>
            </div>
        `).join('');
        
        cardsGrid.innerHTML = cardsHTML;
    }
    
    /**
     * عرض تفاصيل البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function viewCardDetails(cardId) {
        console.log('عرض تفاصيل البطاقة:', cardId);
        
        // البحث عن البطاقة
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            console.error('البطاقة غير موجودة:', cardId);
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        // تسجيل نشاط
        recordActivity('view', card);
        
        // الانتقال إلى صفحة التفاصيل
        showPage('card-detail-page');
        
        // عرض تفاصيل البطاقة
        const detailContainer = document.getElementById('cardDetailContainer');
        if (!detailContainer) {
            console.error('عنصر تفاصيل البطاقة غير موجود');
            return;
        }
        
        // البحث عن المستثمر
        let investor = null;
        if (window.investors && Array.isArray(window.investors)) {
            investor = window.investors.find(inv => inv.id === card.investorId);
        }
        
        // في حالة عدم العثور على المستثمر
        if (!investor) {
            investor = {
                name: card.investorName || 'غير معروف',
                phone: 'غير متوفر',
                email: 'غير متوفر',
                address: 'غير متوفر'
            };
        }
        
        // تحديد نوع البطاقة
        const cardTypeObj = cardTypes.find(t => t.value === card.cardType) || cardTypes[0];
        
        detailContainer.innerHTML = `
            <div class="card-detail-grid">
                <div class="card-preview-section">
                    <div class="card-preview-container">
                        ${renderCard(card)}
                        <div class="card-flip-button" onclick="InvestorCardSystem.flipCard('${card.id}')">
                            <i class="fas fa-sync-alt"></i> قلب البطاقة
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-primary" onclick="InvestorCardSystem.printCard('${card.id}')">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                        <button class="btn btn-success" onclick="InvestorCardSystem.shareCard('${card.id}')">
                            <i class="fas fa-share"></i> مشاركة
                        </button>
                        ${card.status === 'active' ? `
                            <button class="btn btn-warning" onclick="InvestorCardSystem.suspendCard('${card.id}')">
                                <i class="fas fa-pause"></i> إيقاف
                            </button>
                        ` : `
                            <button class="btn btn-success" onclick="InvestorCardSystem.activateCard('${card.id}')">
                                <i class="fas fa-play"></i> تفعيل
                            </button>
                        `}
                        ${isExpired(card) ? `
                            <button class="btn btn-info" onclick="InvestorCardSystem.renewCard('${card.id}')">
                                <i class="fas fa-redo"></i> تجديد
                            </button>
                        ` : ''}
                        <button class="btn btn-danger" onclick="InvestorCardSystem.deleteCard('${card.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                
                <div class="card-info-section">
                    <div class="info-card">
                        <h3>معلومات البطاقة</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>رقم البطاقة:</label>
                                <span>${formatCardNumber(card.cardNumber)}</span>
                            </div>
                            <div class="info-item">
                                <label>نوع البطاقة:</label>
                                <span>${cardTypeObj.name}</span>
                            </div>
                            <div class="info-item">
                                <label>تاريخ الإصدار:</label>
                                <span>${formatDate(card.issueDate)}</span>
                            </div>
                            <div class="info-item">
                                <label>تاريخ الانتهاء:</label>
                                <span>${card.expiryDate}</span>
                            </div>
                            <div class="info-item">
                                <label>الحالة:</label>
                                <span class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                                    ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                                </span>
                            </div>
                            ${card.pinCode ? `
                                <div class="info-item">
                                    <label>رقم PIN:</label>
                                    <span class="pin-code" id="pin-code-${card.id}">****</span>
                                    <button class="btn btn-sm btn-light" onclick="InvestorCardSystem.togglePIN('${card.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3>معلومات المستثمر</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>الاسم:</label>
                                <span>${investor.name}</span>
                            </div>
                            <div class="info-item">
                                <label>رقم الهاتف:</label>
                                <span>${investor.phone || 'غير متوفر'}</span>
                            </div>
                            <div class="info-item">
                                <label>البريد الإلكتروني:</label>
                                <span>${investor.email || 'غير متوفر'}</span>
                            </div>
                            <div class="info-item">
                                <label>العنوان:</label>
                                <span>${investor.address || 'غير متوفر'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3>سجل الأنشطة</h3>
                        <div class="activities-list">
                            ${getCardActivities(card.id)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * الحصول على أنشطة البطاقة
     * @param {string} cardId - معرّف البطاقة
     * @returns {string} HTML سجل الأنشطة
     */
    function getCardActivities(cardId) {
        const cardActivities = activities.filter(a => a.cardId === cardId).slice(0, 10);
        
        if (cardActivities.length === 0) {
            return '<div class="empty-activities">لا توجد أنشطة مسجلة</div>';
        }
        
        return cardActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.action}">
                    <i class="fas ${getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-action">${getActivityName(activity.action)}</div>
                    <div class="activity-time">${formatDate(activity.timestamp)} ${formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * الحصول على أيقونة النشاط
     * @param {string} action - نوع النشاط
     * @returns {string} صنف الأيقونة
     */
    function getActivityIcon(action) {
        const icons = {
            create: 'fa-plus-circle',
            view: 'fa-eye',
            print: 'fa-print',
            share: 'fa-share',
            suspend: 'fa-pause-circle',
            activate: 'fa-play-circle',
            renew: 'fa-redo',
            delete: 'fa-trash',
            scan: 'fa-qrcode',
            manual_search: 'fa-search',
            update: 'fa-edit'
        };
        
        return icons[action] || 'fa-circle';
    }
    
    /**
     * الحصول على اسم النشاط
     * @param {string} action - نوع النشاط
     * @returns {string} اسم النشاط
     */
    function getActivityName(action) {
        const names = {
            create: 'إنشاء بطاقة',
            view: 'عرض البطاقة',
            print: 'طباعة البطاقة',
            share: 'مشاركة البطاقة',
            suspend: 'إيقاف البطاقة',
            activate: 'تفعيل البطاقة',
            renew: 'تجديد البطاقة',
            delete: 'حذف البطاقة',
            scan: 'مسح QR Code',
            manual_search: 'بحث يدوي',
            update: 'تعديل البطاقة'
        };
        
        return names[action] || action;
    }
    
    /**
     * قلب البطاقة (عرض الوجه الآخر)
     * @param {string} cardId - معرّف البطاقة
     */
    function flipCard(cardId) {
        const cardElement = document.querySelector(`.investor-card[data-card-id="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.toggle('flipped');
        }
    }
    
    /**
     * إظهار/إخفاء رقم PIN
     * @param {string} cardId - معرّف البطاقة
     */
    function togglePIN(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card || !card.pinCode) return;
        
        const pinElement = document.getElementById(`pin-code-${cardId}`);
        if (!pinElement) return;
        
        if (pinElement.textContent === '****') {
            pinElement.textContent = card.pinCode;
        } else {
            pinElement.textContent = '****';
        }
    }
    
    /**
     * طباعة البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function printCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        recordActivity('print', card);
        
        // فتح نافذة الطباعة
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة البطاقة - ${card.investorName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    
                    ${getCardStyles()}
                    
                    .print-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;
                    }
                    
                    .print-options {
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    
                    .print-options button {
                        margin: 0 10px;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        background: #3498db;
                        color: white;
                        cursor: pointer;
                    }
                    
                    @media print {
                        .print-options {
                            display: none;
                        }
                        
                        body {
                            background: white;
                        }
                        
                        .investor-card {
                            width: 86mm !important;
                            height: 54mm !important;
                            margin: 0 auto;
                            page-break-after: always;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-options">
                    <button onclick="window.print()">طباعة</button>
                    <button onclick="printFrontOnly()">طباعة الوجه الأمامي فقط</button>
                    <button onclick="printBackOnly()">طباعة الوجه الخلفي فقط</button>
                </div>
                
                <div class="print-container">
                    <div id="frontCard">
                        ${renderCard(card, false)}
                    </div>
                    <div id="backCard">
                        ${renderCard(card, true)}
                    </div>
                </div>
                
                <script>
                    function printFrontOnly() {
                        document.getElementById('backCard').style.display = 'none';
                        window.print();
                        document.getElementById('backCard').style.display = 'block';
                    }
                    
                    function printBackOnly() {
                        document.getElementById('frontCard').style.display = 'none';
                        window.print();
                        document.getElementById('frontCard').style.display = 'block';
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        createNotification('نجاح', 'تم فتح نافذة الطباعة', 'success');
    }
    
    /**
     * مشاركة البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function shareCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        recordActivity('share', card);
        
        // بيانات المشاركة
        const shareData = {
            cardNumber: card.cardNumber,
            investorName: card.investorName,
            type: card.cardType,
            expiryDate: card.expiryDate,
            issuer: 'شركة الاستثمار العراقية'
        };
        
        // إنشاء نافذة المشاركة
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        modal.innerHTML = `
            <div class="modal" style="background: white; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 20px; position: relative;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h2 class="modal-title" style="margin: 0; font-size: 1.5rem;">مشاركة البطاقة</h2>
                    <div class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="share-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                        <div class="share-option" style="text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;" 
                             onclick="window.InvestorCardSystem.shareViaQR('${cardId}')">
                            <i class="fas fa-qrcode fa-3x" style="color: #3498db; margin-bottom: 10px;"></i>
                            <p style="margin: 0;">QR Code</p>
                        </div>
                        <div class="share-option" style="text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;" 
                             onclick="window.InvestorCardSystem.shareViaEmail('${cardId}')">
                            <i class="fas fa-envelope fa-3x" style="color: #3498db; margin-bottom: 10px;"></i>
                            <p style="margin: 0;">بريد إلكتروني</p>
                        </div>
                        <div class="share-option" style="text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;" 
                             onclick="window.InvestorCardSystem.shareViaText('${cardId}')">
                            <i class="fas fa-copy fa-3x" style="color: #3498db; margin-bottom: 10px;"></i>
                            <p style="margin: 0;">نسخ النص</p>
                        </div>
                        <div class="share-option" style="text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;" 
                             onclick="window.InvestorCardSystem.exportCardJSON('${cardId}')">
                            <i class="fas fa-file-export fa-3x" style="color: #3498db; margin-bottom: 10px;"></i>
                            <p style="margin: 0;">تصدير JSON</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * مشاركة البطاقة عبر رمز QR
     * @param {string} cardId - معرّف البطاقة
     */
    function shareViaQR(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }
        
        // إنشاء نافذة QR
        const qrModal = document.createElement('div');
        qrModal.className = 'modal-overlay active';
        qrModal.style.position = 'fixed';
        qrModal.style.top = '0';
        qrModal.style.left = '0';
        qrModal.style.right = '0';
        qrModal.style.bottom = '0';
        qrModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        qrModal.style.zIndex = '9999';
        qrModal.style.display = 'flex';
        qrModal.style.justifyContent = 'center';
        qrModal.style.alignItems = 'center';
        
        const qrData = JSON.stringify({
            cardNumber: card.cardNumber,
            investorId: card.investorId,
            investorName: card.investorName,
            type: card.cardType,
            expiryDate: card.expiryDate
        });
        
        qrModal.innerHTML = `
            <div class="modal" style="background: white; border-radius: 8px; width: 90%; max-width: 400px; padding: 20px; text-align: center;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h2 class="modal-title" style="margin: 0; font-size: 1.5rem;">مشاركة عبر QR Code</h2>
                    <div class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="qr-container" style="margin: 20px 0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" alt="QR Code">
                    </div>
                    <p>يمكن مسح رمز QR لمشاركة معلومات البطاقة</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(qrModal);
    }
    
    /**
     * مشاركة البطاقة عبر البريد الإلكتروني
     * @param {string} cardId - معرّف البطاقة
     */
    function shareViaEmail(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }
        
        const emailBody = `
            معلومات البطاقة:
            الاسم: ${card.investorName}
            رقم البطاقة: ${formatCardNumber(card.cardNumber)}
            نوع البطاقة: ${cardTypes.find(t => t.value === card.cardType)?.name || card.cardType}
            تاريخ الانتهاء: ${card.expiryDate}
            
            شركة الاستثمار العراقية
        `;
        
        const mailtoLink = `mailto:?subject=معلومات بطاقة المستثمر&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
        
        createNotification('نجاح', 'تم فتح تطبيق البريد الإلكتروني', 'success');
    }
    
    /**
     * مشاركة البطاقة عبر نسخ النص
     * @param {string} cardId - معرّف البطاقة
     */
    function shareViaText(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        const textToCopy = `
معلومات البطاقة:
الاسم: ${card.investorName}
رقم البطاقة: ${formatCardNumber(card.cardNumber)}
نوع البطاقة: ${cardTypes.find(t => t.value === card.cardType)?.name || card.cardType}
تاريخ الانتهاء: ${card.expiryDate}

شركة الاستثمار العراقية
        `.trim();
        
        // نسخ النص إلى الحافظة
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                createNotification('نجاح', 'تم نسخ معلومات البطاقة إلى الحافظة', 'success');
            } else {
                createNotification('خطأ', 'فشل نسخ المعلومات', 'danger');
            }
        } catch (err) {
            createNotification('خطأ', 'فشل نسخ المعلومات: ' + err, 'danger');
        }
        
        document.body.removeChild(textarea);
        
        // إغلاق النافذة المنبثقة
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }
    }
    
    /**
     * تصدير بيانات البطاقة بصيغة JSON
     * @param {string} cardId - معرّف البطاقة
     */
    function exportCardJSON(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        
        // إنشاء نسخة من بيانات البطاقة
        const cardData = { ...card };
        
        // حذف بعض البيانات الحساسة
        delete cardData.cvv;
        delete cardData.pinCode;
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(cardData, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `card_${card.id}.json`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // إغلاق النافذة المنبثقة
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.remove();
        }
        
        createNotification('نجاح', 'تم تصدير بيانات البطاقة بنجاح', 'success');
    }
    
    /**
     * إيقاف البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function suspendCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        card.status = 'suspended';
        saveCards();
        recordActivity('suspend', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم إيقاف البطاقة بنجاح', 'success');
    }
    
    /**
     * تفعيل البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function activateCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        card.status = 'active';
        saveCards();
        recordActivity('activate', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم تفعيل البطاقة بنجاح', 'success');
    }
    
    /**
     * تجديد البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function renewCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        card.expiryDate = calculateExpiryDate();
        card.status = 'active';
        saveCards();
        recordActivity('renew', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم تجديد البطاقة بنجاح', 'success');
    }
    
    /**
     * حذف البطاقة
     * @param {string} cardId - معرّف البطاقة
     */
    function deleteCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
            return;
        }
        
        if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }
        
        // تسجيل نشاط قبل الحذف
        recordActivity('delete', card);
        
        // حذف البطاقة
        cards = cards.filter(c => c.id !== cardId);
        saveCards();
        
        // العودة إلى صفحة البطاقات
        showPage('investor-cards-page');
        renderCards();
        
        createNotification('نجاح', 'تم حذف البطاقة بنجاح', 'success');
    }
    
    /**
     * تهيئة ماسح الباركود
     */
    function initBarcodeScanner() {
        const reader = document.getElementById('reader');
        if (!reader) {
            console.error('عنصر القارئ غير موجود');
            return;
        }
        
        // التحقق من وجود مكتبة Html5QrcodeScanner
        if (typeof Html5QrcodeScanner !== 'function') {
            console.error('مكتبة Html5QrcodeScanner غير متوفرة');
            reader.innerHTML = '<div class="alert alert-warning">مكتبة مسح الباركود غير متوفرة</div>';
            return;
        }
        
        // تهيئة الماسح
        try {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                }
            );
            
            html5QrcodeScanner.render((decodedText, decodedResult) => {
                // معالجة QR Code
                try {
                    const cardData = JSON.parse(decodedText);
                    
                    if (cardData.cardNumber) {
                        const card = cards.find(c => c.cardNumber === cardData.cardNumber);
                        
                        if (card) {
                            html5QrcodeScanner.clear();
                            viewCardDetails(card.id);
                            recordActivity('scan', card);
                            
                            if (settings.scannerOptions.sound) {
                                playSound('success');
                            }
                            
                            if (settings.scannerOptions.vibrate && navigator.vibrate) {
                                navigator.vibrate(200);
                            }
                        } else {
                            createNotification('خطأ', 'البطاقة غير موجودة في النظام', 'danger');
                        }
                    }
                } catch (e) {
                    console.error('خطأ في قراءة QR Code:', e);
                    createNotification('خطأ', 'تعذر قراءة البيانات من QR Code', 'danger');
                }
            }, (error) => {
                console.warn(`خطأ في المسح: ${error}`);
            });
        } catch (e) {
            console.error('خطأ في تهيئة الماسح:', e);
            reader.innerHTML = '<div class="alert alert-danger">حدث خطأ أثناء تهيئة الماسح</div>';
        }
    }
    
    /**
     * البحث اليدوي عن البطاقة
     */
    function manualSearch() {
        const searchInput = document.getElementById('manualSearchInput');
        if (!searchInput || !searchInput.value) {
            createNotification('تنبيه', 'الرجاء إدخال رقم البطاقة', 'warning');
            return;
        }
        
        const searchValue = searchInput.value.trim().replace(/\s/g, '');
        
        // البحث عن البطاقة
        const card = cards.find(c => 
            c.cardNumber.replace(/\s/g, '') === searchValue ||
            c.id === searchValue
        );
        
        if (card) {
            viewCardDetails(card.id);
            recordActivity('manual_search', card);
            searchInput.value = '';
        } else {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
        }
    }
    
    /**
     * البحث في البطاقات
     * @param {string} query - نص البحث
     * @param {string} filter - معيار التصفية
     */
    function handleSearch(query, filter = 'all') {
        if (!query) {
            renderCards(filter);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        
        // البحث في البطاقات
        const results = cards.filter(card => 
            (card.investorName && card.investorName.toLowerCase().includes(lowerQuery)) ||
            (card.cardNumber && card.cardNumber.includes(query)) ||
            (card.cardType && cardTypes.find(t => t.value === card.cardType)?.name.toLowerCase().includes(lowerQuery))
        );
        
        // تحديد العنصر المستهدف
        const gridId = filter === 'active' ? 'activeCardsGrid' : 
                       filter === 'expired' ? 'expiredCardsGrid' : 'cardsGrid';
        
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        // تطبيق الفلتر
        let filteredResults = results;
        
        if (filter === 'active') {
            filteredResults = results.filter(card => card.status === 'active' && !isExpired(card));
        } else if (filter === 'expired') {
            filteredResults = results.filter(card => isExpired(card));
        }
        
        // عرض النتائج
        if (filteredResults.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>لا توجد نتائج</h3>
                    <p>لا توجد بطاقات تطابق معايير البحث.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredResults.map(card => `
            <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
                ${renderCard(card)}
                <div class="card-info-overlay">
                    <h4>${card.investorName || 'غير معروف'}</h4>
                    <p>${cardTypes.find(t => t.value === card.cardType)?.name || card.cardType}</p>
                    <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                        ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                    </p>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * تحديث قائمة المستثمرين
     */
    function updateInvestorSelect() {
        const select = document.querySelector('select[name="investorSelect"]');
        if (!select) {
            console.error('عنصر اختيار المستثمر غير موجود');
            return;
        }
        
        // إعادة تعيين القائمة
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // التحقق من وجود المستثمرين
        if (!window.investors || !Array.isArray(window.investors) || window.investors.length === 0) {
            try {
                // محاولة تحميل المستثمرين من التخزين المحلي
                const storedInvestors = localStorage.getItem('investors');
                if (storedInvestors) {
                    window.investors = JSON.parse(storedInvestors);
                }
            } catch (error) {
                console.error('خطأ في تحميل المستثمرين:', error);
            }
        }
        
        // إضافة المستثمرين إلى القائمة
        if (window.investors && Array.isArray(window.investors) && window.investors.length > 0) {
            window.investors.forEach(investor => {
                select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
            });
        } else {
            // إضافة رسالة عند عدم وجود مستثمرين
            select.innerHTML += '<option value="" disabled>لا يوجد مستثمرين متاحين</option>';
            
            // إضافة تنبيه وزر للانتقال لإضافة مستثمر
            const formSection = select.closest('.form-section');
            if (formSection) {
                const existingWarning = formSection.querySelector('.investor-warning');
                if (!existingWarning) {
                    formSection.insertAdjacentHTML('beforeend', `
                        <div class="alert alert-warning investor-warning" style="margin-top: 15px;">
                            <div class="alert-icon" style="float: right; margin-left: 15px;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title" style="font-weight: bold;">تنبيه</div>
                                <div class="alert-text">
                                    لم يتم العثور على مستثمرين. قم بإضافة مستثمرين أولاً قبل إنشاء البطاقات.
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary" style="margin-top: 10px;" onclick="showPage('investors-page')">
                            <i class="fas fa-user-plus"></i> إضافة مستثمر جديد
                        </button>
                    `);
                }
            }
        }
    }
    
    /**
     * تحديث معاينة البطاقة
     */
    function updateCardPreview() {
        const form = document.getElementById('newCardForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const investorId = formData.get('investorSelect');
        const cardType = formData.get('cardType');
        
        const previewContainer = document.getElementById('cardPreviewContainer');
        if (!previewContainer) return;
        
        if (!investorId) {
            previewContainer.innerHTML = `
                <div class="empty-preview" style="text-align: center; padding: 30px; color: #6c757d;">
                    <i class="fas fa-credit-card fa-3x" style="margin-bottom: 15px; color: #dee2e6;"></i>
                    <p>اختر المستثمر لمعاينة البطاقة</p>
                </div>
            `;
            return;
        }
        
        // البحث عن المستثمر
        const investor = window.investors.find(inv => inv.id === investorId);
        if (!investor) {
            previewContainer.innerHTML = `
                <div class="empty-preview" style="text-align: center; padding: 30px; color: #6c757d;">
                    <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px; color: #f8d7da;"></i>
                    <p>المستثمر غير موجود</p>
                </div>
            `;
            return;
        }
        
        // إنشاء بطاقة معاينة
        const cardTypeObj = cardTypes.find(t => t.value === cardType) || cardTypes[0];
        
        const previewCard = {
            id: 'preview',
            cardNumber: generateCardNumber(),
            cardType: cardType,
            investorId: investorId,
            investorName: investor.name,
            expiryDate: calculateExpiryDate(parseInt(formData.get('cardValidity'))),
            cvv: generateCVV(),
            status: 'active',
            issueDate: new Date().toISOString().split('T')[0],
            hasQRCode: formData.get('hasQRCode') === 'on',
            hasChip: formData.get('hasChip') === 'on',
            hasHologram: formData.get('hasHologram') === 'on',
            pinCode: formData.get('hasPINCode') === 'on' ? generatePIN() : null,
            cardColors: cardTypeObj.colors
        };
        
        previewContainer.innerHTML = renderCard(previewCard);
    }
    
    /**
     * إنشاء بطاقة جديدة من النموذج
     */
    function createNewCard() {
        const form = document.getElementById('newCardForm');
        if (!form) {
            createNotification('خطأ', 'نموذج إنشاء البطاقة غير موجود', 'danger');
            return;
        }
        
        const formData = new FormData(form);
        const investorId = formData.get('investorSelect');
        const cardType = formData.get('cardType');
        
        if (!investorId) {
            createNotification('خطأ', 'يرجى اختيار المستثمر', 'danger');
            return;
        }
        
        // تجميع خيارات البطاقة
        const options = {
            years: parseInt(formData.get('cardValidity')),
            hasQRCode: formData.get('hasQRCode') === 'on',
            hasChip: formData.get('hasChip') === 'on',
            hasHologram: formData.get('hasHologram') === 'on',
            hasPINCode: formData.get('hasPINCode') === 'on'
        };
        
        try {
            // إنشاء البطاقة
            const card = createCard(investorId, cardType, options);
            
            // عرض رسالة نجاح
            createNotification('نجاح', 'تم إنشاء البطاقة بنجاح', 'success');
            
            // الانتقال إلى صفحة تفاصيل البطاقة
            viewCardDetails(card.id);
        } catch (error) {
            createNotification('خطأ', error.message, 'danger');
        }
    }
    
    /**
     * حساب إحصائيات البطاقات
     * @returns {object} الإحصائيات
     */
    function calculateStats() {
        const stats = {
            totalCards: cards.length,
            activeCards: cards.filter(c => c.status === 'active' && !isExpired(c)).length,
            expiredCards: cards.filter(c => isExpired(c)).length,
            suspendedCards: cards.filter(c => c.status === 'suspended').length,
            byType: {},
            recentActivities: activities.slice(0, 10),
            monthlyCreated: getMonthlyCreatedCards()
        };
        
        // توزيع البطاقات حسب النوع
        cardTypes.forEach(type => {
            stats.byType[type.value] = {
                name: type.name,
                count: cards.filter(c => c.cardType === type.value).length
            };
        });
        
        return stats;
    }
    
    /**
     * الحصول على بيانات البطاقات المنشأة شهرياً
     * @returns {object} بيانات الرسم البياني
     */
    function getMonthlyCreatedCards() {
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const last6Months = [];
        const data = [];
        
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthYear = `${monthNames[month]} ${year}`;
            last6Months.push(monthYear);
            
            // عدد البطاقات المنشأة في هذا الشهر
            const monthCards = cards.filter(card => {
                if (!card.issueDate) return false;
                
                const cardDate = new Date(card.issueDate);
                return cardDate.getMonth() === month && cardDate.getFullYear() === year;
            }).length;
            
            data.push(monthCards);
        }
        
        return {
            labels: last6Months,
            data: data
        };
    }
    
    /**
     * عرض إحصائيات البطاقات
     */
    function renderCardStats() {
        const stats = calculateStats();
        const statsContainer = document.getElementById('statsContainer');
        
        if (!statsContainer) {
            console.error('عنصر الإحصائيات غير موجود');
            return;
        }
        
        // عرض الإحصائيات
        statsContainer.innerHTML = `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="stat-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                    <div class="stat-value" style="font-size: 2.5rem; font-weight: bold; color: #343a40;">${stats.totalCards}</div>
                    <div class="stat-label" style="color: #6c757d; margin-top: 5px;">إجمالي البطاقات</div>
                    <div class="stat-icon" style="position: absolute; top: 15px; left: 15px; font-size: 3rem; opacity: 0.1; color: #007bff;">
                        <i class="fas fa-credit-card"></i>
                    </div>
                </div>
                <div class="stat-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                    <div class="stat-value" style="font-size: 2.5rem; font-weight: bold; color: #343a40;">${stats.activeCards}</div>
                    <div class="stat-label" style="color: #6c757d; margin-top: 5px;">البطاقات النشطة</div>
                    <div class="stat-icon" style="position: absolute; top: 15px; left: 15px; font-size: 3rem; opacity: 0.1; color: #28a745;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="stat-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                    <div class="stat-value" style="font-size: 2.5rem; font-weight: bold; color: #343a40;">${stats.expiredCards}</div>
                    <div class="stat-label" style="color: #6c757d; margin-top: 5px;">البطاقات المنتهية</div>
                    <div class="stat-icon" style="position: absolute; top: 15px; left: 15px; font-size: 3rem; opacity: 0.1; color: #dc3545;">
                        <i class="fas fa-times-circle"></i>
                    </div>
                </div>
                <div class="stat-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                    <div class="stat-value" style="font-size: 2.5rem; font-weight: bold; color: #343a40;">${stats.suspendedCards}</div>
                    <div class="stat-label" style="color: #6c757d; margin-top: 5px;">البطاقات الموقوفة</div>
                    <div class="stat-icon" style="position: absolute; top: 15px; left: 15px; font-size: 3rem; opacity: 0.1; color: #ffc107;">
                        <i class="fas fa-pause-circle"></i>
                    </div>
                </div>
            </div>
            
            <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; margin-bottom: 30px;">
                <div class="chart-container" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-bottom: 20px; text-align: center;">توزيع البطاقات حسب النوع</h3>
                    <canvas id="cardTypesChart" style="width: 100%; height: 250px;"></canvas>
                </div>
                <div class="chart-container" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-bottom: 20px; text-align: center;">البطاقات الصادرة شهرياً</h3>
                    <canvas id="monthlyCardsChart" style="width: 100%; height: 250px;"></canvas>
                </div>
            </div>
            
            <div class="activities-container" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">آخر الأنشطة</h3>
                <div class="activities-list" style="max-height: 400px; overflow-y: auto;">
                    ${stats.recentActivities.length > 0 ? stats.recentActivities.map(activity => `
                        <div class="activity-item" style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #dee2e6;">
                            <div class="activity-icon ${activity.action}" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 15px; background-color: ${getActivityColor(activity.action)}; color: white;">
                                <i class="fas ${getActivityIcon(activity.action)}"></i>
                            </div>
                            <div class="activity-details">
                                <div class="activity-action" style="font-weight: 600; color: #343a40;">${getActivityName(activity.action)}</div>
                                <div class="activity-investor" style="font-size: 0.9rem; color: #495057;">${activity.investorName}</div>
                                <div class="activity-time" style="font-size: 0.85rem; color: #6c757d;">${formatDate(activity.timestamp)} ${formatTime(activity.timestamp)}</div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-activities" style="text-align: center; padding: 20px; color: #6c757d;">لا توجد أنشطة مسجلة</div>'}
                </div>
            </div>
        `;
        
        // رسم الرسوم البيانية إذا كانت مكتبة Chart.js متاحة
        if (typeof Chart === 'function') {
            renderCharts(stats);
        } else {
            console.error('مكتبة Chart.js غير متوفرة');
            
            // عرض بيانات بديلة
            const typesChartContainer = document.getElementById('cardTypesChart');
            const monthlyChartContainer = document.getElementById('monthlyCardsChart');
            
            if (typesChartContainer) {
                typesChartContainer.outerHTML = `
                    <div style="padding: 30px; text-align: center; color: #6c757d;">
                        <i class="fas fa-chart-pie fa-3x" style="margin-bottom: 15px; color: #dee2e6;"></i>
                        <p>مكتبة الرسوم البيانية غير متوفرة</p>
                    </div>
                `;
            }
            
            if (monthlyChartContainer) {
                monthlyChartContainer.outerHTML = `
                    <div style="padding: 30px; text-align: center; color: #6c757d;">
                        <i class="fas fa-chart-line fa-3x" style="margin-bottom: 15px; color: #dee2e6;"></i>
                        <p>مكتبة الرسوم البيانية غير متوفرة</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * رسم الرسوم البيانية للإحصائيات
     * @param {object} stats - بيانات الإحصائيات
     */
    function renderCharts(stats) {
        // رسم توزيع أنواع البطاقات
        const typesChartElement = document.getElementById('cardTypesChart');
        if (typesChartElement) {
            const chartData = [];
            const chartLabels = [];
            const chartColors = [];
            
            // تجميع البيانات
            for (const typeKey in stats.byType) {
                if (stats.byType[typeKey].count > 0) {
                    chartData.push(stats.byType[typeKey].count);
                    chartLabels.push(stats.byType[typeKey].name);
                    
                    const typeObj = cardTypes.find(t => t.value === typeKey);
                    chartColors.push(typeObj ? typeObj.colors.primary : '#ccc');
                }
            }
            
            // رسم المخطط الدائري
            new Chart(typesChartElement, {
                type: 'doughnut',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        data: chartData,
                        backgroundColor: chartColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // رسم البطاقات الشهرية
        const monthlyChartElement = document.getElementById('monthlyCardsChart');
        if (monthlyChartElement && stats.monthlyCreated) {
            new Chart(monthlyChartElement, {
                type: 'line',
                data: {
                    labels: stats.monthlyCreated.labels,
                    datasets: [{
                        label: 'البطاقات الصادرة',
                        data: stats.monthlyCreated.data,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    /**
     * تصدير إحصائيات البطاقات
     */
    function exportStats() {
        const stats = calculateStats();
        
        // تجهيز البيانات للتصدير
        const exportData = {
            date: new Date().toISOString(),
            summary: {
                totalCards: stats.totalCards,
                activeCards: stats.activeCards,
                expiredCards: stats.expiredCards,
                suspendedCards: stats.suspendedCards
            },
            byType: stats.byType,
            monthlyCreated: stats.monthlyCreated
        };
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `card_statistics_${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        createNotification('نجاح', 'تم تصدير إحصائيات البطاقات بنجاح', 'success');
    }
    
    /**
     * الحصول على لون نشاط معين
     * @param {string} action - نوع النشاط
     * @returns {string} كود اللون
     */
    function getActivityColor(action) {
        const colors = {
            create: '#28a745',
            view: '#17a2b8',
            print: '#6c757d',
            share: '#17a2b8',
            suspend: '#ffc107',
            activate: '#28a745',
            renew: '#17a2b8',
            delete: '#dc3545',
            scan: '#6610f2',
            manual_search: '#6c757d',
            update: '#fd7e14'
        };
        
        return colors[action] || '#6c757d';
    }
    
    /**
     * الحصول على أنماط CSS للبطاقات
     * @returns {string} أنماط CSS
     */
    function getCardStyles() {
        return `
            /* أنماط البطاقات */
           /* تكملة أنماط CSS للبطاقات */
.investor-card {
    width: 350px;
    height: 220px;
    border-radius: 15px;
    position: relative;
    perspective: 1000px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
}

.card-inner {
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    position: relative;
}

.investor-card.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 15px;
    padding: 20px;
    box-sizing: border-box;
}

.card-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.card-chip {
    width: 50px;
    height: 40px;
    border-radius: 8px;
    position: absolute;
    top: 40px;
    right: 40px;
}

.card-hologram {
    width: 60px;
    height: 40px;
    background: linear-gradient(45deg, 
        #ff0000 0%, 
        #ff7f00 14%, 
        #ffff00 28%, 
        #00ff00 42%, 
        #0000ff 57%, 
        #4b0082 71%, 
        #9400d3 85%, 
        #ff0000 100%);
    position: absolute;
    top: 40px;
    left: 40px;
    border-radius: 5px;
    opacity: 0.8;
}

.card-logo {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 1.2rem;
    font-weight: bold;
}

.card-number {
    position: absolute;
    bottom: 70px;
    right: 20px;
    font-size: 1.3rem;
    letter-spacing: 2px;
    font-family: 'Courier New', monospace;
}

.card-holder {
    position: absolute;
    bottom: 30px;
    right: 20px;
}

.card-holder .label {
    font-size: 0.7rem;
    opacity: 0.8;
    text-transform: uppercase;
}

.card-holder .name {
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
}

.card-expires {
    position: absolute;
    bottom: 30px;
    left: 130px;
}

.card-expires .label {
    font-size: 0.7rem;
    opacity: 0.8;
    text-transform: uppercase;
}

.card-expires .date {
    font-size: 1rem;
    font-weight: 600;
}

.card-type-icon {
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.card-type-icon img {
    height: 40px;
}

.magnetic-strip {
    width: 100%;
    height: 50px;
    background: #000;
    margin-top: 20px;
}

.signature-strip {
    width: 80%;
    height: 40px;
    background: white;
    margin: 20px auto;
    position: relative;
    border: 1px solid #ddd;
}

.signature-area {
    width: 70%;
    height: 100%;
    background: repeating-linear-gradient(
        0deg,
        #fff,
        #fff 5px,
        #f0f0f0 5px,
        #f0f0f0 6px
    );
}

.cvv {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Courier New', monospace;
}

.qr-code {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 80px;
    height: 80px;
    background: white;
    padding: 5px;
    border-radius: 5px;
}

.qr-code img {
    width: 100%;
    height: 100%;
}

.card-info {
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-size: 0.8rem;
    color: #333;
    text-align: left;
}

.card-info p {
    margin: 2px 0;
}

.card-number-back {
    font-size: 0.9rem;
    font-family: 'Courier New', monospace;
    margin-top: 10px !important;
}

/* أنماط قائمة البطاقات */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 20px;
}

.card-item {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 15px;
    overflow: hidden;
}

.card-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.card-item:hover .card-info-overlay {
    transform: translateY(0);
}

.card-info-overlay h4 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
}

.card-info-overlay p {
    margin: 2px 0;
    font-size: 0.9rem;
}

.status {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status.active {
    background: #d4edda;
    color: #155724;
}

.status.inactive {
    background: #f8d7da;
    color: #721c24;
}

/* أنماط تفاصيل البطاقة */
.card-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    padding: 20px;
}

@media (max-width: 992px) {
    .card-detail-grid {
        grid-template-columns: 1fr;
    }
}

.card-preview-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.card-preview-container {
    position: relative;
}

.card-flip-button {
    margin-top: 10px;
    text-align: center;
    color: #007bff;
    cursor: pointer;
    font-size: 1.1rem;
}

.card-flip-button:hover {
    color: #0056b3;
}

.card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
}

.info-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.info-card h3 {
    margin-bottom: 15px;
    color: #343a40;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.info-item {
    padding: 10px;
    background: #f8f9fa;
    border-radius: 6px;
}

.info-item label {
    display: block;
    font-weight: 600;
    color: #6c757d;
    margin-bottom: 5px;
    font-size: 0.9rem;
}

.info-item span {
    display: block;
    color: #343a40;
    font-size: 1rem;
}

.pin-code {
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
}

.activities-list {
    max-height: 400px;
    overflow-y: auto;
}

.activity-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #dee2e6;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 15px;
    font-size: 1rem;
}

.activity-details {
    flex: 1;
}

.activity-action {
    font-weight: 600;
    color: #343a40;
    margin-bottom: 5px;
}

.activity-time {
    font-size: 0.85rem;
    color: #6c757d;
}

.activity-investor {
    font-size: 0.9rem;
    color: #495057;
}

/* أنماط نموذج إنشاء البطاقة */
.form-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.form-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-section h3 {
    margin-bottom: 15px;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 8px;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.form-group {
    margin-bottom: 15px;
}

.form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #495057;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.checkbox-label:hover {
    border-color: #80bdff;
    background: #f8f9fa;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

/* أنماط ماسح الباركود */
.scanner-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

#reader {
    width: 100%;
    margin-bottom: 30px;
}

.manual-search {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.manual-search h3 {
    margin-bottom: 15px;
    color: #495057;
}

.manual-search .search-bar {
    display: flex;
    gap: 10px;
}

.manual-search .form-control {
    flex: 1;
}

/* أنماط الشاشات الفارغة */
.empty-state {
    text-align: center;
    padding: 40px;
    color: #6c757d;
}

.empty-state i {
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

.empty-activities {
    text-align: center;
    padding: 20px;
    color: #6c757d;
}

/* أنماط النافذة المنبثقة */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}

.modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    position: relative;
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.modal-overlay.active .modal {
    transform: translateY(0);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    color: #343a40;
}

.modal-close {
    cursor: pointer;
    font-size: 1.25rem;
    color: #6c757d;
    transition: color 0.2s ease;
}

.modal-close:hover {
    color: #343a40;
}

.modal-body {
    padding: 20px;
}

/* أنماط الإشعارات */
.alert {
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
}

.alert-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.alert-icon {
    margin-left: 15px;
    font-size: 1.1rem;
}

.alert-content {
    flex: 1;
}

.alert-title {
    font-weight: bold;
    margin-bottom: 5px;
}

/* زر الإضافة العائم */
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

/* وضع الطباعة */
@media print {
    .header-actions,
    .card-actions,
    .card-flip-button,
    .floating-add-button,
    .sidebar,
    .navbar {
        display: none !important;
    }
    
    .card-detail-grid {
        grid-template-columns: 1fr;
    }
    
    .page {
        margin: 0;
        padding: 0;
        box-shadow: none;
    }
    
    .investor-card {
        width: 86mm !important;
        height: 54mm !important;
        margin: 0 auto;
        page-break-after: always;
    }
}

/* التكملة: وظائف إضافية وتهيئة النظام */

/**
 * تجديد جميع البطاقات المنتهية
 */
function renewAllExpired() {
    const expiredCards = cards.filter(card => isExpired(card));
    
    if (expiredCards.length === 0) {
        createNotification('تنبيه', 'لا توجد بطاقات منتهية الصلاحية', 'warning');
        return;
    }
    
    if (!confirm(`سيتم تجديد ${expiredCards.length} بطاقة. هل تريد المتابعة؟`)) {
        return;
    }
    
    // تجديد جميع البطاقات المنتهية
    expiredCards.forEach(card => {
        card.expiryDate = calculateExpiryDate();
        card.status = 'active';
        recordActivity('renew', card);
    });
    
    // حفظ البطاقات
    saveCards();
    
    // تحديث العرض
    renderCards('expired');
    
    createNotification('نجاح', `تم تجديد ${expiredCards.length} بطاقة بنجاح`, 'success');
}

/**
 * تشغيل صوت
 * @param {string} type - نوع الصوت
 */
function playSound(type) {
    const audioMap = {
        success: 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAADpAFgqe623y83KwrWqof3v6+PbyMbVz+LZzMKnn5n9DUJ0j57Et7udbDcYCgvy//z+/vklK0RXfYWerrrDztTe3trSwbGain4+FQkB+vz91tJfTzNFSmJwdnp9iZOepJ6NeE4lGh4wS1Y6KxEDAP4YIiAsFgcEDhodHiMmIRoTBPLlztDc6/n+BggFAP37BRMfKywqIQ8B9e/o3tfQzMfAuLWvqKWjoJ6enp2fnqCprbG0urvAxMXEwbu2sKumo6GgDQAKABsABQAFAAwA4wANABUACgAAAAcA5QDgAOAA4ADgAOEA4QDhAOEA4QDiAOIA4gDiAOIA4wDjAOMA4wDjAOQA5ADkAOQA5ADlAOUA5QDlAA==',
        error: 'data:audio/wav;base64,UklGRjoFAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YRoFAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQ=='
    };
    
    if (audioMap[type]) {
        const audio = new Audio(audioMap[type]);
        audio.play();
    }
}

/**
 * تحويل صورة البطاقة إلى تنسيق PNG
 * @param {string} cardId - معرّف البطاقة
 */
function exportCardImage(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // إنشاء عنصر canvas لرسم البطاقة
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 440;
    
    // الحصول على سياق الرسم
    const ctx = canvas.getContext('2d');
    
    // رسم خلفية البطاقة
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // الحصول على عنصر البطاقة
    const cardElement = document.createElement('div');
    cardElement.innerHTML = renderCard(card);
    cardElement.style.transform = 'scale(2)';
    cardElement.style.transformOrigin = 'top left';
    
    // استخدام html2canvas إذا كان متاحاً
    if (typeof html2canvas === 'function') {
        html2canvas(cardElement.querySelector('.investor-card')).then(canvas => {
            // تحميل الصورة
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `card_${card.id}.png`;
            link.click();
            
            createNotification('نجاح', 'تم تصدير صورة البطاقة بنجاح', 'success');
        });
    } else {
        createNotification('خطأ', 'مكتبة html2canvas غير متوفرة', 'danger');
    }
}

/**
 * دالة تهيئة النظام
 */
function init() {
    console.log('تهيئة نظام بطاقات المستثمرين...');
    
    // تحميل البيانات المحفوظة
    loadCards();
    loadActivities();
    
    // إنشاء صفحات النظام إذا لم تكن موجودة
    createSystemPages();
    
    // إضافة عناصر القائمة
    addMenuItems();
    
    // إضافة أنماط CSS
    addStyles();
    
    // إضافة زر الإضافة العائم
    addFloatingButton();
    
    // إصلاح مشكلة التنقل بين الصفحات
    fixCardNavigation();
    
    // تسجيل الأحداث
    registerEventListeners();
    
    // مزامنة مع Firebase إذا كان متاحاً
    setupFirebaseSync();
    
    console.log('تم تهيئة نظام بطاقات المستثمرين بنجاح');
}

/**
 * إنشاء صفحات النظام
 */
function createSystemPages() {
    const content = document.querySelector('.content');
    if (!content) {
        console.error('منطقة المحتوى غير موجودة');
        return;
    }
    
    // التحقق من وجود الصفحات
    if (document.getElementById('investor-cards-page')) {
        console.log('الصفحات موجودة بالفعل');
        return;
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
                        ${cardTypes.map(type => `
                            <option value="${type.value}">${type.name}</option>
                        `).join('')}
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
                                    ${cardTypes.map(type => `
                                        <option value="${type.value}" ${type.value === settings.defaultCardType ? 'selected' : ''}>
                                            ${type.name}
                                        </option>
                                    `).join('')}
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
    
    // إضافة الصفحات للمحتوى
    content.insertAdjacentHTML('beforeend', pagesHTML);
}

/**
 * إضافة عناصر القائمة
 */
function addMenuItems() {
    const sidebar = document.querySelector('.sidebar-menu');
    if (!sidebar) {
        console.error('القائمة الجانبية غير موجودة');
        return;
    }
    
    // التحقق من وجود عناصر القائمة
    if (sidebar.querySelector('.menu-item[onclick*="showPage(\'investor-cards-page\')"]')) {
        console.log('عناصر القائمة موجودة بالفعل');
        return;
    }
    
    // إنشاء عناصر القائمة
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
    
    // البحث عن المكان المناسب للإضافة
    const systemCategory = sidebar.querySelector('.menu-category:nth-last-child(2)');
    
    if (systemCategory) {
        systemCategory.insertAdjacentHTML('beforebegin', cardMenuHTML);
    } else {
        sidebar.insertAdjacentHTML('beforeend', cardMenuHTML);
    }
}

/**
 * إضافة أنماط CSS
 */
function addStyles() {
    // التحقق من وجود أنماط CSS
    if (document.getElementById('investor-card-styles')) {
        return;
    }
    
    // إنشاء عنصر style
    const style = document.createElement('style');
    style.id = 'investor-card-styles';
    style.textContent = getCardStyles();
    
    // إضافة الأنماط إلى الصفحة
    document.head.appendChild(style);
}

/**
 * إضافة زر الإضافة العائم
 */
function addFloatingButton() {
    // التحقق من وجود الزر
    if (document.querySelector('.floating-add-button')) {
        return;
    }
    
    // إنشاء الزر
    const floatingButton = document.createElement('div');
    floatingButton.className = 'floating-add-button';
    floatingButton.innerHTML = '<i class="fas fa-plus"></i>';
    floatingButton.title = 'إنشاء بطاقة جديدة';
    floatingButton.onclick = function() {
        showPage('new-card-page');
    };
    
    // إضافة الزر إلى الصفحة
    document.body.appendChild(floatingButton);
}

/**
 * إصلاح مشكلة التنقل بين الصفحات
 */
function fixCardNavigation() {
    // التأكد من وجود دالة showPage
    if (typeof window.showPage !== 'function') {
        window.showPage = function(pageId) {
            console.log('الانتقال إلى الصفحة:', pageId);
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // إزالة الفئة النشطة من جميع عناصر القائمة
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // عرض الصفحة المطلوبة
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.classList.add('active');
                
                // تفعيل عنصر القائمة المناسب
                document.querySelectorAll(`.menu-item[onclick*="showPage('${pageId}')"]`).forEach(item => {
                    item.classList.add('active');
                });
                
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
    }
}

/**
 * تسجيل الأحداث
 */
function registerEventListeners() {
    // تسجيل أحداث النقر على أزرار القائمة
    document.querySelectorAll('.menu-item[onclick*="showPage"]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showPage(pageId);
        });
    });
    
    // تسجيل أحداث البحث اليدوي عن البطاقة
    const manualSearchInput = document.getElementById('manualSearchInput');
    if (manualSearchInput) {
        manualSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                InvestorCardSystem.manualSearch();
            }
        });
    }
    
    // تسجيل التغييرات في نموذج إنشاء البطاقة
    const newCardForm = document.getElementById('newCardForm');
    if (newCardForm) {
        newCardForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', function() {
                InvestorCardSystem.updateCardPreview();
            });
        });
    }
}

/**
 * إعداد المزامنة مع Firebase
 */
function setupFirebaseSync() {
    // التحقق من توفر Firebase
    if (window.firebase && window.firebase.database && window.firebaseApp && window.firebaseApp.user) {
        console.log('إعداد المزامنة مع Firebase...');
        
        // مزامنة البطاقات
        firebase.database().ref('investorCards').on('value', (snapshot) => {
            const firebaseCards = snapshot.val();
            if (firebaseCards) {
                cards = Object.values(firebaseCards);
                renderCards();
                console.log('تم مزامنة البطاقات من Firebase');
            }
        });
        
        // مزامنة الأنشطة
        firebase.database().ref('cardActivities').on('value', (snapshot) => {
            const firebaseActivities = snapshot.val();
            if (firebaseActivities) {
                activities = Object.values(firebaseActivities);
                console.log('تم مزامنة الأنشطة من Firebase');
            }
        });
    }
}

/**
 * تصفية البطاقات حسب النوع
 * @param {string} type - نوع البطاقة
 */
function filterByType(type) {
    console.log('تصفية البطاقات حسب النوع:', type);
    
    if (type === 'all') {
        renderCards();
        return;
    }
    
    // تصفية البطاقات
    const filteredCards = cards.filter(card => card.cardType === type);
    
    // عرض البطاقات المصفاة
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;
    
    if (filteredCards.length === 0) {
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter fa-3x"></i>
                <h3>لا توجد بطاقات</h3>
                <p>لا توجد بطاقات من النوع المحدد.</p>
            </div>
        `;
        return;
    }
    
    cardsGrid.innerHTML = filteredCards.map(card => `
        <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
            ${renderCard(card)}
            <div class="card-info-overlay">
                <h4>${card.investorName || 'غير معروف'}</h4>
                <p>${cardTypes.find(t => t.value === card.cardType)?.name || card.cardType}</p>
                <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                    ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                </p>
            </div>
        </div>
    `).join('');
}

// الواجهة العامة للنظام
return {
    init: init,
    createCard: createCard,
    renderCards: renderCards,
    viewCardDetails: viewCardDetails,
    flipCard: flipCard,
    togglePIN: togglePIN,
    printCard: printCard,
    shareCard: shareCard,
    shareViaQR: shareViaQR,
    shareViaEmail: shareViaEmail,
    shareViaText: shareViaText,
    exportCardJSON: exportCardJSON,
    exportCardImage: exportCardImage,
    deleteCard: deleteCard,
    suspendCard: suspendCard,
    activateCard: activateCard,
    renewCard: renewCard,
    renewAllExpired: renewAllExpired,
    manualSearch: manualSearch,
    handleSearch: handleSearch,
    filterByType: filterByType,
    initBarcodeScanner: initBarcodeScanner,
    createNewCard: createNewCard,
    updateCardPreview: updateCardPreview,
    updateInvestorSelect: updateInvestorSelect,
    renderCardStats: renderCardStats,
    exportStats: exportStats,
    cards: cards,
    activities: activities
};
})();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    InvestorCardSystem.init();
});

// دالة فحص توافق المتصفح
function checkBrowserCompatibility() {
    const features = {
        localStorage: typeof localStorage !== 'undefined',
        JSON: typeof JSON !== 'undefined',
        querySelector: typeof document.querySelector === 'function',
        addEventListener: typeof window.addEventListener === 'function'
    };
    
    const incompatible = Object.keys(features).filter(feature => !features[feature]);
    
    if (incompatible.length > 0) {
        console.error('المتصفح الحالي غير متوافق. الميزات غير المدعومة:', incompatible.join(', '));
        
        // عرض رسالة للمستخدم
        const message = document.createElement('div');
        message.style.position = 'fixed';
        message.style.top = '0';
        message.style.left = '0';
        message.style.right = '0';
        message.style.padding = '15px';
        message.style.background = '#f8d7da';
        message.style.color = '#721c24';
        message.style.textAlign = 'center';
        message.style.zIndex = '9999';
        message.innerHTML = 'المتصفح الذي تستخدمه قديم ولا يدعم بعض الميزات المطلوبة. يرجى استخدام متصفح حديث للحصول على أفضل تجربة.';
        
        document.body.appendChild(message);
        
        return false;
    }
    
    return true;
}

// إنشاء أنماط إضافية لإصلاح مشكلة النقر المزدوج
function fixDoubleClickIssue() {
    // إضافة نمط لمنع النقر المزدوج
    const style = document.createElement('style');
    style.innerHTML = `
        /* إصلاح مشكلة النقر المزدوج */
        .card-item {
            pointer-events: auto;
        }
        
        .card-item * {
            pointer-events: none;
        }
        
        .btn, .menu-item, .floating-add-button {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        
        /* تحسين تجربة النقر على الأجهزة اللمسية */
        @media (hover: none) {
            .card-item:hover .card-info-overlay {
                transform: translateY(0);
            }
            
            .card-item:active {
                transform: scale(0.98);
            }
            
            .btn:active, .menu-item:active, .floating-add-button:active {
                opacity: 0.8;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // تسجيل أحداث النقر
    document.addEventListener('click', function(e) {
        // تمييز العنصر المنقور عليه
        let target = e.target;
        
        // إذا كان العنصر هو .card-item أو أحد عناصره الفرعية
        const cardItem = target.closest('.card-item');
        if (cardItem) {
            e.preventDefault();
            e.stopPropagation();
            
            // استخراج معرّف البطاقة
            const cardId = cardItem.querySelector('.investor-card').dataset.cardId;
            if (cardId) {
                InvestorCardSystem.viewCardDetails(cardId);
            }
        }
    }, true);
}

// تنفيذ الإصلاحات عند تحميل الصفحة
window.addEventListener('load', function() {
    // فحص توافق المتصفح
    if (!checkBrowserCompatibility()) return;
    
    // إصلاح مشكلة النقر المزدوج
    fixDoubleClickIssue();
    
    // تحميل بيانات المستثمرين إذا لم تكن متاحة
    if (!window.investors || !Array.isArray(window.investors) || window.investors.length === 0) {
        try {
            const storedInvestors = localStorage.getItem('investors');
            if (storedInvestors) {
                window.investors = JSON.parse(storedInvestors);
                console.log('تم تحميل المستثمرين من التخزين المحلي:', window.investors.length);
            } else {
                // إنشاء بيانات افتراضية للتجربة
                window.investors = [
                    { id: 'inv1', name: 'أحمد محمد', phone: '07701234567', email: 'ahmed@example.com', address: 'بغداد - الكرادة' },
                    { id: 'inv2', name: 'سارة علي', phone: '07709876543', email: 'sara@example.com', address: 'بغداد - المنصور' },
                    { id: 'inv3', name: 'محمد جاسم', phone: '07712345678', email: 'mohammad@example.com', address: 'البصرة - العشار' }
                ];
                localStorage.setItem('investors', JSON.stringify(window.investors));
                console.log('تم إنشاء بيانات افتراضية للمستثمرين');
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستثمرين:', error);
        }
    }
});

/**
 * إصلاح بسيط للانتقال بين الصفحات - ضعه في نهاية صفحتك
 */

(function() {
    // انتظر تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('جاري إصلاح مشكلة الصفحات البيضاء...');
        
        // تعريف أبسط لدالة showPage
        window.showPage = function(pageId) {
            console.log('الانتقال إلى الصفحة:', pageId);
            
            // إخفاء جميع الصفحات
            var pages = document.querySelectorAll('.page');
            for (var i = 0; i < pages.length; i++) {
                pages[i].style.display = 'none';
            }
            
            // إلغاء تنشيط جميع عناصر القائمة
            var menuItems = document.querySelectorAll('.menu-item');
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }
            
            // عرض الصفحة المطلوبة
            var page = document.getElementById(pageId);
            if (page) {
                page.style.display = 'block';
                
                // تنشيط عنصر القائمة المناسب
                var menuItem = document.querySelector('a[href="#' + pageId.replace('-page', '') + '"]');
                if (menuItem) {
                    menuItem.classList.add('active');
                }
                
                // تحديث المحتوى بناءً على الصفحة
                if (typeof InvestorCardSystem !== 'undefined') {
                    if (pageId === 'investor-cards-page') {
                        InvestorCardSystem.renderCards('all');
                    } else if (pageId === 'active-cards-page') {
                        InvestorCardSystem.renderCards('active');
                    } else if (pageId === 'expired-cards-page') {
                        InvestorCardSystem.renderCards('expired');
                    } else if (pageId === 'new-card-page') {
                        if (typeof InvestorCardSystem.updateInvestorSelect === 'function') {
                            InvestorCardSystem.updateInvestorSelect();
                        }
                        if (typeof InvestorCardSystem.updateCardPreview === 'function') {
                            InvestorCardSystem.updateCardPreview();
                        }
                    } else if (pageId === 'barcode-scanner-page') {
                        if (typeof InvestorCardSystem.initBarcodeScanner === 'function') {
                            InvestorCardSystem.initBarcodeScanner();
                        }
                    } else if (pageId === 'card-stats-page') {
                        if (typeof InvestorCardSystem.renderCardStats === 'function') {
                            InvestorCardSystem.renderCardStats();
                        }
                    }
                }
            } else {
                console.error('الصفحة غير موجودة:', pageId);
            }
        };
        
        // إصلاح جميع عناصر التنقل
        var menuItems = document.querySelectorAll('.menu-item');
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            var href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                var pageId = href.substring(1) + '-page';
                
                // إعادة تعريف event listener للنقر
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    var pageId = this.getAttribute('href').substring(1) + '-page';
                    showPage(pageId);
                });
            }
        }
        
        // إصلاح الأزرار
        var buttons = document.querySelectorAll('button[onclick*="showPage"]');
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            var onclickValue = button.getAttribute('onclick');
            var pageIdMatch = onclickValue.match(/showPage\(['"]([^'"]+)['"]\)/);
            
            if (pageIdMatch && pageIdMatch[1]) {
                var pageId = pageIdMatch[1];
                
                button.addEventListener('click', function(pageId) {
                    return function(e) {
                        e.preventDefault();
                        showPage(pageId);
                    };
                }(pageId));
            }
        }
        
        // التأكد من أن المحتوى موجود في كل صفحة
        var pages = document.querySelectorAll('.page');
        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            
            // التحقق من وجود محتوى
            if (page.children.length === 0) {
                var pageId = page.id;
                createDefaultContent(pageId);
            }
        }
        
        // عرض الصفحة الرئيسية افتراضيًا
        var homePage = 'investor-cards-page';
        var currentHash = window.location.hash;
        
        if (currentHash && currentHash.startsWith('#')) {
            var hashPageId = currentHash.substring(1) + '-page';
            if (document.getElementById(hashPageId)) {
                homePage = hashPageId;
            }
        }
        
        console.log('عرض الصفحة الافتراضية:', homePage);
        showPage(homePage);
    });
    
    // إنشاء محتوى افتراضي لصفحة فارغة
    function createDefaultContent(pageId) {
        var page = document.getElementById(pageId);
        if (!page) return;
        
        var title = pageId.replace('-page', '').replace(/-/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        
        var defaultHTML = `
            <div class="header">
                <h1 class="page-title">${title}</h1>
            </div>
            <div class="content-area" id="${pageId}-content">
                <div class="empty-state">
                    <i class="fas fa-info-circle fa-3x"></i>
                    <h3>صفحة قيد الإنشاء</h3>
                    <p>هذه الصفحة قيد الإنشاء وستكون جاهزة قريبًا.</p>
                </div>
            </div>
        `;
        
        page.innerHTML = defaultHTML;
        console.log('تم إنشاء محتوى افتراضي للصفحة:', pageId);
    }
})();

