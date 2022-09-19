import { readFileSync } from 'fs';

import maracasError from './fixtures/maracas/maracas.error.json';
import maracasClientErrors from './fixtures/maracas/maracas.client-errors.json';
import maracasOneClient from './fixtures/maracas/maracas.one-client.json';
import maracasTwoClients from './fixtures/maracas/maracas.two-clients.json';
import maracasNoClient from './fixtures/maracas/maracas.no-client.json';
import maracasTooMany from './fixtures/maracas/maracas.too-many.json';
import maracasTooBig from './fixtures/maracas/maracas.too-big.json';

import writeReport from '../src/report';

describe('Checks whether Markdown reports are correctly generated', () => {
  test('Report with a root error', async () => {
    const report = writeReport(maracasError, 10, 10, 10);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V1-summary.md', 'utf-8'),
      readFileSync('./test/fixtures/reports/V1-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('Report with client errors', async () => {
    const report = writeReport(maracasClientErrors, 10, 10, 10);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V2-summary.md', 'utf-8').trim(),
      readFileSync('./test/fixtures/reports/V2-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('Report with one client', async () => {
    const report = writeReport(maracasOneClient, 10, 10, 10);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V3-summary.md', 'utf-8').trim(),
      readFileSync('./test/fixtures/reports/V3-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('Report with several clients', async () => {
    const report = writeReport(maracasTwoClients, 10, 10, 10);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V4-summary.md', 'utf-8').trim(),
      readFileSync('./test/fixtures/reports/V4-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('Report without clients', async () => {
    const report = writeReport(maracasNoClient, 10, 10, 10);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V5-summary.md', 'utf-8').trim(),
      readFileSync('./test/fixtures/reports/V5-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('Report with too many BCs and broken uses', async () => {
    const report = writeReport(maracasTooMany, 1, 1, 1);

    const fixtureReport = [
      'BreakBot Report',
      readFileSync('./test/fixtures/reports/V6-summary.md', 'utf-8').trim(),
      readFileSync('./test/fixtures/reports/V6-message.md', 'utf-8').trim(),
    ];

    expect(report)
      .toStrictEqual(fixtureReport);
  });

  test('A report that\'s > 65k characters gets truncated', async () => {
    const [
      title,
      summary,
      message,
    ] = writeReport(maracasTooBig, 100, 100, 100);

    expect(JSON.stringify({ title, summary, message }).length).toBeLessThan(65535);
  });
});
