
 const electron = require('electron')
// Module to control application life.
const { app,BrowserWindow, Menu, Tray,ipcMain} = electron;

const path = require('path')
const url = require('url')
// require('electron-debug')({showDevTools: true});
// require('electron-reload')(__dirname);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let template = [
  { role: 'quit' }
]

const menu = Menu.buildFromTemplate(template)

function createWindow () {

  Menu.setApplicationMenu(menu)
  // let tray = new Tray('./public/images/logo.png');
  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'quit', type: 'radio'},
  // ])
  // tray.setToolTip('codelogicx work logger')
  // tray.setContextMenu(contextMenu)

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300, 
    height: 470,
    resizable: false,
    icon: path.join(__dirname, 'public/images/linux/64x64.png')
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function (event) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    try{
      mainWindow.webContents.send('closing', 'logout');
      event.preventDefault();
    }
    catch(e)
    {
      app.quit();
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function (event) {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  try{
    mainWindow.webContents.send('closing', 'logout');
    event.preventDefault();
  }
  catch(e)
  {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


  ipcMain.on('logout-complet', (event, arg) => {
    mainWindow = null;
    app.quit();
  })

