/**
 * تحديث خاص لإصلاح مشكلة ظهور زر الإعدادات وتعطيل زر الأمان للمستخدم العادي
 */

// تعديل وظيفة تطبيق صلاحيات المستخدم
function fixSidebarPermissions(user) {
    if (!user) return;
    
    console.log("إصلاح ظهور الأزرار في الشريط الجانبي للمستخدم:", user.username);
    
    // تأكد من ظهور زر الإعدادات للمستخدم العادي
    if (user.permissions.settings || user.permissions.viewSettings) {
        // تأكد من إظهار زر الإعدادات
        const settingsButton = document.querySelector('.menu-item[href="#settings"]');
        if (settingsButton) {
            settingsButton.style.display = '';
            settingsButton.removeAttribute('data-hidden-by-permission');
            console.log("تم إظهار زر الإعدادات في الشريط الجانبي");
        }
        
        // تأكد من إظهار صفحة الإعدادات
        const settingsPage = document.getElementById('settings');
        if (settingsPage) {
            settingsPage.style.display = '';
            settingsPage.removeAttribute('data-hidden-by-permission');
            console.log("تم إظهار صفحة الإعدادات");
        }
    } else {
        // إخفاء زر الإعدادات إذا لم يكن لديه صلاحية
        const settingsButton = document.querySelector('.menu-item[href="#settings"]');
        if (settingsButton) {
            settingsButton.style.display = 'none';
            settingsButton.setAttribute('data-hidden-by-permission', 'true');
            console.log("تم إخفاء زر الإعدادات في الشريط الجانبي - لا توجد صلاحية");
        }
    }
    
    // تأكد من إخفاء زر الأمان للمستخدم العادي
    if (user.role !== 'admin') {
        // إخفاء زر الأمان من الشريط الجانبي
        const securityButton = document.querySelector('.menu-item[href="#security"]');
        if (securityButton) {
            securityButton.style.display = 'none';
            securityButton.setAttribute('data-hidden-by-permission', 'true');
            console.log("تم إخفاء زر الأمان في الشريط الجانبي - المستخدم ليس مسؤولاً");
        }
        
        // إخفاء صفحة الأمان
        const securityPage = document.getElementById('security');
        if (securityPage) {
            securityPage.style.display = 'none';
            securityPage.setAttribute('data-hidden-by-permission', 'true');
            console.log("تم إخفاء صفحة الأمان - المستخدم ليس مسؤولاً");
        }
    } else {
        // تأكد من إظهار زر الأمان للمسؤول
        const securityButton = document.querySelector('.menu-item[href="#security"]');
        if (securityButton) {
            securityButton.style.display = '';
            securityButton.removeAttribute('data-hidden-by-permission');
            console.log("تم إظهار زر الأمان في الشريط الجانبي - المستخدم مسؤول");
        }
    }
}

// تحديث تطبيق صلاحيات الإعدادات
function fixSettingsPermissions(user, permissions) {
    // تأكد من ظهور صفحة الإعدادات إذا كان لديه صلاحية
    if (permissions.settings || permissions.viewSettings) {
        // إظهار صفحة الإعدادات
        const settingsPage = document.getElementById('settings');
        if (settingsPage) {
            settingsPage.style.display = '';
            settingsPage.removeAttribute('data-hidden-by-permission');
            console.log("تم إظهار صفحة الإعدادات - لديه الصلاحية");
        }
        
        // التحقق من صلاحية تعديل الإعدادات
        if (!permissions.editSettings) {
            // إخفاء أزرار الحفظ في صفحة الإعدادات
            document.querySelectorAll('#settings button[type="submit"], #settings .btn-primary[onclick*="save"]').forEach(button => {
                button.style.display = 'none';
                button.setAttribute('data-hidden-by-permission', 'true');
            });
            
            // جعل الحقول للقراءة فقط
            document.querySelectorAll('#settings input, #settings select, #settings textarea').forEach(input => {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('disabled', 'disabled');
                input.style.backgroundColor = '#f8f8f8';
                input.style.cursor = 'not-allowed';
            });
            
            console.log("تم تعطيل حقول تعديل الإعدادات - لا يوجد صلاحية التعديل");
        }
    } else {
        // إخفاء صفحة الإعدادات
        const settingsPage = document.getElementById('settings');
        if (settingsPage) {
            settingsPage.style.display = 'none';
            settingsPage.setAttribute('data-hidden-by-permission', 'true');
            console.log("تم إخفاء صفحة الإعدادات - لا توجد صلاحية");
        }
    }
    
    // صفحة الأمان للمسؤول فقط
    if (user.role !== 'admin') {
        const securityPage = document.getElementById('security');
        if (securityPage) {
            securityPage.style.display = 'none';
            securityPage.setAttribute('data-hidden-by-permission', 'true');
            console.log("تم إخفاء صفحة الأمان - المستخدم ليس مسؤولاً");
        }
    }
}

