// Dependencies=======================================================================================================

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
// File that contains a class with all connection.querys as methods
const db = require("./db");

// MySQL Connection ==================================================================================================

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Hersh6624!",
    database: "employeeDB"
});

connection.connect((err) => {
    if (err) throw err;
    begin();
});

// Inquirer and Query functions=======================================================================================

const begin = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "How may I assist you?",
            choices: ["Add information", "Update information", "View information", "Delete information", "Search for employee", "I'm all done"],
            name: "choice"
        }
    ]).then((response) => {
        switch (response.choice) {
            case "Add information":
                addInfo();
                break;
            case "Update information":
                updateInfo();
                break;
            case "View information":
                viewInfo();
                break;
            case "Delete information":
                deleteInfo();
                break;
            case "I'm all done":
                process.exit();
                break;
            case "Search for employee":
                employeeSearch();
                break;
            default:
                begin();
        };
    });
};

// Functions to add to database=======================================================================================

const addInfo = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What would you like to add?",
            choices: ["New department", "New role", "New employee"],
            name: 'toAdd'
        }
    ]).then((response) => {
        switch (response.toAdd) {
            case "New department":
                addDepartment();
                break;
            case "New role":
                addRole();
                break;
            case "New employee":
                addEmployee();
                break;
            default:
                begin();
        };
    });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the name of the new department?",
            name: 'department'
        }
        // Async callback function to await the db.tableInfo and db.addInfo methods
    ]).then (async (response) => {
        // the db.tableInfo method returns data from the table passed in
        let deps = await db.tableInfo("department");
        // Code to check if department is already in the database
        let exists = false;
        deps.forEach(dep=>{
            if (dep.name === response.department) {
                exists = true;
            };
        });
        if (exists) {
            console.log(`\n${response.department} department is already on file.\n`);
            return begin();
        };
        // the db.addInfo method adds data to the table passed in
        await db.addInfo("department", {name: response.department});
        console.log(`\nSuccess! Added ${response.department} to the database.\n`);
        // Redirects user back to the start menu
        begin();
    });
};

const addRole = async () => {
    // First checks if there are departments on file, and if not, alerts them to first create a department
    let deps = await db.tableInfo("department");
    if (deps.length < 1) {
        console.log("\nNo departments on file, please first create a department and then you can add a role.\n");
        return begin();
    };
    inquirer.prompt([
        {
             type: 'input',
            message: "What is the role you'd like to add?",
            name: 'role'
        },
        {
            type: 'input',
            message: "What is the salary of this position?",
            name: "salary"
        },
        {
            type: "list",
            message: "What department does this role belong in?",
            choices: deps.map(dep=>dep.name),
            name: 'department'
        }
    ]).then(async (response) => {
        let roles = await db.tableInfo("role");
        let exists = false;
        roles.forEach(role=>{
            if (role.title === response.role) {
                exists = true;
            };
        });
        if (exists) {
            console.log(`\n${response.role} is already on file.\n`);
            return begin();
        };
        // Selecting the department the user has chosen and passing it into the db.addInfo method, filtering it for the specific department that was chosen, and adding [0] because we want the object itself
        let department = deps.filter(dep=>dep.name === response.department)[0];
        await db.addInfo("role",
                {
                    title: response.role,
                    salary: response.salary,
                    department_id: department.id
                });
        console.log(`\nSuccess! Added ${response.role} to the database.\n`);
        begin();
    });
};

const addEmployee = async () => {
    let roles = await db.tableInfo("role");
    // The db.viewManagers method returns all employees whose role has the word "Manager" in it
    let managers = await db.viewManagers();
    if (roles.length < 1) {
        console.log("\nNo roles on file, please first create a role and then you can add an employee.\n");
        return begin();
    };
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: "first_name"
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: "last_name"
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            choices: roles.map(role=>role.title),
            name: 'role'
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            // The spread operator allows me to map through the managers array, take out the information I want, and then add an option if the employee doesn't have a manager
            // The db.concatName method returns the first and last name concatenated of any employee object passed through
            choices: [...managers.map(manager=> `${db.concatName(manager)} - ${manager.title}`), "This employee doesn't have a manager"],
            name: 'manager'
        }
    ]).then(async (response) => {
        let emps = await db.tableInfo("employee");
        let exists = false;
        emps.forEach(emp=>{
            if (db.concatName(emp) === db.concatName(response)) {
                exists = true;
            };
        });
        if (exists) {
            console.log(`\n${db.concatName(response)} is already on file.\n`);
            return begin();
        };
        // Selecting the user's chosen role id from all roles in the database
        let roleID = roles.filter(role=>role.title === response.role)[0].id;
        let managerID; 
        // If the employee does have a manager, this sets managerID to that manager's id
        if (response.manager !== "This employee doesn't have a manager") {
           managerID = managers.filter(manager=>`${db.concatName(manager)} - ${manager.title}` === response.manager)[0].id;
        };
        await db.addInfo("employee",
        {
            first_name: response.first_name,
            last_name: response.last_name,
            role_id: roleID,
            manager_id: managerID
        });
        console.log(`\nSuccess! Added ${db.concatName(response)} to the database.\n`);
        begin();
    });
};

