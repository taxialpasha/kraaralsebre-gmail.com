/**
 * Modal Window Enhancement - نسخة محسنة آمنة
 * 
 * يضيف وظائف إضافية للنوافذ المنبثقة:
 * - أزرار التحكم (تكبير/إغلاق)
 * - السحب والإفلات للنوافذ
 * - تغيير حجم النوافذ
 * - نقر مزدوج للتكبير/التصغير
 * 
 * آمن بالكامل ولا يتداخل مع وظائف Firebase أو التطبيق الأساسي
 */

(function() {
    'use strict';
    
    // قائمة بكل معرفات النوافذ التي يجب تجاهلها
    const FIREBASE_DIALOGS = [
        'syncDialog',
        'loginModal',
        'signupModal',
        'firebaseModal',
        'activitiesLogModal'
    ];
    
    // قائمة بالكلاسات التي يجب تجاهلها
    const FIREBASE_CLASSES = [
        'firebase-modal',
        'firebase-dialog',
        'sync-modal',
        'auth-modal'
    ];
    
    // وضع علامة للتأكد من عدم تكرار التهيئة
    let isInitialized = false;
    
    // تحديد ما إذا كانت النافذة تابعة لـ Firebase
    function isFirebaseModal(modal) {
        // التحقق من المعرف
        if (FIREBASE_DIALOGS.includes(modal.id)) {
            console.log(`[EnhancedModal] تجاهل نافذة Firebase: ${modal.id}`);
            return true;
        }
        
        // التحقق من الكلاسات
        for (const className of FIREBASE_CLASSES) {
            if (modal.classList.contains(className)) {
                console.log(`[EnhancedModal] تجاهل نافذة Firebase بالكلاس: ${className}`);
                return true;
            }
        }
        
        // التحقق من الخصائص المخصصة
        if (modal.dataset.firebaseDialog || modal.dataset.syncDialog) {
            console.log(`[EnhancedModal] تجاهل نافذة Firebase بالخصائص المخصصة`);
            return true;
        }
        
        return false;
    }
    
    // دالة إضافة أزرار التحكم
    function addControlButtons(modal) {
        // إذا كانت النافذة تابعة لـ Firebase، نتجاهلها
        if (isFirebaseModal(modal)) {
            return;
        }
        
        const modalHeader = modal.querySelector('.modal-header');
        if (!modalHeader) {
            console.log(`[EnhancedModal] لا يوجد header للنافذة: ${modal.id || 'غير محدد'}`);
            return;
        }
        
        // التحقق من وجود أزرار التحكم مسبقاً
        if (modalHeader.querySelector('.enhanced-modal-controls')) {
            console.log(`[EnhancedModal] أزرار التحكم موجودة مسبقاً للنافذة: ${modal.id || 'غير محدد'}`);
            return;
        }
        
        // إنشاء حاوي لأزرار التحكم
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'enhanced-modal-controls';
        controlsContainer.style.cssText = `
            position: absolute;
            top: 12px;
            left: 15px;
            display: flex;
            gap: 8px;
            z-index: 1001;
            align-items: center;
            background: rgba(255, 255, 255, 0.9);
            padding: 4px 8px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        `;
        
        // زر التكبير مع أيقونة SVG
        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'modal-control-btn maximize-btn';
        maximizeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
        `;
        maximizeBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            color: #2563eb;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        `;
        maximizeBtn.setAttribute('aria-label', 'تكبير/استعادة');
        
        // زر الإغلاق مع أيقونة SVG
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-control-btn enhanced-close-btn';
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            background: linear-gradient(145deg, #fef2f2, #fecaca);
            color: #dc2626;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        `;
        closeBtn.setAttribute('aria-label', 'إغلاق');
        
        // إضافة تأثيرات الهوفر المحسنة
        maximizeBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(145deg, #dbeafe, #bfdbfe)';
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3), inset 0 -1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        maximizeBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(145deg, #ffffff, #f0f0f0)';
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        closeBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(145deg, #fee2e2, #fca5a5)';
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3), inset 0 -1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        closeBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(145deg, #fef2f2, #fecaca)';
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        // إضافة تأثير النقر
        [maximizeBtn, closeBtn].forEach(btn => {
            btn.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('mouseup', function() {
                this.style.transform = 'scale(1.1)';
            });
        });
        
        // إضافة وظيفة التكبير
        let isMaximized = false;
        let originalStyles = {};
        
        maximizeBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            
            const modalElement = modal.querySelector('.modal');
            if (!modalElement) return;
            
            if (!isMaximized) {
                // حفظ الأنماط الأصلية
                originalStyles = {
                    width: modalElement.style.width,
                    height: modalElement.style.height,
                    top: modalElement.style.top,
                    left: modalElement.style.left,
                    transform: modalElement.style.transform,
                    maxWidth: modalElement.style.maxWidth,
                    maxHeight: modalElement.style.maxHeight,
                    transition: modalElement.style.transition
                };
                
                // تطبيق التكبير مع رسوم متحركة
                modalElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                modalElement.style.width = '100vw';
                modalElement.style.height = '100vh';
                modalElement.style.top = '0';
                modalElement.style.left = '0';
                modalElement.style.transform = 'none';
                modalElement.style.maxWidth = 'none';
                modalElement.style.maxHeight = 'none';
                
                // تغيير أيقونة التكبير
                maximizeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                `;
                isMaximized = true;
                modalElement.dataset.maximized = 'true';
            } else {
                // استعادة الأنماط الأصلية مع رسوم متحركة
                modalElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                Object.assign(modalElement.style, originalStyles);
                
                // استعادة أيقونة التكبير الأصلية
                maximizeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                `;
                isMaximized = false;
                delete modalElement.dataset.maximized;
                
                // إزالة التحول بعد انتهاء الرسوم المتحركة
                setTimeout(() => {
                    modalElement.style.transition = originalStyles.transition || '';
                }, 400);
            }
        });
        
        // إضافة وظيفة الإغلاق
        closeBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            
            // استخدام دالة الإغلاق الموجودة في التطبيق
            if (typeof closeModal === 'function' && modal.id) {
                closeModal(modal.id);
            } else {
                // إغلاق بديل
                modal.classList.remove('active');
                // إطلاق حدث مخصص للإغلاق
                const closeEvent = new CustomEvent('modalClosed', { detail: { modal: modal } });
                document.dispatchEvent(closeEvent);
            }
        });
        
        // إضافة الأزرار إلى الحاوي
        controlsContainer.appendChild(maximizeBtn);
        controlsContainer.appendChild(closeBtn);
        
        // إضافة الحاوي إلى رأس النافذة
        modalHeader.appendChild(controlsContainer);
        
        // إخفاء زر الإغلاق الأصلي إذا كان موجوداً
        const originalCloseBtn = modalHeader.querySelector('.modal-close');
        if (originalCloseBtn && !originalCloseBtn.classList.contains('enhanced-close-btn')) {
            originalCloseBtn.style.display = 'none';
        }
        
        console.log(`[EnhancedModal] تمت إضافة أزرار التحكم للنافذة: ${modal.id || 'غير محدد'}`);
    }
    
    // إضافة ميزة السحب
    function addDraggable(modal) {
        if (isFirebaseModal(modal)) {
            return;
        }
        
        const modalElement = modal.querySelector('.modal');
        const modalHeader = modal.querySelector('.modal-header');
        
        if (!modalElement || !modalHeader) {
            return;
        }
        
        // التحقق من وجود ميزة السحب مسبقاً
        if (modalElement.dataset.draggable === 'true') {
            return;
        }
        
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        modalHeader.style.cursor = 'move';
        
        function dragStart(e) {
            // لا نسمح بالسحب إذا كانت النافذة مكبرة
            if (modalElement.dataset.maximized === 'true') return;
            
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === modalHeader) {
                isDragging = true;
            }
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                xOffset = currentX;
                yOffset = currentY;
                
                modalElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
        
        // إضافة مستمعي الأحداث
        modalHeader.addEventListener('mousedown', dragStart);
        modalHeader.addEventListener('touchstart', dragStart, { passive: false });
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
        
        modalElement.dataset.draggable = 'true';
        console.log(`[EnhancedModal] تمت إضافة ميزة السحب للنافذة: ${modal.id || 'غير محدد'}`);
    }
    
    // إضافة النقر المزدوج للتكبير
    function addDoubleClickMaximize(modal) {
        if (isFirebaseModal(modal)) {
            return;
        }
        
        const modalHeader = modal.querySelector('.modal-header');
        const maximizeBtn = modal.querySelector('.maximize-btn');
        
        if (!modalHeader || !maximizeBtn) {
            return;
        }
        
        // التحقق من وجود الحدث مسبقاً
        if (modalHeader.dataset.doubleClickMaximize === 'true') {
            return;
        }
        
        modalHeader.addEventListener('dblclick', function(event) {
            // تجنب النقر على الأزرار
            if (event.target.closest('button')) return;
            
            maximizeBtn.click();
        });
        
        modalHeader.dataset.doubleClickMaximize = 'true';
        console.log(`[EnhancedModal] تمت إضافة النقر المزدوج للنافذة: ${modal.id || 'غير محدد'}`);
    }
    
    // الدالة الرئيسية لإضافة كل الميزات
    function enhanceModal(modal) {
        if (isFirebaseModal(modal)) {
            console.log(`[EnhancedModal] تجاهل نافذة Firebase`);
            return;
        }
        
        addControlButtons(modal);
        addDraggable(modal);
        addDoubleClickMaximize(modal);
    }
    
    // الدالة الرئيسية للتهيئة
    function initModalEnhancements() {
        if (isInitialized) {
            console.log('[EnhancedModal] تم التهيئة مسبقاً');
            return;
        }
        
        console.log('[EnhancedModal] بدء تهيئة التحسينات');
        
        // معالجة جميع النوافذ الموجودة
        const existingModals = document.querySelectorAll('.modal-overlay');
        existingModals.forEach(modal => {
            enhanceModal(modal);
        });
        
        // مراقبة النوافذ الجديدة
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.classList?.contains('modal-overlay')) {
                            // انتظار قليلاً للتأكد من اكتمال تحميل النافذة
                            setTimeout(() => {
                                enhanceModal(node);
                            }, 100);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        isInitialized = true;
        console.log('[EnhancedModal] تمت التهيئة بنجاح');
    }
    
    // التصدير للاستخدام الخارجي
    window.ModalEnhancements = {
        init: initModalEnhancements,
        enhance: enhanceModal,
        isFirebaseModal: isFirebaseModal
    };
    
    // التهيئة التلقائية عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalEnhancements);
    } else {
        initModalEnhancements();
    }
    
})();