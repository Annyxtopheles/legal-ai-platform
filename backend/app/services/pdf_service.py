import os
import subprocess
import tempfile
from pathlib import Path

class PDFService:
    def __init__(self):
        self.chrome_paths = [
            r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
            r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
        ]
        self.browser_exe = None
        for p in self.chrome_paths:
            if os.path.exists(p):
                self.browser_exe = p
                break

    def convert_html_to_pdf(self, html_content: str) -> bytes:
        with tempfile.TemporaryDirectory() as tmpdir:
            html_file = Path(tmpdir) / "document.html"
            pdf_file = Path(tmpdir) / "document.pdf"

            html_file.write_text(html_content, encoding="utf-8")

            if self.browser_exe:
                cmd = [
                    self.browser_exe,
                    "--headless=new",
                    "--disable-gpu",
                    "--no-margins",
                    f"--print-to-pdf={str(pdf_file)}",
                    str(html_file)
                ]
                try:
                    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)
                    if pdf_file.exists():
                        return pdf_file.read_bytes()
                except Exception as e:
                    print(f"Browser PDF generation error: {e}")

            # If browser rendering failed or not found, return empty or raise
            raise RuntimeError("PDF generation engine could not find or run browser.")

pdf_service = PDFService()
