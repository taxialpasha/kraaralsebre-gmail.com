// card-system-fix.js - ملف تصحيح أخطاء نظام البطاقات

document.addEventListener('DOMContentLoaded', function() {
    // حل مشكلة #1: تصحيح أزرار التنقل في القائمة الجانبية
    function fixCardNavigation() {
        console.log('تصحيح أزرار التنقل للبطاقات...');
        
        // تحديث دالة showCardPage لتعمل بشكل صحيح مع دالة showPage الرئيسية
        window.showCardPage = function(pageId) {
            console.log('تم استدعاء showCardPage مع:', pageId);
            
            // استخدام دالة showPage الرئيسية مباشرة
            showPage(pageId + '-page');
            
            // تفعيل عنصر القائمة الحالي
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeMenuItem = document.querySelector(`.menu-item[onclick="showCardPage('${pageId}')"]`);
            if (activeMenuItem) {
                activeMenuItem.classList.add('active');
            }
        };
        
        // تحديث أزرار القائمة الجانبية للبطاقات لاستخدام الوظيفة الصحيحة
        const cardMenuItems = document.querySelectorAll('.menu-item[onclick^="showCardPage"]');
        cardMenuItems.forEach(item => {
            // تأكد من أن روابط البطاقات تستخدم ID الصحيح
            const pageId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
            item.setAttribute('href', `#${pageId}-page`);
        });
    }
    
    // حل مشكلة #2 و #3: تحديث وظيفة البحث عن المستثمرين وتحميلهم
    function enhanceInvestorCardSystem() {
        console.log('تحسين نظام بطاقات المستثمرين...');
        
        if (typeof InvestorCardSystem === 'undefined') {
            console.error('نظام بطاقات المستثمرين غير موجود!');
            return;
        }
        
        // تعزيز دالة تحديث قائمة المستثمرين لجلب البيانات من مصادر متعددة
        const originalUpdateInvestorSelect = InvestorCardSystem.updateInvestorSelect;
        
        InvestorCardSystem.updateInvestorSelect = function() {
            console.log('جاري تحديث قائمة المستثمرين...');
            
            const select = document.querySelector('select[name="investorSelect"]');
            if (!select) {
                console.error('عنصر اختيار المستثمر غير موجود!');
                return;
            }
            
            // إعادة تعيين القائمة
            select.innerHTML = '<option value="">اختر المستثمر</option>';
            
            // محاولة جلب المستثمرين من window.investors (النظام الأساسي)
            let investorsLoaded = false;
            
            if (window.investors && window.investors.length > 0) {
                console.log(`تم العثور على ${window.investors.length} مستثمر في النظام الأساسي`);
                window.investors.forEach(investor => {
                    select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
                });
                investorsLoaded = true;
            }
            
            // إذا لم يتم تحميل المستثمرين، حاول من localStorage
            if (!investorsLoaded) {
                try {
                    const storedInvestors = localStorage.getItem('investors');
                    if (storedInvestors) {
                        const investors = JSON.parse(storedInvestors);
                        console.log(`تم العثور على ${investors.length} مستثمر في التخزين المحلي`);
                        investors.forEach(investor => {
                            select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
                        });
                        
                        // تحديث متغير window.investors ليكون متاحًا للاستخدام المستقبلي
                        window.investors = investors;
                        investorsLoaded = true;
                    }
                } catch (error) {
                    console.error('خطأ في تحميل المستثمرين من التخزين المحلي:', error);
                }
            }
            
            // إذا لم يتم تحميل المستثمرين، حاول من Firebase إذا كان متاحًا
            if (!investorsLoaded && window.firebaseApp && firebase.database) {
                console.log('محاولة جلب المستثمرين من Firebase...');
                firebase.database().ref('investors').once('value')
                    .then(snapshot => {
                        const firebaseInvestors = snapshot.val();
                        if (firebaseInvestors) {
                            const investors = Object.values(firebaseInvestors);
                            console.log(`تم العثور على ${investors.length} مستثمر في Firebase`);
                            
                            // إعادة تعيين القائمة
                            select.innerHTML = '<option value="">اختر المستثمر</option>';
                            
                            investors.forEach(investor => {
                                select.innerHTML += `<option value="${investor.id}">${investor.name}</option>`;
                            });
                            
                            // تحديث متغير window.investors ليكون متاحًا للاستخدام المستقبلي
                            window.investors = investors;
                        } else {
                            console.warn('لم يتم العثور على مستثمرين في Firebase');
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في جلب المستثمرين من Firebase:', error);
                    });
            }
            
            // إذا لم نجد أي مستثمرين، أظهر رسالة خطأ
            if (select.querySelectorAll('option').length <= 1) {
                console.warn('لم يتم العثور على أي مستثمرين!');
                select.innerHTML += `<option value="" disabled>لم يتم العثور على مستثمرين</option>`;
                
                // إضافة زر لإنشاء مستثمر جديد
                const formSection = select.closest('.form-section');
                if (formSection) {
                    const noInvestorsWarning = document.createElement('div');
                    noInvestorsWarning.className = 'alert alert-warning';
                    noInvestorsWarning.innerHTML = `
                        <div class="alert-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">تنبيه</div>
                            <div class="alert-text">لم يتم العثور على مستثمرين. قم بإضافة مستثمرين أولاً.</div>
                        </div>
                    `;
                    
                    // إزالة التنبيه السابق إن وجد
                    const existingWarning = formSection.querySelector('.alert.alert-warning');
                    if (existingWarning) {
                        existingWarning.remove();
                    }
                    
                    formSection.appendChild(noInvestorsWarning);
                    
                    // إضافة زر للانتقال إلى صفحة المستثمرين
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
        
        // تعزيز دالة init لضمان تحميل المستثمرين
        const originalInit = InvestorCardSystem.init;
        
        InvestorCardSystem.init = function() {
            console.log('تهيئة نظام بطاقات المستثمرين المحسّن...');
            
            // استدعاء الدالة الأصلية
            if (typeof originalInit === 'function') {
                originalInit.apply(this);
            }
            
            // ضمان تحميل المستثمرين وتهيئة النظام بشكل صحيح
            setTimeout(() => {
                InvestorCardSystem.updateInvestorSelect();
            }, 500);
        };
    }
    
    // دالة تصحيح شاملة لنظام البطاقات
    function fixCardSystem() {
        console.log('بدء تصحيح نظام البطاقات...');
        
        // مهلة قصيرة للتأكد من تحميل النظام بالكامل
        setTimeout(() => {
            // تصحيح أزرار التنقل
            fixCardNavigation();
            
            // تعزيز نظام البطاقات
            enhanceInvestorCardSystem();
            
            // تأكد من أن النظام جاهز للعمل
            if (typeof InvestorCardSystem !== 'undefined') {
                console.log('تم تصحيح نظام البطاقات بنجاح!');
                
                // تطبيق التغييرات على صفحات البطاقات الموجودة
                const activeCardPage = document.querySelector('.page[id$="-card-page"].active');
                if (activeCardPage) {
                    const pageId = activeCardPage.id.replace('-page', '');
                    showPage(pageId);
                }
            } else {
                console.error('فشل تصحيح نظام البطاقات: النظام غير متاح!');
            }
        }, 1000);
    }
    
    // بدء التصحيح
    fixCardSystem();
});