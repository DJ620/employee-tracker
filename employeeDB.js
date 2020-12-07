const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

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
    ]).then ((response) => {
        connection.query(
            "INSERT INTO department SET ?",
            {
                name: response.department
            },
            (err, res) => {
                if (err) throw err;
                console.log(`Success! Added ${response.department} to the database.\n`);
                begin();
            }
        );
    });
};

const addRole = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            console.log("No departments on file, please first create a department and then you can add a role.\n");
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
                choices: res.map(x => x.name),
                name: 'department'
            }
        ]).then((response) => {
            let department = res.filter(x=>x.name === response.department);
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: response.role,
                    salary: response.salary,
                    department_id: department[0].id
                },
                (err2, res2) => {
                    if (err2) throw err2;
                    console.log(`Success! Added ${response.role} to the database.\n`);
                    begin();
                }
            );
        });
    });
};

const addEmployee = () => {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            console.log("No roles on file, please first create a role and then you can add an employee.\n");
            return begin();
        };
        connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'", (err2, res2) => {
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
                    choices: res.map(role=>role.title),
                    name: 'role'
                },
                {
                    type: 'list',
                    message: "Who is the employee's manager?",
                    choices: [...res2.map(employee=> `${employee.first_name} ${employee.last_name}`), "This employee doesn't have a manager"],
                    name: 'manager'
                }
            ]).then((response) => {
                let roleID; 
                let managerID;
                res.forEach(role => {
                    if (role.title === response.role) {
                        roleID = role.id;
                    };
                });
                if (response.manager !== "This employee doesn't have a manager") {
                    res2.forEach(employee => {
                        if (`${employee.first_name} ${employee.last_name}` === response.manager) {
                            managerID = employee.id;
                        };
                    });
                };
                connection.query(
                    "INSERT INTO employee SET ?",
                    {
                        first_name: response.firstName,
                        last_name: response.lastName,
                        role_id: roleID,
                        manager_id: managerID
                    },
                    (err3, res3) => {
                        if (err3) throw err3;
                        console.log(`Success! Added ${response.firstName} ${response.lastName} to the database.\n`);
                        begin();
                    }
                );
            });
        });
    });
};

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

const renameDepartment = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "Which department would you like to rename?",
                choices: res.map(department => department.name),
                name: 'department'
            },
            {
                type: 'input',
                message: "What would you like to rename this department?",
                name: 'newName'
            }
        ]).then((response) => {
            let departmentID;
            res.forEach(department => {
                if (department.name === response.department) {
                    departmentID = department.id;
                };
            });
            connection.query(
                "UPDATE department SET ? WHERE ?",
                [
                    {
                        name: response.newName
                    },
                    {
                        id: departmentID
                    }
                ],
                (err2, res2) => {
                    if (err2) throw err2;
                    console.log(`Success! Renamed ${response.department} to ${response.newName} in the database.\n`);
                    begin();
                }
            );
        });
    });
};

const updateRole = () => {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "What role would you like to update?",
                choices: res.map(role=>role.title),
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
            res.forEach(role => {
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
    });
};

const renameRole = roleID => {
    inquirer.prompt([
        {
            type: 'input',
            message: "What would you like to rename this role?",
            name: "newName"
        }
    ]).then((response) => {
        connection.query(
            "UPDATE role SET ? WHERE ?",
            [
                {
                    title: response.newName
                },
                {
                    id: roleID.id
                }
            ],
            (err, res) => {
                if (err) throw err;
                console.log(`Success! Renamed ${roleID.title} to ${response.newName} in the database.\n`);
                begin();
            }
        );
    });
};

const updateSalary = roleID => {
    console.log(`The current salary for this role is $${roleID.salary}.\n`);
    inquirer.prompt([
        {
            type: 'input',
            message: "What is the updated salary for this role?",
            name: 'newSalary'
        }
    ]).then((response) => {
        connection.query(
            "UPDATE role SET ? WHERE ?",
            [
                {
                    salary: response.newSalary
                },
                {
                    id: roleID.id
                }
            ],
            (err, res) => {
                if (err) throw err;
                console.log(`Success! Updated the salary of ${roleID.title} in the database to $${response.newSalary}.\n`);
                begin();
            }
        );
    });
};

