const assert = require('node:assert/strict');
const { test } = require('node:test');
const { imageType, validPhoto } = require('../src/components/report/photo.ts');

test('accepts JPEG and PNG content with a known safe size', () => {
  const jpg = Uint8Array.from([255, 216, 255]);
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(imageType(jpg), 'image/jpeg');
  assert.equal(imageType(png), 'image/png');
  assert.equal(validPhoto(100, jpg), true);
  assert.equal(validPhoto(100, png), true);
  assert.equal(validPhoto(0, jpg), false);
  assert.equal(validPhoto(10 * 1024 * 1024 + 1, jpg), false);
  assert.equal(validPhoto(100, Uint8Array.from([255, 216])), false);
  assert.equal(validPhoto(100, Uint8Array.from([71, 73, 70, 56])), false);
});
