-- MySQL Script generated by MySQL Workbench
-- Tue Nov 19 14:42:52 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema LetsCook
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema LetsCook
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `LetsCook` DEFAULT CHARACTER SET utf8 ;
USE `LetsCook` ;

-- -----------------------------------------------------
-- Table `LetsCook`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`User` (
  `ID` VARCHAR(45) NOT NULL,
  `PWD` VARCHAR(100) NULL,
  `Name` VARCHAR(45) NULL,
  `Email` VARCHAR(255) NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Ingredient`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Ingredient` (
  `Name` VARCHAR(45) NOT NULL,
  `Expiration` DATE NULL,
  `Status` TINYINT NULL DEFAULT 0,
  `User_ID` VARCHAR(45) NOT NULL,
  INDEX `User_ID_idx` (`User_ID` ASC) VISIBLE,
  PRIMARY KEY (`User_ID`, `Name`),
  CONSTRAINT `Ingred_User_ID`
    FOREIGN KEY (`User_ID`)
    REFERENCES `LetsCook`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`recipe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`recipe` (
  `Ingredients` TEXT NULL,
  `manual` TEXT NULL,
  `Nutrition_info` TEXT NULL,
  `Name` VARCHAR(45) NOT NULL,
  `ID` INT NOT NULL,
  `img_URL` TEXT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Post` (
  `Post_ID` VARCHAR(45) NOT NULL,
  `Creation_Date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `Content` TEXT NULL,
  `recipe_ID` INT NULL,
  `Title` VARCHAR(45) NULL,
  PRIMARY KEY (`Post_ID`),
  INDEX `Post_recipe_Name_idx` (`recipe_ID` ASC) VISIBLE,
  CONSTRAINT `Post_recipe_Name`
    FOREIGN KEY (`recipe_ID`)
    REFERENCES `LetsCook`.`recipe` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Likes_Post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Likes_Post` (
  `User_ID` VARCHAR(45) NOT NULL,
  `Post_ID` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`User_ID`, `Post_ID`),
  INDEX `Post_ID_idx` (`Post_ID` ASC) VISIBLE,
  CONSTRAINT `Likes_User_ID`
    FOREIGN KEY (`User_ID`)
    REFERENCES `LetsCook`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `Likes_Post_ID`
    FOREIGN KEY (`Post_ID`)
    REFERENCES `LetsCook`.`Post` (`Post_ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Comments` (
  `Content` TEXT NULL,
  `Creation_Date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Commenter_ID` VARCHAR(45) NOT NULL,
  `Post_ID` VARCHAR(45) NOT NULL,
  INDEX `Commeter_ID_idx` (`Commenter_ID` ASC) VISIBLE,
  INDEX `Post_ID_idx` (`Post_ID` ASC) VISIBLE,
  PRIMARY KEY (`Commenter_ID`, `Post_ID`, `Creation_Date`),
  CONSTRAINT `Commeter_ID`
    FOREIGN KEY (`Commenter_ID`)
    REFERENCES `LetsCook`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `Comm_Post_ID`
    FOREIGN KEY (`Post_ID`)
    REFERENCES `LetsCook`.`Post` (`Post_ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Recommended_recipe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Recommended_recipe` (
  `Name` VARCHAR(45) NOT NULL,
  `Ingredients` TEXT NULL,
  `Process` TEXT NULL,
  `Like` TINYINT NULL,
  `User_ID` VARCHAR(45) NOT NULL,
  `Recommend_Date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `User_ID_idx` (`User_ID` ASC) VISIBLE,
  PRIMARY KEY (`User_ID`, `Recommend_Date`, `Name`),
  CONSTRAINT `Rec_User_ID`
    FOREIGN KEY (`User_ID`)
    REFERENCES `LetsCook`.`User` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `LetsCook`.`Nutrition_info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `LetsCook`.`Nutrition_info` (
  `INFO_ENG` INT NULL,
  `INFO_CAR` INT NULL,
  `INFO_PRO` INT NULL,
  `INFO_FAT` INT NULL,
  `recipe_ID` INT NOT NULL,
  PRIMARY KEY (`recipe_ID`),
  CONSTRAINT `Nutrition_recipe`
    FOREIGN KEY (`recipe_ID`)
    REFERENCES `LetsCook`.`recipe` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
