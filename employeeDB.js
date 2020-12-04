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
            choices: ["Add employee information", "Update employee information", "View employee information", "Delete employee information"],
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