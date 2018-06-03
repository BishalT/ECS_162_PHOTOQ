// Globals
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");

var dbFileName = "PhotoQ.db";

// If the file exists, then delete it before you run anything.
// This saves time of acutally deleting the file
if(fs.existsSync(dbFileName)){
    fs.unlink(dbFileName, (err) => {
        if (err) throw err;
        console.log('Deleted PhotoQ.db');
    })
}

// makes the object that represents the database in our code
var db = new sqlite3.Database(dbFileName);

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming PhotoQ.db
var cmdStr = "CREATE TABLE photoTags ( idNum INTEGER UNIQUE NOT NULL PRIMARY KEY, fileName TEXT, width INTEGER, height INTEGER, landmark TEXT, tags TEXT)"
db.run(cmdStr,tableCreationCallback);

// Always use the callback for database operations and print out any
// error messages you get.
function tableCreationCallback(err) {
    if (err) {
	       console.log("Table creation error",err);
    } else {
	       console.log("Database created");
	db.close();
    }
}
