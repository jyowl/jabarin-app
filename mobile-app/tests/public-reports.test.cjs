const assert = require('node:assert/strict');
const { test } = require('node:test');
const { filterPublicReports, resolveReportCategory } = require('../src/components/report/public-reports.ts');

test('public report filter returns only the selected category', () => {
  assert.equal(filterPublicReports('Semua').length, 5);
  assert.deepEqual(filterPublicReports('Administrasi').map((item) => item.id), ['#JBR-02412']);
  assert.ok(filterPublicReports('Jalan').every((item) => item.category === 'Jalan'));
  assert.ok(filterPublicReports('Kebersihan').every((item) => item.category === 'Kebersihan'));
});

test('map category follows each incoming parameter', () => {
  assert.equal(resolveReportCategory('Jalan'), 'Jalan');
  assert.equal(resolveReportCategory('Kebersihan'), 'Kebersihan');
  assert.equal(resolveReportCategory('unknown'), 'Semua');
});

test('sample markers have valid approximate coordinates', () => {
  for (const report of filterPublicReports('Semua')) {
    assert.ok(report.coordinate.latitude >= -90 && report.coordinate.latitude <= 90);
    assert.ok(report.coordinate.longitude >= -180 && report.coordinate.longitude <= 180);
  }
});
