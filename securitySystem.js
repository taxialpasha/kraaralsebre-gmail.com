// Manus Security System v1.0
// This file contains the JavaScript code for the application's security system.
// It includes functionalities for user login, user management, and permissions.

"use strict";

const securitySystem = (() => {
    const LS_USERS_KEY = "app_users";
    const LS_CURRENT_USER_KEY = "app_current_user";
    let appConfig = {
        appName: "نظام Manus",
        logoUrl: "https://via.placeholder.com/150x50.png?text=AppLogo", // Default logo
        loginMessage: "مرحبًا بك في تطبيقنا. يرجى تسجيل الدخول للمتابعة."
    };

    // --- Utility Functions ---
    function _encryptPassword(password) {
        // Basic Base64 encoding for demonstration. NOT FOR PRODUCTION.
        // For production, use a strong hashing algorithm (e.g., bcrypt, Argon2) on the server-side.
        try {
            return btoa(password);
        } catch (e) {
            console.error("Error encoding password (btoa not available in this environment?):", e);
            // Fallback for environments like Node.js without btoa directly
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(password).toString('base64');
            }
            return password; // Or handle error appropriately
        }
    }

    function _decryptPassword(encryptedPassword) {
        // Basic Base64 decoding for demonstration.
        try {
            return atob(encryptedPassword);
        } catch (e) {
            console.error("Error decoding password (atob not available in this environment?):", e);
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(encryptedPassword, 'base64').toString('ascii');
            }
            return encryptedPassword;
        }
    }

    function _getUsers() {
        const users = localStorage.getItem(LS_USERS_KEY);
        return users ? JSON.parse(users) : [];
    }

    function _saveUsers(users) {
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    }

    function _getCurrentUser() {
        const user = localStorage.getItem(LS_CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    function _setCurrentUser(user) {
        if (user) {
            localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(LS_CURRENT_USER_KEY);
        }
    }

    // --- User Management (Core Logic) ---
    function initializeAdmin() {
        let users = _getUsers();
        const adminExists = users.some(user => user.role === "admin");
        if (!adminExists) {
            const adminUser = {
                id: Date.now().toString(),
                username: "admin",
                password: _encryptPassword("admin123"), // Default admin password
                role: "admin",
                permissions: { /* All permissions implicitly true for admin or define specific ones */ }
            };
            users.push(adminUser);
            _saveUsers(users);
            console.log("Admin user created with default credentials (admin/admin123).");
        }
    }

    function addUser(username, password, role = "user", permissions = {}) {
        let users = _getUsers();
        if (users.some(user => user.username === username)) {
            console.error("User already exists:", username);
            return { success: false, message: "اسم المستخدم موجود بالفعل." };
        }
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: _encryptPassword(password),
            role: role,
            permissions: permissions
        };
        users.push(newUser);
        _saveUsers(users);
        return { success: true, message: "تمت إضافة المستخدم بنجاح.", userId: newUser.id };
    }

    function updateUserCredentials(username, oldPassword, newUsername, newPassword) {
        let users = _getUsers();
        const userIndex = users.findIndex(user => user.username === username);
        if (userIndex === -1) {
            return { success: false, message: "المستخدم غير موجود." };
        }
        if (users[userIndex].password !== _encryptPassword(oldPassword)) {
            return { success: false, message: "كلمة المرور القديمة غير صحيحة." };
        }
        if (newUsername && newUsername !== username && users.some(u => u.username === newUsername)) {
             return { success: false, message: "اسم المستخدم الجديد موجود بالفعل." };
        }

        users[userIndex].username = newUsername || users[userIndex].username;
        if (newPassword) {
            users[userIndex].password = _encryptPassword(newPassword);
        }
        _saveUsers(users);
        // If current user updated their own info, update current user session
        const currentUser = _getCurrentUser();
        if (currentUser && currentUser.username === username) {
            _setCurrentUser(users[userIndex]);
        }
        return { success: true, message: "تم تحديث بيانات الاعتماد بنجاح." };
    }

    function deleteUser(usernameToDelete, adminUsername, adminPassword) {
        const admin = authenticateUser(adminUsername, adminPassword);
        if (!admin || admin.role !== 'admin') {
            return { success: false, message: "مصادقة المدير فشلت أو ليس لديه صلاحية." };
        }
        if (usernameToDelete === adminUsername) {
            return { success: false, message: "لا يمكن للمدير حذف حسابه الخاص بهذه الطريقة." };
        }
        let users = _getUsers();
        const initialLength = users.length;
        users = users.filter(user => user.username !== usernameToDelete);
        if (users.length === initialLength) {
            return { success: false, message: "المستخدم المراد حذفه غير موجود." };
        }
        _saveUsers(users);
        return { success: true, message: "تم حذف المستخدم بنجاح." };
    }

    function updateUserPermissions(usernameToUpdate, newPermissions, adminUsername, adminPassword) {
        const admin = authenticateUser(adminUsername, adminPassword);
        if (!admin || admin.role !== 'admin') {
            return { success: false, message: "مصادقة المدير فشلت أو ليس لديه صلاحية." };
        }
        let users = _getUsers();
        const userIndex = users.findIndex(user => user.username === usernameToUpdate);
        if (userIndex === -1) {
            return { success: false, message: "المستخدم غير موجود." };
        }
        users[userIndex].permissions = newPermissions;
        _saveUsers(users);
        // If the updated user is the current user, refresh their session data
        const currentUser = _getCurrentUser();
        if (currentUser && currentUser.username === usernameToUpdate) {
            _setCurrentUser(users[userIndex]);
        }
        return { success: true, message: "تم تحديث صلاحيات المستخدم بنجاح." };
    }

    // --- Authentication ---
    function authenticateUser(username, password) {
        const users = _getUsers();
        const user = users.find(u => u.username === username);
        if (user && user.password === _encryptPassword(password)) {
            const { password, ...userWithoutPassword } = user; // Don't store/return password
            return userWithoutPassword;
        }
        return null;
    }

    function login(username, password) {
        const user = authenticateUser(username, password);
        if (user) {
            _setCurrentUser(user);
            console.log("User logged in:", user.username, "Role:", user.role);
            // Trigger UI update or navigation after login
            hideLoginModal();
            renderAppBasedOnUserRole();
            renderSettingsPage(); // Re-render settings if it's already visible
            return { success: true, user: user };
        }
        console.error("Login failed for user:", username);
        // Display error message on login form
        const errorElement = document.getElementById("loginErrorMessage");
        if (errorElement) errorElement.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة.";
        return { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة." };
    }

    function logout() {
        const currentUser = _getCurrentUser();
        if (currentUser) {
            console.log("User logged out:", currentUser.username);
        }
        _setCurrentUser(null);
        // Trigger UI update or navigation after logout
        showLoginModal();
        renderAppBasedOnUserRole(); // Re-render app to reflect logged-out state
        const settingsContainer = document.getElementById("securitySettingsContainer");
        if (settingsContainer) settingsContainer.innerHTML = ''; // Clear settings page
    }

    function checkPermission(permissionKey) {
        const currentUser = _getCurrentUser();
        if (!currentUser) return false;
        if (currentUser.role === "admin") return true; // Admin has all permissions
        return currentUser.permissions && currentUser.permissions[permissionKey] === true;
    }

    // --- UI Rendering and Interaction (Placeholders - to be detailed) ---
    // These functions will create/manipulate DOM elements for login and settings.

    function createLoginModal() {
        if (document.getElementById("loginModal")) return; // Already exists

        const modal = document.createElement("div");
        modal.id = "loginModal";
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;";

        const modalContent = document.createElement("div");
        modalContent.style.cssText = "background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 350px; text-align: right; direction: rtl;";

        const logoImg = document.createElement("img");
        logoImg.src = appConfig.logoUrl;
        logoImg.alt = "App Logo";
        logoImg.style.cssText = "display: block; margin: 0 auto 20px auto; max-width: 150px; max-height: 70px;";

        const title = document.createElement("h2");
        title.textContent = "تسجيل الدخول إلى " + appConfig.appName;
        title.style.textAlign = "center";
        title.style.marginBottom = "10px";

        const appMessage = document.createElement("p");
        appMessage.textContent = appConfig.loginMessage;
        appMessage.style.textAlign = "center";
        appMessage.style.fontSize = "0.9em";
        appMessage.style.color = "#555";
        appMessage.style.marginBottom = "20px";

        const form = document.createElement("form");
        form.onsubmit = (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            login(username, password);
        };

        const usernameLabel = document.createElement("label");
        usernameLabel.textContent = "اسم المستخدم:";
        usernameLabel.style.display = "block";
        usernameLabel.style.marginBottom = "5px";
        const usernameInput = document.createElement("input");
        usernameInput.type = "text";
        usernameInput.name = "username";
        usernameInput.required = true;
        usernameInput.style.cssText = "width: calc(100% - 22px); padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;";

        const passwordLabel = document.createElement("label");
        passwordLabel.textContent = "كلمة المرور:";
        passwordLabel.style.display = "block";
        passwordLabel.style.marginBottom = "5px";
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.name = "password";
        passwordInput.required = true;
        passwordInput.style.cssText = "width: calc(100% - 22px); padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px;";

        const errorMessage = document.createElement("p");
        errorMessage.id = "loginErrorMessage";
        errorMessage.style.color = "red";
        errorMessage.style.textAlign = "center";
        errorMessage.style.minHeight = "1.2em"; 

        const loginButton = document.createElement("button");
        loginButton.type = "submit";
        loginButton.textContent = "تسجيل الدخول";
        // Example icon (using text, replace with actual icon font/SVG)
        // loginButton.innerHTML = '<i class="icon-login"></i> تسجيل الدخول'; 
        loginButton.style.cssText = "width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1em;";
        loginButton.onmouseover = () => loginButton.style.backgroundColor = "#0056b3";
        loginButton.onmouseout = () => loginButton.style.backgroundColor = "#007bff";

        // Placeholder for other buttons as requested (e.g., forgot password, settings for admin)
        const extraActionsContainer = document.createElement("div");
        extraActionsContainer.style.marginTop = "15px";
        extraActionsContainer.style.textAlign = "center";
        // Example: const forgotPasswordLink = document.createElement('a'); ...

        form.appendChild(usernameLabel);
        form.appendChild(usernameInput);
        form.appendChild(passwordLabel);
        form.appendChild(passwordInput);
        form.appendChild(errorMessage);
        form.appendChild(loginButton);
        form.appendChild(extraActionsContainer);

        modalContent.appendChild(logoImg);
        modalContent.appendChild(title);
        modalContent.appendChild(appMessage);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    function showLoginModal() {
        let modal = document.getElementById("loginModal");
        if (!modal) {
            createLoginModal();
            modal = document.getElementById("loginModal");
        }
        if (modal) modal.style.display = "flex";
        // Clear previous error messages
        const errorElement = document.getElementById("loginErrorMessage");
        if (errorElement) errorElement.textContent = "";
        // Clear form fields
        const form = modal.querySelector('form');
        if (form) form.reset();
    }

    function hideLoginModal() {
        const modal = document.getElementById("loginModal");
        if (modal) modal.style.display = "none";
    }

    function renderSettingsPage() {
        const currentUser = _getCurrentUser();
        const container = document.getElementById("securitySettingsContainer"); // Assume a div with this ID exists in your HTML
        if (!container) {
            console.warn("Security settings container not found. Create a <div id='securitySettingsContainer'></div> in your HTML.");
            return;
        }
        container.innerHTML = ''; // Clear previous content
        container.style.direction = "rtl";
        container.style.padding = "20px";
        container.style.border = "1px solid #eee";
        container.style.borderRadius = "8px";
        container.style.backgroundColor = "#f9f9f9";

        if (!currentUser) {
            container.textContent = "يرجى تسجيل الدخول للوصول إلى الإعدادات.";
            return;
        }

        const title = document.createElement("h2");
        title.textContent = "إعدادات النظام الأمني";
        title.style.borderBottom = "2px solid #007bff";
        title.style.paddingBottom = "10px";
        title.style.marginBottom = "20px";
        container.appendChild(title);

        // Section: Change own credentials
        const changeCredentialsSection = document.createElement("div");
        changeCredentialsSection.innerHTML = "<h3>تغيير اسم المستخدم/كلمة المرور</h3>";
        const oldPasswordLabel = document.createElement("label");
        oldPasswordLabel.textContent = "كلمة المرور الحالية:";
        const oldPasswordInput = document.createElement("input");
        oldPasswordInput.type = "password";
        oldPasswordInput.id = "oldPasswordSettings";
        oldPasswordInput.style.marginBottom="10px"; oldPasswordInput.style.display="block"; oldPasswordInput.style.width="300px";

        const newUsernameLabel = document.createElement("label");
        newUsernameLabel.textContent = "اسم المستخدم الجديد (اتركه فارغًا لعدم التغيير):";
        const newUsernameInput = document.createElement("input");
        newUsernameInput.type = "text";
        newUsernameInput.id = "newUsernameSettings";
        newUsernameInput.placeholder = currentUser.username;
        newUsernameInput.style.marginBottom="10px"; newUsernameInput.style.display="block"; newUsernameInput.style.width="300px";

        const newPasswordLabel = document.createElement("label");
        newPasswordLabel.textContent = "كلمة المرور الجديدة (اتركها فارغة لعدم التغيير):";
        const newPasswordInput = document.createElement("input");
        newPasswordInput.type = "password";
        newPasswordInput.id = "newPasswordSettings";
        newPasswordInput.style.marginBottom="10px"; newPasswordInput.style.display="block"; newPasswordInput.style.width="300px";

        const updateCredentialsButton = document.createElement("button");
        updateCredentialsButton.textContent = "تحديث البيانات";
        updateCredentialsButton.onclick = () => {
            const oldPass = document.getElementById("oldPasswordSettings").value;
            const newName = document.getElementById("newUsernameSettings").value;
            const newPass = document.getElementById("newPasswordSettings").value;
            if (!oldPass) { alert("يرجى إدخال كلمة المرور الحالية."); return; }
            const result = updateUserCredentials(currentUser.username, oldPass, newName || null, newPass || null);
            alert(result.message);
            if (result.success) {
                 // If username changed, user needs to login again with new username
                if (newName && newName !== currentUser.username) {
                    logout(); // Force logout to re-login with new username
                } else {
                    renderSettingsPage(); // Re-render to reflect changes (e.g. placeholder)
                }
            }
        };
        changeCredentialsSection.appendChild(oldPasswordLabel);
        changeCredentialsSection.appendChild(oldPasswordInput);
        changeCredentialsSection.appendChild(newUsernameLabel);
        changeCredentialsSection.appendChild(newUsernameInput);
        changeCredentialsSection.appendChild(newPasswordLabel);
        changeCredentialsSection.appendChild(newPasswordInput);
        changeCredentialsSection.appendChild(updateCredentialsButton);
        container.appendChild(changeCredentialsSection);

        // Section: Admin - User Management (only if current user is admin)
        if (currentUser.role === "admin") {
            const adminSection = document.createElement("div");
            adminSection.style.marginTop = "30px";
            adminSection.innerHTML = "<h3>إدارة المستخدمين (للمدير)</h3>";
            
            // List users
            const usersListDiv = document.createElement("div");
            usersListDiv.id = "adminUserList";
            adminSection.appendChild(usersListDiv);
            _renderAdminUserList(usersListDiv);

            // Add new user form
            const addUserDiv = document.createElement("div");
            addUserDiv.innerHTML = "<h4>إضافة مستخدم جديد</h4>";
            const addUsernameLabel = document.createElement("label"); addUsernameLabel.textContent="اسم المستخدم:";
            const addUsernameInput = document.createElement("input"); addUsernameInput.type="text"; addUsernameInput.id="addUsernameAdmin"; addUsernameInput.style.marginRight="5px";
            const addPasswordLabel = document.createElement("label"); addPasswordLabel.textContent="كلمة المرور:"; addPasswordLabel.style.marginLeft="10px";
            const addPasswordInput = document.createElement("input"); addPasswordInput.type="password"; addPasswordInput.id="addUserPasswordAdmin"; addPasswordInput.style.marginRight="5px";
            const addRoleLabel = document.createElement("label"); addRoleLabel.textContent="الدور:"; addRoleLabel.style.marginLeft="10px";
            const addRoleSelect = document.createElement("select"); addRoleSelect.id="addUserRoleAdmin"; addRoleSelect.style.marginRight="5px";
            const optionUser = document.createElement("option"); optionUser.value="user"; optionUser.textContent="مستخدم";
            const optionAdmin = document.createElement("option"); optionAdmin.value="admin"; optionAdmin.textContent="مدير";
            addRoleSelect.appendChild(optionUser); addRoleSelect.appendChild(optionAdmin);
            const addUserButton = document.createElement("button"); addUserButton.textContent="إضافة مستخدم"; addUserButton.style.marginLeft="10px";
            addUserButton.onclick = () => {
                const newU = document.getElementById("addUsernameAdmin").value;
                const newP = document.getElementById("addUserPasswordAdmin").value;
                const newR = document.getElementById("addUserRoleAdmin").value;
                if (!newU || !newP) { alert("يرجى إدخال اسم المستخدم وكلمة المرور."); return; }
                const result = addUser(newU, newP, newR);
                alert(result.message);
                if (result.success) _renderAdminUserList(usersListDiv);
            };
            addUserDiv.appendChild(addUsernameLabel); addUserDiv.appendChild(addUsernameInput);
            addUserDiv.appendChild(addPasswordLabel); addUserDiv.appendChild(addPasswordInput);
            addUserDiv.appendChild(addRoleLabel); addUserDiv.appendChild(addRoleSelect);
            addUserDiv.appendChild(addUserButton);
            adminSection.appendChild(addUserDiv);

            container.appendChild(adminSection);
        }
        
        // Logout Button
        const logoutButton = document.createElement("button");
        logoutButton.textContent = "تسجيل الخروج";
        logoutButton.style.marginTop = "30px";
        logoutButton.style.backgroundColor = "#dc3545";
        logoutButton.style.color = "white";
        logoutButton.onclick = logout;
        container.appendChild(logoutButton);
    }

    function _renderAdminUserList(containerElement) {
        const users = _getUsers();
        const currentUser = _getCurrentUser();
        containerElement.innerHTML = "<h5>قائمة المستخدمين:</h5>";
        const ul = document.createElement("ul");
        ul.style.listStyleType = "none";
        ul.style.padding = "0";

        users.forEach(user => {
            const li = document.createElement("li");
            li.style.border = "1px solid #ddd";
            li.style.padding = "10px";
            li.style.marginBottom = "5px";
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";

            const userInfo = document.createElement("span");
            userInfo.textContent = `المستخدم: ${user.username} (الدور: ${user.role})`;
            li.appendChild(userInfo);

            const actionsDiv = document.createElement("div");

            // Permissions button (placeholder for detailed UI)
            const permissionsButton = document.createElement("button");
            permissionsButton.textContent = "تعديل الصلاحيات";
            permissionsButton.style.marginLeft = "5px";
            permissionsButton.onclick = () => {
                // This would open a more detailed UI for permission management
                // For now, let's imagine a simple prompt or a predefined set
                const newPermsRaw = prompt(`أدخل الصلاحيات لـ ${user.username} (JSON, مثال: {\

\"canViewDashboard\": true, \"canEditUsers\": false}):", JSON.stringify(user.permissions || {}));
                if (newPermsRaw) {
                    try {
                        const newPermissions = JSON.parse(newPermsRaw);
                        const adminCreds = JSON.parse(sessionStorage.getItem("tempAdminCreds")); // Temp way to get admin pass for this action
                        if (!adminCreds) { alert("خطأ: بيانات اعتماد المدير المؤقتة غير موجودة لإتمام العملية."); return;}
                        const result = updateUserPermissions(user.username, newPermissions, currentUser.username, _decryptPassword(adminCreds.password)); // Requires admin password
                        alert(result.message);
                        if (result.success) _renderAdminUserList(containerElement);
                    } catch (e) {
                        alert("صيغة JSON للصلاحيات غير صحيحة.");
                    }
                }
            };
            actionsDiv.appendChild(permissionsButton);

            // Delete button (if not admin deleting self)
            if (user.username !== currentUser.username) {
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "حذف";
                deleteButton.style.marginLeft = "5px";
                deleteButton.style.backgroundColor = "#dc3545";
                deleteButton.style.color = "white";
                deleteButton.onclick = () => {
                    if (confirm(`هل أنت متأكد أنك تريد حذف المستخدم ${user.username}؟`)) {
                        const adminCreds = JSON.parse(sessionStorage.getItem("tempAdminCreds"));
                        if (!adminCreds) { alert("خطأ: بيانات اعتماد المدير المؤقتة غير موجودة لإتمام العملية."); return;}
                        const result = deleteUser(user.username, currentUser.username, _decryptPassword(adminCreds.password));
                        alert(result.message);
                        if (result.success) _renderAdminUserList(containerElement);
                    }
                };
                actionsDiv.appendChild(deleteButton);
            }
            li.appendChild(actionsDiv);
            ul.appendChild(li);
        });
        containerElement.appendChild(ul);

        // Store admin credentials temporarily for actions within this list (not ideal for production)
        const tempAdminPassword = prompt("لتأكيد الإجراءات الإدارية في هذه القائمة، يرجى إدخال كلمة مرور المدير الحالية:");
        if (tempAdminPassword && authenticateUser(currentUser.username, tempAdminPassword)){
            sessionStorage.setItem("tempAdminCreds", JSON.stringify({username: currentUser.username, password: _encryptPassword(tempAdminPassword)}));
        } else if (tempAdminPassword !== null) { // if user didn't cancel prompt
            alert("كلمة مرور المدير غير صحيحة. لن تتمكن من تنفيذ إجراءات إدارية.");
            containerElement.innerHTML += "<p style='color:red;'>كلمة مرور المدير غير صحيحة. لن تتمكن من تنفيذ إجراءات إدارية.</p>";
        }
    }

    // --- Application Specific Permissions & UI Control ---
    // This function should be called after login/logout or when permissions change.
    function renderAppBasedOnUserRole() {
        const currentUser = _getCurrentUser();
        const appContainer = document.getElementById("appContainer"); // Main container for your app content
        const settingsButtonOnApp = document.getElementById("appSettingsButton"); // A general settings button in the app UI

        if (!appContainer) {
            console.warn("App container (appContainer) not found. UI updates based on role might not work.");
        }

        if (currentUser) {
            // User is logged in
            if (appContainer) {
                appContainer.style.display = "block"; // Or however your app shows content
            }
            if (settingsButtonOnApp) settingsButtonOnApp.style.display = "inline-block";
            applyPermissionsToAppElements();
        } else {
            // User is logged out
            if (appContainer) {
                appContainer.style.display = "none"; // Hide app content if not logged in
            }
            if (settingsButtonOnApp) settingsButtonOnApp.style.display = "none";
            // Optionally, clear or reset parts of the app UI
            const controlledElements = document.querySelectorAll("[data-permission]");
            controlledElements.forEach(el => {
                el.style.display = "none"; // Hide all permission-controlled elements
                el.disabled = true;
            });
        }
    }

    // This function will check elements with `data-permission` attributes
    // and show/hide or enable/disable them based on the current user's permissions.
    function applyPermissionsToAppElements() {
        const currentUser = _getCurrentUser();
        if (!currentUser) return; // No user, no permissions to apply beyond hiding everything

        // Example: Elements like <button data-permission="canEditArticles">Edit</button>
        // Or <div data-permission="canViewAdminDashboard">...</div>
        const controlledElements = document.querySelectorAll("[data-permission]");

        controlledElements.forEach(element => {
            const requiredPermission = element.getAttribute("data-permission");
            if (checkPermission(requiredPermission)) {
                element.style.display = ""; // Or original display style
                element.disabled = false;
            } else {
                element.style.display = "none";
                element.disabled = true;
            }
        });

        // Specific controls for sidebar icons, buttons etc. as per user request
        // This is highly dependent on your app's HTML structure.
        // Example: Control sidebar icons
        const sidebarIcons = {
            reports: document.getElementById("sidebarIconReports"),
            settings: document.getElementById("sidebarIconSettings"),
            userManagement: document.getElementById("sidebarIconUserManagement")
        };

        if (sidebarIcons.reports) {
            if (checkPermission("viewReports")) sidebarIcons.reports.style.display = "block";
            else sidebarIcons.reports.style.display = "none";
        }
        if (sidebarIcons.settings) {
            if (checkPermission("accessSettings")) sidebarIcons.settings.style.display = "block";
            else sidebarIcons.settings.style.display = "none";
        }
        if (sidebarIcons.userManagement) {
            if (currentUser.role === 'admin') sidebarIcons.userManagement.style.display = "block";
            else sidebarIcons.userManagement.style.display = "none";
        }
        
        // Example: Control specific buttons in the app
        const specialButton = document.getElementById("specialActionButton");
        if (specialButton) {
            if (checkPermission("useSpecialAction")) {
                specialButton.disabled = false;
                specialButton.style.opacity = "1";
            } else {
                specialButton.disabled = true;
                specialButton.style.opacity = "0.5";
            }
        }
        console.log("Applied permissions to app elements.");
    }

    // --- Public API ---
    // Initialize the system (e.g., create admin if not exists, check login state)
    function init(config = {}) {
        Object.assign(appConfig, config); // Allow overriding default config
        initializeAdmin();
        const currentUser = _getCurrentUser();
        if (currentUser) {
            console.log("User already logged in:", currentUser.username);
            hideLoginModal();
            renderAppBasedOnUserRole();
            // If settings page is meant to be a separate view, call its render function if appropriate
            // renderSettingsPage(); 
        } else {
            showLoginModal();
            renderAppBasedOnUserRole(); // Ensure app is in logged-out state
        }
        // Ensure settings page renders correctly if it's part of the main UI and user is logged in
        if (currentUser && document.getElementById("securitySettingsContainer")) {
            renderSettingsPage();
        }
    }

    // Call this function when your main application HTML is ready.
    // document.addEventListener('DOMContentLoaded', () => init());

    return {
        init,
        login,
        logout,
        getCurrentUser: _getCurrentUser,
        checkPermission,
        renderSettingsPage, // Expose to be called manually if needed
        showLoginModal, // Expose for manual trigger if needed
        // User management functions (primarily for admin UI)
        addUser, 
        updateUserCredentials, // For users to change their own, or admin to change others (with care)
        deleteUser, // Admin only
        updateUserPermissions, // Admin only
        getUsers: _getUsers, // For admin to list users
        applyPermissionsToAppElements // To re-apply permissions if UI changes dynamically
    };
})();

// Example of how to initialize and use the security system:
// Make sure you have a <div id="appContainer"> for your main app content
// and a <div id="securitySettingsContainer"> for the settings page.
/*
document.addEventListener('DOMContentLoaded', () => {
    // Example permissions you might define for your app elements:
    // <button data-permission="canEditContent">Edit Content</button>
    // <div data-permission="viewSensitiveData">Sensitive Data Section</div>
    // <a href="#" id="sidebarIconReports" data-permission="viewReports">Reports Icon</a>

    securitySystem.init({
        appName: "تطبيقي الرائع",
        logoUrl: "/path/to/your/logo.png", // Provide your logo path
        loginMessage: "أهلاً بك! يرجى تسجيل الدخول للاستفادة من كامل مزايا التطبيق."
    });

    // Example: Button to open settings (could be in your app's main UI)
    const openSettingsBtn = document.getElementById("appSettingsButton");
    if (openSettingsBtn) {
        openSettingsBtn.onclick = () => {
            const settingsContainer = document.getElementById("securitySettingsContainer");
            if (settingsContainer) {
                settingsContainer.style.display = settingsContainer.style.display === 'none' || !settingsContainer.style.display ? 'block' : 'none';
                if (settingsContainer.style.display === 'block') {
                    securitySystem.renderSettingsPage();
                }
            }
        };
    }
    
    // Example of how an admin might grant a permission (this would be part of the settings UI logic)
    // This is a conceptual example, the actual UI for this is in renderAdminUserList
    // const currentUser = securitySystem.getCurrentUser();
    // if (currentUser && currentUser.role === 'admin') {
    //     // Simulating admin granting 'viewReports' permission to 'user123'
    //     const users = securitySystem.getUsers();
    //     const targetUser = users.find(u => u.username === 'user123');
    //     if (targetUser) {
    //         const currentAdminPassword = prompt("Enter your admin password to confirm:");
    //         if (currentAdminPassword) {
    //              const updatedPermissions = { ...targetUser.permissions, viewReports: true, accessSettings: true };
    //              securitySystem.updateUserPermissions('user123', updatedPermissions, currentUser.username, currentAdminPassword);
    //         }
    //     }
    // }
});
*/

console.log("Security system script loaded. Call securitySystem.init() to start.");



