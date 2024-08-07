import { createObjectCsvStringifier } from 'csv-writer';
import puppeteer from 'puppeteer';

export interface StatisticsData {
  name: string;
  value: number;
  timestamp: Date;
}

export interface ClusteringData {
  name: string;
  value: number;
  timestamp: Date;
}

export interface ValidatedReportData {
  name: string;
  value: number;
  timestamp: Date;
}

type DataItem = StatisticsData | ClusteringData | ValidatedReportData;

abstract class ExportServiceBase {
  protected data: DataItem[];

  constructor(data: DataItem[]) {
    this.data = data;
  }

  async generateJson(): Promise<Buffer> {
    return Buffer.from(JSON.stringify(this.data, null, 2), 'utf-8');
  }

  abstract generateCsv(): Promise<Buffer>;
  abstract generatePdf(): Promise<Buffer>;
}

class StatisticExportService extends ExportServiceBase {
  async generateCsv(): Promise<Buffer> {
    if (Object.keys(this.data).length === 0) {
      throw new Error('No data available for CSV export');
    }

    const formattedData: Array<Record<string, string | number>> = [];
    for (const [type, severities] of Object.entries(this.data)) {
      for (const [severity, counts] of Object.entries(severities)) {
        formattedData.push({
          type,
          severity,
          ...counts,
        });
      }
    }

    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(formattedData[0] || {}).map((key) => ({
        id: key,
        title: key.toUpperCase(),
      })),
    });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);
    return Buffer.from(csv, 'utf-8');
  }

  async generatePdf(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();

      let htmlRows = '';
      for (const [type, severities] of Object.entries(this.data)) {
        for (const [severity, counts] of Object.entries(severities)) {
          htmlRows += `<tr>
                        <td>${type}</td>
                        <td>${severity}</td>
                        <td>${counts.PENDING}</td>
                        <td>${counts.REJECTED}</td>
                        <td>${counts.VALIDATED}</td>
                    </tr>`;
        }
      }

      const html = `
                <html>
                <head>
                    <style>
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    </style>
                </head>
                <body>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>PENDING</th>
                                <th>REJECTED</th>
                                <th>VALIDATED</th>
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
      const pdfBuffer = await page.pdf();
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }
}

class ClusteringExportService extends ExportServiceBase {
  async generateCsv(): Promise<Buffer> {
    if (Object.keys(this.data.clusters).length === 0 && this.data.noise.length === 0) {
      throw new Error('No data available for CSV export');
    }
    const clusterData = Object.entries(this.data.clusters)
      .filter(([key]) => key !== 'undefined')
      .flatMap(([key, coordinates], index) =>
        coordinates.map((coord) => ({
          id: `Cluster ${index}`,
          items: key,
          centroid: coord,
        }))
      );
    console.log(`\n\n\n  this.data.noise \n${JSON.stringify(this.data.noise)}\n\n\n`);
    const noiseData = this.data.noise.map((item, index) => ({
      id: `Noise ${index.toString()}`,
      items: item,
    }));

    const formattedData = [...clusterData, ...noiseData];

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'items', title: 'ITEMS' },
        { id: 'centroid', title: 'CENTROID' },
      ],
    });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);
    return Buffer.from(csv, 'utf-8');
  }

  async generatePdf(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();

      const clusterData = Object.entries(this.data.clusters)
        .filter(([key]) => key !== 'undefined')
        .flatMap(([key, coordinates], index) =>
          coordinates.map((coord) => ({
            id: `Cluster ${index}`,
            items: key,
            centroid: coord,
          }))
        );

      const noiseData = this.data.noise.map((item, index) => ({
        id: `Noise ${index.toString()}`,
        items: item,
      }));

      const formattedData = [...clusterData, ...noiseData];

      const htmlRows = formattedData
        .map(
          (record) => `
                <tr>
                    <td>${record.id}</td>
                    <td>${record.items}</td>
                    <td>${record.centroid}</td>
                </tr>
            `
        )
        .join('');

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
                    <table>
                        <thead>
                            <tr>
                                <th>Record Id</th>
                                <th>Items</th>
                                <th>Centroid</th>
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

class ValidatedExportService extends ExportServiceBase {
  async generateCsv(): Promise<Buffer> {
    if (Object.keys(this.data).length === 0) {
      throw new Error('No data available for CSV export');
    }

    const dataBySeverity = Array.from(new Set(this.data.map((e) => e.severity))).map((severity) => {
      const filteredData = this.data.filter((e) => e.severity === severity);
      const positions = filteredData.map((e) => [e.position.coordinates[0], e.position.coordinates[1]]);
      const reports = filteredData.map((e) => ({
        userId: e.userId,
        date: e.date,
        position: [e.position.coordinates[0], e.position.coordinates[1]],
      }));

      return {
        type: filteredData[0].type,
        severity: severity,
        positions: positions,
        reports: reports,
      };
    });

    const formattedData: Array<Record<string, string>>[] = [];
    dataBySeverity.forEach((dataByS) => {
      const { type, severity, positions, reports } = dataByS;
      formattedData.push({
        type,
        severity,
        positions: positions.map((p) => p.join(', ')).join('; '),
        reports: reports.map((r) => `userId: ${r.userId}, Date: ${r.date}, Position: ${r.position.join(', ')}`).join(' | '),
      });
    });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'type', title: 'TYPE' },
        { id: 'severity', title: 'SEVERITY' },
        { id: 'positions', title: 'POSITIONS' },
        { id: 'reports', title: 'REPORTS' },
      ],
    });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);
    return Buffer.from(csv, 'utf-8');
  }

  async generatePdf(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();

      let htmlRows = '';

      const dataBySeverity = Array.from(new Set(this.data.map((e) => e.severity))).map((severity) => {
        const filteredData = this.data.filter((e) => e.severity === severity);
        const positions = filteredData.map((e) => [e.position.coordinates[0], e.position.coordinates[1]]);
        const reports = filteredData.map((e) => ({
          userId: e.userId,
          date: e.date,
          position: [e.position.coordinates[0], e.position.coordinates[1]],
        }));

        return {
          type: filteredData[0].type,
          severity: severity,
          positions: positions,
          reports: reports,
        };
      });

      dataBySeverity.forEach((dataByS) => {
        const { type, severity, positions, reports } = dataByS;

        console.log('type, severity, positions, reports');
        console.log({ type, severity, positions, reports });

        htmlRows += `<tr>
                <td>${type}</td>
                <td>${severity}</td>
                <td>${positions.map((p) => p.join(', ')).join('; ')}</td>
                <td>${reports.map((r) => `UserId: ${r.userId}, Date: ${r.date}, Position: ${r.position.join(', ')}`).join('<br>')}</td>
            </tr>`;
      });

      const html = `
                <html>
                <head>
                    <style>
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    </style>
                </head>
                <body>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Positions</th>
                                <th>Reports</th>
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
      const pdfBuffer = await page.pdf();
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }
}

class ExportService {
  private statisticsExportService: StatisticExportService;
  private clusteringExportService: ClusteringExportService;
  private validatedExportService: ValidatedExportService;

  constructor(data: DataItem[]) {
    this.statisticsExportService = new StatisticExportService(data);
    this.clusteringExportService = new ClusteringExportService(data);
    this.validatedExportService = new ValidatedExportService(data);
  }
}

export default ExportService;
