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
-- Table structure for table `answer`
--

DROP TABLE IF EXISTS `answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answer` (
  `questionID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `optionNumber` int NOT NULL,
  `answerContent` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isCorrect` tinyint(1) NOT NULL,
  PRIMARY KEY (`questionID`,`optionNumber`),
  CONSTRAINT `answer_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions` (`questionID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answer`
--

LOCK TABLES `answer` WRITE;
/*!40000 ALTER TABLE `answer` DISABLE KEYS */;
INSERT INTO `answer` VALUES ('0224587c-1b53-44f4-93ec-4cdd834e2775',1,'2.89 cos (100t + 47.6°)',1),('0224587c-1b53-44f4-93ec-4cdd834e2775',2,'3.34 cos (100t + 55°)',0),('0224587c-1b53-44f4-93ec-4cdd834e2775',3,'3.55 cos (100t + 39.8°)',0),('0224587c-1b53-44f4-93ec-4cdd834e2775',4,'4.1 cos (100t + 31.4°)',0),('098e717e-17ae-4890-a9b4-a13424a17a75',1,'0.67V',1),('098e717e-17ae-4890-a9b4-a13424a17a75',2,'1V',0),('098e717e-17ae-4890-a9b4-a13424a17a75',3,'-0.67V',0),('098e717e-17ae-4890-a9b4-a13424a17a75',4,'-1V',0),('16f4df59-1080-408b-9ef4-c607e46ac105',1,'83.8ms',1),('16f4df59-1080-408b-9ef4-c607e46ac105',2,'377ms',0),('16f4df59-1080-408b-9ef4-c607e46ac105',3,'18.6ms',0),('16f4df59-1080-408b-9ef4-c607e46ac105',4,'44.5ms',0),('20cf2484-11b3-444a-a75f-77c5b10087c9',1,'Battery B is being recharged; Power lost in Battery B\'s internal resistance is 0.365 mW.',1),('20cf2484-11b3-444a-a75f-77c5b10087c9',2,'Battery B is being recharged; Power lost in Battery B\'s internal resistance is 36.5 mW.',0),('20cf2484-11b3-444a-a75f-77c5b10087c9',3,'Battery B is being recharged; Power lost in Battery B\'s internal resistance is 36.5 mW.',0),('20cf2484-11b3-444a-a75f-77c5b10087c9',4,'Battery B is being discharged; Power lost in Battery B\'s internal resistance is 36.5 mW.',0),('47060b2c-0b94-480b-b3bd-2ee72deea66d',1,'\\(V_T = 7~V,~~~~~R_T = 1.2~\\Omega\\)',1),('47060b2c-0b94-480b-b3bd-2ee72deea66d',2,'\\(V_T = 7~V,~~~~~R_T = 1.33~\\Omega\\)',0),('47060b2c-0b94-480b-b3bd-2ee72deea66d',3,'\\(V_T = 7.4~V,~~~~~R_T = 1.2~\\Omega\\)',0),('47060b2c-0b94-480b-b3bd-2ee72deea66d',4,'\\(V_T = 7.4~V,~~~~~R_T = 1.33~\\Omega\\)',0),('6a8ae7d0-b064-4765-8716-388a73c0199f',1,'56.9 cos (100t - 129.3°)',1),('6a8ae7d0-b064-4765-8716-388a73c0199f',2,'80.4 cos (100t - 84.3°)',0),('6a8ae7d0-b064-4765-8716-388a73c0199f',3,'1.13 cos (100t + 129.3°)',0),('6a8ae7d0-b064-4765-8716-388a73c0199f',4,'56.9 cos (100t - 39.3°)',0),('78b8a390-3fee-4422-8ec9-bfefd1e8b403',1,'2mV',1),('78b8a390-3fee-4422-8ec9-bfefd1e8b403',2,'2.5V',0),('78b8a390-3fee-4422-8ec9-bfefd1e8b403',3,'10V',0),('78b8a390-3fee-4422-8ec9-bfefd1e8b403',4,'0.2V',0),('a950a46d-1c49-4884-a4d8-f1f808616ca6',1,'0.2A',1),('a950a46d-1c49-4884-a4d8-f1f808616ca6',2,'1A',0),('a950a46d-1c49-4884-a4d8-f1f808616ca6',3,'0.6A',0),('a950a46d-1c49-4884-a4d8-f1f808616ca6',4,'0.8A',0),('c2ffe89d-5315-42e3-8817-b56ace031190',1,'113mW',0),('c2ffe89d-5315-42e3-8817-b56ace031190',2,'173mW',0),('c2ffe89d-5315-42e3-8817-b56ace031190',3,'163mW',0),('c2ffe89d-5315-42e3-8817-b56ace031190',4,'703mW',0),('e76eb958-d99b-4ad5-aa4c-e106b8e6847b',1,'0.74F',1),('e76eb958-d99b-4ad5-aa4c-e106b8e6847b',2,'0.863F',0),('e76eb958-d99b-4ad5-aa4c-e106b8e6847b',3,'0.987F',0),('e76eb958-d99b-4ad5-aa4c-e106b8e6847b',4,'1.11F',0),('f37d454a-618a-479c-8a3f-f541e7fce692',1,'3.83V',1),('f37d454a-618a-479c-8a3f-f541e7fce692',2,'4V',0),('f37d454a-618a-479c-8a3f-f541e7fce692',3,'4.13V',0),('f37d454a-618a-479c-8a3f-f541e7fce692',4,'4.24V',0),('fdd0b615-602c-4b30-9583-7be5d2559522',1,'\\(4~\\Omega\\)',1),('fdd0b615-602c-4b30-9583-7be5d2559522',2,'\\(11~\\Omega\\)',0),('fdd0b615-602c-4b30-9583-7be5d2559522',3,'\\(10.2~\\Omega\\)',0),('fdd0b615-602c-4b30-9583-7be5d2559522',4,'\\(20.8~\\Omega\\)',0);
/*!40000 ALTER TABLE `answer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-09-21 12:25:59
