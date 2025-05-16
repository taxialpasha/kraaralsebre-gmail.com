/**
 * نظام الأمان المتكامل للتطبيق
 * يوفر هذا النظام التالي:
 * - شاشة تسجيل دخول مع التحقق من الصلاحيات
 * - إدارة المستخدمين (إضافة، تعديل، حذف)
 * - إدارة الصلاحيات والأدوار
 * - تحكم في وصول المستخدمين للعناصر والصفحات
 * - تسجيل نشاطات الدخول والعمليات الهامة
 */

// ===================== بيانات النظام =====================
// المستخدمين الافتراضيين (المدير والمستخدم)
const defaultUsers = [
    {
        id: "admin-1",
        username: "00000000",
        password: "00000000", // هذه كلمة المرور الافتراضية
        fullName: "المدير",
        role: "admin",
        email: "admin@example.com",
        active: true,
        lastLogin: null,
        createdAt: new Date().toISOString()
    },
    {
        id: "user-1",
        username: "user",
        password: "password", // كلمة مرور افتراضية للمستخدم العادي
        fullName: "المستخدم",
        role: "user",
        email: "user@example.com",
        active: true,
        lastLogin: null,
        createdAt: new Date().toISOString()
    }
];

// تحديد الأدوار والصلاحيات
const defaultRoles = {
    admin: {
        name: "المدير",
        description: "وصول كامل لجميع الميزات",
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
            security: true,
            users: true
        }
    },
    user: {
        name: "مستخدم",
        description: "وصول محدود للميزات",
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
            security: false,
            users: false
        }
    }
};

// ===================== وظائف معالجة البيانات =====================

// تهيئة بيانات النظام
function initializeSecuritySystem() {
    if (!localStorage.getItem('appUsers')) {
        localStorage.setItem('appUsers', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('appRoles')) {
        localStorage.setItem('appRoles', JSON.stringify(defaultRoles));
    }
    
    if (!localStorage.getItem('securitySettings')) {
        const defaultSettings = {
            loginAttempts: 5,                // عدد محاولات تسجيل الدخول المسموح بها
            lockDuration: 15,                // مدة القفل بالدقائق
            sessionTimeout: 30,              // مدة انتهاء الجلسة بالدقائق
            enforceStrongPassword: false,    // فرض كلمات مرور قوية
            twoFactorAuth: false,            // المصادقة الثنائية
            logActivities: true,             // تسجيل النشاطات
            autoLogout: true                 // تسجيل الخروج التلقائي
        };
        
        localStorage.setItem('securitySettings', JSON.stringify(defaultSettings));
    }
    
    if (!localStorage.getItem('activityLogs')) {
        localStorage.setItem('activityLogs', JSON.stringify([]));
    }
}

// الحصول على قائمة المستخدمين
function getUsers() {
    return JSON.parse(localStorage.getItem('appUsers') || '[]');
}

// الحصول على قائمة الأدوار
function getRoles() {
    return JSON.parse(localStorage.getItem('appRoles') || '{}');
}

// الحصول على إعدادات الأمان
function getSecuritySettings() {
    return JSON.parse(localStorage.getItem('securitySettings') || '{}');
}

// حفظ المستخدمين
function saveUsers(users) {
    localStorage.setItem('appUsers', JSON.stringify(users));
}

// حفظ الأدوار
function saveRoles(roles) {
    localStorage.setItem('appRoles', JSON.stringify(roles));
}

// حفظ إعدادات الأمان
function saveSecuritySettings(settings) {
    localStorage.setItem('securitySettings', JSON.stringify(settings));
}

// إضافة سجل نشاط
function addActivityLog(activity) {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const logEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        activity: activity.action,
        username: activity.username || getCurrentUser()?.username || 'Unknown',
        ip: activity.ip || 'local',
        details: activity.details || {}
    };
    
    logs.unshift(logEntry); // إضافة إلى بداية المصفوفة
    
    // الاحتفاظ بأحدث 1000 سجل فقط
    if (logs.length > 1000) {
        logs.pop();
    }
    
    localStorage.setItem('activityLogs', JSON.stringify(logs));
    return logEntry;
}

// الحصول على سجلات النشاط
function getActivityLogs() {
    return JSON.parse(localStorage.getItem('activityLogs') || '[]');
}

// ===================== وظائف المصادقة =====================

// التحقق من صحة اسم المستخدم وكلمة المرور
function authenticate(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.active);
    
    if (user) {
        // تحديث آخر تسجيل دخول
        user.lastLogin = new Date().toISOString();
        saveUsers(users);
        
        // إنشاء بيانات الجلسة
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            loginTime: new Date().toISOString(),
            expiryTime: calculateSessionExpiry()
        };
        
        // حفظ الجلسة
        localStorage.setItem('currentSession', JSON.stringify(session));
        
        // تسجيل النشاط
        addActivityLog({
            action: 'تسجيل دخول ناجح',
            username: user.username,
            details: {
                role: user.role,
                timestamp: new Date().toISOString()
            }
        });
        
        return { success: true, user, session };
    } else {
        // تسجيل محاولة فاشلة
        const failedUser = users.find(u => u.username === username);
        
        addActivityLog({
            action: 'محاولة تسجيل دخول فاشلة',
            username: username,
            details: {
                reason: failedUser ? 'كلمة مرور خاطئة' : 'حساب غير موجود',
                timestamp: new Date().toISOString()
            }
        });
        
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
    }
}

// حساب وقت انتهاء الجلسة
function calculateSessionExpiry() {
    const settings = getSecuritySettings();
    const timeout = settings.sessionTimeout || 30; // الافتراضي 30 دقيقة
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + timeout);
    return expiryTime.toISOString();
}

// التحقق من صلاحية الجلسة
function validateSession() {
    const sessionData = localStorage.getItem('currentSession');
    
    if (!sessionData) {
        return { valid: false, error: 'جلسة غير موجودة' };
    }
    
    const session = JSON.parse(sessionData);
    const now = new Date();
    const expiry = new Date(session.expiryTime);
    
    if (now > expiry) {
        // الجلسة منتهية
        localStorage.removeItem('currentSession');
        return { valid: false, error: 'انتهت صلاحية الجلسة' };
    }
    
    // تمديد وقت انتهاء الجلسة
    session.expiryTime = calculateSessionExpiry();
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    return { valid: true, session };
}

// الحصول على المستخدم الحالي
function getCurrentUser() {
    const sessionValidation = validateSession();
    
    if (!sessionValidation.valid) {
        return null;
    }
    
    const users = getUsers();
    return users.find(u => u.id === sessionValidation.session.userId);
}

// التحقق من صلاحيات المستخدم
function checkPermission(permission) {
    const user = getCurrentUser();
    
    if (!user) {
        return false;
    }
    
    const roles = getRoles();
    const userRole = roles[user.role];
    
    if (!userRole) {
        return false;
    }
    
    return userRole.permissions[permission] === true;
}

// تسجيل الخروج
function logout() {
    const currentSession = JSON.parse(localStorage.getItem('currentSession') || '{}');
    
    if (currentSession.username) {
        addActivityLog({
            action: 'تسجيل خروج',
            username: currentSession.username,
            details: {
                sessionDuration: getSessionDuration(currentSession.loginTime),
                timestamp: new Date().toISOString()
            }
        });
    }
    
    localStorage.removeItem('currentSession');
    return true;
}

// حساب مدة الجلسة
function getSessionDuration(loginTime) {
    const login = new Date(loginTime);
    const now = new Date();
    const durationMs = now - login;
    
    // تحويل المدة إلى دقائق
    return Math.floor(durationMs / (1000 * 60));
}

// ===================== وظائف إدارة المستخدمين =====================

// إنشاء مستخدم جديد
function createUser(userData) {
    if (!userData.username || !userData.password || !userData.role) {
        return { success: false, error: 'البيانات غير كاملة' };
    }
    
    const users = getUsers();
    
    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم
    if (users.some(u => u.username === userData.username)) {
        return { success: false, error: 'اسم المستخدم موجود بالفعل' };
    }
    
    const newUser = {
        id: generateId(),
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName || userData.username,
        role: userData.role,
        email: userData.email || '',
        active: userData.active !== false,
        lastLogin: null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    addActivityLog({
        action: 'إنشاء مستخدم جديد',
        details: {
            newUserId: newUser.id,
            username: newUser.username,
            role: newUser.role
        }
    });
    
    return { success: true, user: newUser };
}

// تحديث بيانات مستخدم
function updateUser(userId, userData) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    if (userData.username && userData.username !== users[userIndex].username) {
        if (users.some(u => u.username === userData.username)) {
            return { success: false, error: 'اسم المستخدم موجود بالفعل' };
        }
    }
    
    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    saveUsers(users);
    
    addActivityLog({
        action: 'تحديث بيانات مستخدم',
        details: {
            userId: updatedUser.id,
            username: updatedUser.username,
            updatedFields: Object.keys(userData)
        }
    });
    
    return { success: true, user: updatedUser };
}

// تغيير كلمة المرور
function changePassword(userId, currentPassword, newPassword) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    // التحقق من كلمة المرور الحالية
    if (users[userIndex].password !== currentPassword) {
        addActivityLog({
            action: 'محاولة تغيير كلمة المرور فاشلة',
            username: users[userIndex].username,
            details: {
                reason: 'كلمة المرور الحالية غير صحيحة'
            }
        });
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    
    // التحقق من قوة كلمة المرور الجديدة
    const settings = getSecuritySettings();
    if (settings.enforceStrongPassword && !isStrongPassword(newPassword)) {
        return { 
            success: false, 
            error: 'كلمة المرور غير قوية بما فيه الكفاية. يجب أن تحتوي على 8 أحرف على الأقل وتتضمن أحرف كبيرة وصغيرة وأرقام ورموز خاصة.' 
        };
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    addActivityLog({
        action: 'تغيير كلمة المرور',
        username: users[userIndex].username,
        details: {
            userId: users[userIndex].id
        }
    });
    
    return { success: true };
}

// حذف مستخدم
function deleteUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    // لا يمكن حذف المستخدم الحالي
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return { success: false, error: 'لا يمكن حذف المستخدم الحالي' };
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    saveUsers(users);
    
    addActivityLog({
        action: 'حذف مستخدم',
        details: {
            userId: deletedUser.id,
            username: deletedUser.username
        }
    });
    
    return { success: true };
}

// إيقاف أو تفعيل مستخدم
function toggleUserStatus(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    // لا يمكن إيقاف المستخدم الحالي
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        return { success: false, error: 'لا يمكن إيقاف المستخدم الحالي' };
    }
    
    users[userIndex].active = !users[userIndex].active;
    saveUsers(users);
    
    addActivityLog({
        action: users[userIndex].active ? 'تفعيل مستخدم' : 'إيقاف مستخدم',
        details: {
            userId: users[userIndex].id,
            username: users[userIndex].username
        }
    });
    
    return { success: true, active: users[userIndex].active };
}

// ===================== وظائف إدارة الأدوار والصلاحيات =====================

// إنشاء دور جديد
function createRole(roleName, permissions, description) {
    const roles = getRoles();
    
    if (roles[roleName]) {
        return { success: false, error: 'الدور موجود بالفعل' };
    }
    
    roles[roleName] = {
        name: roleName,
        description: description || '',
        permissions: permissions || {}
    };
    
    saveRoles(roles);
    
    addActivityLog({
        action: 'إنشاء دور جديد',
        details: {
            roleName: roleName,
            permissions: Object.keys(permissions || {}).filter(p => permissions[p])
        }
    });
    
    return { success: true, role: roles[roleName] };
}

