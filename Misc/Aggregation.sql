-- support cases by product:
SELECT r.name, count(r.name) AS cases \
FROM Cases c, Purchases p, Products r \
WHERE (c.PUR_ID = p.PUR_ID) AND (r.PD_ID = p.PD_ID) \
GROUP BY r.name \
ORDER BY cases desc; \

SELECT r.*, count(r.name) AS cases \
FROM Cases c, Purchases p, Products r \
WHERE (c.PUR_ID = p.PUR_ID) AND (r.PD_ID = p.PD_ID) \
GROUP BY r.name \
ORDER BY cases desc; \

SELECT PRD.*, count(PRD.name) AS cases \
FROM Cases CAS, Purchases PUR, Products PRD \
WHERE (CAS.PUR_ID = PUR.PUR_ID) AND (PRD.PD_ID = PUR.PD_ID) \
GROUP BY PRD.name \
ORDER BY cases desc; \

-- support cases by product ID
SELECT PRD.*, count(PRD.PD_ID) AS cases \
FROM Cases CAS, Purchases PUR, Products PRD \
WHERE (CAS.PUR_ID = PUR.PUR_ID) AND (PRD.PD_ID = PUR.PD_ID) \
GROUP BY PRD.PD_ID \
ORDER BY cases desc; 




-- support cases closed(solved) by employee
SELECT e.name, count(e.name) AS cases \
FROM Employee e, Cases c  \
WHERE (c.EMP_ID = e.EMP_ID) AND status = 'SOLVED'  \
GROUP BY e.name \
ORDER BY cases desc; \

SELECT EMP.*, count(EMP.name) AS cases \
FROM Employee EMP, Cases c  \
WHERE (c.EMP_ID = EMP.EMP_ID) AND status = 'SOLVED'  \
GROUP BY EMP.name \
ORDER BY cases desc; \

-- support cases closed(solved) by employee ID
SELECT EMP.*, count(EMP.EMP_ID) AS cases \
FROM Employee EMP, Cases c  \
WHERE (c.EMP_ID = EMP.EMP_ID) AND status = 'SOLVED'  \
GROUP BY EMP.EMP_ID \
ORDER BY cases desc; 




-- support cases by customer
SELECT cu.name, count(cu.name) AS cases  \
FROM Cases c, Purchases p, Customers cu \
WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = cu.CUS_ID) \
GROUP BY cu.name \
ORDER BY cases desc; \

SELECT CUS.*, count(CUS.name) AS cases  \
FROM Cases c, Purchases p, Customers CUS \
WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = CUS.CUS_ID) \
GROUP BY CUS.name \
ORDER BY cases desc; \

-- support cases by customer ID
SELECT CUS.*, count(CUS.CUS_ID) AS cases  \
FROM Cases c, Purchases p, Customers CUS \
WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = CUS.CUS_ID) \
GROUP BY CUS.CUS_ID \
ORDER BY cases desc;




-- support cases by company
SELECT cu.company, count(cu.company) AS cases  \
FROM Cases c, Purchases p, Customers cu \
WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = cu.CUS_ID) \
GROUP BY cu.company \
ORDER BY cases desc;

SELECT CUS.company, count(CUS.company) AS cases  \
FROM Cases c, Purchases p, Customers CUS \
WHERE (c.PUR_ID = p.PUR_ID) AND (p.CUS_ID = CUS.CUS_ID) \
GROUP BY CUS.company \
ORDER BY cases desc;