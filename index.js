
const inquirer = require("inquirer");
const cTable = require('console.table');
const orm = require("./config/orm.js");

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

const departmentBase = [
    {   // department name
        type: "input",
        message: "Enter the department name:",
        name: "departmentName"
    }
];

var departments = [];
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

var roles = [];
var managers = [];
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
        message: "Select the employee's role:",
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

var choices = [];
const employeeSearch = [
    {   // category 
        type: "list",
        message: "Search employee by:",
        name: "category",
        choices: ["ID", "First name", "Last name", "Title", "Department", "Manager", "All"]   // check if valid
    },
    {   // query
        type: "input",
        message: "Enter your search query:",
        name: "query"
    },
    {   // choice
        type: "list",
        message: "Select your target:",
        name: "choice",
        choices: choices   // check if valid
    }
];

const updateOrRemoveBase = [
    {   // update or remove target
        type: "list",
        message: "Select your target:",
        name: "updateTarget",
        choices: choices   // TODO - check if array of objects are valid in list prompt
    }
];

async function base() {
    try {
        const { action } = await inquirer.prompt(baseQuestions[0]);
        if (action === "Exit") {
            orm.endConnection();
            return;
        }
        const { target } = await inquirer.prompt(baseQuestions[1]);

        switch (action) {
            case "View":
                await view(target);
                break;
            case "Add":
                await add(target);
                break;   
            case "Update":
                await update(target);
                break;
            case "Delete":
                await remove(target);
                break;
            default:
                break;
        }

        await base();

    } catch(err) {
        await base();
    }
}

async function remove(target) {
    try {
        if (target === "Departments") {
            const targetId = await updateOrRemoveTarget(target);

            await orm.removeQuery(target, "id", targetId);
            await orm.updateQuery("Roles", "department_id = NULL", "department_id", targetId);
        } else if (target === "Roles") {
            const targetId = await updateOrRemoveTarget(target, true);

            await orm.updateQuery(target, "id", targetId);
            await orm.updateQuery("Employees", "role_id = NULL", "role_id", targetId);
        } else if (target === "Employees") {
            const targetId = await updateOrRemoveTarget(target, true);

            await orm.updateQuery(target, "id", targetId);
            await orm.updateQuery("Employees", "manager_id = NULL", "manager_id", targetId);
        } 

    } catch(err) {
        if (err) throw err;
    }
}

async function updateOrRemoveTarget(target) {
    try {
        if (target === "Departments") {
            const tempChoices = await orm.selectFrom("*", target);
            choices = tempChoices.map(item => `${item.id}. ${item.department}`)

            const { updateTarget } = inquirer.prompt(updateOrRemoveBase);
            const targetId = tempChoices.filter(item => `${item.id}. ${item.department}` === updateTarget);

            return targetId[0].id;
        } else if (target === "Roles") {
            const tempChoices = await orm.selectFrom("*", target);
            choices = tempChoices.map(item => `${item.id}. ${item.title}`)

            const { updateTarget } = inquirer.prompt(updateOrRemoveBase);
            const targetId = tempChoices.filter(item => `${item.id}. ${item.title}` === updateTarget);

            return targetId[0].id;
        } else if (target === "Employees") {
            const { column, connector, value } = await employeeSpecific();
            const tempChoices = orm.viewEmployeeWhere(column, connector, value);
            choices = tempChoices.map(item => `${item.id}. ${item.FirstName} ${item.LastName}`)

            const { updateTarget } = inquirer.prompt(updateOrRemoveBase);
            const targetId = tempChoices.filter(item => `${item.id}. ${item.FirstName} ${item.LastName}` === updateTarget);

            return targetId[0].id;
        } 

    } catch(err) {
        if (err) throw err;
    }
}

