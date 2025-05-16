/**
 * permissionsUpdater.js - تحديث نظام صلاحيات المستخدمين
 * تم التحديث لإصلاح مشكلة تطبيق الصلاحيات وعرض الأزرار
 */

// تحسين تطبيق صلاحيات المستخدم
function enhancedApplyUserPermissions(user) {
    if (!user || !user.permissions) {
        console.log("لا يمكن تطبيق الصلاحيات: المستخدم أو الصلاحيات غير موجودة");
        return;
    }
    
    console.log("تطبيق الصلاحيات المحسن للمستخدم:", user.username, "الدور:", user.role);
    const permissions = user.permissions;
    
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
    
    // ============= تطبيق صلاحيات الإعدادات والأمان =============
    enforceSettingsPermissions(user, permissions);
    
    // ============= تطبيق أنماط العرض حسب دور المستخدم =============
    applyUserRoleStyles(user);
    
    console.log("اكتمل تطبيق الصلاحيات المحسن للمستخدم:", user.username);
}

// تطبيق صلاحيات قوائم الصفحات
function enforcePagePermissions(permissions) {
    const menuItems = document.querySelectorAll('.menu-item, .sidebar a, [href^="#"]');
    
    menuItems.forEach(item => {
        let href = item.getAttribute('href');
        if (!href) return;
        
        // إزالة # من href وفحص الصلاحية
        href = href.replace('#', '');
        
        // صفحات خاصة بالمسؤول
        if ((href === 'security' || href === 'settings') && !permissions[href]) {
            item.style.display = 'none';
            console.log(`إخفاء قائمة: ${href} - الصلاحية غير متوفرة`);
        }
        // باقي الصفحات
        else if (!permissions[href] && href !== 'dashboard') {
            item.style.display = 'none';
            console.log(`إخفاء قائمة: ${href} - الصلاحية غير متوفرة`);
        }
    });
}

// تطبيق صلاحيات إدارة المستثمرين
function enforceInvestorPermissions(permissions) {
    // عرض المستثمرين
    if (!permissions.viewInvestors) {
        hideElements('.page#investors');
        hideElements('[data-page="investors"]');
        hideElements('[href="#investors"]');
        console.log("إخفاء صفحة المستثمرين - لا يوجد صلاحية عرض المستثمرين");
    }
    
    // أزرار إضافة المستثمر
    if (!permissions.addInvestor) {
        hideElements('button[onclick*="openAddInvestorModal"]');
        hideElements('button[data-action="addInvestor"]');
        hideElements('.investor-actions .btn-add, .btn[onclick*="addInvestor"]');
        console.log("إخفاء أزرار إضافة المستثمر - لا يوجد صلاحية الإضافة");
    }
    
    // أزرار تعديل المستثمر - تطبيق شامل لجميع المحددات الممكنة
    if (!permissions.editInvestor) {
        hideElements('button[onclick*="editInvestor"]');
        hideElements('button[data-action="editInvestor"]');
        hideElements('.investor-actions .btn-edit, .btn-warning[onclick*="editInvestor"]');
        hideElements('.action-btn[onclick*="editInvestor"]');
        hideElements('[onclick*="editInvestor"]');
        console.log("إخفاء أزرار تعديل المستثمر - لا يوجد صلاحية التعديل");
    }
    
    // أزرار حذف المستثمر
    if (!permissions.deleteInvestor) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="investor"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"]');
        hideElements('button[data-action="deleteInvestor"]');
        hideElements('.investor-actions .btn-delete, .btn-danger[onclick*="deleteInvestor"]');
        hideElements('.action-btn[onclick*="deleteInvestor"]');
        hideElements('[onclick*="deleteInvestor"]');
        console.log("إخفاء أزرار حذف المستثمر - لا يوجد صلاحية الحذف");
    }
    
    // أزرار تصدير واستيراد المستثمرين
    if (!permissions.exportInvestors) {
        hideElements('button[onclick*="exportInvestors"]');
        hideElements('button[data-action="exportInvestors"]');
        console.log("إخفاء أزرار تصدير المستثمرين - لا يوجد صلاحية التصدير");
    }
    
    if (!permissions.importInvestors) {
        hideElements('button[onclick*="importInvestors"]');
        hideElements('button[data-action="importInvestors"]');
        console.log("إخفاء أزرار استيراد المستثمرين - لا يوجد صلاحية الاستيراد");
    }
}

