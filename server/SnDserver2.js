var serverPort = 53381;
var localPort = 8000;

var http  = require('http');
var static = require('node-static');
var fs = require('fs');
var url = require('url');
var sqlite3 = require('sqlite3');

var queryString = "query";
var imgURLBase = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
var sql = "SELECT * FROM photoTags WHERE rowid IN ";

let dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);


function handler (request, response) {
    if(request.url.indexOf(queryString) >= 0){
        queryImgHandler(request,response);
        //console.log("DYNAM");
    }
    else{
        staticHandler(request,response);
        //console.log("STAT");
    }
}

function queryImgHandler(request, response) {
    var req = url.parse(request.url, true);
    var indicies = '(' + req.query.numList.split(" ").join(",") + ')';

    var responseObject = [];
    var sqlCmd = sql + indicies;

    db.each(sqlCmd, function(err, data){
        if(err) console.err("YA FUCKED UP");
        responseObject.push({
            src: imgURLBase+data.fileName,
            width: data.width,
            height: data.height,
        });
        console.log(responseObject);
    });

    /*
    var queryNum = url.substring(url.indexOf("=") + 1, url.length);
    if(queryNum && queryNum >= 0 && queryNum <= 989){
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(imgURLBase+imgList[queryNum]);
        response.end();
    }
    else{
        response.writeHead(400, {"Content-Type": "text/html"});
        response.write("<p>Bad Request</p>");
        response.end();
    }
    */
}

function staticHandler(request, response){
    var url = request.url.replace("/","");
    //console.log(url);
    request.addListener('end', function() {
      fileServer.serve(request,response, function(error, result) {
        if(error) { // if there is no static file for it to access.
             fileServer.serveFile('not-found2.html', 500, {}, request, response);
        }
      });
  }).resume();
}

var server = http.createServer(handler);
var fileServer = new static.Server('./public');
//server.listen(serverPort);
server.listen(localPort, '127.0.0.1');


//var imgList = [];
//loadImageList();
/*
function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}

function dumpDB() {
  db.all( 'SELECT * FROM photoTags WHERE rowid IN (1, 2)', dataCallback);           // get the specific rows
      function dataCallback( err, data ) {
		console.log(data)
      }
}
*/
