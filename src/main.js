import { app, BrowserWindow, ipcMain } from 'electron';
import { Config } from './config/config';
import language from './assets/language';
import axios from 'axios';
import { join } from 'path';
import Promise from 'bluebird';
import regeneratorRuntime from 'regenerator-runtime';
const fs = Promise.promisifyAll(require('fs'));
let win = null;

app.on('ready', () => {

	// Download poster
	ipcMain.handle('downloadPoster', async (event, args) => {
		
		return new Promise((resolve, reject) => {

			axios.get(args.src, { responseType: 'stream' })
			.then((resp) => {
	
				const writeStream = fs.createWriteStream(args.dest);
	
				// Write data to file
				resp.data.pipe(writeStream);
				
				// When finished, send reply back
				writeStream.on('finish', () => {
					resolve(`${language[Config.language].posterDownloaded}`);
				});
	
				// On error writing, send reply back
				writeStream.on('error', (err) => {
					reject(`${language[Config.language].writeToFileError}${err}`);
				});
	
			})
			.catch((err) => {
				reject(`${language[Config.language].posterCouldNotLoadAPI}${err}`);
			});	
		})

	});

	// Create browser window
	win = new BrowserWindow({
		title: 'movie-ex',
		width: 990,
		height: 882,
		resizable: false,
		icon: join(__dirname, './assets/icon.ico'),
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			enableRemoteModule: true
		}
	});

	win.loadFile('index.html');

	// Close
	win.on('closed', () => {
		win = null
	});

	// Dev tools
	//win.openDevTools();

});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
});