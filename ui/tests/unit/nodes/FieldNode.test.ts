import { describe, it, expect } from 'vitest';
import {
  FieldNode,
  SetfieldtextNode,
  FilterfieldtextNode,
  ScreenName,
} from '../../../src/Parser';

// ---------------------------------------------------------------------------
// Canonical test fixtures taken directly from the task specification
// ---------------------------------------------------------------------------
const ADDFIELD_LINE =
  'AS3.Addfield("", "Arial", "right", 28, -16776961, 585, 858, 161, "textfieldnb", -1.7976931348623157E+308, 1.7976931348623157E+308, 231, 1);';
const SETFIELDTEXT_LINE = 'AS3.Setfieldtext(" ", 231);';
const FILTERFIELDTEXT_LINE = 'AS3.Filterfieldtext("0123456789.\\-", 231);';

// ---------------------------------------------------------------------------
// FieldNode
// ---------------------------------------------------------------------------
describe('FieldNode', () => {
  describe('parse', () => {
    it('returns null for empty input', () => {
      expect(FieldNode.parse('')).toBeNull();
    });

    it('returns null for a non-matching line', () => {
      expect(FieldNode.parse('AS3.Addbutton(673, 44, 72, 32, false, false, 81, 664, 54);')).toBeNull();
    });

    it('parses a minimal field node', () => {
      const input = 'AS3.Addfield("", "Arial", "right", 24, 0, 100, 200, 120, "textfield", 0, 100, 10, 1);';
      const node = FieldNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3);
      expect(node!.firstEmpty).toBe('');
      expect(node!.font).toBe('Arial');
      expect(node!.align).toBe('right');
      expect(node!.fontSize).toBe(24);
      expect(node!.color).toBe(0);
      expect(node!.x).toBe(100);
      expect(node!.y).toBe(200);
      expect(node!.w).toBe(120);
      expect(node!.fieldType).toBe('textfield');
      expect(node!.min).toBe(0);
      expect(node!.max).toBe(100);
      expect(node!.controllN).toBe(10);
      expect(node!.layerN).toBe(1);
    });

    it('parses the canonical Addfield line with large E+308 min/max', () => {
      const node = FieldNode.parse(ADDFIELD_LINE);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3);
      expect(node!.firstEmpty).toBe('');
      expect(node!.font).toBe('Arial');
      expect(node!.align).toBe('right');
      expect(node!.fontSize).toBe(28);
      expect(node!.color).toBe(-16776961);
      expect(node!.x).toBe(585);
      expect(node!.y).toBe(858);
      expect(node!.w).toBe(161);
      expect(node!.fieldType).toBe('textfieldnb');
      expect(node!.min).toBe("-1.7976931348623157E+308");
      expect(node!.max).toBe("1.7976931348623157E+308");
      expect(node!.controllN).toBe(231);
      expect(node!.layerN).toBe(1);
    });

    it('parses an AS3jog field node', () => {
      const input = 'AS3jog.Addfield("", "Arial", "left", 18, -1, 10, 20, 80, "textfield", 0, 0, 5, 2);';
      const node = FieldNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3jog);
    });

    it('parses a field node with negative color', () => {
      const input = 'AS3.Addfield("val", "Arial", "center", 16, -65536, 0, 0, 200, "textfield", -100, 100, 99, 3);';
      const node = FieldNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.color).toBe(-65536);
    });
  });

  describe('getCCode', () => {
    it('round-trips a minimal field node exactly', () => {
      const input = 'AS3.Addfield("", "Arial", "right", 24, 0, 100, 200, 120, "textfield", 0, 100, 10, 1);';
      const node = FieldNode.parse(input)!;
      expect(node.getCCode()).toBe(input);
    });

    it('round-trips the canonical Addfield line (E+308 min/max preserved)', () => {
      const node = FieldNode.parse(ADDFIELD_LINE)!;
      expect(node.getCCode()).toBe(ADDFIELD_LINE);
    });

    it('double round-trip is stable', () => {
      const node1 = FieldNode.parse(ADDFIELD_LINE)!;
      const code1 = node1.getCCode();
      const node2 = FieldNode.parse(code1)!;
      const code2 = node2.getCCode();
      expect(code2).toBe(code1);
    });
  });
});