// تحديث دور
function updateRole(roleName, updatedData) {
    const roles = getRoles();
    
    if (!roles[roleName]) {
        return { success: false, error: 'الدور غير موجود' };
    }
    
    // منع تحديث دور المدير إذا كان يزيل صلاحيات أساسية
    if (roleName === 'admin' && updatedData.permissions) {
        // التأكد من أن دور المدير يحتفظ دائمًا بالصلاحيات الأساسية
        updatedData.permissions.security = true;
        updatedData.permissions.users = true;
        updatedData.permissions.settings = true;
    }
    
    roles[roleName] = { ...roles[roleName], ...updatedData };
    saveRoles(roles);
    
    addActivityLog({
        action: 'تحديث دور',
        details: {
            roleName: roleName,
            updatedFields: Object.keys(updatedData)
        }
    });
    
    return { success: true, role: roles[roleName] };
}

// حذف دور
function deleteRole(roleName) {
    const roles = getRoles();
    
    if (!roles[roleName]) {
        return { success: false, error: 'الدور غير موجود' };
    }
    
    // لا يمكن حذف الأدوار الأساسية
    if (roleName === 'admin' || roleName === 'user') {
        return { success: false, error: 'لا يمكن حذف الأدوار الأساسية' };
    }
    
    // التحقق من عدم وجود مستخدمين بهذا الدور
    const users = getUsers();
    if (users.some(u => u.role === roleName)) {
        return { success: false, error: 'لا يمكن حذف الدور لوجود مستخدمين مرتبطين به' };
    }
    
    delete roles[roleName];
    saveRoles(roles);
    
    addActivityLog({
        action: 'حذف دور',
        details: {
            roleName: roleName
        }
    });
    
    return { success: true };
}

// ===================== وظائف مساعدة =====================

// توليد معرّف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// التحقق من قوة كلمة المرور
function isStrongPassword(password) {
    if (!password || password.length < 8) {
        return false;
    }
    
    // التحقق من وجود الأحرف الكبيرة والصغيرة والأرقام والرموز
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
}

// تهيئة النظام عند بدء التطبيق
window.addEventListener('DOMContentLoaded', function() {
    initializeSecuritySystem();
    displayLoginScreen();
});

// ===================== وظائف واجهة المستخدم =====================

// عرض شاشة تسجيل الدخول
function displayLoginScreen() {
    // التحقق من وجود جلسة نشطة
    const sessionValidation = validateSession();
    
    if (sessionValidation.valid) {
        // إذا كانت الجلسة صالحة، انتقل إلى التطبيق الرئيسي
        initializeApp();
        return;
    }
    
    // إخفاء واجهة التطبيق
    document.querySelector('.app-container').style.display = 'none';
    
    // إنشاء شاشة تسجيل الدخول
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
    loginContainer.innerHTML = `
        <div class="login-box">
            <div class="login-header">
                <div class="app-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h1>نظام إدارة الاستثمار المتطور</h1>
            </div>
            <div class="login-form">
                <div class="form-group">
                    <label for="username">اسم المستخدم</label>
                    <input type="text" id="username" class="form-control" placeholder="أدخل اسم المستخدم">
                </div>
                <div class="form-group">
                    <label for="password">كلمة المرور</label>
                    <div class="password-input">
                        <input type="password" id="password" class="form-control" placeholder="أدخل كلمة المرور">
                        <button type="button" class="toggle-password" title="إظهار كلمة المرور">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="login-error" id="loginError" style="display: none;"></div>
                <div class="form-group">
                    <button id="loginButton" class="btn btn-primary btn-block">تسجيل الدخول</button>
                </div>
                <div class="login-footer">
                    <div class="version">الإصدار 1.0.0</div>
                    <div class="forgot-password">نسيت كلمة المرور؟ اتصل بمدير النظام</div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة شاشة تسجيل الدخول إلى المستند
    document.body.insertBefore(loginContainer, document.body.firstChild);
    
    // إضافة مستمعي الأحداث
    const loginButton = document.getElementById('loginButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.querySelector('.toggle-password');
    
    // زر تسجيل الدخول
    loginButton.addEventListener('click', function() {
        handleLogin();
    });
    
    // معالجة الضغط على Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });
    
    // زر إظهار/إخفاء كلمة المرور
    togglePasswordButton.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const passwordIcon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.className = 'fas fa-eye-slash';
            this.title = 'إخفاء كلمة المرور';
        } else {
            passwordInput.type = 'password';
            passwordIcon.className = 'fas fa-eye';
            this.title = 'إظهار كلمة المرور';
        }
    });
    
    // التركيز على حقل اسم المستخدم
    usernameInput.focus();
}

// معالجة تسجيل الدخول
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    // التحقق من تعبئة الحقول
    if (!username || !password) {
        loginError.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
        loginError.style.display = 'block';
        return;
    }
    
    // محاولة تسجيل الدخول
    const authResult = authenticate(username, password);
    
    if (authResult.success) {
        // إزالة شاشة تسجيل الدخول
        document.querySelector('.login-container').remove();
        
        // تهيئة التطبيق
        initializeApp();
    } else {
        // عرض رسالة الخطأ
        loginError.textContent = authResult.error || 'فشل تسجيل الدخول. الرجاء التحقق من البيانات المدخلة.';
        loginError.style.display = 'block';
        
        // هز شاشة تسجيل الدخول
        const loginBox = document.querySelector('.login-box');
        loginBox.classList.add('shake');
        setTimeout(() => {
            loginBox.classList.remove('shake');
        }, 500);
    }
}

// تهيئة التطبيق بعد تسجيل الدخول
function initializeApp() {
    // عرض واجهة التطبيق
    document.querySelector('.app-container').style.display = 'flex';
    
    // تحديث معلومات المستخدم في الشريط الجانبي
    updateUserInfo();
    
    // تطبيق صلاحيات المستخدم
    applyUserPermissions();
    
    // إضافة زر "إعدادات الأمان" في صفحة الإعدادات
    addSecuritySettingsButton();
    
    // إعداد مراقبة انتهاء الجلسة
    setupSessionTimeout();
    
    // عرض إشعار بتسجيل الدخول
    const user = getCurrentUser();
    if (user) {
        const notificationTitle = `مرحباً، ${user.fullName}`;
        const notificationMessage = `تم تسجيل دخولك بنجاح. آخر تسجيل دخول: ${
            user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-PS') : 'هذه أول مرة'
        }`;
        
        createNotification(notificationTitle, notificationMessage, 'success');
    }
    
    // افتح صفحة لوحة التحكم
    showPage('dashboard');
}

// تحديث معلومات المستخدم في الشريط الجانبي
function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    
    if (userNameElement) {
        userNameElement.textContent = user.fullName;
    }
    
    if (userRoleElement) {
        const roles = getRoles();
        const roleName = roles[user.role]?.name || user.role;
        userRoleElement.textContent = roleName;
    }
}

// تطبيق صلاحيات المستخدم
function applyUserPermissions() {
    const user = getCurrentUser();
    if (!user) return;
    
    const roles = getRoles();
    const userRole = roles[user.role];
    
    if (!userRole) return;
    
    // تطبيق صلاحيات الشريط الجانبي
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        
        const page = href.replace('#', '');
        
        if (userRole.permissions[page] === false) {
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
}

// إضافة زر إعدادات الأمان
function addSecuritySettingsButton() {
    // التحقق من وجود صلاحية "security"
    if (!checkPermission('security')) return;
    
    const settingsTabs = document.querySelector('#settings .tabs');
    if (!settingsTabs) return;
    
    // التحقق من عدم وجود زر إعدادات الأمان
    if (settingsTabs.querySelector('.tab[onclick="switchSettingsTab(\'security\')"]')) return;
    
    // إنشاء زر إعدادات الأمان
    const securityTab = document.createElement('div');
    securityTab.className = 'tab';
    securityTab.textContent = 'الأمان';
    securityTab.setAttribute('onclick', "switchSettingsTab('security')");
    
    settingsTabs.appendChild(securityTab);
    
    // إنشاء قسم إعدادات الأمان
    const settingsContent = document.querySelector('#settings');
    if (!settingsContent) return;
    
    // التحقق من عدم وجود قسم إعدادات الأمان
    if (settingsContent.querySelector('#securitySettings')) return;
    
    const securitySettingsDiv = document.createElement('div');
    securitySettingsDiv.id = 'securitySettings';
    securitySettingsDiv.className = 'settings-tab-content';
    
    securitySettingsDiv.innerHTML = `
        <div class="tabs">
            <div class="tab active" onclick="switchSecurityTab('general')">عام</div>
            <div class="tab" onclick="switchSecurityTab('users')">المستخدمين</div>
            <div class="tab" onclick="switchSecurityTab('roles')">الأدوار والصلاحيات</div>
            <div class="tab" onclick="switchSecurityTab('logs')">سجل النشاطات</div>
        </div>
        
        <div id="securityGeneral" class="security-tab-content active">
            <!-- إعدادات الأمان العامة -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">إعدادات الأمان العامة</h2>
                    <p class="form-subtitle">تخصيص إعدادات حماية وأمان النظام</p>
                </div>
                <form id="securitySettingsForm">
                    <div class="form-group">
                        <h3 class="form-subtitle">تسجيل الدخول</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">عدد محاولات تسجيل الدخول المسموح بها</label>
                                <input type="number" class="form-control" id="loginAttempts" min="1" max="10" value="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة قفل الحساب (بالدقائق)</label>
                                <input type="number" class="form-control" id="lockDuration" min="1" max="60" value="15">
                            </div>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="enforceStrongPassword">
                            <label class="form-check-label" for="enforceStrongPassword">فرض كلمات مرور قوية</label>
                            <p class="form-text">يتطلب 8 أحرف على الأقل وتشمل أحرف كبيرة وصغيرة وأرقام ورموز</p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3 class="form-subtitle">الجلسة</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">مدة انتهاء الجلسة (بالدقائق)</label>
                                <input type="number" class="form-control" id="sessionTimeout" min="5" max="240" value="30">
                            </div>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="autoLogout" checked>
                            <label class="form-check-label" for="autoLogout">تسجيل الخروج التلقائي عند الخمول</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3 class="form-subtitle">المصادقة الثنائية</h3>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="twoFactorAuth">
                            <label class="form-check-label" for="twoFactorAuth">تفعيل المصادقة الثنائية</label>
                            <p class="form-text">استخدام رمز إضافي يرسل عبر البريد الإلكتروني أو تطبيقات المصادقة</p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h3 class="form-subtitle">السجلات والمراقبة</h3>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="logActivities" checked>
                            <label class="form-check-label" for="logActivities">تسجيل نشاطات المستخدمين</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn btn-primary" onclick="saveSecurityGeneralSettings()">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                        <button type="reset" class="btn btn-light">
                            <i class="fas fa-redo"></i> إعادة تعيين
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div id="securityUsers" class="security-tab-content">
            <!-- إدارة المستخدمين -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">إدارة المستخدمين</h2>
                    <button class="btn btn-primary" onclick="openAddUserModal()">
                        <i class="fas fa-user-plus"></i> إضافة مستخدم جديد
                    </button>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>اسم المستخدم</th>
                                <th>الاسم الكامل</th>
                                <th>الدور</th>
                                <th>البريد الإلكتروني</th>
                                <th>آخر تسجيل دخول</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <!-- سيتم تعبئته ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div id="securityRoles" class="security-tab-content">
            <!-- إدارة الأدوار والصلاحيات -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">إدارة الأدوار والصلاحيات</h2>
                    <button class="btn btn-primary" onclick="openAddRoleModal()">
                        <i class="fas fa-plus"></i> إضافة دور جديد
                    </button>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>الدور</th>
                                <th>الوصف</th>
                                <th>عدد المستخدمين</th>
                                <th>عدد الصلاحيات</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="rolesTableBody">
                            <!-- سيتم تعبئته ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div id="securityLogs" class="security-tab-content">
            <!-- سجل النشاطات -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">سجل النشاطات</h2>
                    <div class="form-actions">
                        <button class="btn btn-light" onclick="exportActivityLogs()">
                            <i class="fas fa-file-export"></i> تصدير السجل
                        </button>
                        <button class="btn btn-light" onclick="clearActivityLogs()">
                            <i class="fas fa-trash"></i> مسح السجل
                        </button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">فلترة السجل</label>
                        <div class="input-group">
                            <select class="form-select" id="logFilterType">
                                <option value="all">جميع النشاطات</option>
                                <option value="login">تسجيل الدخول</option>
                                <option value="logout">تسجيل الخروج</option>
                                <option value="create">إنشاء</option>
                                <option value="update">تحديث</option>
                                <option value="delete">حذف</option>
                            </select>
                            <input type="text" class="form-control" id="logFilterUser" placeholder="اسم المستخدم">
                            <button class="btn btn-primary" onclick="filterActivityLogs()">
                                <i class="fas fa-search"></i> بحث
                            </button>
                        </div>
                    </div>
                </div>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>التاريخ والوقت</th>
                                <th>النشاط</th>
                                <th>المستخدم</th>
                                <th>تفاصيل</th>
                            </tr>
                        </thead>
                        <tbody id="activityLogsTableBody">
                            <!-- سيتم تعبئته ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    settingsContent.appendChild(securitySettingsDiv);
    
    // تحميل بيانات إعدادات الأمان
    loadSecuritySettings();
}

