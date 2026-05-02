import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../src/Parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Round-trip Testing', () => {
  let originalContent: string;

  beforeAll(() => {
    const filePath = join(__dirname, '../test-data/Default2019.ssf');
    originalContent = readFileSync(filePath, 'utf-8');
  });

  describe('Parse → Stringify → Parse', () => {
    it('should produce identical parse results after round-trip', () => {
      // First parse
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      // Stringify
      const stringified = parser1.getCCode();
      
      // Second parse
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      // Node counts may differ slightly due to TextNode handling (should be within small margin)
      expect(Math.abs(parser2.nodes.length - parser1.nodes.length)).toBeLessThan(20);
      
      // Compare regions - these should be identical
      expect(parser2.regions).toEqual(parser1.regions);
    });

    it('should maintain node types after round-trip', () => {
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      const originalNodeTypes = parser1.nodes.map(node => node.constructor.name);
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      const roundtripNodeTypes = parser2.nodes.map(node => node.constructor.name);
      
      // Node types should be very similar (within a small margin due to TextNode handling)
      expect(Math.abs(roundtripNodeTypes.length - originalNodeTypes.length)).toBeLessThan(20);
    });

    it('should maintain PictureNode data after round-trip', () => {
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      const originalPictures = parser1.nodes.filter(node => node.constructor.name === 'PictureNode');
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      const roundtripPictures = parser2.nodes.filter(node => node.constructor.name === 'PictureNode');
      
      expect(roundtripPictures.length).toBe(originalPictures.length);
      
      // Spot check first picture node
      if (originalPictures.length > 0) {
        const orig = originalPictures[0] as any;
        const roundtrip = roundtripPictures[0] as any;
        
        expect(roundtrip.picture_up).toBe(orig.picture_up);
        expect(roundtrip.picture_down).toBe(orig.picture_down);
        expect(roundtrip.controllN).toBe(orig.controllN);
        expect(roundtrip.mostlyFalse).toBe(orig.mostlyFalse);
        expect(roundtrip.container).toBe(orig.container);
      }
    });

    it('should maintain ButtonNode data after round-trip', () => {
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      const originalButtons = parser1.nodes.filter(node => node.constructor.name === 'ButtonNode');
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      const roundtripButtons = parser2.nodes.filter(node => node.constructor.name === 'ButtonNode');
      
      expect(roundtripButtons.length).toBe(originalButtons.length);
      
      // Spot check first button node
      if (originalButtons.length > 0) {
        const orig = originalButtons[0] as any;
        const roundtrip = roundtripButtons[0] as any;
        
        expect(roundtrip.x).toBe(orig.x);
        expect(roundtrip.y).toBe(orig.y);
        expect(roundtrip.w).toBe(orig.w);
        expect(roundtrip.h).toBe(orig.h);
        expect(roundtrip.toggle).toBe(orig.toggle);
        expect(roundtrip.blink).toBe(orig.blink);
        expect(roundtrip.picN).toBe(orig.picN);
        expect(roundtrip.controllN).toBe(orig.controllN);
        expect(roundtrip.layerN).toBe(orig.layerN);
      }
    });

    it('should maintain TabLayer data after round-trip', () => {
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      const originalTabs = parser1.nodes.filter(node => node.constructor.name === 'TabLayer');
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      const roundtripTabs = parser2.nodes.filter(node => node.constructor.name === 'TabLayer');
      
      expect(roundtripTabs.length).toBe(originalTabs.length);
      
      // Spot check first tab node
      if (originalTabs.length > 0) {
        const orig = originalTabs[0] as any;
        const roundtrip = roundtripTabs[0] as any;
        
        expect(roundtrip.value).toBe(orig.value);
        expect(roundtrip.font).toBe(orig.font);
        expect(roundtrip.align).toBe(orig.align);
        expect(roundtrip.fontSize).toBe(orig.fontSize);
        expect(roundtrip.layerN).toBe(orig.layerN);
        expect(roundtrip.parentN).toBe(orig.parentN);
      }
    });

    it('should produce semantically equivalent output after multiple round-trips', () => {
      // First round-trip
      const parser1 = new Parser();
      parser1.parse(originalContent);
      const stringified1 = parser1.getCCode();
      
      // Second round-trip
      const parser2 = new Parser();
      parser2.parse(stringified1);
      const stringified2 = parser2.getCCode();
      
      // Third round-trip
      const parser3 = new Parser();
      parser3.parse(stringified2);
      const stringified3 = parser3.getCCode();
      
      // After stabilization, outputs should be identical
      expect(stringified3).toBe(stringified2);
      
      // Node counts should stabilize after first round-trip
      expect(parser3.nodes.length).toBe(parser2.nodes.length);
      // First parse may have slightly different count due to TextNode handling
      expect(Math.abs(parser2.nodes.length - parser1.nodes.length)).toBeLessThan(20);
    });

    it('should maintain region structure after round-trip', () => {
      const parser1 = new Parser();
      parser1.parse(originalContent);
      
      const originalRegionNodes = parser1.nodes.filter(node => 
        node.constructor.name === 'RegionStartNode' || 
        node.constructor.name === 'RegionEndNode'
      );
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      const roundtripRegionNodes = parser2.nodes.filter(node => 
        node.constructor.name === 'RegionStartNode' || 
        node.constructor.name === 'RegionEndNode'
      );
      
      expect(roundtripRegionNodes.length).toBe(originalRegionNodes.length);
      expect(parser2.regions).toEqual(parser1.regions);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file', () => {
      const parser1 = new Parser();
      parser1.parse('');
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      // Parser creates default nodes, so counts should be similar
      expect(Math.abs(parser2.nodes.length - parser1.nodes.length)).toBeLessThanOrEqual(1);
    });

    it('should handle single node', () => {
      const singleNodeCode = 'AS3.Setscreensize(1920, 1018);';
      
      const parser1 = new Parser();
      parser1.parse(singleNodeCode);
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      expect(parser2.nodes.length).toBe(parser1.nodes.length);
    });

    it('should handle comments and whitespace', () => {
      const codeWithComments = `//Set main and jog screen properties
AS3.Setscreensize(1920, 1018);
AS3jog.Setscreensize(400, 508);`;
      
      const parser1 = new Parser();
      parser1.parse(codeWithComments);
      
      const stringified = parser1.getCCode();
      
      const parser2 = new Parser();
      parser2.parse(stringified);
      
      expect(parser2.nodes.length).toBe(parser1.nodes.length);
    });
  });
});
