/**
 * electron-backup-fix.js
 * هذا الملف يصلح مشكلة النسخ الاحتياطي في بيئة Electron
 */

// التأكد من وجود الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 تم تحميل إصلاح النسخ الاحتياطي لـ Electron');
    
    // إصلاح دالة إنشاء النسخة الاحتياطية لـ Firebase
    fixFirebaseBackupFunction();
    
    // إصلاح دالة إنشاء النسخة الاحتياطية المحلية
    fixLocalBackupFunction();
    
    // إضافة حدث النقر لزر إنشاء نسخة احتياطية في الإعدادات
    addBackupButtonClickHandlers();
});

/**
 * إصلاح دالة إنشاء النسخة الاحتياطية لـ Firebase
 */
function fixFirebaseBackupFunction() {
    // حفظ نسخة من الدالة الأصلية إذا كانت موجودة
    const originalCreateBackup = window.firebaseApp && window.firebaseApp.createBackup 
        ? window.firebaseApp.createBackup 
        : null;
    
    // إنشاء دالة جديدة لإنشاء النسخة الاحتياطية
    const newCreateBackup = function() {
        // إنشاء نافذة منبثقة مخصصة بدلاً من استخدام prompt العادي
        showCustomBackupPrompt(function(backupName) {
            if (!backupName) return; // إلغاء العملية إذا لم يتم إدخال اسم
            
            // إنشاء النسخة الاحتياطية
            try {
                const date = new Date();
                
                // إنشاء النسخة الاحتياطية
                const backup = {
                    id: generateId(),
                    name: backupName,
                    date: date.toISOString(),
                    data: {
                        investors: investors,
                        investments: investments,
                        operations: operations,
                        settings: settings,
                        events: events,
                        notifications: notifications
                    }
                };
                
                // إضافة النسخة الاحتياطية إلى القائمة المحلية
                backupList.push(backup);
                
                // حفظ قائمة النسخ الاحتياطية
                saveBackupList();
                
                // تحديث قائمة النسخ الاحتياطية
                updateBackupsList();
                
                // عرض رسالة نجاح
                createNotification('نجاح', 'تم إنشاء نسخة احتياطية بنجاح', 'success');
                
                // إذا كانت Firebase مهيئة، قم بحفظ النسخة الاحتياطية في Firebase
                if (window.firebaseApp && window.firebaseApp.isInitialized && window.firebaseApp.currentUser) {
                    saveBackupToFirebase(backup);
                }
            } catch (error) {
                console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
                createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'danger');
            }
        });
    };
    
    // استبدال الدالة الأصلية بالدالة الجديدة
    if (window.firebaseApp) {
        window.firebaseApp.createBackup = newCreateBackup;
    } else {
        // إنشاء كائن firebaseApp إذا لم يكن موجوداً
        window.firebaseApp = window.firebaseApp || {};
        window.firebaseApp.createBackup = newCreateBackup;
    }
    
    // إعادة تعريف دالة إنشاء نسخة احتياطية من الإعدادات
    window.createFirebaseBackupFromSettings = function() {
        newCreateBackup();
    };
}

/**
 * إصلاح دالة إنشاء النسخة الاحتياطية المحلية
 */
function fixLocalBackupFunction() {
    // حفظ نسخة من الدالة الأصلية
    const originalCreateBackup = window.createBackup;
    
    // إنشاء دالة جديدة لإنشاء النسخة الاحتياطية المحلية
    window.createBackup = function() {
        // إنشاء نافذة منبثقة مخصصة
        showCustomBackupPrompt(function(backupName) {
            if (!backupName) return; // إلغاء العملية إذا لم يتم إدخال اسم
            
            try {
                // إنشاء النسخة الاحتياطية
                const backup = {
                    id: generateId(),
                    name: backupName,
                    date: new Date().toISOString(),
                    data: {
                        investors: investors,
                        investments: investments,
                        operations: operations,
                        settings: settings,
                        events: events,
                        notifications: notifications
                    }
                };
                
                // حفظ النسخة الاحتياطية كملف
                const data = JSON.stringify(backup, null, 2);
                saveAsFile(data, `${backupName}.json`, 'application/json');
                
                // إضافة النسخة الاحتياطية إلى القائمة
                backupList.push(backup);
                
                // حفظ قائمة النسخ الاحتياطية
                saveBackupList();
                
                // تحديث قائمة النسخ الاحتياطية في الواجهة
                loadPreviousBackups();
                
                // عرض رسالة نجاح
                createNotification('نجاح', 'تم إنشاء نسخة احتياطية بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
                createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'danger');
            }
        });
    };
}

