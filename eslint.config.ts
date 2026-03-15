import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"
import vueParser from 'vue-eslint-parser'
import markdown from "@eslint/markdown"
import css from "@eslint/css"
import { defineConfig } from "eslint/config"

export default defineConfig([
  js.configs.recommended,
  markdown.configs.recommended,
  css.configs.recommended,
  tseslint.configs.strictTypeChecked,
  pluginVue.configs["flat/essential"],

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    languageOptions: {
      globals: globals.browser,
      parser: vueParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser,
        projectService: true,
        sourceType: 'module',
      }
    },
  },

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports', // [prefer] `import { type T }`
          disallowTypeAnnotations: true,   // [error] `type T = import('Foo').Foo;`
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error'
      ],
      '@typescript-eslint/no-unnecessary-type-parameters': [
        // This rule is new, causing issues with constrained generics.
        // Either: the function needs to accept <T> or the caller needs
        // to cast to an expected ExtractModelType<PropertyType>.
        // Disabling the rule to allow constrained generics seems best.
        // For example:
        // get<T extends ExtractModelType<PropertyType>>(name: string): T;
        // set<T extends ExtractModelType<PropertyType>>(name: string, new_value: T): void;
        'off'
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        }
      ]
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[importKind="type"] ImportSpecifier',
          message: `
            import type { T } from './foo'; // <-- Discouraged

            import { type T } from './foo'; // <-- Preferred
            import type T from './foo';     // <-- Ok, for exactly 1 type import

            // Typical patterns.
            import Foo, { type IFooItem } from './foo';
            import Bar, {
              type IBarItem,
              BarItem,
            } from './foo';
            import type IBaz from './baz'
          `
        }
      ]
    },
  }
]);
