# Fit-for-Purpose (FfP) App

©2022 Javier Morales - <a href="mailto:j.morales@utwente.nl">j.morales@utwente.nl</a>


### Version

    3.5.1 -> Production release


### Requirements:
                   -
    * Apache        |
    * MapServer     |--> bundled with "ms4w"
    * Python 3      |
                   - 
				   
	* Python libraries
		- pathlib
		- psycopg2
		- geocoder
					
    * FfP data model v9.2
		For each database execute the "app_init" script located in "./api/dbconfig"
		
	* A Digital Persona service is required to communicate with figerprint readers
	

### Configuration

	* Create the necesary Apache configuration files (httpd_###.conf)
	
	
		- For the application: "httpd_ffp.conf":

			Alias /ffp/ "C:/code/ffp/"
			<Directory "C:/code/ffp/">
				AllowOverride All
				Options Indexes FollowSymLinks Multiviews ExecCGI
				AddHandler cgi-script .py
				Order allow,deny
				Allow from all
				Require all granted
			</Directory>
			
			
		- For the base data
			
			Alias /basedata/ "C:/code/basedata/"
			<Directory "C:/code/basedata/">
				AllowOverride None
				Options Indexes FollowSymLinks Multiviews ExecCGI
				Order allow,deny
				Allow from all
			</Directory>
			
			
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