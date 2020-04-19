## INFSCI 2710 - WORKPAD

In the abscess of a final exam, the homework and projects will be weighed in more than usual, so I know it might be some extra work, here are a list of features that I strongly feel like we should implements:

* ___Note: Since we are working with a free-tier version of Coud9, our actaul public URL will be something ugly like so:___
___https://d373lap04ubgnu.cloudfront.net/c9-5c89b22bf5a1-ide/@c9/ide/plugins/c9.ide.preview.markdown/client/markdown.html?host=https://us-east-2.console.aws.amazon.com&id=markdown1___
* For the sake of simplicity, we will assume that our public URL will just be http://project.com for now.

- **(CUS) In the customer's main website (ex.http://project.com/customer):**
    - A top navbar that has a "Products I bought", which leads to another page that shows all the products that the customer boutht.
    - Some form of list of items that the customer can by (like amamzon)

- **(CUS) Each product details page (ex. http://project.com/product/):**
    - Shows basic info about the product
        - Product Name
        - Product Description
        - Name, Email, Job title of the Salesperson selling this project.
            - Mapping from product to Salesperson could be arbitrary or pre-defined by us (either works fine).
        - (Optional) Price
        - (Optional) Amazon-like review system
    - A "BUY" button that purchases the product
        - Check if Customer's income is enought for purchase.
            - Reject purchase if income in insufficent.
        
- **(CUS) A "My Orders" page that lists all the prodcts that the customer bought (ex. http://project.com/customer/myorders)**
    - Default sorting based on purchase date.
    - For each row of purchased product, there should be a button that says the following:
        - "Crete New Case"
            - This is when there are no cases opened by the customer.
        - "View My Case"
            - This is when a customer has already opened a case and can see the progress of the case.