// ---------------------------------------------------------------------------
// SetfieldtextNode
// ---------------------------------------------------------------------------
describe('SetfieldtextNode', () => {
  describe('parse', () => {
    it('returns null for empty input', () => {
      expect(SetfieldtextNode.parse('')).toBeNull();
    });

    it('returns null for a non-matching line', () => {
      expect(SetfieldtextNode.parse(ADDFIELD_LINE)).toBeNull();
    });

    it('parses the canonical Setfieldtext line (space value)', () => {
      const node = SetfieldtextNode.parse(SETFIELDTEXT_LINE);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3);
      expect(node!.value).toBe(' ');
      expect(node!.controllN).toBe(231);
    });

    it('parses a Setfieldtext with a non-empty value', () => {
      const input = 'AS3.Setfieldtext("hello", 42);';
      const node = SetfieldtextNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.value).toBe('hello');
      expect(node!.controllN).toBe(42);
    });

    it('parses AS3jog variant', () => {
      const input = 'AS3jog.Setfieldtext("0", 7);';
      const node = SetfieldtextNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3jog);
    });
  });

  describe('getCCode', () => {
    it('round-trips the canonical Setfieldtext line exactly', () => {
      const node = SetfieldtextNode.parse(SETFIELDTEXT_LINE)!;
      expect(node.getCCode()).toBe(SETFIELDTEXT_LINE);
    });

    it('round-trips a non-empty value', () => {
      const input = 'AS3.Setfieldtext("hello", 42);';
      const node = SetfieldtextNode.parse(input)!;
      expect(node.getCCode()).toBe(input);
    });

    it('double round-trip is stable', () => {
      const node1 = SetfieldtextNode.parse(SETFIELDTEXT_LINE)!;
      const code1 = node1.getCCode();
      const node2 = SetfieldtextNode.parse(code1)!;
      expect(node2.getCCode()).toBe(code1);
    });
  });
});

// ---------------------------------------------------------------------------
// FilterfieldtextNode
// ---------------------------------------------------------------------------
describe('FilterfieldtextNode', () => {
  describe('parse', () => {
    it('returns null for empty input', () => {
      expect(FilterfieldtextNode.parse('')).toBeNull();
    });

    it('returns null for a non-matching line', () => {
      expect(FilterfieldtextNode.parse(ADDFIELD_LINE)).toBeNull();
    });

    it('parses the canonical Filterfieldtext line (backslash in filter)', () => {
      const node = FilterfieldtextNode.parse(FILTERFIELDTEXT_LINE);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3);
      // The backslash inside the regex pattern is stored as the literal parsed string
      expect(node!.value).toBe('0123456789.\\-');
      expect(node!.controllN).toBe(231);
    });

    it('parses a simple digit-only filter', () => {
      const input = 'AS3.Filterfieldtext("0123456789", 15);';
      const node = FilterfieldtextNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.value).toBe('0123456789');
      expect(node!.controllN).toBe(15);
    });

    it('parses AS3jog variant', () => {
      const input = 'AS3jog.Filterfieldtext("abc", 3);';
      const node = FilterfieldtextNode.parse(input);
      expect(node).not.toBeNull();
      expect(node!.container).toBe(ScreenName.AS3jog);
    });
  });

  describe('getCCode', () => {
    it('round-trips the canonical Filterfieldtext line exactly', () => {
      const node = FilterfieldtextNode.parse(FILTERFIELDTEXT_LINE)!;
      expect(node.getCCode()).toBe(FILTERFIELDTEXT_LINE);
    });

    it('round-trips a simple digit-only filter', () => {
      const input = 'AS3.Filterfieldtext("0123456789", 15);';
      const node = FilterfieldtextNode.parse(input)!;
      expect(node.getCCode()).toBe(input);
    });

    it('double round-trip is stable', () => {
      const node1 = FilterfieldtextNode.parse(FILTERFIELDTEXT_LINE)!;
      const code1 = node1.getCCode();
      const node2 = FilterfieldtextNode.parse(code1)!;
      expect(node2.getCCode()).toBe(code1);
    });
  });
});
