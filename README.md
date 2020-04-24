## INFSCI 2710 - Database Management Project

### Introduction
This project simulates a basic online market place demonstrating the interactions
between constomers and employees. It is a web service built using NodeJS, MySQL,
and front-end technologies (HTML, Jquery, etc). 

### The Team
- Deokwon Song (deokwons9004dev@gmail.com)
- Dominick Caimano (doc23@pitt.edu)
- Nishchal Nigam (nin34@pitt.edu)

### Development Environment
The project was developed with AWS Cloud9 IDE, which is a cloud based real-time 
collaboration IDE running on an AWS EC2 virtual machine with Ubuntu pre-installed.

### Pre-Setup
MySQL has a mode called __ONLY_FULL_GROUP_BY__ which doesn't allow nonaggregated 
columns that are not named in the GROUP BY caluse to be selected. Since we need 
this feature to work for our aggregate features, I permanently disabled this 
feature from our current installation of MySQL.

Here are the steps I took to disable it (so we can re-enable when needed).

1. First identify that that __ONLY_FULL_GROUP_BY__ SQL mode is enabled in our MySQL installation.

    ```sql
    mysql> SELECT @@GLOBAL.sql_mode;
    ```

    | @@GLOBAL.sql_mode |
    | ------------|
    | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION |

2. Then copy all of the modes from the resulting table except __ONLY_FULL_GROUP_BY__.

    ```
    STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
    ```
3. Then I created a MySQL configuration file at (__/etc/mysql/conf.d/disable_strict_mode.cnf__).
4. And the pasted the remaining options above into the file as such:

    ```
    [mysqld]
    sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
    ```
5. And a simple MySQL server service restart is what solved the problem.
    ```bash
    $ sudo service mysql restart
    ```

### Database
You can check the SQL file we used for the project here:

```
Server/Modules/Database/database.sql
```

Other database query testing SQL files and query related JS files are located here:

```
Documents/Aggregation.sql
Documents/Operations.sql
Server/Modules/Application/QuerySQL.js
Server/Modules/Application/DatabaseTools.js
```

### Testing
You can download the zip file of this repository, and run the server with NodeJS.

```bash
$ cd Server
$ npm install
$ node main.js
```

When testing locally, make sure to have both NodeJS and MySQL installed.

### More Information
We have documented a lot of our internal implementation details in a final report, 
which you can find here:

```
Documents/Final_Report_2710.pdf
```

