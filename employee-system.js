// employee-system.js

// متغيرات عامة
let employees = [];
let salaryTransactions = [];
let currentEmployeeId = null;

// تهيئة النظام عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', initEmployeeSystem);
function initEmployeeSystem() {
    // إضافة قسم الموظفين إلى القائمة الجانبية
    addEmployeesToSidebar();
    
    // إنشاء صفحة الموظفين
    createEmployeesPage();
    
    // تحميل البيانات
    loadEmployeesData();
    
    // إضافة الأحداث
    setupEmployeeEvents();
    
    // تحميل البيانات الأولية
    setTimeout(() => {
        loadEmployees();
        loadSalaries();
    }, 100);
}
// إضافة قسم الموظفين إلى القائمة الجانبية
function addEmployeesToSidebar() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    
    // البحث عن قسم إدارة الاستثمار
    const investmentSection = Array.from(sidebarMenu.children)
        .find(el => el.textContent.includes('إدارة الاستثمار'));
    
    if (investmentSection) {
        // إضافة خيار الموظفين بعد قسم إدارة الاستثمار
        const employeeMenuItem = document.createElement('a');
        employeeMenuItem.href = '#employees';
        employeeMenuItem.className = 'menu-item';
        employeeMenuItem.onclick = () => showPage('employees');
        employeeMenuItem.innerHTML = `
            <span class="menu-icon"><i class="fas fa-user-tie"></i></span>
            <span>الموظفين</span>
        `;
        
        // إضافة العنصر بعد قسم إدارة الاستثمار
        investmentSection.insertAdjacentElement('afterend', employeeMenuItem);
    }
}

// إنشاء صفحة الموظفين
function createEmployeesPage() {
    const content = document.querySelector('.content');
    
    const employeesPage = document.createElement('div');
    employeesPage.id = 'employees';
    employeesPage.className = 'page';
    employeesPage.innerHTML = `
        <div class="header">
            <h1 class="page-title">إدارة الموظفين</h1>
            <div class="header-actions">
                <div class="search-bar">
                    <input type="text" class="search-input" id="employeeSearchInput" placeholder="بحث عن موظف..." oninput="searchEmployees()">
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" onclick="openAddEmployeeModal()">
                    <i class="fas fa-plus"></i> إضافة موظف
                </button>
                <div class="notification-btn" onclick="toggleNotificationPanel()">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge">0</span>
                </div>
                <div class="menu-toggle" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" onclick="switchEmployeeTab('list')">قائمة الموظفين</div>
            <div class="tab" onclick="switchEmployeeTab('salary')">سجل الرواتب</div>
            <div class="tab" onclick="switchEmployeeTab('reports')">التقارير</div>
        </div>

        <div id="employeeListTab" class="tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <div class="table-title">قائمة الموظفين</div>
                    <div class="table-actions">
                        <button class="btn btn-light" onclick="exportEmployeesToCSV()">
                            <i class="fas fa-file-export"></i> تصدير
                        </button>
                        <button class="btn btn-light" onclick="printTable('employeesTable')">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                    </div>
                </div>
                <table class="table" id="employeesTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم</th>
                            <th>الوظيفة</th>
                            <th>الراتب الأساسي</th>
                            <th>رقم الهاتف</th>
                            <th>تاريخ التعيين</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="employeesTableBody">
                        <!-- سيتم ملؤها بواسطة JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="salaryTab" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <div class="table-title">سجل الرواتب</div>
                    <div class="table-actions">
                        <button class="btn btn-light" onclick="exportSalariesToCSV()">
                            <i class="fas fa-file-export"></i> تصدير
                        </button>
                        <button class="btn btn-light" onclick="printTable('salariesTable')">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                    </div>
                </div>
                <table class="table" id="salariesTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الموظف</th>
                            <th>الشهر</th>
                            <th>الراتب الأساسي</th>
                            <th>العمولة</th>
                            <th>العلاوات</th>
                            <th>الاستقطاعات</th>
                            <th>الراتب النهائي</th>
                            <th>تاريخ الصرف</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="salariesTableBody">
                        <!-- سيتم ملؤها بواسطة JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="reportsTab" class="tab-content">
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">رواتب الموظفين</div>
                </div>
                <canvas id="salariesChart" height="300"></canvas>
            </div>
            <div class="chart-container" style="margin-top: 30px;">
                <div class="chart-header">
                    <div class="chart-title">أداء الموظفين</div>
                </div>
                <canvas id="performanceChart" height="300"></canvas>
            </div>
        </div>

        <style>
            .employee-photo {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .employee-card {
                background: white;
                border-radius: var(--border-radius);
                padding: 20px;
                box-shadow: var(--box-shadow);
                margin-bottom: 20px;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .salary-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .salary-item {
                padding: 10px;
                background: var(--gray-100);
                border-radius: var(--border-radius);
            }
            
            .salary-label {
                font-size: 0.9rem;
                color: var(--gray-600);
            }
            
            .salary-value {
                font-size: 1.1rem;
                font-weight: 600;
                margin-top: 5px;
            }
            
            @media print {
                .header-actions, .table-actions, .tabs, .btn {
                    display: none !important;
                }
                
                .modal-body {
                    padding: 0 !important;
                }
                
                .modal-header {
                    border-bottom: 2px solid #000 !important;
                }
            }
        </style>
    `;
    
    content.appendChild(employeesPage);
    
    // إنشاء نوافذ النماذج
    createEmployeeModals();
}

