const mysql = require("mysql");
const util = require("util");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Hersh6624!",
    database: "employeeDB"
});

connection.connect((err) => {
    if (err) throw err;
});

// Promisifying the query allows me to keep this code in a seperate file and still run asynchronously
connection.query = util.promisify(connection.query);

// A class to hold useful methods
class DB {
  // Keeping a reference to the connection on the class in case we need it later
  constructor(connection) {
    this.connection = connection;
  };
    // Returns all data from any table passed in
    tableInfo(table) {
        return this.connection.query(`SELECT * FROM ${table}`);
    };
    // Returns all employee's who's role title includes the word "Manager"
    viewManagers() {
        return this.connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'");
    };
    // Returns all roles for any department that gets passed in
    rolesByDepartment(department) {
        return this.connection.query("SELECT role.title FROM role LEFT JOIN department ON department.id = role.department_id WHERE department.name = ?", department);
    };
    // Returns all employee information from the three tables
    // The two parameters are optional and have a default value of 'null' in case they are not needed
    innerJoin(param = null, info = null) {
        let statement = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id";
        // If the parameters are passed in, a 'WHERE' statement is added to the query to get specific sets of employees
        if (param) {
            statement += ` WHERE ${param} = ?`;
        };
        return connection.query(statement, info);
    };
    // Adds data to any table passed in
    addInfo(table, info) {
        return this.connection.query(
            `INSERT INTO ${table} SET ?`, info);
    };
    // Updates data for any table that gets passed in
    updateInfo(table, params) {
        return this.connection.query(`UPDATE ${table} SET ? WHERE ?`, params);
    };
    // Deletes data from any table that gets passed in
    deleteInfo(table, info) {
        return this.connection.query(`DELETE FROM ${table} WHERE ?`, info);
    };
    // Returns the first and last name as a single string
    concatName(array) {
        return `${array.first_name} ${array.last_name}`;
    };

    async employeeTable(employeeArr)  {
        const emps = await this.tableInfo("employee");
        let table = [];
        employeeArr.forEach(emp => {
            let empObj = {};
            empObj["ID #"] = emp.id;
            empObj.Name = `${this.concatName(emp)}`;
            empObj["Job Title"] = emp.title;
            empObj.Department = emp.name;
            empObj.Salary = "$" + emp.salary;
            empObj.Manager = "This employee has no manager";
            emps.forEach(employee => {
                if (emp.manager_id === employee.id) {
                    empObj.Manager = `${this.concatName(employee)}`;
                };
            });
            table.push(empObj);
        });
        console.log("");
        console.table(table);
    };
};
module.exports = new DB(connection);
