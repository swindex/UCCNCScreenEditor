import { describe, it, expect } from 'vitest';
import { PictureNode, ScreenName } from '../../../src/Parser';

describe('PictureNode', () => {
  describe('parse', () => {
    it('should parse a valid AS3 picture node', () => {
      const input = 'AS3.Loadpicture("BMP/Default2019/Zeroallbutton_up.png", "BMP/Default2019/Zeroallbutton_down.png",1, false);';
      const node = PictureNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.container).toBe(ScreenName.AS3);
      expect(node?.picture_up).toBe('BMP/Default2019/Zeroallbutton_up.png');
      expect(node?.picture_down).toBe('BMP/Default2019/Zeroallbutton_down.png');
      expect(node?.controllN).toBe(1);
      expect(node?.mostlyFalse).toBe(false);
    });

    it('should parse a valid AS3jog picture node', () => {
      const input = 'AS3jog.Loadpicture("BMP/Default2019/plus_up.png", "BMP/Default2019/plus_down.png",22, false);';
      const node = PictureNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.container).toBe(ScreenName.AS3jog);
      expect(node?.picture_up).toBe('BMP/Default2019/plus_up.png');
      expect(node?.picture_down).toBe('BMP/Default2019/plus_down.png');
      expect(node?.controllN).toBe(22);
    });

    it('should parse picture node with mostlyFalse as true', () => {
      const input = 'AS3.Loadpicture("BMP/Default2019/Color_invert_up.png", "BMP/Default2019/Color_invert_down.png",311, true);';
      const node = PictureNode.parse(input);
      
      expect(node).toBeDefined();
      expect(node?.mostlyFalse).toBe(true);
    });

    it('should return null for invalid input', () => {
      const node = PictureNode.parse('');
      expect(node).toBeNull();
    });

    it('should return null for non-picture node code', () => {
      const node = PictureNode.parse('AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);');
      expect(node).toBeNull();
    });
  });

  describe('getCCode', () => {
    it('should stringify back to valid C# code', () => {
      const input = 'AS3.Loadpicture("BMP/Default2019/Zeroallbutton_up.png", "BMP/Default2019/Zeroallbutton_down.png",1, false);';
      const node = PictureNode.parse(input);
      const output = node?.getCCode();
      
      expect(output).toBe('AS3.Loadpicture("BMP/Default2019/Zeroallbutton_up.png", "BMP/Default2019/Zeroallbutton_down.png",1, false);');
    });

    it('should handle mostlyFalse true correctly', () => {
      const input = 'AS3.Loadpicture("up.png", "down.png",311, true);';
      const node = PictureNode.parse(input);
      const output = node?.getCCode();
      
      expect(output).toBe('AS3.Loadpicture("up.png", "down.png",311, true);');
    });
  });

  describe('Round-trip', () => {
    it('should parse and stringify to same result', () => {
      const original = 'AS3.Loadpicture("BMP/Default2019/Zeroallbutton_up.png", "BMP/Default2019/Zeroallbutton_down.png",1, false);';
      const node = PictureNode.parse(original);
      const stringified = node?.getCCode();
      const reparsed = PictureNode.parse(stringified!);
      
      expect(reparsed?.picture_up).toBe(node?.picture_up);
      expect(reparsed?.picture_down).toBe(node?.picture_down);
      expect(reparsed?.controllN).toBe(node?.controllN);
      expect(reparsed?.mostlyFalse).toBe(node?.mostlyFalse);
      expect(reparsed?.container).toBe(node?.container);
    });
  });
});
