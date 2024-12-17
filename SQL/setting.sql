-- 1시간마다 만료된 세션이 있는지 검사 후, 있다면 sessions 테이블에서 삭제 
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP();


-- Nutrition_info의 INFO_FAT 데이터타입을 INT로 변경 
ALTER TABLE Nutrition_info
MODIFY COLUMN INFO_FAT INT;

-- Recommended_recipe의 like 속성 디폴트값을 0으로 설정
ALTER TABLE Recommended_recipe
MODIFY COLUMN `Like` BOOLEAN DEFAULT 0;

