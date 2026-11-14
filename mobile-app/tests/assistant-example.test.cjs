const assert = require('node:assert/strict');
const { test } = require('node:test');
const { exampleTime, hasExampleAnswer } = require('../src/components/assistant/example.ts');

test('only the example BPJS question receives the example answer', () => {
  assert.equal(hasExampleAnswer('  bagaimana cara cek status bpjs?  '), true);
  assert.equal(hasExampleAnswer('Bagaimana cara melapor?'), false);
  assert.equal(hasExampleAnswer(''), false);
});

test('example timestamp keeps the send date after the day changes', () => {
  const sent = new Date(2026, 10, 13, 9, 41);
  assert.equal(exampleTime(sent, new Date(2026, 10, 13, 20)), 'Hari ini · 09.41');
  assert.equal(exampleTime(sent, new Date(2026, 10, 14)), '13 November 2026 · 09.41');
});
