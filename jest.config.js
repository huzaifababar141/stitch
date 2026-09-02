module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          rootDir: '.',
          jsx: 'react-jsx',
        },
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
};
