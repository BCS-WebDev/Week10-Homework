
const inquirer = require("inquirer");
const cTable = require('console.table');
const mysql = require("./mysql.js");

const sql = new mysql("localhost", 3306, "root", "userpw");

const baseQuestions = [ 
    {   // action
        type: "list",
        message: "What would you like to do:",
        name: "action",
        choices: ["View", "Add", "Update", "Delete"]
    },
    {   // target
        type: "list",
        message: "Select your target:",
        name: "target",
        choices: ["Departments", "Roles", "Employees"]
    }
];

var departments = [];
const departmentBase = [
    {   // department name
        type: "input",
        message: "Enter the department name:",
        name: "departmentName"
    }
];

var roles = [];
const roleBase = [
    {   // role title
        type: "input",
        message: "Enter the role's title:",
        name: "roleTitle"
    },
    {   // role salary
        type: "input",
        message: "Enter the role's salary:",
        name: "roleSalary"
    },
    {   // department id
        type: "list",
        message: "Select the role's department:",
        name: "departmentId",
        choices: departments   // check if valid
    }
];

var employees = [];
const employeeBase = [
    {   // first name
        type: "input",
        message: "Enter the employee's first name:",
        name: "firstName"
    },
    {   // last name
        type: "input",
        message: "Enter the employee's last name:",
        name: "lastName"
    },
    {   // role 
        type: "list",
        message: "Select the employee's manager:",
        name: "roleId",
        choices: roles   // check if valid
    },
    {   // target
        type: "list",
        message: "Select the employee's manager:",
        name: "managerId",
        choices: managers   // TODO - check if array of objects are valid in list prompt
    }
];

const employeeSearch = [
    {   // category 
        type: "list",
        message: "Search employee by:",
        name: "category",
        choices: ["id", "first_name", "last_name", "role_id", "manager_id", "All"]   // check if valid
    },
    {   // query
        type: "input",
        message: "Enter your search query:",
        name: "query"
    }
];

var targets = [];
const updateBase = [
    {   // target
        type: "list",
        message: "Select the update target:",
        name: "updateTarget",
        choices: targets   // TODO - check if array of objects are valid in list prompt
    }
];

var removes = [];
const removeBase = [
    {   // target
        type: "list",
        message: "Select the target to remove:",
        name: "removeTarget",
        choices: targets   // TODO - check if array of objects are valid in list prompt
    }
];

async function base() {
    try {
        const { action, target } = await inquirer.prompt(baseQuestions);

        switch (action) {
            case "View":
                await view(target);
                break;
            case "Add":
                await addOrUpdate(target, true);
                break;   
            case "Update":
                await addOrUpdate(target, false);
                break;
            case "Delete":
                await remove(target);
                break;
            default:
                break;
        }

        await base();

    } catch(err) {
        console.log(err);  // throw error if error

        await base();
    }
}

async function view(target) {
    try {
        var where;
        if (target === "Employee") {
            const { category, query } = await inquirer.prompt(employeeSearch);
            if (category === "All") {
                where = NULL;
            } else {
                where = `${category} CONTAINS ${query}`;
            }
        } else {
            where = NULL;
        }

        const response = await sql.viewQuery(["*"], target, where);
        if (!response) {
            throw new Error("No data to show.");
        }

        const table = cTable.getTable(response);
        console.log(table);
    } catch(err) {
        console.log(err);  // throw error if error
    }
}

