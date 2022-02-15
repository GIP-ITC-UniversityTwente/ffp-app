from lxml import html

file = open('D:\\code\\ffp\\ffp_app_v3.2\\api\\28992.html')
root = html.parse(file)

el = root.xpath('//div[@id="mini-map"]//a//img/@src')[1]

print(el)