// إنشاء نوافذ النماذج
function createEmployeeModals() {
    // نافذة إضافة/تعديل موظف
    const addEmployeeModal = document.createElement('div');
    addEmployeeModal.className = 'modal-overlay';
    addEmployeeModal.id = 'addEmployeeModal';
    addEmployeeModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title" id="employeeModalTitle">إضافة موظف جديد</h2>
                <div class="modal-close" onclick="closeModal('addEmployeeModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="employeeForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-control" id="employeeName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الوظيفة</label>
                            <input type="text" class="form-control" id="employeePosition" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الراتب الأساسي</label>
                            <input type="number" class="form-control" id="employeeSalary" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">نسبة العمولة (%)</label>
                            <input type="number" class="form-control" id="employeeCommission" min="0" max="100" value="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">رقم الهاتف</label>
                            <input type="tel" class="form-control" id="employeePhone" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="employeeEmail">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">العنوان</label>
                            <input type="text" class="form-control" id="employeeAddress">
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ التعيين</label>
                            <input type="date" class="form-control" id="employeeStartDate" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">رقم البطاقة الموحدة</label>
                            <input type="text" class="form-control" id="employeeIdCard">
                        </div>
                        <div class="form-group">
                            <label class="form-label">بطاقة السكن</label>
                            <input type="text" class="form-control" id="employeeResidenceCard">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الصورة الشخصية</label>
                            <input type="file" class="form-control" id="employeePhoto" accept="image/*">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="employeeStatus">
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>
                    </div>
                    <input type="hidden" id="employeeId">
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('addEmployeeModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="saveEmployee()">حفظ</button>
            </div>
        </div>
    `;
    
    // نافذة صرف الراتب
    const paySalaryModal = document.createElement('div');
    paySalaryModal.className = 'modal-overlay';
    paySalaryModal.id = 'paySalaryModal';
    paySalaryModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">صرف راتب</h2>
                <div class="modal-close" onclick="closeModal('paySalaryModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body">
                <form id="salaryForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الموظف</label>
                            <select class="form-select" id="salaryEmployeeId" required onchange="updateSalaryDetails()">
                                <option value="">اختر الموظف</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الشهر</label>
                            <input type="month" class="form-control" id="salaryMonth" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الراتب الأساسي</label>
                            <input type="number" class="form-control" id="baseSalary" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">إجمالي المبيعات</label>
                            <input type="number" class="form-control" id="totalSales" min="0" value="0" onchange="calculateTotalSalary()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">نسبة العمولة (%)</label>
                            <input type="number" class="form-control" id="commissionRate" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">العمولة</label>
                            <input type="number" class="form-control" id="commission" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">العلاوات</label>
                            <input type="number" class="form-control" id="allowances" min="0" value="0" onchange="calculateTotalSalary()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الاستقطاعات</label>
                            <input type="number" class="form-control" id="deductions" min="0" value="0" onchange="calculateTotalSalary()">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الراتب النهائي</label>
                        <input type="number" class="form-control" id="totalSalary" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-control" id="salaryNotes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('paySalaryModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="saveSalary()">صرف الراتب</button>
            </div>
        </div>
    `;
    
    // نافذة عرض تفاصيل الموظف
    const viewEmployeeModal = document.createElement('div');
    viewEmployeeModal.className = 'modal-overlay';
    viewEmployeeModal.id = 'viewEmployeeModal';
    viewEmployeeModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تفاصيل الموظف</h2>
                <div class="modal-close" onclick="closeModal('viewEmployeeModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body" id="employeeDetailsBody">
                <!-- سيتم ملؤها بواسطة JavaScript -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('viewEmployeeModal')">إغلاق</button>
                <button class="btn btn-warning" onclick="editEmployee(currentEmployeeId)">تعديل</button>
                <button class="btn btn-success" onclick="openPaySalaryModal(currentEmployeeId)">صرف راتب</button>
                <button class="btn btn-danger" onclick="deleteEmployee(currentEmployeeId)">حذف</button>
            </div>
        </div>
    `;
    
    // نافذة عرض تفاصيل الراتب
    const viewSalaryModal = document.createElement('div');
    viewSalaryModal.className = 'modal-overlay';
    viewSalaryModal.id = 'viewSalaryModal';
    viewSalaryModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">تفاصيل الراتب</h2>
                <div class="modal-close" onclick="closeModal('viewSalaryModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body" id="salaryDetailsBody">
                <!-- سيتم ملؤها بواسطة JavaScript -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('viewSalaryModal')">إغلاق</button>
                <button class="btn btn-primary" onclick="printSalaryReceipt()">طباعة الإيصال</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(addEmployeeModal);
    document.body.appendChild(paySalaryModal);
    document.body.appendChild(viewEmployeeModal);
    document.body.appendChild(viewSalaryModal);
}

// إعداد الأحداث
function setupEmployeeEvents() {
    // إضافة أحداث للنموذج
    const employeeAmountInput = document.getElementById('employeeSalary');
    if (employeeAmountInput) {
        employeeAmountInput.addEventListener('input', () => {
            updateExpectedProfit();
        });
    }
}

// وظائف إدارة الموظفين
function openAddEmployeeModal() {
    document.getElementById('employeeModalTitle').textContent = 'إضافة موظف جديد';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeStartDate').valueAsDate = new Date();
    openModal('addEmployeeModal');
}

function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    document.getElementById('employeeModalTitle').textContent = 'تعديل بيانات الموظف';
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeSalary').value = employee.salary;
    document.getElementById('employeeCommission').value = employee.commission || 0;
    document.getElementById('employeePhone').value = employee.phone;
    document.getElementById('employeeEmail').value = employee.email || '';
    document.getElementById('employeeAddress').value = employee.address || '';
    document.getElementById('employeeStartDate').value = employee.startDate;
    document.getElementById('employeeIdCard').value = employee.idCard || '';
    document.getElementById('employeeResidenceCard').value = employee.residenceCard || '';
    document.getElementById('employeeStatus').value = employee.status;
    
    openModal('addEmployeeModal');
}

function saveEmployee() {
    const id = document.getElementById('employeeId').value;
    const employee = {
        id: id || generateId(),
        name: document.getElementById('employeeName').value,
        position: document.getElementById('employeePosition').value,
        salary: parseFloat(document.getElementById('employeeSalary').value),
        commission: parseFloat(document.getElementById('employeeCommission').value) || 0,
        phone: document.getElementById('employeePhone').value,
        email: document.getElementById('employeeEmail').value,
        address: document.getElementById('employeeAddress').value,
        startDate: document.getElementById('employeeStartDate').value,
        idCard: document.getElementById('employeeIdCard').value,
        residenceCard: document.getElementById('employeeResidenceCard').value,
        status: document.getElementById('employeeStatus').value,
        photo: null, // يمكن إضافة معالجة الصور لاحقاً
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        // تعديل موظف موجود
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employee };
        }
    } else {
        // إضافة موظف جديد
        employees.push(employee);
    }
    
    saveEmployeesData();
    loadEmployees();
    closeModal('addEmployeeModal');
    
    createNotification('نجاح', id ? 'تم تحديث بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح', 'success');
}

function deleteEmployee(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    employees = employees.filter(emp => emp.id !== id);
    salaryTransactions = salaryTransactions.filter(sal => sal.employeeId !== id);
    
    saveEmployeesData();
    loadEmployees();
    loadSalaries();
    closeModal('viewEmployeeModal');
    
    createNotification('نجاح', 'تم حذف الموظف بنجاح', 'success');
}

function viewEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    currentEmployeeId = id;
    
    const detailsBody = document.getElementById('employeeDetailsBody');
    detailsBody.innerHTML = `
        <div class="employee-card">
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="width: 120px; height: 120px; background: var(--gray-200); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    ${employee.photo ? 
                        `<img src="${employee.photo}" alt="${employee.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
                        `<i class="fas fa-user" style="font-size: 3rem; color: var(--gray-600);"></i>`
                    }
                </div>
                <div style="flex: 1;">
                    <h2>${employee.name}</h2>
                    <p style="color: var(--gray-600); margin-bottom: 10px;">${employee.position}</p>
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="color: var(--gray-600);">الراتب الأساسي:</span>
                            <strong>${formatNumber(employee.salary)} د.ع</strong>
                        </div>
                        <div>
                            <span style="color: var(--gray-600);">نسبة العمولة:</span>
                            <strong>${employee.commission}%</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="salary-details">
                <div class="salary-item">
                    <div class="salary-label">رقم الهاتف</div>
                    <div class="salary-value">${employee.phone}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">البريد الإلكتروني</div>
                    <div class="salary-value">${employee.email || '-'}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">العنوان</div>
                    <div class="salary-value">${employee.address || '-'}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">تاريخ التعيين</div>
                    <div class="salary-value">${formatDate(employee.startDate)}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">رقم البطاقة الموحدة</div>
                    <div class="salary-value">${employee.idCard || '-'}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">بطاقة السكن</div>
                    <div class="salary-value">${employee.residenceCard || '-'}</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">الحالة</div>
                    <div class="salary-value">
                        <span class="status ${employee.status === 'active' ? 'active' : 'inactive'}">
                            ${employee.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('viewEmployeeModal');
}

// وظائف صرف الرواتب
function openPaySalaryModal(employeeId = null) {
    document.getElementById('salaryForm').reset();
    
    // ملء قائمة الموظفين
    const select = document.getElementById('salaryEmployeeId');
    select.innerHTML = '<option value="">اختر الموظف</option>';
    
    employees.filter(emp => emp.status === 'active').forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.name;
        select.appendChild(option);
    });
    
    if (employeeId) {
        select.value = employeeId;
        updateSalaryDetails();
    }
    
    // تعيين الشهر الحالي
    const today = new Date();
    document.getElementById('salaryMonth').value = today.toISOString().slice(0, 7);
    
    openModal('paySalaryModal');
}

function updateSalaryDetails() {
    const employeeId = document.getElementById('salaryEmployeeId').value;
    if (!employeeId) return;
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    document.getElementById('baseSalary').value = employee.salary;
    document.getElementById('commissionRate').value = employee.commission;
    
    calculateTotalSalary();
}

function calculateTotalSalary() {
    const baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
    const totalSales = parseFloat(document.getElementById('totalSales').value) || 0;
    const commissionRate = parseFloat(document.getElementById('commissionRate').value) || 0;
    const allowances = parseFloat(document.getElementById('allowances').value) || 0;
    const deductions = parseFloat(document.getElementById('deductions').value) || 0;
    
    const commission = (totalSales * commissionRate) / 100;
    document.getElementById('commission').value = commission.toFixed(0);
    
    const totalSalary = baseSalary + commission + allowances - deductions;
    document.getElementById('totalSalary').value = totalSalary.toFixed(0);
}

function saveSalary() {
    const employeeId = document.getElementById('salaryEmployeeId').value;
    const month = document.getElementById('salaryMonth').value;
    
    if (!employeeId || !month) {
        alert('يرجى اختيار الموظف والشهر');
        return;
    }
    
    // التحقق من عدم وجود راتب للموظف في نفس الشهر
    const existingSalary = salaryTransactions.find(sal => 
        sal.employeeId === employeeId && sal.month === month
    );
    
    if (existingSalary) {
        alert('تم صرف راتب هذا الموظف لهذا الشهر مسبقاً');
        return;
    }
    
    const salary = {
        id: generateId(),
        employeeId: employeeId,
        month: month,
        baseSalary: parseFloat(document.getElementById('baseSalary').value),
        totalSales: parseFloat(document.getElementById('totalSales').value) || 0,
        commissionRate: parseFloat(document.getElementById('commissionRate').value),
        commission: parseFloat(document.getElementById('commission').value),
        allowances: parseFloat(document.getElementById('allowances').value) || 0,
        deductions: parseFloat(document.getElementById('deductions').value) || 0,
        totalSalary: parseFloat(document.getElementById('totalSalary').value),
        notes: document.getElementById('salaryNotes').value,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    salaryTransactions.push(salary);
    saveEmployeesData();
    loadSalaries();
    closeModal('paySalaryModal');
    
    createNotification('نجاح', 'تم صرف الراتب بنجاح', 'success');
}

function viewSalary(id) {
    const salary = salaryTransactions.find(sal => sal.id === id);
    if (!salary) return;
    
    const employee = employees.find(emp => emp.id === salary.employeeId);
    if (!employee) return;
    
    const detailsBody = document.getElementById('salaryDetailsBody');
    detailsBody.innerHTML = `
        <div class="salary-receipt" id="salaryReceipt">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">${settings.companyName}</h2>
                <p style="margin: 5px 0;">إيصال صرف راتب</p>
            </div>
            
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong>الموظف:</strong> ${employee.name}
                    </div>
                    <div>
                        <strong>الوظيفة:</strong> ${employee.position}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <div>
                        <strong>الشهر:</strong> ${salary.month}
                    </div>
                    <div>
                        <strong>تاريخ الصرف:</strong> ${formatDate(salary.paymentDate)}
                    </div>
                </div>
            </div>
            
            <div class="salary-details">
                <div class="salary-item">
                    <div class="salary-label">الراتب الأساسي</div>
                    <div class="salary-value">${formatNumber(salary.baseSalary)} د.ع</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">إجمالي المبيعات</div>
                    <div class="salary-value">${formatNumber(salary.totalSales)} د.ع</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">نسبة العمولة</div>
                    <div class="salary-value">${salary.commissionRate}%</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">العمولة</div>
                    <div class="salary-value">${formatNumber(salary.commission)} د.ع</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">العلاوات</div>
                    <div class="salary-value">${formatNumber(salary.allowances)} د.ع</div>
                </div>
                <div class="salary-item">
                    <div class="salary-label">الاستقطاعات</div>
                    <div class="salary-value">${formatNumber(salary.deductions)} د.ع</div>
                </div>
            </div>
            
            <div style="border-top: 2px solid #ddd; margin-top: 20px; padding-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                    <div>الراتب النهائي:</div>
                    <div>${formatNumber(salary.totalSalary)} د.ع</div>
                </div>
            </div>
            
            ${salary.notes ? `
                <div style="margin-top: 20px;">
                    <strong>ملاحظات:</strong> ${salary.notes}
                </div>
            ` : ''}
            
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div style="text-align: center;">
                    <div style="border-top: 1px solid #000; width: 150px; margin-top: 50px;"></div>
                    <div>توقيع الموظف</div>
                </div>
                <div style="text-align: center;">
                    <div style="border-top: 1px solid #000; width: 150px; margin-top: 50px;"></div>
                    <div>توقيع المحاسب</div>
                </div>
            </div>
        </div>
    `;
    
    openModal('viewSalaryModal');
}

function printSalaryReceipt() {
    const content = document.getElementById('salaryReceipt').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>إيصال صرف راتب</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    padding: 20px;
                }
                .salary-details {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 20px;
                }
                .salary-item {
                    padding: 10px;
                    background: #f5f5f5;
                    border-radius: 5px;
                }
                .salary-label {
                    font-size: 0.9rem;
                    color: #666;
                }
                .salary-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.print();
                window.close();
            </script>
        </body>
        </html>
    `);
}
function loadEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) {
        console.error('عنصر جدول الموظفين غير موجود');
        return;
    }
    
    tbody.innerHTML = '';
    
    // التحقق من وجود موظفين
    if (!employees || employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">لا يوجد موظفين مسجلين</td></tr>';
        return;
    }
    
    employees.forEach((emp, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${emp.photo ? 
                        `<img src="${emp.photo}" alt="${emp.name}" class="employee-photo">` :
                        `<i class="fas fa-user" style="font-size: 1.5rem; color: var(--gray-600);"></i>`
                    }
                    ${emp.name}
                </div>
            </td>
            <td>${emp.position}</td>
            <td>${formatNumber(emp.salary)} د.ع</td>
            <td>${emp.phone}</td>
            <td>${formatDate(emp.startDate)}</td>
            <td>
                <span class="status ${emp.status === 'active' ? 'active' : 'inactive'}">
                    ${emp.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>
                <button class="btn btn-info btn-icon" onclick="viewEmployee('${emp.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-icon" onclick="editEmployee('${emp.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-success btn-icon" onclick="openPaySalaryModal('${emp.id}')">
                    <i class="fas fa-money-bill"></i>
                </button>
                <button class="btn btn-danger btn-icon" onclick="deleteEmployee('${emp.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
function loadSalaries() {
    const tbody = document.getElementById('salariesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // ترتيب الرواتب حسب التاريخ (الأحدث أولاً)
    const sortedSalaries = [...salaryTransactions].sort((a, b) => 
        new Date(b.paymentDate) - new Date(a.paymentDate)
    );
    
    sortedSalaries.forEach((sal, index) => {
        const employee = employees.find(emp => emp.id === sal.employeeId);
        if (!employee) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${sal.month}</td>
            <td>${formatNumber(sal.baseSalary)} د.ع</td>
            <td>${formatNumber(sal.commission)} د.ع</td>
            <td>${formatNumber(sal.allowances)} د.ع</td>
            <td>${formatNumber(sal.deductions)} د.ع</td>
            <td>${formatNumber(sal.totalSalary)} د.ع</td>
            <td>${formatDate(sal.paymentDate)}</td>
            <td>
                <button class="btn btn-info btn-icon" onclick="viewSalary('${sal.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// وظائف المخططات
function loadEmployeeCharts() {
    loadSalariesChart();
    loadPerformanceChart();
}

function loadSalariesChart() {
    const ctx = document.getElementById('salariesChart');
    if (!ctx) return;
    
    const employeeNames = employees.map(emp => emp.name);
    const baseSalaries = employees.map(emp => emp.salary);
    const commissions = employees.map(emp => {
        const empSalaries = salaryTransactions.filter(sal => sal.employeeId === emp.id);
        const totalCommission = empSalaries.reduce((sum, sal) => sum + sal.commission, 0);
        return totalCommission;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: employeeNames,
            datasets: [
                {
                    label: 'الراتب الأساسي',
                    data: baseSalaries,
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                },
                {
                    label: 'العمولات',
                    data: commissions,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value) + ' د.ع';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'الرواتب والعمولات حسب الموظف'
                }
            }
        }
    });
}

function loadPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const employeeNames = employees.map(emp => emp.name);
    const totalSales = employees.map(emp => {
        const empSalaries = salaryTransactions.filter(sal => sal.employeeId === emp.id);
        return empSalaries.reduce((sum, sal) => sum + sal.totalSales, 0);
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: employeeNames,
            datasets: [{
                label: 'إجمالي المبيعات',
                data: totalSales,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6',
                    '#34495e',
                    '#1abc9c',
                    '#e67e22'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'أداء الموظفين (حسب المبيعات)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatNumber(context.raw) + ' د.ع';
                        }
                    }
                }
            }
        }
    });
}
function switchEmployeeTab(tabId) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('#employees .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إزالة active من جميع التبويبات
    document.querySelectorAll('#employees .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // تحديد اسم التبويب الصحيح
    let tabElementId;
    switch(tabId) {
        case 'list':
            tabElementId = 'employeeListTab';
            break;
        case 'salary':
            tabElementId = 'salaryTab';
            break;
        case 'reports':
            tabElementId = 'reportsTab';
            break;
        default:
            tabElementId = tabId + 'Tab';
    }
    
    // تفعيل التبويب المحدد مع التحقق من وجوده
    const tabContent = document.getElementById(tabElementId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // تفعيل زر التبويب مع التحقق من وجوده
    const tabButton = document.querySelector(`#employees .tab[onclick="switchEmployeeTab('${tabId}')"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }
    
    // تحميل المحتوى المناسب
    switch(tabId) {
        case 'list':
            loadEmployees();
            break;
        case 'salary':
            loadSalaries();
            break;
        case 'reports':
            // تأجيل تحميل المخططات قليلاً للتأكد من ظهور العناصر
            setTimeout(() => {
                loadEmployeeCharts();
            }, 100);
            break;
    }
}

// البحث عن الموظفين
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#employeesTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const position = row.cells[2].textContent.toLowerCase();
        const phone = row.cells[4].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || position.includes(searchTerm) || phone.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// تصدير البيانات
function exportEmployeesToCSV() {
    let csv = '\ufeff'; // BOM for Excel to recognize UTF-8
    csv += 'الاسم,الوظيفة,الراتب الأساسي,رقم الهاتف,البريد الإلكتروني,العنوان,تاريخ التعيين,الحالة\n';
    
    employees.forEach(emp => {
        csv += `${emp.name},${emp.position},${emp.salary},${emp.phone},${emp.email || ''},${emp.address || ''},${emp.startDate},${emp.status === 'active' ? 'نشط' : 'غير نشط'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function exportSalariesToCSV() {
    let csv = '\ufeff'; // BOM for Excel to recognize UTF-8
    csv += 'الموظف,الشهر,الراتب الأساسي,المبيعات,العمولة,العلاوات,الاستقطاعات,الراتب النهائي,تاريخ الصرف\n';
    
    salaryTransactions.forEach(sal => {
        const employee = employees.find(emp => emp.id === sal.employeeId);
        if (employee) {
            csv += `${employee.name},${sal.month},${sal.baseSalary},${sal.totalSales},${sal.commission},${sal.allowances},${sal.deductions},${sal.totalSalary},${sal.paymentDate}\n`;
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salaries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// تحميل وحفظ البيانات
function loadEmployeesData() {
    // تحميل الموظفين
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
        employees = JSON.parse(storedEmployees);
    }
    
    // تحميل الرواتب
    const storedSalaries = localStorage.getItem('salaryTransactions');
    if (storedSalaries) {
        salaryTransactions = JSON.parse(storedSalaries);
    }
    
    // تحميل البيانات في الجداول والمخططات
    loadEmployees();
    loadSalaries();
}

function saveEmployeesData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('salaryTransactions', JSON.stringify(salaryTransactions));
}

// دالة مساعدة لتوليد معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// دالة مساعدة لتنسيق الأرقام
function formatNumber(num) {
    return new Intl.NumberFormat('ar-IQ').format(num);
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ');
}
