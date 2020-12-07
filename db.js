const mysql = require("mysql");

class DB {
    constructor(connection) {
        this.connection = connection;
    }
    test() {
        return "Test";
    }
    departmentInfo() {
        return this.connection.query(
            "SELECT * FROM department",
            (err, res) => {
                if (err) throw err;
            }
        );
    };

    roleInfo() {
        connection.query(
            "SELECT * FROM role",
            (err, res) => {
                if (err) throw err;
                return res;
            }
        );
    };

    employeeInfo() {
        connection.query(
            "SELECT * FROM employee",
            (err, res) => {
                if (err) throw err;
                return res;
            }
        );
    };
};

module.exports = DB;
