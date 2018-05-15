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

let numPhotos = 6;
let globalCounter = 0;

for(var index = 0; index < numPhotos; index++){
    getSize(index, imageJson[index].url, sizeCb);
}
/*
imageJson.forEach( function(image){   // run through the imageJson files, adds them into table
    getSize(globalCounter, image.url, sizeCb);
});
*/
function getSize(ind, name, cbFun) {
    console.log("getSize (Id):"+ind);
    // var imgURL = imgServerURL+name;  // This is for the later shit.
    // var options = url.parse(imgURL);
    var options = url.parse(name);    // This is for the time-being development

    http.get(options, function (response) {
	var chunks = [];
	response.on('data', function (chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var buffer = Buffer.concat(chunks);
	    dimensions = sizeOf(buffer);
	    cbFun(ind, name, dimensions.width, dimensions.height, dbCb);
    });
   });
}

function sizeCb(ind, name, width, height, dbCb){
    var values = [ind,name,width,height,'',''];0
    console.log("sizeCB (Id):"+ind);
    var sql = 'INSERT INTO photoTags(idNum, fileName, width, height, locTag, tags) VALUES(?,?,?,?,?,?)';
    db.run(sql, values, function(err) {            // insert shit
       if (err) {
         return console.log(err.message);
       }
       console.log(`A row has been inserted with rowid ${this.lastID}`);
       dbCb();
     });
}

function dbCb(){
    globalCounter++;
    console.log("dbCB (GLOBAL):"+globalCounter);
    if(globalCounter == numPhotos){
        dumpDB();
        db.close();
    }
}

function dumpDB() {
  db.all( 'SELECT * FROM photoTags WHERE rowid IN (1, 2)', dataCallback);           // get the specific rows
      function dataCallback( err, data ) {
		console.log(data)
      }
}
