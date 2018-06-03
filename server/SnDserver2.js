var serverPort = 53491;
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

var imgList = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var numPhotos = imgList.length;


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

    if(!req.query.numList) return badQuery(response, "Missing Parameter: numList"); // if its just "query?..." then it returns, failure.
    if(!(checkNum(req.query.numList))) return badQuery(response, "Numbers not in range.");  // if the nums arent in range

    var indicies = '(' + req.query.numList.split(" ").join(",") + ')';

    var responseObject = [];
    var sqlCmd = sql + indicies;

    db.each(sqlCmd,                     // For every valid row that you want
        function(err, data){            // 1st callback which adds information to the responseObject
            if(err) console.err("YA FUCKED UP");
            responseObject.push({
                src: imgURLBase+data.fileName,
                width: data.width,
                height: data.height,
            });
        },
        function(err){           // 2nd call back which writes the responseObject as a JSON
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(JSON.stringify(responseObject));
            response.end();
        });
}

function staticHandler(request, response){
    var url = request.url.replace("/","");
    request.addListener('end', function() {
      fileServer.serve(request,response, function(error, result) {
        if(error) { // if there is no static file for it to access.
             fileServer.serveFile('not-found2.html', 500, {}, request, response);
        }
      });
  }).resume();
}

function badQuery(response, badString){
    response.writeHead(400, {"Content-Type": "text/html"});
    response.write("<p>"+badString+"</p>");
    response.end();
}

function checkNum(element){
    var false_count = 0;
    for(var i = 0; i < element.length; i++){
        if (element[i] < 0 || element[i] > numPhotos) false_count++;
    }
    return (false_count == 0);
}


var server = http.createServer(handler);
var fileServer = new static.Server('./public');
//server.listen(serverPort);
server.listen(localPort, '127.0.0.1');
