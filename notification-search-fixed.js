/**
 * إضافة ميزة البحث الذكي في قائمة الإشعارات المركزية
 * 
 * هذا الملف يضيف خانة بحث تمكن المستخدم من البحث عن إشعارات حسب اسم المستثمر
 * مع دعم البحث الذكي (البحث أثناء الكتابة، البحث الجزئي، وعدم حساسية حالة الأحرف)
 */

// تخزين قائمة الإشعارات الأصلية لاستخدامها عند البحث
let originalNotificationsList = [];

// تعديل وظيفة تطبيق نافذة الإشعارات المركزية لإضافة حقل البحث
const originalApplyCentralNotificationPanel = window.applyCentralNotificationPanel;

window.applyCentralNotificationPanel = function() {
    // استدعاء الوظيفة الأصلية أولاً
    if (originalApplyCentralNotificationPanel) {
        originalApplyCentralNotificationPanel();
    }
    
    // إضافة حقل البحث بعد قسم التصفية
    addSearchInputToNotifications();
    
    console.log("تم تطبيق خانة البحث للوحة الإشعارات المركزية");
};

// تعديل وظيفة تحميل الإشعارات لحفظ القائمة الأصلية
const originalEnhancedLoadNotifications = window.enhancedLoadNotifications;

window.enhancedLoadNotifications = function() {
    // حفظ قائمة الإشعارات الأصلية
    originalNotificationsList = [...notifications];
    
    // استدعاء الوظيفة الأصلية
    if (originalEnhancedLoadNotifications) {
        originalEnhancedLoadNotifications();
    } else {
        // تنفيذ سلوك افتراضي
        loadDefaultNotifications();
    }
};

// إضافة حقل البحث إلى نافذة الإشعارات
function addSearchInputToNotifications() {
    // التحقق من وجود لوحة الإشعارات
    const notificationPanel = document.getElementById('notificationPanel');
    if (!notificationPanel) {
        console.error('لم يتم العثور على لوحة الإشعارات!');
        return;
    }
    
    // عدم إضافة حقل البحث إذا كان موجوداً بالفعل
    if (document.getElementById('notificationSearchInput')) {
        return;
    }
    
    // إنشاء حقل البحث
    const searchContainer = document.createElement('div');
    searchContainer.className = 'notification-search';
    searchContainer.innerHTML = `
        <div class="search-input-container">
            <input type="text" id="notificationSearchInput" class="search-input" placeholder="بحث عن اسم المستثمر...">
            <button id="notificationSearchClear" class="search-clear" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
            <div class="search-icon">
                <i class="fas fa-search"></i>
            </div>
        </div>
    `;
    
    // إضافة حقل البحث بعد قسم التصفية في النافذة المركزية
    const filterContainer = notificationPanel.querySelector('.notification-filter');
    if (filterContainer) {
        // إضافة بعد قسم التصفية
        filterContainer.parentNode.insertBefore(searchContainer, filterContainer.nextSibling);
    } else {
        // إذا لم يتم العثور على قسم التصفية، إضافة بعد العنوان
        const header = notificationPanel.querySelector('.notification-header');
        if (header) {
            header.parentNode.insertBefore(searchContainer, header.nextSibling);
        } else {
            // إضافة كأول عنصر في اللوحة
            notificationPanel.prepend(searchContainer);
        }
    }
    
    // إضافة أنماط CSS
    addNotificationSearchStyles();
    
    // إضافة حدث البحث
    const searchInput = document.getElementById('notificationSearchInput');
    const clearButton = document.getElementById('notificationSearchClear');
    
    if (searchInput) {
        // البحث أثناء الكتابة
        searchInput.addEventListener('input', function() {
            searchNotifications(this.value);
            
            // إظهار أو إخفاء زر المسح
            if (clearButton) {
                clearButton.style.display = this.value ? 'block' : 'none';
            }
        });
        
        // إضافة دعم الفلترة باستخدام مفتاح Enter
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                searchNotifications(this.value);
            }
        });
    }
    
    // إضافة حدث مسح البحث
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                searchNotifications('');
                this.style.display = 'none';
                searchInput.focus();
            }
        });
    }
}

