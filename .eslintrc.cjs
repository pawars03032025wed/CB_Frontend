module.exports = {
  plugins: ['@firebase/security-rules'],
  extends: ['plugin:@firebase/security-rules/recommended'],
  rules: {
    '@firebase/security-rules/no-unprotected-collections': 'error',
  },
  overrides: [
    {
      files: ['firestore.rules'],
      parser: '@firebase/security-rules/parser',
    },
  ],
};
