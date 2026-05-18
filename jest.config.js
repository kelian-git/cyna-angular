module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|rxjs)'],
  // La couverture est mesurée sur la couche logique testée unitairement
  // (services, utils, guards, intercepteurs) + composants UI clés. Les pages
  // (features/) sont essentiellement déclaratives et couvertes en e2e.
  collectCoverageFrom: [
    'src/app/core/services/**/*.ts',
    'src/app/core/utils/**/*.ts',
    'src/app/core/guards/**/*.ts',
    'src/app/core/interceptors/**/*.ts',
    'src/app/shared/ui/button/button.component.ts',
    'src/app/shared/ui/product-card/product-card.component.ts',
    'src/app/shared/components/header/header.component.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: { lines: 70, functions: 70, branches: 60, statements: 70 },
  },
};
