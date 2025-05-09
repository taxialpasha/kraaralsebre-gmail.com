// investor-cards.js - نظام بطاقات المستثمرين المتكامل

const InvestorCardSystem = (function() {
    // المتغيرات الخاصة
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
    
    // أنواع البطاقات
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
    
    // دالة توليد رقم البطاقة مع خوارزمية Luhn
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
    
    // دالة التحقق من صحة رقم البطاقة
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
    
    // دالة تنسيق رقم البطاقة
    function formatCardNumber(cardNumber) {
        return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // دالة توليد CVV
    function generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }
    
    // دالة توليد رقم PIN
    function generatePIN() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // دالة حساب تاريخ الانتهاء
    function calculateExpiryDate(yearsToAdd = settings.defaultYears) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + yearsToAdd);
        
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        
        return `${month}/${year}`;
    }
    
    // دالة إنشاء بطاقة جديدة
    function createCard(investorId, cardType = settings.defaultCardType, options = {}) {
        const investor = window.investors.find(inv => inv.id === investorId);
        if(!investor) {
            throw new Error('المستثمر غير موجود');
        }
        
        const card = {
            id: generateId(),
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
            hasChip: options.hasChip || true,
            hasHologram: options.hasHologram || false,
            pinCode: options.hasPINCode ? generatePIN() : null,
            cardColors: cardTypes.find(t => t.value === cardType).colors
        };
        
        cards.push(card);
        saveCards();
        recordActivity('create', card);
        
        // مزامنة مع Firebase إذا كان متاحاً
        if(window.firebaseApp && window.firebaseApp.user) {
            firebase.database().ref(`investorCards/${card.id}`).set(card);
        }
        
        return card;
    }
    
    // دالة تسجيل النشاط
    function recordActivity(action, card, details = {}) {
        const activity = {
            id: generateId(),
            action: action,
            cardId: card.id,
            investorId: card.investorId,
            investorName: card.investorName,
            timestamp: new Date().toISOString(),
            details: details
        };
        
        activities.unshift(activity);
        saveActivities();
        
        // مزامنة مع Firebase
        if(window.firebaseApp && window.firebaseApp.user) {
            firebase.database().ref(`cardActivities/${activity.id}`).set(activity);
        }
    }
    
    // دالة توليد ID فريد
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // دالة حفظ البطاقات
    function saveCards() {
        localStorage.setItem('investorCards', JSON.stringify(cards));
    }
    
    // دالة تحميل البطاقات
    function loadCards() {
        const savedCards = localStorage.getItem('investorCards');
        if(savedCards) {
            cards = JSON.parse(savedCards);
        }
    }
    
    // دالة حفظ الأنشطة
    function saveActivities() {
        localStorage.setItem('cardActivities', JSON.stringify(activities));
    }
    
    // دالة تحميل الأنشطة
    function loadActivities() {
        const savedActivities = localStorage.getItem('cardActivities');
        if(savedActivities) {
            activities = JSON.parse(savedActivities);
        }
    }
    
    // دالة تصدير البطاقة كـ HTML
    function renderCard(card, showBack = false) {
        const cardType = cardTypes.find(t => t.value === card.cardType);
        const colors = cardType.colors;
        
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
                            <img src="assets/mastercard-logo.png" alt="MasterCard">
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
    
    // دالة عرض البطاقات
    function renderCards(filter = 'all') {
        let filteredCards = cards;
        
        if(filter === 'active') {
            filteredCards = cards.filter(card => card.status === 'active' && !isExpired(card));
        } else if(filter === 'expired') {
            filteredCards = cards.filter(card => isExpired(card));
        }
        
        const cardsGrid = document.getElementById('cardsGrid');
        if(!cardsGrid) return;
        
        if(filteredCards.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card fa-3x"></i>
                    <h3>لا توجد بطاقات</h3>
                    <p>لا توجد بطاقات ${filter === 'active' ? 'نشطة' : filter === 'expired' ? 'منتهية الصلاحية' : ''} في النظام.</p>
                    <button class="btn btn-primary" onclick="showPage('new-card')">
                        <i class="fas fa-plus"></i> إنشاء بطاقة جديدة
                    </button>
                </div>
            `;
            return;
        }
        
        cardsGrid.innerHTML = filteredCards.map(card => `
            <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
                ${renderCard(card)}
                <div class="card-info-overlay">
                    <h4>${card.investorName}</h4>
                    <p>${cardTypes.find(t => t.value === card.cardType).name}</p>
                    <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                        ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                    </p>
                </div>
            </div>
        `).join('');
    }
    
    // دالة التحقق من انتهاء الصلاحية
    function isExpired(card) {
        const [month, year] = card.expiryDate.split('/');
        const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
        const today = new Date();
        
        return expiryDate < today;
    }
    
    // دالة البحث عن البطاقات
    function searchCards(query) {
        const lowerQuery = query.toLowerCase();
        
        return cards.filter(card => 
            card.investorName.toLowerCase().includes(lowerQuery) ||
            card.cardNumber.includes(query) ||
            cardTypes.find(t => t.value === card.cardType).name.toLowerCase().includes(lowerQuery)
        );
    }
    
    // دالة فلترة البطاقات حسب النوع
    function filterByType(type) {
        if(type === 'all') {
            renderCards();
        } else {
            const filteredCards = cards.filter(card => card.cardType === type);
            const cardsGrid = document.getElementById('cardsGrid');
            
            cardsGrid.innerHTML = filteredCards.map(card => `
                <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
                    ${renderCard(card)}
                    <div class="card-info-overlay">
                        <h4>${card.investorName}</h4>
                        <p>${cardTypes.find(t => t.value === card.cardType).name}</p>
                        <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                            ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                        </p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // دالة عرض تفاصيل البطاقة
    function viewCardDetails(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        recordActivity('view', card);
        
        showPage('card-detail');
        
        const detailContainer = document.getElementById('cardDetailContainer');
        if(!detailContainer) return;
        
        const investor = window.investors.find(inv => inv.id === card.investorId);
        const cardType = cardTypes.find(t => t.value === card.cardType);
        
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
                                <span>${cardType.name}</span>
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
                                    <span class="pin-code">****</span>
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
                                <span>${investor.phone}</span>
                            </div>
                            <div class="info-item">
                                <label>البريد الإلكتروني:</label>
                                <span>${investor.email || 'غير محدد'}</span>
                            </div>
                            <div class="info-item">
                                <label>العنوان:</label>
                                <span>${investor.address}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3>سجل الأنشطة</h3>
                        <div class="activities-list">
                            ${activities
                                .filter(a => a.cardId === card.id)
                                .slice(0, 10)
                                .map(activity => `
                                    <div class="activity-item">
                                        <div class="activity-icon ${activity.action}">
                                            <i class="fas ${getActivityIcon(activity.action)}"></i>
                                        </div>
                                        <div class="activity-details">
                                            <div class="activity-action">${getActivityName(activity.action)}</div>
                                            <div class="activity-time">${formatDate(activity.timestamp)} ${formatTime(activity.timestamp)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // دالة قلب البطاقة
    function flipCard(cardId) {
        const cardElement = document.querySelector(`.investor-card[data-card-id="${cardId}"]`);
        if(cardElement) {
            cardElement.classList.toggle('flipped');
        }
    }
    
    // دالة طباعة البطاقة
    function printCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        recordActivity('print', card);
        
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
    }
    
    // دالة مشاركة البطاقة
    function shareCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        recordActivity('share', card);
        
        const shareData = {
            cardNumber: card.cardNumber,
            investorName: card.investorName,
            type: card.cardType,
            expiryDate: card.expiryDate,
            issuer: 'شركة الاستثمار العراقية'
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">مشاركة البطاقة</h2>
                    <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="share-options">
                        <div class="share-option" onclick="shareViaQR('${cardId}')">
                            <i class="fas fa-qrcode fa-3x"></i>
                            <p>QR Code</p>
                        </div>
                        <div class="share-option" onclick="shareViaEmail('${cardId}')">
                            <i class="fas fa-envelope fa-3x"></i>
                            <p>بريد إلكتروني</p>
                        </div>
                        <div class="share-option" onclick="shareViaText('${cardId}')">
                            <i class="fas fa-copy fa-3x"></i>
                            <p>نسخ النص</p>
                        </div>
                        <div class="share-option" onclick="exportCardJSON('${cardId}')">
                            <i class="fas fa-file-export fa-3x"></i>
                            <p>تصدير JSON</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // دالة إيقاف البطاقة
    function suspendCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        card.status = 'suspended';
        saveCards();
        recordActivity('suspend', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم إيقاف البطاقة بنجاح', 'success');
    }
    
    // دالة تفعيل البطاقة
    function activateCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        card.status = 'active';
        saveCards();
        recordActivity('activate', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم تفعيل البطاقة بنجاح', 'success');
    }
    
    // دالة تجديد البطاقة
    function renewCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        card.expiryDate = calculateExpiryDate();
        card.status = 'active';
        saveCards();
        recordActivity('renew', card);
        
        viewCardDetails(cardId);
        
        createNotification('نجاح', 'تم تجديد البطاقة بنجاح', 'success');
    }
    
    // دالة حذف البطاقة
    function deleteCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if(!card) return;
        
        if(!confirm('هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }
        
        cards = cards.filter(c => c.id !== cardId);
        saveCards();
        recordActivity('delete', card);
        
        showPage('investor-cards');
        renderCards();
        
        createNotification('نجاح', 'تم حذف البطاقة بنجاح', 'success');
    }
    
    // دالة تهيئة ماسح الباركود
    function initBarcodeScanner() {
        const reader = document.getElementById('reader');
        if(!reader) return;
        
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
                
                if(cardData.cardNumber) {
                    const card = cards.find(c => c.cardNumber === cardData.cardNumber);
                    
                    if(card) {
                        html5QrcodeScanner.clear();
                        viewCardDetails(card.id);
                        recordActivity('scan', card);
                        
                        if(settings.scannerOptions.sound) {
                            playSound('success');
                        }
                        
                        if(settings.scannerOptions.vibrate && navigator.vibrate) {
                            navigator.vibrate(200);
                        }
                    } else {
                        createNotification('خطأ', 'البطاقة غير موجودة في النظام', 'danger');
                    }
                }
            } catch(e) {
                console.error('خطأ في قراءة QR Code:', e);
                createNotification('خطأ', 'تعذر قراءة البيانات من QR Code', 'danger');
            }
        }, (error) => {
            console.warn(`خطأ في المسح: ${error}`);
        });
    }
    
    // دالة البحث اليدوي عن البطاقة
    function manualSearch() {
        const searchInput = document.getElementById('manualSearchInput');
        if(!searchInput || !searchInput.value) return;
        
        const searchValue = searchInput.value.trim();
        const card = cards.find(c => 
            c.cardNumber.replace(/\s/g, '') === searchValue.replace(/\s/g, '') ||
            c.id === searchValue
        );
        
        if(card) {
            viewCardDetails(card.id);
            recordActivity('manual_search', card);
        } else {
            createNotification('خطأ', 'البطاقة غير موجودة', 'danger');
        }
    }
    
    // دالة إنشاء بطاقة جديدة من النموذج
    function createNewCard() {
        const form = document.getElementById('newCardForm');
        if(!form) return;
        
        const formData = new FormData(form);
        const investorId = formData.get('investorSelect');
        const cardType = formData.get('cardType');
        
        if(!investorId) {
            createNotification('خطأ', 'يرجى اختيار المستثمر', 'danger');
            return;
        }
        
        const options = {
            years: parseInt(formData.get('cardValidity')),
            hasQRCode: formData.get('hasQRCode') === 'on',
            hasChip: formData.get('hasChip') === 'on',
            hasHologram: formData.get('hasHologram') === 'on',
            hasPINCode: formData.get('hasPINCode') === 'on'
        };
        
        try {
            const card = createCard(investorId, cardType, options);
            viewCardDetails(card.id);
            createNotification('نجاح', 'تم إنشاء البطاقة بنجاح', 'success');
        } catch(error) {
            createNotification('خطأ', error.message, 'danger');
        }
    }
    
    // دالة معاينة البطاقة
    function updateCardPreview() {
        const form = document.getElementById('newCardForm');
        if(!form) return;
        
        const formData = new FormData(form);
        const investorId = formData.get('investorSelect');
        const cardType = formData.get('cardType');
        
        const previewContainer = document.getElementById('cardPreviewContainer');
        if(!previewContainer) return;
        
        if(!investorId) {
            previewContainer.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-credit-card fa-3x"></i>
                    <p>اختر المستثمر لمعاينة البطاقة</p>
                </div>
            `;
            return;
        }
        
        const investor = window.investors.find(inv => inv.id === investorId);
        if(!investor) return;
        
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
            cardColors: cardTypes.find(t => t.value === cardType).colors
        };
        
        previewContainer.innerHTML = renderCard(previewCard);
    }
    
    // دالة حساب الإحصائيات
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
        
        cardTypes.forEach(type => {
            stats.byType[type.value] = {
                name: type.name,
                count: cards.filter(c => c.cardType === type.value).length
            };
        });
        
        return stats;
    }
    
    // دالة عرض الإحصائيات
    function renderCardStats() {
        const stats = calculateStats();
        const statsContainer = document.getElementById('statsContainer');
        
        if(!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCards}</div>
                    <div class="stat-label">إجمالي البطاقات</div>
                    <div class="stat-icon primary">
                        <i class="fas fa-credit-card"></i>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.activeCards}</div>
                    <div class="stat-label">البطاقات النشطة</div>
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.expiredCards}</div>
                    <div class="stat-label">البطاقات المنتهية</div>
                    <div class="stat-icon danger">
                        <i class="fas fa-times-circle"></i>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.suspendedCards}</div>
                    <div class="stat-label">البطاقات الموقوفة</div>
                    <div class="stat-icon warning">
                        <i class="fas fa-pause-circle"></i>
                    </div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-container">
                    <h3>توزيع البطاقات حسب النوع</h3>
                    <canvas id="cardTypesChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>البطاقات الصادرة شهرياً</h3>
                    <canvas id="monthlyCardsChart"></canvas>
                </div>
            </div>
            
            <div class="activities-container">
                <h3>آخر الأنشطة</h3>
                <div class="activities-list">
                    ${stats.recentActivities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon ${activity.action}">
                                <i class="fas ${getActivityIcon(activity.action)}"></i>
                            </div>
                            <div class="activity-details">
                                <div class="activity-action">${getActivityName(activity.action)}</div>
                                <div class="activity-investor">${activity.investorName}</div>
                                <div class="activity-time">${formatDate(activity.timestamp)} ${formatTime(activity.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // رسم الرسوم البيانية
        renderCharts(stats);
    }
    
    // دالة رسم الرسوم البيانية
    function renderCharts(stats) {
        // رسم بياني دائري لأنواع البطاقات
        const typesCtx = document.getElementById('cardTypesChart');
        if(typesCtx) {
            new Chart(typesCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.values(stats.byType).map(t => t.name),
                    datasets: [{
                        data: Object.values(stats.byType).map(t => t.count),
                        backgroundColor: cardTypes.map(t => t.colors.primary)
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
        
        // رسم بياني خطي للبطاقات الصادرة شهرياً
        const monthlyCtx = document.getElementById('monthlyCardsChart');
        if(monthlyCtx) {
            const monthlyData = getMonthlyCardData();
            
            new Chart(monthlyCtx, {
                type: 'line',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'البطاقات الصادرة',
                        data: monthlyData.data,
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
    
    // دالة الحصول على بيانات البطاقات الشهرية
    function getMonthlyCardData() {
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const last6Months = [];
        const data = [];
        
        for(let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            last6Months.push(monthYear);
            
            const monthCards = cards.filter(card => {
                const cardDate = new Date(card.issueDate);
                return cardDate.getMonth() === date.getMonth() && 
                       cardDate.getFullYear() === date.getFullYear();
            }).length;
            
            data.push(monthCards);
        }
        
        return {
            labels: last6Months,
            data: data
        };
    }
    
    // دالة الحصول على أيقونة النشاط
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
    
    // دالة الحصول على اسم النشاط
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
    
    // دالة تهيئة النظام
    function init() {
        // تحميل البيانات المحفوظة
        loadCards();
        loadActivities();
        
        // إضافة عناصر القائمة
        const sidebar = document.querySelector('.sidebar-menu');
        if(sidebar) {
            const cardMenuCategory = `
                <div class="menu-category">بطاقات المستثمرين</div>
                <a href="#investor-cards" class="menu-item" onclick="showPage('investor-cards')">
                    <span class="menu-icon"><i class="fas fa-id-card"></i></span>
                    <span>كل البطاقات</span>
                </a>
                <a href="#active-cards" class="menu-item" onclick="showPage('active-cards')">
                    <span class="menu-icon"><i class="fas fa-check-circle"></i></span>
                    <span>البطاقات النشطة</span>
                </a>
                <a href="#expired-cards" class="menu-item" onclick="showPage('expired-cards')">
                    <span class="menu-icon"><i class="fas fa-times-circle"></i></span>
                    <span>البطاقات المنتهية</span>
                </a>
                <a href="#barcode-scanner" class="menu-item" onclick="showPage('barcode-scanner')">
                    <span class="menu-icon"><i class="fas fa-qrcode"></i></span>
                    <span>مسح الباركود</span>
                </a>
                <a href="#new-card" class="menu-item" onclick="showPage('new-card')">
                    <span class="menu-icon"><i class="fas fa-plus-circle"></i></span>
                    <span>بطاقة جديدة</span>
                </a>
                <a href="#card-stats" class="menu-item" onclick="showPage('card-stats')">
                    <span class="menu-icon"><i class="fas fa-chart-pie"></i></span>
                    <span>إحصائيات البطاقات</span>
                </a>
            `;
            
            // إضافة القائمة قبل قسم النظام
            const systemCategory = sidebar.querySelector('.menu-category:nth-last-child(2)');
            if(systemCategory) {
                systemCategory.insertAdjacentHTML('beforebegin', cardMenuCategory);
            }
        }
        
        // إضافة صفحات البطاقات
        const content = document.querySelector('.content');
        if(content) {
            const cardPages = `
                <div id="investor-cards-page" class="page">
                    <div class="header">
                        <h1 class="page-title">بطاقات المستثمرين</h1>
                        <div class="header-actions">
                            <div class="search-bar">
                                <input type="text" class="search-input" placeholder="بحث عن بطاقة..." oninput="InvestorCardSystem.handleSearch(this.value)">
                                <i class="fas fa-search search-icon"></i>
                            </div>
                            <select class="form-select" onchange="InvestorCardSystem.filterByType(this.value)">
                                <option value="all">جميع الأنواع</option>
                                ${cardTypes.map(type => `
                                    <option value="${type.value}">${type.name}</option>
                                `).join('')}
                            </select>
                            <button class="btn btn-primary" onclick="showPage('new-card')">
                                <i class="fas fa-plus"></i> بطاقة جديدة
                            </button>
                        </div>
                    </div>
                    <div class="cards-grid" id="cardsGrid">
                        <!-- البطاقات ستعرض هنا -->
                    </div>
                </div>
                
                <div id="active-cards-page" class="page">
                    <div class="header">
                        <h1 class="page-title">البطاقات النشطة</h1>
                        <div class="header-actions">
                            <div class="search-bar">
                                <input type="text" class="search-input" placeholder="بحث..." oninput="InvestorCardSystem.handleSearch(this.value, 'active')">
                                <i class="fas fa-search search-icon"></i>
                            </div>
                            <button class="btn btn-primary" onclick="showPage('new-card')">
                                <i class="fas fa-plus"></i> بطاقة جديدة
                            </button>
                        </div>
                    </div>
                    <div class="cards-grid" id="activeCardsGrid">
                        <!-- البطاقات النشطة ستعرض هنا -->
                    </div>
                </div>
                
                <div id="expired-cards-page" class="page">
                    <div class="header">
                        <h1 class="page-title">البطاقات المنتهية</h1>
                        <div class="header-actions">
                            <div class="search-bar">
                                <input type="text" class="search-input" placeholder="بحث..." oninput="InvestorCardSystem.handleSearch(this.value, 'expired')">
                                <i class="fas fa-search search-icon"></i>
                            </div>
                            <button class="btn btn-warning" onclick="InvestorCardSystem.renewAllExpired()">
                                <i class="fas fa-redo"></i> تجديد الكل
                            </button>
                        </div>
                    </div>
                    <div class="cards-grid" id="expiredCardsGrid">
                        <!-- البطاقات المنتهية ستعرض هنا -->
                    </div>
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
                                <input type="text" class="form-control" id="manualSearchInput" placeholder="أدخل رقم البطاقة">
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
                                    <select class="form-select" name="investorSelect" required onchange="InvestorCardSystem.updateCardPreview()">
                                        <option value="">اختر المستثمر</option>
                                        <!-- سيتم ملؤها من JavaScript -->
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
                                
                                <div class="form-group">
                                    <label class="form-label">خيارات إضافية</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="hasQRCode" onchange="InvestorCardSystem.updateCardPreview()">
                                            إضافة QR Code
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="hasChip" checked onchange="InvestorCardSystem.updateCardPreview()">
                                            شريحة ذكية
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="hasHologram" onchange="InvestorCardSystem.updateCardPreview()">
                                            هولوغرام
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" name="hasPINCode" onchange="InvestorCardSystem.updateCardPreview()">
                                            رقم PIN
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>معاينة البطاقة</h3>
                                <div id="cardPreviewContainer">
                                    <!-- معاينة البطاقة ستظهر هنا -->
                                </div>
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
                
                <div id="card-stats-page" class="page">
                    <div class="header">
                        <h1 class="page-title">إحصائيات البطاقات</h1>
                        <div class="header-actions">
                            <button class="btn btn-light" onclick="InvestorCardSystem.exportStats()">
                                <i class="fas fa-file-export"></i> تصدير التقرير
                            </button>
                        </div>
                    </div>
                    <div id="statsContainer">
                        <!-- الإحصائيات ستعرض هنا -->
                    </div>
                </div>
                
                <div id="card-detail-page" class="page">
                    <div class="header">
                        <h1 class="page-title">تفاصيل البطاقة</h1>
                        <div class="header-actions">
                            <button class="btn btn-light" onclick="showPage('investor-cards')">
                                <i class="fas fa-arrow-right"></i> رجوع
                            </button>
                        </div>
                    </div>
                    <div id="cardDetailContainer">
                        <!-- تفاصيل البطاقة ستعرض هنا -->
                    </div>
                </div>
            `;
            
            content.insertAdjacentHTML('beforeend', cardPages);
        }
        
        // إضافة أنماط CSS للبطاقات
        const style = document.createElement('style');
        style.textContent = getCardStyles();
        document.head.appendChild(style);
        
        // إضافة زر إضافة عائم
        const floatingButton = `
            <div class="floating-add-button" onclick="showPage('new-card')">
                <i class="fas fa-plus"></i>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', floatingButton);
        
        // مزامنة مع Firebase إذا كان متاحاً
        if(window.firebaseApp && window.firebaseApp.user) {
            firebase.database().ref('investorCards').on('value', (snapshot) => {
                const firebaseCards = snapshot.val();
                if(firebaseCards) {
                    cards = Object.values(firebaseCards);
                    renderCards();
                }
            });
            
            firebase.database().ref('cardActivities').on('value', (snapshot) => {
                const firebaseActivities = snapshot.val();
                if(firebaseActivities) {
                    activities = Object.values(firebaseActivities);
                }
            });
        }
        
        // تحديث showPage لدعم صفحات البطاقات
        const originalShowPage = window.showPage;
        window.showPage = function(pageId) {
            originalShowPage(pageId);
            
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
        };
    }
    
    // دالة تحديث قائمة المستثمرين
    function updateInvestorSelect() {
        const select = document.querySelector('select[name="investorSelect"]');
        if(!select) return;
        
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        if(window.investors) {
            window.investors.forEach(investor => {
                select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
            });
        }
    }
    
    // دالة البحث
    function handleSearch(query, filter = 'all') {
        if(!query) {
            renderCards(filter);
            return;
        }
        
        const results = searchCards(query);
        const gridId = filter === 'active' ? 'activeCardsGrid' : 
                       filter === 'expired' ? 'expiredCardsGrid' : 'cardsGrid';
        const grid = document.getElementById(gridId);
        
        if(!grid) return;
        
        let filteredResults = results;
        if(filter === 'active') {
            filteredResults = results.filter(card => card.status === 'active' && !isExpired(card));
        } else if(filter === 'expired') {
            filteredResults = results.filter(card => isExpired(card));
        }
        
        if(filteredResults.length === 0) {
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
                    <h4>${card.investorName}</h4>
                    <p>${cardTypes.find(t => t.value === card.cardType).name}</p>
                    <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                        ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                    </p>
                </div>
            </div>
        `).join('');
    }
    
    // دالة تجديد جميع البطاقات المنتهية
    function renewAllExpired() {
        const expiredCards = cards.filter(card => isExpired(card));
        
        if(expiredCards.length === 0) {
            createNotification('تنبيه', 'لا توجد بطاقات منتهية الصلاحية', 'warning');
            return;
        }
        
        if(!confirm(`سيتم تجديد ${expiredCards.length} بطاقة. هل تريد المتابعة؟`)) {
            return;
        }
        
        expiredCards.forEach(card => {
            card.expiryDate = calculateExpiryDate();
            card.status = 'active';
            recordActivity('renew', card);
        });
        
        saveCards();
        renderCards('expired');
        
        createNotification('نجاح', `تم تجديد ${expiredCards.length} بطاقة بنجاح`, 'success');
    }
    
    // دالة الحصول على أنماط CSS
    function getCardStyles() {
        return `
            /* أنماط البطاقات */
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            
            .card-item {
                position: relative;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .card-item:hover {
                transform: translateY(-5px);
            }
            
            .card-info-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.8);
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
            
            .investor-card {
                width: 350px;
                height: 220px;
                border-radius: 15px;
                position: relative;
                perspective: 1000px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
            
            /* أنماط إضافية */
            .empty-state {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .empty-state i {
                color: #ddd;
                margin-bottom: 20px;
            }
            
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
            
            .form-section {
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .form-section h3 {
                margin-bottom: 15px;
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
            
            .checkbox-label input[type="checkbox"] {
                margin: 0;
            }
            
            #cardPreviewContainer {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 250px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .empty-preview {
                text-align: center;
                color: #6c757d;
            }
            
            .empty-preview i {
                color: #dee2e6;
                margin-bottom: 10px;
            }
            
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
            
            .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
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
                font-size: 1.2rem;
            }
            
            .activity-icon.create {
                background: #d4edda;
                color: #155724;
            }
            
            .activity-icon.view {
                background: #cce5ff;
                color: #004085;
            }
            
            .activity-icon.print {
                background: #e2e3e5;
                color: #383d41;
            }
            
            .activity-icon.share {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .activity-icon.suspend {
                background: #fff3cd;
                color: #856404;
            }
            
            .activity-icon.activate {
                background: #d4edda;
                color: #155724;
            }
            
            .activity-icon.renew {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .activity-icon.delete {
                background: #f8d7da;
                color: #721c24;
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
            
            /* إحصائيات */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                position: relative;
                overflow: hidden;
            }
            
            .stat-value {
                font-size: 2.5rem;
                font-weight: 700;
                color: #343a40;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 1rem;
                color: #6c757d;
            }
            
            .stat-icon {
                position: absolute;
                top: 20px;
                left: 20px;
                font-size: 3rem;
                opacity: 0.1;
            }
            
            .stat-icon.primary {
                color: #007bff;
            }
            
            .stat-icon.success {
                color: #28a745;
            }
            
            .stat-icon.danger {
                color: #dc3545;
            }
            
            .stat-icon.warning {
                color: #ffc107;
            }
            
            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .chart-container {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .chart-container h3 {
                margin-bottom: 20px;
                color: #343a40;
                text-align: center;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 300px !important;
            }
            
            /* زر إضافة عائم */
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
            
            /* خيارات المشاركة */
            .share-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            
            .share-option {
                text-align: center;
                padding: 20px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .share-option:hover {
                background: #f8f9fa;
                border-color: #007bff;
                transform: translateY(-2px);
            }
            
            .share-option i {
                color: #007bff;
                margin-bottom: 10px;
            }
            
            .share-option p {
                margin: 0;
                color: #343a40;
                font-weight: 600;
            }
            
            /* وضع الطباعة */
            @media print {
                .header-actions,
                .card-actions,
                .card-flip-button,
                .floating-add-button {
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
            }
        `;
    }
    
    // دالة تنسيق التاريخ
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ');
    }
    
    // دالة تنسيق الوقت
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-IQ');
    }
    
    // دالة إنشاء إشعار
    function createNotification(title, message, type) {
        // استخدام دالة الإشعارات من النظام الرئيسي إذا كانت متاحة
        if(window.createNotification) {
            window.createNotification(title, message, type);
        } else {
            // بديل بسيط للإشعارات
            const notification = document.createElement('div');
            notification.className = `alert alert-${type}`;
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '9999';
            notification.style.minWidth = '300px';
            notification.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'times' : 'info'}-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-text">${message}</div>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }
    }
    
    // الواجهة العامة للنظام
    return {
        init: init,
        createCard: createCard,
        renderCards: renderCards,
        viewCardDetails: viewCardDetails,
        printCard: printCard,
        shareCard: shareCard,
        flipCard: flipCard,
        deleteCard: deleteCard,
        suspendCard: suspendCard,
        activateCard: activateCard,
        renewCard: renewCard,
        searchCards: searchCards,
        filterByType: filterByType,
        initBarcodeScanner: initBarcodeScanner,
        manualSearch: manualSearch,
        createNewCard: createNewCard,
        updateCardPreview: updateCardPreview,
        updateInvestorSelect: updateInvestorSelect,
        renderCardStats: renderCardStats,
        handleSearch: handleSearch,
        renewAllExpired: renewAllExpired,
        cards: cards, // لأغراض التصحيح
        activities: activities, // لأغراض التصحيح
        exportStats: function() {
            const stats = calculateStats();
            const blob = new Blob([JSON.stringify(stats, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `card_statistics_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        }
    };
})();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    InvestorCardSystem.init();
});
