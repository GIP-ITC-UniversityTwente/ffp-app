
BEGIN;

	ALTER TABLE inspection.spatialunit
    ADD COLUMN phy_ids character varying;
	
	UPDATE inspection.spatialunit
	SET phy_ids = physical_id;

	UPDATE inspection.spatialunit
	SET physical_id = null;
	
	ALTER TABLE inspection.spatialunit
	ALTER COLUMN physical_id TYPE text[] USING physical_id::text[];
		
	UPDATE inspection.spatialunit
	SET physical_id = 
	array[split_part(replace(rtrim(replace(phy_ids, E'\n', ' ' )), ' ', ','),',',1),
		  split_part(replace(rtrim(replace(phy_ids, E'\n', ' ' )), ' ', ','),',',2)]

	UPDATE inspection.spatialunit
	SET physical_id = array_remove(physical_id, '')
	
	ALTER TABLE inspection.spatialunit 
	DROP COLUMN phy_ids;
	
END;