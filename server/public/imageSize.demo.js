var url = require('url');
var http = require('http');
var sizeOf = require('image-size');
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");

var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

// prevent denial-of-service attacks against the TA's lab machine!
http.globalAgent.maxSockets = 1;

function getImageDims( index, name, callback ) {
    var imgUrl = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/' + name;
    var options = url.parse(imgUrl);

    http.get(options, function (response) {
        var chunks = [];
        var byteLen = 0;

        response.on('data', function (chunk) {
            chunks.push(chunk);
            byteLen += chunk.length;
            console.log("        item ", index, " read", byteLen, "bytes from remote host.")

            var ready = false;
            var dims = null;

            /* Try to parse a partial download; 
                           if this works, we don't need the rest of the file! */
            try {
                var buffer = Buffer.concat(chunks);
                if (dims = sizeOf(buffer)) ready = true;
            } catch(err) {
                /* We're counting on sizeOf to throw an exception if it doesn't
                          have enough information to determine image dimensions. */
                console.log("        item ", index, " can't determine image bounds... waiting for more data!");
            }

            if (ready) {
                response.destroy();
                console.log("        item ", index, " dimensions:", dims);
                callback(index, name, dims);
            }
        });
    });
}

var imglist = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var cmdStr = 'INSERT INTO photoTags VALUES ( _IDX, "_FILENAME", _WIDTH, _HEIGHT )';
var cbCount = 0;
var cbGoal = imglist.length;

// Always use the callback for database operations and print out any error messages you get.
function insertDataCallback(err) {
    if (err) {
        console.log("Error while saving data in DB: ",err);
    }

    cbCount += 1;
    if (cbCount == cbGoal) db.close()
}

function saveImageDims( index, name, dims ) {
    var cmd = cmdStr.replace("_IDX", index)
    cmd = cmd.replace("_FILENAME", name)
    cmd = cmd.replace("_WIDTH", dims.width)
    cmd = cmd.replace("_HEIGHT", dims.height)

    console.log("        item ", index, " complete!");

    db.run(cmd,insertDataCallback);
}

for (var i = 0; i < imglist.length; i++) {
    console.log("Enqueuing item ", i, "   ", imglist[i]);
    /* encodeURIComponent escapes characters that are in the filename but invalid in a URL */
    getImageDims( i, encodeURIComponent(imglist[i]), saveImageDims );
}

console.log("End of script file...");
