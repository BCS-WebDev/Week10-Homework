
const inquirer = require("inquirer");
const cTable = require('console.table');
const mysql = require("./sql.js");

const sql = new mysql();

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
        choices: employees   // TODO - check if array of objects are valid in list prompt
    }
];

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
    {   // category 
        type: "list",
        message: "Select your target:",
        name: "target",
        choices: employees   // check if valid
    }
];

var updates = [];
const updateBase = [
    {   // target
        type: "list",
        message: "Select the update target:",
        name: "updateTarget",
        choices: updates   // TODO - check if array of objects are valid in list prompt
    }
];

var removes = [];
const removeBase = [
    {   // target
        type: "list",
        message: "Select the target to remove:",
        name: "removeTarget",
        choices: removes   // TODO - check if array of objects are valid in list prompt
    }
];

async function base() {
    try {
        const { action } = await inquirer.prompt(baseQuestions[0]);
        if (action === "Exit") { return; }
        const { target } = await inquirer.prompt(baseQuestions[1]);

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
            case "Exit":
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
        var where = "NULL";
        if (target === "Employee") {
            const searchResponse = await inquirer.prompt(employeeSearch[0]);

            if (searchResponse.category === "ID") {
                const { query } = inquirer.prompt(employeeSearch[1]);
                where = `ID = ${query}`;
            } else if (searchResponse.category === "First name") {
                const { query } = inquirer.prompt(employeeSearch[1]);
                where = `"First name" CONTAINS "${query}"`;
            } else if (searchResponse.category === "Last name") {
                const { query } = inquirer.prompt(employeeSearch[1]);
                where = `"Last name" CONTAINS "${query}"`;
            } else if (searchResponse.category === "Title") {
                const titleResponse = await sql.viewQuery("title", "Roles", "NULL");
                for (const item of titleResponse) {
                    employees.push(item.title);
                }
                const { target } = await inquirer.prompt(employeeSearch[2]);
                where = `Title = "${target}"`;
            } else if (searchResponse.category === "Department") {
                const departmentResponse = await sql.viewQuery("department", "Departments", "NULL");
                for (const item of departmentResponse) {
                    employees.push(item.department);
                }
                const { target } = await inquirer.prompt(employeeSearch[2]);
                where = `Department = ${target}`;
            } else if (searchResponse.category === "Manager") {
                const managerResponse = await sql.viewQuery("*", "Employees", `Title = "Manager"`);
                for (const item of managerResponse) {
                    employees.push(`${item.FirstName} ${item.LastName}`);
                }
                const { target } = await inquirer.prompt(employeeSearch[2]);
                where = `Manager = "${target}"`;
            } else if (searchResponse.category === "All") {
                where = "NULL";
            }
        }

        const response = await sql.viewQuery("*", target, where);
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
        var setValuesClause;
        var whereClause;

        switch (target) {
            case "Departments":
                if (add === false) {
                    const response = await sql.viewQuery("*", "Departments", "NULL");
                    if (!response) {
                        throw new Error("No departments to remove.");
                    } else {
                        for (const item of response) {
                            removes.push(`${item.id}) ${item.department}`);
                        }
                    }

                    const { removeTarget } = await inquirer.prompt(removeBase); // check that properties are valid
                    var departmentTarget;
                    for (const item of response) {
                        if (removeTarget === `${item.id}) ${item.department}`) { departmentTarget = item; }
                    }
                    whereClause = `id = ${departmentTarget.id}, department = "${departmentTarget.department}"`;
                }

                const { departmentName } = await inquirer.prompt(departmentBase); // check that properties are valid
                setValuesClause = `"${departmentName}"`;

                break;   
            case "Roles":
                if (add === false) {
                    const rolesResponse = await sql.viewQuery("title", "Roles", "NULL");
                    if (!rolesResponse) {
                        throw new Error("No roles to update.");
                    } else {
                        for (const item of rolesResponse) {
                            updates.push(`${item.title}`);
                        }
                    }

                    const { updateTarget } = await inquirer.prompt(updateBase);
                    whereClause = `title = "${updateTarget}"`;
                }

                const response = await sql.viewQuery("id, department", "Departments", "NULL");
                for (const item of response) {
                    departments.push(`${item.id}) ${item.department}`);
                }
                departments.push("NULL")

                const { roleTitle, roleSalary, department } = await inquirer.prompt(roleBase); // check that properties are valid
                var departmentId;
                for (const item of response) {
                    if ( department === `${item.id}) ${item.department}`) { departmentId = item.id; }
                }
                setValuesClause = `title = "${roleTitle}", salary = ${roleSalary}, department_id = ${departmentId}`;

                break;
            case "Employees":
                if (add === false) {
                    var where;
                    if (target === "Employee") {
                        const searchResponse = await inquirer.prompt(employeeSearch[0]);

                        if (searchResponse.category === "ID") {
                            const { query } = inquirer.prompt(employeeSearch[1]);
                            where = `ID = ${query}`;
                        } else if (searchResponse.category === "First name") {
                            const { query } = inquirer.prompt(employeeSearch[1]);
                            where = `"First name" CONTAINS "${query}"`;
                        } else if (searchResponse.category === "Last name") {
                            const { query } = inquirer.prompt(employeeSearch[1]);
                            where = `"Last name" CONTAINS "${query}"`;
                        } else if (searchResponse.category === "Title") {
                            const titleResponse = await sql.viewQuery("title", "Roles", "NULL");
                            for (const item of titleResponse) {
                                employees.push(item.title);
                            }
                            const { target } = await inquirer.prompt(employeeSearch[2]);
                            where = `Title = "${target}"`;
                        } else if (searchResponse.category === "Department") {
                            const departmentResponse = await sql.viewQuery("department", "Departments", "NULL");
                            for (const item of departmentResponse) {
                                employees.push(item.department);
                            }
                            const { target } = await inquirer.prompt(employeeSearch[2]);
                            where = `Department = ${target}`;
                        } else if (searchResponse.category === "Manager") {
                            const managerResponse = await sql.viewQuery("*", "Employees", `Title = "Manager"`);
                            for (const item of managerResponse) {
                                employees.push(`${item.FirstName} ${item.LastName}`);
                            }
                            const { target } = await inquirer.prompt(employeeSearch[2]);
                            where = `Manager = "${target}"`;
                        } else if (searchResponse.category === "All") {
                            where = "NULL";
                        }
                    }

                    const employeeResponse = await sql.viewQuery("*", "Employees", where);
                    if (!employeeResponse) {
                        throw new Error("No such employees found.");
                    } else {
                        for (const item of employeeResponse) {
                            updates.push(`${item.ID}) ${item.FirstName} ${item.LastName}`);
                        }
                    }

                    const { updateTarget } = await inquirer.prompt(updateBase);
                    var employee;
                    for (const item of employeeResponse) {
                        if (updateTarget === `${item.id}) ${item.FirstName} $${item.LastName}`) { employee = item; }
                    }
                    whereClause = `id = ${employee.id}, first_name = "${employee.FirstName}", last_name = "${employee.LastName}"`;
                }
            
                const rolesResponse = await sql.viewQuery("id, title", "Roles", "NULL");   // check that properties are valid
                for (const item of rolesResponse) {
                    roles.push(`${item.id}) ${item.title}`);
                }
                roles.push("NULL");

                var managersResponse;
                if (managerRoleId) {
                    managersResponse = await sql.viewQuery("*", "Employees", `Title = "Manager"`);
                    for (const item of managersResponse) {
                        managers.push(`${item.ID}) ${item.FirstName} ${item.LastName}`);
                    }
                }
                managers.push("NULL");

                const { firstName, lastName, roleId, managerId } = await inquirer.prompt(employeeBase);
                var role = "NULL";
                if (roleId !== "NULL") {
                    for (const item of rolesResponse) {
                        if (roleId === `${item.id}) ${item.title}`) { role = item; }
                    }
                }
                var manager = "NULL";
                if (managerId !== "NULL") {
                    for (const item of managersResponse) {
                        if (managerId === `${item.ID}) ${item.FirstName} ${item.LastName}`) { manager = item; }
                    }
                }
                
                setValuesClause = `first_name = "${firstName}", last_name = "${lastName}", role_id = ${role.id}, manager_id = ${manager.id}`;

                break;
            default:
                break;
        }

        if (add === true) {
            await sql.addQuery(target, setValuesClause);
            console.log(`${target} added.`);
        } else {
            await sql.updateQuery(target, setValuesClause, whereClause);
            console.log(`Target updated.`);
        }
        
    } catch(err) {
        console.log(err);  // throw error if error
    }
}

