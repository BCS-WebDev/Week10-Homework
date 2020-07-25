# Employee Tracker
BootCampSpot Web Development - Week 10 Homework

![Preview](https://github.com/BCS-WebDev/Week10-Homework/blob/master/Assets/EmployeeTracker.gif)

## Notes on Content Management Systems & MySQL
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; For our Employee tracker, we will implement a CMS
, or Content Management System, which allows users access to view, add, update, or delete
information in a database via a CLI. A CMS allows for ease of use by taking care of queries
and acting as a middleman to the database. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; The database will be established in MySQL Workbench. 
Workbench allows for info to be stored and accessed in an efficient manner via a query system
written in SQL (Server Query Language). The database is also safe guarded by an authentication
system that requires credentials.

## Motive & Action
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Server queries can contain many different actions, targets,
and values. The core of the query however, will remain the same. It is for this reason that an 
ORM (Object Relational Mapping) will be used. An ORM allows for our program to not only be
modularized but also be templated so as to reduce redundant code as much as possible. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; There are some things to consider when organizing SQL
queries into templates. SQL injection can be a problem if the code is not setup properly or
over-templated to fit all similar queries. While there is a solution to drop our database if
such problems occur or to encrypt credentials, we will follow guidelines to thwart SQL 
injection, albeit without sacrificing the use of generalized templates.

## Installation
Install `node.js` and run `npm install` to install the necessary node packages.

* Installs:
    - mysql node package 
    - inquirer node package
    - console.table node package

## Usage
- Log into MySQL Workbench and run the schema & seeds in `schema.sql` & `seeds.sql` located in Assets folder.
- Open `connection.js` located in config folder and enter your MySQL connection info & credentials.
- Run `node index.js` from the Develop directory and follow the prompts.

## Questions
Contact: kevin1choi@gmail.com
