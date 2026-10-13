const { test } = require('node:test');
const assert = require('node:assert/strict');
const { priceItems } = require('../catalog');
test('server overrides manipulated client prices', () => {
  assert.equal(priceItems([{ name: 'Dangote Cement', size: '50kg', quantity: 2, price: '-100' }])[0].price, '5500');
});
test('rejects invalid quantities and unknown products', () => {
  for (const quantity of [-1, 0, 1.5, 10000, '2']) assert.throws(() => priceItems([{ name: 'Coal', quantity }]));
  assert.throws(() => priceItems([{ name: 'fake', quantity: 1 }]));
  assert.throws(() => priceItems([]));
});
