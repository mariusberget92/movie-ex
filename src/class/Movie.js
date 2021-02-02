import { ipcRenderer } from 'electron';
import config from '../config/config';
import language from '../config/language';
import axios from 'axios';
import path from 'path';
import scenex from 'scenex';
import Promise from 'bluebird';
import { URLSearchParams } from 'url';
import { Unrar } from '@kaizokupuffball/unrar';
const fs = Promise.promisifyAll(require('fs'));

export class Movie {

    // Private field declaration of the absolute path
    // from the dropped folder
    #movie = {
        old: {
            absolutePath: null,
            dirName: null
        },
        new: {
            absolutePath: null,
            dirName: null
        },
        files: [],
        tags: {},
        settings: {
            downloadPoster: false,
            extractRar: false
        },
        rarExtractionSuccess: null
    }
    
    /**
     * Constructor
     * @param {PathLike} absolutePath 
     */
    constructor(absolutePath, settingExtractRar, settingDownloadPoster) {

        // Set settings
        this.#movie.settings.downloadPoster = settingDownloadPoster;
        this.#movie.settings.extractRar = settingExtractRar;

        // Set movie properties
        this.setProperties(absolutePath);

    }

    /**
     * Set movie properties like old and new dirnames and paths
     * @param {PathLike} absolutePath 
     */
    setProperties(absolutePath) {

        // Set absolute path for this movie object
        this.#movie.old.absolutePath = absolutePath;

        if (fs.statSync(absolutePath).isDirectory()) {

            // The movie folder name
            this.#movie.old.dirName = path.basename(this.#movie.old.absolutePath);

            // Grab scenerelease tags
            this.#movie.tags = scenex(this.#movie.old.dirName);

            // Update the movie directory name and path
            this.#movie.new.dirName = `${this.#movie.tags.title} (${this.#movie.tags.year})`;
            this.#movie.new.absolutePath = path.join(
                this.#movie.old.absolutePath.substr(0, this.#movie.old.absolutePath.lastIndexOf('\\')),
                this.#movie.new.dirName
            );

        }

    }

    /**
     * Process the movie
     */
    async process() {

        return new Promise(async (resolve, reject) => {

            // Check if dropped item is folder or file
            if (fs.statSync(this.#movie.old.absolutePath).isFile()) {

                // File and directory name
                var baseDir = path.dirname(this.#movie.old.absolutePath);                                   // C:\Users\Anoneemo\Downloads\dl
                var dirName = path.basename(this.#movie.old.absolutePath).replace(/\.[^/.]+$/, '');         // Max.Cloud.2020.1080p.BluRay.DD+5.1.x264-iFT
                var fileName = path.basename(this.#movie.old.absolutePath);                                 // Max.Cloud.2020.1080p.BluRay.DD+5.1.x264-iFT.mkv

                // Create directory for the file
                await this.createDirForFile(path.join(baseDir, dirName));

                // New absolute path
                var newAbsolutePath = path.join(baseDir, dirName, fileName);

                // Move the file into the newly created directory
                await this.rename(
                    this.#movie.old.absolutePath,
                    newAbsolutePath
                );
                
                // Update movie object
                this.setProperties(path.join(baseDir, dirName));

            }

            // Rename the movie folder first so the folder
            // won't be busy later when we want to download or change names of
            // other files etc.
            await this.rename(this.#movie.old.absolutePath, this.#movie.new.absolutePath);

            // Scan for files
            await this.scanFiles(this.#movie.new.absolutePath);

            // Extract rar files
            if (this.#movie.settings.extractRar == true) {
                await this.extract();
            }

            // Delete files
            for (var [i, file] of Object.entries(this.#movie.files)) {

                var file = file.toLowerCase();
                var fileExt = path.extname(file);

                // Delete files based on extensions
                if (config.delete.extensions.includes(fileExt)) {
                    await this.deleteItem(this.#movie.new.absolutePath, file);
                }

                // Delete directories
                if (config.delete.directories.includes(file)) {
                    await this.deleteItem(this.#movie.new.absolutePath, file);
                }

                // Delete .r* files (rar files)
                // Only if rar extraction succeeds
                if ((/(.r..)/i).test(fileExt) && this.#movie.settings.extractRar == true && this.#movie.rarExtractionSuccess == true) {
                    await this.deleteItem(this.#movie.new.absolutePath, file);
                }

                // Delete sample file
                if (file.includes('sample')) {
                    await this.deleteItem(this.#movie.new.absolutePath, file);
                } 

            }
            
            // Create subtitles directory
            await this.makeDirectory(this.#movie.new.absolutePath, config.subPath);

            // After all the deletions we need to 
            // scan the directory again to update the files array
            await this.scanFiles(this.#movie.new.absolutePath);

            // Do the rest of file management in this last for-loop
            for (var [i, file] of Object.entries(this.#movie.files)) {

                var file = file.toLowerCase();
                var fileExt = path.extname(file);

                // Move the subtitles to the /subs directory
                if (config.subExtensions.includes(fileExt)) {
                    await this.rename(
                        path.join(this.#movie.new.absolutePath, file),
                        path.join(this.#movie.new.absolutePath, config.subPath, file)
                    );
                }

                // Rename the movie file
                if (config.movieExtensions.includes(fileExt)) {

                    // Just some type normalization
                    if (this.#movie.tags.type.match(/bluray/i))             { this.#movie.tags.type = 'BluRay'; }
                    if (this.#movie.tags.type.match(/webdl|web-dl|web/i))   { this.#movie.tags.type = 'WEB-DL'; }
                    if (this.#movie.tags.type.match(/web-rip|webrip/i))     { this.#movie.tags.type = 'WEBRip'; }
                    if (this.#movie.tags.type.match(/dvd|dvd-rip|dvdrip/i)) { this.#movie.tags.type = 'DVDRip'; }
                    if (this.#movie.tags.type.match(/vhs|vhs-rip|vhsrip/i)) { this.#movie.tags.type = 'VHSRip'; }
                    if (this.#movie.tags.type.match(/hdrip|hd-rip/i))       { this.#movie.tags.type = 'HDRip';  }

                    var name = (typeof this.#movie.tags.resolution == 'undefined')
                    ? `${this.#movie.tags.title} [${this.#movie.tags.type}]${fileExt}`
                    : `${this.#movie.tags.title} [${this.#movie.tags.type}-${this.#movie.tags.resolution}]${fileExt}`;

                    await this.rename(
                        path.join(this.#movie.new.absolutePath, file),
                        path.join(this.#movie.new.absolutePath, name)
                    );

                }

            }

            // Download the poster at last
            if (this.#movie.settings.downloadPoster == true) {
                await this.downloadPoster();
            }

            this.log('------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------', 'text-neutral');
            resolve(`${language[config.language].movieProcessSuccess}${this.#movie.tags.title}`);

        });

    }

    /**
     * 
     * @param {PathLike} dir 
     * @param {PathLike} file 
     */
    async createDirForFile(dirAbsolutePath) {
        await fs.mkdirAsync(dirAbsolutePath, { recursive: true })
        .then(() => {
            this.log(`${language[config.language].createDirectoryForFileSuccess}${dirAbsolutePath}`, 'text-green');
        })
        .catch((err) => {
            this.log(`${language[config.language].createDirectoryForFileError}${err}`, 'text-red');
        });
    }

    /**
     * Extract .rar file
     */
    async extract() {

        return new Promise((resolve, reject) => {

            // New extractor
            const extractor = new Unrar;

            // Check for .rar file
            var rarFile = this.#movie.files.filter(file => file.match(/(.rar)$/i));
            if (rarFile.length <= 0) {
                resolve('No .rar file found');
            } else {
                this.log(`${language[config.language].rarFound}`, 'text-neutral');
            }

            // Extraction progress
            extractor.on('progress', async (percent) => {
                this.log(`${language[config.language].rarProgress} ${percent}%`, 'text-neutral');
            });

            // Extract
            extractor.uncompress({
                src: path.join(this.#movie.new.absolutePath, rarFile[0]),
                dest: this.#movie.new.absolutePath,
                command: 'e',
                switches: ['-o+', '-idcd']
            }).then(() => {
                this.log(`${language[config.language].rarDone}`, 'text-green');
                this.#movie.rarExtractionSuccess = true;
                resolve('Extraction done!');
            }).catch((err) => {
                this.log(`${language[config.language].rarError}${err}`, 'text-red');
                this.#movie.rarExtractionSuccess = false;
                resolve('Extraction error!');
            });

        });

    }

    /**
     * Download poster file for movie
     */
    async downloadPoster() {

        // This is the url used to search for the poster we want
        var searchUrl = new URL(config.api.searchUrl);
        searchUrl.search = new URLSearchParams({
            page: 1, 
            api_key: config.api.key,
            query: this.#movie.tags.title,
            year: this.#movie.tags.year
        });

        // Search for poster in the main thread
        await axios.get(searchUrl.href)
        .then(async (resp) => {

			// No results
			if (resp.data.total_results <= 0) {
                this.log(`${language[config.language].posterNotFound}`, 'text-orange');
                return;
            } 
            
            // Invoke poster download
            await ipcRenderer.invoke('downloadPoster', {
                src: config.api.posterUrl + resp.data.results[0].poster_path,
                dest: path.join(this.#movie.new.absolutePath, config.api.posterFilename)
            }).then((result) => {
                this.log(result, 'text-green');
            }).catch((result) => {
                this.log(result, 'text-red');
            })
            
        })
        .catch(async (err) => {
            this.log(`${language[config.language].posterCouldNotLoadAPI}${err}`, 'text-red');
        });

    }

    /**
     * Delete item (dir or file)
     * @param {PathLike} absolutePath 
     * @param {String} item 
     */
    async deleteItem(absolutePath, item) {
        var itemAbsolutePath = path.join(absolutePath, item);
        await fs.statAsync(itemAbsolutePath)
        .then(async (stat) => {
            if (stat.isFile()) {
                await fs.unlinkAsync(itemAbsolutePath)
                .then(() => {
                    this.log(`${language[config.language].deleteFileSuccess}${item}`, 'text-green');
                })
                .catch((err) => {
                    this.log(`${language[config.language].deleteFileError}${err}`, 'text-red');
                });
            } else {
                await fs.rmdirAsync(itemAbsolutePath, { recursive: true })
                .then(() => {
                    this.log(`${language[config.language].deleteDirectorySuccess}${item}`, 'text-green');
                })
                .catch((err) => {
                    this.log(`${language[config.language].deleteDirectoryError}${err}`, 'text-red');
                });
            }
        })
        .catch(async (err) => {
            this.log(`${language[config.language].fsStatError}${err}`, 'text-red');
        });
    }

    /**
     * Create directory
     * @param {PathLike} absolutePath 
     * @param {String} dirName 
     */
    async makeDirectory(absolutePath, dirName) {
        await fs.mkdirAsync(path.join(absolutePath, dirName), { recursive: true })
        .then(() => {
            this.log(`${language[config.language].createDirectorySuccess}${path.join(this.#movie.new.dirName, dirName)}`, 'text-green');
        })
        .catch((err) => {
            this.log(`${language[config.language].createDirectoryError}${err}`, 'text-red');
        });
    }

    /**
     * Scan for files and store them in property
     * @param {PathLike} absolutePath 
     */
    async scanFiles(absolutePath) {
        await fs.readdirAsync(absolutePath)
        .then((files) => {
            this.#movie.files = files;
        })
        .catch((err) => {
            this.log(`${language[config.language].filesScannedError}${err}`, 'text-red');
        });
    }

    /**
     * Rename an item from `src` to `dest`
     * @TODO: Only log the item renamed, not the whole absolute path
     * @param {PathLike} src 
     * @param {PathLike} dest 
     */
    async rename(src, dest) {
        await fs.renameAsync(src, dest)
        .then(() => {
            this.log(`${language[config.language].itemRenameSuccess}${src} -> ${dest}`, 'text-green');
        })
        .catch((err) => {
            this.log(`${language[config.language].itemRenameError}${err}`, 'text-red');
        });
    }

    /**
     * Simple log system
     * @param {String} message The message
     * @param {String} type The type of message (error or success)
     */
    log(message, type) {
        var log = document.querySelector('#logoutput > .body');
        var p = document.createElement('p');
        var span = document.createElement('span');
        var timestamp = `[${this.getTimestamp()}]`;

        p.classList.add(type, 'line');
        p.innerHTML = message;
        span.classList.add('timestamp');
        span.innerHTML = timestamp;

        p.prepend(span);

        log.appendChild(p);
        document.querySelector('#logoutput > .body > p:last-child').scrollIntoView();
    }

    /**
     * Timestamp
     * Format: HH:MM:SS
     */
    getTimestamp() {

        // Add leading zero to timestamp
        const leadingZero = (num) => `0${num}`.slice(-2);

        // Format the timestamp
        const formatTime = (date) => [
            date.getHours(),
            date.getMinutes(), 
            date.getSeconds()
        ].map(leadingZero).join(':');

        return formatTime(new Date);

    }

}