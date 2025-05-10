// ==================== Employee Management System ====================

// Global variables for employee system
let employees = [];
let salaryTransactions = [];
let isInitialized = false;

// Initialize employee system on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!isInitialized) {
        initializeEmployeeSystem();
        isInitialized = true;
    }
});

function initializeEmployeeSystem() {
    // Add employee menu item to sidebar
    addEmployeeMenuItem();
    
    // Create employee page
    createEmployeePage();
    
    // Load data from localStorage
    loadEmployeesData();
    
    // Initialize event listeners
    initializeEmployeeEventListeners();
    
    // Add CSS styles
    addEmployeeStyles();
}

// Add Employee menu item to sidebar
function addEmployeeMenuItem() {
    const menuCategory = document.querySelector('.menu-category:nth-child(3)');
    
    const employeeMenuItem = document.createElement('a');
    employeeMenuItem.href = '#employees';
    employeeMenuItem.className = 'menu-item';
    employeeMenuItem.onclick = function() { showPage('employees'); };
    
    employeeMenuItem.innerHTML = `
        <span class="menu-icon"><i class="fas fa-user-tie"></i></span>
        <span>الموظفين</span>
    `;
    
    menuCategory.parentNode.insertBefore(employeeMenuItem, menuCategory.nextSibling);
}

// Create employee page
function createEmployeePage() {
    const pageContainer = document.getElementById('operations').parentNode;
    
    const employeePage = document.createElement('div');
    employeePage.id = 'employees';
    employeePage.className = 'page';
    
    employeePage.innerHTML = `
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
            <div class="tab" onclick="switchEmployeeTab('salaries')">سجل الرواتب</div>
            <div class="tab" onclick="switchEmployeeTab('reports')">التقارير</div>
        </div>

        <div id="employeesList" class="employee-tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <div class="table-title">قائمة الموظفين</div>
                    <div class="table-actions">
                        <button class="btn btn-light" onclick="exportEmployees()">
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
                            <th>القسم</th>
                            <th>الراتب الأساسي</th>
                            <th>رقم الهاتف</th>
                            <th>تاريخ التعيين</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="employeesTableBody">
                        <!-- Employee data will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="employeeSalaries" class="employee-tab-content">
            <div class="table-container">
                <div class="table-header">
                    <div class="table-title">سجل الرواتب</div>
                    <div class="table-actions">
                        <button class="btn btn-light" onclick="exportSalaries()">
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
                        <!-- Salary data will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="employeeReports" class="employee-tab-content">
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">رواتب الموظفين</div>
                </div>
                <canvas id="employeeSalariesChart" style="height: 300px;"></canvas>
            </div>
            <div class="chart-container" style="margin-top: 30px;">
                <div class="chart-header">
                    <div class="chart-title">أداء الموظفين (المبيعات)</div>
                </div>
                <canvas id="employeePerformanceChart" style="height: 300px;"></canvas>
            </div>
        </div>
    `;
    
    pageContainer.appendChild(employeePage);
    
    // Create modals
    createEmployeeModals();
}

