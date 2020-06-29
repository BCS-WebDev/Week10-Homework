
const inquirer = require("inquirer");    // load inquirer module
const cTable = require('console.table');    // load console table module
const orm = require("./config/orm.js");   // load orm

// base action & target
const baseQuestions = [ 
    {   // action
        type: "list",
        message: "What would you like to do:",
        name: "action",
        choices: ["View", "Add", "Update", "Delete", "Exit"]
    },
    {   // target
        type: "list",
        message: "Select your target:",
        name: "target",
        choices: ["Departments", "Roles", "Employees"]
    }
];

// department questions base
const departmentBase = [
    {   // department name
        type: "input",
        message: "Enter the department name:",
        name: "departmentName"
    }
];

// role questions base
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
    }
];

// employee questions base
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
    }
];

// employee search questions base
const employeeSearch = [
    {   // category 
        type: "list",
        message: "Search employee by:",
        name: "category",
        choices: ["ID", "First name", "Last name", "Title", "Department", "Manager", "All"]   
    },
    {   // query
        type: "input",
        message: "Enter your search query:",
        name: "query"
    }
];

// main base function
async function base() {
    try {
        const { action } = await inquirer.prompt(baseQuestions[0]);  // inquire action
        if (action === "Exit") {  // if exit - end connection
            orm.endConnection();
            return;
        }
        const { target } = await inquirer.prompt(baseQuestions[1]);  // inquire target

        switch (action) {    // switch based on action & target
            case "View":
                await view(target);   // view target
                break;
            case "Add":
                await add(target);   // add target
                break;   
            case "Update":
                await update(target);  // update target
                break;
            case "Delete":
                await remove(target);   // remove target
                break;
            default:
                break;
        }

        await base();   // recur

    } catch(err) {    // if error
        await base();   // recur
    }
}

// remove
async function remove(target) {
    try {
        if (target === "Departments") {
            const targetId = await updateOrRemoveTarget(target);  // get department to remove

            await orm.removeQuery(target, "id", targetId);    // remove target
            await orm.updateQuery("Roles", "department_id = NULL", "department_id", targetId);  // update targets affected by removed target
        } else if (target === "Roles") {
            const targetId = await updateOrRemoveTarget(target, true);  // get role to remove

            await orm.removeQuery(target, "id", targetId);    // remove target
            await orm.updateQuery("Employees", "role_id = NULL", "role_id", targetId);  // update targets affected by removed target
        } else if (target === "Employees") {
            const targetId = await updateOrRemoveTarget(target, true);  // get employee to remove

            await orm.removeQuery(target, "id", targetId);    // remove target
            await orm.updateQuery("Employees", "manager_id = NULL", "manager_id", targetId);  // update targets affected by removed target
        } 

    } catch(err) {   // throw error if error
        if (err) throw err;
    }
}

// update or remove helper
async function updateOrRemoveTarget(target) {
    try {
        if (target === "Departments") {
            const tempChoices = await orm.selectFrom("*", target);  // get department to update or remove
            if (tempChoices.length === 0) { throw new Error(console.log("No departments to choose from.")); } // throw err if no targets
            const choicesArray = tempChoices.map(item => `${item.id}. ${item.department}`);  // load targets
            const { updateTarget } = await inquirer.prompt({   // prompt user to select target
                type: "list",
                message: "Select your target:",
                name: "updateTarget",
                choices: choicesArray   
            });
            const targetId = tempChoices.filter(item => `${item.id}. ${item.department}` === updateTarget);  // get target info

            return targetId[0].id;  // return target id
        } else if (target === "Roles") {
            const tempChoices = await orm.selectFrom("*", target); // get role to update or remove
            if (tempChoices.length === 0) { throw new Error(console.log("No roles to choose from.")); } // throw err if no targets
            const choicesArray = tempChoices.map(item => `${item.id}. ${item.title}`);  // load targets
            const { updateTarget } = await inquirer.prompt({    // prompt user to select target
                type: "list",
                type: "list",
                message: "Select your target:",
                name: "updateTarget",
                choices: choicesArray   
            });
            const targetId = tempChoices.filter(item => `${item.id}. ${item.title}` === updateTarget);  // get target info

            return targetId[0].id;  // return target id
        } else if (target === "Employees") {
            const { column, connector, value } = await employeeSpecific();  // get employee specifics 
            const tempChoices = await orm.getEmployeeWhere(column, connector, value);  // get employee to update or remove
            if (tempChoices.length === 0) { throw new Error(console.log("No such employees to choose from.")); } // throw err if no targets
            const choicesArray = tempChoices.map(item => `${item.ID}. ${item.FirstName} ${item.LastName}`);  // load targets
            const { updateTarget } = await inquirer.prompt({    // prompt user to select target
                type: "list",
                type: "list",
                message: "Select your target:",
                name: "updateTarget",
                choices: choicesArray   
            });
            const targetId = tempChoices.filter(item => `${item.ID}. ${item.FirstName} ${item.LastName}` === updateTarget);  // get target info
            
            return targetId[0].ID;  // return target id
        } 

    } catch(err) {   // throw error if error
        if (err) throw err;
    }
}

