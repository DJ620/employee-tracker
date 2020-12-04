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
                    //updateInfo();
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
                //addEmployee();
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
                console.log(`Success! Added ${response.department} to the database.`);
                begin();
            }
        );
    });
};

const addRole = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
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
                    console.log(`Success! Added ${response.role} to the database.`);
                    begin();
                }
            );
        });
    });
};