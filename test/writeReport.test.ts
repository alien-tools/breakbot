import { readFileSync } from 'fs';

import payloadv1 from './fixtures/maracas.v1.json';
import payloadv2 from './fixtures/maracas.v2.json';
import payloadv3 from './fixtures/maracas.v3.json';
import payloadv4 from './fixtures/maracas.v4.json';
import payloadv5 from './fixtures/maracas.v5.json';
import payloadv6 from './fixtures/maracas.v6.json';

import writeReport from '../src/report';

describe('Checks that the Json received from Maracas is correctly parsed', () => {
  test('parsing the new Json, with a root error', async (done) => {
    const myReport = writeReport(payloadv1, 10, 10, 10);

    const mockReportv1 = [
      readFileSync('./test/fixtures/reports/V1-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V1-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V1-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv1));
  });

  test('parsing the new Json, with 1 client in error', async (done) => {
    const myReport = writeReport(payloadv2, 10, 10, 10);

    const mockReportv2 = [
      readFileSync('./test/fixtures/reports/V2-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V2-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V2-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv2));
  });

  test('parsing the new Json, with 1 client', async (done) => {
    const myReport = writeReport(payloadv3, 10, 10, 10);

    const mockReportv3 = [
      readFileSync('./test/fixtures/reports/V3-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V3-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V3-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv3));
  });

  test('parsing the new Json, with several clients', async (done) => {
    const myReport = writeReport(payloadv4, 10, 10, 10);

    const mockReportv4 = [
      readFileSync('./test/fixtures/reports/V4-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V4-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V4-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv4));
  });

  test('parsing the new Json, with no clients', async (done) => {
    const myReport = writeReport(payloadv5, 10, 10, 10);

    const mockReportv5 = [
      readFileSync('./test/fixtures/reports/V5-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V5-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V5-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv5));
  });

  test('parsing the new Json, with too many BCs and detections', async (done) => {
    const myReport = writeReport(payloadv6, 1, 1, 1);

    const mockReportv6 = [
      readFileSync('./test/fixtures/reports/V6-title.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V6-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V6-message.md', 'utf-8'),
    ];

    done(expect(myReport).toStrictEqual(mockReportv6));
  });
});