// تحميل إعدادات الأمان
function loadSecuritySettings() {
    const settings = getSecuritySettings();
    
    // تعبئة نموذج الإعدادات العامة
    document.getElementById('loginAttempts').value = settings.loginAttempts || 5;
    document.getElementById('lockDuration').value = settings.lockDuration || 15;
    document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
    document.getElementById('enforceStrongPassword').checked = settings.enforceStrongPassword || false;
    document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth || false;
    document.getElementById('autoLogout').checked = settings.autoLogout !== false;
    document.getElementById('logActivities').checked = settings.logActivities !== false;
    
    // تحميل قائمة المستخدمين
    loadUsersList();
    
    // تحميل قائمة الأدوار
    loadRolesList();
    
    // تحميل سجل النشاطات
    loadActivityLogsList();
}

// تحميل قائمة المستخدمين
function loadUsersList() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    // مسح المحتويات الحالية
    usersTableBody.innerHTML = '';
    
    // الحصول على المستخدمين
    const users = getUsers();
    
    // الحصول على الأدوار لعرض أسماء الأدوار
    const roles = getRoles();
    
    // إضافة صفوف الجدول
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        
        // تمييز المستخدم الحالي
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            row.className = 'current-user';
        }
        
        // الحصول على اسم الدور
        const roleName = roles[user.role]?.name || user.role;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${roleName}</td>
            <td>${user.email || '-'}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-PS') : '-'}</td>
            <td>
                <span class="status ${user.active ? 'active' : 'inactive'}">
                    ${user.active ? 'نشط' : 'متوقف'}
                </span>
            </td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="openEditUserModal('${user.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-warning btn-icon action-btn" onclick="toggleUserStatusUI('${user.id}')" title="${user.active ? 'إيقاف' : 'تفعيل'}">
                    <i class="fas fa-${user.active ? 'ban' : 'check'}"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="confirmDeleteUser('${user.id}')" title="حذف" ${currentUser && currentUser.id === user.id ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
}

// تحميل قائمة الأدوار
function loadRolesList() {
    const rolesTableBody = document.getElementById('rolesTableBody');
    if (!rolesTableBody) return;
    
    // مسح المحتويات الحالية
    rolesTableBody.innerHTML = '';
    
    // الحصول على الأدوار
    const roles = getRoles();
    
    // الحصول على عدد المستخدمين لكل دور
    const users = getUsers();
    const roleUserCounts = {};
    
    users.forEach(user => {
        if (!roleUserCounts[user.role]) {
            roleUserCounts[user.role] = 0;
        }
        roleUserCounts[user.role]++;
    });
    
    // إضافة صفوف الجدول
    Object.keys(roles).forEach(roleKey => {
        const role = roles[roleKey];
        const row = document.createElement('tr');
        
        // حساب عدد الصلاحيات الممنوحة
        const permissionsCount = Object.values(role.permissions || {}).filter(p => p).length;
        
        row.innerHTML = `
            <td>${role.name}</td>
            <td>${role.description || '-'}</td>
            <td>${roleUserCounts[roleKey] || 0}</td>
            <td>${permissionsCount}</td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="openEditRoleModal('${roleKey}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="confirmDeleteRole('${roleKey}')" title="حذف" ${roleKey === 'admin' || roleKey === 'user' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        rolesTableBody.appendChild(row);
    });
}

// تحميل سجل النشاطات
function loadActivityLogsList() {
    const logsTableBody = document.getElementById('activityLogsTableBody');
    if (!logsTableBody) return;
    
    // مسح المحتويات الحالية
    logsTableBody.innerHTML = '';
    
    // الحصول على سجلات النشاط
    const logs = getActivityLogs();
    
    // إضافة صفوف الجدول
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // تنسيق التاريخ
        const logDate = new Date(log.timestamp).toLocaleString('ar-PS');
        
        // تنسيق التفاصيل كنص
        let detailsText = '';
        if (log.details) {
            detailsText = Object.keys(log.details)
                .map(key => `${key}: ${log.details[key]}`)
                .join('، ');
        }
        
        row.innerHTML = `
            <td>${logDate}</td>
            <td>${log.activity}</td>
            <td>${log.username}</td>
            <td>${detailsText || '-'}</td>
        `;
        
        logsTableBody.appendChild(row);
    });
}

// حفظ إعدادات الأمان العامة
function saveSecurityGeneralSettings() {
    const settings = {
        loginAttempts: parseInt(document.getElementById('loginAttempts').value) || 5,
        lockDuration: parseInt(document.getElementById('lockDuration').value) || 15,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value) || 30,
        enforceStrongPassword: document.getElementById('enforceStrongPassword').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        autoLogout: document.getElementById('autoLogout').checked,
        logActivities: document.getElementById('logActivities').checked
    };
    
    saveSecuritySettings(settings);
    
    addActivityLog({
        action: 'تحديث إعدادات الأمان',
        details: {
            settings: Object.keys(settings).join(', ')
        }
    });
    
    createNotification('تم الحفظ', 'تم حفظ إعدادات الأمان بنجاح', 'success');
    
    // تحديث مراقبة انتهاء الجلسة
    setupSessionTimeout();
}

// تبديل علامة تبويب الأمان
function switchSecurityTab(tabId) {
    // إخفاء جميع علامات التبويب
    document.querySelectorAll('.security-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // عرض علامة التبويب المحددة
    document.getElementById('security' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
    
    // تحديث العلامة النشطة
    document.querySelectorAll('#securitySettings .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`#securitySettings .tab[onclick="switchSecurityTab('${tabId}')"]`).classList.add('active');
}

// إعداد مراقبة انتهاء الجلسة
function setupSessionTimeout() {
    // إلغاء المراقبة السابقة
    if (window.sessionTimeoutChecker) {
        clearInterval(window.sessionTimeoutChecker);
    }
    
    const settings = getSecuritySettings();
    
    // التحقق من تفعيل تسجيل الخروج التلقائي
    if (!settings.autoLogout) {
        return;
    }
    
    // إنشاء مراقبة جديدة
    window.sessionTimeoutChecker = setInterval(() => {
        const sessionValidation = validateSession();
        
        if (!sessionValidation.valid) {
            // عرض تحذير انتهاء الجلسة
            showSessionTimeoutWarning();
        }
    }, 60000); // التحقق كل دقيقة
    
    // إعادة تعيين وقت انتهاء الجلسة عند تفاعل المستخدم
    const resetSessionTimeout = () => {
        validateSession();
    };
    
    // إضافة مستمعي الأحداث
    document.addEventListener('click', resetSessionTimeout);
    document.addEventListener('keypress', resetSessionTimeout);
    document.addEventListener('mousemove', debounce(resetSessionTimeout, 10000)); // استخدام debounce لتجنب الكثير من التحديثات
}

// إظهار تحذير انتهاء الجلسة
function showSessionTimeoutWarning() {
    // التحقق من وجود التنبيه
    if (document.getElementById('sessionTimeoutWarning')) {
        return;
    }
    
    const warningDiv = document.createElement('div');
    warningDiv.id = 'sessionTimeoutWarning';
    warningDiv.className = 'session-timeout-warning';
    
    warningDiv.innerHTML = `
        <div class="session-timeout-content">
            <div class="session-timeout-header">
                <i class="fas fa-clock"></i>
                <h3>تنبيه انتهاء الجلسة</h3>
            </div>
            <p>لقد انتهت جلستك بسبب عدم النشاط. يرجى تسجيل الدخول مرة أخرى للاستمرار.</p>
            <div class="session-timeout-actions">
                <button class="btn btn-light" onclick="document.getElementById('sessionTimeoutWarning').remove(); logout(); displayLoginScreen();">
                    تسجيل الدخول
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
}

// تأخير الدالة (debounce)
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// ===================== إدارة المستخدمين =====================

// فتح نافذة إضافة مستخدم
function openAddUserModal() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addUserModal';
    
    // الحصول على قائمة الأدوار
    const roles = getRoles();
    const rolesOptions = Object.keys(roles).map(role => 
        `<option value="${role}">${roles[role].name}</option>`
    ).join('');
    
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
                            <input type="password" class="form-control" id="newPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <input type="password" class="form-control" id="newPasswordConfirm" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="newEmail">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الدور</label>
                            <select class="form-select" id="newRole" required>
                                ${rolesOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="newActive" checked>
                        <label class="form-check-label" for="newActive">تفعيل الحساب</label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('addUserModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="addUser()">إضافة مستخدم</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// إضافة مستخدم جديد
function addUser() {
    // الحصول على بيانات النموذج
    const username = document.getElementById('newUsername').value;
    const fullName = document.getElementById('newFullName').value;
    const password = document.getElementById('newPassword').value;
    const passwordConfirm = document.getElementById('newPasswordConfirm').value;
    const email = document.getElementById('newEmail').value;
    const role = document.getElementById('newRole').value;
    const active = document.getElementById('newActive').checked;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!username || !fullName || !password || !role) {
        createNotification('خطأ', 'يرجى تعبئة جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (password !== passwordConfirm) {
        createNotification('خطأ', 'كلمات المرور غير متطابقة', 'danger');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (email && !isValidEmail(email)) {
        createNotification('خطأ', 'البريد الإلكتروني غير صالح', 'danger');
        return;
    }
    
    // إنشاء المستخدم
    const userData = {
        username,
        fullName,
        password,
        email,
        role,
        active
    };
    
    const result = createUser(userData);
    
    if (result.success) {
        createNotification('نجاح', 'تم إضافة المستخدم بنجاح', 'success');
        closeModal('addUserModal');
        loadUsersList();
    } else {
        createNotification('خطأ', result.error, 'danger');
    }
}

// فتح نافذة تعديل مستخدم
function openEditUserModal(userId) {
    // الحصول على بيانات المستخدم
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editUserModal';
    
    // الحصول على قائمة الأدوار
    const roles = getRoles();
    const rolesOptions = Object.keys(roles).map(role => 
        `<option value="${role}" ${user.role === role ? 'selected' : ''}>${roles[role].name}</option>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تعديل المستخدم: ${user.username}</h2>
                <div class="modal-close" onclick="closeModal('editUserModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('editUserInfo', 'editUserModal')">معلومات المستخدم</div>
                    <div class="modal-tab" onclick="switchModalTab('changeUserPassword', 'editUserModal')">تغيير كلمة المرور</div>
                </div>
                
                <div class="modal-tab-content active" id="editUserInfo">
                    <form id="editUserForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">اسم المستخدم</label>
                                <input type="text" class="form-control" id="editUsername" value="${user.username}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">الاسم الكامل</label>
                                <input type="text" class="form-control" id="editFullName" value="${user.fullName}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="editEmail" value="${user.email || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">الدور</label>
                                <select class="form-select" id="editRole" required>
                                    ${rolesOptions}
                                </select>
                            </div>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="editActive" ${user.active ? 'checked' : ''}>
                            <label class="form-check-label" for="editActive">تفعيل الحساب</label>
                        </div>
                        <input type="hidden" id="editUserId" value="${user.id}">
                    </form>
                </div>
                
                <div class="modal-tab-content" id="changeUserPassword">
                    <form id="changePasswordForm">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة</label>
                            <input type="password" class="form-control" id="newUserPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <input type="password" class="form-control" id="newUserPasswordConfirm" required>
                        </div>
                        <div class="alert alert-warning">
                            <div class="alert-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <div class="alert-title">تنبيه</div>
                                <div class="alert-text">سيتم تغيير كلمة المرور بشكل مباشر دون الحاجة لكلمة المرور الحالية. تأكد من إبلاغ المستخدم بكلمة المرور الجديدة.</div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('editUserModal')">إلغاء</button>
                <button class="btn btn-primary" id="updateUserBtn" onclick="updateUserDetails()">حفظ التغييرات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة مستمعي الأحداث
    document.getElementById('updateUserBtn').addEventListener('click', function() {
        // التحقق من علامة التبويب النشطة
        const activeTab = document.querySelector('#editUserModal .modal-tab.active').textContent;
        if (activeTab.includes('كلمة المرور')) {
            resetUserPassword();
        } else {
            updateUserDetails();
        }
    });
}

// تحديث بيانات المستخدم
function updateUserDetails() {
    // الحصول على بيانات النموذج
    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    const active = document.getElementById('editActive').checked;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!username || !fullName || !role) {
        createNotification('خطأ', 'يرجى تعبئة جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (email && !isValidEmail(email)) {
        createNotification('خطأ', 'البريد الإلكتروني غير صالح', 'danger');
        return;
    }
    
    // تحديث المستخدم
    const userData = {
        username,
        fullName,
        email,
        role,
        active
    };
    
    const result = updateUser(userId, userData);
    
    if (result.success) {
        createNotification('نجاح', 'تم تحديث بيانات المستخدم بنجاح', 'success');
        closeModal('editUserModal');
        loadUsersList();
        
        // تحديث معلومات المستخدم إذا كان المستخدم الحالي
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            updateUserInfo();
        }
    } else {
        createNotification('خطأ', result.error, 'danger');
    }
}

// إعادة تعيين كلمة مرور المستخدم
function resetUserPassword() {
    // الحصول على بيانات النموذج
    const userId = document.getElementById('editUserId').value;
    const newPassword = document.getElementById('newUserPassword').value;
    const newPasswordConfirm = document.getElementById('newUserPasswordConfirm').value;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!newPassword || !newPasswordConfirm) {
        createNotification('خطأ', 'يرجى تعبئة جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (newPassword !== newPasswordConfirm) {
        createNotification('خطأ', 'كلمات المرور غير متطابقة', 'danger');
        return;
    }
    
    // التحقق من قوة كلمة المرور
    const settings = getSecuritySettings();
    if (settings.enforceStrongPassword && !isStrongPassword(newPassword)) {
        createNotification('خطأ', 'كلمة المرور غير قوية بما فيه الكفاية', 'danger');
        return;
    }
    
    // تحديث كلمة المرور مباشرة
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    addActivityLog({
        action: 'إعادة تعيين كلمة المرور',
        details: {
            userId: userId,
            username: users[userIndex].username
        }
    });
    
    createNotification('نجاح', 'تم تغيير كلمة المرور بنجاح', 'success');
    closeModal('editUserModal');
}

// تبديل حالة المستخدم
function toggleUserStatusUI(userId) {
    const result = toggleUserStatus(userId);
    
    if (result.success) {
        createNotification('نجاح', `تم ${result.active ? 'تفعيل' : 'إيقاف'} المستخدم بنجاح`, 'success');
        loadUsersList();
    } else {
        createNotification('خطأ', result.error, 'danger');
    }
}

// تأكيد حذف المستخدم
function confirmDeleteUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // التحقق من عدم حذف المستخدم الحالي
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        createNotification('خطأ', 'لا يمكن حذف المستخدم الحالي', 'danger');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) {
        const result = deleteUser(userId);
        
        if (result.success) {
            createNotification('نجاح', 'تم حذف المستخدم بنجاح', 'success');
            loadUsersList();
        } else {
            createNotification('خطأ', result.error, 'danger');
        }
    }
}

