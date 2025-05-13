module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|react-leaflet|leaflet|@react-leaflet)/)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^leaflet$': '<rootDir>/src/__mocks__/leaflet.js',
    '^react-leaflet$': '<rootDir>/src/__mocks__/react-leaflet.js',
    '^.+\\.svg$': '<rootDir>/src/__mocks__/svgMock.js',
    '^axios$': '<rootDir>/src/__mocks__/axios.js',
  },
};
