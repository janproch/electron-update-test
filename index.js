const electron = require('electron');
const os = require('os');
const fs = require('fs');
const { Menu, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const updaterChannel = require('./updaterChannel');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const isMac = () => os.platform() == 'darwin';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EU TEST</title>
</head>
<body>
  <h1>EU TEST</h1>
  <div>Version: <b>${app.getVersion()}</b></div>
  <div>Channel: <b>${updaterChannel}</b></div>
  <div>isUpdaterActive: <b>${autoUpdater.isUpdaterActive()}</b></div>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('download-update', '')">Download update</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('check-for-updates', '1')">Check for updates - auto download = true</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('check-for-updates', '0')">Check for updates - auto download = false</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('quit-and-install', '0,0')">quitAndInstall(false,false)</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('quit-and-install', '0,1')">quitAndInstall(false,true)</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('quit-and-install', '1,0')">quitAndInstall(true,false)</button>
  <br/>
  <button onclick="require('electron').ipcRenderer.send('quit-and-install', '1,1')">quitAndInstall(true,true)</button>
  <br/>
  <div id='update-info'></div>
</body>
</html>
`;

log.transports.file.level = 'debug';
autoUpdater.logger = log;
if (updaterChannel) {
  autoUpdater.channel = updaterChannel;
  autoUpdater.allowPrerelease = updaterChannel.includes('beta');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'EU TEST',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
    },
  });

  function loadMainWindow() {
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  }

  loadMainWindow();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

ipcMain.on('check-for-updates', async (event, arg) => {
  console.log('MAIN: Checking for updates...');
  autoUpdater.autoDownload = arg == '1';
  autoUpdater.checkForUpdates();
});

ipcMain.on('quit-and-install', async (event, arg) => {
  const args = arg.split(',').map(arg => arg == '1');
  console.log('MAIN: Checking for updates...', ...args);
  autoUpdater.quitAndInstall(...args);
});

ipcMain.on('download-update', async (event, arg) => {
  console.log('MAIN: Downloading update...');
  autoUpdater.downloadUpdate();
});

function onAppReady() {
  console.log(`EU: Current channel: ${autoUpdater.channel}`);

  autoUpdater.on('checking-for-update', () => {
    console.log('EU: Checking for update...');
  });

  autoUpdater.on('error', error => {
    console.error('EU: Update error:', error);
  });

  autoUpdater.on('update-available', info => {
    console.log('EU: Update available:', info);
  });

  autoUpdater.on('update-not-available', info => {
    console.log('EU: Update not available:', info);
  });

  autoUpdater.on('update-downloaded', info => {
    console.log('EU: Update downloaded from:', info);
  });

  if (!process.env.DEVMODE) {
    // autoUpdater.checkForUpdates();
    // autoUpdater.checkForUpdatesAndNotify();
  }
  createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onAppReady);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac()) {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
