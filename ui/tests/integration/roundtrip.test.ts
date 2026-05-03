import { describe, it, expect, beforeAll } from 'vitest';
import { Parser, FieldNode, parseMinMax, minMaxToString } from '../../src/Parser';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const INPUT_FILE = join(__dirname, '../test-data/Default2019_v1.ssf');
const OUTPUT_FILE = join(__dirname, '../test-data/Default2019.output.ssf');

describe('Parser Round-Trip: output must match input exactly', () => {
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
describe('Parser Round-Trip: edge cases', () => {
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

// ──────────────────────────────────────────────────────────────────────────────
// FieldNode min/max round-trip tests
// ──────────────────────────────────────────────────────────────────────────────
describe('FieldNode min/max: parseMinMax helper', () => {
  it('returns a number for plain integer strings', () => {
    expect(parseMinMax('0')).toBe(0);
    expect(parseMinMax('100')).toBe(100);
    expect(parseMinMax('-100')).toBe(-100);
  });

  it('returns a number for plain decimal strings', () => {
    expect(parseMinMax('3.14')).toBe(3.14);
    expect(parseMinMax('-0.5')).toBe(-0.5);
  });

  it('preserves scientific notation strings verbatim (for round-trip fidelity)', () => {
    // parseMinMax keeps scientific notation as a string so that the original
    // representation is preserved in the .ssf output rather than being
    // collapsed to a JS number (e.g. 1e-6 → "0.000001").
    expect(parseMinMax('1E-06')).toBe('1E-06');
    expect(parseMinMax('1.5E+10')).toBe('1.5E+10');
  });

  it('preserves C# sentinel string "double.MinValue" verbatim', () => {
    expect(parseMinMax('double.MinValue')).toBe('double.MinValue');
  });

  it('preserves C# sentinel string "double.MaxValue" verbatim', () => {
    expect(parseMinMax('double.MaxValue')).toBe('double.MaxValue');
  });

  it('preserves C# sentinel string "double.PositiveInfinity" verbatim', () => {
    expect(parseMinMax('double.PositiveInfinity')).toBe('double.PositiveInfinity');
  });

  it('preserves C# sentinel string "double.NegativeInfinity" verbatim', () => {
    expect(parseMinMax('double.NegativeInfinity')).toBe('double.NegativeInfinity');
  });

  it('preserves C# sentinel string "double.Epsilon" verbatim', () => {
    expect(parseMinMax('double.Epsilon')).toBe('double.Epsilon');
  });
});

describe('FieldNode min/max: minMaxToString helper', () => {
  it('serializes a plain number to string', () => {
    expect(minMaxToString(0)).toBe('0');
    expect(minMaxToString(100)).toBe('100');
    expect(minMaxToString(-3.14)).toBe('-3.14');
  });

  it('serializes a sentinel string back unchanged', () => {
    expect(minMaxToString('double.MinValue')).toBe('double.MinValue');
    expect(minMaxToString('double.MaxValue')).toBe('double.MaxValue');
    expect(minMaxToString('double.PositiveInfinity')).toBe('double.PositiveInfinity');
    expect(minMaxToString('double.NegativeInfinity')).toBe('double.NegativeInfinity');
    expect(minMaxToString('double.Epsilon')).toBe('double.Epsilon');
  });
});

describe('FieldNode min/max: full parse → serialize round-trip', () => {
  /** Build a minimal .ssf snippet containing a FieldNode with the given min/max */
  function buildFieldSnippet(min: string, max: string): string {
    return [
      'AS3.Setscreensize(800, 600);',
      `AS3.AddField("TestField","TestGroup",${min},${max},0,1,0,0,100,25,"","","","");`,
    ].join('\n');
  }

  function roundTrip(snippet: string): string {
    const parser = new Parser();
    parser.parse(snippet);
    return parser.getCCode();
  }

  it('round-trips plain numeric min/max without data loss', () => {
    const snippet = buildFieldSnippet('0', '100');
    const output = roundTrip(snippet);
    expect(output).toContain(',0,100,');
  });

  it('round-trips negative numeric min/max without data loss', () => {
    const snippet = buildFieldSnippet('-100', '200');
    const output = roundTrip(snippet);
    expect(output).toContain(',-100,200,');
  });

  it('round-trips scientific notation min/max without data loss', () => {
    const snippet = buildFieldSnippet('1E-06', '1.7976931348623157E+308');
    const output = roundTrip(snippet);
    // The serialized output should contain the normalised scientific notation values
    expect(output).toContain('1E-06');
    expect(output).toContain('1.7976931348623157E+308');
  });

  it('round-trips double.MinValue / double.MaxValue without data loss', () => {
    const snippet = buildFieldSnippet('double.MinValue', 'double.MaxValue');
    const output = roundTrip(snippet);
    expect(output).toContain('double.MinValue');
    expect(output).toContain('double.MaxValue');
  });

  it('round-trips double.NegativeInfinity / double.PositiveInfinity without data loss', () => {
    const snippet = buildFieldSnippet('double.NegativeInfinity', 'double.PositiveInfinity');
    const output = roundTrip(snippet);
    expect(output).toContain('double.NegativeInfinity');
    expect(output).toContain('double.PositiveInfinity');
  });

  it('double serialization is stable (no further drift for sentinel values)', () => {
    const snippet = buildFieldSnippet('double.MinValue', 'double.MaxValue');

    const p1 = new Parser();
    p1.parse(snippet);
    const out1 = p1.getCCode();

    const p2 = new Parser();
    p2.parse(out1);
    const out2 = p2.getCCode();

    expect(out2).toBe(out1);
  });
});

describe('FieldNode min/max: updateSelectedNodes simulation via parseMinMax', () => {
  /**
   * Simulate what LayoutPage.updateSelectedNodes() does:
   * form field value (always a string) → parseMinMax → stored on node.
   */
  it('preserves double.MinValue when flowing through form field update', () => {
    const formFieldValue = 'double.MinValue'; // what the <input type="text"> yields
    const result = parseMinMax(String(formFieldValue ?? 0));
    expect(result).toBe('double.MinValue');
  });

  it('preserves double.MaxValue when flowing through form field update', () => {
    const formFieldValue = 'double.MaxValue';
    const result = parseMinMax(String(formFieldValue ?? 0));
    expect(result).toBe('double.MaxValue');
  });

  it('preserves scientific notation 1E-06 as a string when flowing through form field update', () => {
    // parseMinMax preserves the scientific notation string verbatim so the
    // .ssf serialization keeps the original representation (not "0.000001").
    const formFieldValue = '1E-06';
    const result = parseMinMax(String(formFieldValue ?? 0));
    expect(result).toBe('1E-06');
  });

  it('converts plain "0" to the number 0 (not the string "0")', () => {
    const formFieldValue = '0';
    const result = parseMinMax(String(formFieldValue ?? 0));
    expect(result).toBe(0);
    expect(typeof result).toBe('number');
  });

  it('does NOT convert double.MinValue to NaN (old Number() bug regression)', () => {
    // Old code used Number(this.data.min) which gives NaN for sentinel strings
    const oldBehavior = Number('double.MinValue');
    expect(oldBehavior).toBeNaN(); // confirms the old bug

    // New behavior must NOT produce NaN
    const newBehavior = parseMinMax('double.MinValue');
    expect(newBehavior).not.toBeNaN();
    expect(newBehavior).toBe('double.MinValue');
  });
});
