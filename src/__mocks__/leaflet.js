const L = {
  map: jest.fn(),
  tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
  marker: jest.fn(() => ({ addTo: jest.fn(), bindPopup: jest.fn() })),
  icon: jest.fn(),
  Icon: {
    Default: function () {},
  },
};
L.Icon.Default.prototype = {
  _getIconUrl: jest.fn(),
};
L.Icon.Default.mergeOptions = jest.fn();
module.exports = L;