// Functions to update database=======================================================================================

const updateInfo = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What would you like to update?",
            choices: ["Change name of department", "Update role information", "Update employee information"],
            name: 'toUpdate'
        }
    ]).then((response) => {
        switch (response.toUpdate) {
            case "Change name of department":
                renameDepartment();
                break;
            case "Update role information":
                updateRole();
                break;
            case "Update employee information":
                updateEmployee();
                break;
            default:
                begin();
        };
    });
};

const renameDepartment = async () => {
    const deps = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department would you like to rename?",
            choices: deps.map(dep => dep.name),
            name: 'department'
        },
        {
            type: 'input',
            message: "What would you like to rename this department?",
            name: 'newName'
        }
    ]).then(async (response) => {
        // Selects the user's chosen department id from all departments
        let departmentID = deps.filter(dep=>dep.name === response.department)[0].id;
        // The db.updateInfo method updates any table passed into it in the database
        await db.updateInfo("department", [{name: response.newName}, {id: departmentID}]);
        console.log(`\nSuccess! Renamed ${response.department} to ${response.newName} in the database.\n`);
        begin();
    });
};

const updateRole = async () => {
    const roles = await db.tableInfo("role");
    inquirer.prompt([
        {
            type: 'list',
            message: "What role would you like to update?",
            choices: roles.map(role=>role.title),
            name: 'toUpdate'
        },
        {
            type: 'list',
            Message: "What would you like to update about this role?",
            choices: ["Rename role", "Update salary", "Switch department"],
            name: 'action'
        }
    ]).then((response) => {
        // Sets roleID to the role the user has chosen and passes it into the appropriate function
        let roleID = roles.filter(role=>role.title === response.toUpdate)[0];
        switch (response.action) {
            case "Rename role":
                renameRole(roleID);
                break;
            case "Update salary":
                updateSalary(roleID);
                break;
            case "Switch department":
                switchDepartment(roleID);
                break;
            default:
                begin();
        };
    });
};

const renameRole = roleID => {
    inquirer.prompt([
        {
            type: 'input',
            message: "What would you like to rename this role?",
            name: "newName"
        }
    ]).then(async (response) => {
        await db.updateInfo("role", [{title: response.newName}, {id: roleID.id}]);
        console.log(`\nSuccess! Renamed ${roleID.title} to ${response.newName} in the database.\n`);
        begin();
    });
};

const updateSalary = roleID => {
    console.log(`\nThe current salary for this role is $${roleID.salary}.\n`);
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the updated salary for this role?",
            name: 'newSalary'
        }
    ]).then(async (response) => {
        await db.updateInfo("role", [{salary: response.newSalary}, {id: roleID.id}]);
        console.log(`\nSuccess! Updated the salary of ${roleID.title} in the database to $${response.newSalary}.\n`);
        begin();
    });
};

const switchDepartment = async roleID => {
    const deps = await db.tableInfo("department");
    // Selects the department the role is currently assigned to
    let current = deps.filter(dep=>dep.id === roleID.department_id)[0].name;
    console.log(`\nThis role is currently assigned to the ${current} department.\n`);
    inquirer.prompt([
        {
            type: 'list',
            message: "What department would you like to reassign this role to?",
            choices: deps.map(dep => dep.name),
            name: 'newDepartment'
        }
    ]).then(async (response) => {
        let newID = deps.filter(dep=>dep.name === response.newDepartment)[0].id;
        if (newID === roleID.id) {
            console.log(`\n${roleID.title} is already assigned to ${response.newDepartment}.\n`);
            begin();
        } else {
            await db.updateInfo("role", [{department_id: newID}, {id: roleID.id}]);
            console.log(`\nSuccess! Reassigned ${roleID.title} to the ${response.newDepartment} department.\n`);
            begin();
        };
    });
};

const updateEmployee = async () => {
    const emps = await db.tableInfo("employee");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which employee's information would you like to update?",
            choices: emps.map(emp=>db.concatName(emp)),
            name: 'toUpdate'
        },
        {
            type: 'list',
            message: "How would you like to update this employee's information?",
            choices: ["Update the employee's name", "Update the employee's role", "Update the employee's manager"],
            name: 'action'
        }
    ]).then((response) => {
        // Selects the employee the user has chosen and passes it into the appropriate function
        let employeeID = emps.filter(emp=>db.concatName(emp) === response.toUpdate)[0];
        switch(response.action) {
            case "Update the employee's name":
                employeeName(employeeID);
                break;
            case "Update the employee's role":
                employeeRole(employeeID);
                break;
            case "Update the employee's manager":
                employeeManager(employeeID);
                break;
            default:
                begin();
        };
    });
};

