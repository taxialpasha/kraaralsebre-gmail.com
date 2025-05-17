/**
 * permissionsUpdaterFix.js - إصلاح لملف permissionsUpdater.js
 * 
 * يحل هذا الملف مشكلة "Uncaught ReferenceError: user is not defined"
 * عن طريق إزالة الكود المسبب للمشكلة في نهاية الملف وإدراجه داخل دالة مناسبة
 */

// تنفيذ الإصلاح للملف permissionsUpdater.js
(function() {
    console.log("بدء تطبيق إصلاح ملف permissionsUpdater.js");

    // إصلاح لمشكلة استخدام متغير "user" غير المعرف
    // استبدال الكود في نهاية ملف permissionsUpdater.js بهذه الدالة
    function applyButtonPermissions(user) {
        // التحقق من وجود المستخدم قبل محاولة الوصول إلى خصائصه
        if (!user) {
            console.log("لا يمكن تطبيق صلاحيات الأزرار: المستخدم غير موجود");
            return;
        }

        console.log("تطبيق صلاحيات الأزرار للمستخدم:", user.username || user.name);

        // إظهار/إخفاء زر الإعدادات حسب الصلاحيات
        if (user.permissions && (user.permissions.settings || user.permissions.viewSettings)) {
            const settingsButton = document.querySelector('.menu-item[href="#settings"]');
            if (settingsButton) {
                settingsButton.style.display = '';
                settingsButton.removeAttribute('data-hidden-by-permission');
                console.log("إظهار زر الإعدادات - يوجد صلاحية الإعدادات");
            }
        }

        // إخفاء زر الأمان إذا لم يكن المستخدم مسؤولاً
        if (user.role !== 'admin') {
            const securityButton = document.querySelector('.menu-item[href="#security"]');
            if (securityButton) {
                securityButton.style.display = 'none';
                securityButton.setAttribute('data-hidden-by-permission', 'true');
                console.log("إخفاء زر الأمان - المستخدم ليس مسؤولاً");
            }
        }
    }

    // إضافة الدالة الجديدة إلى نظام الصلاحيات
    if (window.permissionsUpdater) {
        window.permissionsUpdater.applyButtonPermissions = applyButtonPermissions;
    } else {
        // إنشاء كائن نظام الصلاحيات إذا لم يكن موجوداً
        window.permissionsUpdater = {
            applyButtonPermissions: applyButtonPermissions
        };
    }

    // استبدال تنفيذ الكود الأصلي بالدالة الجديدة
    const originalUpdatePermissionSystem = window.updatePermissionSystem || function() {};
    
    window.updatePermissionSystem = function() {
        // استدعاء الدالة الأصلية أولاً
        originalUpdatePermissionSystem();
        
        // ثم تطبيق إصلاح الأزرار إذا كان هناك مستخدم حالي
        if (window.currentUser) {
            applyButtonPermissions(window.currentUser);
        }
    };

    // تنفيذ الإصلاح فوراً إذا كان المستخدم موجوداً
    if (window.currentUser) {
        applyButtonPermissions(window.currentUser);
    }

    console.log("تم تطبيق إصلاح ملف permissionsUpdater.js بنجاح");
})();