async function addInfo(target, isUpdate) {
    try {
        if (target === "Departments") {
            const { departmentName } = await inquirer.prompt(departmentBase);

            if (isUpdate) {
                return `department = ${departmentName}`;
            } else {
                return `${departmentName}`;
            }
        } else if (target === "Roles") {
            const tempDepartments = await orm.selectFrom("*", "Departments");
            departments = tempDepartments.map(item => `${item.id}. ${item.department}`)

            const { roleTitle, roleSalary, departmentId } = await inquirer.prompt(roleBase);
            const targetDepartment = tempDepartments.filter(item => `${item.id}. ${item.department}` === departmentId);

            if (isUpdate) {
                return `title = ${roleTitle}, salary = ${roleSalary}, department_id = ${targetDepartment[0].id}`;
            } else {
                return `${roleTitle}, ${roleSalary}, ${targetDepartment[0].id}`;
            }
        } else if (target === "Employees") {
            const roleChoices = await orm.selectFrom("*", target);
            roles = roleChoices.map(item => `${item.id}. ${item.title}`)

            const tempManagers = await orm.getManagers();
            managers = tempManagers.map(item => `${item.ID}. ${item.Name}`);

            const { firstName, lastName, roleId, managerId } = inquirer.prompt(employeeBase);
            const roleTarget = tempChoices.filter(item => `${item.id}. ${item.title}` === roleId);
            const managerTarget = tempManagers.filter(item => `${item.ID}. ${item.Name}` === managerId);

            if (isUpdate) {
                return `first_name = ${firstName}, last_name = ${lastName}, role_id = ${roleTarget[0].id}, manager_id = ${managerTarget[0].id}`;
            } else {
                return `${firstName}, ${lastName}, ${roleTarget[0].id}, ${managerTarget[0].id}`;
            }
        } 

    } catch(err) {
        if (err) throw err;
    }
}

async function add(target) {
    try {
        try {
            if (target === "Departments") {
                const newValues = await addInfo(target, false);

                await orm.addQuery(target, `department`, newValues);
            } else if (target === "Roles") {
                const newValues = await addInfo(target, false);
    
                await orm.addQuery(target, `title, salary, department_id`, newValues);
            } else if (target === "Employees") {
                const newValues = await addInfo(target, false);
    
                await orm.addQuery(target, `first_name, last_name, role_id, manager_id`, newValues);
            } 
        } catch(err) {
            if (err) throw err;
        }

    } catch(err) {
        if (err) throw err;
    }
}

async function update(target) {
    try {
        if (target === "Departments") {
            const targetId = await updateOrRemoveTarget(target);
            const newValues = await addInfo(target, true);

            await orm.updateQuery(target, newValues, "id", targetId);
        } else if (target === "Roles") {
            const targetId = await updateOrRemoveTarget(target, true);
            const newValues = await addInfo(target);

            await orm.updateQuery(target, newValues, "id", targetId);
        } else if (target === "Employees") {
            const targetId = await updateOrRemoveTarget(target, true);
            const newValues = await addInfo(target);

            await orm.updateQuery(target, newValues, "id", targetId);
        } 

    } catch(err) {
        if (err) throw err;
    }
}

async function employeeSpecific() {  // START HERE - ADD ACTION, TABLE PARAMETER FOR UPDATE
    try {
        const { category } = await inquirer.prompt(employeeSearch[0]);

        if (category === "ID") {
            const { query } = await inquirer.prompt(employeeSearch[1]);
            return {
                column: `employee.id`,
                connector: `=`,
                value: query
            }
        } else if (category === "First name") {
            const { query } = await inquirer.prompt(employeeSearch[1]);
            return {
                column: `employee.first_name`,
                connector: `LIKE`,
                value: query
            }
        } else if (searchResponse.category === "Last name") {
            const { query } = await inquirer.prompt(employeeSearch[1]);
            return {
                column: `employee.last_name`,
                connector: `LIKE`,
                value: query
            }
        } else if (searchResponse.category === "Title") {
            choices = await orm.selectFrom("title", "Roles");
            const { choice } = await inquirer.prompt(employeeSearch[2]);
            return {
                column: `role.title`,
                connector: `=`,
                value: choice
            }
        } else if (searchResponse.category === "Department") {
            choices = await orm.selectFrom("department", "Departments");
            const { choice } = await inquirer.prompt(employeeSearch[2]);
            return {
                column: `department.department`,
                connector: `=`,
                value: choice
            }
        } else if (searchResponse.category === "Manager") {
            const tempManagers = await orm.getManagers();
            choices = tempManagers.map(item => `${item.ID}. ${item.Name}`);
            const { choice } = await inquirer.prompt(employeeSearch[2]);
            const target = tempManagers.filter(item => `${item.ID}. ${item.Name}` === choice);
            return {
                column: `CONCAT(manager.first_name, " ", manager.last_name)`,
                connector: `=`,
                value: target[0].Name
            }
        } else {
            return {
                column: ``,
                connector: ``,
                value: ``
            }
        }

    } catch(err) {
        if (err) throw err;
    }
}

async function view(target) {
    try {
        var tableData;
        if (target === "Employees") {
            const { column, connector, value } = await employeeSpecific();
            tableData = await orm.viewEmployeeWhere(column, connector, value);
        } else {
            tableData = await orm.selectFrom("*", target);
        }

        const table = cTable.getTable(tableData);
        console.log("\n");
        console.log(table);

    } catch(err) {
        if (err) throw err;
    }
}

// main function
async function init() {
    await base();
}

init();
