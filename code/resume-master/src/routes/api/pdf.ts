import puppeteer from "puppeteer";
import { createFileRoute } from "@tanstack/react-router";

interface PdfRequestPayload {
  content: string;
  styles: string;
  margin?: number;
}

const buildHtml = (content: string, styles: string) => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      ${styles}
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
      }
      #resume-preview {
        width: 100%;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;

export const Route = createFileRoute("/api/pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let browser: puppeteer.Browser | null = null;

        try {
          const body = (await request.json()) as PdfRequestPayload;
          const content = body.content?.trim();
          const styles = body.styles ?? "";
          const margin = Number.isFinite(body.margin) ? Number(body.margin) : 0;

          if (!content) {
            return Response.json(
              { error: "Missing content for PDF export." },
              { status: 400 }
            );
          }

          browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
          });

          const page = await browser.newPage();
          await page.setViewport({ width: 1200, height: 1697, deviceScaleFactor: 2 });
          await page.setContent(buildHtml(content, styles), {
            waitUntil: "networkidle0"
          });

          const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
              top: `${margin}px`,
              right: `${margin}px`,
              bottom: `${margin}px`,
              left: `${margin}px`
            }
          });

          return new Response(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "inline; filename=resume.pdf",
              "Cache-Control": "no-store"
            }
          });
        } catch (error) {
          console.error("Local PDF export failed:", error);
          return Response.json(
            { error: "Failed to generate PDF." },
            { status: 500 }
          );
        } finally {
          if (browser) {
            await browser.close();
          }
        }
      }
    }
  }
});
