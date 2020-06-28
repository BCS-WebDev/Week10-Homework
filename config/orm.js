
const connection = require("./connection.js");

const orm = {
    selectFrom: async function(column, table) {
        try {
            var queryString = "SELECT ?? FROM ??";
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [column, table], function(err, data) {
                    if (err || !data) {
                        reject(new Error(`No ${table} to choose from.`));  
                    }

                    const choices = data.map(item => item);
                    resolve(choices);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
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
                        reject(new Error(`No Managers to choose from.`));  
                    }

                    const choices = data.map(item => item);
                    choices.push("NULL")
                    resolve(choices);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    viewEmployeeWhere: async function(column, connector, value) {
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
            if (column !== '') { queryString += ` WHERE ?? ${connector} ?`; }
            return new Promise((resolve, reject)=>{
                connection.query(queryString, [column, value], function(err, data) {
                    if (err || !data) {
                        reject(new Error("No such employees to choose from."));  
                    }
                    const tableData = data.map(item => item);
                    resolve(tableData);
                });
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    updateQuery: async function(table, values, idColumn, id) {
        try {
            var queryString = `UPDATE ?? SET ${values} WHERE ?? = ?`;
            await connection.query(queryString, [table, idColumn, id], function(err, data) {
                if (err) {
                    throw new Error(`Rejected.`);  
                }
                console.log(`Updated.`)
            }); 
        } catch (err) {
            if (err) throw err;
        }   
    },
    addQuery: async function(table, properties, values) {
        try {
            var queryString = `INSERT INTO ?? (${properties}) VALUES (${values})`;
            await connection.query(queryString, [table], function(err, data) {
                if (err) {
                    throw new Error(`Rejected.`);  
                }
                console.log(`Added.`)
            }); 
        } catch (err) {
            if (err) throw err;
        }   
    },
    removeQuery: async function(table, column, value) {
        try {
            var queryString = `DELETE FROM ?? WHERE ?? = ?;`;
            await connection.query(queryString, [table, column, value], function(err, data) {
                if (err) {
                    throw new Error(`Rejected.`);  
                }
                console.log(`Deleted.`)
            }); 
        } catch (err) {
            if (err) throw err;
        }   
    },
    endConnection: function() {
        connection.end();
    }
};

module.exports = orm;