const employeeName = employeeID => {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the updated first name of the employee?",
            name: 'first_name'
        },
        {
            type: 'input',
            message: "What is the updated last name of the employee?",
            name: 'last_name'
        }
    ]).then(async (response) => {
        await db.updateInfo("employee", 
        [{
            first_name: response.first_name,
            last_name: response.last_name
        },
        {
            id: employeeID.id
        }]);
        console.log(`\nSuccess! Updated ${db.concatName(response)}'s name in the database.\n`);
        begin();
    });
};

const employeeRole = async employeeID => {
    const roles = await db.tableInfo('role');
    // Selects the employee's current role
    let current = roles.filter(role=>role.id === employeeID.role_id)[0];
    console.log(`\n${db.concatName(employeeID)}'s current role is ${current.title}.\n`);
    inquirer.prompt([
        {
            type: 'list',
            message: `What role would you like to reassign ${db.concatName(employeeID)} to?`,
            choices: roles.map(role=>role.title),
            name: 'newRole'
        }
    ]).then(async (response) => {
        //Selects the employee's new role's ID
        let newRoleID = roles.filter(role=>role.title === response.newRole)[0].id;
        if (newRoleID === current.id) {
            console.log(`\n${db.concatName(employeeID)} is already assigned to the role of ${response.newRole}.\n`);
            return begin();
        };
        await db.updateInfo("employee", [{role_id: newRoleID}, {id: employeeID.id}]);
        console.log(`\nSuccess! ${db.concatName(employeeID)} has been assigned the role of ${response.newRole}.\n`);
        begin();
    });
};

const employeeManager = async employeeID => {
    const managers = await db.viewManagers();
    let current = "This employee doesn't currently have a manager";
    // Selects the employee's current manager if they have one
    if (employeeID.manager_id) {
        current = db.concatName(managers.filter(manager=>manager.id === employeeID.manager_id)[0]);
        console.log(`\n${db.concatName(employeeID)}'s current manager is ${current}.\n`);
    } else {
        console.log(`\n${current}.\n`);
    };
    inquirer.prompt([
        {
            type: "list",
            message: `Which manager would you like to reassign ${db.concatName(employeeID)} to?`,
            choices: [...managers.map(manager=>`${db.concatName(manager)} - ${manager.title}`), "This employee doesn't have a manager"],
            name: 'newManager'
        }
    ]).then(async (response) => {
        let newManagerID = managers.filter(manager=>`${db.concatName(manager)} - ${manager.title}` === response.newManager)[0];
        if (db.concatName(newManagerID) === current) {
            console.log(`\n${current} is already assigned as ${db.concatName(employeeID)}'s manager.\n`);
            return begin();
        };
        await db.updateInfo("employee", [{manager_id: newManagerID.id}, {id: employeeID.id}]);
        console.log(`\nSuccess! Assigned ${db.concatName(newManagerID)} as ${db.concatName(employeeID)}'s manager.\n`);
        begin();
    });
};

// Functions to view info=============================================================================================

const viewInfo = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What information would you like to see?",
            choices: ["Departments", "Department Budgets", "Roles", "Employees"],
            name: 'toView'
        }
    ]).then((response) => {
        switch (response.toView) {
            case "Departments":
                viewDepartments();
                break;
            case "Department Budgets":
                budgets();
                break;
            case "Roles":
                viewRoles();
                break;
            case "Employees":
                viewEmployees();
                break;
            default:
                begin();
        };
    });
};

const viewDepartments = async () => {
    const deps = await db.tableInfo("department");
    console.log(`\nDepartments:\n`);
    deps.forEach(dep => console.log(dep.name));
    // Extra line for formatting
    console.log("");
    begin();
};

const budgets = async () => {
    const deps = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department's total utilized budget would you like to see?",
            choices: deps.map(department => department.name),
            name: "departmentChoice"
        }
    ]).then(async (response) => {
        // The db.innerJoin method queries all three tables for employee information based on the parameters it is given
        const emps = await db.innerJoin("department.name", response.departmentChoice);
        // Adds the salaries of all employees within the chosen department
        let budget = emps.map(employee => employee.salary).reduce((a, b) => a + b);
        console.log(`\nThe total utilized budget for the ${response.departmentChoice} department is $${budget}.\n`);
        await db.employeeTable(emps);
        begin();
    });
};

const viewRoles = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What roles would you like to see?",
            choices: ["All roles", "Specific department roles"],
            name: 'choice'
        }
    ]).then(async (response) => {
        if (response.choice === "Specific department roles") {
            departmentRoles();
        } else {
            const roles = await db.tableInfo("role");
            console.log(`\nAll Roles:\n`);
            roles.forEach(role=>console.log(role.title));
            console.log('');
            begin();
        };
    });
};

