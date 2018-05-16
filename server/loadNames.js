var url = require('url');
var http = require('http');
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");                      // use file-system library
//var imageJson = require('./6whs.json');
var imageJson = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var sizeOf = require('image-size');           //


http.globalAgent.maxSockets = 1;

let dbFileName = "PhotoQ.db";
var imgServerURL = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/'
var sql = 'INSERT INTO photoTags(idNum, fileName, width, height, locTag, tags) VALUES(?,?,?,?,?,?)';
// makes the object that represents the database in our code
var db = new sqlite3.Database(dbFileName);

// [idNum INTEGER UNIQUE NOT NULL PRIMARY KEY] [fileName TEXT] [width INTEGER] [height INTEGER] [locTag TEXT] [tags TEXT]

let globalCounter = 0;


for(var index = 0; index < imageJson.length; index++){
    //console.log(imageJson[index]);
    getSize(index, imageJson[index], sizeCB);
}

function getSize(ind, name, cbFun) {
    //console.log("getSize (Id):"+ind);
     var imgURL = imgServerURL + name;  // This is for the later shit.
     var options = url.parse(imgURL);

    //var options = url.parse(name);    // This is for the time-being development

    http.get(options, function (response) {
    	var chunks = [];
    	response.on('data', function (chunk) {
    	    chunks.push(chunk);
    	}).on('end', function() {
            console.log("getSize(ID)"+ ind);
    	    var buffer = Buffer.concat(chunks);
    	    dimensions = sizeOf(buffer);
            if(dimensions) cbFun(ind, name, dimensions.width, dimensions.height);
        });
    }).on('error', function(err) {
       // handle errors with the request itself
       console.log(imgURL);
       console.log(options);
       console.error('Error with the request:', err.message);
       //console.error('Error with the request:', err);
   });
}

function sizeCB(ind, name, width, height){
    var values = [ind,name,width,height,'',''];
    console.log("sizeCB (Id):"+ind);
    db.run(sql, values, function(err) {            // insert shit
       if (err) {
         return console.log(err.message);
       }
       console.log(`A row has been inserted with rowid ${this.lastID}`);
       dbCB();
     });
}

function dbCB(){
    globalCounter++;
    console.log("dbCB (GLOBAL):"+globalCounter);
    if(globalCounter == imageJson.length){
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
