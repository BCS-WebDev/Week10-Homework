
const connection = require("./connection.js");  // load sql database connection

// orm for sql queries - promisified for better flow
const orm = {
    // select from
    selectFrom: async function(column, table) {
        try {
            var queryString = "SELECT ?? FROM ??";
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [column, table], function(err, data) {
                    if (err) {
                        reject(new Error(console.log(`No ${table} to choose from.`)));  
                    }
                    resolve(data);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    // get managers
    getManagers: async function() {
        try {
            var queryString = `SELECT employee.id AS ID,
                                    role.title AS Title,
                                    CONCAT(employee.first_name, " ", employee.last_name) AS Name
                                FROM Employees employee
                                    LEFT JOIN Roles role ON employee.role_id = role.id
                                WHERE Title = "Manager"`;
            return new Promise((resolve, reject)=>{
                connection.query(queryString, function(err, data) {
                    if (err) {
                        reject(new Error(console.log(`No Managers to choose from.`)));  
                    }
                    resolve(data);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    // get employees where
    getEmployeeWhere: async function(column, connector, value) {
        try {
            var queryString = `SELECT employee.id AS ID, 
                                    employee.first_name AS FirstName, 
                                    employee.last_name AS LastName,
                                    role.title AS Title,
                                    department.department AS Department,
                                    role.salary AS Salary,
                                    CONCAT(manager.first_name, " ", manager.last_name) AS Manager
                                FROM Employees employee
                                LEFT JOIN Employees manager
                                    ON employee.manager_id = manager.id
                                LEFT JOIN Roles role
                                    ON employee.role_id = role.id
                                LEFT JOIN Departments department
                                    ON role.department_id = department.id`;
            if (column !== '') { queryString += ` WHERE ${column} ${connector} "${value}"`; }
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [column, value], function(err, data) {
                    if (err) {
                        reject(new Error(console.log("No such employees to choose from.")));  
                    }
                    resolve(data);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    // update 
    updateQuery: async function(table, values, idColumn, id) {
        try {
            var queryString = `UPDATE ${table} SET ${values} WHERE ${idColumn} = ${id}`;
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [table, idColumn, id], function(err, data) {
                    if (err) {
                        reject(new Error(console.log(`Rejected.`)));  
                    }
                    resolve(console.log(`Updated.`));
                });
            }); 
        } catch (err) {
            if (err) throw err;
        }   
    },
    // add
    addQuery: async function(table, properties, values) {
        try {
            var queryString = `INSERT INTO ${table} (${properties}) VALUES (${values})`;
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [table], function(err, data) {
                    if (err) {
                        reject(new Error(console.log(`Rejected.`)));  
                    }
                    resolve(console.log(`Added.`));
                }); 
            });
        } catch (err) {
            if (err) throw err;
        }   
    },
    // remove
    removeQuery: async function(table, column, value) {
        try {
            var queryString = `DELETE FROM ?? WHERE ?? = ?;`;
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [table, column, value], function(err, data) {
                    if (err) {
                        reject(new Error(console.log(`Rejected.`)));  
                    }
                    resolve(console.log(`Deleted.`));
                }); 
            });
        } catch (err) {
            if (err) throw err;
        }   
    },
    // end connection
    endConnection: function() {
        connection.end();
    }
};

module.exports = orm;
