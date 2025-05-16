// securitySystem.js - نظام الأمان والمصادقة للتطبيق

// قاعدة بيانات المستخدمين (في التطبيق الحقيقي يجب تخزين هذه البيانات بشكل آمن)
let users = [
    {
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        fullName: 'المدير',
        role: 'admin',
        lastLogin: null,
        permissions: {
            dashboard: true,
            analytics: true,
            investors: true,
            investments: true,
            profits: true,
            operations: true,
            reports: true,
            financial: true,
            calendar: true,
            settings: true,
            addInvestor: true,
            editInvestor: true,
            deleteInvestor: true,
            addInvestment: true,
            editInvestment: true,
            deleteInvestment: true,
            withdrawals: true,
            profits: true,
            backup: true
        }
    },
    {
        id: 'user1',
        username: 'user1',
        password: 'user123',
        fullName: 'موظف',
        role: 'user',
        lastLogin: null,
        permissions: {
            dashboard: true,
            analytics: false,
            investors: true,
            investments: true,
            profits: false,
            operations: false,
            reports: false,
            financial: false,
            calendar: true,
            settings: false,
            addInvestor: false,
            editInvestor: false,
            deleteInvestor: false,
            addInvestment: false,
            editInvestment: false,
            deleteInvestment: false,
            withdrawals: false,
            profits: false,
            backup: false
        }
    }
];

// المستخدم الحالي المسجل دخوله
let currentUser = null;

// تهيئة نظام الأمان
function initSecuritySystem() {
    // التحقق من وجود مستخدم مسجل دخوله في الجلسة
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        applyUserPermissions(currentUser);
        updateUIWithUserInfo(currentUser);
    } else {
        // عرض شاشة تسجيل الدخول
        showLoginScreen();
    }
    
    // إضافة علامة تبويب الأمان إلى صفحة الإعدادات
    addSecuritySettingsTab();
}

