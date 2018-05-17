var oReq = new XMLHttpRequest();

// Called when the user pushes the "submit" button
function photoByNumber() {
	var num = document.getElementById("num").value;
	num = num.trim();
	var photoNum = Number(num);
	if (photoNum != NaN) {
		/*
		var photoURL = photoURLArray[photoNum].url;
		var display = document.getElementById("photoImg");
		display.src = photoURL;
		*/
		var url = "query?num="+num;
		oReq.open("GET", url);  // setup callback
		oReq.addEventListener("load", reqListener);    // load event occurs when response comes back
		oReq.send();
  }
}

function reqListener () {
	 var photoURL = this.responseText;
	 //var display = document.getElementById("photoImg");
	 var display = document.getElementById("photoDisplay");
	 var picture = document.createElement("img");
	 picture.src = photoURL;
	 display.appendChild(picture);
	 //display.src = photoURL;
 }