// تطبيق صلاحيات إدارة الاستثمارات
function enforceInvestmentPermissions(permissions) {
    // صلاحيات عرض الاستثمارات
    if (!permissions.viewInvestments) {
        hideElements('.page#investments');
        hideElements('[data-page="investments"]');
        hideElements('[href="#investments"]');
        console.log("إخفاء صفحة الاستثمارات - لا يوجد صلاحية عرض الاستثمارات");
    }
    
    // أزرار إضافة الاستثمار
    if (!permissions.addInvestment) {
        hideElements('button[onclick*="openNewInvestmentModal"]');
        hideElements('button[data-action="addInvestment"]');
        hideElements('.investment-actions .btn-add, .btn[onclick*="addInvestment"]');
        console.log("إخفاء أزرار إضافة الاستثمار - لا يوجد صلاحية الإضافة");
    }
    
    // أزرار تعديل الاستثمار
    if (!permissions.editInvestment) {
        hideElements('button[onclick*="editInvestment"]');
        hideElements('button[data-action="editInvestment"]');
        hideElements('.investment-actions .btn-edit, .btn-warning[onclick*="editInvestment"]');
        hideElements('.action-btn[onclick*="editInvestment"]');
        hideElements('[onclick*="editInvestment"]');
        console.log("إخفاء أزرار تعديل الاستثمار - لا يوجد صلاحية التعديل");
    }
    
    // أزرار حذف الاستثمار
    if (!permissions.deleteInvestment) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="investment"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"]');
        hideElements('button[data-action="deleteInvestment"]');
        hideElements('.investment-actions .btn-delete, .btn-danger[onclick*="deleteInvestment"]');
        hideElements('.action-btn[onclick*="deleteInvestment"]');
        hideElements('[onclick*="deleteInvestment"]');
        console.log("إخفاء أزرار حذف الاستثمار - لا يوجد صلاحية الحذف");
    }
}

// تطبيق صلاحيات العمليات المالية
function enforceOperationPermissions(permissions) {
    // صلاحيات عرض العمليات
    if (!permissions.viewOperations) {
        hideElements('.page#operations');
        hideElements('[data-page="operations"]');
        hideElements('[href="#operations"]');
        console.log("إخفاء صفحة العمليات - لا يوجد صلاحية عرض العمليات");
    }
    
    // صلاحيات الموافقة على العمليات
    if (!permissions.approveOperations) {
        hideElements('button[onclick*="approveOperation"]');
        hideElements('button[data-action="approveOperation"]');
        hideElements('.operation-actions .btn-success, .btn[onclick*="approveOperation"]');
        hideElements('.action-btn[onclick*="approveOperation"]');
        console.log("إخفاء أزرار الموافقة على العمليات - لا يوجد صلاحية الموافقة");
    }
    
    // صلاحيات رفض العمليات
    if (!permissions.rejectOperations) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="operation"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'operation\'"]');
        hideElements('button[data-action="rejectOperation"]');
        hideElements('.operation-actions .btn-danger, .btn[onclick*="rejectOperation"]');
        hideElements('.action-btn[onclick*="rejectOperation"]');
        console.log("إخفاء أزرار رفض العمليات - لا يوجد صلاحية الرفض");
    }
    
    // صلاحيات السحوبات
    if (!permissions.withdrawals) {
        hideElements('button[onclick*="openWithdrawModal"]');
        hideElements('button[data-action="withdrawal"]');
        hideElements('.investment-actions .btn-withdraw, .btn[onclick*="openWithdrawModal"]');
        hideElements('.action-btn[onclick*="openWithdrawModal"]');
        console.log("إخفاء أزرار السحب - لا يوجد صلاحية السحب");
    }
}

