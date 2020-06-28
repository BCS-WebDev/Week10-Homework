
-- Seeds --

USE tracker_DB;

INSERT INTO Departments (department)
VALUES 
	("Administration"),
    ("Human Resources"),
    ("Development"),
    ("Business"),
    ("Management")

INSERT INTO Roles (title, salary, department_id)
VALUES 
	("Manager", 120000.00, 5),
    ("Developer", 100000.00, 3),
    ("HR Specialist", 80000.00, 2),
    ("Accounting", 70000.00, 1),
    ("Lawyer", 90000.00, 4)

INSERT INTO Employees (first_name, last_name, role_id, manager_id)
VALUES 
	("Keanu", "Reeves", 1, NULL),
    ("Tom", "Hanks", 3, 1),
    ("Charlize", "Theron", 5, 1),
    ("Bill", "Murray", 4, 1),
    ("Gal", "Gadot", 2, 1)