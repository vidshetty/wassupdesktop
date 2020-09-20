const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const ipcmain = electron.ipcMain;
const global = require("electron").globalShortcut;
const { autoUpdater } = require('electron-updater');

var window = null;

app.on("ready",() => {
    window = new BrowserWindow({
        frame:false,
        width:1100,
        height:600,
        show:false,
        resizable: false,
        webPreferences:{
            nodeIntegration: true
        },
        icon: __dirname+"/public/icons8-hangouts-480.png"
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname+"/public/login.html"),
        protocol: "file",
        slashes: true
    }));
    window.on("ready-to-show",() => {
        window.show();
        autoUpdater.checkForUpdatesAndNotify();
    });
    window.on("close",() => {
        window = null;
        app.quit();
    });
    // global.register("Control+Shift+I",() => {
    //     return;
    // });
});

autoUpdater.on('update-available', () => {
    window.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    window.webContents.send('update_downloaded');
});

ipcmain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcmain.on("minimize",(e) => {
    window.minimize();
});
ipcmain.on("close",(e) => {
    window.close();
});