// ===================== إدارة الأدوار والصلاحيات =====================

// فتح نافذة إضافة دور
function openAddRoleModal() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addRoleModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إضافة دور جديد</h2>
                <div class="modal-close" onclick="closeModal('addRoleModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="addRoleForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم الدور</label>
                            <input type="text" class="form-control" id="newRoleName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">وصف الدور</label>
                            <input type="text" class="form-control" id="newRoleDescription">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الصلاحيات</label>
                        <div class="permissions-grid">
                            <div class="permission-item">
                                <input type="checkbox" id="perm_dashboard" checked>
                                <label for="perm_dashboard">لوحة التحكم</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_analytics">
                                <label for="perm_analytics">التحليلات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_investors">
                                <label for="perm_investors">المستثمرين</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_investments">
                                <label for="perm_investments">الاستثمارات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_profits">
                                <label for="perm_profits">الأرباح</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_operations">
                                <label for="perm_operations">العمليات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_reports">
                                <label for="perm_reports">التقارير</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_financial">
                                <label for="perm_financial">التقارير المالية</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_calendar">
                                <label for="perm_calendar">التقويم</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_settings">
                                <label for="perm_settings">الإعدادات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_security">
                                <label for="perm_security">الأمان</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="perm_users">
                                <label for="perm_users">المستخدمين</label>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('addRoleModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="addRole()">إضافة دور</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// إضافة دور جديد
function addRole() {
    // الحصول على بيانات النموذج
    const roleName = document.getElementById('newRoleName').value;
    const description = document.getElementById('newRoleDescription').value;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!roleName) {
        createNotification('خطأ', 'يرجى إدخال اسم الدور', 'danger');
        return;
    }
    
    // جمع الصلاحيات المحددة
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
        security: document.getElementById('perm_security').checked,
        users: document.getElementById('perm_users').checked
    };
    
    // إنشاء الدور
    const result = createRole(roleName, permissions, description);
    
    if (result.success) {
        createNotification('نجاح', `تم إنشاء الدور "${roleName}" بنجاح`, 'success');
        closeModal('addRoleModal');
        loadRolesList();
    } else {
        createNotification('خطأ', result.error, 'danger');
    }
}

// فتح نافذة تعديل دور
function openEditRoleModal(roleName) {
    // الحصول على بيانات الدور
    const roles = getRoles();
    const role = roles[roleName];
    
    if (!role) {
        createNotification('خطأ', 'الدور غير موجود', 'danger');
        return;
    }
    
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editRoleModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تعديل الدور: ${role.name}</h2>
                <div class="modal-close" onclick="closeModal('editRoleModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="editRoleForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم الدور</label>
                            <input type="text" class="form-control" id="editRoleName" value="${role.name}" ${roleName === 'admin' || roleName === 'user' ? 'readonly' : ''} required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">وصف الدور</label>
                            <input type="text" class="form-control" id="editRoleDescription" value="${role.description || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الصلاحيات</label>
                        <div class="permissions-grid">
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_dashboard" ${role.permissions.dashboard ? 'checked' : ''} ${roleName === 'admin' ? 'checked disabled' : ''}>
                                <label for="edit_perm_dashboard">لوحة التحكم</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_analytics" ${role.permissions.analytics ? 'checked' : ''}>
                                <label for="edit_perm_analytics">التحليلات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_investors" ${role.permissions.investors ? 'checked' : ''}>
                                <label for="edit_perm_investors">المستثمرين</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_investments" ${role.permissions.investments ? 'checked' : ''}>
                                <label for="edit_perm_investments">الاستثمارات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_profits" ${role.permissions.profits ? 'checked' : ''}>
                                <label for="edit_perm_profits">الأرباح</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_operations" ${role.permissions.operations ? 'checked' : ''}>
                                <label for="edit_perm_operations">العمليات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_reports" ${role.permissions.reports ? 'checked' : ''}>
                                <label for="edit_perm_reports">التقارير</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_financial" ${role.permissions.financial ? 'checked' : ''}>
                                <label for="edit_perm_financial">التقارير المالية</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_calendar" ${role.permissions.calendar ? 'checked' : ''}>
                                <label for="edit_perm_calendar">التقويم</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_settings" ${role.permissions.settings ? 'checked' : ''} ${roleName === 'admin' ? 'checked disabled' : ''}>
                                <label for="edit_perm_settings">الإعدادات</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_security" ${role.permissions.security ? 'checked' : ''} ${roleName === 'admin' ? 'checked disabled' : ''}>
                                <label for="edit_perm_security">الأمان</label>
                            </div>
                            <div class="permission-item">
                                <input type="checkbox" id="edit_perm_users" ${role.permissions.users ? 'checked' : ''} ${roleName === 'admin' ? 'checked disabled' : ''}>
                                <label for="edit_perm_users">المستخدمين</label>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="editRoleOriginalName" value="${roleName}">
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('editRoleModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="updateRole()">حفظ التغييرات</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// تحديث دور
function updateRole() {
    // الحصول على بيانات النموذج
    const originalRoleName = document.getElementById('editRoleOriginalName').value;
    const roleName = document.getElementById('editRoleName').value;
    const description = document.getElementById('editRoleDescription').value;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!roleName) {
        createNotification('خطأ', 'يرجى إدخال اسم الدور', 'danger');
        return;
    }
    
    // جمع الصلاحيات المحددة
    const permissions = {
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
        security: document.getElementById('edit_perm_security').checked,
        users: document.getElementById('edit_perm_users').checked
    };
    
    // تجهيز بيانات التحديث
    const updatedData = {
        name: roleName,
        description,
        permissions
    };
    
    // منع تغيير الأدوار الأساسية
    if ((originalRoleName === 'admin' || originalRoleName === 'user') && roleName !== originalRoleName) {
        createNotification('خطأ', 'لا يمكن تغيير اسم الأدوار الأساسية', 'danger');
        return;
    }
    
    // تحديث الدور
    const result = updateRole(originalRoleName, updatedData);
    
    if (result.success) {
        createNotification('نجاح', `تم تحديث الدور "${roleName}" بنجاح`, 'success');
        closeModal('editRoleModal');
        loadRolesList();
        
        // تحديث الصلاحيات للمستخدم الحالي
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === originalRoleName) {
            applyUserPermissions();
        }
    } else {
        createNotification('خطأ', result.error, 'danger');
    }
}

