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
    console.log("Welcome to the Employee Database.");
    inquirer.prompt([
        {
            type: 'list',
            message: "How may I assist you?",
            choices: ["Add employee information", "Update employee information", "View employee information", "Delete employee information"],
            name: "choice"
        }
    ]).then((response) => {

    })
}