// تطبيق صلاحيات الأرباح
function enforceProfitPermissions(permissions) {
    // صلاحيات عرض الأرباح
    if (!permissions.viewProfits) {
        hideElements('.page#profits');
        hideElements('[data-page="profits"]');
        hideElements('[href="#profits"]');
        console.log("إخفاء صفحة الأرباح - لا يوجد صلاحية عرض الأرباح");
    }
    
    // صلاحيات دفع الأرباح
    if (!permissions.payProfits) {
        hideElements('button[onclick*="openPayProfitModal"]');
        hideElements('button[data-action="payProfit"]');
        hideElements('.investment-actions .btn-profit, .btn[onclick*="openPayProfitModal"]');
        hideElements('.action-btn[onclick*="openPayProfitModal"]');
        console.log("إخفاء أزرار دفع الأرباح - لا يوجد صلاحية الدفع");
    }
}

// تطبيق صلاحيات التقارير
function enforceReportPermissions(permissions) {
    // صلاحيات عرض التقارير
    if (!permissions.viewReports) {
        hideElements('.page#reports');
        hideElements('[data-page="reports"]');
        hideElements('[href="#reports"]');
        console.log("إخفاء صفحة التقارير - لا يوجد صلاحية عرض التقارير");
    }
    
    // صلاحيات إنشاء التقارير
    if (!permissions.generateReports) {
        hideElements('button[onclick*="generateReport"]');
        hideElements('button[data-action="generateReport"]');
        console.log("إخفاء أزرار إنشاء التقارير - لا يوجد صلاحية الإنشاء");
    }
    
    // صلاحيات تصدير التقارير
    if (!permissions.exportReports) {
        hideElements('button[onclick*="exportReport"]');
        hideElements('button[data-action="exportReport"]');
        console.log("إخفاء أزرار تصدير التقارير - لا يوجد صلاحية التصدير");
    }
}

// تطبيق صلاحيات الإعدادات والأمان
function enforceSettingsPermissions(user, permissions) {
    // التعامل مع صلاحيات الإعدادات
    if (!permissions.settings && !permissions.viewSettings) {
        hideElements('.page#settings');
        hideElements('[data-page="settings"]');
        hideElements('[href="#settings"]');
        console.log("إخفاء صفحة الإعدادات - لا يوجد صلاحية الإعدادات");
    } else {
        // إذا كان لديه صلاحية عرض الإعدادات، تأكد من إظهار زر الإعدادات
        showElements('.page#settings');
        showElements('[data-page="settings"]');
        showElements('[href="#settings"]');
        console.log("إظهار صفحة الإعدادات - يوجد صلاحية الإعدادات");
        
        // التحقق من صلاحية تعديل الإعدادات
        if (!permissions.editSettings) {
            // إخفاء أزرار الحفظ في صفحة الإعدادات
            hideElements('#settings button[type="submit"]');
            hideElements('#settings .btn-primary[onclick*="save"]');
            console.log("إخفاء أزرار حفظ الإعدادات - لا يوجد صلاحية التعديل");
        }
    }
    
    // صفحة الأمان للمسؤول فقط
    if (user.role !== 'admin') {
        hideElements('.page#security');
        hideElements('[data-page="security"]');
        hideElements('[href="#security"]');
        console.log("إخفاء صفحة الأمان - المستخدم ليس مسؤولاً");
    }
}

// تطبيق أنماط العرض حسب دور المستخدم
function applyUserRoleStyles(user) {
    if (user.role === 'admin') {
        document.body.classList.add('admin-mode');
        document.body.classList.remove('user-mode');
        console.log("تطبيق نمط المسؤول");
    } else {
        document.body.classList.add('user-mode');
        document.body.classList.remove('admin-mode');
        console.log("تطبيق نمط المستخدم العادي");
    }
}