async function remove(target) {
    try {
        var whereClause;
        var updateId;
        switch (target) {
            case "Departments":
                const departmentResponse = await sql.viewQuery("*", "Departments", "NULL");
                if (!departmentResponse) {
                    throw new Error("No departments to remove.");
                } else {
                    for (const item of departmentResponse) {
                        removes.push(`${item.id}) ${item.department}`);
                    }
                }

                const departmentRemove = await inquirer.prompt(removeBase); // check that properties are valid
                var department;
                for (const item of departmentResponse) {
                    if (departmentRemove.removeTarget === `${item.id}) ${item.department}`) { department = item; }
                }
                whereClause = `id = ${department.id}, department = "${department.department}"`;
                updateId = department.id;

                break;   
            case "Roles":
                const rolesResponse = await sql.viewQuery("*", "Roles", "NULL");
                if (!rolesResponse) {
                    throw new Error("No roles to remove.")
                } else {
                    for (const item of rolesResponse) {
                        removes.push(`${item.id}) ${item.title} : $${item.salary} - Department ${item.department_id}`)
                    }
                }

                const roleRemove = await inquirer.prompt(removeBase); // check that properties are valid
                var role;
                for (const item of rolesResponse) {
                    if (roleRemove.removeTarget === `${item.id}) ${item.title} : $${item.salary} - Department ${item.department_id}`) {
                        role = item
                    }
                }
                whereClause = `id = ${role.id}, title = "${role.title}", salary = ${role.salary}, department_id = ${role.department_id}`;
                updateId = role.id;

                break;
            case "Employees":
                const searchResponse = await inquirer.prompt(employeeSearch[0]);

                if (searchResponse.category === "ID") {
                    const { query } = inquirer.prompt(employeeSearch[1]);
                    where = `ID = ${query}`;
                } else if (searchResponse.category === "First name") {
                    const { query } = inquirer.prompt(employeeSearch[1]);
                    where = `"First name" CONTAINS "${query}"`;
                } else if (searchResponse.category === "Last name") {
                    const { query } = inquirer.prompt(employeeSearch[1]);
                    where = `"Last name" CONTAINS "${query}"`;
                } else if (searchResponse.category === "Title") {
                    const titleResponse = await sql.viewQuery("title", "Roles", "NULL");
                    for (const item of titleResponse) {
                        employees.push(item.title);
                    }
                    const { target } = await inquirer.prompt(employeeSearch[2]);
                    where = `Title = "${target}"`;
                } else if (searchResponse.category === "Department") {
                    const departmentResponse = await sql.viewQuery("department", "Departments", "NULL");
                    for (const item of departmentResponse) {
                        employees.push(item.department);
                    }
                    const { target } = await inquirer.prompt(employeeSearch[2]);
                    where = `Department = ${target}`;
                } else if (searchResponse.category === "Manager") {
                    const managerResponse = await sql.viewQuery("*", "Employees", `Title = "Manager"`);
                    for (const item of managerResponse) {
                        employees.push(`${item.FirstName} ${item.LastName}`);
                    }
                    const { target } = await inquirer.prompt(employeeSearch[2]);
                    where = `Manager = "${target}"`;
                } else if (searchResponse.category === "All") {
                    where = "NULL";
                }
                
                const employeeResponse = await sql.viewQuery("*", "Employees", where);
                if (!employeeResponse) {
                    throw new Error("No such employees found.");
                } else {
                    for (const item of employeeResponse) {
                        removes.push(`${item.id}) ${item.first_name} $${item.last_name}`);
                    }
                }

                const employeeRemove = await inquirer.prompt(removeBase); // check that properties are valid
                var employee;
                for (const item of employeeResponse) {
                    if (employeeRemove.removeTarget === `${item.id}) ${item.first_name} $${item.last_name}`) {
                        employee = item;
                    }
                }
                whereClause = `id = ${employee.id}, first_name = "${employee.first_name}", last_name = "${employee.last_name}"`;
                updateId = employee.id;

                break;
            default:
                break;
        }

        await sql.removeQuery(target, whereClause, updateId);
        console.log("Target removed.");

    } catch(err) {
        console.log(err);
    }
}

// main function
async function init() {
    // sql.connection.connect(function(err) {
    //     if (err) throw err;
    //     await base();
    // });
    await sql.start();
    await base();
    sql.end();
}

init();

// bonus features - cancel option, update all option