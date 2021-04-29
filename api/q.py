#!C:\ms4w\Python\python.exe

import cgi
import json

params = cgi.FieldStorage()
ftype = params.getvalue('type')
function = str(params.getvalue('function'))

print ("Content-type: application/json")
print ()
print ('{"function" : "' + function + '", "type" : "' + ftype + '"}')
print (params)
