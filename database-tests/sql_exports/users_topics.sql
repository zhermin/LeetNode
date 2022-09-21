-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: users
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `topicID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topicName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topicLevel` int NOT NULL,
  PRIMARY KEY (`topicID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES ('0172e8de-3ce2-407f-bb84-561cfda1167d','steady_state_rlc',2),('30178746-f541-4db4-b4ae-5fd9cb1348b5','voltage_division_principle',1),('34c85efd-9d6e-447f-ad2b-8b4f0e223832','equivalent_resistance_series_parallel',1),('3b99ae4a-de0a-4e71-bf42-0a9d536f1e61','thevenin_equivalent_circuit',1),('3c7af19b-fef6-41b0-9804-7665a29129dc','op_amp_golden_rules',3),('42f88d1d-3627-4d15-a647-99b751dbd712','gains_inverting_non_inverting_amplifiers',3),('481d4d98-0fb7-4105-a2f3-7f550062ca85','power_v_i',1),('5109c046-0a2a-47ee-a5cf-6b9401b5d37f','equivalent_capacitance_series_parallel',2),('5e04566e-2f52-428a-8a17-eec85058db7a','current_division_principle',1),('8398ce58-9a42-4409-bf64-c94e575b414e','calculation_mechanical_electrical_power_dc',3),('8749b0ec-f14b-4e72-9939-e9d9d26d1d10','first_order_high_pass',3),('8fe0fa88-ae04-4f00-9f2f-b87db1b30a08','node_voltage_analysis_technique',2),('9054f0c7-f72b-4775-9d50-2e3461256b2f','transient_analysis_series_rc_rl',2),('9ef7ea22-ae63-4662-ba08-91fb18f8318d','torque_equation',3),('a1a803aa-011f-4ad6-8506-22144b23de2a','kcl',1),('a2d97a41-9eba-4c19-9541-a7398a0fe5a3','electrical_circuit_model_pmdc',2),('a4acd7e6-4a3e-4da8-901f-eebedfea0683','kvl',1),('a96c9725-bc7b-4a34-90e3-b119b389f0b5','analysis_circuit_op_amp',3),('a9f9881c-8f5e-48c5-a356-9f240069462c','equivalent_inductance_series_parallel',2),('c579b740-546b-4ad5-9cc2-e63a830da42f','ohms_law',1),('ed32af12-60e5-4b39-9850-62c54c243a07','first_order_low_pass',3),('ee7c2984-fcb2-4c5b-bc57-2a7a4b0c2c86','energy_stored_capacitors_inductors',2);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-09-21 12:25:58
