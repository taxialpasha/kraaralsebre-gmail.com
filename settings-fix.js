/**
 * تحديث صفحة الإعدادات
 * تصحيح مشكلة عرض الإعدادات وضمان عملها بشكل صحيح
 */

// تنفيذ التحديثات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة المستمع لتبديل علامات التبويب في الإعدادات
    setupSettingsTabs();

    // تحسين ظهور محتوى علامات التبويب
    fixSettingsTabsDisplay();

    // تحسين حفظ الإعدادات
    enhanceSettingsSubmit();
});

/**
 * إعداد مستمعات الأحداث لعلامات التبويب في صفحة الإعدادات
 */
function setupSettingsTabs() {
    // الحصول على جميع علامات التبويب
    const settingsTabs = document.querySelectorAll('#settings .tab');
    
    // إضافة مستمع النقر لكل علامة تبويب
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // استخراج معرف علامة التبويب من سمة onclick
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/switchSettingsTab\('([^']+)'\)/);
                if (match && match[1]) {
                    const tabId = match[1];
                    // استدعاء دالة تبديل علامة التبويب
                    switchSettingsTab(tabId);
                }
            }
        });
    });
}

/**
 * تحسين عرض محتوى علامات التبويب
 */
function fixSettingsTabsDisplay() {
    // التأكد من أن جميع محتويات علامات التبويب مخفية باستثناء العلامة النشطة
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');
    
    settingsTabContents.forEach(content => {
        // إخفاء جميع المحتويات
        content.style.display = 'none';
    });
    
    // إظهار المحتوى النشط فقط
    const activeTabContent = document.querySelector('.settings-tab-content.active');
    if (activeTabContent) {
        activeTabContent.style.display = 'block';
    } else {
        // إذا لم يكن هناك علامة نشطة، اجعل علامة "عام" نشطة افتراضيًا
        const generalSettings = document.getElementById('generalSettings');
        if (generalSettings) {
            generalSettings.style.display = 'block';
            generalSettings.classList.add('active');
            
            // جعل علامة "عام" نشطة
            const generalTab = document.querySelector('#settings .tab[onclick="switchSettingsTab(\'general\')"]');
            if (generalTab) {
                generalTab.classList.add('active');
            }
        }
    }
}

/**
 * تعديل دالة تبديل علامات التبويب
 */
function switchSettingsTab(tabId) {
    // إخفاء جميع محتويات علامات التبويب
    document.querySelectorAll('.settings-tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // إظهار المحتوى المطلوب
    const selectedTab = document.getElementById(`${tabId}Settings`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }
    
    // جعل علامة التبويب نشطة
    document.querySelectorAll('#settings .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`#settings .tab[onclick="switchSettingsTab('${tabId}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // حالة خاصة لعلامة تبويب المزامنة
    if (tabId === 'sync') {
        updateSyncSettingsStatus();
    }
    
    // حالة خاصة لعلامة تبويب النسخ الاحتياطي
    if (tabId === 'backup') {
        loadPreviousBackups();
    }
}

/**
 * تحسين حفظ الإعدادات
 */
function enhanceSettingsSubmit() {
    // تحسين نموذج الإعدادات العامة
    enhanceSettingsForm('generalSettingsForm', saveGeneralSettings);
    
    // تحسين نموذج إعدادات الاستثمار
    enhanceSettingsForm('investmentSettingsForm', saveInvestmentSettings);
    
    // تحسين نموذج إعدادات الملف الشخصي
    enhanceSettingsForm('profileSettingsForm', saveProfileSettings);
    
    // تحسين نموذج إعدادات الإشعارات
    enhanceSettingsForm('notificationSettingsForm', saveNotificationSettings);
    
    // تحسين نموذج إعدادات النظام
    enhanceSettingsForm('systemSettingsForm', saveSystemSettings);
}

/**
 * تحسين نموذج الإعدادات
 * 
 * @param {string} formId - معرف النموذج
 * @param {function} saveFunction - دالة الحفظ
 */
function enhanceSettingsForm(formId, saveFunction) {
    const form = document.getElementById(formId);
    if (form) {
        // التأكد من أن النموذج يستخدم دالة الحفظ الصحيحة
        form.onsubmit = function(event) {
            event.preventDefault();
            saveFunction(event);
            return false;
        };
        
        // إضافة مستمعات الأحداث للحقول
        form.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'checkbox') {
                input.addEventListener('change', function() {
                    // إذا كان هذا هو التبديل الرئيسي للمزامنة
                    if (input.id === 'syncEnabled') {
                        toggleSync(this.checked);
                    }
                });
            }
        });
    }
}

