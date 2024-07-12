#!C:\ms4w\Python\python.exe


# #!/usr/bin/python3

import json
import cgi
import datetime

#   {'jm-UT' : '2001:67c:2564:ad00::e:102b'} 82.75.205.215 130.89.110.20
#   {'jm-UT' : '2001:67c:2564:ad00::e:1010'}
#   {'nicolas' : '186.80.128.185'}
#   {'laura' : '191.156.72.72'}
#   {'cumaribo' : '186.190.225.170'}
#   {'John Jairo' : '181.58.248.230'}
#   {'Oliver' : '181.154.63.70'}
#   {'Viviana' : '186.84.88.134' - '186.84.22.84'}


validIps = {
    'JM' : '2001:67c:2564:a303:b107:91ca:9ddb:adff',
    'Nicolas Porras' : '186.80.128.185',
    'Laura Becerra' : '191.156.72.72'
}

params = cgi.FieldStorage()
data = json.loads(params.getvalue('data'))
now = datetime.datetime.now()
data['datetime'] = now.strftime("%Y-%m-%d %H:%M:%S")

ip = data['ip']
if ip in validIps.values():
    idx = list(validIps.values()).index(ip)
    user = list(validIps.keys())[idx]
    response = '{"success" : true, "user" : "%s"}' % user
    data['user'] = user
else:
    response = '{"success" : false, "message" : "Not Authorized!!!"}'
    data['user'] = "Not Authorized!!!"

#------
fv = open("geoiplookup.map","a")
fv.write(json.dumps(data) + " \n")
fv.write("--- \n")
fv.close()
#------


print ("Content-type: application/json")
print ()
print (response)