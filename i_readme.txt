FFP APP
-------

Source DB file (2020-09-25_TrainingDataset_processed.backup)

- Database configuration:
	There should be two existing users kadaster & kadaster_admin
	The App uses a schema called inspection to access data (no other schema is required)

- Initialize the database elements needed by the App by executing the following script:
    ./api/init_db/app_init.sql

- Update the type of the 'physical_id' field (existing values will be formated as an array)
    ./api/init_db/physical_ids.sql

-------

Create the necesary Apache configuration files (httpd_###.conf) based on the chosen
folder names for the source files.

    For example 'httpd_ffp.conf' :

        Alias /ffp/ "C:/ffp/"

        <Directory "C:/ffp/">
            AllowOverride All
            Options Indexes FollowSymLinks Multiviews ExecCGI
            AddHandler cgi-script .py
            Order allow,deny
            Allow from all
            Require all granted
        </Directory>

-------

- Default App values such as language, SRID, etc. are stored in:
    ./models/config.js

- Database connection details are stored in:
	./api/params.json
	The database’s name parameter is editable via the App (the database value in this file is not used)

- Mosaic files (if available) should be named using the name of the corresponding database and located as follows:
    name:	 	mosaic_ffp_cumaribo.tif
                mosaic_ffp_cumaribo.tif.aux.xml
	            ...
	            (where ‘ffp_cumaribo’ is the name of the associated database)
    location: 	../basedata

- Attachments added trough the App are stored in:
	./images/uploads




#---
# Digitalpersona connection (authorize this URLS)
#---

https://127.0.0.1:52181/get_connection
https://127.0.0.1:9001/connect