// Create employee modals
function createEmployeeModals() {
    const body = document.body;
    
    // Add/Edit Employee Modal
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
                            <label class="form-label">رقم الهاتف</label>
                            <input type="text" class="form-control" id="employeePhone" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="employeeEmail">
                        </div>
                        <div class="form-group">
                            <label class="form-label">العنوان</label>
                            <input type="text" class="form-control" id="employeeAddress">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الوظيفة</label>
                            <input type="text" class="form-control" id="employeePosition" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">القسم</label>
                            <select class="form-select" id="employeeDepartment" required>
                                <option value="">اختر القسم</option>
                                <option value="الإدارة">الإدارة</option>
                                <option value="المبيعات">المبيعات</option>
                                <option value="المحاسبة">المحاسبة</option>
                                <option value="الموارد البشرية">الموارد البشرية</option>
                                <option value="الدعم الفني">الدعم الفني</option>
                                <option value="التسويق">التسويق</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الراتب الأساسي</label>
                            <input type="number" class="form-control" id="employeeSalary" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">تاريخ التعيين</label>
                            <input type="date" class="form-control" id="employeeJoinDate" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="employeeStatus">
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="vacation">إجازة</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">نوع العقد</label>
                            <select class="form-select" id="employeeContractType">
                                <option value="permanent">دائم</option>
                                <option value="temporary">مؤقت</option>
                                <option value="contract">عقد</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">البطاقة الموحدة</label>
                            <input type="file" class="form-control" id="employeeIdCard" accept="image/*">
                        </div>
                        <div class="form-group">
                            <label class="form-label">بطاقة السكن</label>
                            <input type="file" class="form-control" id="employeeResidenceCard" accept="image/*">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الصورة الشخصية</label>
                        <input type="file" class="form-control" id="employeePhoto" accept="image/*">
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
    
    // Pay Salary Modal
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
                            <input type="text" class="form-control" id="salaryEmployeeName" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">الشهر</label>
                            <input type="month" class="form-control" id="salaryMonth" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الراتب الأساسي</label>
                            <input type="number" class="form-control" id="salaryBasicAmount" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">المبيعات</label>
                            <input type="number" class="form-control" id="salarySales" value="0" oninput="calculateTotalSalary()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">العمولة</label>
                            <input type="number" class="form-control" id="salaryCommission" value="0" oninput="calculateTotalSalary()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">العلاوات</label>
                            <input type="number" class="form-control" id="salaryAllowances" value="0" oninput="calculateTotalSalary()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">الاستقطاعات</label>
                            <input type="number" class="form-control" id="salaryDeductions" value="0" oninput="calculateTotalSalary()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الراتب النهائي</label>
                            <input type="number" class="form-control" id="salaryTotalAmount" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-control" id="salaryNotes" rows="3"></textarea>
                    </div>
                    <input type="hidden" id="salaryEmployeeId">
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('paySalaryModal')">إلغاء</button>
                <button class="btn btn-primary" onclick="saveSalary()">حفظ</button>
            </div>
        </div>
    `;
    
    // View Employee Modal
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
            <div class="modal-body" id="employeeDetails">
                <!-- Employee details will be loaded here -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('viewEmployeeModal')">إغلاق</button>
                <button class="btn btn-warning" onclick="editEmployeeFromView()">تعديل</button>
                <button class="btn btn-success" onclick="payEmployeeSalaryFromView()">صرف راتب</button>
            </div>
        </div>
    `;
    
    // View Salary Receipt Modal
    const viewSalaryModal = document.createElement('div');
    viewSalaryModal.className = 'modal-overlay';
    viewSalaryModal.id = 'viewSalaryModal';
    
    viewSalaryModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">إيصال الراتب</h2>
                <div class="modal-close" onclick="closeModal('viewSalaryModal')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="modal-body" id="salaryReceipt">
                <!-- Salary receipt will be loaded here -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" onclick="closeModal('viewSalaryModal')">إغلاق</button>
                <button class="btn btn-primary" onclick="printSalaryReceipt()">
                    <i class="fas fa-print"></i> طباعة
                </button>
            </div>
        </div>
    `;
    
    body.appendChild(addEmployeeModal);
    body.appendChild(paySalaryModal);
    body.appendChild(viewEmployeeModal);
    body.appendChild(viewSalaryModal);
}

// Initialize event listeners
function initializeEmployeeEventListeners() {
    // Add event listeners for employee-related actions
    document.getElementById('employeeSearchInput').addEventListener('input', searchEmployees);
    document.getElementById('salaryMonth').addEventListener('change', calculateTotalSalary);
}

// Load employees data from localStorage
function loadEmployeesData() {
    const storedEmployees = localStorage.getItem('employees');
    const storedSalaries = localStorage.getItem('salaryTransactions');
    
    if (storedEmployees) {
        employees = JSON.parse(storedEmployees);
    }
    
    if (storedSalaries) {
        salaryTransactions = JSON.parse(storedSalaries);
    }
    
    // Load initial data
    loadEmployees();
    loadSalaries();
}

// Save employees data to localStorage
function saveEmployeesData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('salaryTransactions', JSON.stringify(salaryTransactions));
}

// Switch employee tabs
function switchEmployeeTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('#employees .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all content
    document.querySelectorAll('.employee-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    event.target.classList.add('active');
    
    // Show corresponding content
    switch(tabId) {
        case 'list':
            document.getElementById('employeesList').classList.add('active');
            loadEmployees();
            break;
        case 'salaries':
            document.getElementById('employeeSalaries').classList.add('active');
            loadSalaries();
            break;
        case 'reports':
            document.getElementById('employeeReports').classList.add('active');
            loadEmployeeCharts();
            break;
    }
}

// Load employees into table
function loadEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">لا يوجد موظفين</td></tr>';
        return;
    }
    
    employees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.department}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td>${employee.phone}</td>
            <td>${formatDate(employee.joinDate)}</td>
            <td><span class="status ${employee.status}">${getStatusName(employee.status)}</span></td>
            <td>
                <button class="btn btn-info btn-icon action-btn" onclick="viewEmployee('${employee.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-icon action-btn" onclick="editEmployee('${employee.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-success btn-icon action-btn" onclick="paySalary('${employee.id}')">
                    <i class="fas fa-money-bill"></i>
                </button>
                <button class="btn btn-danger btn-icon action-btn" onclick="deleteEmployee('${employee.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load salaries into table
function loadSalaries() {
    const tbody = document.getElementById('salariesTableBody');
    tbody.innerHTML = '';
    
    if (salaryTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">لا يوجد رواتب مصروفة</td></tr>';
        return;
    }
    
    salaryTransactions.forEach((salary, index) => {
        const employee = employees.find(emp => emp.id === salary.employeeId);
        if (employee) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${employee.name}</td>
                <td>${formatMonth(salary.month)}</td>
                <td>${formatCurrency(salary.basicSalary)}</td>
                <td>${formatCurrency(salary.commission)}</td>
                <td>${formatCurrency(salary.allowances)}</td>
                <td>${formatCurrency(salary.deductions)}</td>
                <td>${formatCurrency(salary.totalAmount)}</td>
                <td>${formatDate(salary.dateIssued)}</td>
                <td>
                    <button class="btn btn-info btn-icon action-btn" onclick="viewSalaryDetails('${salary.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Open add employee modal
function openAddEmployeeModal() {
    document.getElementById('employeeModalTitle').textContent = 'إضافة موظف جديد';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    openModal('addEmployeeModal');
}

// Save employee
function saveEmployee() {
    const id = document.getElementById('employeeId').value;
    const employee = {
        id: id || generateId(),
        name: document.getElementById('employeeName').value,
        phone: document.getElementById('employeePhone').value,
        email: document.getElementById('employeeEmail').value,
        address: document.getElementById('employeeAddress').value,
        position: document.getElementById('employeePosition').value,
        department: document.getElementById('employeeDepartment').value,
        salary: parseFloat(document.getElementById('employeeSalary').value),
        joinDate: document.getElementById('employeeJoinDate').value,
        status: document.getElementById('employeeStatus').value,
        contractType: document.getElementById('employeeContractType').value,
        createdAt: new Date().toISOString()
    };
    
    if (id) {
        // Edit existing employee
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            employees[index] = {...employees[index], ...employee};
        }
    } else {
        // Add new employee
        employees.push(employee);
    }
    
    saveEmployeesData();
    loadEmployees();
    closeModal('addEmployeeModal');
    createNotification('نجاح', id ? 'تم تحديث بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح', 'success');
}

// View employee details
function viewEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    const detailsElement = document.getElementById('employeeDetails');
    detailsElement.innerHTML = `
        <div class="employee-details-container">
            <div class="employee-header">
                <div class="employee-photo">
                    <i class="fas fa-user fa-5x"></i>
                </div>
                <div class="employee-info">
                    <h2>${employee.name}</h2>
                    <p>${employee.position} - ${employee.department}</p>
                    <span class="status ${employee.status}">${getStatusName(employee.status)}</span>
                </div>
            </div>
            <div class="employee-details">
                <div class="detail-row">
                    <span class="detail-label">رقم الهاتف:</span>
                    <span class="detail-value">${employee.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">البريد الإلكتروني:</span>
                    <span class="detail-value">${employee.email || '-'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">العنوان:</span>
                    <span class="detail-value">${employee.address || '-'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">تاريخ التعيين:</span>
                    <span class="detail-value">${formatDate(employee.joinDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">نوع العقد:</span>
                    <span class="detail-value">${getContractTypeName(employee.contractType)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">الراتب الأساسي:</span>
                    <span class="detail-value">${formatCurrency(employee.salary)}</span>
                </div>
            </div>
        </div>
    `;
    
    currentEmployeeId = id;
    openModal('viewEmployeeModal');
}

// Edit employee
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    document.getElementById('employeeModalTitle').textContent = 'تعديل بيانات الموظف';
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeePhone').value = employee.phone;
    document.getElementById('employeeEmail').value = employee.email || '';
    document.getElementById('employeeAddress').value = employee.address || '';
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeSalary').value = employee.salary;
    document.getElementById('employeeJoinDate').value = employee.joinDate;
    document.getElementById('employeeStatus').value = employee.status;
    document.getElementById('employeeContractType').value = employee.contractType;
    
    openModal('addEmployeeModal');
}

// Delete employee
function deleteEmployee(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    employees = employees.filter(emp => emp.id !== id);
    salaryTransactions = salaryTransactions.filter(sal => sal.employeeId !== id);
    
    saveEmployeesData();
    loadEmployees();
    createNotification('نجاح', 'تم حذف الموظف بنجاح', 'success');
}

// Pay salary
function paySalary(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    document.getElementById('salaryEmployeeId').value = employee.id;
    document.getElementById('salaryEmployeeName').value = employee.name;
    document.getElementById('salaryBasicAmount').value = employee.salary;
    document.getElementById('salaryMonth').value = new Date().toISOString().slice(0, 7);
    
    calculateTotalSalary();
    openModal('paySalaryModal');
}

// Calculate total salary
function calculateTotalSalary() {
    const basicSalary = parseFloat(document.getElementById('salaryBasicAmount').value) || 0;
    const commission = parseFloat(document.getElementById('salaryCommission').value) || 0;
    const allowances = parseFloat(document.getElementById('salaryAllowances').value) || 0;
    const deductions = parseFloat(document.getElementById('salaryDeductions').value) || 0;
    
    const totalAmount = basicSalary + commission + allowances - deductions;
    document.getElementById('salaryTotalAmount').value = totalAmount;
}

// Save salary transaction
function saveSalary() {
    const salaryTransaction = {
        id: generateId(),
        employeeId: document.getElementById('salaryEmployeeId').value,
        month: document.getElementById('salaryMonth').value,
        basicSalary: parseFloat(document.getElementById('salaryBasicAmount').value),
        sales: parseFloat(document.getElementById('salarySales').value) || 0,
        commission: parseFloat(document.getElementById('salaryCommission').value) || 0,
        allowances: parseFloat(document.getElementById('salaryAllowances').value) || 0,
        deductions: parseFloat(document.getElementById('salaryDeductions').value) || 0,
        totalAmount: parseFloat(document.getElementById('salaryTotalAmount').value),
        notes: document.getElementById('salaryNotes').value,
        dateIssued: new Date().toISOString()
    };
    
    salaryTransactions.push(salaryTransaction);
    saveEmployeesData();
    loadSalaries();
    
    closeModal('paySalaryModal');
    createNotification('نجاح', 'تم صرف الراتب بنجاح', 'success');
}

// View salary details
function viewSalaryDetails(id) {
    const salary = salaryTransactions.find(sal => sal.id === id);
    if (!salary) return;
    
    const employee = employees.find(emp => emp.id === salary.employeeId);
    if (!employee) return;
    
    const receiptElement = document.getElementById('salaryReceipt');
    receiptElement.innerHTML = `
        <div class="salary-receipt" id="receiptContent">
            <div class="receipt-header">
                <h3 class="company-name">${settings.companyName || 'شركة الاستثمار العراقية'}</h3>
                <h4>إيصال صرف راتب</h4>
                <p>التاريخ: ${formatDate(salary.dateIssued)}</p>
            </div>
            
            <div class="receipt-info">
                <div class="info-row">
                    <span>اسم الموظف:</span>
                    <span>${employee.name}</span>
                </div>
                <div class="info-row">
                    <span>الوظيفة:</span>
                    <span>${employee.position}</span>
                </div>
                <div class="info-row">
                    <span>القسم:</span>
                    <span>${employee.department}</span>
                </div>
                <div class="info-row">
                    <span>الشهر:</span>
                    <span>${formatMonth(salary.month)}</span>
                </div>
            </div>
            
            <div class="receipt-details">
                <table class="receipt-table">
                    <tr>
                        <td>الراتب الأساسي</td>
                        <td>${formatCurrency(salary.basicSalary)}</td>
                    </tr>
                    ${salary.commission ? `
                    <tr>
                        <td>العمولة</td>
                        <td>${formatCurrency(salary.commission)}</td>
                    </tr>
                    ` : ''}
                    ${salary.allowances ? `
                    <tr>
                        <td>العلاوات</td>
                        <td>${formatCurrency(salary.allowances)}</td>
                    </tr>
                    ` : ''}
                    ${salary.deductions ? `
                    <tr>
                        <td>الاستقطاعات</td>
                        <td class="deduction">-${formatCurrency(salary.deductions)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>المجموع الكلي</td>
                        <td>${formatCurrency(salary.totalAmount)}</td>
                    </tr>
                </table>
            </div>
            
            ${salary.notes ? `
            <div class="receipt-notes">
                <p><strong>ملاحظات:</strong> ${salary.notes}</p>
            </div>
            ` : ''}
            
            <div class="receipt-footer">
                <div class="signature-box">
                    <p>توقيع الموظف</p>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <p>توقيع المحاسب</p>
                    <div class="signature-line"></div>
                </div>
            </div>
        </div>
    `;
    
    openModal('viewSalaryModal');
}

// Print salary receipt
function printSalaryReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>إيصال راتب</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    direction: rtl;
                    padding: 20px;
                }
                .salary-receipt {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 2px solid #333;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .receipt-info {
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 5px 0;
                    border-bottom: 1px solid #ddd;
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .receipt-table td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
                .receipt-table .total-row {
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .deduction {
                    color: red;
                }
                .signature-box {
                    display: inline-block;
                    width: 40%;
                    text-align: center;
                    margin-top: 50px;
                }
                .signature-line {
                    height: 2px;
                    background: #333;
                    margin-top: 60px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Search employees
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearchInput').value.toLowerCase();
    const tbody = document.getElementById('employeesTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row.cells[1].textContent.toLowerCase();
        const position = row.cells[2].textContent.toLowerCase();
        const department = row.cells[3].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || position.includes(searchTerm) || department.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Load employee charts
function loadEmployeeCharts() {
    // Salary chart
    const salaryCtx = document.getElementById('employeeSalariesChart').getContext('2d');
    new Chart(salaryCtx, {
        type: 'bar',
        data: {
            labels: employees.map(emp => emp.name),
            datasets: [
                {
                    label: 'الراتب الأساسي',
                    data: employees.map(emp => emp.salary),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    label: 'العمولة',
                    data: employees.map(emp => {
                        const salaries = salaryTransactions.filter(sal => sal.employeeId === emp.id);
                        const totalCommission = salaries.reduce((sum, sal) => sum + sal.commission, 0);
                        return salaries.length > 0 ? totalCommission / salaries.length : 0;
                    }),
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    // Performance chart
    const performanceCtx = document.getElementById('employeePerformanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'pie',
        data: {
            labels: employees.map(emp => emp.name),
            datasets: [{
                data: employees.map(emp => {
                    const salaries = salaryTransactions.filter(sal => sal.employeeId === emp.id);
                    return salaries.reduce((sum, sal) => sum + sal.sales, 0);
                }),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Export employees to CSV
function exportEmployees() {
    let csv = 'الاسم,الوظيفة,القسم,الراتب الأساسي,رقم الهاتف,تاريخ التعيين,الحالة\n';
    
    employees.forEach(employee => {
        csv += `${employee.name},${employee.position},${employee.department},${employee.salary},${employee.phone},${employee.joinDate},${getStatusName(employee.status)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employees.csv';
    link.click();
}

// Export salaries to CSV
function exportSalaries() {
    let csv = 'الموظف,الشهر,الراتب الأساسي,العمولة,العلاوات,الاستقطاعات,الراتب النهائي,تاريخ الصرف\n';
    
    salaryTransactions.forEach(salary => {
        const employee = employees.find(emp => emp.id === salary.employeeId);
        if (employee) {
            csv += `${employee.name},${formatMonth(salary.month)},${salary.basicSalary},${salary.commission},${salary.allowances},${salary.deductions},${salary.totalAmount},${formatDate(salary.dateIssued)}\n`;
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'salaries.csv';
    link.click();
}

// Helper functions
function getStatusName(status) {
    const statusNames = {
        'active': 'نشط',
        'inactive': 'غير نشط',
        'vacation': 'إجازة'
    };
    return statusNames[status] || status;
}

function getContractTypeName(type) {
    const contractTypes = {
        'permanent': 'دائم',
        'temporary': 'مؤقت',
        'contract': 'عقد'
    };
    return contractTypes[type] || type;
}

function formatMonth(monthString) {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' });
}

// Edit employee from view modal
function editEmployeeFromView() {
    closeModal('viewEmployeeModal');
    editEmployee(currentEmployeeId);
}

// Pay salary from view modal
function payEmployeeSalaryFromView() {
    closeModal('viewEmployeeModal');
    paySalary(currentEmployeeId);
}

// Add employee styles
function addEmployeeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .employee-tab-content {
            display: none;
        }
        
        .employee-tab-content.active {
            display: block;
        }
        
        .employee-details-container {
            padding: 20px;
        }
        
        .employee-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--gray-200);
        }
        
        .employee-photo {
            width: 120px;
            height: 120px;
            background: var(--gray-100);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 20px;
            overflow: hidden;
        }
        
        .employee-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .employee-info h2 {
            margin-bottom: 5px;
            color: var(--gray-800);
        }
        
        .employee-info p {
            margin-bottom: 10px;
            color: var(--gray-600);
        }
        
        .employee-details {
            margin-top: 20px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid var(--gray-100);
        }
        
        .detail-label {
            font-weight: 600;
            color: var(--gray-600);
        }
        
        .detail-value {
            color: var(--gray-800);
        }
        
        .salary-receipt {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .receipt-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .company-name {
            font-size: 1.5rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .receipt-info {
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .receipt-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: right;
        }
        
        .receipt-table td:last-child {
            text-align: left;
        }
        
        .receipt-table .total-row {
            background: #f5f5f5;
            font-weight: bold;
        }
        
        .deduction {
            color: red;
        }
        
        .receipt-notes {
            margin-top: 20px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        
        .receipt-footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-box {
            text-align: center;
            width: 40%;
        }
        
        .signature-line {
            height: 2px;
            background: #333;
            margin-top: 60px;
        }
        
        .action-btn {
            padding: 6px;
            font-size: 14px;
            margin: 0 2px;
        }
        
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status.active {
            background: #d4edda;
            color: #155724;
        }
        
        .status.inactive {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status.vacation {
            background: #fff3cd;
            color: #856404;
        }
        
        @media print {
            .modal-header,
            .modal-footer {
                display: none !important;
            }
            
            .salary-receipt {
                border: 2px solid #333;
                max-width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Add global styles for employee system
const globalStyles = `
    .employee-system-icon {
        color: var(--primary-color);
    }
    
    .employee-charts {
        margin-top: 20px;
    }
    
    .employee-chart {
        height: 300px;
        margin-bottom: 30px;
    }
`;

// Add global styles to document
const globalStyleElement = document.createElement('style');
globalStyleElement.textContent = globalStyles;
document.head.appendChild(globalStyleElement);

// Current employee ID for operations
let currentEmployeeId = null;