/**
 * تحسين وظيفة حفظ الإعدادات العامة
 */
function saveGeneralSettings(event) {
    event.preventDefault();
    
    // الحصول على قيم الحقول
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyWebsite = document.getElementById('companyWebsite').value;
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;
    
    // التحقق من الحقول المطلوبة
    if (!companyName || !companyAddress || !companyPhone) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (companyEmail && !validateEmail(companyEmail)) {
        createNotification('خطأ', 'البريد الإلكتروني غير صالح', 'danger');
        return;
    }
    
    // تحديث الإعدادات
    settings.companyName = companyName;
    settings.companyAddress = companyAddress;
    settings.companyPhone = companyPhone;
    settings.companyEmail = companyEmail;
    settings.companyWebsite = companyWebsite;
    settings.language = language;
    settings.timezone = timezone;
    
    // حفظ الإعدادات
    saveData();
    
    // تحديث العناصر في الواجهة
    updateUIWithSettings();
    
    // عرض إشعار نجاح
    createNotification('نجاح', 'تم حفظ الإعدادات العامة بنجاح', 'success');
}

/**
 * تحديث عناصر الواجهة بالإعدادات الجديدة
 */
function updateUIWithSettings() {
    // تحديث اسم الشركة في العنوان
    const appTitle = document.querySelector('.app-title');
    if (appTitle && settings.companyName) {
        appTitle.textContent = settings.companyName;
    }
    
    // تحديث معلومات أخرى...
    // يمكن إضافة المزيد من التحديثات هنا حسب الحاجة
}

/**
 * إضافة أو استبدال وظيفة تبديل علامات تبويب الإعدادات
 */
window.switchSettingsTab = switchSettingsTab;

/**
 * دالة جديدة للتبديل بين علامات التبويب الفرعية داخل إعدادات النسخ الاحتياطي
 */