const departmentRoles = async () => {
    const deps = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department's roles would you like to see?",
            choices: deps.map(dep=>dep.name),
            name: 'departmentChoice'
        }
    ]).then(async (response) => {
        const depRoles = await db.rolesByDepartment(response.departmentChoice);
        console.log(`\n${response.departmentChoice} roles:\n`);
        depRoles.forEach(role=>console.log(role.title));
        console.log("");
        begin();                
    });
};

const viewEmployees = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "How would you like to view employees?",
            choices: ["By department", "By role", "By manager", "All employees"],
            name: "choice"
        }
    ]).then(async (response) => {
        switch (response.choice) {
            case "By department":
                employeeByDepartment();
                break;
            case "By role":
                employeeByRole();
                break;
            case "By manager":
                employeeByManager();
                break;
            default:
                // Displays all employees
                const emps = await db.innerJoin();
                await db.employeeTable(emps);
                begin();
        };       
    });
};

const employeeByDepartment = async () => {
    const deps = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department's employees would you like to see?",
            choices: deps.map(dep=>dep.name),
            name: 'departmentChoice'
        }
    ]).then(async (response) => {
        const emps = await db.innerJoin("department.name", response.departmentChoice);
        await db.employeeTable(emps);
        begin();
    });
};

const employeeByRole = async () => {
    const roles = await db.tableInfo("role");
    inquirer.prompt([
        {
            type: 'list',
            message: "View all employees from which role?",
            choices: roles.map(role=>role.title),
            name: 'roleChoice'
        }
    ]).then(async (response) => {
        const emps = await db.innerJoin("role.title", response.roleChoice);
        await db.employeeTable(emps);
        begin();
    });
};

const employeeByManager = async () => {
    const managers = await db.viewManagers();
    inquirer.prompt([
        {
            type: 'list',
            message: "Which manager's employees would you like to see?",
            choices: managers.map(manager => `${db.concatName(manager)} - ${manager.title}`),
            name: 'managerChoice'
        }
    ]).then(async (response) => {
        let managerID = managers.filter(manager=>`${db.concatName(manager)} - ${manager.title}` === response.managerChoice)[0].id;
        const emps = await db.innerJoin("employee.manager_id", managerID);
        if (emps.length < 1) {
            console.log(`\n${response.managerChoice} has no employees on record.\n`);
            return begin();
        };
        await db.employeeTable(emps);
        begin();
    });
};

// Functions to delete info===========================================================================================

const deleteInfo = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What would you like to delete?",
            choices: ["Delete a department", "Delete a role", "Delete an employee"],
            name: 'action'
        }
    ]).then((response) => {
        switch (response.action) {
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            default:
                begin();
        };
    });
};

const deleteDepartment = async () => {
    const deps = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department would you like to delete?",
            choices: deps.map(dep=>dep.name),
            name: 'deleteChoice'
        }
    ]).then(async (response) => {
        // The db.deleteInfo method deletes data from the database based on parameters that are passed in
        await db.deleteInfo("department", {name: response.deleteChoice});
        console.log(`\nSuccess! ${response.deleteChoice} has been removed from the database.\n`);
        begin();
    });
};

const deleteRole = async () => {
    const roles = await db.tableInfo("role");
    inquirer.prompt([
        {
            type: 'list',
            message: "What role would you like to delete?",
            choices: roles.map(role=>role.title),
            name: "deleteChoice"
        }
    ]).then(async (response) => {
        await db.deleteInfo("role", {title: response.deleteChoice});
        console.log(`\nSuccess! ${response.deleteChoice} has been removed from the database.\n`);
        begin();
    });
};

const deleteEmployee = async () => {
    const emps = await db.tableInfo("employee");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which employee would you like to delete?",
            choices: emps.map(emp=>`${db.concatName(emp)}`),
            name: 'deleteChoice'
        }
    ]).then(async (response) => {
        let name = response.deleteChoice.split(" ");
        await db.deleteInfo("employee", [{first_name: name[0]}, {last_name: name[1]}]);
        console.log(`\nSuccess! ${response.deleteChoice} has been deleted from the database.\n`);
        begin();
    });
};

// This is a function that allows a user to search for an employee by their name
const employeeSearch = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: "first_name"
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: "last_name"
        }
    ]).then(async (response) => {
        const emps = await db.innerJoin();
        // Searches for a matching name in the database
        let match;
        emps.forEach(emp=>{
            if (db.concatName(emp) === db.concatName(response)) {
                match = emp;
            };
        });
        if (match) {
            await db.employeeTable([match]);
        } else {
            console.log(`\nNo employee found\n`);
        };
        begin();
    });
};