// وظيفة البحث الذكي في الإشعارات
function searchNotifications(query) {
    // إذا كان البحث فارغاً، أعد تحميل جميع الإشعارات
    if (!query || query.trim() === '') {
        notifications = [...originalNotificationsList];
        
        // إعادة تحميل قائمة الإشعارات
        refreshNotificationsList();
        return;
    }
    
    // تحويل البحث إلى أحرف صغيرة للبحث غير الحساس لحالة الأحرف
    query = query.trim().toLowerCase();
    
    // البحث في الإشعارات عن اسم المستثمر
    const filteredNotifications = originalNotificationsList.filter(notification => {
        // البحث في عنوان الإشعار (يحتوي عادة على اسم المستثمر)
        const titleContainsQuery = notification.title && 
                                 notification.title.toLowerCase().includes(query);
        
        // البحث في نص الإشعار
        const messageContainsQuery = notification.message && 
                                   notification.message.toLowerCase().includes(query);
        
        // البحث عن اسم المستثمر باستخدام معرف المستثمر
        let investorNameContainsQuery = false;
        if (notification.entityId && notification.entityType === 'investor') {
            // البحث عن المستثمر باستخدام المعرف
            const investor = investors.find(inv => inv.id === notification.entityId);
            if (investor && investor.name) {
                investorNameContainsQuery = investor.name.toLowerCase().includes(query);
            }
        }
        
        // أيضاً الأرباح المستحقة والمتراكمة تحتوي على معرف المستثمر
        if (notification.entityId && 
            (notification.entityType === 'profit-due' || notification.entityType === 'accumulated-profit')) {
            // البحث عن المستثمر باستخدام المعرف
            const investor = investors.find(inv => inv.id === notification.entityId);
            if (investor && investor.name) {
                investorNameContainsQuery = investor.name.toLowerCase().includes(query);
            }
        }
        
        // إعادة النتيجة إذا كان العنوان أو النص أو اسم المستثمر يحتوي على البحث
        return titleContainsQuery || messageContainsQuery || investorNameContainsQuery;
    });
    
    // تعيين الإشعارات المفلترة
    notifications = filteredNotifications;
    
    // إعادة تحميل قائمة الإشعارات
    refreshNotificationsList();
}