// عرض شاشة تسجيل الدخول
function showLoginScreen() {
    // إنشاء طبقة تسجيل الدخول
    const loginOverlay = document.createElement('div');
    loginOverlay.id = 'loginOverlay';
    loginOverlay.className = 'login-overlay';
    
    loginOverlay.innerHTML = `
        <div class="login-container">
            <div class="login-header">
                <div class="login-logo">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h1 class="login-title">نظام إدارة الاستثمار المتطور</h1>
            </div>
            <div class="login-form">
                <h2>تسجيل الدخول</h2>
                <form id="loginForm" onsubmit="return securitySystem.attemptLogin(event)">
                    <div class="form-group">
                        <label for="username">اسم المستخدم</label>
                        <input type="text" id="username" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="password">كلمة المرور</label>
                        <input type="password" id="password" class="form-control" required>
                    </div>
                    <div class="form-group" id="loginError" style="color: var(--danger-color); display: none;">
                        <p>اسم المستخدم أو كلمة المرور غير صحيحة</p>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary btn-block">تسجيل الدخول</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(loginOverlay);
    
    // إضافة CSS لشاشة تسجيل الدخول
    const style = document.createElement('style');
    style.textContent = `
        .login-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--bg-color, #f5f5f5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            width: 400px;
            max-width: 90%;
            overflow: hidden;
        }
        
        .login-header {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .login-logo {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        
        .login-title {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .login-form {
            padding: 30px;
        }
        
        .login-form h2 {
            margin-top: 0;
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        
        .btn-block {
            width: 100%;
        }
    `;
    
    document.head.appendChild(style);
}

// محاولة تسجيل الدخول
function attemptLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // البحث عن المستخدم
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // تسجيل الدخول بنجاح
        currentUser = { ...user };
        delete currentUser.password; // لا تخزن كلمة المرور في الجلسة
        
        // تحديث وقت آخر تسجيل دخول
        user.lastLogin = new Date().toISOString();
        saveUsers();
        
        // تخزين المستخدم في الجلسة
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // تطبيق الصلاحيات
        applyUserPermissions(currentUser);
        
        // تحديث واجهة المستخدم بمعلومات المستخدم
        updateUIWithUserInfo(currentUser);
        
        // إزالة طبقة تسجيل الدخول
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.remove();
        }
        
        // عرض إشعار الترحيب
        createNotification('مرحبًا', `مرحباً بك ${currentUser.fullName}`, 'success');
    } else {
        // فشل تسجيل الدخول
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.style.display = 'block';
        }
    }
    
    return false;
}

// تسجيل الخروج
function logout() {
    // مسح المستخدم الحالي
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // عرض شاشة تسجيل الدخول
    showLoginScreen();
}

// تطبيق صلاحيات المستخدم على عناصر واجهة المستخدم
function applyUserPermissions(user) {
    const permissions = user.permissions;
    
    // عناصر القائمة الجانبية
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        
        if (href) {
            const page = href.substring(1); // إزالة # من href
            
            if (!permissions[page]) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        }
    });
    
    // الأزرار والعناصر الأخرى بناءً على الصلاحيات
    // أزرار إضافة/تعديل/حذف المستثمر
    if (!permissions.addInvestor) {
        const addInvestorButtons = document.querySelectorAll('button[onclick*="openAddInvestorModal"]');
        addInvestorButtons.forEach(btn => btn.style.display = 'none');
    }
    
    if (!permissions.editInvestor) {
        const editInvestorButtons = document.querySelectorAll('button[onclick*="editInvestor"]');
        editInvestorButtons.forEach(btn => btn.style.display = 'none');
    }
    
    if (!permissions.deleteInvestor) {
        const deleteInvestorButtons = document.querySelectorAll('button[onclick*="openDeleteConfirmationModal"]');
        deleteInvestorButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes("'investor'")) {
                btn.style.display = 'none';
            }
        });
    }
    
    // أزرار إضافة/تعديل/حذف الاستثمار
    if (!permissions.addInvestment) {
        const addInvestmentButtons = document.querySelectorAll('button[onclick*="openNewInvestmentModal"]');
        addInvestmentButtons.forEach(btn => btn.style.display = 'none');
    }
    
    if (!permissions.editInvestment) {
        const editInvestmentButtons = document.querySelectorAll('button[onclick*="editInvestment"]');
        editInvestmentButtons.forEach(btn => btn.style.display = 'none');
    }
    
    if (!permissions.deleteInvestment) {
        const deleteInvestmentButtons = document.querySelectorAll('button[onclick*="openDeleteConfirmationModal"]');
        deleteInvestmentButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes("'investment'")) {
                btn.style.display = 'none';
            }
        });
    }
    
    // السحوبات
    if (!permissions.withdrawals) {
        const withdrawalButtons = document.querySelectorAll('button[onclick*="openWithdrawModal"]');
        withdrawalButtons.forEach(btn => btn.style.display = 'none');
    }
    
    // الأرباح
    if (!permissions.profits) {
        const profitButtons = document.querySelectorAll('button[onclick*="openPayProfitModal"]');
        profitButtons.forEach(btn => btn.style.display = 'none');
    }
    
    // النسخ الاحتياطي
    if (!permissions.backup) {
        const backupButtons = document.querySelectorAll('button[onclick*="createBackup"], button[onclick*="restoreBackup"]');
        backupButtons.forEach(btn => btn.style.display = 'none');
    }
}

// تحديث واجهة المستخدم بمعلومات المستخدم
function updateUIWithUserInfo(user) {
    // تحديث اسم المستخدم والدور في الشريط الجانبي
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (userName) {
        userName.textContent = user.fullName;
    }
    
    if (userRole) {
        userRole.textContent = user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم';
    }
}

// إضافة علامة تبويب الأمان إلى صفحة الإعدادات
function addSecuritySettingsTab() {
    // إضافة زر علامة التبويب
    const settingsTabs = document.querySelector('#settings .tabs');
    if (settingsTabs) {
        const securityTab = document.createElement('div');
        securityTab.className = 'tab';
        securityTab.setAttribute('onclick', 'switchSettingsTab("security")');
        securityTab.textContent = 'الأمان والمستخدمين';
        settingsTabs.appendChild(securityTab);
    }
    
    // إضافة محتوى علامة التبويب
    const settingsContainer = document.querySelector('#settings');
    if (settingsContainer) {
        const securitySettingsTab = document.createElement('div');
        securitySettingsTab.id = 'securitySettings';
        securitySettingsTab.className = 'settings-tab-content';
        
        securitySettingsTab.innerHTML = `
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">إدارة المستخدمين</h2>
                    <p class="form-subtitle">إضافة وتعديل المستخدمين والصلاحيات</p>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-title">قائمة المستخدمين</div>
                        <button class="btn btn-primary" onclick="securitySystem.openAddUserModal()">
                            <i class="fas fa-plus"></i> إضافة مستخدم
                        </button>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>اسم المستخدم</th>
                                <th>الاسم الكامل</th>
                                <th>الدور</th>
                                <th>آخر تسجيل دخول</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <!-- سيتم ملؤها بواسطة JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <div class="form-container">
                    <div class="form-header">
                        <h2 class="form-title">تغيير كلمة المرور</h2>
                    </div>
                    <form id="changePasswordForm" onsubmit="securitySystem.changeCurrentUserPassword(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">كلمة المرور الحالية</label>
                                <input type="password" class="form-control" id="currentPassword" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">كلمة المرور الجديدة</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                                <input type="password" class="form-control" id="confirmPassword" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> تغيير كلمة المرور
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="form-container">
                    <div class="form-header">
                        <h2 class="form-title">إعدادات الأمان</h2>
                    </div>
                    <form id="securitySettingsForm" onsubmit="securitySystem.saveSecuritySettings(event)">
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="requirePasswordChange">
                                <label class="form-check-label" for="requirePasswordChange">إلزام المستخدمين بتغيير كلمة المرور بعد أول تسجيل دخول</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="enableLoginNotifications">
                                <label class="form-check-label" for="enableLoginNotifications">تفعيل إشعارات تسجيل الدخول</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">مدة الجلسة (بالدقائق)</label>
                            <input type="number" class="form-control" id="sessionDuration" min="5" value="30">
                            <p class="form-text">سيتم تسجيل الخروج تلقائياً بعد فترة عدم نشاط تعادل هذه المدة.</p>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> حفظ الإعدادات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        settingsContainer.appendChild(securitySettingsTab);
        
        // ملء جدول المستخدمين
        populateUsersTable();
    }
}

// ملء جدول المستخدمين
function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        if (user.username === 'admin' && currentUser.username !== 'admin') {
            return; // فقط المسؤول يمكنه رؤية المستخدم المسؤول
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم'}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-IQ') : 'لا يوجد'}</td>
            <td>
                <button class="btn btn-warning btn-icon action-btn" onclick="securitySystem.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.username !== 'admin' ? `
                <button class="btn btn-danger btn-icon action-btn" onclick="securitySystem.deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// فتح نافذة إضافة مستخدم
function openAddUserModal() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addUserModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إضافة مستخدم جديد</h2>
                <div class="modal-close" onclick="closeModal('addUserModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="addUserForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم</label>
                            <input type="text" class="form-control" id="newUsername" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-control" id="newFullName" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور</label>
                            <input type="password" class="form-control" id="newUserPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <input type="password" class="form-control" id="confirmUserPassword" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الدور</label>
                            <select class="form-select" id="newUserRole">
                                <option value="user">مستخدم</option>
                                <option value="admin">مسؤول النظام</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3 class="form-subtitle">الصلاحيات</h3>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">صفحات النظام</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_dashboard" checked>
                                <label class="form-check-label" for="perm_dashboard">الرئيسية</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_analytics">
                                <label class="form-check-label" for="perm_analytics">التحليلات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_investors" checked>
                                <label class="form-check-label" for="perm_investors">المستثمرين</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_investments" checked>
                                <label class="form-check-label" for="perm_investments">الاستثمارات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_profits">
                                <label class="form-check-label" for="perm_profits">الأرباح</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_operations">
                                <label class="form-check-label" for="perm_operations">العمليات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_reports">
                                <label class="form-check-label" for="perm_reports">التقارير</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_financial">
                                <label class="form-check-label" for="perm_financial">التقارير المالية</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_calendar" checked>
                                <label class="form-check-label" for="perm_calendar">التقويم</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_settings">
                                <label class="form-check-label" for="perm_settings">الإعدادات</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات المستثمرين</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_addInvestor">
                                <label class="form-check-label" for="perm_addInvestor">إضافة مستثمر</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_editInvestor">
                                <label class="form-check-label" for="perm_editInvestor">تعديل مستثمر</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_deleteInvestor">
                                <label class="form-check-label" for="perm_deleteInvestor">حذف مستثمر</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات الاستثمارات</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_addInvestment">
                                <label class="form-check-label" for="perm_addInvestment">إضافة استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_editInvestment">
                                <label class="form-check-label" for="perm_editInvestment">تعديل استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_deleteInvestment">
                                <label class="form-check-label" for="perm_deleteInvestment">حذف استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_withdrawals">
                                <label class="form-check-label" for="perm_withdrawals">السحوبات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_profits">
                                <label class="form-check-label" for="perm_profits">دفع الأرباح</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات النظام</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="perm_backup">
                                <label class="form-check-label" for="perm_backup">النسخ الاحتياطي</label>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('addUserModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="securitySystem.saveNewUser()">حفظ المستخدم</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة CSS لشبكة الصلاحيات
    const style = document.createElement('style');
    style.textContent = `
        .permissions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .form-subtitle {
            font-size: 1rem;
            margin-bottom: 10px;
            color: var(--gray-700);
        }
    `;
    
    document.head.appendChild(style);
}

// حفظ مستخدم جديد
function saveNewUser() {
    // الحصول على قيم النموذج
    const username = document.getElementById('newUsername').value;
    const fullName = document.getElementById('newFullName').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    // التحقق من صحة النموذج
    if (!username || !fullName || !password || !confirmPassword) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        createNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'danger');
        return;
    }
    
    // التحقق من وجود اسم المستخدم
    if (users.some(u => u.username === username)) {
        createNotification('خطأ', 'اسم المستخدم موجود بالفعل', 'danger');
        return;
    }
    
    // الحصول على الصلاحيات
    const permissions = {
        dashboard: document.getElementById('perm_dashboard').checked,
        analytics: document.getElementById('perm_analytics').checked,
        investors: document.getElementById('perm_investors').checked,
        investments: document.getElementById('perm_investments').checked,
        profits: document.getElementById('perm_profits').checked,
        operations: document.getElementById('perm_operations').checked,
        reports: document.getElementById('perm_reports').checked,
        financial: document.getElementById('perm_financial').checked,
        calendar: document.getElementById('perm_calendar').checked,
        settings: document.getElementById('perm_settings').checked,
        addInvestor: document.getElementById('perm_addInvestor').checked,
        editInvestor: document.getElementById('perm_editInvestor').checked,
        deleteInvestor: document.getElementById('perm_deleteInvestor').checked,
        addInvestment: document.getElementById('perm_addInvestment').checked,
        editInvestment: document.getElementById('perm_editInvestment').checked,
        deleteInvestment: document.getElementById('perm_deleteInvestment').checked,
        withdrawals: document.getElementById('perm_withdrawals').checked,
        profits: document.getElementById('perm_profits').checked,
        backup: document.getElementById('perm_backup').checked
    };
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: generateId(),
        username,
        password,
        fullName,
        role,
        permissions,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
        lastLogin: null
    };
    
    // إضافة المستخدم إلى مصفوفة المستخدمين
    users.push(newUser);
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // إغلاق النافذة
    closeModal('addUserModal');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم إضافة المستخدم بنجاح', 'success');
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// تعديل مستخدم
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editUserModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تعديل المستخدم</h2>
                <div class="modal-close" onclick="closeModal('editUserModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="editUserForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم</label>
                            <input type="text" class="form-control" id="editUsername" value="${user.username}" ${user.username === 'admin' ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-control" id="editFullName" value="${user.fullName}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور</label>
                            <input type="password" class="form-control" id="editPassword" placeholder="اترك فارغًا إذا لم ترغب في التغيير">
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <input type="password" class="form-control" id="confirmEditPassword" placeholder="اترك فارغًا إذا لم ترغب في التغيير">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الدور</label>
                            <select class="form-select" id="editUserRole" ${user.username === 'admin' ? 'disabled' : ''}>
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول النظام</option>
                            </select>
                        </div>
                    </div>
                    
                    ${user.username !== 'admin' ? `
                    <div class="form-group">
                        <h3 class="form-subtitle">الصلاحيات</h3>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">صفحات النظام</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_dashboard" ${user.permissions.dashboard ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_dashboard">الرئيسية</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_analytics" ${user.permissions.analytics ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_analytics">التحليلات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_investors" ${user.permissions.investors ? 'checked' : ''}>
                                <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_investments" ${user.permissions.investments ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_investments">الاستثمارات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_profits" ${user.permissions.profits ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_profits">الأرباح</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_operations" ${user.permissions.operations ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_operations">العمليات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_reports" ${user.permissions.reports ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_reports">التقارير</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_financial" ${user.permissions.financial ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_financial">التقارير المالية</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_calendar" ${user.permissions.calendar ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_calendar">التقويم</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_settings" ${user.permissions.settings ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_settings">الإعدادات</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات المستثمرين</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_addInvestor" ${user.permissions.addInvestor ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_addInvestor">إضافة مستثمر</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_editInvestor" ${user.permissions.editInvestor ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_editInvestor">تعديل مستثمر</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_deleteInvestor" ${user.permissions.deleteInvestor ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_deleteInvestor">حذف مستثمر</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات الاستثمارات</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_addInvestment" ${user.permissions.addInvestment ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_addInvestment">إضافة استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_editInvestment" ${user.permissions.editInvestment ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_editInvestment">تعديل استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_deleteInvestment" ${user.permissions.deleteInvestment ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_deleteInvestment">حذف استثمار</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_withdrawals" ${user.permissions.withdrawals ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_withdrawals">السحوبات</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_profits" ${user.permissions.profits ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_profits">دفع الأرباح</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4 class="form-subtitle">إجراءات النظام</h4>
                        <div class="permissions-grid">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="edit_perm_backup" ${user.permissions.backup ? 'checked' : ''}>
                                <label class="form-check-label" for="edit_perm_backup">النسخ الاحتياطي</label>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <input type="hidden" id="editUserId" value="${user.id}">
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('editUserModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="securitySystem.updateUser()">حفظ التغييرات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// تحديث بيانات المستخدم
function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // الحصول على قيم النموذج
    const username = document.getElementById('editUsername').value;
    const fullName = document.getElementById('editFullName').value;
    const password = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('confirmEditPassword').value;
    const role = document.getElementById('editUserRole').value;
    
    // التحقق من صحة النموذج
    if (!username || !fullName) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    if (password && password !== confirmPassword) {
        createNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'danger');
        return;
    }
    
    // التحقق من وجود اسم المستخدم
    if (username !== user.username && users.some(u => u.username === username)) {
        createNotification('خطأ', 'اسم المستخدم موجود بالفعل', 'danger');
        return;
    }
    
    // تحديث بيانات المستخدم
    user.username = username;
    user.fullName = fullName;
    
    // تحديث كلمة المرور إذا تم تغييرها
    if (password) {
        user.password = password;
    }
    
    // تحديث الدور
    if (user.username !== 'admin') { // لا يمكن تغيير دور المسؤول
        user.role = role;
        
        // تحديث الصلاحيات
        user.permissions = {
            dashboard: document.getElementById('edit_perm_dashboard').checked,
            analytics: document.getElementById('edit_perm_analytics').checked,
            investors: document.getElementById('edit_perm_investors').checked,
            investments: document.getElementById('edit_perm_investments').checked,
            profits: document.getElementById('edit_perm_profits').checked,
            operations: document.getElementById('edit_perm_operations').checked,
            reports: document.getElementById('edit_perm_reports').checked,
            financial: document.getElementById('edit_perm_financial').checked,
            calendar: document.getElementById('edit_perm_calendar').checked,
            settings: document.getElementById('edit_perm_settings').checked,
            addInvestor: document.getElementById('edit_perm_addInvestor').checked,
            editInvestor: document.getElementById('edit_perm_editInvestor').checked,
            deleteInvestor: document.getElementById('edit_perm_deleteInvestor').checked,
            addInvestment: document.getElementById('edit_perm_addInvestment').checked,
            editInvestment: document.getElementById('edit_perm_editInvestment').checked,
            deleteInvestment: document.getElementById('edit_perm_deleteInvestment').checked,
            withdrawals: document.getElementById('edit_perm_withdrawals').checked,
            profits: document.getElementById('edit_perm_profits').checked,
            backup: document.getElementById('edit_perm_backup').checked
        };
    }
    
    // تحديث معلومات المستخدم الحالي إذا كان يعدل نفسه
    if (currentUser && currentUser.id === user.id) {
        currentUser.username = user.username;
        currentUser.fullName = user.fullName;
        currentUser.role = user.role;
        
        // تحديث واجهة المستخدم
        updateUIWithUserInfo(currentUser);
        
        // تحديث بيانات الجلسة
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // إغلاق النافذة
    closeModal('editUserModal');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم تحديث بيانات المستخدم بنجاح', 'success');
}

// حذف مستخدم
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // المسؤول لا يمكن حذفه
    if (user.username === 'admin') {
        createNotification('خطأ', 'لا يمكن حذف المستخدم المسؤول', 'danger');
        return;
    }
    
    // التأكيد على الحذف
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.fullName}"؟`)) {
        return;
    }
    
    // حذف المستخدم
    users = users.filter(u => u.id !== userId);
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم حذف المستخدم بنجاح', 'success');
}

