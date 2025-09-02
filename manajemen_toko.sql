-- MySQL dump 10.13  Distrib 9.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: toko
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id_customer` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` text,
  `tanggal_daftar` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_customer`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'rahman','rahman@gamil.com','081234567','cileungsi','2025-08-16 16:42:56');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detail_pembelian`
--

DROP TABLE IF EXISTS `detail_pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detail_pembelian` (
  `id_detail` int NOT NULL AUTO_INCREMENT,
  `id_pembelian` int NOT NULL,
  `id_produk` int NOT NULL,
  `qty` int NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id_detail`),
  KEY `id_pembelian` (`id_pembelian`),
  KEY `id_produk` (`id_produk`),
  CONSTRAINT `detail_pembelian_ibfk_1` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian` (`id_pembelian`),
  CONSTRAINT `detail_pembelian_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail_pembelian`
--

LOCK TABLES `detail_pembelian` WRITE;
/*!40000 ALTER TABLE `detail_pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `detail_pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detail_restock`
--

DROP TABLE IF EXISTS `detail_restock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detail_restock` (
  `id_detail_restock` int NOT NULL AUTO_INCREMENT,
  `id_restock` int NOT NULL,
  `id_produk` int NOT NULL,
  `kuantitas` int NOT NULL,
  PRIMARY KEY (`id_detail_restock`),
  KEY `id_restock` (`id_restock`),
  KEY `id_produk` (`id_produk`),
  CONSTRAINT `detail_restock_ibfk_1` FOREIGN KEY (`id_restock`) REFERENCES `restock` (`id_restock`),
  CONSTRAINT `detail_restock_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail_restock`
--

LOCK TABLES `detail_restock` WRITE;
/*!40000 ALTER TABLE `detail_restock` DISABLE KEYS */;
/*!40000 ALTER TABLE `detail_restock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
INSERT INTO `kategori` VALUES (1,'Meja'),(2,'Bangku'),(3,'kursi'),(4,'Baskom');
/*!40000 ALTER TABLE `kategori` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembelian`
--

DROP TABLE IF EXISTS `pembelian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pembelian` (
  `id_pembelian` int NOT NULL AUTO_INCREMENT,
  `id_kasir` int NOT NULL,
  `id_customer` int DEFAULT NULL,
  `tanggal` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metode_pembayaran` enum('cash','transfer','qris','debit') NOT NULL,
  `total_harga` decimal(15,2) NOT NULL DEFAULT '0.00',
  `jumlah_bayar` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sisa_tagihan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status_pembayaran` enum('lunas','hutang','dp') DEFAULT 'lunas',
  PRIMARY KEY (`id_pembelian`),
  KEY `id_kasir` (`id_kasir`),
  KEY `id_customer` (`id_customer`),
  CONSTRAINT `pembelian_ibfk_1` FOREIGN KEY (`id_kasir`) REFERENCES `users` (`id_user`),
  CONSTRAINT `pembelian_ibfk_2` FOREIGN KEY (`id_customer`) REFERENCES `customers` (`id_customer`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembelian`
--

LOCK TABLES `pembelian` WRITE;
/*!40000 ALTER TABLE `pembelian` DISABLE KEYS */;
/*!40000 ALTER TABLE `pembelian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produk`
--

DROP TABLE IF EXISTS `produk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produk` (
  `id_produk` int NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(100) NOT NULL,
  `modal_awal` int DEFAULT NULL,
  `harga_jual` int DEFAULT NULL,
  `stok` int DEFAULT NULL,
  `id_kategori` int DEFAULT NULL,
  `id_supplier` int NOT NULL,
  `gambar_produk` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_produk`),
  KEY `id_kategori` (`id_kategori`),
  KEY `id_supplier` (`id_supplier`),
  CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id`),
  CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`id_supplier`) REFERENCES `supplier` (`id_supplier`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produk`
--

LOCK TABLES `produk` WRITE;
/*!40000 ALTER TABLE `produk` DISABLE KEYS */;
/*!40000 ALTER TABLE `produk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo`
--

DROP TABLE IF EXISTS `promo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo` (
  `id_promo` int NOT NULL AUTO_INCREMENT,
  `kode_promo` varchar(50) NOT NULL,
  `nama_promo` varchar(100) NOT NULL,
  `tipe_diskon` enum('persen','jumlah') NOT NULL,
  `nilai_diskon` decimal(10,2) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_berakhir` date NOT NULL,
  `status` enum('aktif','tidak_aktif') NOT NULL DEFAULT 'aktif',
  `min_pembelian` decimal(15,2) DEFAULT '0.00',
  `usage_limit` int DEFAULT NULL,
  PRIMARY KEY (`id_promo`),
  UNIQUE KEY `kode_promo` (`kode_promo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo`
--

LOCK TABLES `promo` WRITE;
/*!40000 ALTER TABLE `promo` DISABLE KEYS */;
/*!40000 ALTER TABLE `promo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `token` varchar(255) NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`token`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoyNiwiaWF0IjoxNzU2MjAwODQxLCJleHAiOjE3NTY4MDU2NDF9.TQoZ-b2SRPtXmthCS5sDjadgTKKCgswGlmNJATyVZA4',26),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoyNiwiaWF0IjoxNzU2MjAxNjM4LCJleHAiOjE3NTY4MDY0Mzh9.h4IurqUaCNWUmj26872_EjyxfMqsBQBxVOIdXlmFITY',26),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoyNiwiaWF0IjoxNzU2MjAyMDY0LCJleHAiOjE3NTY4MDY4NjR9.jYkWcIJaMdf7EXv7m8XxSfbg7N8MZmyUCzJHPzDbUXg',26);
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restock`
--

DROP TABLE IF EXISTS `restock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restock` (
  `id_restock` int NOT NULL AUTO_INCREMENT,
  `id_supplier` int DEFAULT NULL,
  `total_produk` int DEFAULT NULL,
  `tanggal_restock` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_restock`),
  KEY `id_supplier` (`id_supplier`),
  CONSTRAINT `restock_ibfk_1` FOREIGN KEY (`id_supplier`) REFERENCES `supplier` (`id_supplier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restock`
--

LOCK TABLES `restock` WRITE;
/*!40000 ALTER TABLE `restock` DISABLE KEYS */;
/*!40000 ALTER TABLE `restock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returns` (
  `id_retur` int NOT NULL AUTO_INCREMENT,
  `id_pembelian` int NOT NULL,
  `id_produk` int NOT NULL,
  `kuantitas` int NOT NULL,
  `alasan` text,
  `tanggal_retur` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','selesai','ditukar') NOT NULL DEFAULT 'pending',
  `status_toko_supplier` enum('belum_diteruskan','sudah_diteruskan') NOT NULL DEFAULT 'belum_diteruskan',
  PRIMARY KEY (`id_retur`),
  KEY `id_pembelian` (`id_pembelian`),
  KEY `id_produk` (`id_produk`),
  CONSTRAINT `returns_ibfk_1` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian` (`id_pembelian`),
  CONSTRAINT `returns_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id_supplier` int NOT NULL AUTO_INCREMENT,
  `nama_supplier` varchar(100) NOT NULL,
  `kontak` varchar(20) DEFAULT NULL,
  `alamat` text,
  PRIMARY KEY (`id_supplier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_returns`
--

DROP TABLE IF EXISTS `supplier_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_returns` (
  `id_retur_supplier` int NOT NULL AUTO_INCREMENT,
  `id_supplier` int NOT NULL,
  `id_produk` int NOT NULL,
  `kuantitas` int NOT NULL,
  `alasan` text,
  `tanggal_retur` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('proses','selesai','ditolak') NOT NULL DEFAULT 'proses',
  PRIMARY KEY (`id_retur_supplier`),
  KEY `id_supplier` (`id_supplier`),
  KEY `id_produk` (`id_produk`),
  CONSTRAINT `supplier_returns_ibfk_1` FOREIGN KEY (`id_supplier`) REFERENCES `supplier` (`id_supplier`),
  CONSTRAINT `supplier_returns_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_returns`
--

LOCK TABLES `supplier_returns` WRITE;
/*!40000 ALTER TABLE `supplier_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_data`
--

DROP TABLE IF EXISTS `user_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_data` (
  `id_user_data` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `nama_lengkap` varchar(100) DEFAULT NULL,
  `alamat_user` varchar(255) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `bio` text,
  `foto_profil` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_data`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `user_data_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_data`
--

LOCK TABLES `user_data` WRITE;
/*!40000 ALTER TABLE `user_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `role` enum('admin','kasir') NOT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (26,'rahman','admin@gmail.com','$2b$10$KiFxad8HhQmyZJkFu550SOMUICSx.FsgPF/67FMM3RaMEqcrzpHV6','admin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-02 14:36:11
