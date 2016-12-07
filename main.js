// Adds electron module
const electron = require('electron')
const {app, BrowserWindow} = electron

const path = require('path')
const url = require('url')

// Initializes the first window
app.on('ready', () => {
	let win = new BrowserWindow({width:1920, height:1080});
	win.loadURL(`file://${__dirname}/index.html`);	
	
	 // Emitted when the window is closed.
  	win.on('closed', () => {
	    // Dereference the window object, usually you would store windows
	    // in an array if your app supports multi windows, this is the time
	    // when you should delete the corresponding element.
	    win = null
  	})
	win.setMinimumSize(1024, 576);
	
	win.webContents.openDevTools(); //Open console log
})

// Creates a function which opens new browsers
exports.openWindow = (w,h,filename) => {
	let win = new BrowserWindow({width:w, height:h});
	win.loadURL(`file://${__dirname}/${filename}`);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})