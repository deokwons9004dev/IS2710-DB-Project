## INFSCI 2710 - WORKPAD

In the abscess of a final exam, the homework and projects will be weighed in more than usual, so I know it might be some extra work, here are a list of features that I strongly feel like we should implements:

* __NOTE: This is just an abstract of the official API docmentation that I'll be creating, which will follow soon.__
* __Note: Since we are working with a free-tier version of Coud9, our actaul public URL will be something ugly like so:__
  __https://d373lap04ubgnu.cloudfront.net/c9-5c89b22bf5a1-ide/@c9/ide/plugins/c9.ide.preview.markdown/client/markdown.html?host=https://us-east-2.console.aws.amazon.com&id=markdown1__
* For the sake of simplicity, we will assume that our public URL will just be http://project.com for now.
* If user only enters http://project.com, then user will be directed to http://project.com/customer.

### How to test project server.
MySQL has a code called __ONLY_FULL_GROUP_BY__ which doesn't allow nonaggregated 
columns that are not named in the GROUP BY caluse to be selected. Since we need 
this feature to work for our aggregate features, I permanently disabled this 
feature from our current installation of MySQL.

Here are the steps I took to disable it (so we can re-enable when needed).

1. First identify that that __ONLY_FULL_GROUP_BY__ SQL mode is enabled in our MySQL installation.

    '''sql
    mysql> SELECT @@GLOBAL.sql_mode;
    '''

You'll see that currently our MySQL installation has the option enabled by default as shown below.
+------------------------------------------------------------------------------------------------------------------------+
| @@GLOBAL.sql_mode                                                                                                      |
+------------------------------------------------------------------------------------------------------------------------+
| STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION |
+------------------------------------------------------------------------------------------------------------------------+

### Functionalities for the Customer (Template HTML GET Requests)
Requests defined here will only return the static HTML page that we created with 
no actual data filled in. you must use these in conjuction with the Data GET requests 
to then actaully replace/populate the template HTML to ones with actual user data filled in.

- **GET http://project.com/ - Same as GET /customer**
- **GET http://project.com/customer - Main website for customers.**
    - A top navbar that has a __"Products I bought"__ button, which leads to another page that shows all the products that the customer boutht.
    - Some form of list of items that the customer can by (like amamzon),
      - This can be pre-filled by hand, or have a admin feature that adds products.
    - (Optional) A search bar to find products with auto-complete.
        - Can be achieved easily via "SELECT * FROM Products WHERE input LIKE '%input%'".

- **GET http://project.com/product - A general product detail page.**
  - Shows basic info about the product
      - Product Name
      - Product Description
      - Name, Email, Job title of the Salesperson selling this project.
          - Mapping from product to Salesperson could be arbitrary or pre-defined by us (either works fine).
      - Product Price
      - (Optional) Amazon-like review system
  - A __"BUY"__ button that purchases the product
      - Check if Customer's income is enought for purchase.
          - Reject purchase if income in insufficent.
  - Note: This will only send the template HTML of the product information. You 
    should also request data for the specific product using the GET request with the param attached.
    - ex) How to load a product page with the specific product information.
        1. GET http://project.com/product <-- Load the HTML page first.
        2. GET http://project.com/product/12345 <-- Retrieve data about the product.
        3. Use front-end JS (Jquery, etc) to replace the template HTML with the data provided.
        
- **GET http://project.com/customer/myorders - A page that lists all the products the customer bought.**
    - Default sorting based on purchase date.
    - For each row of purchased product, there should be a button that says the following (BUT NOT BOTH):
        - __"Crete New Case"__
            - This is when there are no cases opened by the customer.
        - __"View My Case"__
            - This is when a customer has already opened a case and can see the progress of the case.
    - This should act as a prelimiary defense against non-purchased customers trying to start a case on the product.
    - But this should also be chceked within the SQL file using the CHECK constraint.
    - Note: This only sends the template HTML page. you must use this with the Data 
            GET request in the next section to actually retrieve order data of that customer.

- **GET http://project.com/customer/case/create/%PD_ID% - A "Create New Case" page that allows a product-purchased customer to start a case against the product.**
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

- **GET http://project.com/customer/case - A "View My Case" page that 
  allows a product-purchased customer to see the status and comments made by 
  employees or customers of that case.**
    - The page will look similar to a chat page where the employee and customer 
      send and receive comments from each other.
    - The default view will be sorted by __CaseComments.ctime__, with the latest 
      comment appearing on the bottom of the page.
    - Unlike creating a new case, __a customer can visit other product case pages 
      even if the customer did not purchase the product.__ However, the customer 
      cannot post a comment if the customer did not buy the product in the case.
    - If an employee decides to close the case, depending on the reason it closed, 
      a final comment will be auto-generated.
      - If __SOLVED__: __"Employee Nancy has closed this case as solved."__
      - If __UNRESOLVED__: __"Employee Nancy has closed this case as unresolved. 
        Please review the case comments and also see if there are any common resolutions 
        that have already solved the issue regarding  your product."__
      - If __DUPLICATE__: __"Employee Nancy has closed this case as this is a duplicate issue that has already been discussed in http://project/customer/cases/69420"__
      - If __COMRES__: __"Employee Nancy has
      closed this case with a common resolution for this issue which you can find 
      here: http://project.com/comres/%COMRES_ID%".__


### Functionalities for the Customer (Data GET Requests)
- **GET http://project.com/product/%PD_ID% - Retrieve information about a specific product.**
- **GET http://project.com/customer/%CUS_ID%/myorders - Retrieve all order information of the given customer.**
- **GET http://project.com/customer/case/%CAS_ID% - Retrieve all information about the case opened by customer.**



### Functionalities for the Customer (POST Requests)
- **POST http://project.com/customer/purchase/make - Makes a purcahse of a product sold by a salesperson.**
- **POST http://project.com/customer/comres/post - Posts a common resolution to a issue from a product.**
    - Note: Customer must have made a purchase to that product in order to post a common resolution.
- **POST http://project.com/customer/case/create - Upload the case to the server.**
    - Note: Customer must have made a purchase to that product in order to start a new case.
- **POST http://project.com/customer/case/comment - Posts a comment to a case regarding a product.**
    - Note: While any employee can post comments, only customers that have purchased the product can post comments.


### Functionalities for the Employees (GET Requests)
- **GET http://project.com/employee - Main admin webpage for employees.**
    - This page should include the search bar for the __"Employee Browsing"__ feature.
    - This page should include the search bar for the __"Data Aggregation"__ feature.
- **GET http://project.com/employee/results/search - Results page for the search feature.**
- **GET http://project.com/employee/results/agg - Results page for the data aggregation feature.**

### Functionalities for the Customer (POST Requests)
- **POST http://project.com/employee/case/update - Update the state of an existing case.**
- **POST http://project.com/employee/case/comment - Posts a comment to an existing case.**

### Advanced DB Features
- Table R/W locking
    - https://stackoverflow.com/questions/50539828/mysql-lock-tables-with-autocommit-vs-start-transaction
- Indexing
- 
