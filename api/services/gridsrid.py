#!C:\ms4w\Python\python.exe
import re

s = 'init=epsg:'
file = open('graticule.map', 'r')
out = open('res.map', 'w')
lines = file.readlines()

pattern = r'.*?\:(.*)\",*'

newLines = []
count = 0

for line in lines:
    if s in line:
        print(line)
        if count > 0:
            match = re.search(pattern, line)
            n = match.group(1)
            line = line.replace(n, '1111')
        else:
            count += 1
    newLines.append(line)

out.writelines(newLines)

file.close()
out.close()
