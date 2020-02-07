-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 07, 2020 at 07:22 AM
-- Server version: 10.3.16-MariaDB
-- PHP Version: 7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `scavhunter`
--

CREATE TABLE `scavhunter` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_hungarian_ci NOT NULL,
  `points` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `scavhunter`
--

INSERT INTO `scavhunter` (`id`, `name`, `points`, `date`) VALUES
(1, 'kite', '842', '2020-02-07'),
(2, 'kite', '842', '2020-02-07'),
(3, 'Ejnaer', '928', '2020-02-07'),
(4, 'TatungJDC', '448', '2020-02-07'),
(5, 'NSD4rKn3SS', '0', '2020-02-07'),
(6, 'NSD4rKn3SS', '58', '2020-02-07'),
(7, 'NSD4rKn3SS', '332', '2020-02-07'),
(8, 'NSD4rKn3SS', '458', '2020-02-07'),
(9, 'Blaze', '564', '2020-02-07'),
(10, 'Blaze', '756', '2020-02-07'),
(11, 'Blaze', '190', '2020-02-07'),
(12, 'S', '226', '2020-02-07'),
(13, 'S', '438', '2020-02-07'),
(14, 'S', '94', '2020-02-07'),
(15, 'S', '248', '2020-02-07'),
(16, 'TatungJDC', '236', '2020-02-07'),
(17, 'NSD4rKn3SS', '0', '2020-02-07'),
(18, 'NSD4rKn3SS', '546', '2020-02-07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `scavhunter`
--
ALTER TABLE `scavhunter`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `scavhunter`
--
ALTER TABLE `scavhunter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
