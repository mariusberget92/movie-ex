import regeneratorRuntime from 'regenerator-runtime';
import { app, BrowserWindow, ipcMain, session } from 'electron';
import config from './config/config';
import language from './config/language';
import axios from 'axios';
import path from 'path';
import Promise from 'bluebird';
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
					resolve(`${language[config.language].posterDownloaded}`);
				});
	
				// On error writing, send reply back
				writeStream.on('error', (err) => {
					reject(`${language[config.language].writeToFileError}${err}`);
				});
	
			})
			.catch((err) => {
				reject(`${language[config.language].posterCouldNotLoadAPI}${err}`);
			});	
		})

	});

	// Create browser window
	win = new BrowserWindow({
		title: 'movie-ex',
		width: 990,
		height: 882,
		resizable: false,
		icon: path.join(__dirname, './assets/icon.ico'),
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			enableRemoteModule: true
		}
	});

	win.loadFile(path.join(__dirname, './index.html'));

	// Close
	win.on('closed', () => {
		win = null
	});

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