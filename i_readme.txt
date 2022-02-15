FFP APP
-------

Source DB model (ffp-v9.2)

- Database configuration:
	There should be two existing users kadaster & kadaster_admin
	The App uses a schema called inspection to access data (no other schema is required)

- Initialize the database elements needed by the App by executing the following script:
    ./api/db_config/app_init.sql

- Update the type of the 'physical_id' field (existing values will be formated as an array)
    ./api/db_config/physical_ids.sql

-------

Create the necesary Apache configuration files (httpd_###.conf) based on the chosen
folder names for the source files.

    For the application: 'httpd_ffp.conf' :

        Alias /ffp/ "C:/code/ffp/"

        <Directory "C:/code/ffp/">
            AllowOverride All
            Options Indexes FollowSymLinks Multiviews ExecCGI
            AddHandler cgi-script .py
            Order allow,deny
            Allow from all
            Require all granted
        </Directory>
	
	
    For example 'httpd_basedata.conf' :

        Alias /ffp/ "C:/code/basedata/"

        <Directory "C:/code/basedata/">
            AllowOverride None
            Options Indexes FollowSymLinks Multiviews ExecCGI
            Order allow,deny
            Allow from all
        </Directory>	

-------

- Default App values such as language, SRID, etc. are stored in:
    ./api/settings.json

- Database connection details are stored in:
	./api/services/params.json
	The database’s name parameter is editable via the App (the database value in this file is not used by the app)

- Mosaic files (if available) should be named using the name of the corresponding database and located as follows:
    name:	 	mosaic_ffp_cumaribo.tif
                mosaic_ffp_cumaribo.tif.aux.xml
	            ...
	            (where ‘ffp_cumaribo’ is the name of the associated database)
    location: 	../basedata

- Attachments added trough the App are stored in:
	./images/uploads

-------

- Install the Digital PErsona service to communicate with figerprint readers

#---
# Digitalpersona connection (authorize this URLS)
#---

https://127.0.0.1:52181/get_connection
https://127.0.0.1:9001/connect