// وظيفة تحديث قائمة الإشعارات بعد البحث
function refreshNotificationsList() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    // مسح القائمة الحالية
    notificationList.innerHTML = '';
    
    // إذا لم تكن هناك إشعارات بعد الفلترة
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج للبحث</p>
                <button class="btn btn-light btn-sm" onclick="clearNotificationSearch()">
                    <i class="fas fa-undo"></i> عرض جميع الإشعارات
                </button>
            </div>
        `;
        return;
    }
    
    // إضافة الإشعارات المفلترة
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : ''}`;
        
        // إضافة فئة خاصة للإشعارات المتعلقة بالأرباح المستحقة
        if (notification.entityType === 'profit-due') {
            item.classList.add('profit-due-notification');
        }
        
        // إضافة فئة خاصة للإشعارات المتعلقة بالأرباح المتراكمة
        if (notification.entityType === 'accumulated-profit') {
            item.classList.add('accumulated-profit-notification');
        }
        
        // الحصول على اسم المستثمر إذا كان مرتبطاً بالإشعار
        let investorName = '';
        if (notification.entityId && 
            (notification.entityType === 'investor' || 
             notification.entityType === 'profit-due' || 
             notification.entityType === 'accumulated-profit')) {
            const investor = investors.find(inv => inv.id === notification.entityId);
            if (investor && investor.name) {
                investorName = `<div class="investor-name">${investor.name}</div>`;
            }
        }
        
        item.innerHTML = `
            ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${
                    notification.type === 'success' ? 'check-circle' : 
                    notification.type === 'danger' ? 'exclamation-circle' :
                    notification.type === 'warning' ? 'exclamation-triangle' :
                    notification.type === 'profit' ? 'hand-holding-usd' :
                    notification.type === 'accumulated-profit' ? 'coins' :
                    'info-circle'
                }"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                ${investorName}
                <div class="notification-text">${notification.message}</div>
                <div class="notification-time">${formatDate(notification.date)} ${formatTime(notification.date)}</div>
            </div>
            <div class="notification-item-actions">
                ${!notification.read ? `
                    <button class="btn btn-sm btn-light" onclick="markNotificationAsRead('${notification.id}')" title="تعيين كمقروء">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                ${notification.entityId ? `
                    <button class="btn btn-sm btn-info" onclick="viewNotificationEntity('${notification.entityId}', '${notification.entityType}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                ` : ''}
                ${notification.entityType === 'profit-due' || notification.entityType === 'accumulated-profit' ? `
                    <button class="btn btn-sm btn-success" onclick="openPayProfitModalFromNotification('${notification.entityId}', '${notification.id}')" title="دفع الأرباح">
                        <i class="fas fa-money-bill"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        notificationList.appendChild(item);
    });
}

// وظيفة مسح البحث وإعادة تحميل جميع الإشعارات
window.clearNotificationSearch = function() {
    const searchInput = document.getElementById('notificationSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // استعادة قائمة الإشعارات الأصلية
    notifications = [...originalNotificationsList];
    
    // إعادة تحميل الإشعارات
    if (window.enhancedLoadNotifications) {
        window.enhancedLoadNotifications();
    } else {
        refreshNotificationsList();
    }
    
    // إخفاء زر المسح
    const clearButton = document.getElementById('notificationSearchClear');
    if (clearButton) {
        clearButton.style.display = 'none';
    }
};

// إضافة أنماط CSS لحقل البحث
function addNotificationSearchStyles() {
    if (document.getElementById('notification-search-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-search-styles';
    styleElement.textContent = `
        /* أنماط حقل البحث */
        .notification-search {
            padding: 10px 15px;
            background-color: var(--gray-100);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .search-input-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-input {
            width: 100%;
            padding: 8px 35px 8px 15px;
            border: 1px solid var(--gray-300);
            border-radius: 50px;
            background-color: white;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray-500);
            pointer-events: none;
        }
        
        .search-clear {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--gray-500);
            cursor: pointer;
            padding: 5px;
            font-size: 0.8rem;
        }
        
        .search-clear:hover {
            color: var(--danger-color);
        }
        
        /* أنماط عرض نتائج البحث */
        .no-notifications {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            color: var(--gray-600);
        }
        
        .no-notifications i {
            font-size: 3rem;
            margin-bottom: 15px;
            color: var(--gray-400);
        }
        
        .no-notifications p {
            font-size: 1.1rem;
            margin-bottom: 15px;
        }
        
        /* تنسيق اسم المستثمر */
        .investor-name {
            font-size: 0.9rem;
            color: var(--primary-color);
            margin-bottom: 6px;
            display: flex;
            align-items: center;
        }
        
        .investor-name:before {
            content: "\\f007";
            font-family: "Font Awesome 5 Free";
            margin-left: 5px;
            font-size: 0.8rem;
            color: var(--gray-500);
        }
        
        /* تمييز النص في البحث */
        .highlight {
            background-color: rgba(255, 251, 125, 0.4);
            padding: 0 2px;
            border-radius: 2px;
        }
        
        /* زر العرض في حالة الفلترة */
        .no-notifications .btn {
            margin-top: 10px;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// وظيفة تحميل افتراضية في حالة عدم وجود وظيفة أصلية
function loadDefaultNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-item">
                <div class="notification-content">
                    <div class="notification-title">لا توجد إشعارات</div>
                    <div class="notification-text">لا توجد إشعارات حالياً.</div>
                </div>
            </div>
        `;
        return;
    }
    
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : ''}`;
        
        item.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${
                    notification.type === 'success' ? 'check-circle' : 
                    notification.type === 'danger' ? 'exclamation-circle' :
                    notification.type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'
                }"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-text">${notification.message}</div>
                <div class="notification-time">${formatDate(notification.date)} ${formatTime(notification.date)}</div>
            </div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="btn btn-sm btn-light" onclick="markNotificationAsRead('${notification.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                ${notification.entityId && notification.entityType ? `
                    <button class="btn btn-sm btn-info" onclick="viewNotificationEntity('${notification.entityId}', '${notification.entityType}')">
                        <i class="fas fa-eye"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        notificationList.appendChild(item);
    });
}

