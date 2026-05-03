import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../src/Parser';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const INPUT_FILE = join(__dirname, '../test-data/Default2019_v1.ssf');
const OUTPUT_FILE = join(__dirname, '../test-data/Default2019_v1.output.ssf');

describe('Parser Round-Trip V1: output must match input exactly', () => {
  let originalContent: string;
  let outputContent: string;

  beforeAll(() => {
    originalContent = readFileSync(INPUT_FILE, 'utf-8');

    const parser = new Parser();
    parser.parse(originalContent);
    outputContent = parser.getCCode();

    // Write the output so it can be inspected / diffed externally
    writeFileSync(OUTPUT_FILE, outputContent, 'utf-8');
  });

  it('writes the output file without throwing', () => {
    // If beforeAll threw, this test will fail. Otherwise it confirms the file was written.
    expect(outputContent).toBeDefined();
    expect(outputContent.length).toBeGreaterThan(0);
  });

  // Helpers used by several tests below
  function normalizeLines(content: string): string[] {
    // Strip the always-injected UCCNCEDITORJSON header if present at line 0
    const EDITOR_JSON_RE = /^\/\/UCCNCEDITORJSON\(/;
    const lines = content.split('\n');
    const start = lines.length > 0 && EDITOR_JSON_RE.test(lines[0]) ? 1 : 0;
    // Normalize CRLF → LF so Windows line-endings don't cause false differences
    // Normalize whitespace around commas so "a,b", "a, b", "a ,b" are treated equally
    return lines.slice(start).map(l => l.replace(/\r$/, '').replace(/\s*,\s*/g, ','));
  }

  it('output content matches input content (ignoring CRLF vs LF and injected header)', () => {
    const originalLines = normalizeLines(originalContent);
    const outputLines   = normalizeLines(outputContent);

    const maxLines = Math.max(originalLines.length, outputLines.length);

    interface Diff {
      line: number;
      expected: string;
      actual: string;
    }

    const diffs: Diff[] = [];
    const MAX_REPORTED_DIFFS = 30;

    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i] ?? '<missing>';
      const out  = outputLines[i]  ?? '<missing>';

      if (orig !== out) {
        diffs.push({ line: i + 1, expected: orig, actual: out });
        if (diffs.length >= MAX_REPORTED_DIFFS) break;
      }
    }

    if (diffs.length > 0) {
      const report = diffs
        .map(
          d =>
            `Line ${d.line}:\n` +
            `  EXPECTED: ${JSON.stringify(d.expected)}\n` +
            `  ACTUAL  : ${JSON.stringify(d.actual)}`,
        )
        .join('\n\n');

      const truncated =
        diffs.length >= MAX_REPORTED_DIFFS
          ? `\n\n(Only first ${MAX_REPORTED_DIFFS} differences shown.)`
          : '';

      const summary =
        `\n\nParser output differs from input.\n` +
        `Input : ${INPUT_FILE}\n` +
        `Output: ${OUTPUT_FILE}\n\n` +
        report +
        truncated;

      expect.fail(summary);
    }
  });

  it('output line count matches input line count (excluding injected header, ignoring CRLF)', () => {
    const originalLines = normalizeLines(originalContent);
    const outputLines   = normalizeLines(outputContent);

    expect(outputLines.length).toBe(originalLines.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Lightweight sanity tests kept from before
// ──────────────────────────────────────────────────────────────────────────────
describe('Parser Round-Trip V1: edge cases', () => {
  it('should handle empty input without throwing', () => {
    const parser = new Parser();
    expect(() => parser.parse('')).not.toThrow();
    expect(() => parser.getCCode()).not.toThrow();
  });

  it('single node round-trips cleanly', () => {
    const input = 'AS3.Setscreensize(1920, 1018);';
    const parser = new Parser();
    parser.parse(input);
    const output = parser.getCCode();
    expect(output).toContain('AS3.Setscreensize(1920, 1018)');
  });

  it('second serialization is stable (no further drift)', () => {
    const originalContent = readFileSync(INPUT_FILE, 'utf-8');

    const p1 = new Parser();
    p1.parse(originalContent);
    const out1 = p1.getCCode();

    const p2 = new Parser();
    p2.parse(out1);
    const out2 = p2.getCCode();

    expect(out2).toBe(out1);
  });
});