// تغيير كلمة مرور المستخدم الحالي
function changeCurrentUserPassword(event) {
    event.preventDefault();
    
    if (!currentUser) {
        createNotification('خطأ', 'يجب تسجيل الدخول لتغيير كلمة المرور', 'danger');
        return;
    }
    
    // الحصول على قيم النموذج
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // التحقق من صحة النموذج
    if (!currentPassword || !newPassword || !confirmPassword) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        createNotification('خطأ', 'كلمة المرور الجديدة وتأكيدها غير متطابقين', 'danger');
        return;
    }
    
    // البحث عن المستخدم
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // التحقق من كلمة المرور الحالية
    if (user.password !== currentPassword) {
        createNotification('خطأ', 'كلمة المرور الحالية غير صحيحة', 'danger');
        return;
    }
    
    // تحديث كلمة المرور
    user.password = newPassword;
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // إعادة تعيين النموذج
    document.getElementById('changePasswordForm').reset();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم تغيير كلمة المرور بنجاح', 'success');
}

// حفظ إعدادات الأمان
function saveSecuritySettings(event) {
    event.preventDefault();
    
    // الحصول على قيم النموذج
    const requirePasswordChange = document.getElementById('requirePasswordChange').checked;
    const enableLoginNotifications = document.getElementById('enableLoginNotifications').checked;
    const sessionDuration = parseInt(document.getElementById('sessionDuration').value) || 30;
    
    // حفظ الإعدادات في التخزين المحلي
    localStorage.setItem('requirePasswordChange', requirePasswordChange.toString());
    localStorage.setItem('enableLoginNotifications', enableLoginNotifications.toString());
    localStorage.setItem('sessionDuration', sessionDuration.toString());
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم حفظ إعدادات الأمان بنجاح', 'success');
}

