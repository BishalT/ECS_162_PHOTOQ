var APIrequest = require('request');
//var imageJson = require('./6whs.json');

var fs = require("fs");                      // use file-system library
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var imageJson = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
let dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);

var sqlCMD = "UPDATE photoTags SET location = ?, tags = ? WHERE idNum = ?";
var urlBase = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"
// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below
APIrequestObject = {"requests": [
    {
      "image":
      {
        "source":
        {
          "imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"
        }
      },
      "features": [
        { "type": "LABEL_DETECTION" },
        { "type": "LANDMARK_DETECTION"}
      ]
    }
  ]
}

var url = 'https://vision.googleapis.com/v1/images:annotate?key='+APIkey;
var MAX_NUM_TAGS = 6;
var MAX_NUM_PHOTOS = imageJson.length;


// for(var index = 0; index < 30; index++){
//     console.log(imageJson[index]);
//     annotateImage(imageJson[index], index);
// }

annotateImage(imageJson[0], 0);

// function to send off request to the API
function annotateImage(image, index) {
  APIrequestObject.requests[0].image.source.imageUri = urlBase+image;
  APIrequest(
    {
      url: url,
      method: "POST",
      headers: {"content-type": "application/json"},
      json: APIrequestObject
    },
    APIcallback   // the function that handles the call-back
  );

  // callback function, called when data is received from API
  function APIcallback(err, APIresponse, body) {
    if ((err) || (APIresponse.statusCode != 200)) {
      console.log("Got API error");
      console.log(body);
    } else {
      APIresponseJSON = body.responses[0];
      updateDB(APIresponseJSON, index);
      if( index + 1 > MAX_NUM_PHOTOS){
          process.exit(0);
      }
      annotateImage(imageJson[index+1], index+1)
      console.log('\n');
    }
  } // end callback function
} // end annotateImage


function updateDB(APIresponseJSON, index){
    // console.log(APIresponseJSON);
    console.log("UpdateDB index: " + index);
    var tagList = "";
    var locationTag ="";
    if(APIresponseJSON.labelAnnotations) {
        for(var i = 0; i < MAX_NUM_TAGS; i++){
            var tag = APIresponseJSON.labelAnnotations[i].description;

            if(!APIresponseJSON.labelAnnotations[i+1] || i == MAX_NUM_TAGS - 1 ){     // if the next tag doesnt exist, then we can stop
                tagList = tagList + tag;
                break;
            }
            else{                               // still need more tags
                tagList = tagList + tag + ",";  // tagList = "" + "tag1" + ","
            }
        }
    }

    if(APIresponseJSON.landmarkAnnotations){   // if landmark tag exist, then throw it in
        locationTag = APIresponseJSON.landmarkAnnotations[0].description
    }

    db.run(sqlCMD, locationTag, tagList, index);

    function dataCallback( err, data ) {
      console.log(err)
    }
}
