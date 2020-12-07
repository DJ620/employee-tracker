const mysql = require("mysql");
const inquirer = require("inquirer");

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
            choices: ["Add employee information", "Update employee information", "View employee information", "Delete employee information", "I'm all done"],
            name: "choice"
        }
    ]).then((response) => {
            switch (response.choice) {
                case "Add employee information":
                    addInfo();
                    break;
                case "Update employee information":
                    updateInfo();
                    break;
                case "View employee information":
                    //viewInfo();
                    break;
                case "Delete employee information":
                    //deleteInfo();
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
            choices: ["Rename Department", "Update Role", "Update Employee"],
            name: 'toUpdate'
        }
    ]).then((response) => {
        switch (response.toUpdate) {
            case "Rename Department":
                renameDepartment();
                break;
            case "Update Role":
                updateRole();
                break;
            case "Update Employee":
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