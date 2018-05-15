var APIkey = "AIzaSyB9raQ8TQ_j2seve_HcSZLZM4PJ9zbcDsk";
var APIrequest = require('request');
var imageJson = require('./6whs.json');

// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below
APIrequestObject = {
"requests": [
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

url = 'https://vision.googleapis.com/v1/images:annotate?key='+APIkey;

imageJson.forEach( function(image){   // run through the imageJson files, annotate them
  annotateImage(image);
});

// function to send off request to the API
function annotateImage(image) {
  APIrequestObject.requests[0].image.source.imageUri = image.url;
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
      console.log(APIresponseJSON);
      if(APIresponseJSON.landmarkAnnotations){   // sometimes Undefined
        console.log(APIresponseJSON.landmarkAnnotations[0].locations);
      }
      console.log('\n');
    }
  } // end callback function
} // end annotateImage
