--	Employee Browsing Employees must be able to search the database for particular items based on various attributes and must also be able to do browsing (i.e., less focused searching). Examples:


--	Search for cases by status and timeframe
select CAS.summary,CAS.description from Cases CAS where CAS.status = 'UNRESOLVED' and CAS.opentime >= DATE('2020-04-21 00:00:00') and CAS.closetime >= DATE('2020-04-29 00:00:00');


--	Search for a customer and view products the customer has purchased

select C.name,PD.name from Customers C inner join Purchases PUR on C.CUS_ID = PUR.CUS_ID inner join Products PD on PD.PD_ID = PUR.PD_ID where C.name = 'David';

--	Search for common resolutions by product
select  PD.Name,CR.name,CR.guide from CommonResolutions CR inner join Products PD on PD.PD_ID = CR.PD_ID  where PD.name = 'Sony PS5';