// حفظ المستخدمين في التخزين المحلي
function saveUsers() {
    try {
        // نسخة من المستخدمين مع إزالة بعض الحقول الحساسة للإظهار في التخزين
        const usersToSave = users.map(user => {
            // إنشاء نسخة من المستخدم لتجنب تعديل الكائن الأصلي
            const userCopy = { ...user };
            
            // إزالة الحقول الحساسة
            // في التطبيق الحقيقي، يجب تشفير كلمات المرور
            if (userCopy.password) {
                // تشفير كلمة المرور أو إزالتها قبل التخزين
                // userCopy.hashedPassword = hashPassword(userCopy.password);
                // delete userCopy.password;
            }
            
            return userCopy;
        });
        
        localStorage.setItem('securityUsers', JSON.stringify(usersToSave));
    } catch (error) {
        console.error('خطأ في حفظ المستخدمين:', error);
    }
}

// تحميل المستخدمين من التخزين المحلي
function loadUsers() {
    try {
        const storedUsers = localStorage.getItem('securityUsers');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
            
            // التأكد من وجود مستخدم مسؤول
            if (!users.some(u => u.username === 'admin')) {
                // إضافة مستخدم مسؤول افتراضي إذا لم يكن موجودًا
                users.push({
                    id: 'admin',
                    username: 'admin',
                    password: 'admin123',
                    fullName: 'المدير',
                    role: 'admin',
                    lastLogin: null,
                    permissions: {
                        dashboard: true,
                        analytics: true,
                        investors: true,
                        investments: true,
                        profits: true,
                        operations: true,
                        reports: true,
                        financial: true,
                        calendar: true,
                        settings: true,
                        addInvestor: true,
                        editInvestor: true,
                        deleteInvestor: true,
                        addInvestment: true,
                        editInvestment: true,
                        deleteInvestment: true,
                        withdrawals: true,
                        profits: true,
                        backup: true
                    }
                });
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// إعداد مراقبة انتهاء الجلسة
function setupSessionTimeout() {
    // الحصول على مدة الجلسة من الإعدادات
    const sessionDuration = parseInt(localStorage.getItem('sessionDuration')) || 30;
    
    // تحويل المدة إلى ميلي ثانية
    const timeout = sessionDuration * 60 * 1000;
    
    let sessionTimer;
    
    // وظيفة إعادة تعيين المؤقت
    function resetTimer() {
        clearTimeout(sessionTimer);
        sessionTimer = setTimeout(logout, timeout);
    }
    
    // إعادة تعيين المؤقت عند أي نشاط
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, false);
    });
    
    // بدء المؤقت
    resetTimer();
}

// تكامل النظام مع التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // تحميل المستخدمين
    loadUsers();
    
    // تهيئة نظام الأمان
    initSecuritySystem();
    
    // إعداد مراقبة انتهاء الجلسة
    setupSessionTimeout();
});

// تصدير وظائف النظام للوصول إليها من خارج الملف
window.securitySystem = {
    initSecuritySystem,
    attemptLogin,
    logout,
    openAddUserModal,
    saveNewUser,
    editUser,
    updateUser,
    deleteUser,
    changeCurrentUserPassword,
    saveSecuritySettings
};
