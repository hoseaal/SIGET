-- Rename Ente fields without removing existing values.
ALTER TABLE `Ente`
    CHANGE COLUMN `rif` `taxId` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `siglas` `acronym` VARCHAR(191) NULL,
    CHANGE COLUMN `autoridad` `authority` VARCHAR(191) NULL,
    CHANGE COLUMN `telefono` `phone` VARCHAR(191) NULL,
    CHANGE COLUMN `direccion` `address` TEXT NULL,
    DROP INDEX `Ente_rif_key`,
    ADD UNIQUE INDEX `Ente_taxId_key` (`taxId`);