/**
 * عرض نافذة منبثقة مخصصة لإنشاء نسخة احتياطية
 * @param {Function} callback دالة يتم استدعاؤها بعد إدخال اسم النسخة الاحتياطية
 */
function showCustomBackupPrompt(callback) {
    // التحقق من وجود نافذة منبثقة مفتوحة مسبقاً
    if (document.getElementById('customBackupPrompt')) {
        document.getElementById('customBackupPrompt').remove();
    }
    
    // إنشاء تاريخ لاستخدامه في الاسم الافتراضي
    const date = new Date();
    const defaultName = `نسخة احتياطية ${date.toLocaleDateString('ar-IQ')} ${date.toLocaleTimeString('ar-IQ')}`;
    
    // إنشاء عناصر النافذة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'customBackupPrompt';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h2 class="modal-title">إنشاء نسخة احتياطية</h2>
                <div class="modal-close" onclick="document.getElementById('customBackupPrompt').remove()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">اسم النسخة الاحتياطية</label>
                    <input type="text" class="form-control" id="backupNameInput" value="${defaultName}">
                    <p class="form-text">أدخل اسماً وصفياً للنسخة الاحتياطية.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="document.getElementById('customBackupPrompt').remove()">إلغاء</button>
                <button class="btn btn-primary" id="confirmBackupBtn">
                    <i class="fas fa-save"></i> إنشاء النسخة الاحتياطية
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // التركيز على حقل الإدخال
    setTimeout(() => {
        const input = document.getElementById('backupNameInput');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // إضافة حدث النقر لزر التأكيد
    const confirmBtn = document.getElementById('confirmBackupBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const backupName = document.getElementById('backupNameInput').value || defaultName;
            document.getElementById('customBackupPrompt').remove();
            callback(backupName);
        });
    }
    
    // إضافة حدث الضغط على Enter لتأكيد الإدخال
    const input = document.getElementById('backupNameInput');
    if (input) {
        input.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const backupName = document.getElementById('backupNameInput').value || defaultName;
                document.getElementById('customBackupPrompt').remove();
                callback(backupName);
            }
        });
    }
}

/**
 * حفظ النسخة الاحتياطية في Firebase
 * @param {Object} backup كائن النسخة الاحتياطية
 */
function saveBackupToFirebase(backup) {
    if (window.firebase && window.firebase.database && window.firebaseApp.currentUser) {
        try {
            // الحصول على مرجع لقاعدة البيانات
            const db = firebase.database();
            const userId = window.firebaseApp.currentUser.uid;
            
            // حفظ النسخة الاحتياطية في Firebase
            db.ref('users/' + userId + '/backups/' + backup.id).set(backup)
                .then(() => {
                    console.log('تم حفظ النسخة الاحتياطية في Firebase بنجاح');
                })
                .catch(error => {
                    console.error('خطأ في حفظ النسخة الاحتياطية في Firebase:', error);
                });
        } catch (error) {
            console.error('خطأ في الوصول إلى Firebase:', error);
        }
    }
}

/**
 * حفظ البيانات كملف
 * @param {string} data البيانات المراد حفظها
 * @param {string} filename اسم الملف
 * @param {string} type نوع الملف
 */
function saveAsFile(data, filename, type) {
    // إنشاء رابط لتنزيل الملف
    const blob = new Blob([data], { type: type });
    
    if (window.electron) {
        // استخدام واجهة Electron لحفظ الملف
        window.electron.saveFile(filename, blob);
    } else {
        // السلوك الافتراضي للمتصفح
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

/**
 * إضافة معالجات النقر لأزرار النسخ الاحتياطي
 */
function addBackupButtonClickHandlers() {
    // تسجيل النقر على زر النسخ الاحتياطي في الإعدادات
    document.addEventListener('click', function(event) {
        // البحث عن الزر بالنص أو بالوظيفة
        if (event.target && 
            (event.target.textContent.includes('إنشاء نسخة احتياطية') || 
             event.target.onclick && event.target.onclick.toString().includes('createBackup'))) {
            
            // إيقاف السلوك الافتراضي
            event.preventDefault();
            event.stopPropagation();
            
            // استدعاء دالة النسخ الاحتياطي المصححة
            window.createBackup();
        }
        
        // البحث عن زر إنشاء نسخة جديدة في نافذة المزامنة
        if (event.target && 
            (event.target.textContent.includes('إنشاء نسخة جديدة') || 
             event.target.onclick && event.target.onclick.toString().includes('createFirebaseBackup'))) {
            
            // إيقاف السلوك الافتراضي
            event.preventDefault();
            event.stopPropagation();
            
            // استدعاء دالة النسخ الاحتياطي لـ Firebase المصححة
            window.createFirebaseBackupFromSettings();
        }
    }, true);
}