// إخفاء العناصر بشكل أكثر شمولية
function enhancedHideElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element) {
            element.style.display = 'none';
            element.setAttribute('data-hidden-by-permission', 'true');
            
            // إضافة وسم للعنصر الأب إذا كان عنصر داخل جدول (مثلاً الأزرار داخل خلية)
            if (element.closest('td')) {
                element.closest('td').setAttribute('data-contains-hidden-element', 'true');
            }
        }
    });
}

// تطبيق الصلاحيات على العناصر المضافة ديناميكياً
function enhancedApplyDynamicPermissions(permissions) {
    console.log("تطبيق الصلاحيات على العناصر الديناميكية");
    
    // أزرار تعديل المستثمر الديناميكية
    if (!permissions.editInvestor) {
        enhancedHideElements('.investor-actions button[onclick*="editInvestor"]');
        enhancedHideElements('.investor-details-buttons button[onclick*="editInvestor"]');
        enhancedHideElements('[onclick*="editInvestor"]');
        console.log("إخفاء أزرار تعديل المستثمر الديناميكية");
    }
    
    // أزرار حذف المستثمر الديناميكية
    if (!permissions.deleteInvestor) {
        enhancedHideElements('.investor-actions button[onclick*="deleteInvestor"]');
        enhancedHideElements('.investor-actions button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"]');
        enhancedHideElements('.investor-details-buttons button[onclick*="deleteInvestor"]');
        enhancedHideElements('[onclick*="deleteInvestor"]');
        console.log("إخفاء أزرار حذف المستثمر الديناميكية");
    }
    
    // أزرار تعديل الاستثمار الديناميكية
    if (!permissions.editInvestment) {
        enhancedHideElements('.investment-actions button[onclick*="editInvestment"]');
        enhancedHideElements('.investment-details-buttons button[onclick*="editInvestment"]');
        enhancedHideElements('[onclick*="editInvestment"]');
        console.log("إخفاء أزرار تعديل الاستثمار الديناميكية");
    }
    
    // أزرار حذف الاستثمار الديناميكية
    if (!permissions.deleteInvestment) {
        enhancedHideElements('.investment-actions button[onclick*="deleteInvestment"]');
        enhancedHideElements('.investment-actions button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"]');
        enhancedHideElements('.investment-details-buttons button[onclick*="deleteInvestment"]');
        enhancedHideElements('[onclick*="deleteInvestment"]');
        console.log("إخفاء أزرار حذف الاستثمار الديناميكية");
    }
    
    // أزرار السحب الديناميكية
    if (!permissions.withdrawals) {
        enhancedHideElements('.investment-actions button[onclick*="openWithdrawModal"]');
        enhancedHideElements('.investment-details-buttons button[onclick*="openWithdrawModal"]');
        enhancedHideElements('[onclick*="openWithdrawModal"]');
        console.log("إخفاء أزرار السحب الديناميكية");
    }
    
    // أزرار دفع الأرباح الديناميكية
    if (!permissions.payProfits) {
        enhancedHideElements('.investment-actions button[onclick*="openPayProfitModal"]');
        enhancedHideElements('.investment-details-buttons button[onclick*="openPayProfitModal"]');
        enhancedHideElements('[onclick*="openPayProfitModal"]');
        console.log("إخفاء أزرار دفع الأرباح الديناميكية");
    }
    
    // تطبيق الصلاحيات على جداول البيانات
    enforceDynamicTablePermissions(permissions);
}