function switchBackupTab(tabId) {
    // إخفاء جميع محتويات علامات التبويب الفرعية
    document.querySelectorAll('.backup-tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // إظهار المحتوى المطلوب
    const selectedTab = document.getElementById(`${tabId}BackupTab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }
    
    // جعل علامة التبويب نشطة
    document.querySelectorAll('#backupSettings .backup-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`#backupSettings .backup-tab[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

/**
 * تحسين وظيفة إنشاء نسخة احتياطية
 */
function enhancedCreateBackup() {
    // إظهار مؤشر التحميل
    showLoadingIndicator();
    
    try {
        // استدعاء وظيفة إنشاء النسخة الاحتياطية الأصلية
        createBackup();
        
        // إخفاء مؤشر التحميل
        hideLoadingIndicator();
    } catch (error) {
        // إخفاء مؤشر التحميل
        hideLoadingIndicator();
        
        // عرض رسالة الخطأ
        createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + error.message, 'danger');
    }
}

/**
 * إظهار مؤشر التحميل
 */
function showLoadingIndicator() {
    // إنشاء عنصر مؤشر التحميل
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...';
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.padding = '20px';
    loader.style.background = 'rgba(0, 0, 0, 0.7)';
    loader.style.color = 'white';
    loader.style.borderRadius = '5px';
    loader.style.zIndex = '9999';
    
    // إضافة العنصر إلى الصفحة
    document.body.appendChild(loader);
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoadingIndicator() {
    // الحصول على عنصر مؤشر التحميل وإزالته
    const loader = document.querySelector('.loading-indicator');
    if (loader) {
        loader.remove();
    }
}

// استبدال الوظيفة الأصلية
window.createBackup = enhancedCreateBackup;

/**
 * تحسين وظيفة استعادة النسخة الاحتياطية
 */
function enhancedRestoreBackup() {
    // الحصول على عنصر اختيار الملف
    const fileInput = document.getElementById('restoreFile');
    
    if (!fileInput || !fileInput.files.length) {
        createNotification('خطأ', 'يرجى اختيار ملف', 'danger');
        return;
    }
    
    // طلب تأكيد من المستخدم
    if (!confirm('سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية. هل أنت متأكد من المتابعة؟')) {
        return;
    }
    
    // إظهار مؤشر التحميل
    showLoadingIndicator();
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const backup = JSON.parse(event.target.result);
            
            if (backup.data && backup.data.investors && backup.data.investments && backup.data.operations) {
                // استعادة البيانات
                investors = backup.data.investors;
                investments = backup.data.investments;
                operations = backup.data.operations;
                
                if (backup.data.settings) {
                    settings = {...settings, ...backup.data.settings};
                }
                
                if (backup.data.events) {
                    events = backup.data.events;
                }
                
                if (backup.data.notifications) {
                    notifications = backup.data.notifications;
                }
                
                // حفظ البيانات
                saveData();
                saveNotifications();
                
                // إخفاء مؤشر التحميل
                hideLoadingIndicator();
                
                // عرض إشعار نجاح
                createNotification('نجاح', 'تمت استعادة النسخة الاحتياطية بنجاح', 'success');
                
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // إخفاء مؤشر التحميل
                hideLoadingIndicator();
                
                // عرض إشعار خطأ
                createNotification('خطأ', 'ملف النسخة الاحتياطية غير صالح', 'danger');
            }
        } catch (error) {
            // إخفاء مؤشر التحميل
            hideLoadingIndicator();
            
            // عرض إشعار خطأ
            createNotification('خطأ', 'حدث خطأ أثناء استعادة النسخة الاحتياطية: ' + error.message, 'danger');
        }
    };
    
    reader.onerror = function() {
        // إخفاء مؤشر التحميل
        hideLoadingIndicator();
        
        // عرض إشعار خطأ
        createNotification('خطأ', 'حدث خطأ أثناء قراءة الملف', 'danger');
    };
    
    reader.readAsText(file);
}

// استبدال الوظيفة الأصلية
window.restoreBackup = enhancedRestoreBackup;

/**
 * تحسين وظيفة استعادة النسخة الاحتياطية المحددة
 */
function enhancedRestoreSelectedBackup() {
    const select = document.getElementById('previousBackups');
    
    if (!select || !select.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    const backupId = select.value;
    
    // البحث عن النسخة الاحتياطية
    const backup = backupList.find(b => b.id === backupId);
    
    if (!backup) {
        createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
        return;
    }
    
    // طلب تأكيد من المستخدم
    if (!confirm(`هل أنت متأكد من استعادة النسخة الاحتياطية "${backup.name}"؟ سيتم استبدال جميع البيانات الحالية.`)) {
        return;
    }
    
    // إظهار مؤشر التحميل
    showLoadingIndicator();
    
    try {
        // استعادة البيانات
        if (backup.data) {
            if (backup.data.investors) investors = backup.data.investors;
            if (backup.data.investments) investments = backup.data.investments;
            if (backup.data.operations) operations = backup.data.operations;
            if (backup.data.settings) settings = {...settings, ...backup.data.settings};
            if (backup.data.events) events = backup.data.events;
            if (backup.data.notifications) notifications = backup.data.notifications;
            
            // حفظ البيانات
            saveData();
            saveNotifications();
            
            // إخفاء مؤشر التحميل
            hideLoadingIndicator();
            
            // عرض إشعار نجاح
            createNotification('نجاح', 'تمت استعادة النسخة الاحتياطية بنجاح', 'success');
            
            // إعادة تحميل الصفحة
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            // إخفاء مؤشر التحميل
            hideLoadingIndicator();
            
            // عرض إشعار خطأ
            createNotification('خطأ', 'النسخة الاحتياطية غير صالحة', 'danger');
        }
    } catch (error) {
        // إخفاء مؤشر التحميل
        hideLoadingIndicator();
        
        // عرض إشعار خطأ
        createNotification('خطأ', 'حدث خطأ أثناء استعادة النسخة الاحتياطية: ' + error.message, 'danger');
    }
}

// استبدال الوظيفة الأصلية
window.restoreSelectedBackup = enhancedRestoreSelectedBackup;

// إضافة أنماط CSS لتحسين شكل صفحة الإعدادات
function addSettingsStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* تحسينات عامة */
        .settings-tab-content {
            margin-top: 20px;
            padding: 20px;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }
        
        /* تحسينات زر الحفظ */
        .form-container .form-group button[type="submit"],
        .form-container .form-group button.btn-primary {
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
        }
        
        .form-container .form-group button[type="submit"]:hover,
        .form-container .form-group button.btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* تحسينات علامات التبويب */
        #settings .tabs {
            background: var(--gray-100);
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        
        #settings .tab {
            padding: 12px 20px;
            cursor: pointer;
            transition: background 0.3s, color 0.3s;
        }
        
        #settings .tab:hover {
            background: var(--gray-200);
        }
        
        #settings .tab.active {
            background: var(--primary-color);
            color: white;
            position: relative;
        }
        
        #settings .tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid white;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// استدعاء دالة إضافة الأنماط
addSettingsStyles();