async function addOrUpdate(target, add) {
    try {
        var valuesArray;
        var updateTargetQuery;

        switch (target) {
            case "Departments":
                if (add === false) {
                    departments = await sql.viewQuery(["*"], "Departments", NULL);
                    if (!departments) {
                        throw new Error("No departments to update");
                    }

                    const { updateTarget } = await inquirer.prompt(updateBase);
                    updateTargetQuery = [updateTarget.id, updateTarget.department_name];
                }

                const { departmentName } = await inquirer.prompt(departmentBase); // check that properties are valid
                valuesArray = [departmentName];

                break;   
            case "Roles":
                if (add === false) {
                    roles = await sql.viewQuery(["*"], "Roles", NULL);
                    if (!roles) {
                        throw new Error("No roles to update");
                    }

                    const { updateTarget } = await inquirer.prompt(updateBase);
                    updateTargetQuery = [updateTarget.id, updateTarget.title, updateTarget.salary, updateTarget.department_id];
                }

                departments = await sql.viewQuery(["*"], "Departments", NULL);
                departments.push(NULL)

                const { roleTitle, roleSalary, departmentId } = await inquirer.prompt(roleBase); // check that properties are valid
                valuesArray = [roleTitle, roleSalary, departmentId.id];

                break;
            case "Employees":
                if (add === false) {
                    const { category, query } = await inquirer.prompt(employeeSearch);
                    var where;
                    if (category === "All") {
                        where = NULL;
                    } else {
                        where = `${category} CONTAINS ${query}`;
                    }
                   
                    employees = await sql.viewQuery(["*"], "Employees", where);
                    if (!employees) {
                        throw new Error("No such employees found.");
                    }

                    const { updateTarget } = await inquirer.prompt(updateBase);
                    updateTargetQuery = [updateTarget.id, updateTarget.first_name, updateTarget.last_name,
                                            updateTarget.role_id, updateTarget.manager_id];
                }
            
                roles = await sql.viewQuery(["id", "title"], "Roles");   // check that properties are valid
                roles.push(NULL);

                const managerRoleId = await sql.viewQuery(["id"], "Roles", `roleTitle = Manager`);
                if (managerRoleId) {
                    employees = await sql.viewQuery(["id, firstName, lastName"], "Employees", `roleId = ${managerRoleId[0].id}`);
                }
                employees.push(NULL);

                const { firstName, lastName, roleId, ManagerId } = await inquirer.prompt(employeeBase); // check that properties are valid
                valuesArray = [firstName, lastName, roleId.id, ManagerId.id];

                break;
            default:
                break;
        }

        if (add === true) {
            await sql.addQuery(target, valuesArray);
            console.log(`${target} added.`);
        } else {
            await sql.updateQuery(target, valuesArray, updateTargetQuery);
            console.log(`Target updated.`);
        }
        
    } catch(err) {
        console.log(err);  // throw error if error
    }
}

async function remove(target) {
    try {
        var where;
        switch (target) {
            case "Departments":
                removes = await sql.viewQuery(["*"], "Departments", NULL);
                if (!removes) {
                    throw new Error("No departments to remove.")
                }

                const { removeTarget } = await inquirer.prompt(removeBase); // check that properties are valid
                where = [removeTarget.id, removeTarget.department_name];

                break;   
            case "Roles":
                removes = await sql.viewQuery(["*"], "Roles", NULL);
                if (!removes) {
                    throw new Error("No roles to remove.")
                }

                const { removeTarget } = await inquirer.prompt(removeBase); // check that properties are valid
                where = [removeTarget.id, removeTarget.title, removeTarget.salary, removeTarget.department_id];

                break;
            case "Employees":
                const { category, query } = await inquirer.prompt(employeeSearch);
                var where;
                if (category === "All") {
                    where = NULL;
                } else {
                    where = `${category} CONTAINS ${query}`;
                }

                removes = await sql.viewQuery(["*"], "Employees", where);
                if (!removes) {
                    throw new Error("No roles to remove.")
                }

                const { removeTarget } = await inquirer.prompt(removeBase); // check that properties are valid
                where = [removeTarget.id, removeTarget.first_name, removeTarget.last_name,
                            removeTarget.role_id, removeTarget.manager_id];

                break;
            default:
                break;
        }

        await sql.removeQuery(target, where);
        console.log("Target removed.");

    } catch(err) {
        console.log(err);
    }
}

// main function
async function init() {
    await sql.start();
    await base();
}

init();