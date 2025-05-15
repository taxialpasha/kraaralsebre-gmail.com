/**
 * نظام النسخ الاحتياطي الشامل
 * هذا الملف يحتوي على وظائف النسخ الاحتياطي الشامل واستعادة النظام
 */

// كائن عام لإدارة النسخ الاحتياطي الشامل
window.ComprehensiveBackupSystem = {
    // قائمة النسخ الاحتياطية المتوفرة
    backups: [],
    
    // خيارات النسخ الاحتياطي
    options: {
        formats: {
            json: true,
            pdf: true,
            excel: true,
            word: true
        },
        // مسار حفظ النسخ الاحتياطية (افتراضي)
        backupPath: './backups/',
        // حفظ صور المستندات
        includeDocuments: true,
        // حفظ الإعدادات
        includeSettings: true,
        // عدد النسخ الاحتياطية المحتفظ بها
        maxBackups: 10,
        // التشفير
        encryption: false,
        // كلمة مرور التشفير
        encryptionPassword: '',
        // النسخ الاحتياطي التلقائي
        autoBackup: false,
        // فترة النسخ الاحتياطي التلقائي (بالأيام)
        autoBackupInterval: 7
    },
    
    // تهيئة النظام
    init: function() {
        // تحميل الخيارات من التخزين المحلي
        this.loadOptions();
        // تحميل قائمة النسخ الاحتياطية
        this.loadBackupsList();
        // إعداد النسخ الاحتياطي التلقائي
        this.setupAutoBackup();
        console.log('تم تهيئة نظام النسخ الاحتياطي الشامل');
    },
    
    // تحميل خيارات النسخ الاحتياطي
    loadOptions: function() {
        const savedOptions = localStorage.getItem('comprehensiveBackupOptions');
        if (savedOptions) {
            try {
                this.options = {...this.options, ...JSON.parse(savedOptions)};
                console.log('تم تحميل خيارات النسخ الاحتياطي');
            } catch (error) {
                console.error('خطأ في تحميل خيارات النسخ الاحتياطي:', error);
            }
        }
    },
    
    // حفظ خيارات النسخ الاحتياطي
    saveOptions: function() {
        localStorage.setItem('comprehensiveBackupOptions', JSON.stringify(this.options));
        console.log('تم حفظ خيارات النسخ الاحتياطي');
        
        // إعادة إعداد النسخ الاحتياطي التلقائي
        this.setupAutoBackup();
    },
    
    // تحميل قائمة النسخ الاحتياطية
    loadBackupsList: function() {
        const savedBackups = localStorage.getItem('comprehensiveBackups');
        if (savedBackups) {
            try {
                this.backups = JSON.parse(savedBackups);
                console.log(`تم تحميل ${this.backups.length} نسخة احتياطية`);
            } catch (error) {
                console.error('خطأ في تحميل قائمة النسخ الاحتياطية:', error);
                this.backups = [];
            }
        }
        
        // تحديث قائمة النسخ الاحتياطية في واجهة المستخدم
        this.updateBackupsList();
    },
    
    // حفظ قائمة النسخ الاحتياطية
    saveBackupsList: function() {
        localStorage.setItem('comprehensiveBackups', JSON.stringify(this.backups));
        console.log('تم حفظ قائمة النسخ الاحتياطية');
        
        // تحديث قائمة النسخ الاحتياطية في واجهة المستخدم
        this.updateBackupsList();
    },
    
    // تحديث قائمة النسخ الاحتياطية في واجهة المستخدم
    updateBackupsList: function() {
        const backupListElement = document.getElementById('comprehensiveBackupsList');
        if (!backupListElement) return;
        
        backupListElement.innerHTML = '';
        
        if (this.backups.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'لا توجد نسخ احتياطية متوفرة';
            option.disabled = true;
            backupListElement.appendChild(option);
            return;
        }
        
        // فرز النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
        const sortedBackups = [...this.backups].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        sortedBackups.forEach(backup => {
            const option = document.createElement('option');
            option.value = backup.id;
            
            // تنسيق التاريخ والوقت للعرض
            const date = new Date(backup.createdAt);
            const formattedDate = date.toLocaleDateString('ar-IQ');
            const formattedTime = date.toLocaleTimeString('ar-IQ');
            
            option.textContent = `${backup.name} - ${formattedDate} ${formattedTime}`;
            backupListElement.appendChild(option);
        });
    },
    
    // إنشاء نسخة احتياطية شاملة
    createBackup: function(customName = '') {
        // عرض مؤشر التقدم
        this.showProgressBar();
        
        // جمع كل البيانات المطلوبة للنسخ الاحتياطي
        const backupData = this.collectBackupData();
        
        // إنشاء معرف فريد للنسخة الاحتياطية
        const backupId = this.generateBackupId();
        
        // إنشاء اسم النسخة الاحتياطية
        const now = new Date();
        const backupName = customName || `نسخة احتياطية شاملة - ${now.toLocaleDateString('ar-IQ')}`;
        
        // إنشاء كائن النسخة الاحتياطية
        const backup = {
            id: backupId,
            name: backupName,
            createdAt: now.toISOString(),
            formats: {...this.options.formats},
            data: backupData,
            size: JSON.stringify(backupData).length,
            location: this.options.backupPath + backupId + '/'
        };
        
        // تحديث مؤشر التقدم
        this.updateProgressBar(25, 'جاري جمع البيانات');
        
        // حفظ النسخة الاحتياطية بالصيغ المطلوبة
        Promise.all([
            this.options.formats.json ? this.saveAsJson(backup) : Promise.resolve(),
            this.options.formats.pdf ? this.saveAsPdf(backup) : Promise.resolve(),
            this.options.formats.excel ? this.saveAsExcel(backup) : Promise.resolve(),
            this.options.formats.word ? this.saveAsWord(backup) : Promise.resolve()
        ]).then(() => {
            // تحديث مؤشر التقدم
            this.updateProgressBar(75, 'جاري حفظ الملفات');
            
            // إضافة النسخة الاحتياطية إلى القائمة
            this.backups.push(backup);
            
            // حفظ قائمة النسخ الاحتياطية
            this.saveBackupsList();
            
            // التحقق من عدد النسخ الاحتياطية وحذف القديمة إذا تجاوز الحد
            this.cleanupOldBackups();
            
            // إخفاء مؤشر التقدم
            this.hideProgressBar();
            
            // عرض رسالة نجاح
            createNotification('نجاح', 'تم إنشاء النسخة الاحتياطية الشاملة بنجاح', 'success');
            
            // تحديث قائمة النسخ الاحتياطية في واجهة المستخدم
            this.updateBackupsList();
            
            console.log(`تم إنشاء نسخة احتياطية شاملة: ${backup.name}`);
        }).catch(error => {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            
            // إخفاء مؤشر التقدم
            this.hideProgressBar();
            
            // عرض رسالة خطأ
            createNotification('خطأ', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', 'danger');
        });
    },
    
    // استعادة النظام من نسخة احتياطية
    restoreFromBackup: function(backupId) {
        // التحقق من وجود النسخة الاحتياطية
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) {
            createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
            return;
        }
        
        // طلب تأكيد من المستخدم
        if (!confirm(`هل أنت متأكد من استعادة النظام من النسخة الاحتياطية "${backup.name}"؟ سيتم استبدال جميع البيانات الحالية.`)) {
            return;
        }
        
        // عرض مؤشر التقدم
        this.showProgressBar();
        this.updateProgressBar(10, 'جاري التحضير للاستعادة');
        
        // قراءة ملف النسخة الاحتياطية
        this.loadBackupFile(backup)
            .then(backupData => {
                // تحديث مؤشر التقدم
                this.updateProgressBar(40, 'جاري تحليل البيانات');
                
                // استعادة البيانات
                this.restoreData(backupData);
                
                // تحديث مؤشر التقدم
                this.updateProgressBar(80, 'جاري استعادة البيانات');
                
                // تحديث واجهة المستخدم
                this.updateUIAfterRestore();
                
                // إخفاء مؤشر التقدم
                this.hideProgressBar();
                
                // عرض رسالة نجاح
                createNotification('نجاح', 'تم استعادة النظام بنجاح من النسخة الاحتياطية', 'success');
                
                console.log(`تم استعادة النظام من النسخة الاحتياطية: ${backup.name}`);
                
                // إعادة تحميل الصفحة بعد الاستعادة
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch(error => {
                console.error('خطأ في استعادة النظام:', error);
                
                // إخفاء مؤشر التقدم
                this.hideProgressBar();
                
                // عرض رسالة خطأ
                createNotification('خطأ', 'حدث خطأ أثناء استعادة النظام', 'danger');
            });
    },
    
    // حذف نسخة احتياطية
    deleteBackup: function(backupId) {
        // التحقق من وجود النسخة الاحتياطية
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) {
            createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
            return;
        }
        
        // طلب تأكيد من المستخدم
        if (!confirm(`هل أنت متأكد من حذف النسخة الاحتياطية "${backup.name}"؟`)) {
            return;
        }
        
        // حذف ملفات النسخة الاحتياطية (في تطبيق حقيقي)
        // الإبقاء على النسخة في مجلد المهملات (مفيد للاستعادة)
        const trashedBackup = {...backup, trashed: true, trashedAt: new Date().toISOString()};
        
        // حذف النسخة الاحتياطية من القائمة
        this.backups = this.backups.filter(b => b.id !== backupId);
        
        // حفظ قائمة النسخ الاحتياطية
        this.saveBackupsList();
        
        // عرض رسالة نجاح
        createNotification('نجاح', 'تم حذف النسخة الاحتياطية بنجاح', 'success');
        
        console.log(`تم حذف النسخة الاحتياطية: ${backup.name}`);
    },
    
    // تنزيل نسخة احتياطية
    downloadBackup: function(backupId, format = 'json') {
        // التحقق من وجود النسخة الاحتياطية
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) {
            createNotification('خطأ', 'النسخة الاحتياطية غير موجودة', 'danger');
            return;
        }
        
        // تحضير البيانات للتنزيل
        const backupData = backup.data || this.collectBackupData();
        
        // تنزيل الملف بالصيغة المطلوبة
        switch (format.toLowerCase()) {
            case 'json':
                this.downloadAsJson(backup, backupData);
                break;
            case 'pdf':
                this.downloadAsPdf(backup, backupData);
                break;
            case 'excel':
                this.downloadAsExcel(backup, backupData);
                break;
            case 'word':
                this.downloadAsWord(backup, backupData);
                break;
            default:
                createNotification('خطأ', 'صيغة الملف غير مدعومة', 'danger');
        }
    },
    
    // جمع البيانات للنسخ الاحتياطي
    collectBackupData: function() {
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            appInfo: {
                name: settings.companyName || 'شركة الاستثمار العراقية',
                version: '1.0.0',
                environment: 'production'
            },
            data: {
                investors: investors || [],
                investments: investments || [],
                operations: operations || [],
                events: events || [],
                notifications: notifications || [],
                backupList: backupList || [],
                reports: reports || []
            }
        };
        
        // إضافة الإعدادات إذا كان مطلوباً
        if (this.options.includeSettings) {
            backupData.settings = settings || {};
        }
        
        // إضافة المستندات إذا كان مطلوباً
        if (this.options.includeDocuments) {
            // جمع المستندات من المستثمرين
            backupData.documents = this.collectDocuments();
        }
        
        return backupData;
    },
    
    // جمع المستندات من المستثمرين
    collectDocuments: function() {
        const documents = [];
        
        // المرور على جميع المستثمرين
        (investors || []).forEach(investor => {
            if (investor.documents && Array.isArray(investor.documents)) {
                investor.documents.forEach(doc => {
                    documents.push({
                        investorId: investor.id,
                        documentId: doc.id,
                        name: doc.name,
                        type: doc.type,
                        mimeType: doc.mimeType,
                        uploadDate: doc.uploadDate,
                        // في تطبيق حقيقي، هنا سيتم تخزين البيانات الثنائية للملف
                        // أو المسار إليه على الخادم
                        path: doc.path || `documents/${investor.id}/${doc.id}`
                    });
                });
            }
        });
        
        return documents;
    },
    
    // توليد معرف فريد للنسخة الاحتياطية
    generateBackupId: function() {
        return 'backup_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    },
    
    // تنزيل النسخة الاحتياطية بصيغة JSON
    downloadAsJson: function(backup, backupData) {
        try {
            const data = JSON.stringify(backupData || backup.data, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${backup.name.replace(/\s+/g, '_')}_${backup.id}.json`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            console.log(`تم تنزيل النسخة الاحتياطية بصيغة JSON: ${a.download}`);
        } catch (error) {
            console.error('خطأ في تنزيل النسخة الاحتياطية بصيغة JSON:', error);
            createNotification('خطأ', 'حدث خطأ أثناء تنزيل النسخة الاحتياطية', 'danger');
        }
    },
    
    // تنزيل النسخة الاحتياطية بصيغة PDF (عدم التنفيذ في الوقت الحالي)
    downloadAsPdf: function(backup, backupData) {
        createNotification('معلومات', 'وظيفة تنزيل PDF غير متاحة في هذا الإصدار', 'info');
    },
    
    // تنزيل النسخة الاحتياطية بصيغة Excel (عدم التنفيذ في الوقت الحالي)
    downloadAsExcel: function(backup, backupData) {
        createNotification('معلومات', 'وظيفة تنزيل Excel غير متاحة في هذا الإصدار', 'info');
    },
    
    // تنزيل النسخة الاحتياطية بصيغة Word (عدم التنفيذ في الوقت الحالي)
    downloadAsWord: function(backup, backupData) {
        createNotification('معلومات', 'وظيفة تنزيل Word غير متاحة في هذا الإصدار', 'info');
    },
    
    // تحميل ملف النسخة الاحتياطية
    loadBackupFile: function(backup) {
        return new Promise((resolve, reject) => {
            // في تطبيق ويب، سنطلب من المستخدم تحميل الملف يدوياً
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', event => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('لم يتم اختيار ملف'));
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = e => {
                    try {
                        const data = JSON.parse(e.target.result);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = error => reject(error);
                reader.readAsText(file);
            });
            
            // في تطبيق سطح المكتب، هنا سيتم قراءة الملف من المسار المحدد
            // بالنسبة لتطبيق الويب، نطلب من المستخدم اختيار الملف
            document.body.appendChild(fileInput);
            fileInput.click();
            
            // تنظيف
            setTimeout(() => {
                document.body.removeChild(fileInput);
            }, 5000);
        });
    },
    
    // استعادة البيانات من النسخة الاحتياطية
    restoreData: function(backupData) {
        // التحقق من صحة البيانات
        if (!backupData || !backupData.data) {
            throw new Error('بيانات النسخة الاحتياطية غير صالحة');
        }
        
        // استعادة البيانات
        if (backupData.data.investors) investors = backupData.data.investors;
        if (backupData.data.investments) investments = backupData.data.investments;
        if (backupData.data.operations) operations = backupData.data.operations;
        if (backupData.data.events) events = backupData.data.events;
        if (backupData.data.notifications) notifications = backupData.data.notifications;
        if (backupData.data.backupList) backupList = backupData.data.backupList;
        if (backupData.data.reports) reports = backupData.data.reports;
        
        // استعادة الإعدادات إذا كانت موجودة
        if (backupData.settings) settings = {...settings, ...backupData.settings};
        
        // حفظ البيانات المستعادة
        saveData();
        saveNotifications();
        saveBackupList();
        saveReports();
        
        console.log('تم استعادة البيانات بنجاح');
    },
    
    // تحديث واجهة المستخدم بعد الاستعادة
    updateUIAfterRestore: function() {
        // تحديث لوحة التحكم
        updateDashboard();
        
        // تحديث قائمة المستثمرين
        if (typeof loadInvestors === 'function') {
            loadInvestors();
        }
        
        // تحديث قائمة الاستثمارات
        if (typeof loadInvestments === 'function') {
            loadInvestments();
        }
        
        // تحديث قائمة العمليات
        if (typeof loadOperations === 'function') {
            loadOperations();
        }
        
        // تحديث الإشعارات
        if (typeof loadNotifications === 'function') {
            loadNotifications();
        }
        
        // تحديث التقويم
        if (typeof loadCalendar === 'function') {
            loadCalendar();
        }
        
        console.log('تم تحديث واجهة المستخدم بعد الاستعادة');
    },
    
    // تنظيف النسخ الاحتياطية القديمة
    cleanupOldBackups: function() {
        // التحقق من عدد النسخ الاحتياطية
        if (this.backups.length <= this.options.maxBackups) {
            return;
        }
        
        // فرز النسخ الاحتياطية حسب التاريخ (الأقدم أولاً)
        const sortedBackups = [...this.backups].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        // حذف النسخ الاحتياطية القديمة
        const backupsToDelete = sortedBackups.slice(0, sortedBackups.length - this.options.maxBackups);
        
        backupsToDelete.forEach(backup => {
            // حذف ملفات النسخة الاحتياطية (في تطبيق حقيقي)
            console.log(`تم حذف النسخة الاحتياطية القديمة: ${backup.name}`);
        });
        
        // تحديث قائمة النسخ الاحتياطية
        this.backups = this.backups.filter(backup => 
            !backupsToDelete.some(b => b.id === backup.id)
        );
        
        // حفظ قائمة النسخ الاحتياطية
        this.saveBackupsList();
    },
    
    // إعداد النسخ الاحتياطي التلقائي
    setupAutoBackup: function() {
        // إلغاء المؤقت الحالي إن وجد
        if (this._autoBackupTimer) {
            clearInterval(this._autoBackupTimer);
            this._autoBackupTimer = null;
        }
        
        // إنشاء مؤقت جديد إذا كان النسخ الاحتياطي التلقائي مفعلاً
        if (this.options.autoBackup) {
            // تحويل الفترة من أيام إلى مللي ثانية
            const interval = this.options.autoBackupInterval * 24 * 60 * 60 * 1000;
            
            this._autoBackupTimer = setInterval(() => {
                // التحقق من تاريخ آخر نسخة احتياطية
                const lastBackupDate = this.getLastBackupDate();
                const now = new Date();
                
                // حساب الفرق بالأيام
                const diffDays = Math.floor((now - lastBackupDate) / (24 * 60 * 60 * 1000));
                
                // إنشاء نسخة احتياطية إذا مر الوقت المحدد
                if (diffDays >= this.options.autoBackupInterval) {
                    this.createBackup('نسخة احتياطية تلقائية');
                }
            }, 60 * 60 * 1000); // التحقق كل ساعة
            
            console.log(`تم إعداد النسخ الاحتياطي التلقائي كل ${this.options.autoBackupInterval} يوم`);
        }
    },
    
    // الحصول على تاريخ آخر نسخة احتياطية
    getLastBackupDate: function() {
        if (this.backups.length === 0) {
            return new Date(0); // تاريخ قديم جداً
        }
        
        // فرز النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
        const sortedBackups = [...this.backups].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        return new Date(sortedBackups[0].createdAt);
    },
    
    // عرض مؤشر التقدم
    showProgressBar: function() {
        // إنشاء مؤشر التقدم إذا لم يكن موجوداً
        if (!document.getElementById('backupProgressContainer')) {
            const progressContainer = document.createElement('div');
            progressContainer.id = 'backupProgressContainer';
            progressContainer.className = 'backup-progress-container';
            progressContainer.style.position = 'fixed';
            progressContainer.style.top = '50%';
            progressContainer.style.left = '50%';
            progressContainer.style.transform = 'translate(-50%, -50%)';
            progressContainer.style.width = '400px';
            progressContainer.style.padding = '20px';
            progressContainer.style.backgroundColor = 'white';
            progressContainer.style.borderRadius = '8px';
            progressContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            progressContainer.style.zIndex = '9999';
            progressContainer.style.textAlign = 'center';
            
            progressContainer.innerHTML = `
                <h3 id="backupProgressTitle" style="margin-bottom: 10px;">جاري إنشاء النسخة الاحتياطية...</h3>
                <div style="margin-bottom: 15px;">
                    <div style="height: 10px; background-color: #f0f0f0; border-radius: 5px; overflow: hidden;">
                        <div id="backupProgressBar" style="height: 100%; width: 0%; background-color: #3498db; transition: width 0.3s;"></div>
                    </div>
                    <div id="backupProgressText" style="margin-top: 5px; font-size: 14px;">0%</div>
                </div>
                <p id="backupProgressStatus" style="margin-bottom: 0;">جاري التحضير...</p>
            `;
            
            document.body.appendChild(progressContainer);
        }
    },
    
    // تحديث مؤشر التقدم
    updateProgressBar: function(percentage, status) {
        const progressBar = document.getElementById('backupProgressBar');
        const progressText = document.getElementById('backupProgressText');
        const progressStatus = document.getElementById('backupProgressStatus');
        const progressTitle = document.getElementById('backupProgressTitle');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (progressStatus) progressStatus.textContent = status || '';
        
        // تغيير العنوان إذا كانت نسبة التقدم 100%
        if (percentage >= 100 && progressTitle) {
            progressTitle.textContent = 'اكتملت العملية بنجاح!';
        }
    },
    
    // إخفاء مؤشر التقدم
    hideProgressBar: function() {
        // إخفاء مؤشر التقدم بعد فترة قصيرة
        setTimeout(() => {
            const progressContainer = document.getElementById('backupProgressContainer');
            if (progressContainer) {
                progressContainer.style.opacity = '0';
                progressContainer.style.transition = 'opacity 0.5s';
                
                // إزالة العنصر بعد انتهاء الانتقال
                setTimeout(() => {
                    if (progressContainer.parentNode) {
                        progressContainer.parentNode.removeChild(progressContainer);
                    }
                }, 500);
            }
        }, 1000);
    }
};

// إضافة نمط CSS للنظام
document.addEventListener('DOMContentLoaded', function() {
    // إضافة نمط للنسخ الاحتياطي
    const style = document.createElement('style');
    style.textContent = `
        .backup-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #e9e9e9 100%);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .backup-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .backup-icon {
            font-size: 2rem;
            color: #3498db;
            margin-left: 15px;
        }
        
        .backup-title {
            margin: 0;
            font-size: 1.3rem;
            color: #2c3e50;
        }
        
        .backup-subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: #7f8c8d;
        }
        
        .backup-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .backup-button {
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 8px;
            padding: 10px 15px;
            background: #f1f1f1;
            color: #444;
            transition: all 0.2s ease;
            border: 1px solid #ddd;
            cursor: pointer;
        }
        
        .backup-button:hover {
            background: #eee;
            border-color: #ccc;
        }
        
        .backup-button.primary {
            background: #3498db;
            color: white;
            border-color: #2980b9;
        }
        
        .backup-button.primary:hover {
            background: #2980b9;
        }
        
        .backup-button.success {
            background: #2ecc71;
            color: white;
            border-color: #27ae60;
        }
        
        .backup-button.success:hover {
            background: #27ae60;
        }
        
        .backup-button.warning {
            background: #f39c12;
            color: white;
            border-color: #d35400;
        }
        
        .backup-button.warning:hover {
            background: #d35400;
        }
        
        .backup-button.danger {
            background: #e74c3c;
            color: white;
            border-color: #c0392b;
        }
        
        .backup-button.danger:hover {
            background: #c0392b;
        }
        
        .backup-list-container {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .backup-list-title {
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .backup-list {
            width: 100%;
            height: 200px;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 15px;
        }
        
        .backup-list-actions {
            display: flex;
            gap: 10px;
        }
        
        .settings-group {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .settings-group-title {
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .settings-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .settings-label {
            flex: 1;
            font-size: 0.9rem;
        }
        
        .settings-input {
            flex: 2;
        }
        
        .format-toggle {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .format-option {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .backup-progress-container {
            transition: opacity 0.5s;
        }
        
        .backup-info {
            border-right: 3px solid #3498db;
            padding-right: 10px;
            margin-bottom: 15px;
        }
        
        .backup-info-title {
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }
        
        .backup-info-text {
            font-size: 0.9rem;
            color: #555;
            line-height: 1.5;
        }
    `;
    
    document.head.appendChild(style);
    
    // تهيئة نظام النسخ الاحتياطي
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.init();
    }
});

// دوال للتعامل مع واجهة المستخدم

// فتح نافذة إنشاء نسخة احتياطية
function openCreateBackupDialog() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'createBackupModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إنشاء نسخة احتياطية شاملة</h2>
                <div class="modal-close" onclick="closeModal('createBackupModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-container" style="box-shadow: none; padding: 0;">
                    <div class="form-group">
                        <label class="form-label">اسم النسخة الاحتياطية</label>
                        <input type="text" class="form-control" id="backupName" placeholder="نسخة احتياطية شاملة" value="نسخة احتياطية شاملة - ${new Date().toLocaleDateString('ar-IQ')}">
                    </div>
                    
                    <div class="backup-info">
                        <div class="backup-info-title">تنسيقات النسخة الاحتياطية:</div>
                        <div class="backup-info-text">سيتم إنشاء النسخة الاحتياطية بالتنسيقات التالية:</div>
                        <div class="format-toggle">
                            <div class="format-option">
                                <input type="checkbox" id="formatJson" checked>
                                <label for="formatJson">JSON</label>
                            </div>
                            <div class="format-option">
                                <input type="checkbox" id="formatPdf" checked>
                                <label for="formatPdf">PDF</label>
                            </div>
                            <div class="format-option">
                                <input type="checkbox" id="formatExcel" checked>
                                <label for="formatExcel">Excel</label>
                            </div>
                            <div class="format-option">
                                <input type="checkbox" id="formatWord" checked>
                                <label for="formatWord">Word</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="backup-info">
                        <div class="backup-info-title">محتوى النسخة الاحتياطية:</div>
                        <div class="backup-info-text">
                            ستتضمن النسخة الاحتياطية جميع بيانات النظام بما في ذلك:
                            <ul style="margin: 10px 0; padding-right: 20px;">
                                <li>المستثمرين والاستثمارات</li>
                                <li>العمليات والإشعارات</li>
                                <li>التقارير والأحداث</li>
                                <li>الإعدادات والمستندات</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('createBackupModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="startBackupProcess()">
                    <i class="fas fa-download"></i> إنشاء النسخة الاحتياطية
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تحديث حالة خيارات التنسيق من الإعدادات
    if (window.ComprehensiveBackupSystem) {
        const options = window.ComprehensiveBackupSystem.options;
        
        document.getElementById('formatJson').checked = options.formats.json;
        document.getElementById('formatPdf').checked = options.formats.pdf;
        document.getElementById('formatExcel').checked = options.formats.excel;
        document.getElementById('formatWord').checked = options.formats.word;
    }
}

// بدء عملية النسخ الاحتياطي
function startBackupProcess() {
    // الحصول على اسم النسخة الاحتياطية
    const backupName = document.getElementById('backupName').value || `نسخة احتياطية شاملة - ${new Date().toLocaleDateString('ar-IQ')}`;
    
    // تحديث خيارات التنسيق
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.options.formats.json = document.getElementById('formatJson').checked;
        window.ComprehensiveBackupSystem.options.formats.pdf = document.getElementById('formatPdf').checked;
        window.ComprehensiveBackupSystem.options.formats.excel = document.getElementById('formatExcel').checked;
        window.ComprehensiveBackupSystem.options.formats.word = document.getElementById('formatWord').checked;
        
        // حفظ الخيارات
        window.ComprehensiveBackupSystem.saveOptions();
        
        // إغلاق النافذة
        closeModal('createBackupModal');
        
        // إنشاء النسخة الاحتياطية
        window.ComprehensiveBackupSystem.createBackup(backupName);
    }
}

// فتح نافذة استعادة النسخة الاحتياطية
function openRestoreBackupDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'restoreBackupModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">استعادة النظام من نسخة احتياطية</h2>
                <div class="modal-close" onclick="closeModal('restoreBackupModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-warning">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">تنبيه هام</div>
                        <div class="alert-text">استعادة النظام من نسخة احتياطية سيؤدي إلى استبدال جميع البيانات الحالية. يرجى التأكد من أن لديك نسخة احتياطية من البيانات الحالية قبل المتابعة.</div>
                    </div>
                </div>
                
                <div class="form-container" style="box-shadow: none; padding: 0;">
                    <div class="form-group">
                        <label class="form-label">اختر النسخة الاحتياطية</label>
                        <select class="form-select" id="restoreBackupSelect" size="5" style="height: auto;">
                            <!-- سيتم تعبئته بواسطة JavaScript -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">أو قم بتحميل ملف النسخة الاحتياطية</label>
                        <input type="file" class="form-control" id="restoreBackupFile" accept=".json">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('restoreBackupModal')">إلغاء</button>
                <button class="btn btn-warning" onclick="startRestoreProcess()">
                    <i class="fas fa-upload"></i> استعادة النظام
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تحميل قائمة النسخ الاحتياطية
    if (window.ComprehensiveBackupSystem) {
        const restoreBackupSelect = document.getElementById('restoreBackupSelect');
        
        // تحديث قائمة النسخ الاحتياطية
        const backups = window.ComprehensiveBackupSystem.backups;
        
        if (backups.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'لا توجد نسخ احتياطية متوفرة';
            option.disabled = true;
            restoreBackupSelect.appendChild(option);
        } else {
            // فرز النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
            const sortedBackups = [...backups].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            sortedBackups.forEach(backup => {
                const option = document.createElement('option');
                option.value = backup.id;
                
                // تنسيق التاريخ والوقت للعرض
                const date = new Date(backup.createdAt);
                const formattedDate = date.toLocaleDateString('ar-IQ');
                const formattedTime = date.toLocaleTimeString('ar-IQ');
                
                option.textContent = `${backup.name} - ${formattedDate} ${formattedTime}`;
                restoreBackupSelect.appendChild(option);
            });
        }
    }
}

// بدء عملية استعادة النظام
function startRestoreProcess() {
    // التحقق من اختيار نسخة احتياطية أو تحميل ملف
    const restoreBackupSelect = document.getElementById('restoreBackupSelect');
    const restoreBackupFile = document.getElementById('restoreBackupFile');
    
    if (restoreBackupSelect.value) {
        // استعادة من نسخة احتياطية مخزنة
        closeModal('restoreBackupModal');
        
        if (window.ComprehensiveBackupSystem) {
            window.ComprehensiveBackupSystem.restoreFromBackup(restoreBackupSelect.value);
        }
    } else if (restoreBackupFile.files && restoreBackupFile.files.length > 0) {
        // استعادة من ملف محمل
        closeModal('restoreBackupModal');
        
        const file = restoreBackupFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const backupData = JSON.parse(event.target.result);
                
                if (window.ComprehensiveBackupSystem) {
                    // عرض مؤشر التقدم
                    window.ComprehensiveBackupSystem.showProgressBar();
                    window.ComprehensiveBackupSystem.updateProgressBar(10, 'جاري تحليل البيانات');
                    
                    // استعادة البيانات
                    window.ComprehensiveBackupSystem.restoreData(backupData);
                    
                    // تحديث مؤشر التقدم
                    window.ComprehensiveBackupSystem.updateProgressBar(80, 'جاري استعادة البيانات');
                    
                    // تحديث واجهة المستخدم
                    window.ComprehensiveBackupSystem.updateUIAfterRestore();
                    
                    // إخفاء مؤشر التقدم
                    window.ComprehensiveBackupSystem.hideProgressBar();
                    
                    // عرض رسالة نجاح
                    createNotification('نجاح', 'تم استعادة النظام بنجاح من الملف المحمل', 'success');
                    
                    // إعادة تحميل الصفحة بعد الاستعادة
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                console.error('خطأ في استعادة النظام من الملف:', error);
                createNotification('خطأ', 'حدث خطأ أثناء استعادة النظام من الملف', 'danger');
            }
        };
        
        reader.onerror = function(error) {
            console.error('خطأ في قراءة الملف:', error);
            createNotification('خطأ', 'حدث خطأ أثناء قراءة الملف', 'danger');
        };
        
        reader.readAsText(file);
    } else {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية أو تحميل ملف', 'danger');
    }
}

// فتح نافذة إعدادات النسخ الاحتياطي
function openBackupSettingsDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'backupSettingsModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إعدادات النسخ الاحتياطي الشامل</h2>
                <div class="modal-close" onclick="closeModal('backupSettingsModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="settings-group">
                    <div class="settings-group-title">
                        <i class="fas fa-file-alt"></i> تنسيقات النسخ الاحتياطي
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">تنسيقات الملفات المستخدمة:</div>
                        <div class="settings-input">
                            <div class="format-toggle">
                                <div class="format-option">
                                    <input type="checkbox" id="settingsFormatJson" checked>
                                    <label for="settingsFormatJson">JSON</label>
                                </div>
                                <div class="format-option">
                                    <input type="checkbox" id="settingsFormatPdf" checked>
                                    <label for="settingsFormatPdf">PDF</label>
                                </div>
                                <div class="format-option">
                                    <input type="checkbox" id="settingsFormatExcel" checked>
                                    <label for="settingsFormatExcel">Excel</label>
                                </div>
                                <div class="format-option">
                                    <input type="checkbox" id="settingsFormatWord" checked>
                                    <label for="settingsFormatWord">Word</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-group">
                    <div class="settings-group-title">
                        <i class="fas fa-cog"></i> إعدادات عامة
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">تضمين المستندات:</div>
                        <div class="settings-input">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="settingsIncludeDocuments" checked>
                                <label class="form-check-label" for="settingsIncludeDocuments">حفظ المستندات في النسخة الاحتياطية</label>
                            </div>
                        </div>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">تضمين الإعدادات:</div>
                        <div class="settings-input">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="settingsIncludeSettings" checked>
                                <label class="form-check-label" for="settingsIncludeSettings">حفظ إعدادات النظام في النسخة الاحتياطية</label>
                            </div>
                        </div>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">عدد النسخ الاحتياطية المحتفظ بها:</div>
                        <div class="settings-input">
                            <input type="number" class="form-control" id="settingsMaxBackups" min="1" max="100" value="10">
                        </div>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">مسار حفظ النسخ الاحتياطية:</div>
                        <div class="settings-input">
                            <input type="text" class="form-control" id="settingsBackupPath" value="./backups/">
                        </div>
                    </div>
                </div>
                
                <div class="settings-group">
                    <div class="settings-group-title">
                        <i class="fas fa-lock"></i> الأمان
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">تشفير النسخة الاحتياطية:</div>
                        <div class="settings-input">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="settingsEncryption">
                                <label class="form-check-label" for="settingsEncryption">تشفير النسخة الاحتياطية</label>
                            </div>
                        </div>
                    </div>
                    <div class="settings-row" id="encryptionPasswordRow" style="display: none;">
                        <div class="settings-label">كلمة مرور التشفير:</div>
                        <div class="settings-input">
                            <input type="password" class="form-control" id="settingsEncryptionPassword">
                        </div>
                    </div>
                </div>
                
                <div class="settings-group">
                    <div class="settings-group-title">
                        <i class="fas fa-clock"></i> النسخ الاحتياطي التلقائي
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">تفعيل النسخ الاحتياطي التلقائي:</div>
                        <div class="settings-input">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="settingsAutoBackup">
                                <label class="form-check-label" for="settingsAutoBackup">إنشاء نسخة احتياطية تلقائياً</label>
                            </div>
                        </div>
                    </div>
                    <div class="settings-row" id="autoBackupIntervalRow" style="display: none;">
                        <div class="settings-label">فترة النسخ الاحتياطي التلقائي (بالأيام):</div>
                        <div class="settings-input">
                            <select class="form-select" id="settingsAutoBackupInterval">
                                <option value="1">يومياً</option>
                                <option value="7" selected>أسبوعياً</option>
                                <option value="30">شهرياً</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('backupSettingsModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="saveBackupSettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تحميل الإعدادات الحالية
    if (window.ComprehensiveBackupSystem) {
        const options = window.ComprehensiveBackupSystem.options;
        
        // تنسيقات الملفات
        document.getElementById('settingsFormatJson').checked = options.formats.json;
        document.getElementById('settingsFormatPdf').checked = options.formats.pdf;
        document.getElementById('settingsFormatExcel').checked = options.formats.excel;
        document.getElementById('settingsFormatWord').checked = options.formats.word;
        
        // إعدادات عامة
        document.getElementById('settingsIncludeDocuments').checked = options.includeDocuments;
        document.getElementById('settingsIncludeSettings').checked = options.includeSettings;
        document.getElementById('settingsMaxBackups').value = options.maxBackups;
        document.getElementById('settingsBackupPath').value = options.backupPath;
        
        // الأمان
        document.getElementById('settingsEncryption').checked = options.encryption;
        document.getElementById('settingsEncryptionPassword').value = options.encryptionPassword;
        
        // إظهار/إخفاء حقل كلمة المرور
        document.getElementById('encryptionPasswordRow').style.display = options.encryption ? 'flex' : 'none';
        
        // النسخ الاحتياطي التلقائي
        document.getElementById('settingsAutoBackup').checked = options.autoBackup;
        document.getElementById('settingsAutoBackupInterval').value = options.autoBackupInterval;
        
        // إظهار/إخفاء حقل فترة النسخ الاحتياطي
        document.getElementById('autoBackupIntervalRow').style.display = options.autoBackup ? 'flex' : 'none';
    }
    
    // إضافة مستمعي الأحداث
    document.getElementById('settingsEncryption').addEventListener('change', function() {
        document.getElementById('encryptionPasswordRow').style.display = this.checked ? 'flex' : 'none';
    });
    
    document.getElementById('settingsAutoBackup').addEventListener('change', function() {
        document.getElementById('autoBackupIntervalRow').style.display = this.checked ? 'flex' : 'none';
    });
}

// حفظ إعدادات النسخ الاحتياطي
function saveBackupSettings() {
    if (window.ComprehensiveBackupSystem) {
        const options = window.ComprehensiveBackupSystem.options;
        
        // تنسيقات الملفات
        options.formats.json = document.getElementById('settingsFormatJson').checked;
        options.formats.pdf = document.getElementById('settingsFormatPdf').checked;
        options.formats.excel = document.getElementById('settingsFormatExcel').checked;
        options.formats.word = document.getElementById('settingsFormatWord').checked;
        
        // إعدادات عامة
        options.includeDocuments = document.getElementById('settingsIncludeDocuments').checked;
        options.includeSettings = document.getElementById('settingsIncludeSettings').checked;
        options.maxBackups = parseInt(document.getElementById('settingsMaxBackups').value);
        options.backupPath = document.getElementById('settingsBackupPath').value;
        
        // الأمان
        options.encryption = document.getElementById('settingsEncryption').checked;
        options.encryptionPassword = document.getElementById('settingsEncryptionPassword').value;
        
        // النسخ الاحتياطي التلقائي
        options.autoBackup = document.getElementById('settingsAutoBackup').checked;
        options.autoBackupInterval = parseInt(document.getElementById('settingsAutoBackupInterval').value);
        
        // حفظ الإعدادات
        window.ComprehensiveBackupSystem.saveOptions();
        
        // إعداد النسخ الاحتياطي التلقائي
        window.ComprehensiveBackupSystem.setupAutoBackup();
        
        // إغلاق النافذة
        closeModal('backupSettingsModal');
        
        // عرض رسالة نجاح
        createNotification('نجاح', 'تم حفظ إعدادات النسخ الاحتياطي بنجاح', 'success');
    }
}

// تنزيل نسخة احتياطية
function downloadSelectedBackup() {
    const backupSelect = document.getElementById('comprehensiveBackupsList');
    
    if (!backupSelect || !backupSelect.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    const backupId = backupSelect.value;
    
    // فتح نافذة لاختيار صيغة التنزيل
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'downloadFormatModal';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h2 class="modal-title">اختر صيغة التنزيل</h2>
                <div class="modal-close" onclick="closeModal('downloadFormatModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">صيغة الملف:</label>
                    <div class="format-toggle" style="margin-top: 10px;">
                        <div class="format-option" style="flex-direction: column; align-items: center;">
                            <button class="backup-button" onclick="downloadBackupWithFormat('${backupId}', 'json')">
                                <i class="fas fa-file-code fa-2x"></i>
                            </button>
                            <label style="margin-top: 5px;">JSON</label>
                        </div>
                        <div class="format-option" style="flex-direction: column; align-items: center;">
                            <button class="backup-button" onclick="downloadBackupWithFormat('${backupId}', 'pdf')">
                                <i class="fas fa-file-pdf fa-2x"></i>
                            </button>
                            <label style="margin-top: 5px;">PDF</label>
                        </div>
                        <div class="format-option" style="flex-direction: column; align-items: center;">
                            <button class="backup-button" onclick="downloadBackupWithFormat('${backupId}', 'excel')">
                                <i class="fas fa-file-excel fa-2x"></i>
                            </button>
                            <label style="margin-top: 5px;">Excel</label>
                        </div>
                        <div class="format-option" style="flex-direction: column; align-items: center;">
                            <button class="backup-button" onclick="downloadBackupWithFormat('${backupId}', 'word')">
                                <i class="fas fa-file-word fa-2x"></i>
                            </button>
                            <label style="margin-top: 5px;">Word</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('downloadFormatModal')">إلغاء</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// تنزيل النسخة الاحتياطية بالصيغة المحددة
function downloadBackupWithFormat(backupId, format) {
    closeModal('downloadFormatModal');
    
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.downloadBackup(backupId, format);
    }
}

// دوال مساعدة

// إضافة تبويب النسخ الاحتياطي الشامل إلى صفحة الإعدادات
function addComprehensiveBackupTab() {
    // إضافة زر التبويب
    const tabsContainer = document.querySelector('#settings .tabs');
    if (tabsContainer) {
        const backupTab = document.createElement('div');
        backupTab.className = 'tab';
        backupTab.setAttribute('onclick', "switchSettingsTab('comprehensiveBackup')");
        backupTab.textContent = 'النسخ الاحتياطي الشامل';
        
        tabsContainer.appendChild(backupTab);
    }
    
    // إضافة محتوى التبويب
    const settingsContainer = document.getElementById('settings');
    if (settingsContainer) {
        const backupTabContent = document.createElement('div');
        backupTabContent.id = 'comprehensiveBackupSettings';
        backupTabContent.className = 'settings-tab-content';
        
        backupTabContent.innerHTML = `
            <div class="backup-section">
                <div class="backup-header">
                    <div class="backup-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div>
                        <h2 class="backup-title">النسخ الاحتياطي الشامل</h2>
                        <p class="backup-subtitle">قم بإنشاء نسخة احتياطية كاملة لجميع بيانات النظام واستعادتها عند الحاجة</p>
                    </div>
                </div>
                
                <div class="backup-actions">
                    <button class="backup-button primary" onclick="openCreateBackupDialog()">
                        <i class="fas fa-download"></i>
                        <span>إنشاء نسخة احتياطية جديدة</span>
                    </button>
                    <button class="backup-button success" onclick="openRestoreBackupDialog()">
                        <i class="fas fa-upload"></i>
                        <span>استعادة من نسخة احتياطية</span>
                    </button>
                    <button class="backup-button" onclick="openBackupSettingsDialog()">
                        <i class="fas fa-cog"></i>
                        <span>إعدادات النسخ الاحتياطي</span>
                    </button>
                </div>
                
                <div class="backup-list-container">
                    <div class="backup-list-title">
                        <i class="fas fa-history"></i>
                        <span>النسخ الاحتياطية المتوفرة</span>
                    </div>
                    <select class="backup-list" id="comprehensiveBackupsList" size="10">
                        <!-- سيتم تعبئته بواسطة JavaScript -->
                    </select>
                    <div class="backup-list-actions">
                        <button class="btn btn-primary" onclick="downloadSelectedBackup()">
                            <i class="fas fa-download"></i> تنزيل
                        </button>
                        <button class="btn btn-success" onclick="restoreSelectedBackup()">
                            <i class="fas fa-upload"></i> استعادة
                        </button>
                        <button class="btn btn-danger" onclick="deleteSelectedBackup()">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                
                <div class="backup-info">
                    <div class="backup-info-title">معلومات النسخ الاحتياطي</div>
                    <div class="backup-info-text">
                        يُمَكِّنك نظام النسخ الاحتياطي الشامل من إنشاء نسخة احتياطية كاملة لجميع بيانات النظام، بما في ذلك المستثمرين والاستثمارات والعمليات والتقارير والإعدادات وغيرها. يمكنك استعادة النظام من هذه النسخة في حالة حدوث أي مشكلة أو فقدان البيانات.
                    </div>
                </div>
                
                <div class="backup-info">
                    <div class="backup-info-title">النسخ الاحتياطي التلقائي</div>
                    <div class="backup-info-text">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="quickAutoBackup">
                            <label class="form-check-label" for="quickAutoBackup">تفعيل النسخ الاحتياطي التلقائي</label>
                        </div>
                        <div id="quickAutoBackupOptions" style="margin-top: 10px; display: none;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label>الفترة:</label>
                                <select class="form-select" id="quickAutoBackupInterval" style="width: 150px;">
                                    <option value="1">يومياً</option>
                                    <option value="7" selected>أسبوعياً</option>
                                    <option value="30">شهرياً</option>
                                </select>
                                <button class="btn btn-sm btn-primary" onclick="saveQuickAutoBackupSettings()">
                                    <i class="fas fa-save"></i> حفظ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        settingsContainer.appendChild(backupTabContent);
        
        // تحديث حالة النسخ الاحتياطي التلقائي
        if (window.ComprehensiveBackupSystem) {
            const quickAutoBackup = document.getElementById('quickAutoBackup');
            const quickAutoBackupOptions = document.getElementById('quickAutoBackupOptions');
            const quickAutoBackupInterval = document.getElementById('quickAutoBackupInterval');
            
            quickAutoBackup.checked = window.ComprehensiveBackupSystem.options.autoBackup;
            quickAutoBackupOptions.style.display = quickAutoBackup.checked ? 'block' : 'none';
            quickAutoBackupInterval.value = window.ComprehensiveBackupSystem.options.autoBackupInterval;
            
            // إضافة مستمع الحدث
            quickAutoBackup.addEventListener('change', function() {
                quickAutoBackupOptions.style.display = this.checked ? 'block' : 'none';
            });
        }
    }
}

// حفظ إعدادات النسخ الاحتياطي التلقائي السريعة
function saveQuickAutoBackupSettings() {
    if (window.ComprehensiveBackupSystem) {
        const options = window.ComprehensiveBackupSystem.options;
        
        options.autoBackup = document.getElementById('quickAutoBackup').checked;
        options.autoBackupInterval = parseInt(document.getElementById('quickAutoBackupInterval').value);
        
        // حفظ الإعدادات
        window.ComprehensiveBackupSystem.saveOptions();
        
        // إعداد النسخ الاحتياطي التلقائي
        window.ComprehensiveBackupSystem.setupAutoBackup();
        
        // عرض رسالة نجاح
        createNotification('نجاح', 'تم حفظ إعدادات النسخ الاحتياطي التلقائي بنجاح', 'success');
    }
}

// استعادة النسخة الاحتياطية المحددة
function restoreSelectedBackup() {
    const backupSelect = document.getElementById('comprehensiveBackupsList');
    
    if (!backupSelect || !backupSelect.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    const backupId = backupSelect.value;
    
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.restoreFromBackup(backupId);
    }
}

// حذف النسخة الاحتياطية المحددة
function deleteSelectedBackup() {
    const backupSelect = document.getElementById('comprehensiveBackupsList');
    
    if (!backupSelect || !backupSelect.value) {
        createNotification('خطأ', 'يرجى اختيار نسخة احتياطية', 'danger');
        return;
    }
    
    const backupId = backupSelect.value;
    
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.deleteBackup(backupId);
    }
}

// إضافة مستمع حدث لإضافة تبويب النسخ الاحتياطي الشامل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة تبويب النسخ الاحتياطي الشامل
    addComprehensiveBackupTab();
    
    // تهيئة نظام النسخ الاحتياطي الشامل
    if (window.ComprehensiveBackupSystem) {
        window.ComprehensiveBackupSystem.init();
    }
});

