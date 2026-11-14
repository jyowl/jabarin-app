const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validateReport, parsePickerDraft } = require('../src/components/report/validation.ts');

test('report review requires all fields and rejects whitespace', () => {
  assert.ok(validateReport(' ', 'Jalan', 'Bandung', 'Rusak'));
  assert.ok(validateReport('Jalan rusak', '', 'Bandung', 'Rusak'));
  assert.ok(validateReport('Jalan rusak', 'Jalan', ' ', 'Rusak'));
  assert.ok(validateReport('Jalan rusak', 'Jalan', 'Bandung', ' '));
  assert.equal(validateReport('Jalan rusak', 'Jalan', 'Bandung', 'Rusak'), '');
});

test('picker draft can be restored and rejects invalid snapshots', () => {
  const draft = { title: 'Jalan rusak', category: 'Jalan', district: 'Bandung', details: 'Lubang', photo: null };
  assert.deepEqual(parsePickerDraft(JSON.stringify(draft)), draft);
  assert.throws(() => parsePickerDraft('{}'));
  assert.throws(() => parsePickerDraft('not json'));
});
