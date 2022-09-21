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
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `questionID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `topicID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionContent` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionDifficulty` int NOT NULL,
  PRIMARY KEY (`questionID`),
  KEY `questions_topicID_fkey` (`topicID`),
  CONSTRAINT `questions_topicID_fkey` FOREIGN KEY (`topicID`) REFERENCES `topics` (`topicID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES ('0224587c-1b53-44f4-93ec-4cdd834e2775','0172e8de-3ce2-407f-bb84-561cfda1167d','In the circuit shown in the figure above, a 100-ohm resistor is connected in series with a practical inductor. The practical inductor has a resistance of 10-ohm, and an unknown inductance L. Suppose the phase angle of the voltage vR(t) is found to be –35° with respect to the source voltage vS(t), what is the voltage across the practical inductor vPL(t)?',3),('098e717e-17ae-4890-a9b4-a13424a17a75','34c85efd-9d6e-447f-ad2b-8b4f0e223832','A current of 3 A flows through a resistor network as shown in the figure above. The voltage difference VXY (given by VX – VY) is',2),('16f4df59-1080-408b-9ef4-c607e46ac105','9054f0c7-f72b-4775-9d50-2e3461256b2f','In the circuit shown in the figure above, the two switches were opened for a very long time before time t = 0. At time t = 0, both the switches are closed simultaneously. How long does it take for the voltage VL(t) to fall to 7 V after the switches are closed?',3),('20cf2484-11b3-444a-a75f-77c5b10087c9','30178746-f541-4db4-b4ae-5fd9cb1348b5','For the circuit shown in the figure above, is Battery B being recharged or discharged? What is the power lost in Battery B\'s internal resistance?',2),('47060b2c-0b94-480b-b3bd-2ee72deea66d','3b99ae4a-de0a-4e71-bf42-0a9d536f1e61','For the circuit shown in the figure above, what is the Thevenin equivalent circuit as seen by the load RL?',2),('6a8ae7d0-b064-4765-8716-388a73c0199f','0172e8de-3ce2-407f-bb84-561cfda1167d','In the circuit shown in the figure above, the capacitor\'s voltage vC(t) is',2),('78b8a390-3fee-4422-8ec9-bfefd1e8b403','30178746-f541-4db4-b4ae-5fd9cb1348b5','For the circuit shown in the figure above, what is the voltage V1?',2),('a950a46d-1c49-4884-a4d8-f1f808616ca6','c579b740-546b-4ad5-9cc2-e63a830da42f','For the circuit shown in the figure above, what is the value of current I1?',1),('c2ffe89d-5315-42e3-8817-b56ace031190','30178746-f541-4db4-b4ae-5fd9cb1348b5','What is the maximum power that can be utilized by the variable load R?',2),('e76eb958-d99b-4ad5-aa4c-e106b8e6847b','9054f0c7-f72b-4775-9d50-2e3461256b2f','In the circuit shown in the figure above, the capacitor was fully discharged initially. At time t = 0, the switch is closed. If it takes 6 s for the practical capacitor\'s voltage VPC(t) to rise to 6 V, what is the value of capacitance C?',3),('f37d454a-618a-479c-8a3f-f541e7fce692','8fe0fa88-ae04-4f00-9f2f-b87db1b30a08','For the circuit shown in the figure above, what is the node voltage VA?',2),('fdd0b615-602c-4b30-9583-7be5d2559522','3b99ae4a-de0a-4e71-bf42-0a9d536f1e61','What is the value of R that will result in a current of I = 0.25 A passing through R? (Hint: Use Thevenin equivalent circuit)',2);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
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
