// securitySystem.js - نظام الأمان والمصادقة المتطور للتطبيق
// تم تحديثه لدعم واجهة تسجيل دخول جديدة، نظام صلاحيات متقدم، وإعدادات أمان إضافية

// قاعدة بيانات المستخدمين (في التطبيق الحقيقي يجب تخزين هذه البيانات بشكل آمن)
let users = [
    {
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        fullName: 'المدير',
        role: 'admin',
        lastLogin: null,
        failedLoginAttempts: 0,
        isLocked: false,
        email: 'admin@example.com',
        createdAt: new Date().toISOString(),
        permissions: {
            // الصفحات الرئيسية
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
            
            // إدارة المستثمرين
            viewInvestors: true,
            addInvestor: true,
            editInvestor: true,
            deleteInvestor: true,
            exportInvestors: true,
            importInvestors: true,
            
            // إدارة الاستثمارات
            viewInvestments: true,
            addInvestment: true,
            editInvestment: true,
            deleteInvestment: true,
            
            // إدارة العمليات المالية
            viewOperations: true,
            approveOperations: true,
            rejectOperations: true,
            withdrawals: true,
            
            // الأرباح والدفعات
            viewProfits: true,
            payProfits: true,
            
            // التقارير
            viewReports: true,
            generateReports: true,
            exportReports: true,
            
            // الإعدادات
            viewSettings: true,
            editSettings: true,
            
            // النظام
            backup: true,
            restore: true,
            userManagement: true,
            activityLog: true,
            systemSettings: true
        }
    },
    {
        id: 'user1',
        username: 'user1',
        password: 'user123',
        fullName: 'موظف',
        role: 'user',
        lastLogin: null,
        failedLoginAttempts: 0,
        isLocked: false,
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
        permissions: {
            // الصفحات الرئيسية
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
            
            // إدارة المستثمرين
            viewInvestors: true,
            addInvestor: false,
            editInvestor: false,
            deleteInvestor: false,
            exportInvestors: false,
            importInvestors: false,
            
            // إدارة الاستثمارات
            viewInvestments: true,
            addInvestment: false,
            editInvestment: false,
            deleteInvestment: false,
            
            // إدارة العمليات المالية
            viewOperations: false,
            approveOperations: false,
            rejectOperations: false,
            withdrawals: false,
            
            // الأرباح والدفعات
            viewProfits: false,
            payProfits: false,
            
            // التقارير
            viewReports: false,
            generateReports: false,
            exportReports: false,
            
            // الإعدادات
            viewSettings: false,
            editSettings: false,
            
            // النظام
            backup: false,
            restore: false,
            userManagement: false,
            activityLog: false,
            systemSettings: false
        }
    }
];

// المستخدم الحالي المسجل دخوله
let currentUser = null;

// عدد المحاولات الأقصى لتسجيل الدخول
const MAX_LOGIN_ATTEMPTS = 5;

// مدة الجلسة الافتراضية بالدقائق
const DEFAULT_SESSION_DURATION = 30;

// سجل الأنشطة
let activityLog = [];



/**
 * وظيفة محسنة لتهيئة نظام الأمان
 */
function initSecuritySystem() {
    console.log("بدء تهيئة نظام الأمان");
    
    // التحقق من وجود مستخدم مسجل دخوله في الجلسة
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log("تم العثور على مستخدم محفوظ:", currentUser.username);
        
        // تطبيق الصلاحيات
        applyUserPermissions(currentUser);
        updateUIWithUserInfo(currentUser);
        
        // تسجيل نشاط تسجيل الدخول التلقائي
        logActivity('login', 'تسجيل دخول تلقائي من الجلسة المحفوظة', currentUser.id);
        
        // إضافة زر الأمان إلى الشريط الجانبي (للمسؤول فقط)
        if (currentUser.role === 'admin') {
            addSecuritySidebarButton();
            console.log("تمت إضافة زر الأمان للمسؤول");
        }
    } else {
        // عرض شاشة تسجيل الدخول
        showLoginScreen();
        console.log("تم عرض شاشة تسجيل الدخول - لا يوجد مستخدم محفوظ");
    }
    
    // تحميل المستخدمين من التخزين المحلي
    loadUsers();
    
    // إعداد مراقبة انتهاء الجلسة
    setupSessionTimeout();
    
    // تهيئة مستمعات الأحداث لنظام الأمان
    initSecurityEventListeners();
    
    // مراقبة تحميل العناصر الديناميكية
    setupDynamicContentObserver();
    
    console.log("اكتملت تهيئة نظام الأمان");
}

// تهيئة مستمعات الأحداث لنظام الأمان
function initSecurityEventListeners() {
    // استمع لأحداث النقر على زر تسجيل الخروج
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'logoutButton') {
            e.preventDefault();
            logout();
        }
    });
    
    // استمع لتغيير السمة المظلمة
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
}

