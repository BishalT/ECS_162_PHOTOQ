var serverPort = 53381;
var localPort = 8000;


var http  = require('http');
var static = require('node-static');
var fs = require('fs');

var queryString = "query?num=";
var imgURLBase = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";

var imgList = [];
loadImageList();

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

function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}

function queryImgHandler(request, response) {
    var url = request.url.replace("/","");
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
