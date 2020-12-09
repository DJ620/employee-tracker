INSERT INTO department (name)
VALUES ("Gaming");

INSERT INTO department (name)
VALUES ("Web Development");

INSERT INTO department (name)
VALUES ("Human Resources");

INSERT INTO department (name)
VALUES ("Accounting");

INSERT INTO role (title, salary, department_id)
VALUES ("Gaming Manager", 100000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Game Developer", 75000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Web Development Manager", 150000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Senior Web Developer", 95000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Junior Web Developer", 60000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Human Resources Manager", 120000, 3);

INSERT INTO role (title, salary, department_id)
VALUES ("Hiring Coordinator", 85000, 3);

INSERT INTO role (title, salary, department_id)
VALUES ("Accounting Manager", 150000, 4);

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Accountant", 105000, 4);

INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 75000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("James", "Cluster", 1, null);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Walbolt", 2, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Abby", "Ryan", 3, null);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Terrence", "McNeil", 4, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Aubrey", "Chantelle", 5, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Julie", "Auxier", 6, null);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Katie", "Gordon", 7, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Nathan", "Hilger", 8, null);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Paul", "Raymond", 9, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Cody", "Collier", 10, 8);