// تأكيد حذف الدور
function confirmDeleteRole(roleName) {
    // التحقق من عدم حذف الأدوار الأساسية
    if (roleName === 'admin' || roleName === 'user') {
        createNotification('خطأ', 'لا يمكن حذف الأدوار الأساسية', 'danger');
        return;
    }
    
    const roles = getRoles();
    const role = roles[roleName];
    
    if (!role) {
        createNotification('خطأ', 'الدور غير موجود', 'danger');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف الدور "${role.name}"؟`)) {
        const result = deleteRole(roleName);
        
        if (result.success) {
            createNotification('نجاح', 'تم حذف الدور بنجاح', 'success');
            loadRolesList();
        } else {
            createNotification('خطأ', result.error, 'danger');
        }
    }
}

// ===================== وظائف المساعدة =====================

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// إغلاق النافذة المحددة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// تبديل علامة تبويب في نافذة
function switchModalTab(tabId, modalId) {
    // إخفاء جميع علامات التبويب
    document.querySelectorAll(`#${modalId} .modal-tab-content`).forEach(tab => {
        tab.classList.remove('active');
    });
    
    // عرض علامة التبويب المحددة
    document.getElementById(tabId).classList.add('active');
    
    // تحديث العلامة النشطة
    document.querySelectorAll(`#${modalId} .modal-tab`).forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`#${modalId} .modal-tab[onclick="switchModalTab('${tabId}', '${modalId}')"]`).classList.add('active');
}

// ===================== الأنماط CSS =====================

/**
 * نظام الأمان المتكامل للتطبيق - الجزء الثاني (CSS وتكملة الوظائف)
 */

// ===================== تكملة الأنماط CSS للنظام الأمني =====================
const securityStyles = document.createElement('style');
securityStyles.textContent = `
    /* أنماط شاشة تسجيل الدخول */
    .login-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a237e, #0d47a1);
        z-index: 9999;
        direction: rtl;
    }
    
    .login-box {
        width: 400px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .login-header {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }
    
    .login-header h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }
    
    .login-header .app-icon {
        margin-bottom: 10px;
        font-size: 2.5rem;
        color: var(--primary-color, #3498db);
    }
    
    .login-form {
        padding: 20px;
    }
    
    .login-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
        text-align: center;
    }
    
    .login-footer {
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #eee;
        font-size: 0.8rem;
        color: #666;
    }
    
    .btn-block {
        width: 100%;
    }
    
    .password-input {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .toggle-password {
        position: absolute;
        left: 10px;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    /* أنماط صفحة الأمان */
    .security-tab-content {
        display: none;
        padding: 20px;
    }
    
    .security-tab-content.active {
        display: block;
    }
    
    .permissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    
    .permission-item {
        display: flex;
        align-items: center;
        padding: 5px;
        border-radius: 4px;
        background-color: #f9f9f9;
    }
    
    .permission-item input {
        margin-left: 10px;
    }
    
    /* أنماط الجدول للمستخدمين والأدوار */
    tr.current-user {
        background-color: rgba(52, 152, 219, 0.1);
    }
    
    .status {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .status.active {
        background-color: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
    }
    
    .status.inactive {
        background-color: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
    }
    
    /* أنماط تحذير انتهاء الجلسة */
    .session-timeout-warning {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        direction: rtl;
    }
    
    .session-timeout-content {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        padding: 20px;
        width: 400px;
        text-align: center;
    }
    
    .session-timeout-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
        color: #e74c3c;
    }
    
    .session-timeout-header i {
        font-size: 3rem;
        margin-bottom: 10px;
    }
    
    .session-timeout-header h3 {
        margin: 0;
    }
    
    .session-timeout-actions {
        margin-top: 20px;
    }
`;

// إضافة الأنماط إلى الصفحة
document.head.appendChild(securityStyles);

// ===================== وظائف إضافية للنظام الأمني =====================

// تصدير سجلات النشاط
function exportActivityLogs() {
    const logs = getActivityLogs();
    
    if (logs.length === 0) {
        createNotification('تنبيه', 'لا توجد سجلات نشاط للتصدير', 'warning');
        return;
    }
    
    // تنسيق البيانات
    const formattedLogs = logs.map(log => ({
        التاريخ_والوقت: new Date(log.timestamp).toLocaleString('ar-PS'),
        النشاط: log.activity,
        المستخدم: log.username,
        التفاصيل: JSON.stringify(log.details)
    }));
    
    // تحويل البيانات إلى CSV
    const header = Object.keys(formattedLogs[0]).join(',');
    const rows = formattedLogs.map(log => Object.values(log).map(value => `"${value}"`).join(','));
    const csv = [header, ...rows].join('\n');
    
    // إنشاء ملف للتنزيل
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_النشاطات_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    createNotification('نجاح', 'تم تصدير سجلات النشاط بنجاح', 'success');
}

// تنقية سجلات النشاط
function filterActivityLogs() {
    const filterType = document.getElementById('logFilterType').value;
    const filterUser = document.getElementById('logFilterUser').value.toLowerCase();
    
    // الحصول على سجلات النشاط
    let logs = getActivityLogs();
    
    // تطبيق التنقية
    if (filterType !== 'all') {
        logs = logs.filter(log => {
            let logType = log.activity.toLowerCase();
            return logType.includes(filterType);
        });
    }
    
    if (filterUser) {
        logs = logs.filter(log => log.username.toLowerCase().includes(filterUser));
    }
    
    // عرض النتائج المنقاة
    const logsTableBody = document.getElementById('activityLogsTableBody');
    if (!logsTableBody) return;
    
    // مسح المحتويات الحالية
    logsTableBody.innerHTML = '';
    
    if (logs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">لا توجد نتائج مطابقة</td>';
        logsTableBody.appendChild(row);
        return;
    }
    
    // إضافة صفوف الجدول
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        // تنسيق التاريخ
        const logDate = new Date(log.timestamp).toLocaleString('ar-PS');
        
        // تنسيق التفاصيل كنص
        let detailsText = '';
        if (log.details) {
            detailsText = Object.keys(log.details)
                .map(key => `${key}: ${log.details[key]}`)
                .join('، ');
        }
        
        row.innerHTML = `
            <td>${logDate}</td>
            <td>${log.activity}</td>
            <td>${log.username}</td>
            <td>${detailsText || '-'}</td>
        `;
        
        logsTableBody.appendChild(row);
    });
}

// مسح سجلات النشاط
function clearActivityLogs() {
    if (!confirm('هل أنت متأكد من مسح جميع سجلات النشاط؟ لا يمكن التراجع عن هذه العملية.')) {
        return;
    }
    
    localStorage.setItem('activityLogs', JSON.stringify([]));
    
    createNotification('نجاح', 'تم مسح سجلات النشاط بنجاح', 'success');
    
    loadActivityLogsList();
}

// ===================== صفحة تغيير كلمة المرور للمستخدم الحالي =====================

// إضافة صفحة تغيير كلمة المرور للمستخدم الحالي
function addChangePasswordPage() {
    // التحقق من وجود صفحة تغيير كلمة المرور
    if (document.getElementById('changePasswordContainer')) return;
    
    // التحقق من تسجيل الدخول
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // إضافة زر تغيير كلمة المرور إلى قائمة المستخدم
    const userInfo = document.querySelector('.sidebar-footer .user-info');
    if (userInfo) {
        const changePasswordBtn = document.createElement('div');
        changePasswordBtn.className = 'change-password-btn';
        changePasswordBtn.innerHTML = '<i class="fas fa-key"></i>';
        changePasswordBtn.title = 'تغيير كلمة المرور';
        changePasswordBtn.onclick = showChangePasswordForm;
        
        userInfo.parentNode.appendChild(changePasswordBtn);
    }
}

// عرض نموذج تغيير كلمة المرور
function showChangePasswordForm() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'changePasswordModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تغيير كلمة المرور</h2>
                <div class="modal-close" onclick="closeModal('changePasswordModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="changeMyPasswordForm">
                    <div class="form-group">
                        <label class="form-label">كلمة المرور الحالية</label>
                        <input type="password" class="form-control" id="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور الجديدة</label>
                        <input type="password" class="form-control" id="newPassword" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                        <input type="password" class="form-control" id="confirmNewPassword" required>
                    </div>
                    <div id="passwordStrength" class="password-strength">
                        <div class="strength-bar"></div>
                        <div class="strength-text">قوة كلمة المرور</div>
                    </div>
                    <div id="changePasswordError" class="form-error" style="display: none;"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('changePasswordModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="changeMyPassword()">تغيير كلمة المرور</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة مستمع لتحليل قوة كلمة المرور
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', analyzePasswordStrength);
    }
}

// تحليل قوة كلمة المرور
function analyzePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'قوة كلمة المرور';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    
    // طول كلمة المرور
    if (password.length >= 8) strength += 25;
    
    // التحقق من وجود أحرف كبيرة وصغيرة
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    
    // التحقق من وجود أرقام
    if (/\d/.test(password)) strength += 25;
    
    // التحقق من وجود رموز خاصة
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    // تحديد مستوى القوة والنص
    if (strength <= 25) {
        strengthBar.className = 'strength-bar weak';
        feedback = 'ضعيفة';
    } else if (strength <= 50) {
        strengthBar.className = 'strength-bar moderate';
        feedback = 'متوسطة';
    } else if (strength <= 75) {
        strengthBar.className = 'strength-bar strong';
        feedback = 'قوية';
    } else {
        strengthBar.className = 'strength-bar very-strong';
        feedback = 'قوية جداً';
    }
    
    strengthBar.style.width = `${strength}%`;
    strengthText.textContent = `قوة كلمة المرور: ${feedback}`;
}

