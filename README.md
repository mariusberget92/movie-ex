**Screenshot**
![Screenshot](https://i.imgur.com/yXITBK7.png)

**Install / Usage**
Currently no packaged binaries for this. To use make sure you have NPM installed.<br>
Then run: `npm run install && npm run dev` when using for the first time, and `npm run start` to start the application afterwards. *Note* The application is not tested on other than W10! 

**Description**<br>
Drag and drop movie organizer from scene-release standard naming convention.<br>
Folders named like this: `( REQ )Some Movie (VHS Rip)` will **NOT** work as this is not a scene-release standard.

**Usage**<br>
Example folder: `Citizenfour.2014.1080p.BluRay.DTS.x264-HDMaNiAcS`<br>
[Scenex](//github.com/kaizokupuffball/scenex) extract tags from the folder name.<br>
Tags are used to rename the movie folder and file following this standard: `Citizenfour (2014)/Citizenfour [BluRay-1080p].ext`<br>
Single files instead of folders are also supported as long as the file is named by the same standards.

**Deletions**<br>
All files with these extensions will be deleted automatically: `.sfv .nfo .jpg .png .bmp .gif .cc .to .txt .text`<br>
All folders the corresponds to theese will also be deleted: `proof sample screenshots`<br>
All `.rar` files will be deleted after extraction

**Organizing**<br>
The app automatically downloads a poster file called `poster.jpg` into the movie folder using tMDB API.
Archive extraction is also supported (in this case `.rar` archives).
All subtitle files thats in the folder will be moved to `/subs` inside the movie folder.

**Important!**<br>
Do no try to drag `system32` or whatever into the droparea, as I will not be responsible for any renaming if you don't use the app as intended.