// وظيفة محدثة لإصلاح مشاكل العرض في الشريط الجانبي
function enhancedApplyUserPermissionsUpdated(user) {
    if (!user || !user.permissions) {
        console.log("لا يمكن تطبيق الصلاحيات: المستخدم أو الصلاحيات غير موجودة");
        return;
    }
    
    console.log("تطبيق الصلاحيات المحسن المحدث للمستخدم:", user.username, "الدور:", user.role);
    const permissions = user.permissions;
    
    // إصلاح ظهور الأزرار في الشريط الجانبي
    fixSidebarPermissions(user);
    
    // ============= تطبيق صلاحيات الإعدادات والأمان =============
    fixSettingsPermissions(user, permissions);
    
    // باقي تطبيق الصلاحيات من الوظيفة السابقة...
    // ============= تطبيق صلاحيات قوائم الصفحات =============
    enforcePagePermissions(permissions);
    
    // ============= تطبيق صلاحيات إدارة المستثمرين =============
    enforceInvestorPermissions(permissions);
    
    // ============= تطبيق صلاحيات إدارة الاستثمارات =============
    enforceInvestmentPermissions(permissions);
    
    // ============= تطبيق صلاحيات العمليات المالية =============
    enforceOperationPermissions(permissions);
    
    // ============= تطبيق صلاحيات الأرباح =============
    enforceProfitPermissions(permissions);
    
    // ============= تطبيق صلاحيات التقارير =============
    enforceReportPermissions(permissions);
    
    // ============= تطبيق صلاحيات التحليلات =============
    if (!permissions.analytics) {
        hideElements('.page#analytics');
        hideElements('[data-page="analytics"]');
        hideElements('[href="#analytics"]');
        console.log("إخفاء صفحة التحليلات - لا يوجد صلاحية");
    }
    
    // ============= تطبيق صلاحيات التقويم =============
    if (!permissions.calendar) {
        hideElements('.page#calendar');
        hideElements('[data-page="calendar"]');
        hideElements('[href="#calendar"]');
        console.log("إخفاء صفحة التقويم - لا يوجد صلاحية");
    }
    
    // ============= تطبيق أنماط العرض حسب دور المستخدم =============
    applyUserRoleStyles(user);
    
    console.log("اكتمل تطبيق الصلاحيات المحسن المحدث للمستخدم:", user.username);
}

// تحديث نظام الصلاحيات لإصلاح المشاكل
function updatePermissionSystemFixed() {
    // تجنب التحديث المتكرر
    if (window.permissionSystemFixedUpdated) return;
    
    console.log("تحديث نظام الصلاحيات لإصلاح المشاكل...");
    
    // استبدال الوظيفة المحسنة بالوظيفة المحدثة
    window.enhancedApplyUserPermissions = enhancedApplyUserPermissionsUpdated;
    
    // استبدال وظيفة تطبيق الصلاحيات
    window.securitySystem.applyUserPermissions = function(user) {
        enhancedApplyUserPermissionsUpdated(user);
    };
    
    // إضافة وظيفة إصلاح الشريط الجانبي
    window.securitySystem.fixSidebarPermissions = fixSidebarPermissions;
    
    // إضافة وظيفة إصلاح صلاحيات الإعدادات
    window.securitySystem.fixSettingsPermissions = fixSettingsPermissions;
    
    // تعيين المؤشر لتجنب التحديث المتكرر
    window.permissionSystemFixedUpdated = true;
    
    console.log("تم تحديث نظام الصلاحيات لإصلاح المشاكل بنجاح!");
    
    // إعادة تطبيق الصلاحيات للمستخدم الحالي
    if (window.currentUser) {
        console.log("إعادة تطبيق الصلاحيات للمستخدم الحالي...");
        window.securitySystem.applyUserPermissions(window.currentUser);
    }
}

// تنفيذ التحديث المحدث
document.addEventListener('DOMContentLoaded', function() {
    console.log("جاري تحميل تحديث نظام الصلاحيات لإصلاح المشاكل...");
    
    // انتظر لمدة قصيرة للتأكد من تحميل جميع المكونات الأخرى
    setTimeout(function() {
        updatePermissionSystemFixed();
        
        // إضافة إصلاح إضافي للتأكد من ظهور الأزرار بشكل صحيح
        setTimeout(function() {
            if (window.currentUser) {
                fixSidebarPermissions(window.currentUser);
            }
        }, 500);
    }, 500);
});

// حدث خاص لإعادة تطبيق الإصلاحات بعد تغيير الصفحة
window.addEventListener('hashchange', function() {
    console.log("تم تغيير الصفحة - إعادة تطبيق إصلاحات الصلاحيات...");
    
    setTimeout(function() {
        if (window.currentUser) {
            fixSidebarPermissions(window.currentUser);
            fixSettingsPermissions(window.currentUser, window.currentUser.permissions);
        }
    }, 300);
});

// إضافة الوظائف المحدثة إلى كائن تحديث الصلاحيات
window.permissionsUpdater = window.permissionsUpdater || {};
window.permissionsUpdater.fixSidebarPermissions = fixSidebarPermissions;
window.permissionsUpdater.fixSettingsPermissions = fixSettingsPermissions;
window.permissionsUpdater.updatePermissionSystemFixed = updatePermissionSystemFixed;