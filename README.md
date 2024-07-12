# Fit-for-Purpose (FfP) App

©2023 Javier Morales - <a href="mailto:j.morales@utwente.nl">j.morales@utwente.nl</a>


### Version

    3.5.1 -> Production release


### Requirements:
                   -
    * Apache        |
    * MapServer     |--> bundled with "MS4W"
    * Python 3      |
                   -

    * FfP data model v9.4

An FfP edited database (see [ffp-pg_scripts](https://github.com/GIP-ITC-UniversityTwente/ffp-pg_scripts))


### Configuration

Run the `apache_mapserver_configuration.bat` script to create the required configuration elements in Apache/MapServer to run the app. This script can be found in the [
ffp-pg_scripts](https://github.com/GIP-ITC-UniversityTwente/ffp-pg_scripts) repository.

	- Default App values such as language, SRID, etc. are stored in:

		./api/settings.json


	- Database connection details are stored in:

		./api/services/params.json

		The database’s name parameter is editable via the App
		(the database value in this file is not used by the app)


	- Mosaic files (if available) should be named using the name of the corresponding database and stored as follows:

		name:	mosaic_ffp_cumaribo.tif
					mosaic_ffp_cumaribo.tif.aux.xml
					...
				(where ‘ffp_cumaribo’ is the name of the associated database)

		location: 	../basedata


	- Attachments added through the App are stored in:
		./images/uploads