const switchDepartment = roleID => {
    connection.query("SELECT * FROM department", (err, res) => {
        let current;
        res.forEach(department => {
            if (department.id === roleID.department_id) {
                current = department.name;
            };
        });
        console.log(`This role is currently assigned to the ${current} department.\n`);
        inquirer.prompt([
            {
                type: 'list',
                message: "What department would you like to reassign this role to?",
                choices: res.map(department => department.name),
                name: 'newDepartment'
            }
        ]).then((response) => {
            let newID;
            res.forEach(department => {
                if (department.name === response.newDepartment) {
                    newID = department.id;
                };
            });
            if (newID === roleID.id) {
                console.log(`${roleID.title} is already assigned to ${response.newDepartment}.\n`);
                begin();
            } else {
                connection.query(
                    "UPDATE role SET ? WHERE ?",
                    [
                        {
                            department_id: newID
                        },
                        {
                            id: roleID.id
                        }
                    ],
                    (err2, res2) => {
                        if (err2) throw err2;
                        console.log(`Success! Reassigned ${roleID.title} to the ${response.newDepartment} department.\n`);
                        begin();
                    }
                );
            };
        });
    });
};

const updateEmployee = () => {
    connection.query("SELECT * FROM employee", (err, res) => {
        inquirer.prompt([
            {
                type: 'list',
                message: "Which employee's information would you like to update?",
                choices: res.map(employee=>`${employee.first_name} ${employee.last_name}`),
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
            res.forEach(employee => {
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
    ]).then((response) => {
        connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
                {
                    first_name: response.firstName,
                    last_name: response.lastName
                },
                {
                    id: employeeID.id
                }
            ],
            (err, res) => {
                if (err) throw err;
                console.log(`Success! Updated ${response.firstName} ${response.lastName}'s name in the database.\n`);
                begin();
            }
        );
    });
};

const employeeRole = employeeID => {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        let current;
        res.forEach(role => {
            if (role.id === employeeID.role_id) {
                current = role.title;
            };
        });
        console.log(`${employeeID.first_name} ${employeeID.last_name}'s current role is ${current}.\n`);
        inquirer.prompt([
            {
                type: 'list',
                message: `What role would you like to reassign ${employeeID.first_name} ${employeeID.last_name} to?`,
                choices: res.map(role=>role.title),
                name: 'newRole'
            }
        ]).then((response) => {
            let newRoleID;
            res.forEach(role => {
                if (role.title === response.newRole) {
                    newRoleID = role.id;
                };
            });
            connection.query(
                'UPDATE employee SET ? WHERE ?',
                [
                    {
                        role_id: newRoleID
                    },
                    {
                        id: employeeID.id
                    }
                ],
                (err2, res2) => {
                    if (err2) throw err2;
                    console.log(`Success! ${employeeID.first_name} ${employeeID.last_name} has been assigned the role of ${response.newRole}.\n`);
                    begin();
                }
            );
        });
    });
};

const employeeManager = employeeID => {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'", (err, res) => {
        let current;
        res.forEach(manager => {
            if (manager.id === employeeID.manager_id) {
                current = `${manager.first_name} ${manager.last_name}`;
            };
        });
        console.log(`${employeeID.first_name} ${employeeID.last_name}'s current manager is ${current}.\n`);
        inquirer.prompt([
            {
                type: "list",
                message: `Which manager would you like to reassign ${employeeID.first_name} ${employeeID.last_name} to?`,
                choices: [...res.map(manager=>`${manager.first_name} ${manager.last_name}`), "This employee doesn't have a manager"],
                name: 'newManager'
            }
        ]).then((response) => {
            let newManagerID;
            res.forEach(manager => {
                if (`${manager.first_name} ${manager.last_name}` === response.newManager) {
                    newManagerID = manager;
                };
            });
            connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                    {
                        manager_id: newManagerID.id
                    },
                    {
                        id: employeeID.id
                    }
                ],
                (err2, res2) => {
                    if (err2) throw err2;
                    console.log(`Success! Assigned ${newManagerID.first_name} ${newManagerID.last_name} as ${employeeID.first_name} ${employeeID.last_name}'s manager.\n`);
                    begin();
                }
            );
        });
    });
};

