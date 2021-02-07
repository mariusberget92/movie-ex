**Screenshot**

![Screenshot](https://i.imgur.com/NOFyITZ.png)



**Usage**

Go over to releases and download the  7zip archive containing the executable.<br>
Or clone the repo and run: `npm install && npm run dev && npm run start`



**Description**

Drag and drop movie organizer from scene-release standard naming standards.<br>
Folders named like this: `( REQ )Some Movie (VHS Rip)` will **not** work as this is not a scene-release standard.



**Usage**

Example folder: `Citizenfour.2014.1080p.BluRay.DTS.x264-HDMaNiAcS`<br>
Tags are extracted and used to rename the movie folder and file following this standard: `Citizenfour (2014)/Citizenfour [BluRay-1080p].ext`<br>
The application supports both **folder** and **file** drops, as long as the name of the item dropped is a **scene-release** standard.



**Deletions**

Extensions: `.sfv`, `.nfo`, `.jpg`, `.png`, `.bmp`, `.gif`, `.cc`, `.to`, `.txt`, `.text`<br>
Folder or files: `proof`, `sample`, `screenshots`<br>
RAR archices will be deleted after a **successfull** unpacking.



**Features**

Toggleable: Downloads a poster file (`poster.jpg`) for the movie (using tMBD API)<br>
Toggleable: Unpacks RAR archives automatically<br>
Toggleable: Store a `.nfo` file with media-info and original release name<br>
Non-toggleable: `.srt`, `.sub`, `.idx`, `.ssa`, `.ass` files will be moved to a `/subs`folder in the movie folder<br>
Non toggleable: Movie folders will be renamed (please read **usage**)



**Important**

Only tested on **Windows 10 x64**. The application is delivered as is. If there is any issues, please report them so I may fix them later.<br>
**Only** movies are supported, not TV-Shows, games or music.

