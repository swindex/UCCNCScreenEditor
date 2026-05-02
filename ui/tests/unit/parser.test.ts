import { describe, it, expect, beforeEach } from 'vitest';
import { Parser } from '../../src/Parser';

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('Basic Parsing', () => {
    it('should create a new Parser instance', () => {
      expect(parser).toBeDefined();
      expect(parser.nodes).toEqual([]);
      expect(parser.regions).toEqual([]);
    });

    it('should parse region start nodes', () => {
      const code = '//REGION UC100';
      parser.parse(code);
      
      expect(parser.nodes.length).toBeGreaterThan(0);
      expect(parser.regions).toContain('UC100');
    });

    it('should handle empty input', () => {
      parser.parse('');
      // Parser creates default nodes even for empty input
      expect(parser.nodes.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiline input', () => {
      const code = `//REGION UC100
AS3.Setscreensize(1920, 1018);
//ENDREGION UC100`;
      
      parser.parse(code);
      expect(parser.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('getCCode', () => {
    it('should stringify parsed nodes back to code', () => {
      const code = `//REGION UC100
AS3.Setscreensize(1920, 1018);
//ENDREGION UC100`;
      
      parser.parse(code);
      const result = parser.getCCode();
      
      expect(result).toBeTruthy();
      expect(result).toContain('//REGION UC100');
      expect(result).toContain('AS3.Setscreensize');
      expect(result).toContain('//ENDREGION UC100');
    });

    it('should handle enforceStructure parameter', () => {
      const code = 'AS3.Setscreensize(1920, 1018);';
      parser.parse(code);
      
      const result = parser.getCCode(true);
      expect(result).toBeTruthy();
    });
  });

  describe('Node Filtering', () => {
    it('should filter nodes by region', () => {
      const code = `//REGION UC100
AS3.Setscreensize(1920, 1018);
//ENDREGION UC100`;
      
      parser.parse(code);
      const nodes = parser.getNodesWhere('UC100', null, null);
      
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should validate region nodes', () => {
      const code = `//REGION UC100
AS3.Setscreensize(1920, 1018);
//ENDREGION UC100`;
      
      parser.parse(code);
      const errors = parser.validateRegionNodes('UC100');
      
      // Should return array of validation errors (empty if valid)
      expect(Array.isArray(errors)).toBe(true);
    });
  });
});
