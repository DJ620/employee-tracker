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
            choices: ["Add information", "Update information", "View information", "Delete information", "I'm all done"],
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
                    connection.end();
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
    ]).then (async (response) => {
        await db.addInfo("department", {name: response.department});
        console.log(`\nSuccess! Added ${response.department} to the database.\n`);
        begin();
    });
};

const addRole = async () => {
    let dept = await db.tableInfo("department");
    if (dept.length < 1) {
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
            choices: dept.map(x => x.name),
            name: 'department'
        }
    ]).then(async (response) => {
        let department = dept.filter(x=>x.name === response.department)[0];
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
    let managers = await db.viewManagers();
    if (roles.length < 1) {
        console.log("\nNo roles on file, please first create a role and then you can add an employee.\n");
        return begin();
    };
    connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'", (err, res) => {
        inquirer.prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: "firstName"
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: "lastName"
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
                choices: [...managers.map(employee=> `${employee.first_name} ${employee.last_name}`), "This employee doesn't have a manager"],
                name: 'manager'
            }
        ]).then(async (response) => {
            let roleID; 
            let managerID;
            roles.forEach(role => {
                if (role.title === response.role) {
                    roleID = role.id;
                };
            });
            if (response.manager !== "This employee doesn't have a manager") {
                managers.forEach(employee => {
                    if (`${employee.first_name} ${employee.last_name}` === response.manager) {
                        managerID = employee.id;
                    };
                });
            };
            await db.addInfo("employee",
            {
                first_name: response.firstName,
                last_name: response.lastName,
                role_id: roleID,
                manager_id: managerID
            });
            console.log(`\nSuccess! Added ${response.firstName} ${response.lastName} to the database.\n`);
            begin();
        });
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
    const dept = await db.tableInfo("department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department would you like to rename?",
            choices: dept.map(department => department.name),
            name: 'department'
        },
        {
            type: 'input',
            message: "What would you like to rename this department?",
            name: 'newName'
        }
    ]).then(async (response) => {
        let departmentID;
        dept.forEach(department => {
            if (department.name === response.department) {
                departmentID = department.id;
            };
        });
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
        let roleID = {};
        roles.forEach(role => {
            if (role.title === response.toUpdate) {
                roleID = role;
            };
        });
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
    const dept = await db.tableInfo("department");
    let current;
    dept.forEach(department => {
        if (department.id === roleID.department_id) {
            current = department.name;
        };
    });
    console.log(`\nThis role is currently assigned to the ${current} department.\n`);
    inquirer.prompt([
        {
            type: 'list',
            message: "What department would you like to reassign this role to?",
            choices: dept.map(department => department.name),
            name: 'newDepartment'
        }
    ]).then(async (response) => {
        let newID;
        dept.forEach(department => {
            if (department.name === response.newDepartment) {
                newID = department.id;
            };
        });
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
    const emp = await db.tableInfo("employee");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which employee's information would you like to update?",
            choices: emp.map(employee=>`${employee.first_name} ${employee.last_name}`),
            name: 'toUpdate'
        },
        {
            type: 'list',
            message: "How would you like to update this employee's information?",
            choices: ["Update the employee's name", "Update the employee's role", "Update the employee's manager"],
            name: 'action'
        }
    ]).then((response) => {
        let employeeID = {};
        emp.forEach(employee => {
            if (`${employee.first_name} ${employee.last_name}` === response.toUpdate) {
                employeeID = employee;
            };
        });
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
            name: 'firstName'
        },
        {
            type: 'input',
            message: "What is the updated last name of the employee?",
            name: 'lastName'
        }
    ]).then(async (response) => {
        await db.updateInfo("employee", 
        [{
            first_name: response.firstName,
            last_name: response.lastName
        },
        {
            id: employeeID.id
        }]);
        console.log(`\nSuccess! Updated ${response.firstName} ${response.lastName}'s name in the database.\n`);
        begin();
    });
};

const employeeRole = async employeeID => {
    const roles = await db.tableInfo('role');
    let current;
    roles.forEach(role => {
        if (role.id === employeeID.role_id) {
            current = role.title;
        };
    });
    console.log(`\n${employeeID.first_name} ${employeeID.last_name}'s current role is ${current}.\n`);
    inquirer.prompt([
        {
            type: 'list',
            message: `What role would you like to reassign ${employeeID.first_name} ${employeeID.last_name} to?`,
            choices: roles.map(role=>role.title),
            name: 'newRole'
        }
    ]).then(async (response) => {
        let newRoleID;
        roles.forEach(role => {
            if (role.title === response.newRole) {
                newRoleID = role.id;
            };
        });
        await db.updateInfo("employee", [{role_id: newRoleID}, {id: employeeID.id}]);
        console.log(`\nSuccess! ${employeeID.first_name} ${employeeID.last_name} has been assigned the role of ${response.newRole}.\n`);
        begin();
    });
};

