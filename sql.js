
const mysql = require("mysql");

class SQL {
    constructor(hostname = "localhost", portId = 3306, username = "root", userpw) { 
        
        this.host = hostname,  // hostname - default localhost
        this.port = portId,  // port - default 3306
        this.user =  username,  // username - default root
        this.password = userpw,  // password
        this.database = "tracker_db"  // database - tracker_db
     
    }

    connect() {
        return mysql.createConnection({
            host: this.host,  // hostname - default localhost
            port: this.port,  // port - default 3306
            user: this.user,  // username - default root
            password: this.userpw,  // password
            database: this.databse  // database - tracker_db
        });
    }

    end() {
        this.connection.end();
    }
    
    viewQuery(targetsClause, table, whereClause) {
        var targetTable;
        var targets;
        if (targetTable === "Employees") {
            targets = `employee.id AS ID, 
                    employee.first_name AS FirstName, 
                    employee.last_name AS LastName,
                    role.title AS Title,
                    department.department AS Department,
                    role.salary AS Salary,
                    CONCAT(manager.first_name, " ", manager.last_name) AS Manager`;
            targetTable = "Employees employee";
        } else {
            targets = targetsClause;
            targetTable = table
        }

        var query = `SELECT ${targets} FROM ${targetTable}`;
        if (whereClause !== "NULL") {
            query += ` WHERE ${whereClause}`;
        }
        console.log(query);

        const connection = this.connect();
        connection.connect(function(err) {
            if (err) throw err;
   
            connection.query(query, function(err, res) {
                if (err) throw err;

                connection.end();
                return res;
            });
        });      
    }

    addQuery(table, valuesClause) {
        var properties = "";
        switch (table) {
            case "Departments":
                properties += "(department)"
                break;   
            case "Roles":
                properties += "(title, salary, department_id)"
                break;
            case "Employees":
                properties += "(first_name, last_name, role_id, manager_id)"
                break;
            default:
                break;
        }

        const connection = this.connect();
        connection.connect(function(err) {
            if (err) throw err;
   
            connection.query(`INSERT INTO ${table} ${properties} VALUES (${valuesClause})`, function(err) {
                if (err) throw err;

                connection.end();
            });
        });  
    }

    updateQuery(table, setClause, whereClause) {
        const connection = this.connect();
        connection.connect(function(err) {
            if (err) throw err;
   
            connection.query(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`, function(err) {
                if (err) throw err;

                connection.end();
            });
        });  
    }

    removeQuery(table, whereClause, updateId) {
        switch (table) {
            case "Departments":
                query += ` UPDATE Roles SET department_id = NULL WHERE department_id = ${updateId}`;
                break;   
            case "Roles":
                query += ` UPDATE Employees SET role_id = NULL WHERE role_id = ${updateId}`;
                break;
            case "Employees":
                query += ` UPDATE Employees SET manager_id = -1 WHERE manager_id = ${updateId}`;        
                break;
            default:
                break;
        }

        var query = `DELETE FROM ${table} WHERE ${whereClause};`;

        const connection = this.connect();
        connection.connect(function(err) {
            if (err) throw err;
   
            connection.query(query, function(err) {
                if (err) throw err;

                connection.end();
            });
        });  
    }
}

module.exports = SQL;   // export MySQL class