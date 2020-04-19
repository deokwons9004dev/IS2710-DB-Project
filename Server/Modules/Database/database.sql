-- create database if not exists IS2710DB;
drop database if exists IS2710DB;
create database IS2710DB;
use IS2710DB;

CREATE TABLE Customers (
	CUS_ID  int          NOT NULL AUTO_INCREMENT,
	name    varchar(500) NOT NULL,
	address varchar(500) NOT NULL,
	income  int          NOT NULL,
	PRIMARY KEY (CUS_ID)
);
CREATE TABLE Products (
	PD_ID       int          NOT NULL AUTO_INCREMENT,
	name        varchar(500) NOT NULL,
	description text         NOT NULL,
	PRIMARY KEY (PD_ID)
);
-- .job: Job title of the sales person (ex. "Regional Manager" or "Intern", etc)
CREATE TABLE SalesPersons (
	SP_ID       int          NOT NULL AUTO_INCREMENT,
	name        varchar(500) NOT NULL,
	address     varchar(500) NOT NULL,
	email       varchar(500) NOT NULL,
	job         varchar(500) NOT NULL,
	PRIMARY KEY (SP_ID)
);
CREATE TABLE Employee (
	EMP_ID      int          NOT NULL AUTO_INCREMENT,
	name        varchar(500) NOT NULL,
	address     varchar(500) NOT NULL,
	phone       varchar(500) NOT NULL,
	email       varchar(500) NOT NULL,
	PRIMARY KEY (EMP_ID)
);

-- This table is to check whether a customer bought a product in order to open a case.
-- It also matches the customer with the sales person who sold the product.
-- This is useful for aggregation requirements later on.
CREATE TABLE Purchases (
	PUR_ID  int NOT NULL AUTO_INCREMENT,
	CUS_ID  int NOT NULL,
	SP_ID   int NOT NULL,
	PD_ID   int NOT NULL,
	PRIMARY KEY (PUR_ID),
	FOREIGN KEY (CUS_ID) REFERENCES Customers(CUS_ID),
	FOREIGN KEY (SP_ID) REFERENCES SalesPersons(SP_ID),
	FOREIGN KEY (PD_ID) REFERENCES Products(PD_ID)
);

-- A common resolution is likely written by an employee (or a customer) that tries to post resolutions
-- about a common problem with a specific product. In case a customer wrote it, we link this resolution to that customer.
-- .name : "How I fixed game not running on fullscreen".
-- .guide: "Go to settings, and ...."
-- .views: This might be how we filter the top asked cases.
CREATE TABLE CommonResolutions (
	COMRES_ID   int          NOT NULL AUTO_INCREMENT,
	name        varchar(500) NOT NULL,
	guide       text         NOT NULL,
	views       int          NOT NULL,
	PD_ID       int          NOT NULL,
	CUS_ID      int,
	PRIMARY KEY (COMRES_ID),
	FOREIGN KEY (PD_ID) REFERENCES Products(PD_ID),
	FOREIGN KEY (CUS_ID) REFERENCES Customers(CUS_ID)
);



-- A case is created by a customer who has purchased a product.
-- A case cannot be opened by a customer who has not bought the product.
-- An employee will first check for new cases, and assign him/herself if there is one.
-- An employee will close the case when deemed finished or solved.
-- (Optional) For a case that already has a resolution posted, an employee can
--            link this case to the resolution without commenting and closing the case immediately.
-- .summary: A basic title for the case (ex. "Wifi isn't working on my device").
-- .description: The detailed text the customer complains about.
-- .opentime: When the customer first posted the case.
-- .closetime: When the employee last closed this case.
CREATE TABLE Cases (
	CAS_ID      int      NOT NULL AUTO_INCREMENT,

	summary     text     NOT NULL,
	description text     NOT NULL,
	opentime    datetime NOT NULL,
	closetime   datetime,

	CUS_ID      int      NOT NULL,
	EMP_ID      int,
	PD_ID       int      NOT NULL,
	COMRES_ID   int,
	PRIMARY KEY (CAS_ID),
	FOREIGN KEY (CUS_ID) REFERENCES Customers(CUS_ID),
	FOREIGN KEY (EMP_ID) REFERENCES Employee(EMP_ID),
	FOREIGN KEY (PD_ID) REFERENCES Products(PD_ID),
	FOREIGN KEY (COMRES_ID) REFERENCES CommonResolutions(COMRES_ID)
);

-- Each row here is a comment an employee made about a case.
-- .ctime: Time stamp of the posted comment.
-- .ctext: Text of the comment.
CREATE TABLE CaseComments (
	CMT_ID      int       NOT NULL AUTO_INCREMENT,
	ctime       datetime  NOT NULL,
	ctext       text      NOT NULL,
	EMP_ID      int       NOT NULL,
	CAS_ID      int       NOT NULL,
	PRIMARY KEY (CMT_ID),
	FOREIGN KEY (EMP_ID) REFERENCES Employee(EMP_ID),
	FOREIGN KEY (CAS_ID) REFERENCES Cases(CAS_ID)
);
