var serverPort = 53491;
var localPort = 8000;

var http  = require('http');
var static = require('node-static');
var fs = require('fs');
var url = require('url');
var sqlite3 = require('sqlite3');

var queryString = "query";
var delString = "delTag"
var imgURLBase = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
var sql = "SELECT * FROM photoTags WHERE ";
var sqlTag = "SELECT * FROM photoTags WHERE idNum IN (";
var sqlUpdate = "UPDATE photoTags SET tags = ? WHERE idNum = ?";

let dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

var imgList = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var numPhotos = imgList.length;


function handler (request, response) {
    if(request.url.indexOf(delString) >= 0){
        deleteTagHandler(request);
    }
    else if(request.url.indexOf(queryString) >= 0){
        queryImgHandler(request,response);
        //console.log("DYNAM");
    }
    else{
        staticHandler(request,response);
        //console.log("STAT");
    }
}

function deleteTagHandler(request){
    var req = url.parse(request.url,true);
    var decoded_req = decodeURI(req.search.replace("?delTag=", "")).split("+");
    var sqlCmd = sqlTag + decoded_req[0] + ')';
    console.log(sqlCmd);
    db.each(sqlCmd,
        function(error, data){
            if(error) console.log(error);
            var split = data.tags.split(",");
            split.splice(split.indexOf(decoded_req[1]), 1);
            var join = split.join(",");
            db.run(sqlUpdate, join, decoded_req[0]);
        })
}

function queryImgHandler(request, response) {
    var req = url.parse(request.url, true);
    var decoded_req = decodeURI(req.search.replace("?keyList=", "")).split("+");
    if(!req.query.keyList) return badQuery(response, "Missing Parameter: keyList"); // if its just "query?..." then it returns, failure.
    // if(!(checkNum(req.query.keyList))) return badQuery(response, "Numbers not in range.");  // if the nums arent in range
    var tagString = accumlateTags(decoded_req);

    var responseObject = [];
    var sqlCmd = sql + tagString;
    console.log(sqlCmd);

    db.each(sqlCmd,                     // For every valid row that you want
        function(err, data){            // 1st callback which adds information to the responseObject
            if(err) console.err("YA SCREWED UP");
            responseObject.push({
                src: imgURLBase+data.fileName,
                idNum: data.idNum,
                width: data.width,
                height: data.height,
                landmark: data.location,
                tags: data.tags.split(","),
                message: "These are all of the photos satisfying this query."
            });
        },
        function(err){           // 2nd call back which writes the responseObject as a JSON
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(JSON.stringify(responseObject));
            response.end();
        });


}
// db.each("SELECT * FROM photoTags WHERE (location ='sky' OR tags LIKE '%sky%') AND (location ='water' OR tags LIKE '%water%')",
//     function(err, data){
//         console.log(err);
//         console.log(data);
//     });

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

function accumlateTags(tagList){
    var tagString = "(location='"+tagList[0]+ "' OR tags LIKE '%"+tagList[0]+"%')";
    for(var i = 1; i < tagList.length; i++){
      tagString = tagString + " AND (location='"+tagList[i]+"' OR tags LIKE '%"+tagList[i]+"%' )";
    }
    return tagString;
}



var server = http.createServer(handler);
var fileServer = new static.Server('./public');
//server.listen(serverPort);
server.listen(localPort, '127.0.0.1');