// add info helper
async function addInfo(target, isUpdate) {
    try {
        if (target === "Departments") {
            const { departmentName } = await inquirer.prompt(departmentBase);  // prompt for department info

            // return value clause depending on if update or add
            if (isUpdate) {   
                return `department = "${departmentName}"`;
            } else {
                return `"${departmentName}"`;
            }
        } else if (target === "Roles") {
            const { roleTitle, roleSalary } = await inquirer.prompt(roleBase);  // prompt for role info

            // get departments to choose from and prompt for user selection - must have exisiting departments
            const tempDepartments = await orm.selectFrom("*", "Departments"); 
            if (tempDepartments.length === 0) { throw new Error(console.log("No departments to choose from.")); }
            const departments = tempDepartments.map(item => `${item.id}. ${item.department}`)
            const { departmentId } = await inquirer.prompt({   
                type: "list",
                message: "Select the role's department:",
                name: "departmentId",
                choices: departments   
            });
            const targetDepartment = tempDepartments.filter(item => `${item.id}. ${item.department}` === departmentId); // get target id

            // return value clause depending on if update or add
            if (isUpdate) {   
                return `title = "${roleTitle}", salary = ${roleSalary}, department_id = ${targetDepartment[0].id}`;
            } else {
                return `"${roleTitle}", ${roleSalary}, ${targetDepartment[0].id}`;
            }
        } else if (target === "Employees") {
            const { firstName, lastName } = await inquirer.prompt(employeeBase);

            // get roles to choose from and prompt for user selection - must have exisiting roles
            const roleChoices = await orm.selectFrom("*", "Roles");
            if (roleChoices.length === 0) { throw new Error(console.log("No roles to choose from.")); }
            const roles = roleChoices.map(item => `${item.id}. ${item.title}`);
            const { roleId } = await inquirer.prompt({   
                type: "list",
                message: "Select the employee's role:",
                name: "roleId",
                choices: roles   
            });
            const roleTarget = roleChoices.filter(item => `${item.id}. ${item.title}` === roleId); // get target id

             // if manager - to set manager_id to null
            if (roleTarget[0].title === "Manager" && isUpdate === false) { 
                if (isUpdate) {   // return value clause depending on if update or add
                    return `first_name = "${firstName}", last_name = "${lastName}", role_id = ${roleTarget[0].id}, manager_id = NULL`;
                } else {
                    return `"${firstName}", "${lastName}", ${roleTarget[0].id}, NULL`;
                }
            }

            // get managers to choose from and prompt for user selection - must have exisiting managers
            const tempManagers = await orm.getManagers();
            if (tempManagers.length === 0) { throw new Error(console.log("No Managers to choose from.")); }
            const managers = tempManagers.map(item => `${item.ID}. ${item.Name}`);
            const { managerId } = await inquirer.prompt({   
                type: "list",
                message: "Select the employee's manager:",
                name: "managerId",
                choices: managers   
            });
            const managerTarget = tempManagers.filter(item => `${item.ID}. ${item.Name}` === managerId); // get target id

            // return value clause depending on if update or add
            if (isUpdate) {  
                return `first_name = "${firstName}", last_name = "${lastName}", role_id = ${roleTarget[0].id}, manager_id = ${managerTarget[0].ID}`;
            } else {
                return `"${firstName}", "${lastName}", ${roleTarget[0].id}, ${managerTarget[0].ID}`;
            }
        } 

    } catch(err) {   // throw error if error
        if (err) throw err;
    }
}

// add
async function add(target) {
    try {
        if (target === "Departments") {
            const newValues = await addInfo(target, false);  // get department add info
            await orm.addQuery(target, `department`, newValues);  // add department
        } else if (target === "Roles") {
            const newValues = await addInfo(target, false);  // get role add info
            await orm.addQuery(target, `title, salary, department_id`, newValues);  // add department
        } else if (target === "Employees") {
            const newValues = await addInfo(target, false);  // get employee add info
            await orm.addQuery(target, `first_name, last_name, role_id, manager_id`, newValues);  // add department
        } 
    } catch(err) {   // throw error if error
        if (err) throw err;
    }
}

