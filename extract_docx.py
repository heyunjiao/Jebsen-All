import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r'd:\Jebsen-front\Jebsen-Front-All\docs\Customer360项目需求规格说明书.docx'
out_path = r'd:\Jebsen-front\Jebsen-Front-All\docs_content_extracted.txt'

try:
    docx = zipfile.ZipFile(docx_path)
    content = docx.read('word/document.xml')
    tree = ET.fromstring(content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    paragraphs = []
    for p in tree.findall('.//w:p', ns):
        texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
        if texts:
            paragraphs.append(''.join(texts))
            
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(paragraphs))
    print(f"Successfully extracted to {out_path}")
except Exception as e:
    print(f"Error: {e}")
