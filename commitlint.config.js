module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI configuration changes
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Revert a previous commit
      ],
    ],
    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Subject max length
    'subject-max-length': [2, 'always', 100],
  },
};