// تغيير كلمة المرور للمستخدم الحالي
function changeMyPassword() {
    // الحصول على بيانات النموذج
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const errorElement = document.getElementById('changePasswordError');
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        errorElement.textContent = 'يرجى تعبئة جميع الحقول المطلوبة';
        errorElement.style.display = 'block';
        return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (newPassword !== confirmNewPassword) {
        errorElement.textContent = 'كلمات المرور غير متطابقة';
        errorElement.style.display = 'block';
        return;
    }
    
    // التحقق من عدم تطابق كلمة المرور الجديدة مع الحالية
    if (newPassword === currentPassword) {
        errorElement.textContent = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية';
        errorElement.style.display = 'block';
        return;
    }
    
    // التحقق من قوة كلمة المرور
    const settings = getSecuritySettings();
    if (settings.enforceStrongPassword && !isStrongPassword(newPassword)) {
        errorElement.textContent = 'كلمة المرور غير قوية بما فيه الكفاية. يجب أن تحتوي على 8 أحرف على الأقل وتتضمن أحرف كبيرة وصغيرة وأرقام ورموز خاصة.';
        errorElement.style.display = 'block';
        return;
    }
    
    // الحصول على المستخدم الحالي
    const currentUser = getCurrentUser();
    if (!currentUser) {
        errorElement.textContent = 'حدث خطأ. يرجى تسجيل الدخول مرة أخرى.';
        errorElement.style.display = 'block';
        return;
    }
    
    // تغيير كلمة المرور
    const result = changePassword(currentUser.id, currentPassword, newPassword);
    
    if (result.success) {
        createNotification('نجاح', 'تم تغيير كلمة المرور بنجاح', 'success');
        closeModal('changePasswordModal');
    } else {
        errorElement.textContent = result.error;
        errorElement.style.display = 'block';
    }
}

// ===================== تكامل نظام الأمان مع بقية التطبيق =====================

// إضافة زر تسجيل الخروج في الهيدر
function addHeaderLogoutButton() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    
    // التحقق من عدم وجود زر تسجيل الخروج
    if (headerActions.querySelector('.logout-header-btn')) return;
    
    const logoutBtn = document.createElement('div');
    logoutBtn.className = 'logout-header-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutBtn.title = 'تسجيل الخروج';
    logoutBtn.onclick = function() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            logout();
            displayLoginScreen();
        }
    };
    
    headerActions.appendChild(logoutBtn);
}

// إعادة تعريف وظيفة تسجيل الخروج في القائمة الجانبية
function redefineLogoutFunction() {
    const sidebarLogoutBtn = document.querySelector('.sidebar-footer .logout-btn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.onclick = function() {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                logout();
                displayLoginScreen();
            }
        };
    }
}

// تطبيق تقييد الوصول على وظائف التطبيق
function applyFunctionLevelPermissions() {
    // قائمة الوظائف المقيدة
    const restrictedFunctions = {
        // الإعدادات
        saveGeneralSettings: 'settings',
        saveInvestmentSettings: 'settings',
        saveProfileSettings: 'settings',
        saveNotificationSettings: 'settings',
        saveSystemSettings: 'settings',
        
        // المستثمرين
        saveInvestor: 'investors',
        updateInvestor: 'investors',
        deleteInvestor: 'investors',
        
        // الاستثمارات
        saveInvestment: 'investments',
        deleteInvestment: 'investments',
        
        // الأرباح
        savePayProfit: 'profits',
        
        // العمليات
        saveWithdrawal: 'operations',
        approveOperation: 'operations',
        deleteOperation: 'operations',
        
        // التقارير
        createReport: 'reports',
        saveReport: 'reports',
        deleteReport: 'reports',
        
        // التقارير المالية
        generateFinancialReport: 'financial'
    };
    
    // تخزين الوظائف الأصلية
    window.originalFunctions = {};
    
    // استبدال الوظائف المقيدة
    Object.keys(restrictedFunctions).forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            window.originalFunctions[funcName] = window[funcName];
            
            window[funcName] = function(...args) {
                // التحقق من الصلاحية
                if (!checkPermission(restrictedFunctions[funcName])) {
                    createNotification('خطأ', 'ليس لديك صلاحية للقيام بهذه العملية', 'danger');
                    return false;
                }
                
                // تنفيذ الوظيفة الأصلية
                return window.originalFunctions[funcName](...args);
            };
        }
    });
}

// تطبيق تقييد الوصول على أزرار واجهة المستخدم
function applyUIPermissions() {
    // تحديث واجهة المستخدم بناءً على صلاحيات المستخدم
    const applyUIPermissionsInterval = setInterval(() => {
        // التحقق من الصلاحيات على أزرار وعناصر معينة
        
        // أزرار المستثمرين
        if (!checkPermission('investors')) {
            document.querySelectorAll('button[onclick*="openAddInvestorModal"], button[onclick*="editInvestor"], button[onclick*="deleteInvestor"]')
                .forEach(btn => btn.disabled = true);
        }
        
        // أزرار الاستثمارات
        if (!checkPermission('investments')) {
            document.querySelectorAll('button[onclick*="openNewInvestmentModal"], button[onclick*="deleteInvestment"]')
                .forEach(btn => btn.disabled = true);
        }
        
        // أزرار الأرباح
        if (!checkPermission('profits')) {
            document.querySelectorAll('button[onclick*="openPayProfitModal"]')
                .forEach(btn => btn.disabled = true);
        }
        
        // أزرار العمليات
        if (!checkPermission('operations')) {
            document.querySelectorAll('button[onclick*="openWithdrawModal"], button[onclick*="approveOperation"], button[onclick*="deleteOperation"]')
                .forEach(btn => btn.disabled = true);
        }
        
        // أزرار التقارير
        if (!checkPermission('reports')) {
            document.querySelectorAll('button[onclick*="createReport"], button[onclick*="saveReport"], button[onclick*="deleteReport"]')
                .forEach(btn => btn.disabled = true);
        }
        
        // أزرار التقارير المالية
        if (!checkPermission('financial')) {
            document.querySelectorAll('button[onclick*="generateFinancialReport"]')
                .forEach(btn => btn.disabled = true);
        }
    }, 1000);
    
    // تخزين المؤقت لإيقافه عند تسجيل الخروج
    window.uiPermissionsInterval = applyUIPermissionsInterval;
}

// إعداد نافذة تشجيع تغيير كلمة المرور الافتراضية
function setupPasswordChangePrompt() {
    const currentUser = getCurrentUser();
    
    // التحقق من أن المستخدم يستخدم كلمة المرور الافتراضية
    if (currentUser && (currentUser.username === "00000000" && currentUser.password === "00000000")) {
        // إنشاء نافذة التنبيه
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'defaultPasswordModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">تغيير كلمة المرور</h2>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <div class="alert-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">تنبيه أمني</div>
                            <div class="alert-text">أنت تستخدم اسم المستخدم وكلمة المرور الافتراضية. يرجى تغييرها فورًا لحماية حسابك.</div>
                        </div>
                    </div>
                    <form id="changeDefaultPasswordForm">
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم الجديد</label>
                            <input type="text" class="form-control" id="newUsername" value="${currentUser.username}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة</label>
                            <input type="password" class="form-control" id="newDefaultPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <input type="password" class="form-control" id="confirmDefaultPassword" required>
                        </div>
                        <div id="defaultPasswordError" class="form-error" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" onclick="postponePasswordChange()">تأجيل</button>
                    <button class="btn btn-primary" onclick="changeDefaultPassword()">تغيير</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// تغيير كلمة المرور الافتراضية
function changeDefaultPassword() {
    // الحصول على بيانات النموذج
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newDefaultPassword').value;
    const confirmPassword = document.getElementById('confirmDefaultPassword').value;
    const errorElement = document.getElementById('defaultPasswordError');
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!newUsername || !newPassword || !confirmPassword) {
        errorElement.textContent = 'يرجى تعبئة جميع الحقول المطلوبة';
        errorElement.style.display = 'block';
        return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'كلمات المرور غير متطابقة';
        errorElement.style.display = 'block';
        return;
    }
    
    // التحقق من قوة كلمة المرور
    if (!isStrongPassword(newPassword)) {
        errorElement.textContent = 'كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل وتتضمن أحرف كبيرة وصغيرة وأرقام ورموز خاصة.';
        errorElement.style.display = 'block';
        return;
    }
    
    // الحصول على المستخدم الحالي
    const currentUser = getCurrentUser();
    if (!currentUser) {
        errorElement.textContent = 'حدث خطأ. يرجى تسجيل الدخول مرة أخرى.';
        errorElement.style.display = 'block';
        return;
    }
    
    // تحديث اسم المستخدم وكلمة المرور
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        errorElement.textContent = 'حدث خطأ في تحديث البيانات.';
        errorElement.style.display = 'block';
        return;
    }
    
    // تحديث اسم المستخدم وكلمة المرور
    users[userIndex].username = newUsername;
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    // تحديث الجلسة
    const session = JSON.parse(localStorage.getItem('currentSession') || '{}');
    session.username = newUsername;
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    // تسجيل النشاط
    addActivityLog({
        action: 'تغيير اسم المستخدم وكلمة المرور الافتراضية',
        username: newUsername,
        details: {
            oldUsername: currentUser.username
        }
    });
    
    // إغلاق النافذة
    closeModal('defaultPasswordModal');
    
    createNotification('نجاح', 'تم تغيير اسم المستخدم وكلمة المرور بنجاح', 'success');
    
    // تحديث معلومات المستخدم في الشريط الجانبي
    updateUserInfo();
}

// تأجيل تغيير كلمة المرور
function postponePasswordChange() {
    closeModal('defaultPasswordModal');
    
    // إنشاء إشعار تذكير
    createNotification('تذكير', 'تم تأجيل تغيير كلمة المرور. يرجى تغييرها في أقرب وقت ممكن من خلال إعدادات الأمان.', 'warning');
}

// ===================== دالة التهيئة الأساسية =====================

// تهيئة النظام الأمني
function initSecuritySystem() {
    // تهيئة البيانات الأولية
    initializeSecuritySystem();
    
    // عرض شاشة تسجيل الدخول
    displayLoginScreen();
    
    // إعداد مراقبة انتهاء الجلسة
    setupSessionTimeout();
    
    // إضافة زر تغيير كلمة المرور
    addChangePasswordPage();
    
    // إضافة زر تسجيل الخروج في الهيدر
    addHeaderLogoutButton();
    
    // إعادة تعريف وظيفة تسجيل الخروج في القائمة الجانبية
    redefineLogoutFunction();
    
    // تطبيق تقييد الوصول على مستوى الوظائف
    applyFunctionLevelPermissions();
    
    // تطبيق تقييد الوصول على مستوى واجهة المستخدم
    applyUIPermissions();
    
    // إعداد نافذة تشجيع تغيير كلمة المرور الافتراضية
    setTimeout(setupPasswordChangePrompt, 5000);
}

// تشغيل نظام الأمان عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function() {
    initSecuritySystem();
});

