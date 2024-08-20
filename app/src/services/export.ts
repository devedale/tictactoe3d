import puppeteer from 'puppeteer';

/** Abstract base class for export services. Defines the common interface for generating JSON and PDF exports. */
abstract class ExportServiceBase {
  protected data: DataItem[];

  /** @param data - Array of data items to be exported. */
  constructor(data: DataItem[]) {
    this.data = data;
  }

  /**
   * Generates a JSON representation of the data.
   *
   * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the JSON data.
   */
  async generateJson(): Promise<Buffer> {
    try {
      return Buffer.from(JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a PDF representation of the data. This method must be implemented by subclasses.
   *
   * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the PDF data.
   */
  abstract generatePdf(): Promise<Buffer>;
}

/** Concrete implementation of ExportServiceBase for exporting moves history as PDF. */
class MovesHistoryExportService extends ExportServiceBase {
  // Overrides data from base class, redundant since data is already inherited from the base class.
  // private data: DataItem[];

  /**
   * Generates a PDF representation of the moves history data.
   *
   * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the PDF data.
   */
  async generatePdf(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Generate HTML rows for the table
      let htmlRows = '';
      for (const move of this.data) {
        htmlRows += `<tr>
                        <td>${move.playerId}</td>
                        <td>${move.playerEmail}</td>
                        <td>[${move.position.join(', ')}]</td>
                        <td>${move.timestamp}</td>
                     </tr>`;
      }

      // HTML content for the PDF
      const html = `
        <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Moves History</h1>
          <table>
            <thead>
              <tr>
                <th>Player ID</th>
                <th>Player Email</th>
                <th>Position</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
        </body>
        </html>
      `;

      await page.setContent(html);
      const pdfBuffer = await page.pdf({ format: 'A4' });

      return pdfBuffer;
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
    }
  }
}

/** Service class for managing different export services. */
class ExportService {
  private movesHistoryExportService: MovesHistoryExportService;

  /** @param data - Array of data items to be used for exporting. */
  constructor(data: DataItem[]) {
    this.movesHistoryExportService = new MovesHistoryExportService(data);
  }
}

export default ExportService;
