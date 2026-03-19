import puppeteer from "puppeteer";
import { createFileRoute } from "@tanstack/react-router";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "@/lib/a4";

interface PdfRequestPayload {
  content: string;
  styles: string;
  margin?: number;
}

interface BrowserLaunchCandidate {
  name: string;
  options: Parameters<typeof puppeteer.launch>[0];
}

const BASE_PUPPETEER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

const jsonError = (
  status: number,
  code: string,
  message: string,
  details?: string
) =>
  Response.json(
    {
      code,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );

const buildHtml = (content: string, styles: string, contentWidthPx: number) => `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      ${styles}
      html, body {
        margin: 0;
        padding: 0;
        width: ${contentWidthPx}px;
        background: #fff;
      }
      #resume-preview {
        width: ${contentWidthPx}px;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;

const createLaunchCandidates = async () => {
  const candidates: BrowserLaunchCandidate[] = [
    {
      name: "default",
      options: {
        headless: true,
        args: BASE_PUPPETEER_ARGS,
      },
    },
  ];

  const envExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envExecutablePath) {
    candidates.push({
      name: "env",
      options: {
        headless: true,
        executablePath: envExecutablePath,
        args: BASE_PUPPETEER_ARGS,
      },
    });
  }

  try {
    const chromiumModule = await import("@sparticuz/chromium");
    const chromium = (chromiumModule as any).default ?? chromiumModule;
    const executablePath =
      typeof chromium?.executablePath === "function"
        ? await chromium.executablePath()
        : "";

    if (typeof executablePath === "string" && executablePath.length > 0) {
      const chromiumArgs = Array.isArray(chromium?.args) ? chromium.args : [];
      const sparticuzArgs = Array.from(
        new Set([...BASE_PUPPETEER_ARGS, ...chromiumArgs])
      );
      candidates.push({
        name: "sparticuz",
        options: {
          headless:
            typeof chromium?.headless === "boolean" ? chromium.headless : true,
          executablePath,
          args: sparticuzArgs,
        },
      });
    }
  } catch {
    // Ignore: this fallback is optional in local environments.
  }

  return candidates;
};

export const Route = createFileRoute("/api/pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let browser: puppeteer.Browser | null = null;
        const launchErrors: string[] = [];

        try {
          let body: PdfRequestPayload;
          try {
            body = (await request.json()) as PdfRequestPayload;
          } catch {
            return jsonError(
              400,
              "PDF_INVALID_REQUEST",
              "Invalid JSON payload for PDF export."
            );
          }

          const content = body.content?.trim();
          const styles = body.styles ?? "";
          const rawMargin = Number(body.margin);
          const margin = Number.isFinite(rawMargin) ? Math.max(0, rawMargin) : 0;

          if (!content) {
            return jsonError(
              400,
              "PDF_INVALID_REQUEST",
              "Missing content for PDF export."
            );
          }

          const contentWidth = Math.max(
            320,
            Math.floor(A4_WIDTH_PX - margin * 2)
          );
          const launchCandidates = await createLaunchCandidates();

          for (const candidate of launchCandidates) {
            try {
              browser = await puppeteer.launch(candidate.options);
              break;
            } catch (error) {
              launchErrors.push(`[${candidate.name}] ${toErrorMessage(error)}`);
            }
          }

          if (!browser) {
            return jsonError(
              500,
              "PDF_LAUNCH_FAILED",
              "Failed to launch Chromium for PDF export.",
              launchErrors.join(" | ")
            );
          }

          const page = await browser.newPage();
          await page.setViewport({
            width: contentWidth,
            height: Math.ceil(A4_HEIGHT_PX),
            deviceScaleFactor: 2,
          });
          await page.setContent(buildHtml(content, styles, contentWidth), {
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
          return jsonError(
            500,
            "PDF_RENDER_FAILED",
            "Failed to generate PDF.",
            toErrorMessage(error)
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