const employeeManager = async employeeID => {
    const managers = await db.viewManagers();
    let current;
    managers.forEach(manager => {
        if (manager.id === employeeID.manager_id) {
            current = `${manager.first_name} ${manager.last_name}`;
        };
    });
    console.log(`\n${employeeID.first_name} ${employeeID.last_name}'s current manager is ${current}.\n`);
    inquirer.prompt([
        {
            type: "list",
            message: `Which manager would you like to reassign ${employeeID.first_name} ${employeeID.last_name} to?`,
            choices: [...managers.map(manager=>`${manager.first_name} ${manager.last_name}`), "This employee doesn't have a manager"],
            name: 'newManager'
        }
    ]).then(async (response) => {
        let newManagerID;
        managers.forEach(manager => {
            if (`${manager.first_name} ${manager.last_name}` === response.newManager) {
                newManagerID = manager;
            };
        });
        await db.updateInfo("employee", [{manager_id: newManagerID.id}, {id: employeeID.id}]);
        console.log(`\nSuccess! Assigned ${newManagerID.first_name} ${newManagerID.last_name} as ${employeeID.first_name} ${employeeID.last_name}'s manager.\n`);
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
    const depNames = await db.tableInfo("department");
    console.log(`\nDepartments:\n`);
    depNames.map(department => department.name).forEach(name => {
        console.log(name);
    });
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
        const emps = await db.innerJoin("department.name", response.departmentChoice);
        let budget = emps.map(employee => employee.salary).reduce((a, b) => a + b);
        console.log(`\nThe total utilized budget for the ${response.departmentChoice} department is $${budget}.\n`);
        employeeTable(emps);
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
            const roleInfo = await db.customInfo("title, salary", "role");
            console.table(roleInfo);
            begin();
        };
    });
};

const departmentRoles = async () => {
    const depNames = await db.customInfo("name", "department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department's roles would you like to see?",
            choices: depNames,
            name: 'departmentChoice'
        }
    ]).then(async (response) => {
        const depRoles = await db.rolesByDepartment(response.departmentChoice);
        console.table(depRoles);
        begin();                
    });
};

const employeeTable = async employeeArr => {
    const emps = await db.tableInfo("employee");
    let employeeTable = [];
    employeeArr.forEach(employee => {
        let empObj = {};
        empObj["ID #"] = employee.id;
        empObj.Name = `${employee.first_name} ${employee.last_name}`;
        empObj["Job Title"] = employee.title;
        empObj.Department = employee.name;
        empObj.Salary = "$" + employee.salary;
        empObj.Manager = "This employee has no manager";
        emps.forEach(emp => {
            if (employee.manager_id === emp.id) {
                empObj.Manager = `${emp.first_name} ${emp.last_name}`;
            };
        });
        employeeTable.push(empObj);
    });
    console.table(employeeTable);
    begin();
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
                const emps = await db.innerJoin();
                employeeTable(emps);
        };       
    });
};

const employeeByDepartment = async () => {
    const depNames = await db.customInfo("name", "department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department's employees would you like to see?",
            choices: depNames,
            name: 'departmentChoice'
        }
    ]).then(async (response) => {
        const emps = await db.innerJoin("department.name", response.departmentChoice);
        employeeTable(emps);
    });
};

const employeeByRole = async () => {
    const roleTitles = await db.customInfo("title", "role");
    inquirer.prompt([
        {
            type: 'list',
            message: "View all employees from which role?",
            choices: roleTitles.map(role=>role.title),
            name: 'roleChoice'
        }
    ]).then(async (response) => {
        const emps = await db.innerJoin("role.title", response.roleChoice);
        employeeTable(emps);
    });
};

const employeeByManager = async () => {
    const managers = await db.viewManagers();
    inquirer.prompt([
        {
            type: 'list',
            message: "Which manager's employees would you like to see?",
            choices: managers.map(manager => `${manager.first_name} ${manager.last_name}`),
            name: 'managerChoice'
        }
    ]).then(async (response) => {
        let managerID;
        managers.forEach(manager => {
            if (`${manager.first_name} ${manager.last_name}` === response.managerChoice) {
                managerID = manager.id;
            };
        });
        const emps = await db.innerJoin("employee.manager_id", managerID);
        employeeTable(emps);
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
    const depNames = await db.customInfo("name", "department");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which department would you like to delete?",
            choices: depNames,
            name: 'deleteChoice'
        }
    ]).then(async (response) => {
        await db.deleteInfo("department", {name: response.deleteChoice});
        console.log(`\nSuccess! ${response.deleteChoice} has been removed from the database.\n`);
        begin();
    });
};

const deleteRole = async () => {
    const roleTitles = await db.customInfo("title", "role");
    inquirer.prompt([
        {
            type: 'list',
            message: "What role would you like to delete?",
            choices: roleTitles.map(role=>role.title),
            name: "deleteChoice"
        }
    ]).then(async (response) => {
        await db.deleteInfo("role", {title: response.deleteChoice});
        console.log(`\nSuccess! ${response.deleteChoice} has been removed from the database.\n`);
        begin();
    });
};

const deleteEmployee = async () => {
    const empNames = await db.customInfo("first_name, last_name", "employee");
    inquirer.prompt([
        {
            type: 'list',
            message: "Which employee would you like to delete?",
            choices: empNames.map(employee=>`${employee.first_name} ${employee.last_name}`),
            name: 'deleteChoice'
        }
    ]).then(async (response) => {
        let name = response.deleteChoice.split(" ");
        await db.deleteInfo("employee", [{first_name: name[0]}, {last_name: name[1]}]);
        console.log(`\nSuccess! ${response.deleteChoice} has been deleted from the database.\n`);
        begin();
    });
};