// update
async function update(target) {
    try {
        if (target === "Departments") {
            const targetId = await updateOrRemoveTarget(target);  // get department update target
            const newValues = await addInfo(target, true);  // get department update clause via add 

            await orm.updateQuery(target, newValues, "id", targetId);  // update target department with new values
        } else if (target === "Roles") {
            const targetId = await updateOrRemoveTarget(target);  // get role update target
            const newValues = await addInfo(target, true);   // get role update clause via add 

            await orm.updateQuery(target, newValues, "id", targetId);  // update target role with new values
        } else if (target === "Employees") {
            const targetId = await updateOrRemoveTarget(target);  // get employee update target
            const newValues = await addInfo(target, true);   // get employee update clause via add 

            await orm.updateQuery(target, newValues, "id", targetId);  // update target employee with new values
        } 

    } catch(err) {    // throw error if error
        if (err) throw err;
    }
}

// prompt for employee specifics
async function employeeSpecific() {  
    try {
        const { category } = await inquirer.prompt(employeeSearch[0]);   // get employee search category

        if (category === "ID") {
            const { query } = await inquirer.prompt(employeeSearch[1]);  // get employee search value
            return {  // return search specific info
                column: `employee.id`,
                connector: `=`,
                value: query
            }
        } else if (category === "First name") {
            const { query } = await inquirer.prompt(employeeSearch[1]); // get employee search value
            return {   // return search specific info
                column: `employee.first_name`,
                connector: `LIKE`,
                value: query
            }
        } else if (category === "Last name") {
            const { query } = await inquirer.prompt(employeeSearch[1]); // get employee search value
            return {  // return search specific info
                column: `employee.last_name`,
                connector: `LIKE`,
                value: query
            }
        } else if (category === "Title") {
            const roles = await orm.selectFrom("title", "Roles");  // get roles to search employee by
            const choicesArray = roles.map(item => item.title);
            const { choice } = await inquirer.prompt({    // get target role
                type: "list",
                message: "Select your target:",
                name: "choice",
                choices: choicesArray   
            });

            return {  // return search specific info
                column: `role.title`,
                connector: `=`,
                value: choice
            }
        } else if (category === "Department") {
            const department = await orm.selectFrom("department", "Departments");  // get departments to search employee by
            const choicesArray = department.map(item => item.department);
            const { choice } = await inquirer.prompt({     // get target department
                type: "list",
                message: "Select your target:",
                name: "choice",
                choices: choicesArray   
            });

            return {  // return search specific info
                column: `department.department`,
                connector: `=`,
                value: choice
            }
        } else if (category === "Manager") {
            const tempManagers = await orm.getManagers();  // get managers to search employee by
            const choicesArray = tempManagers.map(item => `${item.ID}. ${item.Name}`);
            const { choice } = await inquirer.prompt({     
                type: "list",
                message: "Select your target:",
                name: "choice",
                choices: choicesArray   
            });
            const target = tempManagers.filter(item => `${item.ID}. ${item.Name}` === choice);  // get target manager 

            return {  // return search specific info
                column: `CONCAT(manager.first_name, " ", manager.last_name)`,
                connector: `=`,
                value: `${target[0].Name}`
            }
        } else {  // all employees
            return {  // return search specific info
                column: ``,
                connector: ``,
                value: ``
            }
        }

    } catch(err) {    // throw error if error
        if (err) throw err;
    }
}

// view
async function view(target) {
    try {
        var tableData;
        if (target === "Employees") {
            const { column, connector, value } = await employeeSpecific();  // get employee specifics for search
            tableData = await orm.getEmployeeWhere(column, connector, value);   // get employees via specifics
        } else {
            tableData = await orm.selectFrom("*", target);   // get targets
        }

        if (tableData.length > 0) {   // display data if data
            const table = cTable.getTable(tableData);  // using console.table node package
            console.log("\n");
            console.log(table);
        }
        else {    // else console log no data
            console.log("\n");
            console.log("No data.");
            console.log("\n");
        }
    } catch(err) {    // throw error if error
        if (err) throw err;
    }
}

// init
async function init() {
    await base();  // NOTE: user is prompted before mysql connection loads in orm 
}

init();  // call init
