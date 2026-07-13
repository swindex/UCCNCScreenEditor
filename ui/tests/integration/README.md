# Integration Tests

## Roundtrip Testing Strategy

We maintain parallel roundtrip tests for different SSF file format variants to ensure the Parser handles structural changes correctly.

### Test Files

- **`roundtrip-v1.test.ts`** - Tests `Default2019_v1.ssf` (baseline format)
- **`roundtrip-v2.test.ts`** - Tests `Default2019_v2.ssf` (variant with structural changes)
- **`roundtrip.test.ts`** - Original test file (legacy, can be kept or removed)

### How It Works

1. Each test parses an SSF file
2. Generates code via `parser.getCCode()`
3. Writes output to `.output.ssf` file for external comparison
4. Compares input vs output line-by-line
5. Reports differences with line numbers

### Workflow for Fixing Parser Issues

1. ✅ **Ensure v1 passes** - Baseline protection against regressions
2. ❌ **Run v2 test** - Identify what's broken
3. 🔧 **Fix Parser** - Update regex patterns or add new node classes
4. 🔁 **Re-run v2** - Verify fixes work
5. ✅ **Verify v1 still passes** - Ensure no regressions

### Running Tests

```bash
# Run all integration tests
npm test --workspace=ui

# Run specific variant
npm test --workspace=ui roundtrip-v1
npm test --workspace=ui roundtrip-v2

# Run with vitest UI for detailed diffs
npm test --workspace=ui -- --ui
```

### Output Files

The tests generate `.output.ssf` files that can be compared with the input files:
- `Default2019_v1.output.ssf`
- `Default2019_v2.output.ssf`

These files are git-ignored and can be diffed externally using tools like VS Code's diff view.
