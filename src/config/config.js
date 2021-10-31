/**
 * Configuration object
 * api: { } Dont touch this object
 * delete: { } Basically what we want to delete (directories, files with extensions or containing words)
 * movieExtensions: [] What files we are looking for as movie files
 * subExtensions: [] What subtitle extensions we are moving to /subs
 * subPath: Relative path from the movie folder to the subs folder
 */
export default {
    "language": "en",
    "api": {
        "key": "5b9f43c33fe73da8f21b58d9b45c5c70",
        "searchUrl": "https://api.themoviedb.org/3/search/movie",
        "posterUrl": "https://image.tmdb.org/t/p/w780",
        "posterFilename": "poster.jpg",
    },
    "delete": {
        "extensions": [".sfv", ".nfo", ".jpg", ".png", ".bmp", ".gif", ".cc", ".to", ".txt", ".text"],
        "directories": ["proof", "sample", "screenshots", "posting info", "screens", ]
    },
    "movieExtensions": [".avi", ".mkv", ".mp4"],
    "subExtensions": [".srt", ".sub", ".idx", ".ssa", ".ass"],
    "subPath": "/subs"
}