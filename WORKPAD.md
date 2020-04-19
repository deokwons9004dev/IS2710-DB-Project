## INFSCI 2710 - WORKPAD

In the abscess of a final exam, the homework and projects will be weighed in more than usual, so I know it might be some extra work, here are a list of features that I strongly feel like we should implements:

* ___Note: Since we are working with a free-tier version of Coud9, our actaul public URL will be something ugly like so:___
___https://d373lap04ubgnu.cloudfront.net/c9-5c89b22bf5a1-ide/@c9/ide/plugins/c9.ide.preview.markdown/client/markdown.html?host=https://us-east-2.console.aws.amazon.com&id=markdown1___
* For the sake of simplicity, we will assume that our public URL will just be http://project.com for now.
* If user only enters http://project.com, then user will be directed to http://project.com/customer.

### Functionalities for the Customer (GET Requests)

- **GET http://project.com/customer - Main website for customers.**
    - A top navbar that has a __"Products I bought"__ button, which leads to another page that shows all the products that the customer boutht.
    - Some form of list of items that the customer can by (like amamzon),
      - This can be pre-filled by hand, or have a admin feature that adds products.
    - (Optional) A search bar to find products with auto-complete.
        - Can be achieved easily via "SELECT * FROM Products WHERE input LIKE '%input%'".

- **GET http://project.com/product/%PD_ID% - Selected product page.**
    - Shows basic info about the product
        - Product Name
        - Product Description
        - Name, Email, Job title of the Salesperson selling this project.
            - Mapping from product to Salesperson could be arbitrary or pre-defined by us (either works fine).
        - (Optional) Price
        - (Optional) Amazon-like review system
    - A __"BUY"__ button that purchases the product
        - Check if Customer's income is enought for purchase.
            - Reject purchase if income in insufficent.
        
- **GET http://project.com/customer/myorders - A page that lists all the products the customer bought.**
    - Default sorting based on purchase date.
    - For each row of purchased product, there should be a button that says the following (BUT NOT BOTH):
        - __"Crete New Case"__
            - This is when there are no cases opened by the customer.
        - __"View My Case"__
            - This is when a customer has already opened a case and can see the progress of the case.
    - This should act as a prelimiary defense against non-purchased customers trying to start a case on the product.
    - But this should also be chceked within the SQL file using the CHECK constraint.

- **GET http://project.com/customer/createcase/%PD_ID% - A "Create New Case" page that allows a product-purchased customer to start a case against the product.**
    - The page will have a form like-structure (label and value), with a "Submit" button at the very button.
        - __summary__: A basic title describing the issue.
            - ex) ``` Summary: My router can't connect to 5GHz networks.```
        - __description__: A detailed text providing more insight to the problem/issue thats occurring.
            - ex) ``` Description: I bought this router because it said it can connect to 5GHz networks and blah...```
        - __Customer__: The __name__ from the __Customers__ table.
            - ex) ``` Customer: John Smith```
        - __Product__: The __name__ from the __Products__ table.
            - ex) ``` Product: TP-LINK_N20P Router```
        - NOTE: For __Customers.CUS_ID__, we can save them as cookies so that 
                we don't have to reveal the actual Primary Keys of the customer 
                and product in the HTML form.
        - NOTE: Once a "logged in" customer arrives at this page, we know the 
                customer's __CUS_ID__ (via cookie) and the product's __PD_ID__ (via request params), so we can pre-fill 
                the customer and product name value using the __CUS_ID__ and __PD_ID__ 
                and make the input field disabled so that the customer cannot change the value of it.
        - __Submit__ button will be disabled (unclickable) until the following requirement has met:
            - The summary has been filled in.
            - The description has been filled in.
    - Once the __Submit__ has been clicked, the DB will insert a new row into the Cases table.
        - The __Cases.opentime__ will be the timestamp of the case upload.
        - The __Cases.EMP_ID__ will be NULL until an employee decided to assign him/herself to the case.
        - The __Cases.COMRES_ID__ will be NULL until either an employee or another 
          customer links a common resolution to that case, if its a question or 
          issue that was already resolved in the past. In that case, the moment 
          a __Cases.COMRES_ID__ of a case has been updated to a foreign key value, 
          the case will automatically close with the __Cases.closetime__ being the 
          moment someone updated the __Cases.COMRES_ID__.

- **GET http://project.com/customer/cases/%CAS_ID% - A "View My Case" page that 
  allows a product-purchased customer to see the status and comments made by 
  employees or customers of that case.**
    - The page will look similar to a chat page where the employee and customer 
      send and receive comments from each other.
    - The default view will be sorted by __CaseComments.ctime__, with the latest 
      comment appearing on the bottom of the page.
    - Unlike creating a new case, __a customer can visit other product case pages 
      even if the customer did not purchase the product.__ However, the customer 
      cannot post a comment if the customer did not buy the product in the case.
    - If an empployee decides to close the case, depending on the reason it closed, 
      a final comment will be auto-generated.
      - If __SOLVED__: __"Employee Nancy has closed this case as solved."__
      - If __UNRESOLVED__: __"Employee Nancy has closed this case as unresolved. 
        Please review the case comments and also see if there are any common resolutions 
        that have already solved the issue regarding  your product."__
      - If __DUPLICATE__: __"Employee Nancy has closed this case as this is a duplicate issue that has already been discussed in http://project/customer/cases/69420"__
    - If an employee or another customer (who must have also bought the product) 
      decides to close the case by referring to a common resolution, a final comment 
      will be auto-generated with the following: __"Employee (or Customer) XXXX has
      closed this case with a common resolution for this issue which you can find 
      here: http://project.com/comres/%COMRES_ID%".__


<!---
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
-->