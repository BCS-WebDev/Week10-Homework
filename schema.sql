DROP DATABASE IF EXISTS tracker_db;
CREATE database tracker_db;

USE tracker_DB;

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    department VARCHAR(30) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,4) NOT NULL,
    department_id INT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NULL,
    manager_id INT NULL,
    PRIMARY KEY (id)
);

-- Seed--

-- INSERT INTO Departments (department)
-- VALUES 
-- 	("Administration"),
--     ("Human Resources"),
--     ("Development"),
--     ("Business"),
--     ("Management")

-- INSERT INTO Roles (title, salary, department_id)
-- VALUES 
-- 	("Manager", 120000.00, 5),
--     ("Developer", 100000.00, 3),
--     ("HR Specialist", 80000.00, 2),
--     ("Accounting", 70000.00, 1),
--     ("Lawyer", 90000.00, 4)

-- INSERT INTO Employees (first_name, last_name, role_id, manager_id)
-- VALUES 
-- 	("Keanu", "Reeves", 1, NULL),
--     ("Tom", "Hanks", 3, 1),
--     ("Charlize", "Theron", 5, 1),
--     ("Bill", "Murray", 4, 1),
--     ("Gal", "Gadot", 2, 1)

-- SELECT 
--     employee.id AS "ID", 
--     employee.first_name AS "First Name", 
--     employee.last_name AS "Last Name",
--     role.title AS "Title",
--     department.department AS "Department",
--     role.salary AS "Salary",
--     CONCAT(manager.first_name, " ", manager.last_name) AS "Manager"
-- FROM
--     Employees employee
-- LEFT JOIN Employees manager
--     ON employee.manager_id = manager.id
-- LEFT JOIN Roles role
--     ON employee.role_id = role.id
-- LEFT JOIN Departments department
--     ON role.department_id = department.id

SELECT * FROM departments;
SELECT * FROM roles;
SELECT * FROM employees;