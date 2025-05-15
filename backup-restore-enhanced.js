/**
 * backup-restore-enhanced.js
 * تحسينات لنظام النسخ الاحتياطي والاستعادة
 */

// تحسين عملية استعادة النسخ الاحتياطية
(function() {
    // ربط الوظائف بعد تحميل الصفحة
    document.addEventListener('DOMContentLoaded', enhanceBackupRestore);

    // تحسين النظام
    function enhanceBackupRestore() {
        console.log("تفعيل التحسينات على نظام النسخ الاحتياطي والاستعادة");
        
        // استبدال وظائف النسخ الاحتياطي الأصلية
        if (typeof window.restoreBackup === 'function') {
            window.originalRestoreBackup = window.restoreBackup;
            window.restoreBackup = enhancedRestoreBackup;
        }
        
        if (typeof window.restoreSelectedBackup === 'function') {
            window.originalRestoreSelectedBackup = window.restoreSelectedBackup;
            window.restoreSelectedBackup = enhancedRestoreSelectedBackup;
        }
        
        // تحسين وظيفة إنشاء النسخة الاحتياطية
        if (typeof window.createBackup === 'function') {
            window.originalCreateBackup = window.createBackup;
            window.createBackup = enhancedCreateBackup;
        }
        
        // إضافة زر فحص للنسخة الاحتياطية
        addExamineButton();
        
        // تحسين عناصر واجهة المستخدم
        enhanceBackupUI();
        
        // استدعاء التحميل المحسن للنسخ الاحتياطية
        setTimeout(loadPreviousBackupsEnhanced, 1000);
    }

    // إضافة زر فحص النسخة الاحتياطية قبل الاستعادة
    function addExamineButton() {
        const restoreBtn = document.querySelector('button[onclick="restoreBackup()"]');
        if (restoreBtn) {
            const examineBtn = document.createElement('button');
            examineBtn.className = 'btn btn-info';
            examineBtn.innerHTML = '<i class="fas fa-search"></i> فحص الملف';
            examineBtn.style.marginRight = '5px';
            examineBtn.onclick = function() {
                examineBackupFile();
            };
            
            // إضافة الزر قبل زر الاستعادة
            restoreBtn.parentNode.insertBefore(examineBtn, restoreBtn);
        }
    }

    // تحسين واجهة النسخ الاحتياطي
    function enhanceBackupUI() {
        // تحسين مظهر خيارات النسخ الاحتياطي
        const backupContainer = document.querySelector('#backupSettings .form-container');
        if (backupContainer) {
            // إضافة معلومات إضافية
            const infoAlert = document.createElement('div');
            infoAlert.className = 'alert alert-info';
            infoAlert.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">نظام النسخ الاحتياطي المحسن</div>
                    <div class="alert-text">
                        تم تحسين نظام النسخ الاحتياطي لتوفير مزيد من الاعتمادية وخيارات الاستعادة المتقدمة.
                    </div>
                </div>
            `;
            backupContainer.insertBefore(infoAlert, backupContainer.firstChild);
            
            // تحسين مظهر مربع اختيار النسخة الاحتياطية
            const fileInput = document.getElementById('restoreFile');
            if (fileInput) {
                fileInput.classList.add('enhanced-file-input');
                
                // إضافة نص توجيهي
                const helpText = document.createElement('div');
                helpText.className = 'form-text';
                helpText.innerHTML = 'يمكنك استعادة النسخ الاحتياطية من ملفات JSON المحفوظة سابقاً';
                fileInput.parentNode.appendChild(helpText);
            }
        }
    }

    // إنشاء نسخة احتياطية محسن
    function enhancedCreateBackup() {
        console.log("إنشاء نسخة احتياطية محسنة");
        
        try {
            // إنشاء اسم النسخة الاحتياطية
            const now = new Date();
            const defaultName = `نسخة احتياطية ${now.toLocaleDateString('ar-IQ')} ${now.toLocaleTimeString('ar-IQ')}`;
            const backupName = prompt('أدخل اسم النسخة الاحتياطية:', defaultName);
            
            if (backupName === null) return; // تم الإلغاء
            
            // إنشاء كائن النسخة الاحتياطية
            const backup = {
                id: generateId(),
                name: backupName,
                date: now.toISOString(),
                version: '2.0', // إصدار النسخة الاحتياطية المحسنة
                description: 'نسخة احتياطية كاملة من النظام',
                createdBy: 'النظام المحسن للنسخ الاحتياطي',
                data: {
                    investors: window.investors || [],
                    investments: window.investments || [],
                    operations: window.operations || [],
                    settings: window.settings || {},
                    events: window.events || [],
                    notifications: window.notifications || []
                }
            };
            
            // إضافة معلومات إضافية
            backup.stats = {
                investorsCount: backup.data.investors.length,
                investmentsCount: backup.data.investments.length,
                operationsCount: backup.data.operations.length,
                eventsCount: backup.data.events.length
            };
            
            // إظهار رسالة تقدم العمل
            const progressToast = createProgressToast('جاري إنشاء النسخة الاحتياطية...');
            
            // تنزيل النسخة الاحتياطية (تأخير قصير للسماح بظهور رسالة التقدم)
            setTimeout(() => {
                try {
                    // تنزيل ملف JSON
                    const jsonStr = JSON.stringify(backup, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_${now.toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // إضافة النسخة الاحتياطية إلى القائمة
                    addToBackupList(backup);
                    
                    // اكتمال التقدم
                    updateProgressToast(progressToast, 100, 'تم إنشاء النسخة الاحتياطية بنجاح');
                    
                    // إظهار رسالة نجاح
                    setTimeout(() => {
                        removeProgressToast(progressToast);
                        createNotification('نجاح', 'تم إنشاء وتنزيل النسخة الاحتياطية بنجاح', 'success');
                    }, 800);
                    
                } catch (err) {
                    console.error("خطأ أثناء تنزيل النسخة الاحتياطية:", err);
                    removeProgressToast(progressToast);
                    createNotification('خطأ', 'حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + err.message, 'danger');
                }
            }, 500);
            
        } catch (error) {
            console.error("خطأ أثناء إنشاء النسخة الاحتياطية:", error);
            createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + error.message, 'danger');
        }
    }

    // استعادة النسخة الاحتياطية المحسنة
    function enhancedRestoreBackup() {
        const fileInput = document.getElementById('restoreFile');
        
        if (!fileInput || !fileInput.files.length) {
            createNotification('خطأ', 'يرجى اختيار ملف', 'danger');
            return;
        }
        
        const file = fileInput.files[0];
        console.log("بدء استعادة الملف:", file.name, "الحجم:", file.size, "النوع:", file.type);
        
        // التحقق من امتداد الملف
        if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
            createNotification('خطأ', 'يجب اختيار ملف بتنسيق JSON', 'danger');
            return;
        }
        
        // إظهار رسالة تقدم العمل
        const progressToast = createProgressToast('جاري قراءة ملف النسخة الاحتياطية...');
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                updateProgressToast(progressToast, 50, 'تحليل البيانات...');
                
                const content = event.target.result;
                console.log("تم قراءة الملف بنجاح، حجم المحتوى:", content.length);
                
                let backup;
                try {
                    backup = JSON.parse(content);
                    console.log("تم تحليل JSON بنجاح");
                    
                    updateProgressToast(progressToast, 70, 'تحليل محتوى النسخة الاحتياطية...');
                    
                } catch (parseError) {
                    console.error("خطأ في تحليل ملف JSON:", parseError);
                    removeProgressToast(progressToast);
                    createNotification('خطأ', 'تنسيق الملف غير صالح. تأكد من أن الملف بتنسيق JSON صحيح', 'danger');
                    return;
                }
                
                // التحقق من صحة محتوى النسخة الاحتياطية
                const isValid = validateBackup(backup);
                
                if (isValid) {
                    // عرض معلومات النسخة الاحتياطية
                    removeProgressToast(progressToast);
                    displayBackupInfo(backup);
                } else {
                    removeProgressToast(progressToast);
                    createNotification('خطأ', 'ملف النسخة الاحتياطية غير صالح أو لا يحتوي على البيانات المطلوبة', 'danger');
                }
                
            } catch (error) {
                console.error("خطأ أثناء معالجة ملف النسخة الاحتياطية:", error);
                removeProgressToast(progressToast);
                createNotification('خطأ', 'حدث خطأ أثناء معالجة ملف النسخة الاحتياطية: ' + error.message, 'danger');
            }
        };
        
        reader.onerror = function() {
            console.error("خطأ في قراءة الملف");
            removeProgressToast(progressToast);
            createNotification('خطأ', 'فشل في قراءة الملف، يرجى المحاولة مرة أخرى', 'danger');
        };
        
        reader.readAsText(file);
    }

    // استعادة النسخة الاحتياطية المحددة المحسنة
    function enhancedRestoreSelectedBackup() {
        const select = document.getElementById('previousBackups');
        
        if (!select || !select.value) {
            createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
            return;
        }
        
        const backupId = select.value;
        
        // البحث عن النسخة الاحتياطية
        const backup = findBackup(backupId);
        
        if (!backup) {
            createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
            return;
        }
        
        // عرض معلومات النسخة الاحتياطية
        displayBackupInfo(backup);
    }
    
    // التحقق من صحة النسخة الاحتياطية
    function validateBackup(backup) {
        // التحقق من بنية النسخة الاحتياطية
        if (!backup) return false;
        
        // استخراج البيانات
        const data = backup.data || backup;
        
        // التحقق من وجود كائنات البيانات الرئيسية
        if (!data.investors && !data.investments && !data.operations) {
            console.warn("محتوى النسخة الاحتياطية غير صالح: لا توجد بيانات للمستثمرين أو الاستثمارات أو العمليات");
            return false;
        }
        
        // التحقق من أنواع البيانات
        if (data.investors && !Array.isArray(data.investors)) {
            console.warn("محتوى النسخة الاحتياطية غير صالح: المستثمرين ليسوا مصفوفة");
            return false;
        }
        
        if (data.investments && !Array.isArray(data.investments)) {
            console.warn("محتوى النسخة الاحتياطية غير صالح: الاستثمارات ليست مصفوفة");
            return false;
        }
        
        if (data.operations && !Array.isArray(data.operations)) {
            console.warn("محتوى النسخة الاحتياطية غير صالح: العمليات ليست مصفوفة");
            return false;
        }
        
        // تحقق إضافي: يجب أن تحتوي على بيانات واحدة على الأقل
        const hasInvestors = data.investors && data.investors.length > 0;
        const hasInvestments = data.investments && data.investments.length > 0;
        const hasOperations = data.operations && data.operations.length > 0;
        
        if (!hasInvestors && !hasInvestments && !hasOperations) {
            console.warn("محتوى النسخة الاحتياطية غير صالح: جميع المصفوفات فارغة");
            return false;
        }
        
        return true;
    }

    // فحص ملف النسخة الاحتياطية
    function examineBackupFile() {
        const fileInput = document.getElementById('restoreFile');
        
        if (!fileInput || !fileInput.files.length) {
            createNotification('خطأ', 'يرجى اختيار ملف للفحص', 'danger');
            return;
        }
        
        const file = fileInput.files[0];
        console.log("فحص الملف:", file.name);
        
        // إظهار رسالة تقدم العمل
        const progressToast = createProgressToast('جاري فحص ملف النسخة الاحتياطية...');
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                updateProgressToast(progressToast, 50, 'تحليل البيانات...');
                
                const content = event.target.result;
                
                let backup;
                try {
                    backup = JSON.parse(content);
                    updateProgressToast(progressToast, 70, 'اكتمل تحليل البيانات');
                } catch (parseError) {
                    removeProgressToast(progressToast);
                    createNotification('خطأ', 'تنسيق الملف غير صالح. تأكد من أن الملف بتنسيق JSON صحيح', 'danger');
                    return;
                }
                
                // عرض معلومات النسخة الاحتياطية
                removeProgressToast(progressToast);
                displayBackupInfo(backup, true); // وضع الفحص فقط
                
            } catch (error) {
                removeProgressToast(progressToast);
                createNotification('خطأ', 'حدث خطأ أثناء فحص الملف: ' + error.message, 'danger');
            }
        };
        
        reader.onerror = function() {
            removeProgressToast(progressToast);
            createNotification('خطأ', 'فشل في قراءة الملف', 'danger');
        };
        
        reader.readAsText(file);
    }

// Fix for displayBackupInfo function in backup-restore-enhanced.js
function displayBackupInfo(backup, examineOnly = false) {
    // Extract backup data
    const data = backup.data || backup;
    
    // Calculate item counts
    const investorsCount = data.investors ? data.investors.length : 0;
    const investmentsCount = data.investments ? data.investments.length : 0;
    const operationsCount = data.operations ? data.operations.length : 0;
    const eventsCount = data.events ? data.events.length : 0;
    const notificationsCount = data.notifications ? data.notifications.length : 0;
    
    // Format backup date
    const backupDate = backup.date ? new Date(backup.date) : new Date();
    const formattedDate = backupDate.toLocaleDateString('ar-IQ') + ' ' + backupDate.toLocaleTimeString('ar-IQ');
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'backupInfoModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">معلومات النسخة الاحتياطية</h2>
                <div class="modal-close" onclick="document.getElementById('backupInfoModal').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    <div class="alert-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">ملخص النسخة الاحتياطية</div>
                        <div class="alert-text">
                            ${backup.name ? `<strong>الاسم:</strong> ${backup.name}<br>` : ''}
                            <strong>التاريخ:</strong> ${formattedDate}<br>
                            ${backup.description ? `<strong>الوصف:</strong> ${backup.description}<br>` : ''}
                            <strong>الإصدار:</strong> ${backup.version || '1.0'}
                        </div>
                    </div>
                </div>
                
                <div class="form-container" style="box-shadow: none; padding: 0;">
                    <h3 style="margin-bottom: 10px;">محتويات النسخة الاحتياطية</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-users" style="margin-right: 10px; color: var(--primary-color);"></i> 
                            المستثمرين: <strong>${investorsCount}</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-money-bill-wave" style="margin-right: 10px; color: var(--success-color);"></i> 
                            الاستثمارات: <strong>${investmentsCount}</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-exchange-alt" style="margin-right: 10px; color: var(--warning-color);"></i> 
                            العمليات: <strong>${operationsCount}</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-calendar-alt" style="margin-right: 10px; color: var(--info-color);"></i> 
                            الأحداث: <strong>${eventsCount}</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-bell" style="margin-right: 10px; color: var(--danger-color);"></i> 
                            الإشعارات: <strong>${notificationsCount}</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            <i class="fas fa-cog" style="margin-right: 10px; color: var(--gray-600);"></i> 
                            الإعدادات: <strong>${data.settings ? 'متوفرة' : 'غير متوفرة'}</strong>
                        </li>
                    </ul>
                </div>
                
                ${!examineOnly ? `
                <div class="form-group">
                    <h3 style="margin-bottom: 10px;">خيارات الاستعادة</h3>
                    <div class="form-check">
                        <input type="radio" class="form-check-input" id="restoreOption1" name="restoreOption" value="replace" checked>
                        <label class="form-check-label" for="restoreOption1">استبدال البيانات الحالية</label>
                        <p class="form-text">سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية.</p>
                    </div>
                    <div class="form-check">
                        <input type="radio" class="form-check-input" id="restoreOption2" name="restoreOption" value="merge">
                        <label class="form-check-label" for="restoreOption2">دمج مع البيانات الحالية</label>
                        <p class="form-text">سيتم دمج البيانات من النسخة الاحتياطية مع البيانات الحالية.</p>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('backupInfoModal').remove()">إغلاق</button>
                ${!examineOnly ? `
                <button class="btn btn-primary" id="continueRestoreBtn">
                    <i class="fas fa-upload"></i> استعادة النسخة الاحتياطية
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store backup temporarily
    window.tempBackup = backup;
    
    // Add event listener to the restore button instead of using inline onclick
    if (!examineOnly) {
        document.getElementById('continueRestoreBtn').addEventListener('click', function() {
            const restoreOption = document.querySelector('input[name="restoreOption"]:checked').value;
            document.getElementById('backupInfoModal').remove();
            
            const backupToRestore = window.tempBackup;
            delete window.tempBackup;
            
            // Create progress toast and restore backup
            const progressToast = createProgressToast('جاري استعادة النسخة الاحتياطية...');
            
            setTimeout(() => {
                try {
                    if (restoreOption === 'merge') {
                        updateProgressToast(progressToast, 30, 'دمج البيانات...');
                        restoreMergeBackup(backupToRestore);
                    } else {
                        updateProgressToast(progressToast, 30, 'استبدال البيانات...');
                        restoreReplaceBackup(backupToRestore);
                    }
                    
                    updateProgressToast(progressToast, 100, 'تمت الاستعادة بنجاح');
                    
                    setTimeout(() => {
                        removeProgressToast(progressToast);
                        // Reload page
                        window.location.reload();
                    }, 1000);
                } catch (error) {
                    console.error("خطأ أثناء استعادة النسخة الاحتياطية:", error);
                    removeProgressToast(progressToast);
                    createNotification('خطأ', 'حدث خطأ أثناء استعادة النسخة الاحتياطية: ' + error.message, 'danger');
                }
            }, 500);
        });
    }
}
    // البحث عن نسخة احتياطية بواسطة المعرف
    function findBackup(id) {
        if (!window.backupList || !Array.isArray(window.backupList)) {
            console.error("قائمة النسخ الاحتياطية غير متوفرة");
            return null;
        }
        
        return window.backupList.find(b => b.id === id);
    }

    // استعادة البيانات (استبدال)
    function restoreReplaceBackup(backup) {
        // استخراج البيانات
        const data = backup.data || backup;
        
        console.log("استعادة البيانات بوضع الاستبدال");
        
        // استعادة البيانات بترتيب آمن
        if (data.settings) {
            window.settings = {...window.settings, ...data.settings};
            console.log("تم استعادة الإعدادات");
        }
        
        if (Array.isArray(data.investors)) {
            window.investors = data.investors;
            console.log(`تم استعادة ${data.investors.length} مستثمر`);
        }
        
        if (Array.isArray(data.investments)) {
            window.investments = data.investments;
            console.log(`تم استعادة ${data.investments.length} استثمار`);
        }
        
        if (Array.isArray(data.operations)) {
            window.operations = data.operations;
            console.log(`تم استعادة ${data.operations.length} عملية`);
        }
        
        if (Array.isArray(data.events)) {
            window.events = data.events;
            console.log(`تم استعادة ${data.events.length} حدث`);
        }
        
        if (Array.isArray(data.notifications)) {
            window.notifications = data.notifications;
            console.log(`تم استعادة ${data.notifications.length} إشعار`);
        }
        
        // حفظ البيانات
        saveAllData();
        
        // إضافة النسخة الاحتياطية إلى القائمة إذا لم تكن موجودة
        addToBackupList(backup);
        
        // إظهار رسالة نجاح
        createNotification('نجاح', 'تمت استعادة النسخة الاحتياطية بنجاح', 'success');
    }

    // استعادة البيانات (دمج)
    function restoreMergeBackup(backup) {
        // استخراج البيانات
        const data = backup.data || backup;
        
        console.log("استعادة البيانات بوضع الدمج");
        
        // جمع البيانات الحالية
        const currentData = {
            investors: window.investors || [],
            investments: window.investments || [],
            operations: window.operations || [],
            events: window.events || [],
            notifications: window.notifications || [],
            settings: window.settings || {}
        };
        
        // دمج الإعدادات
        if (data.settings) {
            window.settings = {...currentData.settings, ...data.settings};
            console.log("تم دمج الإعدادات");
        }
        
        // دمج المستثمرين
        if (Array.isArray(data.investors)) {
            const mergedInvestors = [...currentData.investors];
            let newCount = 0;
            let updatedCount = 0;
            
            data.investors.forEach(investor => {
                const existingIndex = mergedInvestors.findIndex(inv => inv.id === investor.id);
                
                if (existingIndex === -1) {
                    // مستثمر جديد
                    mergedInvestors.push(investor);
                    newCount++;
                } else {
                    // تحديث المستثمر الموجود
                    mergedInvestors[existingIndex] = investor;
                    updatedCount++;
                }
            });
            
            window.investors = mergedInvestors;
            console.log(`تم دمج المستثمرين: ${newCount} جديد، ${updatedCount} محدث`);
        }
        
        // دمج الاستثمارات
        if (Array.isArray(data.investments)) {
            const mergedInvestments = [...currentData.investments];
            let newCount = 0;
            let updatedCount = 0;
            
            data.investments.forEach(investment => {
                const existingIndex = mergedInvestments.findIndex(inv => inv.id === investment.id);
                
                if (existingIndex === -1) {
                    // استثمار جديد
                    mergedInvestments.push(investment);
                    newCount++;
                } else {
                    // تحديث الاستثمار الموجود
                    mergedInvestments[existingIndex] = investment;
                    updatedCount++;
                }
            });
            
            window.investments = mergedInvestments;
            console.log(`تم دمج الاستثمارات: ${newCount} جديد، ${updatedCount} محدث`);
        }
        
        // دمج العمليات
        if (Array.isArray(data.operations)) {
            const mergedOperations = [...currentData.operations];
            let newCount = 0;
            let updatedCount = 0;
            
            data.operations.forEach(operation => {
                const existingIndex = mergedOperations.findIndex(op => op.id === operation.id);
                
                if (existingIndex === -1) {
                    // عملية جديدة
                    mergedOperations.push(operation);
                    newCount++;
                } else {
                    // تحديث العملية الموجودة
                    mergedOperations[existingIndex] = operation;
                    updatedCount++;
                }
            });
            
            window.operations = mergedOperations;
            console.log(`تم دمج العمليات: ${newCount} جديد، ${updatedCount} محدث`);
        }
        
        // دمج الأحداث
        if (Array.isArray(data.events)) {
            const mergedEvents = [...currentData.events];
            let newCount = 0;
            let updatedCount = 0;
            
            data.events.forEach(event => {
                const existingIndex = mergedEvents.findIndex(ev => ev.id === event.id);
                
                if (existingIndex === -1) {
                    // حدث جديد
                    mergedEvents.push(event);
                    newCount++;
                } else {
                    // تحديث الحدث الموجود
                    mergedEvents[existingIndex] = event;
                    updatedCount++;
                }
            });
            
            window.events = mergedEvents;
            console.log(`تم دمج الأحداث: ${newCount} جديد، ${updatedCount} محدث`);
        }
        
        // دمج الإشعارات
        if (Array.isArray(data.notifications)) {
            const mergedNotifications = [...currentData.notifications];
            let newCount = 0;
            
            data.notifications.forEach(notification => {
                const exists = mergedNotifications.some(n => n.id === notification.id);
                
                if (!exists) {
                    // إشعار جديد
                    mergedNotifications.push(notification);
                    newCount++;
                }
            });
            
            window.notifications = mergedNotifications;
            console.log(`تم دمج الإشعارات: ${newCount} جديد`);
        }
        
        // حفظ البيانات
        saveAllData();
        
        // إضافة النسخة الاحتياطية إلى القائمة إذا لم تكن موجودة
        addToBackupList(backup);
        
        // إظهار رسالة نجاح
        createNotification('نجاح', 'تم دمج النسخة الاحتياطية بنجاح', 'success');
    }

    // حفظ جميع البيانات
    function saveAllData() {
        // استخدام الدوال المحددة مسبقاً للحفظ
        if (typeof window.saveData === 'function') {
            window.saveData();
        }
        
        if (typeof window.saveNotifications === 'function') {
            window.saveNotifications();
        }
        
        // حفظ الأحداث إذا لم تكن تُحفظ ضمن saveData
        try {
            localStorage.setItem('events', JSON.stringify(window.events || []));
        } catch (e) {
            console.error("خطأ في حفظ الأحداث:", e);
        }
    }

    // إضافة النسخة الاحتياطية إلى القائمة
    function addToBackupList(backup) {
        // التأكد من وجود قائمة النسخ الاحتياطية
        if (!window.backupList) {
            window.backupList = [];
        }
        
        // التحقق من وجود النسخة الاحتياطية في القائمة
        const existingIndex = window.backupList.findIndex(b => b.id === backup.id);
        
        if (existingIndex === -1) {
            // إضافة النسخة الاحتياطية الجديدة
            window.backupList.push(backup);
        } else {
            // تحديث النسخة الاحتياطية الموجودة
            window.backupList[existingIndex] = backup;
        }
        
        // حفظ قائمة النسخ الاحتياطية
        if (typeof window.saveBackupList === 'function') {
            window.saveBackupList();
        } else {
            try {
                localStorage.setItem('backupList', JSON.stringify(window.backupList));
            } catch (e) {
                console.error("خطأ في حفظ قائمة النسخ الاحتياطية:", e);
            }
        }
        
        // تحديث قائمة النسخ الاحتياطية في واجهة المستخدم
        loadPreviousBackupsEnhanced();
    }

    // التحميل المحسن للنسخ الاحتياطية السابقة
    function loadPreviousBackupsEnhanced() {
        const backupsSelect = document.getElementById('previousBackups');
        if (!backupsSelect) return;
        
        backupsSelect.innerHTML = '';
        
        // التحقق من وجود قائمة النسخ الاحتياطية
        if (!window.backupList || !Array.isArray(window.backupList) || window.backupList.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'لا توجد نسخ احتياطية سابقة';
            option.disabled = true;
            backupsSelect.appendChild(option);
            return;
        }
        
        // ترتيب النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
        const sortedBackups = [...window.backupList].sort((a, b) => {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });
        
        // إضافة النسخ الاحتياطية إلى القائمة
        sortedBackups.forEach(backup => {
            const option = document.createElement('option');
            option.value = backup.id;
            
            // تنسيق التاريخ
            let dateText = '';
            if (backup.date) {
                const date = new Date(backup.date);
                dateText = `${date.toLocaleDateString('ar-IQ')} ${date.toLocaleTimeString('ar-IQ')}`;
            }
            
            // تنسيق النص المعروض
            option.textContent = backup.name ? 
                `${backup.name} - ${dateText}` : 
                `نسخة احتياطية - ${dateText}`;
            
            backupsSelect.appendChild(option);
        });
    }

    // إنشاء رسالة تقدم العمل
    function createProgressToast(message) {
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.innerHTML = `
            <div class="progress-toast-content">
                <div class="progress-toast-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="progress-toast-message">${message}</div>
            </div>
            <div class="progress-toast-bar">
                <div class="progress-toast-progress" style="width: 0%"></div>
            </div>
        `;
        
        // أنماط CSS للرسالة
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.style.maxWidth = '500px';
        toast.style.background = 'white';
        toast.style.padding = '15px';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        
        // أنماط CSS للمحتوى
        const content = toast.querySelector('.progress-toast-content');
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.marginBottom = '10px';
        
        // أنماط CSS للأيقونة
        const icon = toast.querySelector('.progress-toast-icon');
        icon.style.marginLeft = '10px';
        icon.style.color = 'var(--primary-color)';
        
        // أنماط CSS لشريط التقدم
        const bar = toast.querySelector('.progress-toast-bar');
        bar.style.height = '5px';
        bar.style.background = '#eee';
        bar.style.borderRadius = '5px';
        bar.style.overflow = 'hidden';
        
        // أنماط CSS لمؤشر التقدم
        const progress = toast.querySelector('.progress-toast-progress');
        progress.style.height = '100%';
        progress.style.background = 'var(--primary-color)';
        progress.style.width = '0%';
        progress.style.transition = 'width 0.3s ease';
        
        document.body.appendChild(toast);
        
        return toast;
    }

    // تحديث رسالة تقدم العمل
    function updateProgressToast(toast, percentage, message = null) {
        if (!toast) return;
        
        const progress = toast.querySelector('.progress-toast-progress');
        if (progress) {
            progress.style.width = `${percentage}%`;
        }
        
        if (message) {
            const messageElement = toast.querySelector('.progress-toast-message');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
        
        if (percentage >= 100) {
            const icon = toast.querySelector('.progress-toast-icon i');
            if (icon) {
                icon.className = 'fas fa-check-circle';
            }
        }
    }

    // إزالة رسالة تقدم العمل
    function removeProgressToast(toast) {
        if (!toast) return;
        
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // إنشاء معرف فريد
    function generateId() {
        // استخدام وظيفة النظام إذا كانت متوفرة
        if (typeof window.generateId === 'function') {
            return window.generateId();
        }
        
        // وظيفة احتياطية لإنشاء معرف فريد
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // التحقق من وجود وحدة إنشاء الإشعارات
    if (typeof createNotification !== 'function') {
        window.createNotification = function(title, message, type = 'info') {
            console.log(`[${type}] ${title}: ${message}`);
            alert(`${title}: ${message}`);
        };
    }
})();