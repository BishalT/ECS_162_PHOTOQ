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

imageJson.forEach( function(image){   // run through the imageJson files, adds them into table
    getSize(globalCounter, image.url, sizeCb);
});

function getSize(ind, name, cbFun) {
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
	    cbFun(ind, name, dimensions.width, dimensions.height);
    });
   });
}

function sizeCb(ind, name, width, height){
    var values = [globalCounter,name,width,height,'',''];
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
    //console.log("dbCB:"+globalCounter);
    if(globalCounter == numPhotos){
        dumpDB();
        db.close();
    }
}

function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
      function dataCallback( err, data ) {
		console.log(data)
      }
}