const viewInfo = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: "What information would you like to see?",
            choices: ["Departments", "Roles", "Employees"],
            name: 'toView'
        }
    ]).then((response) => {
        switch (response.toView) {
            case "Departments":
                viewDepartments();
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

const viewDepartments = () => {
    connection.query("SELECT name FROM department", (err, res) => {
        console.table(res);
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
    ]).then((response) => {
        if (response.choice === "Specific department roles") {
            departmentRoles();
        } else {
            connection.query("SELECT title, salary FROM role", (err, res) => {
                if (err) throw err;
                console.table(res);
                begin();
            });
        };
    });
};

const departmentRoles = () => {
    connection.query("SELECT name FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "Which department's roles would you like to see?",
                choices: res,
                name: 'departmentChoice'
            }
        ]).then((response) => {
            connection.query(
                `SELECT role.title, role.salary FROM role LEFT JOIN department ON department.id = role.department_id WHERE department.name = ?`,
                response.departmentChoice,
                (err2, res2) => {
                    if (err2) throw err2;
                    console.table(res2);
                    begin();                
                }
            );
        });
    });
};

const employeeTable = (employeeArr) => {
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        let employeeTable = [];
        employeeArr.forEach(employee => {
            let empObj = {};
            empObj["ID #"] = employee.id;
            empObj.Name = `${employee.first_name} ${employee.last_name}`;
            empObj["Job Title"] = employee.title;
            empObj.Department = employee.name;
            empObj.Salary = employee.salary;
            empObj.Manager = "This employee has no manager";
            res.forEach(emp => {
                if (employee.manager_id === emp.id) {
                    empObj.Manager = `${emp.first_name} ${emp.last_name}`;
                };
            });
            employeeTable.push(empObj);
        });
        console.table(employeeTable);
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
    ]).then((response) => {
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
                connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id", (err, res) => {
                    if (err) throw err;
                    employeeTable(res);
                });
        };       
    });
};

const employeeByDepartment = () => {
    connection.query("SELECT name FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "Which department's employees would you like to see?",
                choices: res,
                name: 'departmentChoice'
            }
        ]).then((response) => {
            connection.query(
                "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = ?",
                response.departmentChoice,
                (err2, res2) => {
                    if (err2) throw err2;
                    employeeTable(res2);
                });
        });
    });
};

const employeeByRole = () => {
    connection.query("SELECT title FROM role", (err, res) => {
        console.log(res);
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "View all employees from which role?",
                choices: res.map(role=>role.title),
                name: 'roleChoice'
            }
        ]).then((response) => {
            connection.query(
                "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.title = ?",
                response.roleChoice,
                (err2, res2) => {
                    if (err2) throw err2;
                    employeeTable(res2);
                }
            );
        });
    });
};

const employeeByManager = () => {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                message: "Which manager's employees would you like to see?",
                choices: res.map(manager => `${manager.first_name} ${manager.last_name}`),
                name: 'managerChoice'
            }
        ]).then((response) => {
            let managerID;
            res.forEach(manager => {
                if (`${manager.first_name} ${manager.last_name}` === response.managerChoice) {
                    managerID = manager.id;
                };
            });
            connection.query(
                "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE employee.manager_id = ?",
                managerID,
                (err2, res2) => {
                    if (err2) throw err2;
                    employeeTable(res2);
                }
            );
        });
    });
};

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