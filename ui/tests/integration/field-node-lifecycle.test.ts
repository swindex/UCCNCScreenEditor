/**
 * Integration tests: FieldNode lifecycle (add / modify / delete)
 *
 * Each test builds a minimal but valid SSF string, parses it with the real
 * Parser, then performs an operation and asserts the exported text matches
 * the expected pattern/completeness line-by-line.
 *
 * The minimal SSF skeleton used throughout contains exactly the headers and
 * comment markers the Parser expects so that `writeOrder` can reassemble
 * nodes without any extra unknown lines appearing.
 */

import { describe, it, expect } from 'vitest';
import {
  Parser,
  FieldNode,
  SetfieldtextNode,
  FilterfieldtextNode,
  ScreenName,
} from '../../src/Parser';

// ---------------------------------------------------------------------------
// Helper: build a minimal valid SSF that contains a textfields section
// ---------------------------------------------------------------------------
function buildMinimalSSF(fieldLines: string[] = []): string {
  return [
    '//REGION SCREENPROPERTIES',
    'if (mainform.Runscript("SCREENPROPERTIES"))',
    '{',
    'UCCNC.AS3interfaceClass AS3 = mainform.AS3;',
    'UCCNC.AS3interfaceClass AS3jog = mainform.AS3jog;',
    'int maxport = mainform.maxport;',
    'int maxpin = mainform.maxpin;',
    'int maxAnaInport = mainform.maxAnaInport;',
    'int maxAnaOutport = mainform.maxAnaOutport;',
    '//Set main and jog screen properties',
    'AS3.Setscreensize(1920, 1018);',
    '//Load images for main screen',
    '//Load images for jog screen',
    '//Add tabs to main screen',
    '//Add tabs to jog screen',
    '//Add backgrounds to main screen',
    '//Add backgrounds to jog screen',
    '//Select the startup layers for the main screen',
    '//Select the startup layers for the jog screen',
    '//Add buttons to main screen',
    '//Add buttons to jog screen',
    '//Add textfields to main screen',
    ...fieldLines,
    '//Add textfields to jog screen',
    '//Add LEDs to main screen',
    '//Add LEDs to jog screen',
    '//Add labels to main screen',
    '//Add labels to jog screen',
    '//Add lists to main screen',
    '//Add lists to jog screen',
    '//Add comboboxes to main screen',
    '//Add comboboxes to jog screen',
    '//Add codeviews to main screen',
    '//Add codeviews to jog screen',
    '//Add colorpickers to main screen',
    '//Add colorpickers to jog screen',
    '//Add CAMs to main screen',
    '//Add CAMs to jog screen',
    '//Add toolpaths to main screen',
    '//Add checkboxes to main screen',
    '//Add checkboxes to jog screen',
    '//Add sliders to main screen',
    '//Add sliders to jog screen',
    '//Add fills to main screen',
    '//Add fills to jog screen',
    '//Add imageviews to main screen',
    '//Add imageviews to jog screen',
    '//Screenset footer',
    '}',
    '//ENDREGION SCREENPROPERTIES',
  ].join('\n');
}

/** Extract all non-empty, non-header lines from the exported string */
function exportedLines(code: string): string[] {
  return code
    .split('\n')
    .map(l => l.replace(/\r$/, '').trim())
    .filter(l => l.length > 0 && !l.startsWith('//UCCNCEDITORJSON'));
}

// ---------------------------------------------------------------------------
// Shared field data for controllN = 231 (from task specification)
// ---------------------------------------------------------------------------
const ADDFIELD =
  'AS3.Addfield("", "Arial", "right", 28, -16776961, 585, 858, 161, "textfieldnb", -1.7976931348623157E+308, 1.7976931348623157E+308, 231, 1);';
const SETFIELDTEXT = 'AS3.Setfieldtext(" ", 231);';
const FILTERFIELDTEXT = 'AS3.Filterfieldtext("0123456789.\\-", 231);';

