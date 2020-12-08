DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department(
	id INTEGER(11) AUTO_INCREMENT NOT NULL,
	name VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE role(
	id INTEGER(11) AUTO_INCREMENT NOT NULL,
	title VARCHAR(30) NOT NULL,
	salary DECIMAL(11) NOT NULL,
	department_id INTEGER(11) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE employee(
	id INTEGER(11) AUTO_INCREMENT NOT NULL,
	first_name VARCHAR(30) NOT NULL,
	last_name VARCHAR(30) NOT NULL,
	role_id INTEGER(11) NOT NULL,
	manager_id INTEGER(11),
	PRIMARY KEY (id)
);
