/**
 * Integration tests: TabLayer + SelectLayerNode lifecycle (add / modify / delete)
 *
 * A TabLayer has a paired SelectLayerNode that shares the same layerN and
 * region. Parser.removeNode(tabLayer) must cascade and also remove the
 * matching SelectLayerNode.
 *
 * Each test builds a minimal SSF string, parses it with the real Parser,
 * then performs an operation and asserts the exported text matches the
 * expected pattern after each step.
 */

import { describe, it, expect } from 'vitest';
import {
  Parser,
  TabLayer,
  SelectLayerNode,
  ScreenName,
} from '../../src/Parser';

// ---------------------------------------------------------------------------
// Minimal SSF skeleton with tabs / select-layer sections
// ---------------------------------------------------------------------------
function buildMinimalSSF(tabLines: string[] = [], selectLines: string[] = []): string {
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
    ...tabLines,
    '//Add tabs to jog screen',
    '//Add backgrounds to main screen',
    '//Add backgrounds to jog screen',
    '//Select the startup layers for the main screen',
    ...selectLines,
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
// Canonical tab/select data
// layerN = 1, parentN = 0
// ---------------------------------------------------------------------------
const ADDTAB_1   = 'AS3.Addtab("Main", "Arial", "center", 18, 0, 0, 0, 200, 30, 1, 1, 0);';
const SELECT_1   = 'AS3.selectlayer(1);';

// A second tab at layerN = 2 to test isolation
const ADDTAB_2   = 'AS3.Addtab("Settings", "Arial", "center", 18, 0, 0, 30, 200, 30, 1, 2, 0);';
const SELECT_2   = 'AS3.selectlayer(2);';

// ---------------------------------------------------------------------------
// Scenario A: Add a new TabLayer with its SelectLayerNode
// ---------------------------------------------------------------------------
describe('TabLayer lifecycle – Scenario A: add a new tab with its select-layer', () => {
  it('Addtab and selectlayer lines appear in the output after insertion', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const tabNode = TabLayer.parse(ADDTAB_1)!;
    tabNode.region = 'SCREENPROPERTIES';

    const selectNode = SelectLayerNode.parse(SELECT_1)!;
    selectNode.region = 'SCREENPROPERTIES';

    parser.insertNewNode(tabNode);
    parser.insertNewNode(selectNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain(ADDTAB_1);
    expect(lines).toContain(SELECT_1);
  });

  it('adding two tabs produces both Addtab and both selectlayer lines', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    for (const [tab, sel] of [[ADDTAB_1, SELECT_1], [ADDTAB_2, SELECT_2]] as [string, string][]) {
      const tabNode = TabLayer.parse(tab)!;
      tabNode.region = 'SCREENPROPERTIES';
      const selectNode = SelectLayerNode.parse(sel)!;
      selectNode.region = 'SCREENPROPERTIES';
      parser.insertNewNode(tabNode);
      parser.insertNewNode(selectNode);
    }

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain(ADDTAB_1);
    expect(lines).toContain(SELECT_1);
    expect(lines).toContain(ADDTAB_2);
    expect(lines).toContain(SELECT_2);
  });

  it('output is stable across a second parse/serialize cycle after insertion', () => {
    const parser = new Parser();
    parser.parse(buildMinimalSSF());

    const tabNode = TabLayer.parse(ADDTAB_1)!;
    tabNode.region = 'SCREENPROPERTIES';
    const selectNode = SelectLayerNode.parse(SELECT_1)!;
    selectNode.region = 'SCREENPROPERTIES';

    parser.insertNewNode(tabNode);
    parser.insertNewNode(selectNode);

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    expect(parser2.getCCode()).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario B: Modify an existing TabLayer
// ---------------------------------------------------------------------------
describe('TabLayer lifecycle – Scenario B: modify an existing tab', () => {
  it('changed tab label appears in the output', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    expect(tabNode).toBeDefined();

    tabNode.value = 'Renamed';

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain('AS3.Addtab("Renamed", "Arial", "center", 18, 0, 0, 0, 200, 30, 1, 1, 0);');
    expect(lines).not.toContain(ADDTAB_1);
  });

  it('changed font and fontSize appear in the output', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;

    tabNode.font = 'Verdana';
    tabNode.fontSize = 22;

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain('AS3.Addtab("Main", "Verdana", "center", 22, 0, 0, 0, 200, 30, 1, 1, 0);');
  });

  it('SelectLayerNode line is unchanged after modifying the TabLayer', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    tabNode.value = 'Changed';

    const lines = exportedLines(parser.getCCode());
    expect(lines).toContain(SELECT_1);
  });

  it('output is stable across a second parse/serialize cycle after modification', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    tabNode.value = 'Modified';

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    expect(parser2.getCCode()).toBe(out1);
  });
});

// ---------------------------------------------------------------------------
// Scenario C: Delete a TabLayer (should cascade to SelectLayerNode)
// ---------------------------------------------------------------------------
describe('TabLayer lifecycle – Scenario C: delete a tab cascades to selectlayer', () => {
  it('after removeNode(tabLayer) the Addtab line is absent', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    expect(tabNode).toBeDefined();

    parser.removeNode(tabNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(ADDTAB_1);
  });

  it('after removeNode(tabLayer) the matching selectlayer line is absent', () => {
    const ssf = buildMinimalSSF([ADDTAB_1], [SELECT_1]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;

    parser.removeNode(tabNode);

    const lines = exportedLines(parser.getCCode());
    expect(lines).not.toContain(SELECT_1);
  });

  it('deleting one tab does not affect the other tab and its selectlayer', () => {
    const ssf = buildMinimalSSF([ADDTAB_1, ADDTAB_2], [SELECT_1, SELECT_2]);
    const parser = new Parser();
    parser.parse(ssf);

    // Remove only tab with layerN = 1
    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    parser.removeNode(tabNode);

    const lines = exportedLines(parser.getCCode());
    // Tab 1 and its select line must be gone
    expect(lines).not.toContain(ADDTAB_1);
    expect(lines).not.toContain(SELECT_1);
    // Tab 2 and its select line must still be present
    expect(lines).toContain(ADDTAB_2);
    expect(lines).toContain(SELECT_2);
  });

  it('output is stable across a second parse/serialize cycle after deletion', () => {
    const ssf = buildMinimalSSF([ADDTAB_1, ADDTAB_2], [SELECT_1, SELECT_2]);
    const parser = new Parser();
    parser.parse(ssf);

    const tabNode = parser.getNodes().find(
      n => n instanceof TabLayer && (n as TabLayer).layerN === 1,
    ) as TabLayer;
    parser.removeNode(tabNode);

    const out1 = parser.getCCode();
    const parser2 = new Parser();
    parser2.parse(out1);
    expect(parser2.getCCode()).toBe(out1);
  });
});