// تطبيق الصلاحيات على جداول البيانات
function enforceDynamicTablePermissions(permissions) {
    // تطبيق الصلاحيات على جدول المستثمرين
    document.querySelectorAll('#investorsTableBody tr, .investors-table tr, .investor-row').forEach(row => {
        if (!permissions.editInvestor) {
            const editButtons = row.querySelectorAll('button[onclick*="editInvestor"], .btn-edit, .action-btn[onclick*="editInvestor"]');
            editButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
        
        if (!permissions.deleteInvestor) {
            const deleteButtons = row.querySelectorAll('button[onclick*="deleteInvestor"], button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"], .btn-delete, .action-btn[onclick*="deleteInvestor"]');
            deleteButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
    });
    
    // تطبيق الصلاحيات على جدول الاستثمارات
    document.querySelectorAll('#investmentsTableBody tr, .investments-table tr, .investment-row').forEach(row => {
        if (!permissions.editInvestment) {
            const editButtons = row.querySelectorAll('button[onclick*="editInvestment"], .btn-edit, .action-btn[onclick*="editInvestment"]');
            editButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
        
        if (!permissions.deleteInvestment) {
            const deleteButtons = row.querySelectorAll('button[onclick*="deleteInvestment"], button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"], .btn-delete, .action-btn[onclick*="deleteInvestment"]');
            deleteButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
        
        if (!permissions.withdrawals) {
            const withdrawButtons = row.querySelectorAll('button[onclick*="openWithdrawModal"], .btn-withdraw, .action-btn[onclick*="openWithdrawModal"]');
            withdrawButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
        
        if (!permissions.payProfits) {
            const profitButtons = row.querySelectorAll('button[onclick*="openPayProfitModal"], .btn-profit, .action-btn[onclick*="openPayProfitModal"]');
            profitButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
    });
    
    // تطبيق الصلاحيات على جدول العمليات
    document.querySelectorAll('#operationsTableBody tr, .operations-table tr, .operation-row').forEach(row => {
        if (!permissions.approveOperations) {
            const approveButtons = row.querySelectorAll('button[onclick*="approveOperation"], .btn-approve, .action-btn[onclick*="approveOperation"]');
            approveButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
        
        if (!permissions.rejectOperations) {
            const rejectButtons = row.querySelectorAll('button[onclick*="openDeleteConfirmationModal"][onclick*="\'operation\'"], .btn-reject, .action-btn[onclick*="rejectOperation"]');
            rejectButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.setAttribute('data-hidden-by-permission', 'true');
            });
        }
    });
}

// إعداد مراقب محسن للمحتوى الديناميكي
function enhancedSetupDynamicContentObserver() {
    // إنشاء مراقب للتغييرات في الـ DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldApplyPermissions = false;
        
        // فحص التغييرات للبحث عن إضافة جداول أو أزرار جديدة
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    
                    // فحص إذا كان العنصر المضاف هو عنصر HTML
                    if (node.nodeType === 1) {
                        // البحث عن الأزرار أو الجداول أو العناصر التي تتطلب تطبيق الصلاحيات
                        if (
                            node.tagName === 'BUTTON' || 
                            node.tagName === 'TABLE' || 
                            node.tagName === 'TR' || 
                            node.querySelector('button') || 
                            node.querySelector('table') ||
                            node.querySelector('[onclick*="edit"]') ||
                            node.querySelector('[onclick*="delete"]') ||
                            node.querySelector('[onclick*="approve"]') ||
                            node.querySelector('[onclick*="reject"]') ||
                            node.querySelector('[onclick*="withdraw"]') ||
                            node.querySelector('[onclick*="profit"]')
                        ) {
                            shouldApplyPermissions = true;
                            break;
                        }
                    }
                }
            }
        });
        
        // إعادة تطبيق الصلاحيات إذا تم العثور على عناصر جديدة
        if (shouldApplyPermissions && currentUser && currentUser.permissions) {
            console.log("تم العثور على عناصر جديدة - إعادة تطبيق الصلاحيات");
            enhancedApplyDynamicPermissions(currentUser.permissions);
        }
    });
    
    // بدء المراقبة على كامل الوثيقة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log("تم إعداد مراقب المحتوى الديناميكي المحسن");
}

