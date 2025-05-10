

// في دالة تسجيل الدخول
function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('بدء عملية تسجيل الدخول...');
    console.log('البريد الإلكتروني:', email);
    
    // إظهار مؤشر التحميل
    showLoadingIndicator();
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // تسجيل الدخول بنجاح
            console.log('تم تسجيل الدخول بنجاح');
            const user = userCredential.user;
            console.log('معلومات المستخدم:', user);
            
            // إخفاء مؤشر التحميل
            hideLoadingIndicator();
            
            // إغلاق نافذة تسجيل الدخول
            closeModal('loginModal');
            closeModal('syncDialog');
            
            // تحديث حالة المزامنة
            updateSyncStatus('متصل', 'active');
            
            // إظهار رسالة نجاح
            createNotification('نجاح', 'تم تسجيل الدخول بنجاح', 'success');
        })
        .catch((error) => {
            console.error('خطأ في تسجيل الدخول:', error);
            console.error('رمز الخطأ:', error.code);
            console.error('رسالة الخطأ:', error.message);
            
            // إخفاء مؤشر التحميل
            hideLoadingIndicator();
            
            // عرض رسالة الخطأ
            let errorMessage = 'حدث خطأ في تسجيل الدخول';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'البريد الإلكتروني غير صالح';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'تم تعطيل هذا الحساب';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'المستخدم غير موجود';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'كلمة المرور غير صحيحة';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'خطأ في الاتصال بالإنترنت';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'تم تجاوز عدد المحاولات المسموح. حاول لاحقاً';
                    break;
            }
            
            createNotification('خطأ', errorMessage, 'danger');
        });
}

// دالة للتحقق من حالة Firebase
function checkFirebaseStatus() {
    console.log('التحقق من حالة Firebase...');
    
    if (!firebase || !firebase.auth) {
        console.error('Firebase غير محمل بشكل صحيح');
        return false;
    }
    
    console.log('Firebase محمل بنجاح');
    
    // التحقق من إعدادات المشروع
    if (firebase.apps.length === 0) {
        console.error('لم يتم تهيئة تطبيق Firebase');
        return false;
    }
    
    console.log('تطبيق Firebase مهيأ:', firebase.apps[0].name);
    return true;
}

// دالة لإظهار/إخفاء مؤشر التحميل
function showLoadingIndicator() {
    const loginButton = document.querySelector('#loginForm button[type="submit"]');
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    }
}

function hideLoadingIndicator() {
    const loginButton = document.querySelector('#loginForm button[type="submit"]');
    if (loginButton) {
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
    }
}

// التحقق من الحالة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    checkFirebaseStatus();
});