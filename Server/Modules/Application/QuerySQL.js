/**
 * Various SQL statements.
 * @module Modules/Application/querySQL
 *
 * This file contains various SQL statements.
 *
 * Author : David Song (deokwons9004dev@gmail.com)
 */

// ---------------------------------
// DEFINE SQL STATEMENTS
// ---------------------------------
module.exports = {
    
    CUSTOMERS: {
        SELECT_BY_EMAIL     : 'SELECT * FROM Customers WHERE email = ?',
        SELECT_BY_PK        : 'SELECT * FROM Customers WHERE CUS_ID = ?',
        UPDATE_INCOME_BY_PK : 'UPDATE Customers SET income = ? WHERE CUS_ID = ?',
    },
    
    PRODUCTS: {
        SELECT_BY_PK: 'SELECT * FROM Products WHERE PD_ID = ?'
    },
    
    SALESPERSONS: {
        SELECT_RANDOM_ROW: 'SELECT * FROM SalesPersons ORDER BY RAND() LIMIT 1'
    },
    
    EMPLOYEE: {
        SELECT_BY_EMAIL: 'SELECT * FROM Employee WHERE email = ?'
    },
    
    PURCHASES: {
        INSERT_WITHOUT_PK: 'INSERT INTO Purchases (purchase_date, CUS_ID, SP_ID, PD_ID) VALUES (?,?,?,?)'
    },
    
    COMRES: {
        INSERT_WITHOUT_PK: 'INSERT INTO CommonResolutions (name, guide, views, PD_ID, CUS_ID, EMP_ID) VALUES (?,?,?,?,?,?)'
    },
    
    CASES: {
        INSERT_WITHOUT_PK: 'INSERT INTO Cases (summary, description, opentime, status, PUR_ID) VALUES (?,?,?,?,?)',
        
        SEARCH_BY_STATUS  : 'SELECT * FROM Cases WHERE status LIKE "%"?"%"',
        SEARCH_BY_OPENTIME: 'SELECT * FROM Cases WHERE opentime LIKE "%"?"%"',
    },
    
    CASECOMMENTS: {
        INSERT_WITHOUT_PK: 'INSERT INTO CaseComments (ctime, ctext, CAS_ID, EMP_ID, CUS_ID) VALUES (?,?,?,?,?)'
    },
    
    ADVANCED: {
        SEARCH_CUSTOMER_BY_NAME: 'select C.*, PD.* \
                                  from Customers C \
                                        inner join Purchases PUR on C.CUS_ID = PUR.CUS_ID \
                                        inner join Products PD on PD.PD_ID = PUR.PD_ID \
                                  where C.name LIKE "%"?"%";',
                                  
        SEARCH_CUSTOMER_BY_EMAIL: 'select C.*, PD.* \
                                      from Customers C \
                                            inner join Purchases PUR on C.CUS_ID = PUR.CUS_ID \
                                            inner join Products PD on PD.PD_ID = PUR.PD_ID \
                                      where C.email LIKE "%"?"%";',     
                                      
                                      
                                      
        SEARCH_COMRES_BY_PRODUCT_ID: 'select CR.*, PD.* \
                                        from CommonResolutions CR \
                                            inner join Products PD on PD.PD_ID = CR.PD_ID \
                                        where PD.PD_ID = ?;',  
                                        
        SEARCH_COMRES_BY_PRODUCT_NAME: 'select CR.*, PD.* \
                                        from CommonResolutions CR \
                                            inner join Products PD on PD.PD_ID = CR.PD_ID \
                                        where PD.name LIKE "%"?"%";',         
                                        
                                        
                                        
        AGG_CASES_BY_PRODUCT_DESC: 'SELECT PRD.*, count(PRD.PD_ID) AS cases \
                                    FROM Cases CAS, Purchases PUR, Products PRD \
                                    WHERE (CAS.PUR_ID = PUR.PUR_ID) AND (PRD.PD_ID = PUR.PD_ID) \
                                    GROUP BY PRD.PD_ID \
                                    ORDER BY cases desc; ',      
                                    
        AGG_CASES_BY_CLOSED_EMP_DESC: 'SELECT EMP.*, count(EMP.EMP_ID) AS cases \
                                        FROM Employee EMP, Cases c  \
                                        WHERE (c.EMP_ID = EMP.EMP_ID) AND status = "SOLVED"  \
                                        GROUP BY EMP.EMP_ID \
                                        ORDER BY cases desc; ',    
                                        
        AGG_CASES_BY_CUSTOMER_DESC: 'SELECT CUS.*, count(CUS.CUS_ID) AS cases  \
                                        FROM Cases c, Purchases p, Customers CUS \
                                        WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = CUS.CUS_ID) \
                                        GROUP BY CUS.CUS_ID \
                                        ORDER BY cases desc;',        
                                        
        AGG_CASES_BY_CUSTOMER_COMPANY_DESC: 'SELECT CUS.company, count(CUS.company) AS cases  \
                                            FROM Cases c, Purchases p, Customers CUS \
                                            WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = CUS.CUS_ID) \
                                            GROUP BY CUS.company \
                                            ORDER BY cases desc;',
    },
}


