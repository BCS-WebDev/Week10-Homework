
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "tracker_db"
});

connection.connect(function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }
});

async function sendConnection() {
    try {
        return new Promise((resolve, reject)=>{
            const connection = mysql.createConnection({
                host: "localhost",
                port: 3306,
                user: "root",
                password: "!Kc88107",
                database: "tracker_db"
            });

            connection.connect(function(err) {
                if (err) {
                    reject(new Error("error connecting: " + err.stack));
                }
                console.log("Connection ready.")
                resolve(connection);
            });
        });
    } catch (err) {
        if (err) throw err;
    }
}

module.exports = connection;
