const assert = require('node:assert/strict');
const { test } = require('node:test');
const { catalogSections, publicServices } = require('../data/services.ts');

test('each directory selection opens matching catalog services', () => {
  assert.deepEqual(Object.keys(catalogSections), ['Dukcapil', 'Pajak PBB', 'Izin NIB', 'Bansos']);
  for (const [section, { category, query }] of Object.entries(catalogSections)) {
    const matches = publicServices.filter((service) => service.category === category && service.title.toLowerCase().includes(query.toLowerCase()));
    assert.ok(matches.length > 0, `${section} has no matching service`);
    if (section === 'Pajak PBB' || section === 'Izin NIB') assert.equal(matches.length, 1);
  }
});