// ===================== أنماط CSS الإضافية =====================
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* أنماط أزرار تسجيل الخروج والأمان */
    .logout-header-btn {
        cursor: pointer;
        color: var(--gray-600);
        font-size: 1.2rem;
        margin-right: 15px;
        transition: all 0.3s ease;
    }
    
    .logout-header-btn:hover {
        color: var(--danger-color);
    }
    
    .change-password-btn {
        cursor: pointer;
        color: var(--gray-600);
        font-size: 1rem;
        margin-left: 10px;
        transition: all 0.3s ease;
    }
    
    .change-password-btn:hover {
        color: var(--primary-color);
    }
    
    /* أنماط قوة كلمة المرور */
    .password-strength {
        margin-top: 10px;
        margin-bottom: 20px;
    }
    
    .strength-bar {
        height: 5px;
        width: 0;
        background-color: #ddd;
        border-radius: 5px;
        transition: all 0.3s ease;
    }
    
    .strength-bar.weak {
        background-color: #e74c3c;
    }
    
    .strength-bar.moderate {
        background-color: #f39c12;
    }
    
    .strength-bar.strong {
        background-color: #3498db;
    }
    
    .strength-bar.very-strong {
        background-color: #2ecc71;
    }
    
    .strength-text {
        font-size: 0.8rem;
        color: var(--gray-600);
        margin-top: 5px;
    }
    
    /* أنماط رسائل الخطأ في النماذج */
    .form-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
    
    /* أنماط الأزرار المعطلة */
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    /* تحسينات على جدول المستخدمين */
    #usersTableBody tr:hover {
        background-color: var(--gray-100);
    }
    
    /* تحسينات على نافذة تأكيد تسجيل الخروج */
    .confirm-logout-modal {
        background: white;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        max-width: 400px;
        margin: auto;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .confirm-logout-icon {
        font-size: 3rem;
        color: var(--warning-color);
        margin-bottom: 20px;
    }
    
    .confirm-logout-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
    }
`;

// إضافة الأنماط إلى الصفحة
document.head.appendChild(additionalStyles);






/**
 * ملف صفحة تسجيل الدخول ومدير الجلسات
 * هذا الملف يحتوي على تنفيذ صفحة تسجيل الدخول وإدارة الجلسات
 * للنظام الأمني المتكامل للتطبيق
 */

// ===================== صفحة تسجيل الدخول =====================

// إنشاء صفحة تسجيل الدخول
function createLoginPage() {
    // إنشاء عنصر الصفحة
    const loginPage = document.createElement('div');
    loginPage.id = 'securityLoginPage';
    loginPage.className = 'security-login-page';
    
    loginPage.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <div class="app-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h1>نظام إدارة الاستثمار المتطور</h1>
                </div>
                <div class="login-form">
                    <div class="form-group">
                        <label for="loginUsername">اسم المستخدم</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="أدخل اسم المستخدم" autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">كلمة المرور</label>
                        <div class="password-input">
                            <input type="password" id="loginPassword" class="form-control" placeholder="أدخل كلمة المرور" autocomplete="current-password">
                            <button type="button" class="toggle-password" title="إظهار كلمة المرور" onclick="togglePasswordVisibility()">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="login-options">
                        <div class="remember-me">
                            <input type="checkbox" id="rememberMe">
                            <label for="rememberMe">تذكرني</label>
                        </div>
                        <div class="forgot-password">
                            <a href="javascript:void(0)" onclick="showForgotPasswordForm()">نسيت كلمة المرور؟</a>
                        </div>
                    </div>
                    <div class="login-error" id="loginErrorMessage" style="display: none;"></div>
                    <div class="form-group">
                        <button id="loginSubmitButton" class="btn btn-primary btn-block" onclick="processLogin()">
                            <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                        </button>
                    </div>
                </div>
                <div class="login-footer">
                    <div class="company-name">
                        <span>${settings.companyName || 'شركة الاستثمار العراقية'}</span>
                    </div>
                    <div class="version">الإصدار 1.0.0</div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى الجسم
    document.body.appendChild(loginPage);
    
    // إضافة مستمعي الأحداث
    setupLoginEventListeners();
    
    return loginPage;
}

// إعداد مستمعي الأحداث لصفحة تسجيل الدخول
function setupLoginEventListeners() {
    // مستمع لضغط Enter في حقل اسم المستخدم
    const usernameInput = document.getElementById('loginUsername');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginPassword').focus();
            }
        });
    }
    
    // مستمع لضغط Enter في حقل كلمة المرور
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                processLogin();
            }
        });
    }
}

// إظهار/إخفاء كلمة المرور
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// معالجة تسجيل الدخول
function processLogin() {
    // الحصول على بيانات النموذج
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorElement = document.getElementById('loginErrorMessage');
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!username || !password) {
        errorElement.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
        errorElement.style.display = 'block';
        
        // هز شاشة تسجيل الدخول
        const loginBox = document.querySelector('.login-box');
        loginBox.classList.add('shake');
        setTimeout(() => {
            loginBox.classList.remove('shake');
        }, 500);
        
        return;
    }
    
    // قفل زر تسجيل الدخول أثناء المعالجة
    const loginButton = document.getElementById('loginSubmitButton');
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    
    // محاكاة التأخير للتحقق (يمكن استبداله بطلب API حقيقي)
    setTimeout(() => {
        // التحقق من صحة بيانات الدخول
        const authResult = authenticate(username, password);
        
        if (authResult.success) {
            // تخزين الجلسة في Local Storage إذا تم تحديد "تذكرني"
            if (rememberMe) {
                localStorage.setItem('rememberSession', 'true');
                
                // تخزين المستخدم مشفرًا (في تطبيق حقيقي يمكن استخدام تشفير أقوى)
                const encodedUser = btoa(JSON.stringify({
                    username: username,
                    timestamp: new Date().getTime()
                }));
                localStorage.setItem('rememberedUser', encodedUser);
            } else {
                localStorage.removeItem('rememberSession');
                localStorage.removeItem('rememberedUser');
            }
            
            // إخفاء صفحة تسجيل الدخول
            const loginPage = document.getElementById('securityLoginPage');
            loginPage.classList.add('fade-out');
            
            // إظهار نافذة الترحيب
            showWelcomeOverlay(authResult.user);
            
            // إعداد تأخير للانتقال إلى التطبيق
            setTimeout(() => {
                loginPage.remove();
                initializeApp();
            }, 2000);
        } else {
            // إظهار رسالة الخطأ
            errorElement.textContent = authResult.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
            errorElement.style.display = 'block';
            
            // هز شاشة تسجيل الدخول
            const loginBox = document.querySelector('.login-box');
            loginBox.classList.add('shake');
            setTimeout(() => {
                loginBox.classList.remove('shake');
            }, 500);
            
            // إعادة تفعيل زر تسجيل الدخول
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
            
            // تسجيل محاولة الدخول الفاشلة
            logLoginAttempt(username, false);
        }
    }, 1000);
}

// عرض نافذة الترحيب
function showWelcomeOverlay(user) {
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    
    // الحصول على الوقت الحالي
    const currentHour = new Date().getHours();
    let greeting = '';
    
    if (currentHour >= 5 && currentHour < 12) {
        greeting = 'صباح الخير';
    } else if (currentHour >= 12 && currentHour < 17) {
        greeting = 'مساء الخير';
    } else {
        greeting = 'مساء الخير';
    }
    
    overlay.innerHTML = `
        <div class="welcome-content">
            <div class="welcome-icon">
                <i class="fas fa-user-circle"></i>
            </div>
            <h2>${greeting}, ${user.fullName || user.username}</h2>
            <p>مرحباً بك في نظام إدارة الاستثمار المتطور</p>
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // إزالة نافذة الترحيب بعد فترة
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    }, 2000);
}

// عرض نموذج نسيت كلمة المرور
function showForgotPasswordForm() {
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'forgotPasswordModal';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h2 class="modal-title">استعادة كلمة المرور</h2>
                <div class="modal-close" onclick="closeForgotPasswordModal()">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    <div class="alert-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">ملاحظة</div>
                        <div class="alert-text">يرجى التواصل مع مدير النظام لإعادة تعيين كلمة المرور. أو يمكنك إدخال اسم المستخدم الخاص بك للحصول على المساعدة.</div>
                    </div>
                </div>
                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label class="form-label">اسم المستخدم</label>
                        <input type="text" class="form-control" id="forgotPasswordUsername" required>
                    </div>
                    <div id="forgotPasswordError" class="form-error" style="display: none;"></div>
                    <div id="forgotPasswordSuccess" class="form-success" style="display: none;"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeForgotPasswordModal()">إلغاء</button>
                <button class="btn btn-primary" onclick="processForgotPassword()">إرسال</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// معالجة نسيت كلمة المرور
function processForgotPassword() {
    const username = document.getElementById('forgotPasswordUsername').value;
    const errorElement = document.getElementById('forgotPasswordError');
    const successElement = document.getElementById('forgotPasswordSuccess');
    
    if (!username) {
        errorElement.textContent = 'يرجى إدخال اسم المستخدم';
        errorElement.style.display = 'block';
        successElement.style.display = 'none';
        return;
    }
    
    // البحث عن المستخدم
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
        errorElement.textContent = 'اسم المستخدم غير موجود';
        errorElement.style.display = 'block';
        successElement.style.display = 'none';
        return;
    }
    
    // في تطبيق حقيقي، هنا سيتم إرسال بريد إلكتروني أو رسالة نصية
    // لكن في هذا المثال، سنعرض فقط رسالة نجاح
    
    errorElement.style.display = 'none';
    successElement.textContent = 'تم إرسال تعليمات استعادة كلمة المرور. يرجى التحقق من بريدك الإلكتروني.';
    successElement.style.display = 'block';
    
    // تسجيل النشاط
    addActivityLog({
        action: 'طلب استعادة كلمة المرور',
        username: username,
        details: {
            email: user.email || 'غير متوفر'
        }
    });
    
    // إغلاق النافذة بعد فترة
    setTimeout(() => {
        closeForgotPasswordModal();
    }, 3000);
}

// إغلاق نافذة نسيت كلمة المرور
function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.remove();
    }
}

// تسجيل محاولة الدخول
function logLoginAttempt(username, success) {
    // تخزين محاولات تسجيل الدخول في Local Storage
    let loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    
    // إضافة محاولة جديدة
    loginAttempts.push({
        username,
        success,
        timestamp: new Date().toISOString(),
        ip: 'local' // في تطبيق حقيقي يمكن الحصول على IP من الخادم
    });
    
    // الاحتفاظ بآخر 50 محاولة فقط
    if (loginAttempts.length > 50) {
        loginAttempts = loginAttempts.slice(-50);
    }
    
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    
    // التحقق من تجاوز عدد المحاولات المسموح بها
    checkLoginAttempts(username);
}

// التحقق من تجاوز عدد محاولات تسجيل الدخول
function checkLoginAttempts(username) {
    if (!username) return;
    
    const settings = getSecuritySettings();
    const maxAttempts = settings.loginAttempts || 5;
    
    // الحصول على محاولات تسجيل الدخول
    const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    
    // تصفية المحاولات الفاشلة للمستخدم الحالي في آخر ساعة
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recentFailedAttempts = loginAttempts.filter(attempt => 
        attempt.username === username && 
        !attempt.success && 
        new Date(attempt.timestamp) > oneHourAgo
    );
    
    // التحقق من تجاوز الحد الأقصى
    if (recentFailedAttempts.length >= maxAttempts) {
        // قفل الحساب مؤقتًا
        lockUserAccount(username);
    }
}

// قفل حساب المستخدم مؤقتًا
function lockUserAccount(username) {
    // الحصول على المستخدم
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) return;
    
    // تحديث حالة القفل
    users[userIndex].lockedUntil = getLockExpiry();
    saveUsers(users);
    
    // تسجيل النشاط
    addActivityLog({
        action: 'قفل حساب المستخدم',
        username,
        details: {
            reason: 'تجاوز عدد محاولات تسجيل الدخول',
            lockedUntil: users[userIndex].lockedUntil
        }
    });
}

