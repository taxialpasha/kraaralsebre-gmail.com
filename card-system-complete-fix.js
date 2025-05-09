// card-system-complete-fix.js - إصلاح شامل لنظام بطاقات المستثمرين

(function() {
    // ننتظر تحميل المستند بالكامل
    document.addEventListener('DOMContentLoaded', function() {
        console.log('⚡ بدء الإصلاح الشامل لنظام البطاقات...');
        
        // نؤخر التنفيذ قليلاً للتأكد من تحميل جميع المكونات
        setTimeout(initCompleteCardSystemFix, 500);
    });
    
    // دالة التهيئة الرئيسية للإصلاح الشامل
    function initCompleteCardSystemFix() {
        console.log('🔍 فحص نظام البطاقات...');
        
        if (typeof InvestorCardSystem === 'undefined') {
            console.error('❌ فشل الإصلاح: نظام بطاقات المستثمرين غير موجود!');
            showSystemError('نظام البطاقات غير متاح. يرجى التحقق من تحميل جميع الملفات اللازمة.');
            return;
        }
        
        console.log('✅ تم العثور على نظام البطاقات - بدء الإصلاح الشامل');
        
        // 1. إصلاح مشكلة تحميل بيانات المستثمرين
        fixInvestorsLoading();
        
        // 2. إصلاح مشكلة إنشاء وحفظ البطاقات
        fixCardCreationAndStorage();
        
        // 3. إصلاح مشكلة عرض البطاقات
        fixCardRendering();
        
        // 4. إصلاح مشكلة التنقل بين صفحات البطاقات
        fixCardNavigation();
        
        // 5. إضافة دوال مساعدة ووظائف إضافية
        addHelperFunctions();
        
        // تنفيذ الإصلاح الشامل
        applyCompleteFix();
        
        console.log('🎉 تم تطبيق الإصلاح الشامل لنظام البطاقات بنجاح!');
    }
    
    // 1. إصلاح مشكلة تحميل بيانات المستثمرين
    function fixInvestorsLoading() {
        console.log('🔄 إصلاح تحميل بيانات المستثمرين...');
        
        const originalUpdateInvestorSelect = InvestorCardSystem.updateInvestorSelect;
        
        // تحسين دالة تحديث قائمة المستثمرين
        InvestorCardSystem.updateInvestorSelect = function() {
            console.log('📋 جاري تحديث قائمة المستثمرين...');
            
            const select = document.querySelector('select[name="investorSelect"]');
            if (!select) {
                console.error('❌ عنصر اختيار المستثمر غير موجود!');
                return;
            }
            
            // إعادة تعيين القائمة
            select.innerHTML = '<option value="">اختر المستثمر</option>';
            
            // 1. محاولة جلب المستثمرين من مصادر متعددة
            let investorsLoaded = false;
            
            // محاولة من window.investors أولاً
            if (window.investors && Array.isArray(window.investors) && window.investors.length > 0) {
                console.log(`✅ تم العثور على ${window.investors.length} مستثمر في النظام`);
                window.investors.forEach(investor => {
                    select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
                });
                investorsLoaded = true;
            } else {
                console.log('⚠️ لم يتم العثور على مستثمرين في window.investors');
            }
            
            // إذا لم يتم تحميل المستثمرين، حاول من localStorage
            if (!investorsLoaded) {
                try {
                    const storedInvestors = localStorage.getItem('investors');
                    if (storedInvestors) {
                        const investors = JSON.parse(storedInvestors);
                        if (Array.isArray(investors) && investors.length > 0) {
                            console.log(`✅ تم العثور على ${investors.length} مستثمر في التخزين المحلي`);
                            
                            investors.forEach(investor => {
                                select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
                            });
                            
                            // تحديث window.investors إذا لم يكن موجوداً
                            if (!window.investors || !Array.isArray(window.investors)) {
                                window.investors = investors;
                                console.log('📝 تم تحديث window.investors من التخزين المحلي');
                            }
                            
                            investorsLoaded = true;
                        }
                    }
                } catch (error) {
                    console.error('❌ خطأ في تحميل المستثمرين من التخزين المحلي:', error);
                }
            }
            
            // إذا لم يتم تحميل المستثمرين، أعرض رسالة مناسبة
            if (!investorsLoaded || select.querySelectorAll('option').length <= 1) {
                console.warn('⚠️ لم يتم العثور على أي مستثمرين!');
                
                // إضافة خيار للإشارة إلى عدم وجود مستثمرين
                select.innerHTML += `<option value="" disabled>لم يتم العثور على مستثمرين</option>`;
                
                // إضافة تنبيه وزر للانتقال لإضافة مستثمر
                const formSection = select.closest('.form-section');
                if (formSection) {
                    // إزالة أي تنبيهات سابقة
                    const existingWarning = formSection.querySelector('.alert.alert-warning');
                    if (existingWarning) {
                        existingWarning.remove();
                    }
                    
                    // إضافة تنبيه جديد
                    const noInvestorsWarning = document.createElement('div');
                    noInvestorsWarning.className = 'alert alert-warning';
                    noInvestorsWarning.innerHTML = `
                        <div class="alert-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">تنبيه</div>
                            <div class="alert-text">
                                لم يتم العثور على مستثمرين. قم بإضافة مستثمرين أولاً قبل إنشاء البطاقات.
                            </div>
                        </div>
                    `;
                    formSection.appendChild(noInvestorsWarning);
                    
                    // إضافة زر الانتقال لصفحة المستثمرين
                    const addInvestorButton = document.createElement('button');
                    addInvestorButton.className = 'btn btn-primary';
                    addInvestorButton.innerHTML = '<i class="fas fa-user-plus"></i> إضافة مستثمر جديد';
                    addInvestorButton.onclick = function(e) {
                        e.preventDefault();
                        showPage('investors');
                    };
                    formSection.appendChild(addInvestorButton);
                }
            }
        };
    }
    
    // 2. إصلاح مشكلة إنشاء وحفظ البطاقات
    function fixCardCreationAndStorage() {
        console.log('🔄 إصلاح عملية إنشاء وحفظ البطاقات...');
        
        // إصلاح دالة إنشاء البطاقة الجديدة
        const originalCreateNewCard = InvestorCardSystem.createNewCard;
        
        InvestorCardSystem.createNewCard = function() {
            console.log('🔄 جاري إنشاء بطاقة جديدة...');
            
            const form = document.getElementById('newCardForm');
            if (!form) {
                console.error('❌ نموذج إنشاء البطاقة غير موجود!');
                return;
            }
            
            const formData = new FormData(form);
            const investorId = formData.get('investorSelect');
            const cardType = formData.get('cardType');
            
            if (!investorId) {
                showError('يرجى اختيار المستثمر');
                return;
            }
            
            // تجهيز خيارات البطاقة
            const options = {
                years: parseInt(formData.get('cardValidity')),
                hasQRCode: formData.get('hasQRCode') === 'on',
                hasChip: formData.get('hasChip') === 'on',
                hasHologram: formData.get('hasHologram') === 'on',
                hasPINCode: formData.get('hasPINCode') === 'on'
            };
            
            try {
                console.log('🔄 إنشاء بطاقة جديدة للمستثمر:', investorId, 'من النوع:', cardType);
                
                // استخدام دالة createCard المصححة
                const card = createCardFixed(investorId, cardType, options);
                
                if (card) {
                    console.log('✅ تم إنشاء البطاقة بنجاح:', card.id);
                    
                    // حفظ البطاقات بعد الإنشاء
                    saveCardsFixed();
                    
                    // عرض رسالة نجاح
                    showSuccess('تم إنشاء البطاقة بنجاح');
                    
                    // الانتقال إلى صفحة تفاصيل البطاقة أو عرض البطاقات
                    setTimeout(() => {
                        // عرض تفاصيل البطاقة المنشأة
                        InvestorCardSystem.viewCardDetails(card.id);
                        
                        // تحديث عرض البطاقات بعد الإنشاء
                        renderCardsFixed('all');
                    }, 500);
                    
                    return card;
                } else {
                    console.error('❌ فشل في إنشاء البطاقة: لم يتم إرجاع كائن البطاقة');
                    showError('حدث خطأ أثناء إنشاء البطاقة. يرجى المحاولة مرة أخرى.');
                }
            } catch (error) {
                console.error('❌ خطأ أثناء إنشاء البطاقة:', error);
                showError(error.message || 'حدث خطأ أثناء إنشاء البطاقة');
            }
        };
        
        // دالة createCard المصححة
        function createCardFixed(investorId, cardType, options) {
            console.log('🔄 إنشاء بطاقة باستخدام الدالة المصححة...');
            
            // التحقق من وجود المستثمر
            let investor = null;
            
            if (window.investors && Array.isArray(window.investors)) {
                investor = window.investors.find(inv => inv.id === investorId);
            }
            
            if (!investor) {
                console.error('❌ المستثمر غير موجود:', investorId);
                throw new Error('المستثمر غير موجود');
            }
            
            // التأكد من تحميل البطاقات الحالية
            loadCardsFixed();
            
            // توليد معرف فريد للبطاقة
            const cardId = generateId();
            
            // إنشاء كائن البطاقة الجديدة
            const card = {
                id: cardId,
                cardNumber: generateCardNumber(),
                cardType: cardType || 'platinum',
                investorId: investorId,
                investorName: investor.name,
                expiryDate: calculateExpiryDate(options.years || 3),
                cvv: generateCVV(),
                status: 'active',
                issueDate: new Date().toISOString().split('T')[0],
                lastUsed: null,
                hasQRCode: options.hasQRCode || false,
                hasChip: options.hasChip || true,
                hasHologram: options.hasHologram || false,
                pinCode: options.hasPINCode ? generatePIN() : null,
                // لون البطاقة حسب نوعها
                cardColors: getCardTypeColors(cardType)
            };
            
            // إضافة البطاقة إلى مصفوفة البطاقات
            if (!Array.isArray(InvestorCardSystem.cards)) {
                InvestorCardSystem.cards = [];
            }
            
            InvestorCardSystem.cards.push(card);
            console.log('📝 تمت إضافة البطاقة إلى المصفوفة. عدد البطاقات الآن:', InvestorCardSystem.cards.length);
            
            // تسجيل نشاط إنشاء البطاقة
            recordActivity('create', card);
            
            // حفظ البطاقات
            saveCardsFixed();
            
            return card;
        }
        
        // دالة حفظ البطاقات المصححة
        function saveCardsFixed() {
            console.log('💾 حفظ البطاقات باستخدام الدالة المصححة...');
            
            if (!Array.isArray(InvestorCardSystem.cards)) {
                console.error('❌ مصفوفة البطاقات غير صالحة');
                return;
            }
            
            try {
                // حفظ نسخة من البطاقات في التخزين المحلي
                localStorage.setItem('investorCards', JSON.stringify(InvestorCardSystem.cards));
                console.log('✅ تم حفظ', InvestorCardSystem.cards.length, 'بطاقة في التخزين المحلي');
                
                // محاولة المزامنة مع Firebase إذا كان متاحاً
                if (window.firebase && window.firebase.database) {
                    try {
                        const cardsRef = firebase.database().ref('investorCards');
                        cardsRef.set(InvestorCardSystem.cards);
                        console.log('✅ تم مزامنة البطاقات مع Firebase');
                    } catch (fbError) {
                        console.error('❌ خطأ أثناء المزامنة مع Firebase:', fbError);
                    }
                }
                
                return true;
            } catch (error) {
                console.error('❌ خطأ أثناء حفظ البطاقات:', error);
                // محاولة حفظ البطاقات بطريقة بديلة
                try {
                    for (let i = 0; i < InvestorCardSystem.cards.length; i++) {
                        localStorage.setItem(`card_${i}`, JSON.stringify(InvestorCardSystem.cards[i]));
                    }
                    localStorage.setItem('cardsCount', InvestorCardSystem.cards.length.toString());
                    console.log('✅ تم حفظ البطاقات بطريقة بديلة');
                    return true;
                } catch (backupError) {
                    console.error('❌ فشل الحفظ البديل للبطاقات:', backupError);
                    return false;
                }
            }
        }
        
        // دالة تحميل البطاقات المصححة
        function loadCardsFixed() {
            console.log('🔄 تحميل البطاقات من التخزين...');
            
            try {
                // محاولة تحميل البطاقات من التخزين المحلي
                const storedCards = localStorage.getItem('investorCards');
                
                if (storedCards) {
                    const parsedCards = JSON.parse(storedCards);
                    
                    if (Array.isArray(parsedCards)) {
                        InvestorCardSystem.cards = parsedCards;
                        console.log('✅ تم تحميل', parsedCards.length, 'بطاقة من التخزين المحلي');
                        return true;
                    } else {
                        console.error('❌ البطاقات المخزنة ليست مصفوفة صالحة');
                    }
                } else {
                    console.log('⚠️ لم يتم العثور على بطاقات في التخزين المحلي');
                    
                    // محاولة استرداد البطاقات من الطريقة البديلة
                    const cardsCount = parseInt(localStorage.getItem('cardsCount') || '0');
                    
                    if (cardsCount > 0) {
                        const recoveredCards = [];
                        
                        for (let i = 0; i < cardsCount; i++) {
                            const cardData = localStorage.getItem(`card_${i}`);
                            if (cardData) {
                                try {
                                    const card = JSON.parse(cardData);
                                    recoveredCards.push(card);
                                } catch (parseError) {
                                    console.error('❌ خطأ في تحليل البطاقة:', parseError);
                                }
                            }
                        }
                        
                        if (recoveredCards.length > 0) {
                            InvestorCardSystem.cards = recoveredCards;
                            console.log('✅ تم استرداد', recoveredCards.length, 'بطاقة من التخزين البديل');
                            
                            // حفظ البطاقات المستردة بالطريقة العادية
                            saveCardsFixed();
                            return true;
                        }
                    }
                }
                
                // إذا لم يتم العثور على بطاقات، قم بتهيئة مصفوفة فارغة
                if (!Array.isArray(InvestorCardSystem.cards)) {
                    InvestorCardSystem.cards = [];
                    console.log('🔄 تهيئة مصفوفة بطاقات فارغة');
                }
                
                return true;
            } catch (error) {
                console.error('❌ خطأ أثناء تحميل البطاقات:', error);
                
                // تهيئة مصفوفة فارغة في حالة الخطأ
                InvestorCardSystem.cards = [];
                return false;
            }
        }
        
        // تحميل البطاقات الموجودة فور تحميل الصفحة
        loadCardsFixed();
    }
    
    // 3. إصلاح مشكلة عرض البطاقات
    function fixCardRendering() {
        console.log('🔄 إصلاح عرض البطاقات...');
        
        // إصلاح دالة عرض البطاقات
        const originalRenderCards = InvestorCardSystem.renderCards;
        
        // استبدال دالة renderCards
        InvestorCardSystem.renderCards = function(filter = 'all') {
            console.log('🔄 عرض البطاقات مع الفلتر:', filter);
            
            // التأكد من تحميل البطاقات
            if (!Array.isArray(InvestorCardSystem.cards)) {
                InvestorCardSystem.cards = [];
                loadCardsFixed();
            }
            
            console.log('📊 إجمالي البطاقات المتاحة:', InvestorCardSystem.cards.length);
            
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
                console.error('❌ عنصر عرض البطاقات غير موجود:', gridId);
                return;
            }
            
            // تطبيق الفلتر على البطاقات
            let filteredCards = InvestorCardSystem.cards;
            
            if (filter === 'active') {
                filteredCards = InvestorCardSystem.cards.filter(card => 
                    card.status === 'active' && !isExpired(card)
                );
            } else if (filter === 'expired') {
                filteredCards = InvestorCardSystem.cards.filter(card => 
                    isExpired(card)
                );
            }
            
            console.log('📊 البطاقات بعد الفلترة:', filteredCards.length);
            
            // إذا لم توجد بطاقات بعد الفلترة
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
            
            // إنشاء HTML لعرض البطاقات
            cardsGrid.innerHTML = filteredCards.map(card => `
                <div class="card-item" onclick="InvestorCardSystem.viewCardDetails('${card.id}')">
                    ${renderCardFixed(card)}
                    <div class="card-info-overlay">
                        <h4>${card.investorName || 'غير معروف'}</h4>
                        <p>${getCardTypeName(card.cardType)}</p>
                        <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                            ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                        </p>
                    </div>
                </div>
            `).join('');
            
            console.log('✅ تم عرض', filteredCards.length, 'بطاقة بنجاح');
        };
        
        // دالة renderCards محسنة للاستخدام المباشر
        function renderCardsFixed(filter = 'all') {
            InvestorCardSystem.renderCards(filter);
        }
        
        // دالة renderCard محسنة
        function renderCardFixed(card) {
            if (!card) {
                console.error('❌ معلومات البطاقة غير متوفرة');
                return '';
            }
            
            // التأكد من وجود جميع البيانات الضرورية
            const cardType = card.cardType || 'platinum';
            const cardColors = card.cardColors || getCardTypeColors(cardType);
            const cardNumber = card.cardNumber || generateCardNumber();
            const investorName = card.investorName || 'غير معروف';
            const expiryDate = card.expiryDate || '12/25';
            
            return `
                <div class="investor-card ${cardType}" data-card-id="${card.id}">
                    <div class="card-inner">
                        <div class="card-front" style="background: linear-gradient(135deg, ${cardColors.primary} 0%, ${cardColors.gradient} 100%);">
                            <div class="card-background"></div>
                            ${card.hasChip ? '<div class="card-chip" style="background-color: ' + cardColors.chip + '"></div>' : ''}
                            ${card.hasHologram ? '<div class="card-hologram"></div>' : ''}
                            <div class="card-logo" style="color: ${cardColors.text}">شركة الاستثمار العراقية</div>
                            <div class="card-number" style="color: ${cardColors.text}">${formatCardNumber(cardNumber)}</div>
                            <div class="card-holder" style="color: ${cardColors.text}">
                                <div class="label">CARD HOLDER</div>
                                <div class="name">${investorName}</div>
                            </div>
                            <div class="card-expires" style="color: ${cardColors.text}">
                                <div class="label">EXPIRES</div>
                                <div class="date">${expiryDate}</div>
                            </div>
                            <div class="card-type-icon">
                                <i class="fas fa-credit-card" style="color: ${cardColors.text}"></i>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="magnetic-strip"></div>
                            <div class="signature-strip">
                                <div class="signature-area"></div>
                                <div class="cvv">${card.cvv || '***'}</div>
                            </div>
                            ${card.hasQRCode ? `
                                <div class="qr-code">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(JSON.stringify({
                                        cardNumber: cardNumber,
                                        investorId: card.investorId,
                                        type: cardType
                                    }))}" alt="QR Code">
                                </div>
                            ` : ''}
                            <div class="card-info">
                                <p>للاستفسار: 07701234567</p>
                                <p>www.iraqinvest.com</p>
                                <p class="card-number-back">${formatCardNumber(cardNumber)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // تحسين وظيفة عرض تفاصيل البطاقة
        const originalViewCardDetails = InvestorCardSystem.viewCardDetails;
        
        InvestorCardSystem.viewCardDetails = function(cardId) {
            console.log('🔍 عرض تفاصيل البطاقة:', cardId);
            
            // التأكد من وجود الـ cardId
            if (!cardId) {
                console.error('❌ معرف البطاقة غير متوفر');
                showError('معرف البطاقة غير متوفر');
                return;
            }
            
            // البحث عن البطاقة
            const card = InvestorCardSystem.cards.find(c => c.id === cardId);
            
            if (!card) {
                console.error('❌ البطاقة غير موجودة:', cardId);
                showError('البطاقة غير موجودة');
                return;
            }
            
            // تسجيل نشاط العرض
            recordActivity('view', card);
            
            // الانتقال إلى صفحة التفاصيل
            showPage('card-detail-page');
            
            // عرض تفاصيل البطاقة
            const detailContainer = document.getElementById('cardDetailContainer');
            if (!detailContainer) {
                console.error('❌ عنصر تفاصيل البطاقة غير موجود');
                return;
            }
            
            // البحث عن المستثمر
            let investor = null;
            if (window.investors && Array.isArray(window.investors)) {
                investor = window.investors.find(inv => inv.id === card.investorId);
            }
            
            // في حالة عدم العثور على المستثمر، استخدم بياناته من البطاقة
            if (!investor) {
                investor = {
                    name: card.investorName || 'غير معروف',
                    phone: 'غير متوفر',
                    email: 'غير متوفر',
                    address: 'غير متوفر'
                };
            }
            
            // إنشاء HTML لعرض تفاصيل البطاقة
            detailContainer.innerHTML = `
                <div class="card-detail-grid">
                    <div class="card-preview-section">
                        <div class="card-preview-container">
                            ${renderCardFixed(card)}
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
                                    <span>${getCardTypeName(card.cardType)}</span>
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
                                ${getCardActivities(card.id)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('✅ تم عرض تفاصيل البطاقة بنجاح');
        };
        
        // دالة للحصول على أنشطة البطاقة
        function getCardActivities(cardId) {
            if (!Array.isArray(InvestorCardSystem.activities)) {
                return '<div class="empty-state">لا توجد أنشطة مسجلة</div>';
            }
            
            const cardActivities = InvestorCardSystem.activities
                .filter(a => a.cardId === cardId)
                .slice(0, 10);
                
            if (cardActivities.length === 0) {
                return '<div class="empty-state">لا توجد أنشطة مسجلة</div>';
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
    }
    
    // 4. إصلاح مشكلة التنقل بين صفحات البطاقات
    function fixCardNavigation() {
        console.log('🔄 إصلاح التنقل بين صفحات البطاقات...');
        
        // تصحيح دالة showCardPage
        window.showCardPage = function(pageId) {
            console.log('🔄 الانتقال إلى صفحة البطاقة:', pageId);
            
            // استخدام دالة showPage مع اسم الصفحة الصحيح
            const fullPageId = pageId + '-page';
            showPage(fullPageId);
            
            // تحديث عنصر القائمة النشط
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeMenuItem = document.querySelector(`.menu-item[onclick="showCardPage('${pageId}')"]`);
            if (activeMenuItem) {
                activeMenuItem.classList.add('active');
            }
            
            // تنفيذ الإجراء المناسب بناءً على الصفحة
            switch (pageId) {
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
        
        // تحديث دالة showPage الأصلية لتتعامل مع صفحات البطاقات
        const originalShowPage = window.showPage;
        
        window.showPage = function(pageId) {
            console.log('🔄 الانتقال إلى الصفحة:', pageId);
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // عرض الصفحة المطلوبة
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.classList.add('active');
                
                // تحديث عنصر القائمة النشط
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                const menuItemSelector = pageId.endsWith('-page') 
                    ? `.menu-item[href="#${pageId}"], .menu-item[onclick="showPage('${pageId}')"], .menu-item[onclick="showCardPage('${pageId.replace('-page', '')}')"]`
                    : `.menu-item[href="#${pageId}"], .menu-item[onclick="showPage('${pageId}')"]`;
                    
                const activeMenuItem = document.querySelector(menuItemSelector);
                if (activeMenuItem) {
                    activeMenuItem.classList.add('active');
                }
                
                // تنفيذ إجراءات خاصة بالصفحات
                if (pageId.includes('card') && typeof InvestorCardSystem !== 'undefined') {
                    // إجراءات خاصة بصفحات البطاقات
                    if (pageId === 'investor-cards-page') {
                        InvestorCardSystem.renderCards('all');
                    } else if (pageId === 'active-cards-page') {
                        InvestorCardSystem.renderCards('active');
                    } else if (pageId === 'expired-cards-page') {
                        InvestorCardSystem.renderCards('expired');
                    } else if (pageId === 'barcode-scanner-page') {
                        InvestorCardSystem.initBarcodeScanner();
                    } else if (pageId === 'new-card-page') {
                        InvestorCardSystem.updateInvestorSelect();
                        InvestorCardSystem.updateCardPreview();
                    } else if (pageId === 'card-stats-page') {
                        InvestorCardSystem.renderCardStats();
                    }
                }
            } else {
                console.error('❌ الصفحة غير موجودة:', pageId);
            }
        };
    }
    
    // 5. إضافة دوال مساعدة ووظائف إضافية
    function addHelperFunctions() {
        console.log('🔄 إضافة دوال مساعدة...');
        
        // 1. تحسين دالة الحذف
        InvestorCardSystem.deleteCard = function(cardId) {
            console.log('🗑️ حذف البطاقة:', cardId);
            
            const card = InvestorCardSystem.cards.find(c => c.id === cardId);
            if (!card) {
                console.error('❌ البطاقة غير موجودة:', cardId);
                showError('البطاقة غير موجودة');
                return;
            }
            
            if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.')) {
                return;
            }
            
            // حذف البطاقة من المصفوفة
            InvestorCardSystem.cards = InvestorCardSystem.cards.filter(c => c.id !== cardId);
            
            // تسجيل نشاط الحذف
            recordActivity('delete', card);
            
            // حفظ البطاقات بعد الحذف
            saveCardsFixed();
            
            // العودة إلى صفحة البطاقات
            showPage('investor-cards-page');
            
            // تحديث عرض البطاقات
            InvestorCardSystem.renderCards('all');
            
            // عرض رسالة نجاح
            showSuccess('تم حذف البطاقة بنجاح');
        };
        
        // 2. تحسين دالة التجديد
        InvestorCardSystem.renewCard = function(cardId) {
            console.log('🔄 تجديد البطاقة:', cardId);
            
            const card = InvestorCardSystem.cards.find(c => c.id === cardId);
            if (!card) {
                console.error('❌ البطاقة غير موجودة:', cardId);
                showError('البطاقة غير موجودة');
                return;
            }
            
            // تحديث تاريخ الانتهاء
            card.expiryDate = calculateExpiryDate();
            card.status = 'active';
            
            // حفظ البطاقات بعد التجديد
            saveCardsFixed();
            
            // تسجيل نشاط التجديد
            recordActivity('renew', card);
            
            // تحديث عرض تفاصيل البطاقة
            InvestorCardSystem.viewCardDetails(cardId);
            
            // عرض رسالة نجاح
            showSuccess('تم تجديد البطاقة بنجاح');
        };
        
        // 3. تحسين دوال التفعيل والإيقاف
        InvestorCardSystem.suspendCard = function(cardId) {
            console.log('⏸️ إيقاف البطاقة:', cardId);
            
            const card = InvestorCardSystem.cards.find(c => c.id === cardId);
            if (!card) {
                console.error('❌ البطاقة غير موجودة:', cardId);
                showError('البطاقة غير موجودة');
                return;
            }
            
            // تغيير حالة البطاقة
            card.status = 'suspended';
            
            // حفظ البطاقات بعد التعديل
            saveCardsFixed();
            
            // تسجيل نشاط الإيقاف
            recordActivity('suspend', card);
            
            // تحديث عرض تفاصيل البطاقة
            InvestorCardSystem.viewCardDetails(cardId);
            
            // عرض رسالة نجاح
            showSuccess('تم إيقاف البطاقة بنجاح');
        };
        
        InvestorCardSystem.activateCard = function(cardId) {
            console.log('▶️ تفعيل البطاقة:', cardId);
            
            const card = InvestorCardSystem.cards.find(c => c.id === cardId);
            if (!card) {
                console.error('❌ البطاقة غير موجودة:', cardId);
                showError('البطاقة غير موجودة');
                return;
            }
            
            // تغيير حالة البطاقة
            card.status = 'active';
            
            // حفظ البطاقات بعد التعديل
            saveCardsFixed();
            
            // تسجيل نشاط التفعيل
            recordActivity('activate', card);
            
            // تحديث عرض تفاصيل البطاقة
            InvestorCardSystem.viewCardDetails(cardId);
            
            // عرض رسالة نجاح
            showSuccess('تم تفعيل البطاقة بنجاح');
        };
        
        // 4. تحسين دالة البحث
        InvestorCardSystem.handleSearch = function(query, filter = 'all') {
            console.log('🔍 البحث عن البطاقات:', query, 'فلتر:', filter);
            
            if (!query) {
                InvestorCardSystem.renderCards(filter);
                return;
            }
            
            const lowerQuery = query.toLowerCase();
            
            // التأكد من تحميل البطاقات
            if (!Array.isArray(InvestorCardSystem.cards)) {
                InvestorCardSystem.cards = [];
                loadCardsFixed();
            }
            
            // البحث في البطاقات
            const results = InvestorCardSystem.cards.filter(card => 
                (card.investorName && card.investorName.toLowerCase().includes(lowerQuery)) ||
                (card.cardNumber && card.cardNumber.includes(query)) ||
                (card.cardType && getCardTypeName(card.cardType).toLowerCase().includes(lowerQuery))
            );
            
            console.log('🔍 نتائج البحث:', results.length);
            
            // تحديد العنصر المستهدف بناءً على الفلتر
            const gridId = filter === 'active' ? 'activeCardsGrid' : 
                           filter === 'expired' ? 'expiredCardsGrid' : 'cardsGrid';
            
            const grid = document.getElementById(gridId);
            if (!grid) {
                console.error('❌ عنصر عرض البطاقات غير موجود:', gridId);
                return;
            }
            
            // تطبيق الفلتر على نتائج البحث
            let filteredResults = results;
            
            if (filter === 'active') {
                filteredResults = results.filter(card => card.status === 'active' && !isExpired(card));
            } else if (filter === 'expired') {
                filteredResults = results.filter(card => isExpired(card));
            }
            
            // عرض نتائج البحث
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
                    ${renderCardFixed(card)}
                    <div class="card-info-overlay">
                        <h4>${card.investorName || 'غير معروف'}</h4>
                        <p>${getCardTypeName(card.cardType)}</p>
                        <p class="status ${card.status === 'active' ? 'active' : 'inactive'}">
                            ${card.status === 'active' ? 'نشطة' : 'موقوفة'}
                        </p>
                    </div>
                </div>
            `).join('');
        };
    }
    
    // تطبيق الإصلاح الشامل
    function applyCompleteFix() {
        console.log('🔄 تطبيق الإصلاح الشامل...');
        
        // 1. تأكد من أن المستثمرين متاحين
        if (!window.investors || !Array.isArray(window.investors)) {
            try {
                const storedInvestors = localStorage.getItem('investors');
                if (storedInvestors) {
                    window.investors = JSON.parse(storedInvestors);
                    console.log('✅ تم تحميل المستثمرين من التخزين المحلي:', window.investors.length);
                }
            } catch (error) {
                console.error('❌ خطأ في تحميل المستثمرين:', error);
                window.investors = [];
            }
        }
        
        // 2. تأكد من أن البطاقات متاحة
        loadCardsFixed();
        
        // 3. تسجيل أحداث القائمة
        const cardMenuItems = document.querySelectorAll('.menu-item[onclick^="showCardPage"]');
        cardMenuItems.forEach(item => {
            const pageId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
            console.log('📝 تسجيل حدث القائمة:', pageId);
            
            // تحديث href لضمان التنقل الصحيح
            item.setAttribute('href', `#${pageId}-page`);
            
            // إضافة مستمع حدث للتأكد من التنقل الصحيح
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showCardPage(pageId);
            });
        });
        
        // 4. تحديث showCardPage في window للتأكد من استدعائها بشكل صحيح
        if (typeof window.showCardPage !== 'function') {
            window.showCardPage = function(pageId) {
                console.log('🔄 الانتقال إلى صفحة البطاقة:', pageId);
                showPage(pageId + '-page');
            };
        }
        
        // 5. تحسين دالة تحديث معاينة البطاقة
        const originalUpdateCardPreview = InvestorCardSystem.updateCardPreview;
        
        InvestorCardSystem.updateCardPreview = function() {
            console.log('🔄 تحديث معاينة البطاقة...');
            
            const form = document.getElementById('newCardForm');
            if (!form) {
                console.error('❌ نموذج إنشاء البطاقة غير موجود');
                return;
            }
            
            const formData = new FormData(form);
            const investorId = formData.get('investorSelect');
            const cardType = formData.get('cardType');
            
            const previewContainer = document.getElementById('cardPreviewContainer');
            if (!previewContainer) {
                console.error('❌ عنصر معاينة البطاقة غير موجود');
                return;
            }
            
            if (!investorId) {
                previewContainer.innerHTML = `
                    <div class="empty-preview">
                        <i class="fas fa-credit-card fa-3x"></i>
                        <p>اختر المستثمر لمعاينة البطاقة</p>
                    </div>
                `;
                return;
            }
            
            // البحث عن المستثمر
            let investor = null;
            if (window.investors && Array.isArray(window.investors)) {
                investor = window.investors.find(inv => inv.id === investorId);
            }
            
            if (!investor) {
                previewContainer.innerHTML = `
                    <div class="empty-preview">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                        <p>المستثمر غير موجود!</p>
                    </div>
                `;
                return;
            }
            
            // إنشاء بطاقة معاينة
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
                cardColors: getCardTypeColors(cardType)
            };
            
            // عرض معاينة البطاقة
            previewContainer.innerHTML = renderCardFixed(previewCard);
            
            console.log('✅ تم تحديث معاينة البطاقة بنجاح');
        };
        
        // 6. تعزيز دالة تسجيل النشاط
        window.recordActivity = function(action, card, details = {}) {
            console.log('📝 تسجيل نشاط:', action);
            
            if (!card) {
                console.error('❌ معلومات البطاقة غير متوفرة لتسجيل النشاط');
                return;
            }
            
            // إنشاء كائن النشاط
            const activity = {
                id: generateId(),
                action: action,
                cardId: card.id,
                investorId: card.investorId,
                investorName: card.investorName || 'غير معروف',
                timestamp: new Date().toISOString(),
                details: details
            };
            
            // إضافة النشاط إلى مصفوفة الأنشطة
            if (!Array.isArray(InvestorCardSystem.activities)) {
                InvestorCardSystem.activities = [];
            }
            
            InvestorCardSystem.activities.unshift(activity);
            
            // حفظ الأنشطة
            try {
                localStorage.setItem('cardActivities', JSON.stringify(InvestorCardSystem.activities));
            } catch (error) {
                console.error('❌ خطأ في حفظ الأنشطة:', error);
            }
            
            return activity;
        };
        
        // 7. تحميل قائمة المستثمرين في نموذج إنشاء البطاقة الجديدة
        if (document.getElementById('new-card-page')) {
            InvestorCardSystem.updateInvestorSelect();
        }
        
        // 8. تحديث عرض البطاقات في جميع الصفحات
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            if (activePage.id === 'investor-cards-page') {
                InvestorCardSystem.renderCards('all');
            } else if (activePage.id === 'active-cards-page') {
                InvestorCardSystem.renderCards('active');
            } else if (activePage.id === 'expired-cards-page') {
                InvestorCardSystem.renderCards('expired');
            }
        }
        
        // إضافة عداد البطاقات في قائمة البطاقات
        updateCardCounters();
    }
    
    // تحديث عدادات البطاقات في القائمة
    function updateCardCounters() {
        console.log('🔄 تحديث عدادات البطاقات...');
        
        if (!Array.isArray(InvestorCardSystem.cards)) return;
        
        const allCards = InvestorCardSystem.cards.length;
        const activeCards = InvestorCardSystem.cards.filter(c => c.status === 'active' && !isExpired(c)).length;
        const expiredCards = InvestorCardSystem.cards.filter(c => isExpired(c)).length;
        
        // تحديث عناصر العداد إذا وجدت
        const allBadge = document.getElementById('allCardsBadge');
        const activeBadge = document.getElementById('activeCardsBadge');
        const expiredBadge = document.getElementById('expiredCardsBadge');
        
        if (allBadge) allBadge.textContent = allCards;
        if (activeBadge) activeBadge.textContent = activeCards;
        if (expiredBadge) expiredBadge.textContent = expiredCards;
        
        console.log('📊 إحصائيات البطاقات:', {
            الكل: allCards,
            النشطة: activeCards,
            المنتهية: expiredCards
        });
    }
    
    // ********************************************
    // دوال مساعدة أساسية تستخدمها الوظائف المحسنة
    // ********************************************
    
    // توليد معرف فريد
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // توليد رقم بطاقة مع خوارزمية Luhn
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
    
    // حساب رقم التحقق Luhn
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
    
    // تنسيق رقم البطاقة
    function formatCardNumber(cardNumber) {
        if (!cardNumber) return "0000 0000 0000 0000";
        return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // توليد CVV
    function generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }
    
    // توليد رقم PIN
    function generatePIN() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // حساب تاريخ الانتهاء
    function calculateExpiryDate(yearsToAdd = 3) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + yearsToAdd);
        
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        
        return `${month}/${year}`;
    }
    
    // التحقق مما إذا كانت البطاقة منتهية الصلاحية
    function isExpired(card) {
        if (!card || !card.expiryDate) return false;
        
        const [month, year] = card.expiryDate.split('/');
        const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
        const today = new Date();
        
        return expiryDate < today;
    }
    
    // الحصول على أيقونة النشاط
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
    
    // الحصول على اسم النشاط
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
    
    // الحصول على ألوان نوع البطاقة
    function getCardTypeColors(cardType) {
        const cardTypes = [
            {
                value: 'platinum',
                colors: {
                    primary: '#1a1a2e',
                    gradient: '#16213e',
                    text: '#ffffff',
                    chip: '#f4a261'
                }
            },
            {
                value: 'gold',
                colors: {
                    primary: '#ff9a00',
                    gradient: '#ff6c00',
                    text: '#000000',
                    chip: '#333333'
                }
            },
            {
                value: 'premium',
                colors: {
                    primary: '#2c3e50',
                    gradient: '#3498db',
                    text: '#ffffff',
                    chip: '#ecf0f1'
                }
            },
            {
                value: 'diamond',
                colors: {
                    primary: '#e0f7fa',
                    gradient: '#80deea',
                    text: '#000000',
                    chip: '#006064'
                }
            },
            {
                value: 'islamic',
                colors: {
                    primary: '#1b5e20',
                    gradient: '#66bb6a',
                    text: '#ffffff',
                    chip: '#ffc107'
                }
            },
            {
                value: 'custom',
                colors: {
                    primary: '#6c757d',
                    gradient: '#adb5bd',
                    text: '#000000',
                    chip: '#343a40'
                }
            }
        ];
        
        const defaultColors = {
            primary: '#3498db',
            gradient: '#2980b9',
            text: '#ffffff',
            chip: '#f39c12'
        };
        
        const type = cardTypes.find(t => t.value === cardType);
        return type ? type.colors : defaultColors;
    }
    
    // الحصول على اسم نوع البطاقة
    function getCardTypeName(cardType) {
        const types = {
            platinum: 'بلاتينية',
            gold: 'ذهبية',
            premium: 'بريميوم',
            diamond: 'ماسية',
            islamic: 'إسلامية',
            custom: 'مخصصة'
        };
        
        return types[cardType] || cardType;
    }
    
    // تنسيق التاريخ
    function formatDate(dateString) {
        if (!dateString) return "غير محدد";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-IQ');
        } catch (error) {
            return dateString;
        }
    }
    
    // تنسيق الوقت
    function formatTime(dateString) {
        if (!dateString) return "غير محدد";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('ar-IQ');
        } catch (error) {
            return "";
        }
    }
    
    // عرض رسالة خطأ
    function showError(message) {
        if (typeof window.createNotification === 'function') {
            window.createNotification('خطأ', message, 'danger');
        } else {
            alert('خطأ: ' + message);
        }
    }
    
    // عرض رسالة نجاح
    function showSuccess(message) {
        if (typeof window.createNotification === 'function') {
            window.createNotification('نجاح', message, 'success');
        } else {
            alert('نجاح: ' + message);
        }
    }
    
    // عرض رسالة خطأ في النظام
    function showSystemError(message) {
        console.error('❌ خطأ في النظام:', message);
        
        // إنشاء رسالة خطأ في واجهة المستخدم
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger system-error';
        errorAlert.style.position = 'fixed';
        errorAlert.style.top = '20px';
        errorAlert.style.right = '20px';
        errorAlert.style.zIndex = '9999';
        errorAlert.style.maxWidth = '400px';
        errorAlert.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        
        errorAlert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">خطأ في النظام</div>
                <div class="alert-text">${message}</div>
            </div>
            <div style="position: absolute; top: 10px; left: 10px; cursor: pointer;" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        document.body.appendChild(errorAlert);
        
        // إزالة الرسالة بعد 10 ثوانٍ
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.remove();
            }
        }, 10000);
    }
    
    // دالة لتحميل البطاقات من التخزين المحلي
    function loadCardsFixed() {
        if (typeof InvestorCardSystem === 'undefined') return;
        
        try {
            // محاولة تحميل البطاقات من التخزين المحلي
            const storedCards = localStorage.getItem('investorCards');
            
            if (storedCards) {
                const parsedCards = JSON.parse(storedCards);
                
                if (Array.isArray(parsedCards)) {
                    InvestorCardSystem.cards = parsedCards;
                    console.log('✅ تم تحميل', parsedCards.length, 'بطاقة من التخزين المحلي');
                    return true;
                }
            }
            
            // إذا لم يتم العثور على بطاقات، قم بتهيئة مصفوفة فارغة
            if (!Array.isArray(InvestorCardSystem.cards)) {
                InvestorCardSystem.cards = [];
                console.log('🔄 تهيئة مصفوفة بطاقات فارغة');
            }
            
            return true;
        } catch (error) {
            console.error('❌ خطأ أثناء تحميل البطاقات:', error);
            
            // تهيئة مصفوفة فارغة في حالة الخطأ
            InvestorCardSystem.cards = [];
            return false;
        }
    }
    
    // دالة لحفظ البطاقات في التخزين المحلي
    function saveCardsFixed() {
        if (typeof InvestorCardSystem === 'undefined' || !Array.isArray(InvestorCardSystem.cards)) return;
        
        try {
            // حفظ البطاقات في التخزين المحلي
            localStorage.setItem('investorCards', JSON.stringify(InvestorCardSystem.cards));
            console.log('✅ تم حفظ', InvestorCardSystem.cards.length, 'بطاقة في التخزين المحلي');
            return true;
        } catch (error) {
            console.error('❌ خطأ أثناء حفظ البطاقات:', error);
            return false;
        }
    }
})();