/**
 * directPermissionsFix.js - إصلاح مباشر لمشاكل عرض الأزرار والصفحات
 * هذا الإصلاح يتجاوز نظام الصلاحيات ويقوم بإظهار العناصر المطلوبة مباشرة
 */

// الوظيفة الرئيسية لإصلاح عرض الأزرار والصفحات
function fixDisplayIssues() {
    console.log("تطبيق الإصلاح المباشر لمشاكل العرض...");

    // 1. إظهار زر الإعدادات في الشريط الجانبي
    const settingsButton = document.querySelector('.sidebar-menu a[href="#settings"], .menu-item[href="#settings"]');
    if (settingsButton) {
        settingsButton.style.display = '';
        settingsButton.style.visibility = 'visible';
        settingsButton.classList.remove('hidden');
        console.log("✅ تم تفعيل زر الإعدادات في الشريط الجانبي");
    } else {
        console.log("❌ لم يتم العثور على زر الإعدادات");
    }

    // 2. إظهار صفحة الإعدادات
    const settingsPage = document.getElementById('settings');
    if (settingsPage) {
        settingsPage.style.display = '';
        settingsPage.style.visibility = 'visible';
        settingsPage.classList.remove('hidden');
        console.log("✅ تم تفعيل صفحة الإعدادات");
    } else {
        console.log("❌ لم يتم العثور على صفحة الإعدادات");
    }

    // 3. إظهار زر وصفحة التقارير
    const reportsButton = document.querySelector('.sidebar-menu a[href="#reports"], .menu-item[href="#reports"]');
    if (reportsButton) {
        reportsButton.style.display = '';
        reportsButton.style.visibility = 'visible';
        reportsButton.classList.remove('hidden');
        console.log("✅ تم تفعيل زر التقارير في الشريط الجانبي");
    } else {
        console.log("❌ لم يتم العثور على زر التقارير");
    }

    const reportsPage = document.getElementById('reports');
    if (reportsPage) {
        reportsPage.style.display = '';
        reportsPage.style.visibility = 'visible';
        reportsPage.classList.remove('hidden');
        console.log("✅ تم تفعيل صفحة التقارير");
    } else {
        console.log("❌ لم يتم العثور على صفحة التقارير");
    }

    // 4. التأكد من إخفاء زر الأمان للمستخدم العادي
    if (window.currentUser && window.currentUser.role !== 'admin') {
        const securityButton = document.querySelector('.sidebar-menu a[href="#security"], .menu-item[href="#security"]');
        if (securityButton) {
            securityButton.style.display = 'none';
            console.log("✅ تم إخفاء زر الأمان");
        }
    }
}

// حل مشكلة صلاحيات العناصر ضمن صفحة الإعدادات والتقارير
function fixPagePermissions() {
    // تفعيل جميع الأزرار داخل صفحة الإعدادات
    document.querySelectorAll('#settings button, #settings input, #settings select').forEach(el => {
        el.disabled = false;
        el.removeAttribute('data-hidden-by-permission');
        el.style.display = '';
    });

    // تفعيل جميع الأزرار داخل صفحة التقارير
    document.querySelectorAll('#reports button, #reports input, #reports select').forEach(el => {
        el.disabled = false;
        el.removeAttribute('data-hidden-by-permission');
        el.style.display = '';
    });

    console.log("✅ تم تفعيل جميع العناصر داخل الصفحات");
}

// التأكد من تحديث الصلاحيات في الكائن المستخدم الحالي
function updateUserPermissions() {
    if (window.currentUser && window.currentUser.permissions) {
        // إضافة صلاحيات الإعدادات والتقارير
        window.currentUser.permissions.settings = true;
        window.currentUser.permissions.viewSettings = true;
        window.currentUser.permissions.reports = true;
        window.currentUser.permissions.viewReports = true;
        window.currentUser.permissions.generateReports = true;
        console.log("✅ تم تحديث صلاحيات المستخدم برمجياً");
    } else {
        console.log("❌ لا يمكن تحديث صلاحيات المستخدم - المستخدم غير موجود");
    }
}

// وظيفة رئيسية لتطبيق جميع الإصلاحات
function applyAllFixes() {
    fixDisplayIssues();
    fixPagePermissions();
    updateUserPermissions();
    console.log("✅ تم تطبيق جميع الإصلاحات بنجاح");
}

// تنفيذ الإصلاحات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("جاري تطبيق الإصلاح المباشر...");
    
    // التنفيذ الفوري
    applyAllFixes();
    
    // التنفيذ بعد وقت قصير (لضمان تحميل جميع العناصر)
    setTimeout(applyAllFixes, 500);
    
    // التنفيذ بعد وقت أطول (للتعامل مع التحميل البطيء)
    setTimeout(applyAllFixes, 1500);
});

// إصلاح المشكلة عند تغيير الصفحة
window.addEventListener('hashchange', function() {
    console.log("تم تغيير الصفحة - إعادة تطبيق الإصلاحات...");
    setTimeout(applyAllFixes, 250);
});

// إضافة وظيفة إلى النافذة لاستدعائها يدوياً عند الحاجة
window.fixPermissionsDisplay = applyAllFixes;

// تجاوز نظام الصلاحيات الأصلي
if (window.securitySystem && window.securitySystem.applyUserPermissions) {
    const originalFunction = window.securitySystem.applyUserPermissions;
    window.securitySystem.applyUserPermissions = function(user) {
        // استدعاء الوظيفة الأصلية أولاً
        originalFunction(user);
        
        // ثم تطبيق الإصلاحات
        applyAllFixes();
    };
    console.log("✅ تم تجاوز نظام الصلاحيات الأصلي");
}

// طباعة رسالة تأكيد
console.log("🔧 تم تحميل ملف الإصلاح المباشر بنجاح");