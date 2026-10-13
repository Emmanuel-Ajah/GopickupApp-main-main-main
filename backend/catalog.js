// Pilot catalog prices in naira; the server is authoritative.
const prices = {
  'Dangote Cement|50kg': 5500, 'BUA Cement|50kg': 5500, 'Mangal Cement|50kg': 5500,
  'Roofing Sheet|Zinc': 3000, 'Steel Rods|12mm, 16mm': 9800,
  'Hollow Blocks|9 inches': 600, 'Hollow Blocks|6 inches': 500, 'Coal|': 7300000,
  ...Object.fromEntries(['Pure Dust (Dust 1)','Stone Dust (Dust 2)','3/8','Half inch','3/4','1 inch','Hard core','Boulder'].map(name => [name + '|', 9600])),
};
exports.priceItems = (items) => {
  const invalid = () => { const error = new Error('Choose valid catalog items and quantities (1–9999).'); error.status = 400; throw error; };
  if (!Array.isArray(items) || !items.length || items.length > 100) return invalid();
  return items.map(item => {
    const price = prices[`${item?.name}|${item?.size || ''}`];
    if (price === undefined || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 9999) return invalid();
    return { name: item.name, size: item.size || '', quantity: item.quantity, price: String(price) };
  });
};