// عرض شاشة تسجيل الدخول المحدثة
function showLoginScreen() {
    // إنشاء طبقة تسجيل الدخول
    const loginOverlay = document.createElement('div');
    loginOverlay.id = 'loginOverlay';
    loginOverlay.className = 'login-overlay';
    
    // الحصول على تاريخ اليوم
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    loginOverlay.innerHTML = `
        <div class="login-container">
            <div class="login-header">
                <div class="login-logo">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h1 class="login-title">اداره الاستثمار السعبري<br><span style="font-size:1.2rem;font-weight:400;">Al-Saabri Investment Management</span></h1>
                <p class="login-subtitle">إدارة الاستثمارات، المستثمرين، والأرباح بكل سهولة</p>
            </div>
            <div class="login-split">
                <div class="login-info">
                    <div class="login-info-content">
                        <h2>مرحباً بك في اداره الاستثمار السعبري<br><span style="font-size:1rem;font-weight:400;">Welcome to Al-Saabri Investment Management</span></h2>
                        <p class="date-display"><i class="far fa-calendar-alt"></i> ${formattedDate}</p>
                        <div class="login-features">
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="feature-text">
                                    <h3>إدارة المستثمرين</h3>
                                    <p>تتبع بيانات المستثمرين ومعلوماتهم الشخصية</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="fas fa-money-bill-wave"></i>
                                </div>
                                <div class="feature-text">
                                    <h3>متابعة الاستثمارات</h3>
                                    <p>إدارة الاستثمارات وتتبع الأرباح بكل سهولة</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="fas fa-chart-pie"></i>
                                </div>
                                <div class="feature-text">
                                    <h3>تقارير متطورة</h3>
                                    <p>تحليلات ورسوم بيانية لأداء الاستثمارات</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                                <div class="feature-text">
                                    <h3>نظام أمان متكامل</h3>
                                    <p>إدارة صلاحيات المستخدمين والحماية المتقدمة</p>
                                </div>
                            </div>
                        </div>
                        <div class="login-version">
                            <p>الإصدار 2.0.0</p>
                        </div>
                    </div>
                </div>
                <div class="login-form-container">
                    <div class="login-form">
                        <h2>تسجيل الدخول</h2>
                        <p class="login-description">أدخل بيانات تسجيل الدخول للوصول إلى النظام</p>
                        <form id="loginForm" onsubmit="return securitySystem.attemptLogin(event)">
                            <div class="form-group">
                                <label for="username"><i class="fas fa-user"></i> اسم المستخدم</label>
                                <input type="text" id="username" class="form-control" placeholder="أدخل اسم المستخدم" required autocomplete="username">
                            </div>
                            <div class="form-group">
                                <label for="password"><i class="fas fa-lock"></i> كلمة المرور</label>
                                <div class="password-input-container">
                                    <input type="password" id="password" class="form-control" placeholder="أدخل كلمة المرور" required autocomplete="current-password">
                                    <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordVisibility()">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group remember-me">
                                <div class="form-check">
                                    <input type="checkbox" id="rememberMe" class="form-check-input">
                                    <label for="rememberMe" class="form-check-label">تذكرني</label>
                                </div>
                                <a href="#" onclick="securitySystem.showForgotPasswordForm()" class="forgot-password">نسيت كلمة المرور؟</a>
                            </div>
                            <div class="form-group" id="loginError" style="color: var(--danger-color); display: none;">
                                <p><i class="fas fa-exclamation-circle"></i> اسم المستخدم أو كلمة المرور غير صحيحة</p>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                                </button>
                            </div>
                        </form>
                        <div class="login-help">
                            <p>لديك مشكلة في تسجيل الدخول؟ <a href="#" onclick="securitySystem.showHelpInfo()">اضغط هنا للمساعدة</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="login-footer">
                <p>جميع الحقوق محفوظة &copy; ${today.getFullYear()} - نظام إدارة الاستثمار المتطور</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(loginOverlay);
    
    // إضافة CSS المحسن لشاشة تسجيل الدخول
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            width: 1000px;
            max-width: 95%;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .login-header {
            background: linear-gradient(135deg, #3498db, #1a5276);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .login-logo {
            font-size: 3.5rem;
            margin-bottom: 15px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .login-title {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .login-subtitle {
            margin-top: 10px;
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .login-split {
            display: flex;
            flex-direction: row;
        }
        
        .login-info {
            flex: 1;
            background-color: #f9f9f9;
            padding: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .login-info::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(52, 152, 219, 0.05) 0%, rgba(52, 152, 219, 0) 70%);
            z-index: 0;
        }
        
        .login-info-content {
            position: relative;
            z-index: 1;
        }
        
        .login-info h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        
        .date-display {
            color: #7f8c8d;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        
        .login-features {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
        }
        
        .feature-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-left: 15px;
        }
        
        .feature-text h3 {
            margin: 0 0 5px 0;
            color: #34495e;
            font-size: 1.1rem;
        }
        
        .feature-text p {
            margin: 0;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .login-version {
            color: #95a5a6;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 20px;
        }
        
        .login-form-container {
            flex: 1;
            padding: 40px;
            display: flex;
            align-items: center;
        }
        
        .login-form {
            width: 100%;
        }
        
        .login-form h2 {
            margin-top: 0;
            text-align: center;
            margin-bottom: 10px;
            color: #2c3e50;
            font-size: 1.8rem;
        }
        
        .login-description {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 25px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #34495e;
            font-weight: 600;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #dce4ec;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-control:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        .password-input-container {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #95a5a6;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .password-toggle:hover {
            color: #7f8c8d;
        }
        
        .remember-me {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .form-check {
            display: flex;
            align-items: center;
        }
        
        .form-check-input {
            margin-left: 8px;
        }
        
        .form-check-label {
            font-weight: normal;
            margin: 0;
        }
        
        .forgot-password {
            color: #3498db;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-password:hover {
            text-decoration: underline;
        }
        
        .btn-block {
            width: 100%;
            padding: 12px;
            font-size: 1rem;
            transition: background-color 0.3s, transform 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: none;
            color: white;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #2980b9, #2471a3);
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        
        .login-help {
            text-align: center;
            margin-top: 25px;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .login-help a {
            color: #3498db;
            text-decoration: none;
        }
        
        .login-help a:hover {
            text-decoration: underline;
        }
        
        .login-footer {
            background-color: #f5f7fa;
            padding: 15px;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9rem;
            border-top: 1px solid #e7e7e7;
        }
        
        #loginError {
            background-color: rgba(231, 76, 60, 0.1);
            border-right: 3px solid #e74c3c;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 0.9rem;
            animation: shake 0.5s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* تصميم متجاوب */
        @media (max-width: 900px) {
            .login-split {
                flex-direction: column;
            }
            
            .login-info, .login-form-container {
                width: 100%;
                padding: 20px;
            }
            
            .login-features {
                margin-bottom: 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // تركيز الإدخال على اسم المستخدم
    setTimeout(() => {
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }
    }, 500);
}

// إظهار/إخفاء كلمة المرور
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// إظهار نموذج "نسيت كلمة المرور"
function showForgotPasswordForm() {
    // إضافة نافذة منبثقة لاستعادة كلمة المرور
    const forgotPasswordModal = document.createElement('div');
    forgotPasswordModal.className = 'modal-overlay active';
    forgotPasswordModal.id = 'forgotPasswordModal';
    
    forgotPasswordModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title"><i class="fas fa-key"></i> استعادة كلمة المرور</h2>
                <div class="modal-close" onclick="closeModal('forgotPasswordModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    <div class="alert-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">معلومات</div>
                        <div class="alert-text">أدخل اسم المستخدم أو البريد الإلكتروني المرتبط بحسابك لإعادة تعيين كلمة المرور.</div>
                    </div>
                </div>
                <form id="forgotPasswordForm" onsubmit="securitySystem.resetPassword(event)">
                    <div class="form-group">
                        <label for="resetUsername">اسم المستخدم أو البريد الإلكتروني</label>
                        <input type="text" class="form-control" id="resetUsername" required>
                    </div>
                    <div class="form-group" id="resetError" style="color: var(--danger-color); display: none;">
                        <p><i class="fas fa-exclamation-circle"></i> <span id="resetErrorMessage"></span></p>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('forgotPasswordModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="securitySystem.resetPassword(event)">
                    <i class="fas fa-paper-plane"></i> إرسال طلب الاستعادة
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(forgotPasswordModal);
}

// إعادة تعيين كلمة المرور
function resetPassword(event) {
    if (event) event.preventDefault();
    
    const username = document.getElementById('resetUsername').value;
    
    // التحقق من وجود اسم المستخدم أو البريد الإلكتروني
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
        const resetError = document.getElementById('resetError');
        const resetErrorMessage = document.getElementById('resetErrorMessage');
        
        if (resetError && resetErrorMessage) {
            resetErrorMessage.textContent = 'اسم المستخدم أو البريد الإلكتروني غير موجود';
            resetError.style.display = 'block';
        }
        return;
    }
    
    // في التطبيق الحقيقي، هنا سيتم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
    // لكن في هذا المثال، سنقوم بإغلاق النافذة وعرض إشعار نجاح
    
    closeModal('forgotPasswordModal');
    
    createNotification('تم الإرسال بنجاح', 'تم إرسال طلب إعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني.', 'success');
}

// عرض معلومات المساعدة
function showHelpInfo() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal-overlay active';
    helpModal.id = 'helpModal';
    
    helpModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title"><i class="fas fa-question-circle"></i> مساعدة تسجيل الدخول</h2>
                <div class="modal-close" onclick="closeModal('helpModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <div class="help-section">
                    <h3><i class="fas fa-user"></i> تسجيل الدخول للمرة الأولى</h3>
                    <p>إذا كنت تستخدم النظام للمرة الأولى، يرجى التواصل مع مسؤول النظام للحصول على بيانات تسجيل الدخول.</p>
                </div>
                <div class="help-section">
                    <h3><i class="fas fa-key"></i> نسيت كلمة المرور</h3>
                    <p>إذا نسيت كلمة المرور، يمكنك النقر على رابط "نسيت كلمة المرور" واتباع الخطوات لإعادة تعيينها.</p>
                </div>
                <div class="help-section">
                    <h3><i class="fas fa-lock"></i> حساب مغلق</h3>
                    <p>إذا تم إغلاق حسابك بسبب محاولات تسجيل دخول فاشلة متكررة، يرجى التواصل مع مسؤول النظام.</p>
                </div>
                <div class="help-section">
                    <h3><i class="fas fa-cogs"></i> مشاكل تقنية</h3>
                    <p>إذا كنت تواجه مشاكل تقنية في تسجيل الدخول، يرجى التأكد من تحديث المتصفح وتفعيل JavaScript.</p>
                </div>
                <div class="help-contact">
                    <h3><i class="fas fa-headset"></i> تواصل مع الدعم الفني</h3>
                    <p>البريد الإلكتروني: support@example.com</p>
                    <p>رقم الهاتف: 1234-567-800</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal('helpModal')">حسناً</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // إضافة CSS للمساعدة
    const style = document.createElement('style');
    style.textContent = `
        .help-section {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .help-section h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .help-section p {
            color: #7f8c8d;
            margin: 0;
        }
        
        .help-contact {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        
        .help-contact h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .help-contact p {
            margin: 5px 0;
            color: #34495e;
        }
    `;
    
    document.head.appendChild(style);
}

// محاولة تسجيل الدخول
function attemptLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // البحث عن المستخدم
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
        // فشل تسجيل الدخول
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.style.display = 'block';
        }
        
        // زيادة عدد محاولات الفاشلة إذا وجد المستخدم
        if (user) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            
            // قفل الحساب بعد وصول عدد المحاولات الفاشلة إلى الحد الأقصى
            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.isLocked = true;
                
                loginError.innerHTML = `
                    <p><i class="fas fa-lock"></i> تم قفل الحساب بسبب محاولات دخول فاشلة متكررة. يرجى التواصل مع المسؤول.</p>
                `;
                
                // تسجيل نشاط قفل الحساب
                logActivity('security', `تم قفل حساب ${user.username} بسبب محاولات دخول فاشلة متكررة`, 'system');
            }
            
            saveUsers();
        }
        
        // تسجيل نشاط فشل تسجيل الدخول
        logActivity('security', `محاولة تسجيل دخول فاشلة باستخدام اسم المستخدم: ${username}`, 'system');
        
        return false;
    }
    
    // التحقق من حالة قفل الحساب
    if (user.isLocked) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.innerHTML = `
                <p><i class="fas fa-lock"></i> هذا الحساب مغلق. يرجى التواصل مع المسؤول لإعادة تفعيله.</p>
            `;
            loginError.style.display = 'block';
        }
        
        // تسجيل نشاط محاولة تسجيل دخول لحساب مغلق
        logActivity('security', `محاولة تسجيل دخول لحساب مغلق: ${username}`, 'system');
        
        return false;
    }
    
    // تسجيل الدخول بنجاح
    currentUser = { ...user };
    delete currentUser.password; // لا تخزن كلمة المرور في الجلسة
    
    // إعادة ضبط عدد محاولات تسجيل الدخول الفاشلة
    user.failedLoginAttempts = 0;
    
    // تحديث وقت آخر تسجيل دخول
    user.lastLogin = new Date().toISOString();
    saveUsers();
    
    // تخزين المستخدم في الجلسة
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // حفظ بيانات "تذكرني" إذا تم اختيارها
    if (rememberMe) {
        localStorage.setItem('rememberedUser', username);
        // في التطبيق الحقيقي، يجب استخدام طريقة آمنة مثل JWT token
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    // تطبيق الصلاحيات
    applyUserPermissions(currentUser);
    
    // تحديث واجهة المستخدم بمعلومات المستخدم
    updateUIWithUserInfo(currentUser);
    
    // إزالة طبقة تسجيل الدخول
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.classList.add('fade-out');
        
        setTimeout(() => {
            loginOverlay.remove();
        }, 500);
    }
    
    // تسجيل نشاط تسجيل الدخول الناجح
    logActivity('login', 'تسجيل دخول ناجح', user.id);
    
    // عرض إشعار الترحيب
    createNotification('مرحبًا', `مرحباً بك ${currentUser.fullName}`, 'success');
    
    return false;
}

// تسجيل الخروج
function logout() {
    // تسجيل نشاط تسجيل الخروج
    if (currentUser) {
        logActivity('logout', 'تسجيل خروج', currentUser.id);
    }
    
    // مسح المستخدم الحالي
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // عرض شاشة تسجيل الدخول
    showLoginScreen();
    
    // عرض إشعار تسجيل الخروج
    createNotification('تسجيل الخروج', 'تم تسجيل الخروج بنجاح', 'info');
}

// تسجيل نشاط
function logActivity(type, description, userId = null) {
    const activity = {
        id: generateId(),
        type,
        description,
        userId: userId || (currentUser ? currentUser.id : 'system'),
        date: new Date().toISOString(),
        ipAddress: '127.0.0.1', // في التطبيق الحقيقي، يجب الحصول على عنوان IP الفعلي
        userAgent: navigator.userAgent
    };
    
    activityLog.unshift(activity);
    
    // الاحتفاظ بـ 1000 نشاط فقط
    if (activityLog.length > 1000) {
        activityLog = activityLog.slice(0, 1000);
    }
    
    // حفظ سجل الأنشطة
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    
    return activity;
}

// securitySystem_improved.js - تحسين نظام الصلاحيات وعرض واجهة الأمان

/**
 * تطبيق صلاحيات المستخدم على جميع عناصر واجهة المستخدم بشكل شامل
 * الوظيفة المحسنة لمعالجة مشكلة الصلاحيات في أزرار الصفحات
 */
function applyUserPermissions(user) {
    if (!user || !user.permissions) return;
    
    const permissions = user.permissions;
    console.log("تطبيق الصلاحيات للمستخدم:", user.username, "الدور:", user.role);
    
    // =============================================
    // 1. صلاحيات الشريط الجانبي
    // =============================================
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        
        if (href) {
            const page = href.substring(1); // إزالة # من href
            
            // وظائف خاصة بالمسؤول فقط
            if ((page === 'security' || page === 'settings') && user.role !== 'admin') {
                item.style.display = 'none';
            }
            // بقية الصفحات تعتمد على الصلاحيات المحددة
            else if (!permissions[page]) {
                item.style.display = 'none';
                console.log(`إخفاء قائمة: ${page} - الصلاحية غير متوفرة`);
            } else {
                item.style.display = '';
                console.log(`إظهار قائمة: ${page} - الصلاحية متوفرة`);
            }
        }
    });
    
    // =============================================
    // 2. صلاحيات إدارة المستثمرين
    // =============================================
    
    // 2.1 صلاحيات عرض المستثمرين
    if (!permissions.viewInvestors) {
        hideElements('.page#investors');
        hideElements('[data-page="investors"]');
        console.log("إخفاء صفحة المستثمرين - لا يوجد صلاحية عرض المستثمرين");
    }
    
    // 2.2 أزرار إضافة المستثمر
    if (!permissions.addInvestor) {
        hideElements('button[onclick*="openAddInvestorModal"]');
        hideElements('button[data-action="addInvestor"]');
        console.log("إخفاء أزرار إضافة المستثمر - لا يوجد صلاحية الإضافة");
    }
    
    // 2.3 أزرار تعديل المستثمر
    if (!permissions.editInvestor) {
        hideElements('button[onclick*="editInvestor"]');
        hideElements('button[data-action="editInvestor"]');
        console.log("إخفاء أزرار تعديل المستثمر - لا يوجد صلاحية التعديل");
    }
    
    // 2.4 أزرار حذف المستثمر
    if (!permissions.deleteInvestor) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="investor"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"]');
        hideElements('button[data-action="deleteInvestor"]');
        console.log("إخفاء أزرار حذف المستثمر - لا يوجد صلاحية الحذف");
    }
    
    // 2.5 أزرار تصدير واستيراد المستثمرين
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
    
    // =============================================
    // 3. صلاحيات إدارة الاستثمارات
    // =============================================
    
    // 3.1 صلاحيات عرض الاستثمارات
    if (!permissions.viewInvestments) {
        hideElements('.page#investments');
        hideElements('[data-page="investments"]');
        console.log("إخفاء صفحة الاستثمارات - لا يوجد صلاحية عرض الاستثمارات");
    }
    
    // 3.2 أزرار إضافة الاستثمار
    if (!permissions.addInvestment) {
        hideElements('button[onclick*="openNewInvestmentModal"]');
        hideElements('button[data-action="addInvestment"]');
        console.log("إخفاء أزرار إضافة الاستثمار - لا يوجد صلاحية الإضافة");
    }
    
    // 3.3 أزرار تعديل الاستثمار
    if (!permissions.editInvestment) {
        hideElements('button[onclick*="editInvestment"]');
        hideElements('button[data-action="editInvestment"]');
        console.log("إخفاء أزرار تعديل الاستثمار - لا يوجد صلاحية التعديل");
    }
    
    // 3.4 أزرار حذف الاستثمار
    if (!permissions.deleteInvestment) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="investment"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"]');
        hideElements('button[data-action="deleteInvestment"]');
        console.log("إخفاء أزرار حذف الاستثمار - لا يوجد صلاحية الحذف");
    }
    
    // =============================================
    // 4. صلاحيات العمليات المالية
    // =============================================
    
    // 4.1 صلاحيات عرض العمليات
    if (!permissions.viewOperations) {
        hideElements('.page#operations');
        hideElements('[data-page="operations"]');
        console.log("إخفاء صفحة العمليات - لا يوجد صلاحية عرض العمليات");
    }
    
    // 4.2 صلاحيات الموافقة على العمليات
    if (!permissions.approveOperations) {
        hideElements('button[onclick*="approveOperation"]');
        hideElements('button[data-action="approveOperation"]');
        console.log("إخفاء أزرار الموافقة على العمليات - لا يوجد صلاحية الموافقة");
    }
    
    // 4.3 صلاحيات رفض العمليات
    if (!permissions.rejectOperations) {
        hideElements('button[onclick*="openDeleteConfirmationModal"][data-type="operation"]');
        hideElements('button[onclick*="openDeleteConfirmationModal"][onclick*="\'operation\'"]');
        hideElements('button[data-action="rejectOperation"]');
        console.log("إخفاء أزرار رفض العمليات - لا يوجد صلاحية الرفض");
    }
    
    // 4.4 صلاحيات السحوبات
    if (!permissions.withdrawals) {
        hideElements('button[onclick*="openWithdrawModal"]');
        hideElements('button[data-action="withdrawal"]');
        console.log("إخفاء أزرار السحوبات - لا يوجد صلاحية السحب");
    }
    
    // =============================================
    // 5. صلاحيات الأرباح
    // =============================================
    
    // 5.1 صلاحيات عرض الأرباح
    if (!permissions.viewProfits) {
        hideElements('.page#profits');
        hideElements('[data-page="profits"]');
        console.log("إخفاء صفحة الأرباح - لا يوجد صلاحية عرض الأرباح");
    }
    
    // 5.2 صلاحيات دفع الأرباح
    if (!permissions.payProfits) {
        hideElements('button[onclick*="openPayProfitModal"]');
        hideElements('button[data-action="payProfit"]');
        console.log("إخفاء أزرار دفع الأرباح - لا يوجد صلاحية الدفع");
    }
    
    // =============================================
    // 6. صلاحيات التقارير
    // =============================================
    
    // 6.1 صلاحيات عرض التقارير
    if (!permissions.viewReports) {
        hideElements('.page#reports');
        hideElements('[data-page="reports"]');
        console.log("إخفاء صفحة التقارير - لا يوجد صلاحية عرض التقارير");
    }
    
    // 6.2 صلاحيات إنشاء التقارير
    if (!permissions.generateReports) {
        hideElements('button[onclick*="generateReport"]');
        hideElements('button[data-action="generateReport"]');
        console.log("إخفاء أزرار إنشاء التقارير - لا يوجد صلاحية الإنشاء");
    }
    
    // 6.3 صلاحيات تصدير التقارير
    if (!permissions.exportReports) {
        hideElements('button[onclick*="exportReport"]');
        hideElements('button[data-action="exportReport"]');
        console.log("إخفاء أزرار تصدير التقارير - لا يوجد صلاحية التصدير");
    }
    
    // =============================================
    // 7. صلاحيات التحليلات المالية
    // =============================================
    
    if (!permissions.analytics) {
        hideElements('.page#analytics');
        hideElements('[data-page="analytics"]');
        console.log("إخفاء صفحة التحليلات - لا يوجد صلاحية التحليلات");
    }
    
    // =============================================
    // 8. صلاحيات التقويم
    // =============================================
    
    if (!permissions.calendar) {
        hideElements('.page#calendar');
        hideElements('[data-page="calendar"]');
        console.log("إخفاء صفحة التقويم - لا يوجد صلاحية التقويم");
    }
    
    // =============================================
    // 9. صلاحيات الإعدادات والأمان
    // =============================================
    
    // الإعدادات العامة والأمان للمسؤول فقط
    if (user.role !== 'admin') {
        hideElements('.page#settings');
        hideElements('.page#security');
        hideElements('[data-page="settings"]');
        hideElements('[data-page="security"]');
        console.log("إخفاء صفحة الإعدادات والأمان - المستخدم ليس مسؤولاً");
    }
    
    // =============================================
    // 10. الأزرار داخل الصفحات والحالات الخاصة
    // =============================================
    
    // إخفاء جميع أزرار صفحة معينة إذا لم يكن لدى المستخدم صلاحيات للصفحة
    if (!permissions.investors) {
        hideElements('[data-section="investors"] button');
        console.log("إخفاء جميع أزرار قسم المستثمرين - لا يوجد صلاحية المستثمرين");
    }
    
    if (!permissions.investments) {
        hideElements('[data-section="investments"] button');
        console.log("إخفاء جميع أزرار قسم الاستثمارات - لا يوجد صلاحية الاستثمارات");
    }
    
    if (!permissions.profits) {
        hideElements('[data-section="profits"] button');
        console.log("إخفاء جميع أزرار قسم الأرباح - لا يوجد صلاحية الأرباح");
    }
    
    if (!permissions.operations) {
        hideElements('[data-section="operations"] button');
        console.log("إخفاء جميع أزرار قسم العمليات - لا يوجد صلاحية العمليات");
    }
    
    // =============================================
    // 11. أزرار الإجراءات في جداول البيانات
    // =============================================
    
    // تعطيل أزرار الإجراءات في جدول المستثمرين حسب الصلاحيات
    document.querySelectorAll('#investorsTableBody tr, .investors-table tr').forEach(row => {
        if (!permissions.editInvestor) {
            const editBtn = row.querySelector('button[onclick*="editInvestor"]');
            if (editBtn) {
                editBtn.style.display = 'none';
                console.log("إخفاء زر تعديل المستثمر في جدول المستثمرين");
            }
        }
        
        if (!permissions.deleteInvestor) {
            const deleteBtn = row.querySelector('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"]');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
                console.log("إخفاء زر حذف المستثمر في جدول المستثمرين");
            }
        }
    });
    
    // تعطيل أزرار الإجراءات في جدول الاستثمارات حسب الصلاحيات
    document.querySelectorAll('#investmentsTableBody tr, .investments-table tr').forEach(row => {
        if (!permissions.editInvestment) {
            const editBtn = row.querySelector('button[onclick*="editInvestment"]');
            if (editBtn) {
                editBtn.style.display = 'none';
                console.log("إخفاء زر تعديل الاستثمار في جدول الاستثمارات");
            }
        }
        
        if (!permissions.deleteInvestment) {
            const deleteBtn = row.querySelector('button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"]');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
                console.log("إخفاء زر حذف الاستثمار في جدول الاستثمارات");
            }
        }
        
        if (!permissions.withdrawals) {
            const withdrawBtn = row.querySelector('button[onclick*="openWithdrawModal"]');
            if (withdrawBtn) {
                withdrawBtn.style.display = 'none';
                console.log("إخفاء زر السحب في جدول الاستثمارات");
            }
        }
        
        if (!permissions.payProfits) {
            const profitBtn = row.querySelector('button[onclick*="openPayProfitModal"]');
            if (profitBtn) {
                profitBtn.style.display = 'none';
                console.log("إخفاء زر دفع الأرباح في جدول الاستثمارات");
            }
        }
    });
    
    // تعطيل أزرار الإجراءات في جدول العمليات حسب الصلاحيات
    document.querySelectorAll('#operationsTableBody tr, .operations-table tr').forEach(row => {
        if (!permissions.approveOperations) {
            const approveBtn = row.querySelector('button[onclick*="approveOperation"]');
            if (approveBtn) {
                approveBtn.style.display = 'none';
                console.log("إخفاء زر الموافقة على العملية في جدول العمليات");
            }
        }
        
        if (!permissions.rejectOperations) {
            const rejectBtn = row.querySelector('button[onclick*="openDeleteConfirmationModal"][onclick*="\'operation\'"]');
            if (rejectBtn) {
                rejectBtn.style.display = 'none';
                console.log("إخفاء زر رفض العملية في جدول العمليات");
            }
        }
    });
    
    // =============================================
    // 12. إظهار/إخفاء واجهات المستخدم المناسبة
    // =============================================
    
    // إظهار قسم الإدارة فقط للمسؤولين
    if (user.role !== 'admin') {
        hideElements('.admin-only');
        console.log("إخفاء العناصر المخصصة للمسؤول فقط");
    } else {
        showElements('.admin-only');
        console.log("إظهار العناصر المخصصة للمسؤول");
    }
    
    // تطبيق النمط المناسب حسب الدور
    if (user.role === 'admin') {
        document.body.classList.add('admin-mode');
        document.body.classList.remove('user-mode');
        console.log("تطبيق نمط المسؤول");
    } else {
        document.body.classList.add('user-mode');
        document.body.classList.remove('admin-mode');
        console.log("تطبيق نمط المستخدم العادي");
    }
    
    // =============================================
    // 13. معالجة الحالات الخاصة
    // =============================================
    
    // معالجة أزرار معاينة التفاصيل
    if (!permissions.viewInvestors) {
        hideElements('button[onclick*="viewInvestor"]');
        console.log("إخفاء أزرار معاينة المستثمر - لا يوجد صلاحية عرض المستثمرين");
    }
    
    if (!permissions.viewInvestments) {
        hideElements('button[onclick*="viewInvestment"]');
        console.log("إخفاء أزرار معاينة الاستثمار - لا يوجد صلاحية عرض الاستثمارات");
    }
    
    if (!permissions.viewOperations) {
        hideElements('button[onclick*="viewOperation"]');
        console.log("إخفاء أزرار معاينة العملية - لا يوجد صلاحية عرض العمليات");
    }
    
    // إخفاء الأزرار المضافة ديناميكياً عند إنشاء الجداول
    // سيتم تنفيذ هذا الإجراء بعد كل تحميل للبيانات
    document.addEventListener('tableUpdated', function() {
        applyDynamicPermissions(permissions);
    });
    
    // تنفيذ الآن في حالة كانت الجداول موجودة بالفعل
    applyDynamicPermissions(permissions);
    
    console.log("اكتمل تطبيق الصلاحيات للمستخدم:", user.username);
}

/**
 * إخفاء عناصر واجهة المستخدم
 */
function hideElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element) {
            element.style.display = 'none';
            // إضافة سمة data-hidden-by-permission للتمييز
            element.setAttribute('data-hidden-by-permission', 'true');
        }
    });
}



/**
 * إظهار عناصر واجهة المستخدم
 */
function showElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (element && element.getAttribute('data-hidden-by-permission') === 'true') {
            element.style.display = '';
            element.removeAttribute('data-hidden-by-permission');
        }
    });
}

// تحديث واجهة المستخدم بمعلومات المستخدم
function updateUIWithUserInfo(user) {
    if (!user) return;
    
    // تحديث اسم المستخدم والدور في الشريط الجانبي
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userName) {
        userName.textContent = user.fullName;
    }
    
    if (userRole) {
        userRole.textContent = user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم';
    }
    
    if (userAvatar) {
        // إضافة الأحرف الأولى من اسم المستخدم كصورة افتراضية
        const initials = user.fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase();
        
        userAvatar.textContent = initials;
        
        // تعيين لون خلفية عشوائي استنادًا إلى اسم المستخدم
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        
        // استخدام اسم المستخدم كبذرة لاختيار لون ثابت
        const colorIndex = user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        userAvatar.style.backgroundColor = colors[colorIndex];
    }
    
    // تحديث اسم المستخدم في الشريط العلوي
    const headerUserName = document.querySelector('.header-user-name');
    if (headerUserName) {
        headerUserName.textContent = user.fullName;
    }
    
    // إظهار أو إخفاء عناصر واجهة المستخدم بناءً على دور المستخدم
    if (user.role === 'admin') {
        document.body.classList.add('admin-mode');
        document.body.classList.remove('user-mode');
    } else {
        document.body.classList.add('user-mode');
        document.body.classList.remove('admin-mode');
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
        securityTab.innerHTML = '<i class="fas fa-shield-alt"></i> الأمان والمستخدمين';
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
                <!-- قسم إدارة المستخدمين -->
                <div class="form-header">
                    <h2 class="form-title"><i class="fas fa-users-cog"></i> إدارة المستخدمين</h2>
                    <p class="form-subtitle">إضافة وتعديل المستخدمين وإدارة الصلاحيات</p>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-title">قائمة المستخدمين</div>
                        <button class="btn btn-primary" onclick="securitySystem.openAddUserModal()">
                            <i class="fas fa-user-plus"></i> إضافة مستخدم
                        </button>
                    </div>
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
                            <!-- سيتم ملؤها بواسطة JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <!-- قسم كلمة المرور -->
                <div class="form-container">
                    <div class="form-header">
                        <h2 class="form-title"><i class="fas fa-key"></i> تغيير كلمة المرور</h2>
                    </div>
                    <form id="changePasswordForm" onsubmit="securitySystem.changeCurrentUserPassword(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">كلمة المرور الحالية</label>
                                <div class="password-input-container">
                                    <input type="password" class="form-control" id="currentPassword" required>
                                    <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('currentPassword')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">كلمة المرور الجديدة</label>
                                <div class="password-input-container">
                                    <input type="password" class="form-control" id="newPassword" required>
                                    <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('newPassword')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="password-strength" id="passwordStrength">
                                    <div class="strength-meter">
                                        <div class="strength-meter-fill" id="strengthMeter"></div>
                                    </div>
                                    <div class="strength-text" id="strengthText">ضعيفة</div>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                                <div class="password-input-container">
                                    <input type="password" class="form-control" id="confirmPassword" required>
                                    <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('confirmPassword')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="password-requirements">
                                    <h4>متطلبات كلمة المرور:</h4>
                                    <ul>
                                        <li id="req-length"><i class="fas fa-times-circle"></i> 8 أحرف على الأقل</li>
                                        <li id="req-uppercase"><i class="fas fa-times-circle"></i> حرف كبير واحد على الأقل</li>
                                        <li id="req-lowercase"><i class="fas fa-times-circle"></i> حرف صغير واحد على الأقل</li>
                                        <li id="req-number"><i class="fas fa-times-circle"></i> رقم واحد على الأقل</li>
                                        <li id="req-special"><i class="fas fa-times-circle"></i> حرف خاص واحد على الأقل</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> تغيير كلمة المرور
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- قسم إعدادات الأمان -->
                <div class="form-container">
                    <div class="form-header">
                        <h2 class="form-title"><i class="fas fa-shield-alt"></i> إعدادات الأمان</h2>
                    </div>
                    <form id="securitySettingsForm" onsubmit="securitySystem.saveSecuritySettings(event)">
                        <!-- خيارات كلمة المرور -->
                        <div class="settings-section">
                            <h3 class="settings-section-title"><i class="fas fa-user-lock"></i> إعدادات كلمة المرور</h3>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="requirePasswordChange">
                                    <label class="form-check-label" for="requirePasswordChange">إلزام المستخدمين بتغيير كلمة المرور بعد أول تسجيل دخول</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="enforceStrongPasswords">
                                    <label class="form-check-label" for="enforceStrongPasswords">فرض استخدام كلمات مرور قوية (8 أحرف على الأقل، أحرف كبيرة وصغيرة، أرقام، رموز)</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">إعادة تعيين كلمة المرور بعد (يوم)</label>
                                <input type="number" class="form-control" id="passwordResetDays" min="0" max="365" value="90">
                                <p class="form-text">0 = لا يتم إلزام إعادة تعيين كلمة المرور</p>
                            </div>
                        </div>
                        
                        <!-- خيارات الجلسة -->
                        <div class="settings-section">
                            <h3 class="settings-section-title"><i class="fas fa-clock"></i> إعدادات الجلسة</h3>
                            <div class="form-group">
                                <label class="form-label">مدة الجلسة (بالدقائق)</label>
                                <input type="number" class="form-control" id="sessionDuration" min="5" max="1440" value="30">
                                <p class="form-text">سيتم تسجيل الخروج تلقائياً بعد فترة عدم نشاط تعادل هذه المدة.</p>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="singleSessionOnly">
                                    <label class="form-check-label" for="singleSessionOnly">السماح بجلسة واحدة فقط لكل مستخدم (تسجيل الخروج من الأجهزة الأخرى عند تسجيل الدخول)</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- خيارات الإشعارات -->
                        <div class="settings-section">
                            <h3 class="settings-section-title"><i class="fas fa-bell"></i> إشعارات الأمان</h3>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="enableLoginNotifications" checked>
                                    <label class="form-check-label" for="enableLoginNotifications">تفعيل إشعارات تسجيل الدخول</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="notifyUnusualLogin" checked>
                                    <label class="form-check-label" for="notifyUnusualLogin">إشعار عند تسجيل الدخول من موقع أو جهاز غير معتاد</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="notifyPasswordChange" checked>
                                    <label class="form-check-label" for="notifyPasswordChange">إشعار عند تغيير كلمة المرور</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="notifyPermissionChange" checked>
                                    <label class="form-check-label" for="notifyPermissionChange">إشعار عند تغيير الصلاحيات</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- خيارات متقدمة -->
                        <div class="settings-section">
                            <h3 class="settings-section-title"><i class="fas fa-cogs"></i> إعدادات متقدمة</h3>
                            <div class="form-group">
                                <label class="form-label">عدد محاولات تسجيل الدخول المسموح بها قبل قفل الحساب</label>
                                <input type="number" class="form-control" id="maxLoginAttempts" min="3" max="10" value="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">مدة قفل الحساب (بالدقائق)</label>
                                <input type="number" class="form-control" id="accountLockDuration" min="5" max="1440" value="30">
                                <p class="form-text">0 = القفل الدائم حتى إعادة التفعيل من قبل المسؤول</p>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="twoFactorEnabled">
                                    <label class="form-check-label" for="twoFactorEnabled">تفعيل المصادقة الثنائية (2FA)</label>
                                </div>
                                <p class="form-text">سيتم تفعيل هذه الميزة في الإصدار القادم</p>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> حفظ الإعدادات
                            </button>
                            <button type="reset" class="btn btn-light">
                                <i class="fas fa-undo"></i> إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- سجل الأنشطة -->
                <div class="form-container">
                    <div class="form-header">
                        <h2 class="form-title"><i class="fas fa-history"></i> سجل الأنشطة</h2>
                    </div>
                    <div class="activity-log-filters">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">تصفية حسب النوع</label>
                                <select class="form-select" id="activityTypeFilter" onchange="securitySystem.filterActivityLog()">
                                    <option value="all">الكل</option>
                                    <option value="login">تسجيل الدخول</option>
                                    <option value="logout">تسجيل الخروج</option>
                                    <option value="security">الأمان</option>
                                    <option value="user">إدارة المستخدمين</option>
                                    <option value="settings">الإعدادات</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">تصفية حسب المستخدم</label>
                                <select class="form-select" id="activityUserFilter" onchange="securitySystem.filterActivityLog()">
                                    <option value="all">الكل</option>
                                    <!-- سيتم ملؤها بواسطة JavaScript -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">تصفية حسب التاريخ</label>
                                <input type="date" class="form-control" id="activityDateFilter" onchange="securitySystem.filterActivityLog()">
                            </div>
                        </div>
                    </div>
                    <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>التاريخ والوقت</th>
                                    <th>المستخدم</th>
                                    <th>النوع</th>
                                    <th>الوصف</th>
                                    <th>عنوان IP</th>
                                </tr>
                            </thead>
                            <tbody id="activityLogTableBody">
                                <!-- سيتم ملؤها بواسطة JavaScript -->
                            </tbody>
                        </table>
                    </div>
                    <div class="activity-log-actions">
                        <button class="btn btn-primary" onclick="securitySystem.exportActivityLog()">
                            <i class="fas fa-file-export"></i> تصدير السجل
                        </button>
                        <button class="btn btn-danger" onclick="securitySystem.clearActivityLog()">
                            <i class="fas fa-trash"></i> مسح السجل
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        settingsContainer.appendChild(securitySettingsTab);
        
        // إضافة CSS للعناصر الإضافية
        const style = document.createElement('style');
        style.textContent = `
            /* تنسيقات عامة للإعدادات */
            .settings-section {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 25px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            .settings-section:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .settings-section-title {
                color: #2c3e50;
                font-size: 1.2rem;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            /* تنسيقات قوة كلمة المرور */
            .password-strength {
                margin-top: 10px;
            }
            
            .strength-meter {
                height: 5px;
                background-color: #e0e0e0;
                border-radius: 3px;
                margin-bottom: 5px;
                overflow: hidden;
            }
            
            .strength-meter-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.3s, background-color 0.3s;
                width: 0%;
                background-color: #e74c3c;
            }
            
            .strength-text {
                font-size: 0.8rem;
                color: #7f8c8d;
            }
            
            .password-requirements {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                border: 1px solid #eee;
                margin-top: 15px;
            }
            
            .password-requirements h4 {
                font-size: 0.9rem;
                margin-bottom: 10px;
                color: #34495e;
            }
            
            .password-requirements ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .password-requirements li {
                margin-bottom: 5px;
                font-size: 0.85rem;
                color: #7f8c8d;
            }
            
            .password-requirements li i {
                margin-left: 5px;
                color: #e74c3c;
            }
            
            .password-requirements li i.fa-check-circle {
                color: #2ecc71;
            }
            
            /* تنسيقات سجل الأنشطة */
            .activity-log-filters {
                margin-bottom: 15px;
            }
            
            .activity-log-actions {
                margin-top: 15px;
                display: flex;
                gap: 10px;
            }
            
            /* تحسينات جدول المستخدمين */
            #usersTableBody tr {
                transition: background-color 0.3s;
            }
            
            #usersTableBody tr:hover {
                background-color: rgba(52, 152, 219, 0.05);
            }
            
            /* مؤشرات الحالة */
            .status-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 50px;
                font-size: 0.8rem;
                font-weight: 600;
                text-align: center;
            }
            
            .status-active {
                background-color: rgba(46, 204, 113, 0.1);
                color: #2ecc71;
            }
            
            .status-locked {
                background-color: rgba(231, 76, 60, 0.1);
                color: #e74c3c;
            }
            
            .status-inactive {
                background-color: rgba(149, 165, 166, 0.1);
                color: #95a5a6;
            }
            
            /* تأثيرات متحركة للأزرار */
            .btn {
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            /* تنسيقات مُحسنة للنموذج */
            .form-container {
                transition: transform 0.3s, box-shadow 0.3s;
                margin-bottom: 30px;
            }
            
            .form-container:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
            }
            
            /* تنسيقات للادخال */
            .form-control, .form-select {
                transition: border-color 0.3s, box-shadow 0.3s;
            }
            
            .form-control:focus, .form-select:focus {
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
            }
            
            .form-check-input {
                cursor: pointer;
            }
            
            /* توافق الوضع المظلم */
            body.dark-mode .settings-section {
                background-color: #2c3e50;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            body.dark-mode .settings-section-title,
            body.dark-mode .form-label,
            body.dark-mode .password-requirements h4 {
                color: #ecf0f1;
            }
            
            body.dark-mode .password-requirements {
                background-color: #34495e;
                border-color: #2c3e50;
            }
            
            body.dark-mode .password-requirements li {
                color: #bdc3c7;
            }
            
            body.dark-mode #usersTableBody tr:hover {
                background-color: rgba(52, 152, 219, 0.1);
            }
        `;
        
        document.head.appendChild(style);
        
        // ربط مستمعات الأحداث لمراقبة قوة كلمة المرور
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', checkPasswordStrength);
        }
        
        // ملء جدول المستخدمين
        populateUsersTable();
        
        // ملء سجل الأنشطة
        populateActivityLog();
        
        // ملء قائمة المستخدمين في تصفية سجل الأنشطة
        populateActivityUserFilter();
    }
}

// التحقق من قوة كلمة المرور
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    
    // متطلبات كلمة المرور
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // تحديث مؤشرات المتطلبات
    for (const [req, valid] of Object.entries(requirements)) {
        const el = document.getElementById(`req-${req}`);
        if (el) {
            el.querySelector('i').className = valid ? 'fas fa-check-circle' : 'fas fa-times-circle';
            el.style.color = valid ? '#2ecc71' : '#7f8c8d';
        }
    }
    
    // حساب قوة كلمة المرور (0-100)
    let strength = 0;
    
    if (requirements.length) strength += 20;
    if (requirements.uppercase) strength += 20;
    if (requirements.lowercase) strength += 20;
    if (requirements.number) strength += 20;
    if (requirements.special) strength += 20;
    
    // تحديث المؤشر البصري
    if (strengthMeter) {
        strengthMeter.style.width = `${strength}%`;
        
        if (strength < 40) {
            strengthMeter.style.backgroundColor = '#e74c3c'; // أحمر
        } else if (strength < 70) {
            strengthMeter.style.backgroundColor = '#f39c12'; // برتقالي
        } else {
            strengthMeter.style.backgroundColor = '#2ecc71'; // أخضر
        }
    }
    
    // تحديث النص الوصفي
    if (strengthText) {
        if (strength < 40) {
            strengthText.textContent = 'ضعيفة';
            strengthText.style.color = '#e74c3c';
        } else if (strength < 70) {
            strengthText.textContent = 'متوسطة';
            strengthText.style.color = '#f39c12';
        } else {
            strengthText.textContent = 'قوية';
            strengthText.style.color = '#2ecc71';
        }
    }
    
    // التحقق من تطابق كلمة المرور التأكيدية
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword) {
        const match = password === confirmPassword;
        const confirmEl = document.getElementById('confirmPassword');
        
        if (confirmEl) {
            if (match) {
                confirmEl.style.borderColor = '#2ecc71';
            } else {
                confirmEl.style.borderColor = '#e74c3c';
            }
        }
    }
}

// تبديل حقل كلمة المرور بين الظهور والإخفاء
function togglePasswordField(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// ملء جدول المستخدمين
function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach((user, index) => {
        // تخطي المستخدم المسؤول إذا كان المستخدم الحالي ليس مسؤولاً
        if (user.username === 'admin' && currentUser && currentUser.username !== 'admin' && currentUser.role !== 'admin') {
            return;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم'}</td>
            <td>${user.email || '-'}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-IQ') : 'لا يوجد'}</td>
            <td>
                ${user.isLocked ? 
                    '<span class="status-badge status-locked"><i class="fas fa-lock"></i> مغلق</span>' : 
                    '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> نشط</span>'}
            </td>
            <td>
                <button class="btn btn-warning btn-icon action-btn" onclick="securitySystem.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.isLocked ? `
                    <button class="btn btn-success btn-icon action-btn" onclick="securitySystem.unlockUser('${user.id}')">
                        <i class="fas fa-unlock"></i>
                    </button>
                ` : ''}
                ${user.username !== 'admin' && user.username !== currentUser?.username ? `
                    <button class="btn btn-danger btn-icon action-btn" onclick="securitySystem.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ملء سجل الأنشطة
function populateActivityLog() {
    const tbody = document.getElementById('activityLogTableBody');
    if (!tbody) return;
    
    // ترتيب الأنشطة من الأحدث إلى الأقدم
    const sortedActivities = [...activityLog].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // عرض أحدث 100 نشاط فقط
    const recentActivities = sortedActivities.slice(0, 100);
    
    tbody.innerHTML = '';
    
    if (recentActivities.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">لا توجد أنشطة مسجلة</td>`;
        tbody.appendChild(row);
        return;
    }
    
    recentActivities.forEach(activity => {
        // البحث عن معلومات المستخدم
        let userName = activity.userId;
        if (activity.userId === 'system') {
            userName = 'النظام';
        } else {
            const user = users.find(u => u.id === activity.userId);
            if (user) {
                userName = user.fullName;
            }
        }
        
        // تحديد نوع النشاط
        let activityType = '';
        let typeClass = '';
        
        switch (activity.type) {
            case 'login':
                activityType = 'تسجيل دخول';
                typeClass = 'success';
                break;
            case 'logout':
                activityType = 'تسجيل خروج';
                typeClass = 'info';
                break;
            case 'security':
                activityType = 'أمان';
                typeClass = 'warning';
                break;
            case 'user':
                activityType = 'مستخدم';
                typeClass = 'primary';
                break;
            case 'settings':
                activityType = 'إعدادات';
                typeClass = 'secondary';
                break;
            default:
                activityType = activity.type;
                typeClass = 'default';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(activity.date).toLocaleString('ar-IQ')}</td>
            <td>${userName}</td>
            <td><span class="status-badge status-${typeClass}">${activityType}</span></td>
            <td>${activity.description}</td>
            <td>${activity.ipAddress || '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// ملء قائمة المستخدمين في تصفية سجل الأنشطة
function populateActivityUserFilter() {
    const userFilter = document.getElementById('activityUserFilter');
    if (!userFilter) return;
    
    // مسح القائمة
    userFilter.innerHTML = '<option value="all">الكل</option>';
    
    // إضافة خيار النظام
    const systemOption = document.createElement('option');
    systemOption.value = 'system';
    systemOption.textContent = 'النظام';
    userFilter.appendChild(systemOption);
    
    // إضافة المستخدمين
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.fullName;
        userFilter.appendChild(option);
    });
}

// تصفية سجل الأنشطة
function filterActivityLog() {
    const typeFilter = document.getElementById('activityTypeFilter').value;
    const userFilter = document.getElementById('activityUserFilter').value;
    const dateFilter = document.getElementById('activityDateFilter').value;
    
    // تطبيق التصفية
    let filteredActivities = [...activityLog];
    
    // تصفية حسب النوع
    if (typeFilter !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === typeFilter);
    }
    
    // تصفية حسب المستخدم
    if (userFilter !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.userId === userFilter);
    }
    
    // تصفية حسب التاريخ
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredActivities = filteredActivities.filter(activity => {
            const activityDate = new Date(activity.date);
            return (
                activityDate.getFullYear() === filterDate.getFullYear() &&
                activityDate.getMonth() === filterDate.getMonth() &&
                activityDate.getDate() === filterDate.getDate()
            );
        });
    }
    
    // ترتيب الأنشطة من الأحدث إلى الأقدم
    filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // تحديث الجدول
    const tbody = document.getElementById('activityLogTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredActivities.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">لا توجد أنشطة تطابق معايير التصفية</td>`;
        tbody.appendChild(row);
        return;
    }
    
    filteredActivities.forEach(activity => {
        // البحث عن معلومات المستخدم
        let userName = activity.userId;
        if (activity.userId === 'system') {
            userName = 'النظام';
        } else {
            const user = users.find(u => u.id === activity.userId);
            if (user) {
                userName = user.fullName;
            }
        }
        
        // تحديد نوع النشاط
        let activityType = '';
        let typeClass = '';
        
        switch (activity.type) {
            case 'login':
                activityType = 'تسجيل دخول';
                typeClass = 'success';
                break;
            case 'logout':
                activityType = 'تسجيل خروج';
                typeClass = 'info';
                break;
            case 'security':
                activityType = 'أمان';
                typeClass = 'warning';
                break;
            case 'user':
                activityType = 'مستخدم';
                typeClass = 'primary';
                break;
            case 'settings':
                activityType = 'إعدادات';
                typeClass = 'secondary';
                break;
            default:
                activityType = activity.type;
                typeClass = 'default';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(activity.date).toLocaleString('ar-IQ')}</td>
            <td>${userName}</td>
            <td><span class="status-badge status-${typeClass}">${activityType}</span></td>
            <td>${activity.description}</td>
            <td>${activity.ipAddress || '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// securitySystem_part2.js - استكمال وظائف نظام الأمان والمصادقة المتطور

// تصدير سجل الأنشطة - استكمال من الملف الأول
function exportActivityLog() {
    // تحويل سجل الأنشطة إلى CSV
    let csv = 'التاريخ والوقت,المستخدم,النوع,الوصف,عنوان IP\n';
    
    // ترتيب الأنشطة من الأحدث إلى الأقدم
    const sortedActivities = [...activityLog].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedActivities.forEach(activity => {
        // البحث عن معلومات المستخدم
        let userName = activity.userId;
        if (activity.userId === 'system') {
            userName = 'النظام';
        } else {
            const user = users.find(u => u.id === activity.userId);
            if (user) {
                userName = user.fullName;
            }
        }
        
        // تحديد نوع النشاط
        let activityType = '';
        switch (activity.type) {
            case 'login':
                activityType = 'تسجيل دخول';
                break;
            case 'logout':
                activityType = 'تسجيل خروج';
                break;
            case 'security':
                activityType = 'أمان';
                break;
            case 'user':
                activityType = 'مستخدم';
                break;
            case 'settings':
                activityType = 'إعدادات';
                break;
            default:
                activityType = activity.type;
        }
        
        // تحويل البيانات إلى CSV مع معالجة الفواصل والأقواس
        const formattedDate = new Date(activity.date).toLocaleString('ar-IQ').replace(/,/g, ';');
        const descriptionFormatted = activity.description.replace(/,/g, ';').replace(/"/g, '""');
        
        csv += `"${formattedDate}","${userName}","${activityType}","${descriptionFormatted}","${activity.ipAddress || '-'}"\n`;
    });
    
    // إنشاء ملف CSV وتنزيله
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // عرض إشعار بالنجاح
    createNotification('تم التصدير', 'تم تصدير سجل الأنشطة بنجاح', 'success');
}

// مسح سجل الأنشطة
function clearActivityLog() {
    // تأكيد المستخدم قبل المسح
    if (!confirm('هل أنت متأكد من مسح سجل الأنشطة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    // حفظ بعض الأنشطة للنظام
    const systemActivities = activityLog.filter(activity => activity.userId === 'system' && activity.type === 'security');
    
    // إضافة نشاط مسح السجل
    const clearActivity = {
        id: generateId(),
        type: 'security',
        description: 'تم مسح سجل الأنشطة',
        userId: currentUser ? currentUser.id : 'system',
        date: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
    };
    
    // إعادة تعيين السجل مع الاحتفاظ بأنشطة النظام وإضافة نشاط المسح
    activityLog = [...systemActivities, clearActivity];
    
    // حفظ سجل الأنشطة الجديد
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    
    // تحديث جدول سجل الأنشطة
    populateActivityLog();
    
    // عرض إشعار بالنجاح
    createNotification('تم المسح', 'تم مسح سجل الأنشطة بنجاح', 'success');
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
                <h2 class="modal-title"><i class="fas fa-user-plus"></i> إضافة مستخدم جديد</h2>
                <div class="modal-close" onclick="closeModal('addUserModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="addUserForm">
                    <!-- معلومات المستخدم -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم</label>
                            <input type="text" class="form-control" id="newUsername" required>
                            <div class="form-text">سيستخدم لتسجيل الدخول. لا يمكن تغييره لاحقًا.</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="newUserEmail" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-control" id="newFullName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الدور</label>
                            <select class="form-select" id="newUserRole">
                                <option value="user">مستخدم</option>
                                <option value="admin">مسؤول النظام</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="newUserPassword" required>
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('newUserPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength" id="userPasswordStrength">
                                <div class="strength-meter">
                                    <div class="strength-meter-fill" id="userStrengthMeter"></div>
                                </div>
                                <div class="strength-text" id="userStrengthText">ضعيفة</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="confirmUserPassword" required>
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('confirmUserPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- خيارات الحساب -->
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="requirePasswordChangeOnLogin">
                            <label class="form-check-label" for="requirePasswordChangeOnLogin">إلزام المستخدم بتغيير كلمة المرور عند أول تسجيل دخول</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="sendWelcomeEmail">
                            <label class="form-check-label" for="sendWelcomeEmail">إرسال بريد ترحيبي مع معلومات تسجيل الدخول</label>
                        </div>
                    </div>
                    
                    <!-- جزء الصلاحيات -->
                    <div class="permissions-container">
                        <h3 class="form-subtitle"><i class="fas fa-lock"></i> صلاحيات المستخدم</h3>
                        
                        <!-- أزرار التحديد/إلغاء التحديد للكل -->
                        <div class="permissions-actions">
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="securitySystem.selectAllPermissions()">
                                <i class="fas fa-check-square"></i> تحديد الكل
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="securitySystem.deselectAllPermissions()">
                                <i class="fas fa-square"></i> إلغاء تحديد الكل
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-info" onclick="securitySystem.loadDefaultPermissions('user')">
                                <i class="fas fa-user"></i> إعدادات المستخدم الافتراضية
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-warning" onclick="securitySystem.loadDefaultPermissions('admin')">
                                <i class="fas fa-user-shield"></i> إعدادات المسؤول الافتراضية
                            </button>
                        </div>
                        
                        <!-- مجموعات الصلاحيات -->
                        <div class="permission-sections">
                            <!-- الصفحات الرئيسية -->
                            <div class="permission-section">
                                <h4 class="permission-title">الصفحات الرئيسية</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_dashboard" data-group="pages" checked>
                                        <label class="form-check-label" for="perm_dashboard">الرئيسية</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_analytics" data-group="pages">
                                        <label class="form-check-label" for="perm_analytics">التحليلات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_investors" data-group="pages" checked>
                                        <label class="form-check-label" for="perm_investors">المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_investments" data-group="pages" checked>
                                        <label class="form-check-label" for="perm_investments">الاستثمارات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_profits" data-group="pages">
                                        <label class="form-check-label" for="perm_profits">الأرباح</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_operations" data-group="pages">
                                        <label class="form-check-label" for="perm_operations">العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_reports" data-group="pages">
                                        <label class="form-check-label" for="perm_reports">التقارير</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_financial" data-group="pages">
                                        <label class="form-check-label" for="perm_financial">التقارير المالية</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_calendar" data-group="pages" checked>
                                        <label class="form-check-label" for="perm_calendar">التقويم</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_settings" data-group="pages">
                                        <label class="form-check-label" for="perm_settings">الإعدادات</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة المستثمرين -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة المستثمرين</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewInvestors" data-group="investors" checked>
                                        <label class="form-check-label" for="perm_viewInvestors">عرض المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_addInvestor" data-group="investors">
                                        <label class="form-check-label" for="perm_addInvestor">إضافة مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_editInvestor" data-group="investors">
                                        <label class="form-check-label" for="perm_editInvestor">تعديل مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_deleteInvestor" data-group="investors">
                                        <label class="form-check-label" for="perm_deleteInvestor">حذف مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_exportInvestors" data-group="investors">
                                        <label class="form-check-label" for="perm_exportInvestors">تصدير المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_importInvestors" data-group="investors">
                                        <label class="form-check-label" for="perm_importInvestors">استيراد المستثمرين</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة الاستثمارات -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة الاستثمارات</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewInvestments" data-group="investments" checked>
                                        <label class="form-check-label" for="perm_viewInvestments">عرض الاستثمارات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_addInvestment" data-group="investments">
                                        <label class="form-check-label" for="perm_addInvestment">إضافة استثمار</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_editInvestment" data-group="investments">
                                        <label class="form-check-label" for="perm_editInvestment">تعديل استثمار</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_deleteInvestment" data-group="investments">
                                        <label class="form-check-label" for="perm_deleteInvestment">حذف استثمار</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة العمليات المالية -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة العمليات المالية</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewOperations" data-group="operations">
                                        <label class="form-check-label" for="perm_viewOperations">عرض العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_approveOperations" data-group="operations">
                                        <label class="form-check-label" for="perm_approveOperations">الموافقة على العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_rejectOperations" data-group="operations">
                                        <label class="form-check-label" for="perm_rejectOperations">رفض العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_withdrawals" data-group="operations">
                                        <label class="form-check-label" for="perm_withdrawals">السحوبات</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- الأرباح والدفعات -->
                            <div class="permission-section">
                                <h4 class="permission-title">الأرباح والدفعات</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewProfits" data-group="profits">
                                        <label class="form-check-label" for="perm_viewProfits">عرض الأرباح</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_payProfits" data-group="profits">
                                        <label class="form-check-label" for="perm_payProfits">دفع الأرباح</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- التقارير -->
                            <div class="permission-section">
                                <h4 class="permission-title">التقارير</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewReports" data-group="reports">
                                        <label class="form-check-label" for="perm_viewReports">عرض التقارير</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_generateReports" data-group="reports">
                                        <label class="form-check-label" for="perm_generateReports">إنشاء التقارير</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_exportReports" data-group="reports">
                                        <label class="form-check-label" for="perm_exportReports">تصدير التقارير</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة النظام -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة النظام</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_viewSettings" data-group="system">
                                        <label class="form-check-label" for="perm_viewSettings">عرض الإعدادات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_editSettings" data-group="system">
                                        <label class="form-check-label" for="perm_editSettings">تعديل الإعدادات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_backup" data-group="system">
                                        <label class="form-check-label" for="perm_backup">النسخ الاحتياطي</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_restore" data-group="system">
                                        <label class="form-check-label" for="perm_restore">استعادة النسخ الاحتياطي</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_userManagement" data-group="system">
                                        <label class="form-check-label" for="perm_userManagement">إدارة المستخدمين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_activityLog" data-group="system">
                                        <label class="form-check-label" for="perm_activityLog">سجل الأنشطة</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="perm_systemSettings" data-group="system">
                                        <label class="form-check-label" for="perm_systemSettings">إعدادات النظام</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('addUserModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="securitySystem.saveNewUser()">
                    <i class="fas fa-save"></i> حفظ المستخدم
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة CSS للصلاحيات
    const style = document.createElement('style');
    style.textContent = `
        .permissions-container {
            margin-top: 20px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 10px;
            border: 1px solid #eee;
        }
        
        .permissions-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .permission-sections {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .permission-section {
            background-color: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .permission-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .permission-title {
            color: #2c3e50;
            font-size: 1.1rem;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .permissions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .form-check-input.permission-check:checked {
            background-color: #3498db;
            border-color: #3498db;
        }
        
        /* تنسيق متجاوب */
        @media (min-width: 768px) {
            .permission-sections {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // تحديث قوة كلمة المرور عند الكتابة
    const newPasswordInput = document.getElementById('newUserPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            checkNewUserPasswordStrength();
        });
    }
    
    // تحديث التطابق بين كلمة المرور وتأكيدها
    const confirmPasswordInput = document.getElementById('confirmUserPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
    }
    
    // تحديث الصلاحيات عند تغيير الدور
    const roleSelect = document.getElementById('newUserRole');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            loadDefaultPermissions(this.value);
        });
    }
    
    // تحميل الصلاحيات الافتراضية للمستخدم
    loadDefaultPermissions('user');
}

// التحقق من قوة كلمة مرور المستخدم الجديد
function checkNewUserPasswordStrength() {
    const password = document.getElementById('newUserPassword').value;
    const strengthMeter = document.getElementById('userStrengthMeter');
    const strengthText = document.getElementById('userStrengthText');
    
    if (!password || !strengthMeter || !strengthText) return;
    
    // متطلبات كلمة المرور
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // حساب قوة كلمة المرور (0-100)
    let strength = 0;
    
    if (requirements.length) strength += 20;
    if (requirements.uppercase) strength += 20;
    if (requirements.lowercase) strength += 20;
    if (requirements.number) strength += 20;
    if (requirements.special) strength += 20;
    
    // تحديث المؤشر البصري
    strengthMeter.style.width = `${strength}%`;
    
    if (strength < 40) {
        strengthMeter.style.backgroundColor = '#e74c3c'; // أحمر
        strengthText.textContent = 'ضعيفة';
        strengthText.style.color = '#e74c3c';
    } else if (strength < 70) {
        strengthMeter.style.backgroundColor = '#f39c12'; // برتقالي
        strengthText.textContent = 'متوسطة';
        strengthText.style.color = '#f39c12';
    } else {
        strengthMeter.style.backgroundColor = '#2ecc71'; // أخضر
        strengthText.textContent = 'قوية';
        strengthText.style.color = '#2ecc71';
    }
    
    // التحقق من تطابق كلمة المرور مع التأكيد
    checkPasswordMatch();
}

// التحقق من تطابق كلمة المرور مع التأكيد
function checkPasswordMatch() {
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmUserPassword').value;
    
    if (!password || !confirmPassword) return;
    
    const confirmInput = document.getElementById('confirmUserPassword');
    
    if (password === confirmPassword) {
        confirmInput.style.borderColor = '#2ecc71';
    } else {
        confirmInput.style.borderColor = '#e74c3c';
    }
}

// تحديد جميع الصلاحيات
function selectAllPermissions() {
    document.querySelectorAll('.permission-check').forEach(checkbox => {
        checkbox.checked = true;
    });
}

// إلغاء تحديد جميع الصلاحيات
function deselectAllPermissions() {
    document.querySelectorAll('.permission-check').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// تحميل الصلاحيات الافتراضية حسب الدور
function loadDefaultPermissions(role) {
    // إعادة تعيين جميع الصلاحيات
    deselectAllPermissions();
    
    if (role === 'admin') {
        // تحديد جميع الصلاحيات للمسؤول
        selectAllPermissions();
    } else {
        // الصلاحيات الافتراضية للمستخدم العادي
        const defaultUserPermissions = [
            'dashboard', 'investors', 'investments', 'calendar',
            'viewInvestors', 'viewInvestments'
        ];
        
        // تحديد الصلاحيات الافتراضية
        defaultUserPermissions.forEach(permission => {
            const checkbox = document.getElementById(`perm_${permission}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// حفظ المستخدم الجديد
function saveNewUser() {
    // الحصول على قيم النموذج
    const username = document.getElementById('newUsername').value;
    const fullName = document.getElementById('newFullName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    const requirePasswordChange = document.getElementById('requirePasswordChangeOnLogin').checked;
    const sendWelcomeEmail = document.getElementById('sendWelcomeEmail').checked;
    
    // التحقق من صحة النموذج
    if (!username || !fullName || !email || !password || !confirmPassword) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
        createNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'danger');
        return;
    }
    
    // التحقق من قوة كلمة المرور
    const passwordStrength = calculatePasswordStrength(password);
    if (passwordStrength < 60) {
        if (!confirm('كلمة المرور ضعيفة نسبياً. هل ترغب في المتابعة على أي حال؟')) {
            return;
        }
    }
    
    // التحقق من وجود اسم المستخدم
    if (users.some(u => u.username === username)) {
        createNotification('خطأ', 'اسم المستخدم موجود بالفعل', 'danger');
        return;
    }
    
    // التحقق من وجود البريد الإلكتروني
    if (users.some(u => u.email === email)) {
        createNotification('خطأ', 'البريد الإلكتروني مستخدم بالفعل', 'danger');
        return;
    }
    
    // جمع الصلاحيات
    const permissions = {};
    document.querySelectorAll('.permission-check').forEach(checkbox => {
        const permName = checkbox.id.replace('perm_', '');
        permissions[permName] = checkbox.checked;
    });
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: generateId(),
        username,
        password,
        fullName,
        email,
        role,
        permissions,
        requirePasswordChange,
        createdAt: new Date().toISOString(),
        createdBy: currentUser ? currentUser.id : 'system',
        lastLogin: null,
        failedLoginAttempts: 0,
        isLocked: false
    };
    
    // إضافة المستخدم إلى مصفوفة المستخدمين
    users.push(newUser);
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // إرسال بريد ترحيبي (في التطبيق الحقيقي)
    if (sendWelcomeEmail) {
        // هنا يمكن إضافة وظيفة لإرسال البريد الإلكتروني
        console.log(`إرسال بريد ترحيبي إلى ${email} مع بيانات تسجيل الدخول`);
    }
    
    // تسجيل نشاط إنشاء المستخدم
    logActivity('user', `تم إنشاء مستخدم جديد: ${username} (${role})`, currentUser ? currentUser.id : 'system');
    
    // إغلاق النافذة
    closeModal('addUserModal');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم إضافة المستخدم بنجاح', 'success');
}

// حساب قوة كلمة المرور
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // طول كلمة المرور
    if (password.length >= 8) strength += 20;
    else if (password.length >= 6) strength += 10;
    
    // أحرف كبيرة
    if (/[A-Z]/.test(password)) strength += 20;
    
    // أحرف صغيرة
    if (/[a-z]/.test(password)) strength += 20;
    
    // أرقام
    if (/[0-9]/.test(password)) strength += 20;
    
    // أحرف خاصة
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    return strength;
}

// فتح نافذة تعديل المستخدم
function editUser(id) {
    // البحث عن المستخدم
    const user = users.find(u => u.id === id);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editUserModal';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title"><i class="fas fa-user-edit"></i> تعديل المستخدم</h2>
                <div class="modal-close" onclick="closeModal('editUserModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="editUserForm">
                    <!-- معلومات المستخدم -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">اسم المستخدم</label>
                            <input type="text" class="form-control" id="editUsername" value="${user.username}" ${user.username === 'admin' ? 'readonly' : ''}>
                            <div class="form-text">سيستخدم لتسجيل الدخول.</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="editUserEmail" value="${user.email || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-control" id="editFullName" value="${user.fullName}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الدور</label>
                            <select class="form-select" id="editUserRole" ${user.username === 'admin' ? 'disabled' : ''}>
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول النظام</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة (اترك فارغة للإبقاء على كلمة المرور الحالية)</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="editUserPassword">
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('editUserPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength" id="editUserPasswordStrength">
                                <div class="strength-meter">
                                    <div class="strength-meter-fill" id="editUserStrengthMeter"></div>
                                </div>
                                <div class="strength-text" id="editUserStrengthText">ضعيفة</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="confirmEditUserPassword">
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('confirmEditUserPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- خيارات الحساب -->
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="editRequirePasswordChange" ${user.requirePasswordChange ? 'checked' : ''}>
                            <label class="form-check-label" for="editRequirePasswordChange">إلزام المستخدم بتغيير كلمة المرور عند تسجيل الدخول التالي</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="editIsLocked" ${user.isLocked ? 'checked' : ''}>
                            <label class="form-check-label" for="editIsLocked">حظر تسجيل الدخول للحساب</label>
                        </div>
                    </div>
                    
                    ${user.username === 'admin' ? '' : `
                    <!-- جزء الصلاحيات -->
                    <div class="permissions-container">
                        <h3 class="form-subtitle"><i class="fas fa-lock"></i> صلاحيات المستخدم</h3>
                        
                        <!-- أزرار التحديد/إلغاء التحديد للكل -->
                        <div class="permissions-actions">
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="securitySystem.selectAllPermissions()">
                                <i class="fas fa-check-square"></i> تحديد الكل
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="securitySystem.deselectAllPermissions()">
                                <i class="fas fa-square"></i> إلغاء تحديد الكل
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-info" onclick="securitySystem.loadDefaultPermissions('user')">
                                <i class="fas fa-user"></i> إعدادات المستخدم الافتراضية
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-warning" onclick="securitySystem.loadDefaultPermissions('admin')">
                                <i class="fas fa-user-shield"></i> إعدادات المسؤول الافتراضية
                            </button>
                        </div>
                        
                        <!-- مجموعات الصلاحيات -->
                        <div class="permission-sections">
                            <!-- الصفحات الرئيسية -->
                            <div class="permission-section">
                                <h4 class="permission-title">الصفحات الرئيسية</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_dashboard" data-group="pages" ${user.permissions.dashboard ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_dashboard">الرئيسية</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_analytics" data-group="pages" ${user.permissions.analytics ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_analytics">التحليلات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_investors" data-group="pages" ${user.permissions.investors ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_investors">المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_investments" data-group="pages" ${user.permissions.investments ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_investments">الاستثمارات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_profits" data-group="pages" ${user.permissions.profits ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_profits">الأرباح</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_operations" data-group="pages" ${user.permissions.operations ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_operations">العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_reports" data-group="pages" ${user.permissions.reports ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_reports">التقارير</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_financial" data-group="pages" ${user.permissions.financial ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_financial">التقارير المالية</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_calendar" data-group="pages" ${user.permissions.calendar ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_calendar">التقويم</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_settings" data-group="pages" ${user.permissions.settings ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_settings">الإعدادات</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة المستثمرين -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة المستثمرين</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_viewInvestors" data-group="investors" ${user.permissions.viewInvestors ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_viewInvestors">عرض المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_addInvestor" data-group="investors" ${user.permissions.addInvestor ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_addInvestor">إضافة مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_editInvestor" data-group="investors" ${user.permissions.editInvestor ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_editInvestor">تعديل مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_deleteInvestor" data-group="investors" ${user.permissions.deleteInvestor ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_deleteInvestor">حذف مستثمر</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_exportInvestors" data-group="investors" ${user.permissions.exportInvestors ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_exportInvestors">تصدير المستثمرين</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_importInvestors" data-group="investors" ${user.permissions.importInvestors ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_importInvestors">استيراد المستثمرين</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- إدارة الاستثمارات -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة الاستثمارات</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_viewInvestments" data-group="investments" ${user.permissions.viewInvestments ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_viewInvestments">عرض الاستثمارات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_addInvestment" data-group="investments" ${user.permissions.addInvestment ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_addInvestment">إضافة استثمار</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_editInvestment" data-group="investments" ${user.permissions.editInvestment ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_editInvestment">تعديل استثمار</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_deleteInvestment" data-group="investments" ${user.permissions.deleteInvestment ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_deleteInvestment">حذف استثمار</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- باقي أقسام الصلاحيات -->
                            <!-- العمليات المالية -->
                            <div class="permission-section">
                                <h4 class="permission-title">إدارة العمليات المالية</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_viewOperations" data-group="operations" ${user.permissions.viewOperations ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_viewOperations">عرض العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_approveOperations" data-group="operations" ${user.permissions.approveOperations ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_approveOperations">الموافقة على العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_rejectOperations" data-group="operations" ${user.permissions.rejectOperations ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_rejectOperations">رفض العمليات</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_withdrawals" data-group="operations" ${user.permissions.withdrawals ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_withdrawals">السحوبات</label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- الأرباح والدفعات -->
                            <div class="permission-section">
                                <h4 class="permission-title">الأرباح والدفعات</h4>
                                <div class="permissions-grid">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_viewProfits" data-group="profits" ${user.permissions.viewProfits ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_viewProfits">عرض الأرباح</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input permission-check" id="edit_perm_payProfits" data-group="profits" ${user.permissions.payProfits ? 'checked' : ''}>
                                        <label class="form-check-label" for="edit_perm_payProfits">دفع الأرباح</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `}
                    
                    <input type="hidden" id="editUserId" value="${user.id}">
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('editUserModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="securitySystem.updateUser()">
                    <i class="fas fa-save"></i> حفظ التغييرات
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تحديث قوة كلمة المرور عند الكتابة
    const editPasswordInput = document.getElementById('editUserPassword');
    if (editPasswordInput) {
        editPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthMeter = document.getElementById('editUserStrengthMeter');
            const strengthText = document.getElementById('editUserStrengthText');
            
            if (!password) {
                strengthMeter.style.width = '0%';
                strengthText.textContent = '';
                return;
            }
            
            const strength = calculatePasswordStrength(password);
            
            strengthMeter.style.width = `${strength}%`;
            
            if (strength < 40) {
                strengthMeter.style.backgroundColor = '#e74c3c';
                strengthText.textContent = 'ضعيفة';
                strengthText.style.color = '#e74c3c';
            } else if (strength < 70) {
                strengthMeter.style.backgroundColor = '#f39c12';
                strengthText.textContent = 'متوسطة';
                strengthText.style.color = '#f39c12';
            } else {
                strengthMeter.style.backgroundColor = '#2ecc71';
                strengthText.textContent = 'قوية';
                strengthText.style.color = '#2ecc71';
            }
        });
    }
    
    // التحقق من تطابق كلمة المرور عند الكتابة
    const confirmEditPasswordInput = document.getElementById('confirmEditUserPassword');
    if (confirmEditPasswordInput) {
        confirmEditPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('editUserPassword').value;
            
            if (this.value && password && this.value !== password) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#2ecc71';
            }
        });
    }
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
    const email = document.getElementById('editUserEmail').value;
    const password = document.getElementById('editUserPassword').value;
    const confirmPassword = document.getElementById('confirmEditUserPassword').value;
    const role = document.getElementById('editUserRole').value;
    const requirePasswordChange = document.getElementById('editRequirePasswordChange')?.checked || false;
    const isLocked = document.getElementById('editIsLocked')?.checked || false;
    
    // التحقق من صحة النموذج
    if (!username || !fullName || !email) {
        createNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
        return;
    }
    
    // التحقق من تطابق كلمة المرور إذا تم تغييرها
    if (password && password !== confirmPassword) {
        createNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'danger');
        return;
    }
    
    // التحقق من قوة كلمة المرور إذا تم تغييرها
    if (password && calculatePasswordStrength(password) < 60) {
        if (!confirm('كلمة المرور ضعيفة نسبياً. هل ترغب في المتابعة على أي حال؟')) {
            return;
        }
    }
    
    // التحقق من وجود اسم المستخدم
    if (username !== user.username && users.some(u => u.username === username)) {
        createNotification('خطأ', 'اسم المستخدم موجود بالفعل', 'danger');
        return;
    }
    
    // التحقق من وجود البريد الإلكتروني
    if (email !== user.email && users.some(u => u.email === email)) {
        createNotification('خطأ', 'البريد الإلكتروني مستخدم بالفعل', 'danger');
        return;
    }
    
    // تحديث معلومات المستخدم الأساسية
    user.username = username;
    user.fullName = fullName;
    user.email = email;
    user.requirePasswordChange = requirePasswordChange;
    user.isLocked = isLocked;
    
    // تحديث كلمة المرور إذا تم تغييرها
    if (password) {
        user.password = password;
    }
    
    // تحديث الدور إذا لم يكن مسؤولاً
    if (user.username !== 'admin') {
        user.role = role;
        
        // تحديث الصلاحيات
        if (role === 'admin') {
            // المسؤول يملك جميع الصلاحيات
            user.permissions = {
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
                viewInvestors: true,
                addInvestor: true,
                editInvestor: true,
                deleteInvestor: true,
                exportInvestors: true,
                importInvestors: true,
                viewInvestments: true,
                addInvestment: true,
                editInvestment: true,
                deleteInvestment: true,
                viewOperations: true,
                approveOperations: true,
                rejectOperations: true,
                withdrawals: true,
                viewProfits: true,
                payProfits: true,
                viewReports: true,
                generateReports: true,
                exportReports: true,
                viewSettings: true,
                editSettings: true,
                backup: true,
                restore: true,
                userManagement: true,
                activityLog: true,
                systemSettings: true
            };
        } else {
            // جمع الصلاحيات من النموذج
            const permissions = {};
            document.querySelectorAll('.permission-check').forEach(checkbox => {
                const permName = checkbox.id.replace('edit_perm_', '');
                permissions[permName] = checkbox.checked;
            });
            
            user.permissions = permissions;
        }
    }
    
    // تحديث معلومات الدخول
    user.updatedAt = new Date().toISOString();
    user.updatedBy = currentUser ? currentUser.id : 'system';
    
    // تحديث معلومات المستخدم الحالي إذا كان يعدل نفسه
    if (currentUser && currentUser.id === user.id) {
        // نسخة من المستخدم بدون كلمة المرور
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        currentUser = userWithoutPassword;
        
        // تحديث واجهة المستخدم
        updateUIWithUserInfo(currentUser);
        
        // تحديث بيانات الجلسة
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // إذا كان المستخدم مغلقاً، تسجيل الخروج
        if (user.isLocked) {
            setTimeout(() => {
                logout();
            }, 2000);
        }
    }
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // تسجيل نشاط تحديث المستخدم
    logActivity('user', `تم تحديث بيانات المستخدم: ${username}`, currentUser ? currentUser.id : 'system');
    
    // إغلاق النافذة
    closeModal('editUserModal');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم تحديث بيانات المستخدم بنجاح', 'success');
}

// فتح قفل المستخدم
function unlockUser(id) {
    const user = users.find(u => u.id === id);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // تحديث حالة القفل
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // تسجيل نشاط فتح قفل المستخدم
    logActivity('user', `تم فتح قفل المستخدم: ${user.username}`, currentUser ? currentUser.id : 'system');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', `تم فتح قفل المستخدم ${user.fullName} بنجاح`, 'success');
}

// حذف المستخدم
function deleteUser(id) {
    const user = users.find(u => u.id === id);
    
    if (!user) {
        createNotification('خطأ', 'المستخدم غير موجود', 'danger');
        return;
    }
    
    // لا يمكن حذف المستخدم المسؤول
    if (user.username === 'admin') {
        createNotification('خطأ', 'لا يمكن حذف المستخدم المسؤول', 'danger');
        return;
    }
    
    // لا يمكن للمستخدم حذف نفسه
    if (currentUser && currentUser.id === user.id) {
        createNotification('خطأ', 'لا يمكنك حذف حسابك الحالي', 'danger');
        return;
    }
    
    // تأكيد الحذف
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.fullName}"؟ سيتم حذف جميع بياناته، ولا يمكن التراجع عن هذا الإجراء.`)) {
        return;
    }
    
    // حذف المستخدم
    users = users.filter(u => u.id !== id);
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // تسجيل نشاط حذف المستخدم
    logActivity('user', `تم حذف المستخدم: ${user.username}`, currentUser ? currentUser.id : 'system');
    
    // تحديث جدول المستخدمين
    populateUsersTable();
    
    // عرض إشعار النجاح
    createNotification('نجاح', `تم حذف المستخدم ${user.fullName} بنجاح`, 'success');
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
    
    // التحقق من قوة كلمة المرور الجديدة
    const passwordStrength = calculatePasswordStrength(newPassword);
    if (passwordStrength < 60) {
        if (!confirm('كلمة المرور الجديدة ضعيفة. هل ترغب في المتابعة؟')) {
            return;
        }
    }
    
    // تحديث كلمة المرور
    user.password = newPassword;
    
    // تحديث معلومات المستخدم
    user.requirePasswordChange = false;
    user.updatedAt = new Date().toISOString();
    
    // حفظ المستخدمين في التخزين المحلي
    saveUsers();
    
    // تسجيل نشاط تغيير كلمة المرور
    logActivity('security', 'تم تغيير كلمة المرور', user.id);
    
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
    const enforceStrongPasswords = document.getElementById('enforceStrongPasswords').checked;
    const passwordResetDays = parseInt(document.getElementById('passwordResetDays').value) || 0;
    
    const sessionDuration = parseInt(document.getElementById('sessionDuration').value) || 30;
    const singleSessionOnly = document.getElementById('singleSessionOnly').checked;
    
    const enableLoginNotifications = document.getElementById('enableLoginNotifications').checked;
    const notifyUnusualLogin = document.getElementById('notifyUnusualLogin').checked;
    const notifyPasswordChange = document.getElementById('notifyPasswordChange').checked;
    const notifyPermissionChange = document.getElementById('notifyPermissionChange').checked;
    
    const maxLoginAttempts = parseInt(document.getElementById('maxLoginAttempts').value) || 5;
    const accountLockDuration = parseInt(document.getElementById('accountLockDuration').value) || 30;
    const twoFactorEnabled = document.getElementById('twoFactorEnabled').checked;
    
    // تحديث إعدادات الأمان العامة
    const securitySettings = {
        requirePasswordChange,
        enforceStrongPasswords,
        passwordResetDays,
        sessionDuration,
        singleSessionOnly,
        enableLoginNotifications,
        notifyUnusualLogin,
        notifyPasswordChange,
        notifyPermissionChange,
        maxLoginAttempts,
        accountLockDuration,
        twoFactorEnabled,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser ? currentUser.id : 'system'
    };
    
    // حفظ الإعدادات في التخزين المحلي
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    
    // تحديث المتغيرات العامة
    window.MAX_LOGIN_ATTEMPTS = maxLoginAttempts;
    window.DEFAULT_SESSION_DURATION = sessionDuration;
    
    // إعادة تعيين مؤقت الجلسة
    setupSessionTimeout();
    
    // تسجيل نشاط حفظ إعدادات الأمان
    logActivity('settings', 'تم تحديث إعدادات الأمان', currentUser ? currentUser.id : 'system');
    
    // عرض إشعار النجاح
    createNotification('نجاح', 'تم حفظ إعدادات الأمان بنجاح', 'success');
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
                    failedLoginAttempts: 0,
                    isLocked: false,
                    email: 'admin@example.com',
                    createdAt: new Date().toISOString(),
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
                        viewInvestors: true,
                        addInvestor: true,
                        editInvestor: true,
                        deleteInvestor: true,
                        exportInvestors: true,
                        importInvestors: true,
                        viewInvestments: true,
                        addInvestment: true,
                        editInvestment: true,
                        deleteInvestment: true,
                        viewOperations: true,
                        approveOperations: true,
                        rejectOperations: true,
                        withdrawals: true,
                        viewProfits: true,
                        payProfits: true,
                        viewReports: true,
                        generateReports: true,
                        exportReports: true,
                        viewSettings: true,
                        editSettings: true,
                        backup: true,
                        restore: true,
                        userManagement: true,
                        activityLog: true,
                        systemSettings: true
                    }
                });
            }
        }
        
        // تحميل سجل الأنشطة
        const storedActivityLog = localStorage.getItem('activityLog');
        if (storedActivityLog) {
            activityLog = JSON.parse(storedActivityLog);
        }
        
        // تحميل إعدادات الأمان
        const storedSecuritySettings = localStorage.getItem('securitySettings');
        if (storedSecuritySettings) {
            const securitySettings = JSON.parse(storedSecuritySettings);
            
            // تحديث المتغيرات العامة
            window.MAX_LOGIN_ATTEMPTS = securitySettings.maxLoginAttempts || 5;
            window.DEFAULT_SESSION_DURATION = securitySettings.sessionDuration || 30;
        }
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// حفظ المستخدمين في التخزين المحلي
function saveUsers() {
    try {
        // نسخة من المستخدمين مع إزالة بعض الحقول الحساسة للإظهار في التخزين
        const usersToSave = users.map(user => {
            // إنشاء نسخة من المستخدم لتجنب تعديل الكائن الأصلي
            const userCopy = { ...user };
            
            // في تطبيق حقيقي، يجب تشفير كلمات المرور قبل التخزين
            // هنا نحتفظ بالكلمة بشكل نصي لأغراض الاختبار
            
            return userCopy;
        });
        
        localStorage.setItem('securityUsers', JSON.stringify(usersToSave));
    } catch (error) {
        console.error('خطأ في حفظ المستخدمين:', error);
    }
}

