var url = require('url');
var http = require('http');
var imageJson = require('./6whs.json');
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");                      // use file-system library
var sizeOf = require('image-size');             //

let dbFileName = "PhotoQ.db";
// makes the object that represents the database in our code
var db = new sqlite3.Database(dbFileName);

// [idNum INTEGER UNIQUE NOT NULL PRIMARY KEY] [fileName TEXT] [width INTEGER] [height INTEGER] [locTag TEXT] [tags TEXT]

var questionComma = "?,"

let globalCounter = 0;
imageJson.forEach( function(image){   // run through the imageJson files, adds them into table
    loadNames(image.url);
});

function loadNames(image){
    var idNum = globalCounter;
    var fileName = image;

    var options = url.parse(image);
    http.get(options, function (response) {
      var chunks = [];
      response.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function() {
        var buffer = Buffer.concat(chunks);
        console.log(sizeOf(buffer).height);
      });
    });
    /*
    var placeHolder = '('+idNum+questionComma+fileName+questionComma+dimension.width+questionComma+dimension.height+questionComma+questionComma+'?)';
    var sql = 'INSERT INTO photoTags(idNum, fileName, width, height, locTag, tags) VALUES'+placeHolder;

    db.run(sql, function(err) {            // insert shit
       if (err) {
         return console.log(err.message);
       }
       console.log(`A row has been inserted with rowid ${this.lastID}`);
     });
     */
}
 // close the database connection
db.close();


/*
    read imageJson
    For each imageJson, run db.run
*/
