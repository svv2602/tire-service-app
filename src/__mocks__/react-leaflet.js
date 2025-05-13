module.exports = {
  MapContainer: ({ children }) => children,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }) => children,
  useMap: () => ({ setView: jest.fn() }),
};