// إعداد مراقبة انتهاء الجلسة
function setupSessionTimeout() {
    // تحديث مدة الجلسة من الإعدادات
    const sessionDuration = parseInt(localStorage.getItem('sessionDuration')) || DEFAULT_SESSION_DURATION;
    
    // تحويل المدة إلى ميلي ثانية
    const timeout = sessionDuration * 60 * 1000;
    
    // مسح المؤقت الحالي إذا وجد
    if (window.sessionTimer) {
        clearTimeout(window.sessionTimer);
    }
    
    // وظيفة إعادة تعيين المؤقت
    function resetTimer() {
        clearTimeout(window.sessionTimer);
        window.sessionTimer = setTimeout(logout, timeout);
    }
    
    // إعادة تعيين المؤقت عند أي نشاط
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, false);
    });
    
    // بدء المؤقت
    resetTimer();
}

// تصدير وظائف النظام للوصول إليها من خارج الملف
window.securitySystemPart2 = {
    // وظائف سجل الأنشطة
    exportActivityLog,
    clearActivityLog,
    filterActivityLog,
    
    // وظائف إدارة المستخدمين
    openAddUserModal,
    saveNewUser,
    editUser,
    updateUser,
    unlockUser,
    deleteUser,
    togglePasswordField: togglePasswordVisibility,
    
    // وظائف إدارة الصلاحيات
    selectAllPermissions,
    deselectAllPermissions,
    loadDefaultPermissions,
    
    // وظائف إدارة المستخدم الحالي
    changeCurrentUserPassword,
    
    // وظائف إعدادات الأمان
    saveSecuritySettings,
    
    // وظائف مساعدة لفحص كلمة المرور
    checkNewUserPasswordStrength,
    checkPasswordMatch
};


