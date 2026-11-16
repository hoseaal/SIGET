-- Keep the existing tax ID values while restoring the domain-specific column name.
ALTER TABLE `Ente`
    DROP INDEX `Ente_taxId_key`,
    CHANGE COLUMN `taxId` `rif` VARCHAR(191) NOT NULL,
    ADD UNIQUE INDEX `Ente_rif_key` (`rif`);
