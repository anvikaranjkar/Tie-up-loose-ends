import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      // Advisory rule from the React Compiler preset. This app intentionally
      // uses one-time setState inside effects for patterns that require it:
      // SSR-safe localStorage hydration, client-only randomized visuals (which
      // must initialize after mount to avoid hydration mismatches), audio
      // mount state, and scripted phase transitions. These are valid React, so
      // the rule is downgraded to a warning rather than blocking the build.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])

export default eslintConfig
