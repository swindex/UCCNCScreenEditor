/**
 * Integration tests: ComboNode lifecycle (add / modify / delete)
 *
 * A ComboNode produces a multi-line block in the SSF file:
 *   AS3.Addcombobox(...)               ← ComboNode
 *   AS3.Clearcomboboxitems(N)          ← ClearcomboboxitemsNode
 *   AS3.Validatenewcomboboxitems(N)    ← ValidatenewcomboboxitemsNode
 *   AS3.Addcomboboxitem("...", N)      ← AddcomboboxitemNode (0..many)
 *   AS3.Updatecomboboxselection(0, N)  ← UpdatecomboboxselectionNode
 *
 * These tests verify that the Parser correctly handles the full multi-line
 * block when adding, modifying or deleting the controlling ComboNode.
 */

import { describe, it, expect } from 'vitest';
import {
  Parser,
  ComboNode,
  ClearcomboboxitemsNode,
  AddcomboboxitemNode,
  ValidatenewcomboboxitemsNode,
  UpdatecomboboxselectionNode,
  ScreenName,
} from '../../src/Parser';

// ---------------------------------------------------------------------------
// Minimal SSF skeleton with a combobox section
// ---------------------------------------------------------------------------
function buildMinimalSSF(comboLines: string[] = []): string {
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
    '//Add textfields to jog screen',
    '//Add LEDs to main screen',
    '//Add LEDs to jog screen',
    '//Add labels to main screen',
    '//Add labels to jog screen',
    '//Add lists to main screen',
    '//Add lists to jog screen',
    '//Add comboboxes to main screen',
    ...comboLines,
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

function exportedLines(code: string): string[] {
  return code
    .split('\n')
    .map(l => l.replace(/\r$/, '').trim())
    .filter(l => l.length > 0 && !l.startsWith('//UCCNCEDITORJSON'));
}

// ---------------------------------------------------------------------------
// Canonical combo block for controllN = 11
// ---------------------------------------------------------------------------
const ADDCOMBOBOX = 'AS3.Addcombobox("Arial", 400, 100, 200, 18, -1, 6, 11, 1);';
const CLEARITEMS  = 'AS3.Clearcomboboxitems(11);';
const VALIDATE    = 'AS3.Validatenewcomboboxitems(11);';
// Note: AddcomboboxitemNode.getCCode() emits no space after the comma: "value",N
const ADDITEM_1   = 'AS3.Addcomboboxitem("Internal contour", 11);';
const ADDITEM_2   = 'AS3.Addcomboboxitem("External contour", 11);';
const UPDATESEL   = 'AS3.Updatecomboboxselection(0, 11);';

const COMBO_BLOCK = [ADDCOMBOBOX, CLEARITEMS, VALIDATE, ADDITEM_1, ADDITEM_2, UPDATESEL];

// ---------------------------------------------------------------------------
// Scenario A: Add a new ComboNode with full multi-line block
// ---------------------------------------------------------------------------
describe('ComboNode lifecycle – Scenario A: add a new combobox block', () => {
  it('all six combo lines appear in the output after insertion', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const comboNode = ComboNode.parse(ADDCOMBOBOX)!;
    comboNode.region = 'SCREENPROPERTIES';

    const clearNode = ClearcomboboxitemsNode.parse(CLEARITEMS)!;
    clearNode.region = 'SCREENPROPERTIES';

    const validateNode = ValidatenewcomboboxitemsNode.parse(VALIDATE)!;
    validateNode.region = 'SCREENPROPERTIES';

    const addItem1 = AddcomboboxitemNode.parse(ADDITEM_1)!;
    addItem1.region = 'SCREENPROPERTIES';

    const addItem2 = AddcomboboxitemNode.parse(ADDITEM_2)!;
    addItem2.region = 'SCREENPROPERTIES';

    const updateNode = UpdatecomboboxselectionNode.parse(UPDATESEL)!;
    updateNode.region = 'SCREENPROPERTIES';

    parser.insertNewNode(comboNode);
    parser.insertNewNode(clearNode);
    parser.insertNewNode(validateNode);
    parser.insertNewNode(addItem1);
    parser.insertNewNode(addItem2);
    parser.insertNewNode(updateNode);

    const lines = exportedLines(parser.getCCode());

    for (const line of COMBO_BLOCK) {
      expect(lines).toContain(line);
    }
  });

  it('output is stable across a second parse/serialize cycle after insertion', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const nodes = COMBO_BLOCK.map(line => {
      // Use each node class's parse method based on the line content
      let node: any = null;
      node ??= ComboNode.parse(line);
      node ??= ClearcomboboxitemsNode.parse(line);
      node ??= ValidatenewcomboboxitemsNode.parse(line);
      node ??= AddcomboboxitemNode.parse(line);
      node ??= UpdatecomboboxselectionNode.parse(line);
      expect(node).not.toBeNull();
      node!.region = 'SCREENPROPERTIES';
      return node!;
    });

    nodes.forEach(n => parser.insertNewNode(n));

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    const out2 = parser2.getCCode();

    expect(out2).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario B: Modify an existing ComboNode and its items
// ---------------------------------------------------------------------------
describe('ComboNode lifecycle – Scenario B: modify an existing combobox block', () => {
  it('changed ComboNode font appears in the output', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const comboNode = parser.getNodes().find(
      n => n instanceof ComboNode && (n as ComboNode).controllN === 11,
    ) as ComboNode;
    expect(comboNode).toBeDefined();

    comboNode.font = 'Courier New';
    comboNode.fontSize = 20;

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain('AS3.Addcombobox("Courier New", 400, 100, 200, 20, -1, 6, 11, 1);');
    expect(lines).not.toContain(ADDCOMBOBOX);
  });

  it('changed AddcomboboxitemNode text appears in the output', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const itemNode = parser.getNodes().find(
      n => n instanceof AddcomboboxitemNode &&
           (n as AddcomboboxitemNode).controllN === 11 &&
           (n as AddcomboboxitemNode).value === 'Internal contour',
    ) as AddcomboboxitemNode;
    expect(itemNode).toBeDefined();

    itemNode.value = 'Pocket';

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain('AS3.Addcomboboxitem("Pocket", 11);');
    expect(lines).not.toContain(ADDITEM_1);
  });

  it('all combo lines are present after modification', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const comboNode = parser.getNodes().find(
      n => n instanceof ComboNode && (n as ComboNode).controllN === 11,
    ) as ComboNode;
    comboNode.font = 'Verdana';

    const lines = exportedLines(parser.getCCode());
    // CLEAR, VALIDATE, ADDITEM_2, UPDATESEL must still be present unchanged
    expect(lines).toContain(CLEARITEMS);
    expect(lines).toContain(VALIDATE);
    expect(lines).toContain(ADDITEM_2);
    expect(lines).toContain(UPDATESEL);
  });

  it('output is stable across a second parse/serialize cycle after modification', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const comboNode = parser.getNodes().find(
      n => n instanceof ComboNode && (n as ComboNode).controllN === 11,
    ) as ComboNode;
    comboNode.font = 'Verdana';

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    expect(parser2.getCCode()).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario C: Delete the ComboNode (individual nodes must be removed explicitly)
// ---------------------------------------------------------------------------
describe('ComboNode lifecycle – Scenario C: delete combo nodes from the block', () => {
  it('removing the ComboNode removes the Addcombobox line', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const comboNode = parser.getNodes().find(
      n => n instanceof ComboNode && (n as ComboNode).controllN === 11,
    ) as ComboNode;
    parser.removeNode(comboNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(ADDCOMBOBOX);
  });

  it('removing all nodes in the combo block leaves no trace for controllN 11', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    // Collect all nodes belonging to controllN 11
    const targetNodes = parser.getNodes().filter(n => {
      if (n instanceof ComboNode) return (n as ComboNode).controllN === 11;
      if (n instanceof ClearcomboboxitemsNode) return (n as ClearcomboboxitemsNode).controllN === 11;
      if (n instanceof ValidatenewcomboboxitemsNode) return (n as ValidatenewcomboboxitemsNode).controllN === 11;
      if (n instanceof AddcomboboxitemNode) return (n as AddcomboboxitemNode).controllN === 11;
      if (n instanceof UpdatecomboboxselectionNode) return (n as UpdatecomboboxselectionNode).controllN === 11;
      return false;
    });

    expect(targetNodes.length).toBe(COMBO_BLOCK.length);

    targetNodes.forEach(n => parser.removeNode(n));

    const lines = exportedLines(parser.getCCode());
    for (const line of COMBO_BLOCK) {
      expect(lines).not.toContain(line);
    }
  });

  it('other combo blocks are unaffected when one is deleted', () => {
    const otherCombo = [
      'AS3.Addcombobox("Arial", 10, 10, 100, 18, -1, 6, 99, 1);',
      'AS3.Clearcomboboxitems(99);',
      // AddcomboboxitemNode.getCCode() emits no space after the comma
      'AS3.Addcomboboxitem("Option A", 99);',
    ];
    const ssf = buildMinimalSSF([...COMBO_BLOCK, ...otherCombo]);
    const parser = new Parser();
    parser.parse(ssf);

    // Remove only the block for controllN 11
    const nodesToRemove = parser.getNodes().filter(n => {
      const anyN = n as any;
      return anyN.controllN === 11 && (
        n instanceof ComboNode ||
        n instanceof ClearcomboboxitemsNode ||
        n instanceof ValidatenewcomboboxitemsNode ||
        n instanceof AddcomboboxitemNode ||
        n instanceof UpdatecomboboxselectionNode
      );
    });
    nodesToRemove.forEach(n => parser.removeNode(n));

    const lines = exportedLines(parser.getCCode());
    for (const line of COMBO_BLOCK) {
      expect(lines).not.toContain(line);
    }
    for (const line of otherCombo) {
      expect(lines).toContain(line);
    }
  });

  it('output is stable across a second parse/serialize cycle after deletion', () => {
    const ssf = buildMinimalSSF(COMBO_BLOCK);
    const parser = new Parser();
    parser.parse(ssf);

    const comboNode = parser.getNodes().find(
      n => n instanceof ComboNode && (n as ComboNode).controllN === 11,
    ) as ComboNode;
    parser.removeNode(comboNode);

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    expect(parser2.getCCode()).toBe(out1);
  });
});
