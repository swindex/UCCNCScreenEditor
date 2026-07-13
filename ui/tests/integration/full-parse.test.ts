import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../src/Parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Full File Parsing', () => {
  let fileContent: string;
  let parser: Parser;

  beforeAll(() => {
    const filePath = join(__dirname, '../test-data/Default2019_v1.ssf');
    fileContent = readFileSync(filePath, 'utf-8');
    parser = new Parser();
  });

  describe('Default2019_v1.ssf', () => {
    it('should successfully parse the entire file', () => {
      expect(() => {
        parser.parse(fileContent);
      }).not.toThrow();
    });

    it('should extract nodes from the file', () => {
      parser.parse(fileContent);
      
      expect(parser.nodes).toBeDefined();
      expect(parser.nodes.length).toBeGreaterThan(0);
      expect(parser.nodes.length).toBeGreaterThan(1000); // Default2019 has many nodes
    });

    it('should extract regions from the file', () => {
      parser.parse(fileContent);
      
      expect(parser.regions).toBeDefined();
      expect(parser.regions.length).toBeGreaterThan(0);
      expect(parser.regions).toContain('UC100'); // Known region in the file
    });

    it('should parse PictureNode elements', () => {
      parser.parse(fileContent);
      
      const pictureNodes = parser.nodes.filter(node => node.constructor.name === 'PictureNode');
      expect(pictureNodes.length).toBeGreaterThan(0);
      expect(pictureNodes.length).toBeGreaterThan(100); // Default2019 has many pictures
    });

    it('should parse ButtonNode elements', () => {
      parser.parse(fileContent);
      
      const buttonNodes = parser.nodes.filter(node => node.constructor.name === 'ButtonNode');
      expect(buttonNodes.length).toBeGreaterThan(0);
      expect(buttonNodes.length).toBeGreaterThan(500); // Default2019 has many buttons
    });

    it('should parse TabLayer elements', () => {
      parser.parse(fileContent);
      
      const tabNodes = parser.nodes.filter(node => node.constructor.name === 'TabLayer');
      expect(tabNodes.length).toBeGreaterThan(0);
    });

    it('should parse BackgroundNode elements', () => {
      parser.parse(fileContent);
      
      const backgroundNodes = parser.nodes.filter(node => node.constructor.name === 'BackgroundNode');
      expect(backgroundNodes.length).toBeGreaterThan(0);
    });

    it('should parse FieldNode elements', () => {
      parser.parse(fileContent);
      
      const fieldNodes = parser.nodes.filter(node => node.constructor.name === 'FieldNode');
      expect(fieldNodes.length).toBeGreaterThan(0);
    });

    it('should parse LedNode elements', () => {
      parser.parse(fileContent);
      
      const ledNodes = parser.nodes.filter(node => node.constructor.name === 'LedNode');
      expect(ledNodes.length).toBeGreaterThan(0);
    });

    it('should validate parsed nodes have no critical errors', () => {
      parser.parse(fileContent);
      
      // Check that all nodes can be validated without throwing errors
      expect(() => {
        parser.nodes.forEach(node => {
          if (typeof node.validate === 'function') {
            node.validate();
          }
        });
      }).not.toThrow();
    });

    it('should successfully generate C# code from parsed nodes', () => {
      parser.parse(fileContent);
      
      const generatedCode = parser.getCCode();
      
      expect(generatedCode).toBeDefined();
      expect(generatedCode.length).toBeGreaterThan(0);
      expect(generatedCode).toContain('//REGION UC100');
      expect(generatedCode).toContain('AS3.Loadpicture');
      expect(generatedCode).toContain('AS3.Addbutton');
    });

    it('should handle both AS3 and AS3jog containers', () => {
      parser.parse(fileContent);
      
      // Check for nodes with container property
      const nodesWithContainer = parser.nodes.filter(node => {
        return node.hasOwnProperty('container');
      });
      
      expect(nodesWithContainer.length).toBeGreaterThan(0);
      
      // Verify we have both AS3 and AS3jog content by checking the generated code
      const generatedCode = parser.getCCode();
      expect(generatedCode).toContain('AS3.');
      expect(generatedCode).toContain('AS3jog.');
    });
  });

  describe('Parser Performance', () => {
    it('should parse large file in reasonable time', () => {
      const startTime = Date.now();
      
      const newParser = new Parser();
      newParser.parse(fileContent);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should parse in less than 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });
});