/**
 * إضافة زر الأمان في الشريط الجانبي - يظهر فقط للمسؤول
 */
function addSecuritySidebarButton() {
    // التحقق من وجود المستخدم وأنه مسؤول
    if (!currentUser || currentUser.role !== 'admin') {
        console.log("عدم إضافة زر الأمان في الشريط الجانبي - المستخدم ليس مسؤولاً");
        return;
    }
    
    // البحث عن الشريط الجانبي
    const sidebar = document.querySelector('.sidebar-menu');
    if (!sidebar) {
        console.log("عدم إضافة زر الأمان في الشريط الجانبي - لا يوجد شريط جانبي");
        return;
    }
    
    // التحقق من عدم وجود الزر مسبقاً
    if (document.querySelector('.menu-item[href="#security"]')) {
        console.log("عدم إضافة زر الأمان في الشريط الجانبي - الزر موجود بالفعل");
        return;
    }
    
    console.log("إضافة زر الأمان في الشريط الجانبي للمسؤول");
    
    // إنشاء زر الأمان
    const securityButton = document.createElement('a');
    securityButton.href = "#security";
    securityButton.className = "menu-item admin-only";
    securityButton.setAttribute('data-permission', 'admin');
    securityButton.onclick = function() { showSecurityPage(); return false; };
    securityButton.innerHTML = `
        <div class="menu-icon">
            <i class="fas fa-shield-alt"></i>
        </div>
        <span class="menu-title">الأمان والمستخدمين</span>
    `;
    
    // إضافة الزر إلى الشريط الجانبي قبل زر الإعدادات
    const settingsButton = document.querySelector('.menu-item[href="#settings"]');
    if (settingsButton) {
        sidebar.insertBefore(securityButton, settingsButton);
        console.log("تم إضافة زر الأمان قبل زر الإعدادات");
    } else {
        // إذا لم يتم العثور على زر الإعدادات، أضف الزر في نهاية القائمة
        sidebar.appendChild(securityButton);
        console.log("تم إضافة زر الأمان في نهاية القائمة");
    }
    
    // إنشاء صفحة الأمان إذا لم تكن موجودة
    createSecurityPage();
}

