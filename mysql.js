
const mysql = require("mysql");

class MySQL {
    constructor(hostname = "localhost", portId = 3306, username = "root", userpw) {
        const connection = mysql.createConnection({
            host: hostname,  // hostname - default localhost
            port: portId,  // port - default 3306
            user: username,  // username - default root
            password: userpw,  // password
            database: "tracker_DB"  // database
        });

        this.connection = connection;
        this.start();
    }

    start() {
        this.connection.connect(function(err) {
            if (err) throw err;
        });
    }
    
    viewQuery(targetsArray, table, whereClause) {
        var targets = ``;
        for (const item of targetsArray) {
            targets += `${item},`;
        }
        targets.slice(0, -1);  // remove last comma

        var query = `SELECT ${targets} FROM ${table}`;
        if (whereClause !== NULL) {
            query += ` WHERE ${whereClause}`;
        }

        this.connection.query(query, function(err, res) {
            if (err) throw err;
            return res;
        });
    }

    addQuery(table, valuesArray) {
        var properties = "";
        var values = ``;
        switch (table) {
            case "Departments":
                properties += "(department_name)"
                values += `(${valuesArray[0]})`;
                break;   
            case "Roles":
                properties += "(title, salary, department_id)"
                values += `(${valuesArray[0]}, ${valuesArray[1]}, ${valuesArray[2]})`;
                break;
            case "Employees":
                properties += "(first_name, last_name, role_id, manager_id)"
                values += `(${valuesArray[0]}, ${valuesArray[1]}, ${valuesArray[2]}, ${valuesArray[3]})`;
                break;
            default:
                break;
        }

        this.connection.query(`INSERT INTO ${table} ${properties} VALUES ${values}`, function(err) {
            if (err) throw err;
        });
    }

    updateQuery(table, valuesArray, whereClause) {
        var values = ``;
        var where = ``;
        switch (table) {
            case "Departments":
                values += `department_name = ${valuesArray[0]}`;
                where += `id = ${whereClause[0]}, department_name = ${whereClause[1]}`;
                break;   
            case "Roles":
                values += `title = ${valuesArray[0]}, salary = ${valuesArray[1]}, department_id = ${valuesArray[2]})`;
                where += `id = ${whereClause[0]}, title = ${whereClause[1]}, salary = ${whereClause[2]}, department_id = ${whereClause[3]})`;
                break;
            case "Employees":
                values += `first_name = ${valuesArray[0]}, last_name = ${valuesArray[1]},
                            role_id = ${valuesArray[2]}, manager_id = ${valuesArray[3]}`;
                where += `id = ${whereClause[0]}, first_name = ${whereClause[1]}, last_name = ${whereClause[2]},
                            role_id = ${whereClause[3]}, manager_id = ${whereClause[4]}`;            
                break;
            default:
                break;
        }

        for (const item of valuesArray) {
            values += `${item},`;
        }
        values.slice(0, -1);  // remove last comma

        this.connection.query(`UPDATE ${table} SET ${values} WHERE ${where}`, function(err) {
            if (err) throw err;
        });
    }

    removeQuery(table, whereClause) {
        var where;
        switch (table) {
            case "Departments":
                where += `id = ${whereClause[0]}, department_name = ${whereClause[1]}`;
                query += ` UPDATE Roles SET department_id = NULL WHERE department_id = ${whereClause[0]}`;
                break;   
            case "Roles":
                where += `id = ${whereClause[0]}, title = ${whereClause[1]},
                            salary = ${whereClause[2]}, department_id = ${whereClause[3]})`;
                query += ` UPDATE Employees SET role_id = NULL WHERE role_id = ${whereClause[0]}`;
                break;
            case "Employees":
                where += `id = ${whereClause[0]}, first_name = ${whereClause[1]}, last_name = ${whereClause[2]},
                            role_id = ${whereClause[3]}, manager_id = ${whereClause[4]}`;
                query += ` UPDATE Employees SET manager_id = -1 WHERE manager_id = ${whereClause[0]}`;        
                break;
            default:
                break;
        }

        var query = `DELETE FROM ${table} WHERE ${where};`;
        this.connection.query(query, function(err) {
            if (err) throw err;
        });
    }
}

module.exports = MySQL;   // export MySQL class