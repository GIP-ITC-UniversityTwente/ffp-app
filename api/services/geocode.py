#!C:\ms4w\Python\python.exe

import cgi
import geocoder
import json

params = cgi.FieldStorage()
lat = params.getvalue('lat')
lon = params.getvalue('lon')

if lat is None or lon is None:
    print ("Content-type: text/plain")
    print ()
    print ('lat or lon parameter missing')

else:
    data = geocoder.osm([lat, lon], method = 'reverse')

    print ("Content-Type: application/json")
    print ("Access-Control-Allow-Origin: *")
    print ("Access-Control-Allow-Methods: GET")
    print ("Access-Control-Allow-Headers: Content-Type")
    print ()
    print (json.dumps(data.json))
