import os
import asyncio
import subprocess
import tempfile
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self, max_concurrent: int = 3):
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
        self._max_concurrent = max_concurrent
        self._semaphore = None

    def _get_semaphore(self) -> asyncio.Semaphore:
        if self._semaphore is None:
            # Bounded semaphore to prevent browser process storms under high traffic
            self._semaphore = asyncio.Semaphore(self._max_concurrent)
        return self._semaphore

    def _render_sync(self, html_content: str) -> bytes:
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
                    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25)
                    if pdf_file.exists():
                        return pdf_file.read_bytes()
                except Exception as e:
                    logger.error(f"Browser PDF generation error: {e}")

            raise RuntimeError("PDF generation engine could not find or run browser.")

    def convert_html_to_pdf(self, html_content: str) -> bytes:
        return self._render_sync(html_content)

    async def convert_html_to_pdf_async(self, html_content: str) -> bytes:
        semaphore = self._get_semaphore()
        async with semaphore:
            return await asyncio.to_thread(self._render_sync, html_content)

pdf_service = PDFService()
