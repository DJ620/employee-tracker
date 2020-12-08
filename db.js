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
connection.query = util.promisify(connection.query);
class DB {
  // Keeping a reference to the connection on the class in case we need it later
  constructor(connection) {
    this.connection = connection;
  };
    tableInfo(table) {
        return this.connection.query(`SELECT * FROM ${table}`);
    };
    customInfo(column, table) {
        return this.connection.query(`SELECT ${column} FROM ${table}`);
    };
    viewManagers() {
        return this.connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE role.title REGEXP 'Manager?'");
    };
    addInfo(table, info) {
        return this.connection.query(
            `INSERT INTO ${table} SET ?`, info);
    };
    updateInfo(table, params) {
        return this.connection.query(`UPDATE ${table} SET ? WHERE ?`, params);
    };
};
module.exports = new DB(connection);
