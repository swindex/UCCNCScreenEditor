import { describe, it, expect } from 'vitest';
import { ButtonNode, ScreenName } from '../../../src/Parser';

describe('ButtonNode', () => {
  describe('parse', () => {
    it('should parse a valid button node', () => {
      const input = 'AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);';
      const node = ButtonNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.container).toBe(ScreenName.AS3);
      expect(node?.x).toBe(673);
      expect(node?.y).toBe(44);
      expect(node?.w).toBe(72);
      expect(node?.h).toBe(32);
      expect(node?.toggle).toBe(false);
      expect(node?.blink).toBe(false);
      expect(node?.picN).toBe(81);
      expect(node?.controllN).toBe(664);
      expect(node?.layerN).toBe(54);
    });

    it('should parse button with toggle true', () => {
      const input = 'AS3.Addbutton(919, 617, 48, 41, true, false, 2, 107, 1);';
      const node = ButtonNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.toggle).toBe(true);
      expect(node?.blink).toBe(false);
    });

    it('should parse button with blink true', () => {
      const input = 'AS3.Addbutton(1713, 820, 197, 44, true, true, 32, 146, 1);';
      const node = ButtonNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.toggle).toBe(true);
      expect(node?.blink).toBe(true);
    });

    it('should parse AS3jog button node', () => {
      const input = 'AS3jog.Addbutton(10, 9, 79, 41, true, false, 60, 241, 1);';
      const node = ButtonNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.container).toBe(ScreenName.AS3jog);
    });

    it('should return null for invalid input', () => {
      const node = ButtonNode.parse('');
      expect(node).toBeNull();
    });
  });

  describe('getCCode', () => {
    it('should stringify back to valid C# code', () => {
      const input = 'AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);';
      const node = ButtonNode.parse(input);
      const output = node?.getCCode();
      
      expect(output).toBe('AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);');
    });

    it('should handle boolean values correctly', () => {
      const input = 'AS3.Addbutton(1713, 820, 197, 44, true, true, 32, 146, 1);';
      const node = ButtonNode.parse(input);
      const output = node?.getCCode();
      
      expect(output).toBe('AS3.Addbutton(1713, 820, 197, 44, true, true, 32, 146, 1);');
    });
  });

  describe('Round-trip', () => {
    it('should parse and stringify to same result', () => {
      const original = 'AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);';
      const node = ButtonNode.parse(original);
      const stringified = node?.getCCode();
      const reparsed = ButtonNode.parse(stringified!);
      
      expect(reparsed?.x).toBe(node?.x);
      expect(reparsed?.y).toBe(node?.y);
      expect(reparsed?.w).toBe(node?.w);
      expect(reparsed?.h).toBe(node?.h);
      expect(reparsed?.toggle).toBe(node?.toggle);
      expect(reparsed?.blink).toBe(node?.blink);
      expect(reparsed?.picN).toBe(node?.picN);
      expect(reparsed?.controllN).toBe(node?.controllN);
      expect(reparsed?.layerN).toBe(node?.layerN);
    });
  });
});