// إنشاء صفحة الأمان
function createSecurityPage() {
    // التحقق من عدم وجود الصفحة مسبقاً
    if (document.getElementById('security')) return;
    
    // إنشاء صفحة الأمان
    const securityPage = document.createElement('div');
    securityPage.id = "security";
    securityPage.className = "page";
    
    securityPage.innerHTML = `
        <div class="page-header">
            <h1 class="page-title"><i class="fas fa-shield-alt"></i> الأمان وإدارة المستخدمين</h1>
            <p class="page-subtitle">إدارة المستخدمين والصلاحيات وإعدادات الأمان</p>
        </div>
        
        <div class="form-container">
            <!-- قسم إدارة المستخدمين -->
            <div class="form-header">
                <h2 class="form-title"><i class="fas fa-users-cog"></i> إدارة المستخدمين</h2>
                <p class="form-subtitle">إضافة وتعديل المستخدمين وإدارة الصلاحيات</p>
            </div>
            
            <div class="table-container">
                <div class="table-header">
                    <div class="table-title">قائمة المستخدمين</div>
                    <button class="btn btn-primary" onclick="securitySystem.openAddUserModal()">
                        <i class="fas fa-user-plus"></i> إضافة مستخدم
                    </button>
                </div>
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
                        <!-- سيتم ملؤها بواسطة JavaScript -->
                    </tbody>
                </table>
            </div>
            
            <!-- قسم كلمة المرور -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title"><i class="fas fa-key"></i> تغيير كلمة المرور</h2>
                </div>
                <form id="changePasswordForm" onsubmit="securitySystem.changeCurrentUserPassword(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الحالية</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="currentPassword" required>
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('currentPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="newPassword" required>
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('newPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength" id="passwordStrength">
                                <div class="strength-meter">
                                    <div class="strength-meter-fill" id="strengthMeter"></div>
                                </div>
                                <div class="strength-text" id="strengthText">ضعيفة</div>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                            <div class="password-input-container">
                                <input type="password" class="form-control" id="confirmPassword" required>
                                <button type="button" class="password-toggle" onclick="securitySystem.togglePasswordField('confirmPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="password-requirements">
                                <h4>متطلبات كلمة المرور:</h4>
                                <ul>
                                    <li id="req-length"><i class="fas fa-times-circle"></i> 8 أحرف على الأقل</li>
                                    <li id="req-uppercase"><i class="fas fa-times-circle"></i> حرف كبير واحد على الأقل</li>
                                    <li id="req-lowercase"><i class="fas fa-times-circle"></i> حرف صغير واحد على الأقل</li>
                                    <li id="req-number"><i class="fas fa-times-circle"></i> رقم واحد على الأقل</li>
                                    <li id="req-special"><i class="fas fa-times-circle"></i> حرف خاص واحد على الأقل</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> تغيير كلمة المرور
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- باقي محتويات صفحة الأمان (نفس المحتوى من تبويب الأمان) -->
            
            <!-- سجل الأنشطة -->
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title"><i class="fas fa-history"></i> سجل الأنشطة</h2>
                </div>
                <div class="activity-log-filters">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">تصفية حسب النوع</label>
                            <select class="form-select" id="activityTypeFilter" onchange="securitySystem.filterActivityLog()">
                                <option value="all">الكل</option>
                                <option value="login">تسجيل الدخول</option>
                                <option value="logout">تسجيل الخروج</option>
                                <option value="security">الأمان</option>
                                <option value="user">إدارة المستخدمين</option>
                                <option value="settings">الإعدادات</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تصفية حسب المستخدم</label>
                            <select class="form-select" id="activityUserFilter" onchange="securitySystem.filterActivityLog()">
                                <option value="all">الكل</option>
                                <!-- سيتم ملؤها بواسطة JavaScript -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تصفية حسب التاريخ</label>
                            <input type="date" class="form-control" id="activityDateFilter" onchange="securitySystem.filterActivityLog()">
                        </div>
                    </div>
                </div>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>التاريخ والوقت</th>
                                <th>المستخدم</th>
                                <th>النوع</th>
                                <th>الوصف</th>
                                <th>عنوان IP</th>
                            </tr>
                        </thead>
                        <tbody id="activityLogTableBody">
                            <!-- سيتم ملؤها بواسطة JavaScript -->
                        </tbody>
                    </table>
                </div>
                <div class="activity-log-actions">
                    <button class="btn btn-primary" onclick="securitySystem.exportActivityLog()">
                        <i class="fas fa-file-export"></i> تصدير السجل
                    </button>
                    <button class="btn btn-danger" onclick="securitySystem.clearActivityLog()">
                        <i class="fas fa-trash"></i> مسح السجل
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة إلى الوثيقة
    document.querySelector('.content').appendChild(securityPage);
    
    // ربط مستمعات الأحداث
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // ملء جدول المستخدمين
    populateUsersTable();
    
    // ملء سجل الأنشطة
    populateActivityLog();
    
    // ملء قائمة المستخدمين في تصفية سجل الأنشطة
    populateActivityUserFilter();
}

// عرض صفحة الأمان
function showSecurityPage() {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // عرض صفحة الأمان
    document.getElementById('security').classList.add('active');
    
    // تحديث العنصر النشط في القائمة
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector('.menu-item[href="#security"]').classList.add('active');
    
    // تحديث جدول المستخدمين وسجل الأنشطة
    populateUsersTable();
    populateActivityLog();
}

// تصدير وظائف النظام للوصول إليها من خارج الملف
window.securitySystem = {
    // تهيئة النظام
    initSecuritySystem,
    
    // وظائف تسجيل الدخول والخروج
    attemptLogin,
    logout,
    togglePasswordVisibility,
    showForgotPasswordForm,
    resetPassword,
    showHelpInfo,
    
    // وظائف الشريط الجانبي (جديدة)
    addSecuritySidebarButton,
    showSecurityPage,
    
    // وظائف إدارة المستخدمين
    openAddUserModal,
    saveNewUser,
    editUser,
    updateUser,
    unlockUser,
    deleteUser,
    togglePasswordField: togglePasswordVisibility,
    
    // وظائف إدارة الصلاحيات
    selectAllPermissions,
    deselectAllPermissions,
    loadDefaultPermissions,
    
    // وظائف إدارة المستخدم الحالي
    changeCurrentUserPassword,
    
    // وظائف سجل الأنشطة
    exportActivityLog,
    clearActivityLog,
    filterActivityLog,
    
    // وظائف إعدادات الأمان
    saveSecuritySettings
};



/**
 * تطبيق الصلاحيات على العناصر المضافة ديناميكياً
 */
function applyDynamicPermissions(permissions) {
    console.log("تطبيق الصلاحيات على العناصر الديناميكية");
    
    // أزرار تفاصيل المستثمر الديناميكية
    if (!permissions.editInvestor) {
        hideElements('.investor-actions button[onclick*="editInvestor"]');
        hideElements('.investor-details-buttons button[onclick*="editInvestor"]');
        console.log("إخفاء أزرار تعديل المستثمر الديناميكية");
    }
    
    if (!permissions.deleteInvestor) {
        hideElements('.investor-actions button[onclick*="deleteInvestor"]');
        hideElements('.investor-actions button[onclick*="openDeleteConfirmationModal"][onclick*="\'investor\'"]');
        hideElements('.investor-details-buttons button[onclick*="deleteInvestor"]');
        console.log("إخفاء أزرار حذف المستثمر الديناميكية");
    }
    
    // أزرار تفاصيل الاستثمار الديناميكية
    if (!permissions.editInvestment) {
        hideElements('.investment-actions button[onclick*="editInvestment"]');
        hideElements('.investment-details-buttons button[onclick*="editInvestment"]');
        console.log("إخفاء أزرار تعديل الاستثمار الديناميكية");
    }
    
    if (!permissions.deleteInvestment) {
        hideElements('.investment-actions button[onclick*="deleteInvestment"]');
        hideElements('.investment-actions button[onclick*="openDeleteConfirmationModal"][onclick*="\'investment\'"]');
        hideElements('.investment-details-buttons button[onclick*="deleteInvestment"]');
        console.log("إخفاء أزرار حذف الاستثمار الديناميكية");
    }
    
    if (!permissions.withdrawals) {
        hideElements('.investment-actions button[onclick*="openWithdrawModal"]');
        hideElements('.investment-details-buttons button[onclick*="openWithdrawModal"]');
        console.log("إخفاء أزرار السحب الديناميكية");
    }
    
    if (!permissions.payProfits) {
        hideElements('.investment-actions button[onclick*="openPayProfitModal"]');
        hideElements('.investment-details-buttons button[onclick*="openPayProfitModal"]');
        console.log("إخفاء أزرار دفع الأرباح الديناميكية");
    }
}




/**
 * إعداد مراقب للمحتوى الديناميكي لإعادة تطبيق الصلاحيات
 */
function setupDynamicContentObserver() {
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
                        // البحث عن الأزرار أو الجداول
                        if (
                            node.tagName === 'BUTTON' || 
                            node.tagName === 'TABLE' || 
                            node.querySelector('button') || 
                            node.querySelector('table')
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
            applyDynamicPermissions(currentUser.permissions);
        }
    });
    
    // بدء المراقبة على كامل الوثيقة
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log("تم إعداد مراقب المحتوى الديناميكي");
}

/**
 * تصدير وظائف النظام للوصول إليها من خارج الملف
 */
window.securitySystem = {
    // وظائف تسجيل الدخول
    initSecuritySystem,
    attemptLogin,
    logout,
    togglePasswordVisibility,
    showForgotPasswordForm,
    resetPassword,
    showHelpInfo,
    
    // وظائف إدارة الصلاحيات
    applyUserPermissions,
    hideElements,
    showElements,
    
    // وظائف الشريط الجانبي
    addSecuritySidebarButton,
    showSecurityPage: function() {
        // التحقق من الصلاحيات قبل عرض الصفحة
        if (!currentUser || currentUser.role !== 'admin') {
            console.log("رفض الوصول إلى صفحة الأمان - المستخدم ليس مسؤولاً");
            createNotification('خطأ', 'ليس لديك صلاحية للوصول إلى هذه الصفحة', 'danger');
            return false;
        }
        
        // عرض صفحة الأمان
        if (typeof window.showSecurityPage === 'function') {
            window.showSecurityPage();
            return true;
        }
        return false;
    },
    
    // باقي الوظائف...
    openAddUserModal,
    saveNewUser,
    editUser,
    updateUser,
    unlockUser,
    deleteUser,
    togglePasswordField: togglePasswordVisibility,
    selectAllPermissions,
    deselectAllPermissions,
    loadDefaultPermissions,
    changeCurrentUserPassword,
    exportActivityLog,
    clearActivityLog,
    filterActivityLog,
    saveSecuritySettings
};