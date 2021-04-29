
from lxml import html
import requests

url = "http://epsg.io/28992"
page = requests.get(url)

file = open('D:\\code\\ffp\\ffp_app_v3.2\\api\\28992.html')
root = html.parse(file)

el = root.xpath('//div[@class="well credit"]//span/@text')[0]
el = root.xpath('//div[@class=" center-mobile"]')

el = root.xpath('//div[@id="mini-map"]//a//img')[0]