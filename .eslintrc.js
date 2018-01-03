module.exports = {
  env:{
    node: true,
    es6: true
  },
  parserOptions:{
    ecmaVersion: 8
  },
  plugins: ['unicorn'],
  rules:{
    'array-callback-return': 'warn',
    'arrow-parens': [ 'warn', 'always' ],
    'arrow-spacing': [ 'warn', { before: true, after: true } ],
    'arrow-body-style': [ 'warn', 'as-needed' ],
    'block-spacing': [ 'warn', 'always' ],
    'brace-style': [ 'warn', '1tbs', { allowSingleLine: true } ],
    camelcase: [ 'warn', { properties: 'never' } ],
    'comma-dangle': [ 'error', 'never' ],
    'comma-spacing': [ 'warn', { before: false, after: true } ],
    'comma-style': [ 'warn', 'last' ],
    'constructor-super': 'warn',
    curly: [ 'warn', 'multi-line' ],
    'default-case': [ 'warn', { commentPattern: '^no default$' } ],
    'dot-location': [ 'warn', 'property' ],
    'eol-last': 'error',
    eqeqeq: [ 'warn', 'allow-null' ],
    'func-call-spacing': [ 'warn', 'never' ],
    'generator-star-spacing': [ 'warn', { before: true, after: true } ],
    'guard-for-in': 'warn',
    indent: [ 'error', 2, { SwitchCase: 1 } ],
    'jsx-quotes': [ 'warn', 'prefer-double' ],
    'key-spacing': [ 'warn', {
      beforeColon: false,
      afterColon: true
    }],
    'keyword-spacing': [ 'warn', { before: true, after: true } ],
    'max-len': [ 'warn', 120, {
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true
    }],
    'new-cap': [ 'error', { newIsCap: true, capIsNew: false } ],
    'new-parens': 'warn',
    'no-array-constructor': 'warn',
    'no-caller': 'warn',
    'no-class-assign': 'warn',
    'no-cond-assign': [ 'warn', 'always' ],
    'no-const-assign': 'warn',
    'no-constant-condition': [ 'warn', { checkLoops: false } ],
    'no-control-regex': 'warn',
    'no-debugger': 'warn',
    'no-delete-var': 'warn',
    'no-dupe-args': 'warn',
    'no-dupe-class-members': 'warn',
    'no-dupe-keys': 'warn',
    'no-duplicate-case': 'warn',
    'no-duplicate-imports': 'error',
    'no-empty-character-class': 'warn',
    'no-empty-pattern': 'warn',
    'no-eval': 'error',
    'no-ex-assign': 'warn',
    'no-extend-native': 'error',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-extra-parens': [ 'warn', 'functions' ],
    'no-fallthrough': 'warn',
    'no-func-assign': 'warn',
    'no-global-assign': 'error',
    'no-implied-eval': 'warn',
    'no-invalid-regexp': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': [ 'warn', { allowLoop: false, allowSwitch: false } ],
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-mixed-operators': [ 'warn', {
      groups: [
        [ '&', '|', '^', '~', '<<', '>>', '>>>' ],
        [ '==', '!=', '===', '!==', '>', '>=', '<', '<=' ],
        [ '&&', '||' ],
        [ 'in', 'instanceof' ]
      ],
      allowSamePrecedence: false
    }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': [ 0 ],
    'no-multi-str': 'warn',
    'no-multiple-empty-lines': [ 'warn', { max: 1 } ],
    'no-native-reassign': 'warn',
    'no-negated-in-lhs': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-require': 'warn',
    'no-new-symbol': 'warn',
    'no-new-wrappers': 'warn',
    'no-obj-calls': 'warn',
    'no-octal': 'warn',
    'no-octal-escape': 'warn',
    'no-path-concat': 'warn',
    'no-proto': 'warn',
    'no-redeclare': 'warn',
    'no-regex-spaces': 'warn',
    'no-restricted-syntax': [ 'warn', 'LabeledStatement', 'WithStatement' ],
    'no-return-assign': [ 'warn', 'except-parens' ],
    'no-script-url': 'warn',
    'no-self-assign': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-sparse-arrays': 'warn',
    'no-tabs': 'error',
    'no-template-curly-in-string': 'warn',
    'no-this-before-super': 'warn',
    'no-throw-literal': 'warn',
    'no-trailing-spaces': 'warn',
    'no-undef': 'error',
    'no-undef-init': 'error',
    'no-unexpected-multiline': 'warn',
    'no-unneeded-ternary': [ 'warn', { defaultAssignment: false } ],
    'no-unreachable': 'warn',
    'no-unsafe-finally': 'warn',
    'no-unsafe-negation': 'warn',
    'no-unused-expressions': [ 'warn', {
      allowTernary: true,
      allowShortCircuit: true
    }],
    'no-unused-labels': 'warn',
    'no-unused-vars': [ 'warn', {
      vars: 'local',
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_|...props|props',
      args: 'after-used',
      ignoreRestSiblings: true
    }],
    'no-use-before-define': [ 'warn', 'nofunc' ],
    'no-useless-call': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': [ 'warn', {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false
    }],
    'no-var': 'warn',
    'no-whitespace-before-property': 'warn',
    'no-with': 'error',
    'object-curly-spacing': [ 'warn', 'always' ],
    'object-property-newline': [ 'warn', { allowMultiplePropertiesPerLine: true } ],
    'one-var': [ 0 ],
    'operator-assignment': [ 'warn', 'always' ],
    'operator-linebreak': [ 'warn', 'after', {
      overrides: {
        '?': 'before',
        ':': 'before'
      }
    }],
    'padded-blocks': [ 'warn', 'never' ],
    quotes: [ 'error', 'single', { avoidEscape: true } ],
    'quote-props': [ 'warn', 'as-needed' ],
    radix: 'warn',
    'require-yield': 'warn',
    'rest-spread-spacing': [ 'warn', 'never' ],
    semi: [ 'warn', 'never' ],
    'semi-spacing': [ 'warn', { before: false, after: true } ],
    'space-before-blocks': [ 'warn', 'always' ],
    'space-before-function-paren': [ 'warn', 'always' ],
    'space-in-parens': [ 'warn', 'never' ],
    'space-infix-ops': 'warn',
    'space-unary-ops': [ 'warn', { words: true, nonwords: false } ],
    'spaced-comment': [ 'warn', 'always', {
      line: { markers: [ '*package', '!', ',' ] },
      block: {
        balanced: true,
        markers: [ '*package', '!', ',' ],
        exceptions: [ '*' ]
      }
    }],
    strict: [ 'warn', 'never' ],
    'template-curly-spacing': [ 'warn', 'never' ],
    'unicode-bom': [ 'error', 'never' ],
    'use-isnan': 'warn',
    'valid-typeof': 'warn',
    'wrap-iife': [ 'warn', 'any' ],
    'yield-star-spacing': [ 'warn', 'both' ],
    yoda: [ 'warn', 'never' ],
    'unicorn/filename-case': [ 'error', {
      case: 'kebabCase'
    }],
    'unicorn/no-array-instanceof': 'warn',
    'unicorn/no-new-buffer': 'warn',
    'unicorn/prefer-starts-ends-with': 'warn',
    'unicorn/prefer-type-error': 'warn',
    'linebreak-style': [ 'error', 'unix' ]
  }
}