// تعديل وظيفة تصفية الإشعارات للعمل مع خاصية البحث
const originalFilterNotifications = window.filterNotifications;

window.filterNotifications = function(filter) {
    // حفظ القائمة الأصلية إذا لم تكن محفوظة
    if (originalNotificationsList.length === 0) {
        originalNotificationsList = [...notifications];
    }
    
    // استدعاء الوظيفة الأصلية إذا كانت موجودة
    if (originalFilterNotifications) {
        originalFilterNotifications(filter);
        return;
    }
    
    // تنفيذ سلوك افتراضي إذا لم تكن الوظيفة الأصلية موجودة
    // تحديث حالة الأزرار
    const buttons = document.querySelectorAll('.notification-filter button');
    buttons.forEach(btn => {
        btn.className = 'btn btn-sm btn-light';
    });
    
    const activeButton = document.querySelector(`.notification-filter button[onclick="filterNotifications('${filter}')"]`);
    if (activeButton) {
        activeButton.className = 'btn btn-sm btn-primary active';
    }
    
    // استعادة قائمة الإشعارات الأصلية قبل التصفية
    notifications = [...originalNotificationsList];
    
    // تصفية الإشعارات
    if (filter !== 'all') {
        if (filter === 'unread') {
            notifications = notifications.filter(n => !n.read);
        } else if (filter === 'profit') {
            notifications = notifications.filter(n => n.entityType === 'profit-due');
        } else if (filter === 'accumulated') {
            notifications = notifications.filter(n => n.entityType === 'accumulated-profit');
        }
    }
    
    // مسح حقل البحث
    const searchInput = document.getElementById('notificationSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // إخفاء زر المسح
    const clearButton = document.getElementById('notificationSearchClear');
    if (clearButton) {
        clearButton.style.display = 'none';
    }
    
    // إعادة تحميل الإشعارات
    refreshNotificationsList();
    
    // إظهار رسالة "لا توجد إشعارات" إذا لم تكن هناك إشعارات مرئية
    checkEmptyNotifications(filter);
};

// وظيفة للتحقق من وجود إشعارات بعد التصفية
function checkEmptyNotifications(filter) {
    if (notifications.length === 0) {
        const notificationList = document.getElementById('notificationList');
        if (notificationList) {
            let message = 'لا توجد إشعارات';
            
            if (filter === 'unread') {
                message = 'لا توجد إشعارات غير مقروءة';
            } else if (filter === 'profit') {
                message = 'لا توجد إشعارات أرباح مستحقة';
            } else if (filter === 'accumulated') {
                message = 'لا توجد إشعارات أرباح متراكمة';
            }
            
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// تعديل وظيفة تهيئة نافذة الإشعارات المركزية
const originalInitCentralNotificationPanel = window.initCentralNotificationPanel;

window.initCentralNotificationPanel = function() {
    // استدعاء الوظيفة الأصلية
    if (originalInitCentralNotificationPanel) {
        originalInitCentralNotificationPanel();
    }
    
    // إضافة حقل البحث بعد فترة قصيرة للتأكد من تحميل النافذة
    setTimeout(() => {
        addSearchInputToNotifications();
    }, 500);
};

// تسجيل وظائف البحث
window.notificationSearchFeatures = {
    searchNotifications: searchNotifications,
    clearNotificationSearch: window.clearNotificationSearch,
    refreshNotificationsList: refreshNotificationsList,
    addSearchInputToNotifications: addSearchInputToNotifications
};

// تنفيذ إضافة عناصر البحث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // استدعاء وظيفة إضافة حقل البحث بعد فترة قصيرة للتأكد من تحميل العناصر الأخرى
    setTimeout(() => {
        if (document.getElementById('notificationPanel')) {
            addSearchInputToNotifications();
            console.log("تم إضافة حقل البحث");
        } else {
            console.log("لوحة الإشعارات غير موجودة بعد، سيتم إضافة حقل البحث عند تهيئة النافذة");
        }
    }, 1000);
});