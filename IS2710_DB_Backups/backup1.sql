-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: localhost    Database: IS2710DB
-- ------------------------------------------------------
-- Server version	5.7.29-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CaseComments`
--

DROP TABLE IF EXISTS `CaseComments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CaseComments` (
  `CMT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `ctime` datetime NOT NULL,
  `ctext` text NOT NULL,
  `CAS_ID` int(11) NOT NULL,
  `EMP_ID` int(11) DEFAULT NULL,
  `CUS_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`CMT_ID`),
  KEY `CAS_ID` (`CAS_ID`),
  KEY `EMP_ID` (`EMP_ID`),
  KEY `CUS_ID` (`CUS_ID`),
  CONSTRAINT `CaseComments_ibfk_1` FOREIGN KEY (`CAS_ID`) REFERENCES `Cases` (`CAS_ID`),
  CONSTRAINT `CaseComments_ibfk_2` FOREIGN KEY (`EMP_ID`) REFERENCES `Employee` (`EMP_ID`),
  CONSTRAINT `CaseComments_ibfk_3` FOREIGN KEY (`CUS_ID`) REFERENCES `Customers` (`CUS_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CaseComments`
--

LOCK TABLES `CaseComments` WRITE;
/*!40000 ALTER TABLE `CaseComments` DISABLE KEYS */;
INSERT INTO `CaseComments` VALUES (1,'2020-04-21 08:26:47','told customer we could lookup reciept with credit card number and to bring it in',1,6,NULL);
/*!40000 ALTER TABLE `CaseComments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cases`
--

DROP TABLE IF EXISTS `Cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Cases` (
  `CAS_ID` int(11) NOT NULL AUTO_INCREMENT,
  `summary` text NOT NULL,
  `description` text NOT NULL,
  `opentime` datetime NOT NULL,
  `closetime` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `PUR_ID` int(11) NOT NULL,
  `EMP_ID` int(11) DEFAULT NULL,
  `COMRES_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`CAS_ID`),
  KEY `PUR_ID` (`PUR_ID`),
  KEY `EMP_ID` (`EMP_ID`),
  KEY `COMRES_ID` (`COMRES_ID`),
  CONSTRAINT `Cases_ibfk_1` FOREIGN KEY (`PUR_ID`) REFERENCES `Purchases` (`PUR_ID`),
  CONSTRAINT `Cases_ibfk_2` FOREIGN KEY (`EMP_ID`) REFERENCES `Employee` (`EMP_ID`),
  CONSTRAINT `Cases_ibfk_3` FOREIGN KEY (`COMRES_ID`) REFERENCES `CommonResolutions` (`COMRES_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cases`
--

LOCK TABLES `Cases` WRITE;
/*!40000 ALTER TABLE `Cases` DISABLE KEYS */;
INSERT INTO `Cases` VALUES (1,'cannnot lookup reciept','No Receipt','2020-04-21 08:21:55',NULL,'UNRESOLVED',1,NULL,NULL),(2,'dead ','phone will not power on','2020-04-21 08:21:55',NULL,'UNRESOLVED',2,NULL,NULL),(3,'test','phone will not power on','2020-04-21 12:15:55',NULL,'SOLVED',3,5,NULL);
/*!40000 ALTER TABLE `Cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CommonResolutions`
--

DROP TABLE IF EXISTS `CommonResolutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CommonResolutions` (
  `COMRES_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `guide` text NOT NULL,
  `views` int(11) NOT NULL,
  `PD_ID` int(11) NOT NULL,
  `CUS_ID` int(11) DEFAULT NULL,
  `EMP_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`COMRES_ID`),
  KEY `PD_ID` (`PD_ID`),
  KEY `CUS_ID` (`CUS_ID`),
  KEY `EMP_ID` (`EMP_ID`),
  CONSTRAINT `CommonResolutions_ibfk_1` FOREIGN KEY (`PD_ID`) REFERENCES `Products` (`PD_ID`),
  CONSTRAINT `CommonResolutions_ibfk_2` FOREIGN KEY (`CUS_ID`) REFERENCES `Customers` (`CUS_ID`),
  CONSTRAINT `CommonResolutions_ibfk_3` FOREIGN KEY (`EMP_ID`) REFERENCES `Employee` (`EMP_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CommonResolutions`
--

LOCK TABLES `CommonResolutions` WRITE;
/*!40000 ALTER TABLE `CommonResolutions` DISABLE KEYS */;
INSERT INTO `CommonResolutions` VALUES (1,'No Internet ','Try turning it on and off again! ',0,1,NULL,1),(2,'Disc Stuck ','Use a paperclip in the emergency eject hole next to the drive opening ',0,2,NULL,5);
/*!40000 ALTER TABLE `CommonResolutions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customers`
--

DROP TABLE IF EXISTS `Customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Customers` (
  `CUS_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `email` varchar(500) NOT NULL,
  `pstext` varchar(500) NOT NULL,
  `address` varchar(500) NOT NULL,
  `income` int(11) NOT NULL,
  PRIMARY KEY (`CUS_ID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customers`
--

LOCK TABLES `Customers` WRITE;
/*!40000 ALTER TABLE `Customers` DISABLE KEYS */;
INSERT INTO `Customers` VALUES (1,'David','deokwons9004@gmail.com','pass1234','home',3),(2,'Jason','deokwons9004dev@gmail.com','pass1234','home',100),(3,'Mike','mike123@gmail.com','pass1234','work',500),(4,'Jake','jake123@gmail.com','pass1234','work',10),(5,'Alice','alice123@gmail.com','pass1234','work',402);
/*!40000 ALTER TABLE `Customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employee`
--

DROP TABLE IF EXISTS `Employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Employee` (
  `EMP_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `address` varchar(500) NOT NULL,
  `phone` varchar(500) NOT NULL,
  `email` varchar(500) NOT NULL,
  `pstext` varchar(500) NOT NULL,
  PRIMARY KEY (`EMP_ID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employee`
--

LOCK TABLES `Employee` WRITE;
/*!40000 ALTER TABLE `Employee` DISABLE KEYS */;
INSERT INTO `Employee` VALUES (1,'Nancy Miller','home address','412-111-2222','nancy123@gmail.com','pass1234'),(2,'John Dave','12 Melwood St','7861112233','john@pitt.edu','password'),(5,'James Hunt','122 Melwood St','7861112243','jhunt@pitt.edu','password'),(6,'Steve Martin','122 Highland Ave','7861112249','stmartin@pitt.edu','password');
/*!40000 ALTER TABLE `Employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Products` (
  `PD_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `price` int(11) NOT NULL,
  PRIMARY KEY (`PD_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,'Router','5GHz Router',99),(2,'Sony PS5','Gaming Console',499),(3,'GoPro Max','360 Video camera',499),(4,'Yamaha DX7','Piano from Yamaha',550),(5,'Canon PowerShot','DSLR Camera',775),(6,'Samsung S20','5G Phone from Samsung',999),(7,'Samsung S20+','5G Phone from Samsung',1299),(8,'HP Printer','Colored lasor Printer',299),(9,'GoPro Hero 8','Action Camera',399);
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Purchases`
--

DROP TABLE IF EXISTS `Purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Purchases` (
  `PUR_ID` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_date` datetime NOT NULL,
  `CUS_ID` int(11) NOT NULL,
  `SP_ID` int(11) NOT NULL,
  `PD_ID` int(11) NOT NULL,
  PRIMARY KEY (`PUR_ID`),
  KEY `CUS_ID` (`CUS_ID`),
  KEY `SP_ID` (`SP_ID`),
  KEY `PD_ID` (`PD_ID`),
  CONSTRAINT `Purchases_ibfk_1` FOREIGN KEY (`CUS_ID`) REFERENCES `Customers` (`CUS_ID`),
  CONSTRAINT `Purchases_ibfk_2` FOREIGN KEY (`SP_ID`) REFERENCES `SalesPersons` (`SP_ID`),
  CONSTRAINT `Purchases_ibfk_3` FOREIGN KEY (`PD_ID`) REFERENCES `Products` (`PD_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Purchases`
--

LOCK TABLES `Purchases` WRITE;
/*!40000 ALTER TABLE `Purchases` DISABLE KEYS */;
INSERT INTO `Purchases` VALUES (1,'2020-04-20 05:30:21',1,1,1),(2,'2020-03-15 05:30:21',1,2,6),(3,'2020-03-15 05:30:21',3,4,6),(4,'2020-04-23 15:27:18',1,3,1),(5,'2020-04-23 15:45:18',1,4,1),(6,'2020-04-23 15:47:37',1,5,1),(7,'2020-04-23 15:50:08',5,2,1),(8,'2020-04-23 15:50:10',5,4,2);
/*!40000 ALTER TABLE `Purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SalesPersons`
--

DROP TABLE IF EXISTS `SalesPersons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SalesPersons` (
  `SP_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `address` varchar(500) NOT NULL,
  `email` varchar(500) NOT NULL,
  `job` varchar(500) NOT NULL,
  PRIMARY KEY (`SP_ID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SalesPersons`
--

LOCK TABLES `SalesPersons` WRITE;
/*!40000 ALTER TABLE `SalesPersons` DISABLE KEYS */;
INSERT INTO `SalesPersons` VALUES (1,'James Smith','home address','smith123@gmail.com','SalesTeam'),(2,'John Hayden','556 Forbes Ave','jh@gmail.com','SalesTeam 2'),(3,'Isaac Tan','23 9th St','isaac@gmail.com','SalesTeam 2'),(4,'Jane Doe','133 Negley Ave','janedoe@gmail.com','SalesTeam 3'),(5,'Clint Westwood','556 Santa Monica Boulevard','cwest@gmail.com','SalesTeam 2'),(6,'Steve Harrington','115 Meyran Ave','stevehar@gmail.com','SalesTeam 3');
/*!40000 ALTER TABLE `SalesPersons` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-23 18:33:32
