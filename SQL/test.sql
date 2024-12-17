USE LetsCook;
SHOW tables;

drop database LetsCook;

-- DESCRIBE 
DESCRIBE Nutrition_info;
DESCRIBE Ingredient;
DESCRIBE Recommended_recipe;




-- SELECT * 
SELECT * FROM User;
SELECT * FROM sessions;
SELECT * FROM Ingredient;
SELECT * FROM recipe;
SELECT * FROM Recommended_recipe;
SELECT * FROM Nutrition_info;


-- DELETE
DELETE FROM sessions
WHERE session_id = 'hbIFywwXRZbevSVwm3rrBqMjWkQzssfi';

DELETE FROM User
WHERE ID = 'user1';

DELETE FROM Ingredient
WHERE Name = '감자' AND User_ID = 'user1';


-- 기타
SELECT data FROM sessions WHERE expires > UNIX_TIMESTAMP(NOW());
    
    