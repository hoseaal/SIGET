-- AlterTable
ALTER TABLE `DetalleSolicitud` ADD COLUMN `dueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('EN_ESPERA', 'RESPONDIDA', 'VENCIDA', 'RATIFICADA', 'DERIVADA') NOT NULL DEFAULT 'EN_ESPERA';

-- AlterTable
ALTER TABLE `Ente` ADD COLUMN `direccion` TEXT NULL,
    ADD COLUMN `telefono` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Ratificacion` DROP COLUMN `penalty`;

-- AlterTable
ALTER TABLE `Solicitud` ADD COLUMN `businessDays` INTEGER NOT NULL DEFAULT 7,
    MODIFY `status` ENUM('EN_ESPERA', 'RESPONDIDA', 'VENCIDA', 'RATIFICADA', 'DERIVADA') NOT NULL DEFAULT 'EN_ESPERA';

-- CreateIndex
CREATE UNIQUE INDEX `Ratificacion_detailId_ratificationNumber_key` ON `Ratificacion`(`detailId`, `ratificationNumber`);
