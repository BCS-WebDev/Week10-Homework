
const mysql = require("mysql");  // load mysql module

// establish connection to database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "tracker_db"
});

// connect to databse
connection.connect(function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }
});

// export connection
module.exports = connection;
