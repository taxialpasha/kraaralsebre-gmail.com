const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

let mainWindow;
let splashWindow;

// التأكد من وجود مجلد الأيقونات
function ensureIconDirExists() {
  const iconDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
}

// إنشاء شاشة انتظار
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/IraqiInvestmentIcon.ico')
  });

  splashWindow.loadFile('splash.html');
  splashWindow.center();
  
  // إزالة القائمة في شاشة الانتظار
  splashWindow.setMenu(null);
}

// إنشاء النافذة الرئيسية
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    frame: false, // إزالة إطار النافذة الافتراضي
    backgroundColor: '#f5f7fa',
    show: false, // لا تعرض النافذة على الفور، انتظر حتى تكتمل شاشة الانتظار
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    icon: path.join(__dirname, 'assets/IraqiInvestmentIcon.ico')
  });

  // تحميل ملف index.html
  mainWindow.loadFile('index.html');

  // إظهار النافذة الرئيسية عندما تكون جاهزة
  mainWindow.once('ready-to-show', () => {
    // إغلاق شاشة الانتظار وإظهار النافذة الرئيسية
    if (splashWindow) {
      setTimeout(() => {
        splashWindow.close();
        mainWindow.show();
      }, 1000); // انتظر ثانية إضافية بعد جهوزية النافذة الرئيسية
    }
  });

  // فتح DevTools في وضع التطوير
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// عند جاهزية التطبيق
app.whenReady().then(() => {
  // التأكد من وجود مجلدات الأيقونات
  ensureIconDirExists();
  
  // إنشاء شاشة الانتظار أولاً
  createSplashWindow();
  
  // انتظار قليلاً ثم إنشاء النافذة الرئيسية
  setTimeout(createWindow, 1500);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// استماع لحدث إغلاق كل النوافذ
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// معالجة أحداث النافذة
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  app.quit();
});

// الاستماع لرسالة من شاشة الانتظار
ipcMain.on('splash-screen-loaded', () => {
  // يمكنك هنا القيام بأي عمليات تهيئة إضافية
  console.log('Splash screen loaded and ready');
});

// معالجة طلب سعر الصرف
ipcMain.handle('get-exchange-rate', async () => {
  try {
    // يمكنك استخدام API حقيقي لسعر الصرف
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const iqd = response.data.rates.IQD || 1460;
    return iqd;
  } catch (error) {
    // في حالة الفشل، إرجاع قيمة افتراضية
    return 1460;
  }
});

// معالجة إعادة تحميل التطبيق
ipcMain.on('reload-app', () => {
  mainWindow.reload();
});