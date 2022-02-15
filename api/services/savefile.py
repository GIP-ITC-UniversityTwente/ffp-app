#!C:\ms4w\Python\python.exe

import cgi
from PIL import Image
import io
import uuid
import base64


def upload():
    image_data = data.getvalue('upload')
    file_name = data.getvalue('upload_fullpath')

    formatError = False
    try:
        Image.open(io.BytesIO(image_data))
    except OSError:
        formatError = True

    print ("Content-type: Application/json")
    print ()

    if formatError:
        print ('{ "status" : "error", "file_name" : "' + file_name + '", "success" : false }')
    else:
        rawImage = Image.open(io.BytesIO(image_data))
        attachment = rawImage.convert('RGB')
        globalid = '{' + str(uuid.uuid4()) + '}'
        attachment.save('../../images/uploads/' + globalid + '.jpg')
        print ('{ "success" : true, "globalid" : "' + globalid + '" }')
#-- upload ---



def capture():
    globalid = data.getvalue('globalid')
    attachment_data = data.getvalue('attachment_data').replace("data:image/png;base64,", "")

    imageFile = open('../../images/uploads/' + globalid + '.jpg', "wb")
    imageFile.write(base64.b64decode(attachment_data))
    print ("Content-type: Application/json")
    print ()
    print ('{ "success" : true, "globalid" : "' + globalid + '" }')
#-- capture ---



#--- main ---
data = cgi.FieldStorage()
mode = data.getvalue('mode')
if mode == 'upload':
    upload()
elif mode == 'capture':
    capture()
else:
    print ("Content-type: Application/json")
    print ()
    print ('{ "status" : "error", "message" : "No valid mode provided" }')