// استبدال الوظائف الحالية بالوظائف المحسنة
function updatePermissionSystem() {
    // تجنب التحديث المتكرر
    if (window.permissionSystemUpdated) return;
    
    console.log("تحديث نظام الصلاحيات...");
    
    // احتفظ بالوظائف الأصلية
    const originalApplyUserPermissions = window.securitySystem.applyUserPermissions;
    const originalHideElements = window.securitySystem.hideElements;
    const originalApplyDynamicPermissions = window.applyDynamicPermissions;
    const originalSetupDynamicContentObserver = window.setupDynamicContentObserver;
    
    // استبدال الوظائف بالوظائف المحسنة
    window.securitySystem.applyUserPermissions = function(user) {
        // استدعاء الوظيفة الأصلية أولاً
        if (originalApplyUserPermissions) originalApplyUserPermissions(user);
        
        // ثم استدعاء الوظيفة المحسنة
        enhancedApplyUserPermissions(user);
    };
    
    window.securitySystem.hideElements = function(selector) {
        // استدعاء الوظيفة الأصلية
        if (originalHideElements) originalHideElements(selector);
        
        // ثم استدعاء الوظيفة المحسنة
        enhancedHideElements(selector);
    };
    
    window.applyDynamicPermissions = function(permissions) {
        // استدعاء الوظيفة الأصلية
        if (originalApplyDynamicPermissions) originalApplyDynamicPermissions(permissions);
        
        // ثم استدعاء الوظيفة المحسنة
        enhancedApplyDynamicPermissions(permissions);
    };
    
    window.setupDynamicContentObserver = function() {
        // استدعاء الوظيفة الأصلية
        if (originalSetupDynamicContentObserver) originalSetupDynamicContentObserver();
        
        // ثم استدعاء الوظيفة المحسنة
        enhancedSetupDynamicContentObserver();
    };
    
    // تعيين المؤشر لتجنب التحديث المتكرر
    window.permissionSystemUpdated = true;
    
    console.log("تم تحديث نظام الصلاحيات بنجاح!");
    
    // إعادة تطبيق الصلاحيات للمستخدم الحالي
    if (window.currentUser) {
        console.log("إعادة تطبيق الصلاحيات للمستخدم الحالي...");
        window.securitySystem.applyUserPermissions(window.currentUser);
    }
}

// تنفيذ التحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("جاري تحميل تحديث نظام الصلاحيات...");
    
    // انتظر لمدة قصيرة للتأكد من تحميل جميع المكونات الأخرى
    setTimeout(function() {
        updatePermissionSystem();
    }, 500);
});

// تحديث عند تغيير الصفحة أو إضافة محتوى ديناميكي
window.addEventListener('hashchange', function() {
    console.log("تم تغيير الصفحة - إعادة تطبيق الصلاحيات...");
    
    // انتظر لمدة قصيرة للتأكد من تحميل الصفحة الجديدة
    setTimeout(function() {
        if (window.currentUser) {
            window.securitySystem.applyUserPermissions(window.currentUser);
        }
    }, 300);
});

// إضافة حدث مخصص لتحديث الصلاحيات
function refreshPermissions() {
    if (window.currentUser) {
        console.log("تحديث الصلاحيات بناءً على الطلب...");
        window.securitySystem.applyUserPermissions(window.currentUser);
    }
}

// تصدير الوظائف المحسنة
window.permissionsUpdater = {
    updatePermissionSystem,
    refreshPermissions,
    enhancedApplyUserPermissions,
    enhancedApplyDynamicPermissions,
    enhancedSetupDynamicContentObserver
};


// إضافة إصلاح لعرض زر الإعدادات وإخفاء زر الأمان حسب الصلاحيات
if (user.permissions.settings || user.permissions.viewSettings) {
    // إظهار زر الإعدادات
    const settingsButton = document.querySelector('.menu-item[href="#settings"]');
    if (settingsButton) {
        settingsButton.style.display = '';
        settingsButton.removeAttribute('data-hidden-by-permission');
    }
}

if (user.role !== 'admin') {
    // إخفاء زر الأمان
    const securityButton = document.querySelector('.menu-item[href="#security"]');
    if (securityButton) {
        securityButton.style.display = 'none';
        securityButton.setAttribute('data-hidden-by-permission', 'true');
    }
}