// الحصول على وقت انتهاء القفل
function getLockExpiry() {
    const settings = getSecuritySettings();
    const lockDuration = settings.lockDuration || 15; // بالدقائق
    
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + lockDuration);
    
    return expiryTime.toISOString();
}

// ===================== مدير الجلسات =====================

// التحقق من جلسة "تذكرني"
function checkRememberSession() {
    if (localStorage.getItem('rememberSession') === 'true') {
        const rememberedUser = localStorage.getItem('rememberedUser');
        
        if (rememberedUser) {
            try {
                // فك تشفير بيانات المستخدم (في تطبيق حقيقي يمكن استخدام تشفير أقوى)
                const userData = JSON.parse(atob(rememberedUser));
                
                // التحقق من صلاحية الفترة (مثلاً 30 يوم)
                const timestamp = userData.timestamp;
                const currentTime = new Date().getTime();
                const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 يوم بالمللي ثانية
                
                if (currentTime - timestamp <= maxAge) {
                    // تسجيل الدخول تلقائيًا
                    const username = userData.username;
                    
                    // الحصول على كلمة المرور (في تطبيق حقيقي، لا ينبغي تخزين كلمات المرور بهذه الطريقة)
                    const users = getUsers();
                    const user = users.find(u => u.username === username);
                    
                    if (user) {
                        // تسجيل الدخول تلقائيًا
                        const authResult = authenticate(username, user.password);
                        
                        if (authResult.success) {
                            // إخفاء صفحة تسجيل الدخول إذا كانت موجودة
                            const loginPage = document.getElementById('securityLoginPage');
                            if (loginPage) {
                                loginPage.remove();
                            }
                            
                            // تهيئة التطبيق
                            initializeApp();
                            
                            // إظهار إشعار
                            createNotification('تم تسجيل الدخول تلقائيًا', `مرحباً بعودتك، ${user.fullName || user.username}`, 'info');
                            
                            return true;
                        }
                    }
                }
            } catch (error) {
                console.error('خطأ في فك تشفير بيانات المستخدم:', error);
            }
        }
    }
    
    return false;
}

// معالجة تسجيل الخروج
function handleLogout() {
    // تسجيل النشاط
    const currentUser = getCurrentUser();
    if (currentUser) {
        addActivityLog({
            action: 'تسجيل الخروج',
            username: currentUser.username,
            details: {
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // تسجيل الخروج
    logout();
    
    // حذف بيانات "تذكرني" إذا طلب المستخدم
    if (confirm('هل ترغب في إلغاء تسجيل الدخول التلقائي؟')) {
        localStorage.removeItem('rememberSession');
        localStorage.removeItem('rememberedUser');
    }
    
    // عرض شاشة تسجيل الدخول
    createLoginPage();
}

// ===================== مدير الأمان المتقدم =====================

// إنشاء وتهيئة مؤقت قفل الشاشة
function setupScreenLockTimer() {
    const settings = getSecuritySettings();
    if (!settings.autoLogout) return;
    
    let inactivityTime = 0;
    const checkInterval = 60; // بالثواني
    const timeoutMinutes = settings.sessionTimeout || 30; // بالدقائق
    const timeoutSeconds = timeoutMinutes * 60;
    
    // إعادة تعيين المؤقت عند حدوث نشاط
    const resetTimer = () => {
        inactivityTime = 0;
        
        // إخفاء تحذير الخمول إذا كان ظاهرًا
        const idleWarning = document.getElementById('idleTimeoutWarning');
        if (idleWarning) {
            idleWarning.remove();
        }
    };
    
    // إضافة مستمعي الأحداث لإعادة تعيين المؤقت
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('click', resetTimer);
    document.addEventListener('scroll', resetTimer);
    
    // بدء المؤقت
    const inactivityInterval = setInterval(() => {
        inactivityTime += checkInterval;
        
        // عرض تحذير قبل انتهاء الجلسة
        if (inactivityTime >= timeoutSeconds - 60 && inactivityTime < timeoutSeconds) {
            showIdleTimeoutWarning(timeoutSeconds - inactivityTime);
        }
        
        // قفل الشاشة عند انتهاء الوقت
        if (inactivityTime >= timeoutSeconds) {
            clearInterval(inactivityInterval);
            handleAutoLogout();
        }
    }, checkInterval * 1000);
    
    // تخزين المؤقت في النافذة لإيقافه عند تسجيل الخروج
    window.screenLockTimer = inactivityInterval;
}

// عرض تحذير الخمول
function showIdleTimeoutWarning(remainingSeconds) {
    // التحقق من عدم وجود تحذير سابق
    if (document.getElementById('idleTimeoutWarning')) return;
    
    const warningDiv = document.createElement('div');
    warningDiv.id = 'idleTimeoutWarning';
    warningDiv.className = 'idle-timeout-warning';
    
    warningDiv.innerHTML = `
        <div class="idle-timeout-content">
            <div class="idle-timeout-header">
                <i class="fas fa-clock"></i>
                <h3>تنبيه الخمول</h3>
            </div>
            <p>سيتم تسجيل خروجك تلقائيًا بعد <span id="idleCountdown">${Math.ceil(remainingSeconds)}</span> ثانية بسبب عدم النشاط.</p>
            <div class="idle-timeout-actions">
                <button class="btn btn-primary" onclick="document.getElementById('idleTimeoutWarning').remove();">
                    استمرار
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // تحديث العد التنازلي
    const countdownElement = document.getElementById('idleCountdown');
    let countdown = Math.ceil(remainingSeconds);
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // تخزين المؤقت في العنصر لإيقافه عند إغلاق التحذير
    warningDiv.countdownInterval = countdownInterval;
}

// معالجة تسجيل الخروج التلقائي
function handleAutoLogout() {
    // إزالة أي تحذيرات موجودة
    const idleWarning = document.getElementById('idleTimeoutWarning');
    if (idleWarning) {
        if (idleWarning.countdownInterval) {
            clearInterval(idleWarning.countdownInterval);
        }
        idleWarning.remove();
    }
    
    // تسجيل النشاط
    const currentUser = getCurrentUser();
    if (currentUser) {
        addActivityLog({
            action: 'تسجيل خروج تلقائي',
            username: currentUser.username,
            details: {
                reason: 'عدم النشاط',
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // تسجيل الخروج
    logout();
    
    // عرض رسالة تسجيل الخروج
    const logoutMessage = document.createElement('div');
    logoutMessage.className = 'auto-logout-message';
    
    logoutMessage.innerHTML = `
        <div class="auto-logout-content">
            <div class="auto-logout-icon">
                <i class="fas fa-user-clock"></i>
            </div>
            <h2>تم تسجيل الخروج تلقائيًا</h2>
            <p>تم تسجيل خروجك تلقائيًا بسبب عدم النشاط لفترة طويلة.</p>
            <button class="btn btn-primary" onclick="this.parentNode.parentNode.remove(); createLoginPage();">
                تسجيل الدخول
            </button>
        </div>
    `;
    
    document.body.appendChild(logoutMessage);
}

// ===================== واجهة إدارة المستخدمين والأدوار =====================

// عرض واجهة إدارة المستخدمين
function showUserManagementInterface() {
    // التحقق من وجود صلاحية إدارة المستخدمين
    if (!checkPermission('users')) {
        createNotification('خطأ', 'ليس لديك صلاحية للوصول إلى إدارة المستخدمين', 'danger');
        return;
    }
    
    // تحميل قائمة المستخدمين
    loadUsersList();
}

// عرض واجهة إدارة الأدوار
function showRoleManagementInterface() {
    // التحقق من وجود صلاحية إدارة الأدوار
    if (!checkPermission('security')) {
        createNotification('خطأ', 'ليس لديك صلاحية للوصول إلى إدارة الأدوار', 'danger');
        return;
    }
    
    // تحميل قائمة الأدوار
    loadRolesList();
}

// ===================== أنماط CSS الإضافية =====================
const loginStylesElement = document.createElement('style');
loginStylesElement.textContent = `
    /* أنماط صفحة تسجيل الدخول */
    .security-login-page {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f5f5f5;
        z-index: 9999;
        direction: rtl;
    }
    
    .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #1a237e, #0d47a1);
    }
    
    .login-box {
        width: 400px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .login-header {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }
    
    .login-header h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }
    
    .login-header .app-icon {
        margin-bottom: 10px;
        font-size: 2.5rem;
        color: var(--primary-color, #3498db);
    }
    
    .login-form {
        padding: 20px;
    }
    
    .login-options {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
    
    .remember-me {
        display: flex;
        align-items: center;
    }
    
    .remember-me input {
        margin-left: 5px;
    }
    
    .forgot-password a {
        color: var(--primary-color, #3498db);
        text-decoration: none;
    }
    
    .login-error {
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
        text-align: center;
    }
    
    .login-footer {
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #eee;
        font-size: 0.8rem;
        color: #666;
        background-color: #f5f5f5;
    }
    
    /* أنماط نافذة الترحيب */
    .welcome-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        direction: rtl;
        opacity: 1;
        transition: opacity 0.5s ease;
    }
    
    .welcome-overlay.fade-out {
        opacity: 0;
    }
    
    .welcome-content {
        text-align: center;
    }
    
    .welcome-icon {
        font-size: 5rem;
        margin-bottom: 20px;
        color: var(--primary-color, #3498db);
    }
    
    .welcome-content h2 {
        margin-bottom: 10px;
        font-size: 2rem;
    }
    
    .welcome-content p {
        margin-bottom: 20px;
        font-size: 1.2rem;
        opacity: 0.8;
    }
    
    .loading-spinner {
        margin-top: 30px;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* أنماط نافذة نسيت كلمة المرور */
    .form-success {
        background-color: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
    
    /* أنماط تحذير الخمول */
    .idle-timeout-warning {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        overflow: hidden;
        direction: rtl;
        width: 400px;
    }
    
    .idle-timeout-content {
        padding: 20px;
    }
    
    .idle-timeout-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        color: #e74c3c;
    }
    
    .idle-timeout-header i {
        font-size: 1.5rem;
        margin-left: 10px;
    }
    
    .idle-timeout-header h3 {
        margin: 0;
    }
    
    .idle-timeout-actions {
        margin-top: 15px;
        text-align: left;
    }
    
    #idleCountdown {
        font-weight: bold;
        color: #e74c3c;
    }
    
    /* أنماط رسالة تسجيل الخروج التلقائي */
    .auto-logout-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        direction: rtl;
    }
    
    .auto-logout-content {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        padding: 30px;
        width: 400px;
        text-align: center;
    }
    
    .auto-logout-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        color: #e74c3c;
    }
    
    .auto-logout-content h2 {
        margin-bottom: 15px;
    }
    
    .auto-logout-content p {
        margin-bottom: 25px;
        color: #666;
    }
`;

// إضافة الأنماط إلى الصفحة
document.head.appendChild(loginStylesElement);

// ===================== تهيئة نظام تسجيل الدخول =====================

// دالة تهيئة نظام تسجيل الدخول
function initLoginSystem() {
    // تهيئة البيانات الأولية
    initializeSecuritySystem();
    
    // التحقق من وجود جلسة "تذكرني" نشطة
    if (!checkRememberSession()) {
        // عرض صفحة تسجيل الدخول
        createLoginPage();
    }
}

// تهيئة النظام عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function() {
    // بدء نظام تسجيل الدخول
    initLoginSystem();
});