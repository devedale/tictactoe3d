import puppeteer from 'puppeteer';



abstract class ExportServiceBase {
  protected data: DataItem[];

  constructor(data: DataItem[]) {
    this.data = data;
  }

  async generateJson(): Promise<Buffer> {
    return Buffer.from(JSON.stringify(this.data, null, 2), 'utf-8');
  }

  abstract generatePdf(): Promise<Buffer>;
}

class MovesHistoryExportService extends ExportServiceBase {

    private data: DataItem[];  
    async generatePdf(): Promise<Buffer> {
        const browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    
        try {
          const page = await browser.newPage();
    
          // Genera le righe della tabella HTML
          let htmlRows = '';
          for (const move of this.data) {
            htmlRows += `<tr>
                            <td>${move.playerId}</td>
                            <td>${move.playerEmail}</td>
                            <td>[${move.position.join(', ')}]</td>
                            <td>${move.timestamp}</td>
                         </tr>`;
          }
    
          // HTML per il PDF
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
        } finally {
          await browser.close();
        }
    }
    

}

class ExportService {
  private movesHistoryExportService: MovesHistoryExportService;


  constructor(data: DataItem[]) {
    this.movesHistoryExportService = new MovesHistoryExportService(data);
  }
}

export default ExportService;
