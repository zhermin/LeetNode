-- CreateTable
CREATE TABLE `posts` (
    `postID` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `likes` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`postID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postMedia` (
    `postID` VARCHAR(191) NOT NULL,
    `postMediaURL` VARCHAR(191) NULL,

    PRIMARY KEY (`postID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `dpURL` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `studentEmail` VARCHAR(191) NOT NULL,
    `matriculationNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `students_matriculationNumber_key`(`matriculationNumber`),
    PRIMARY KEY (`studentEmail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentAttempts` (
    `studentEmail` VARCHAR(191) NOT NULL,
    `questionID` VARCHAR(191) NOT NULL,
    `attemptOption` INTEGER NOT NULL,
    `attemptCorrect` BOOLEAN NOT NULL,
    `attemptSeconds` INTEGER NOT NULL,

    PRIMARY KEY (`studentEmail`, `questionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentMasteries` (
    `studentEmail` VARCHAR(191) NOT NULL,
    `topicID` VARCHAR(191) NOT NULL,
    `masteryLevel` DOUBLE NOT NULL DEFAULT 0,
    `courseCompletion` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`topicID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `topicID` VARCHAR(191) NOT NULL,
    `topicName` VARCHAR(50) NOT NULL,
    `topicLevel` INTEGER NOT NULL,

    PRIMARY KEY (`topicID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `questionID` VARCHAR(191) NOT NULL,
    `topicID` VARCHAR(191) NOT NULL,
    `questionContent` VARCHAR(500) NOT NULL,
    `questionDifficulty` INTEGER NOT NULL,

    PRIMARY KEY (`questionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionMedia` (
    `questionID` VARCHAR(191) NOT NULL,
    `questionMediaURL` VARCHAR(191) NULL,

    PRIMARY KEY (`questionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer` (
    `questionID` VARCHAR(191) NOT NULL,
    `optionNumber` INTEGER NOT NULL,
    `answerContent` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,

    PRIMARY KEY (`questionID`, `optionNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_email_fkey` FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postMedia` ADD CONSTRAINT `postMedia_postID_fkey` FOREIGN KEY (`postID`) REFERENCES `posts`(`postID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_studentEmail_fkey` FOREIGN KEY (`studentEmail`) REFERENCES `users`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentAttempts` ADD CONSTRAINT `studentAttempts_studentEmail_fkey` FOREIGN KEY (`studentEmail`) REFERENCES `students`(`studentEmail`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentAttempts` ADD CONSTRAINT `studentAttempts_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`questionID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentMasteries` ADD CONSTRAINT `studentMasteries_topicID_fkey` FOREIGN KEY (`topicID`) REFERENCES `topics`(`topicID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentMasteries` ADD CONSTRAINT `studentMasteries_studentEmail_fkey` FOREIGN KEY (`studentEmail`) REFERENCES `students`(`studentEmail`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_topicID_fkey` FOREIGN KEY (`topicID`) REFERENCES `topics`(`topicID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionMedia` ADD CONSTRAINT `questionMedia_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`questionID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer` ADD CONSTRAINT `answer_questionID_fkey` FOREIGN KEY (`questionID`) REFERENCES `questions`(`questionID`) ON DELETE RESTRICT ON UPDATE CASCADE;