// ---------------------------------------------------------------------------
// Scenario A: Add a new FieldNode with both modifiers
// ---------------------------------------------------------------------------
describe('FieldNode lifecycle – Scenario A: add a new field with modifiers', () => {
  it('inserts Addfield, Setfieldtext, and Filterfieldtext into the output', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    // Build new nodes
    const fieldNode = FieldNode.parse(ADDFIELD)!;
    fieldNode.region = 'SCREENPROPERTIES';

    const textNode = SetfieldtextNode.parse(SETFIELDTEXT)!;
    textNode.region = 'SCREENPROPERTIES';

    const filterNode = FilterfieldtextNode.parse(FILTERFIELDTEXT)!;
    filterNode.region = 'SCREENPROPERTIES';

    // Insert field first, then modifiers
    parser.insertNewNode(fieldNode);
    parser.insertNewNode(textNode);
    parser.insertNewNode(filterNode);

    const output = parser.getCCode();
    const lines = exportedLines(output);

    expect(lines).toContain(ADDFIELD);
    expect(lines).toContain(SETFIELDTEXT);
    expect(lines).toContain(FILTERFIELDTEXT);
  });

  it('Addfield appears before Setfieldtext which appears before Filterfieldtext', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const fieldNode = FieldNode.parse(ADDFIELD)!;
    fieldNode.region = 'SCREENPROPERTIES';
    const textNode = SetfieldtextNode.parse(SETFIELDTEXT)!;
    textNode.region = 'SCREENPROPERTIES';
    const filterNode = FilterfieldtextNode.parse(FILTERFIELDTEXT)!;
    filterNode.region = 'SCREENPROPERTIES';

    parser.insertNewNode(fieldNode);
    parser.insertNewNode(textNode);
    parser.insertNewNode(filterNode);

    const lines = exportedLines(parser.getCCode());
    const addfieldIdx = lines.indexOf(ADDFIELD);
    const settextIdx = lines.indexOf(SETFIELDTEXT);
    const filterIdx = lines.indexOf(FILTERFIELDTEXT);

    expect(addfieldIdx).toBeGreaterThanOrEqual(0);
    expect(settextIdx).toBeGreaterThan(addfieldIdx);
    expect(filterIdx).toBeGreaterThan(addfieldIdx);
  });

  it('output is stable across a second parse/serialize cycle after insertion', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const fieldNode = FieldNode.parse(ADDFIELD)!;
    fieldNode.region = 'SCREENPROPERTIES';
    const textNode = SetfieldtextNode.parse(SETFIELDTEXT)!;
    textNode.region = 'SCREENPROPERTIES';
    const filterNode = FilterfieldtextNode.parse(FILTERFIELDTEXT)!;
    filterNode.region = 'SCREENPROPERTIES';

    parser.insertNewNode(fieldNode);
    parser.insertNewNode(textNode);
    parser.insertNewNode(filterNode);

    const out1 = parser.getCCode();

    const parser2 = new Parser();
    parser2.parse(out1);
    const out2 = parser2.getCCode();

    expect(out2).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario B: Modify an existing FieldNode and its modifier values
// ---------------------------------------------------------------------------
describe('FieldNode lifecycle – Scenario B: modify an existing field and its modifiers', () => {
  it('changed FieldNode properties appear in the output', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    // Locate the field node
    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    expect(fieldNode).toBeDefined();

    // Mutate properties
    fieldNode.align = 'left';
    fieldNode.fontSize = 32;
    fieldNode.color = -1;

    const output = parser.getCCode();
    const lines = exportedLines(output);

    // The modified Addfield line should appear
    const expectedLine =
      'AS3.Addfield("", "Arial", "left", 32, -1, 585, 858, 161, "textfieldnb", -1.7976931348623157E+308, 1.7976931348623157E+308, 231, 1);';
    expect(lines).toContain(expectedLine);

    // The original Addfield line must NOT appear
    expect(lines).not.toContain(ADDFIELD);
  });

  it('changed Setfieldtext value appears in the output', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    expect(fieldNode).toBeDefined();
    expect(fieldNode.fieldText).not.toBeNull();

    // Mutate text modifier
    fieldNode.fieldText!.value = '0.0';

    const output = parser.getCCode();
    const lines = exportedLines(output);

    expect(lines).toContain('AS3.Setfieldtext("0.0", 231);');
    expect(lines).not.toContain(SETFIELDTEXT);
  });

  it('changed Filterfieldtext value appears in the output', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    expect(fieldNode).toBeDefined();
    expect(fieldNode.fieldFilter).not.toBeNull();

    // Mutate filter modifier
    fieldNode.fieldFilter!.value = '0123456789';

    const output = parser.getCCode();
    const lines = exportedLines(output);

    expect(lines).toContain('AS3.Filterfieldtext("0123456789", 231);');
    expect(lines).not.toContain(FILTERFIELDTEXT);
  });

  it('all three modified lines are present after modification', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;

    fieldNode.align = 'center';
    fieldNode.fieldText!.value = 'NEW';
    fieldNode.fieldFilter!.value = 'abc';

    const lines = exportedLines(parser.getCCode());

    const addLine =
      'AS3.Addfield("", "Arial", "center", 28, -16776961, 585, 858, 161, "textfieldnb", -1.7976931348623157E+308, 1.7976931348623157E+308, 231, 1);';
    expect(lines).toContain(addLine);
    expect(lines).toContain('AS3.Setfieldtext("NEW", 231);');
    expect(lines).toContain('AS3.Filterfieldtext("abc", 231);');
  });

  it('output remains stable across a second parse/serialize cycle after modification', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    fieldNode.align = 'center';
    fieldNode.fieldText!.value = 'STABLE';

    const out1 = parser.getCCode();

    const parser2 = new Parser();
    parser2.parse(out1);
    const out2 = parser2.getCCode();

    expect(out2).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario C: Delete a FieldNode (should cascade to modifiers)
// ---------------------------------------------------------------------------
describe('FieldNode lifecycle – Scenario C: delete a field cascades to modifiers', () => {
  it('after removeNode(fieldNode) the Addfield line is absent', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    expect(fieldNode).toBeDefined();

    parser.removeNode(fieldNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(ADDFIELD);
  });

  it('after removeNode(fieldNode) the Setfieldtext line is absent', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    parser.removeNode(fieldNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(SETFIELDTEXT);
  });

  it('after removeNode(fieldNode) the Filterfieldtext line is absent', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    parser.removeNode(fieldNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(FILTERFIELDTEXT);
  });

  it('other fields are unaffected when one field is deleted', () => {
    const otherField =
      'AS3.Addfield("", "Arial", "left", 18, 0, 10, 20, 80, "textfield", 0, 0, 99, 1);';
    const otherText = 'AS3.Setfieldtext("0", 99);';
    const ssf = buildMinimalSSF([
      ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT,
      otherField, otherText,
    ]);
    const parser = new Parser();
    parser.parse(ssf);

    // Remove only field 231
    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    parser.removeNode(fieldNode);

    const lines = exportedLines(parser.getCCode());
    // Field 231 and its modifiers must be gone
    expect(lines).not.toContain(ADDFIELD);
    expect(lines).not.toContain(SETFIELDTEXT);
    expect(lines).not.toContain(FILTERFIELDTEXT);
    // Field 99 must still be present
    expect(lines).toContain(otherField);
    expect(lines).toContain(otherText);
  });

  it('output is stable across a second parse/serialize cycle after deletion', () => {
    const ssf = buildMinimalSSF([ADDFIELD, SETFIELDTEXT, FILTERFIELDTEXT]);
    const parser = new Parser();
    parser.parse(ssf);

    const fieldNode = parser.getNodes().find(
      n => n instanceof FieldNode && (n as FieldNode).controllN === 231,
    ) as FieldNode;
    parser.removeNode(fieldNode);

    const out1 = parser.getCCode();

    const parser2 = new Parser();
    parser2.parse(out1);
    const out2 = parser2.getCCode();

    expect(out2).toBe(out1);
  });
});
