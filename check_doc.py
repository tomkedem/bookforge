import sys
sys.path.insert(0, 'src')
from pipeline.ingest import ingest

result = ingest(r'D:\Books\Lesson 1- Introduction to AI Engineering and Generative AI.docx')
paras = result.get('paragraphs', [])

print(f"Total paragraphs: {len(paras)}")
print("\nFirst 20 paragraphs:")
for i, p in enumerate(paras[:20]):
    style = p.get('style', '')
    text = p.get('text', '')[:100]
    print(f"[{i}] {style:20} | {text}")
