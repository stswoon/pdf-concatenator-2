from pathlib import Path
from pypdf import PdfWriter

out = Path(__file__).resolve().parent.parent / 'test-fixtures' / 'encrypted-real.pdf'
writer = PdfWriter()
writer.add_blank_page(width=595, height=842)
# Standard public test password documented in test-cases.md
writer.encrypt(user_password='secret', owner_password='owner')
with open(out, 'wb') as f:
    writer.write(f)
print(out, out.stat().st_size)
