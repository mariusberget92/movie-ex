**Description**<br>
Drag and drop movie organizer from scene-release standard naming convention.<br>
Folders named like this: `( REQ )Some Movie (VHS Rip)` will **NOT** work as this is not a scene-release standard.

**Usage**<br>
Example folder: `Citizenfour.2014.1080p.BluRay.DTS.x264-HDMaNiAcS`<br>
[Scenex](//github.com/kaizokupuffball/scenex) extract tags from the folder name.<br>
Tags are used to rename the movie folder and file following this standard: `Citizenfour (2014)/Citizenfour [BluRay-1080p].ext`<br>

**Deletions**<br>
All files with these extensions will be deleted automatically: `['.sfv', '.nfo', '.jpg', '.png', '.bmp', '.gif', '.cc', '.to', '.txt', '.text']`<br>
All folders the corresponds to theese will also be deleted: `['proof', 'sample', 'screenshots']`

**Organizing**<br>
The app automatically downloads a poster file called `poster.jpg` into the movie folder using tMDB API.
Archive extraction is also supported (in this case `.rar` archives).
All subtitle files thats in the folder will be moved to `/subs` inside the movie folder.

**Important!**<br>
Do no try to drag `system32` or whatever into the droparea, as I will not be responsible for any renaming if you don't use the app as intended.