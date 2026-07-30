import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import LordIconWrapper from './LordIconWrapper';

describe('LordIconWrapper', () => {
  beforeAll(() => {
    // Spy on React.useEffect so calling the component as a function doesn't trigger hook errors in Node environment
    vi.spyOn(React, 'useEffect').mockImplementation(() => {});
  });

  it('should render the wrapper div with correct styles and class name', () => {
    const result = LordIconWrapper({
      icon: 'bible',
      size: 60,
      className: 'custom-icon-class',
      trigger: 'loop',
      colors: { primary: '#123456', secondary: '#789012' }
    }) as any;

    expect(result).toBeDefined();
    expect(result.type).toBe('div');
    expect(result.props.className).toBe('custom-icon-class');
    expect(result.props.style).toEqual({
      width: 60,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('should render the lord-icon child element with mapped properties', () => {
    const result = LordIconWrapper({
      icon: 'bible',
      size: 40,
      trigger: 'loop',
      colors: { primary: '#112233', secondary: '#445566' }
    }) as any;

    const lordIconChild = result.props.children;
    expect(lordIconChild).toBeDefined();
    expect(lordIconChild.type).toBe('lord-icon');
    expect(lordIconChild.props.src).toBe('https://cdn.lordicon.com/kleczdemicon.json');
    expect(lordIconChild.props.trigger).toBe('loop');
    expect(lordIconChild.props.colors).toBe('primary:#112233,secondary:#445566');
    expect(lordIconChild.props.style).toEqual({
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  it('should render fallback SVGs correctly in its children', () => {
    const bibleResult = LordIconWrapper({ icon: 'bible' }) as any;
    const bibleFallback = bibleResult.props.children.props.children;
    expect(bibleFallback).toBeDefined();
    expect(bibleFallback.type).toBe('svg');
    expect(bibleFallback.props.className).toContain('lucide-book-open');

    const prayerResult = LordIconWrapper({ icon: 'prayer' }) as any;
    const prayerFallback = prayerResult.props.children.props.children;
    expect(prayerFallback).toBeDefined();
    expect(prayerFallback.type).toBe('svg');
    expect(prayerFallback.props.className).toContain('lucide-cross');

    const heartResult = LordIconWrapper({ icon: 'heart' }) as any;
    const heartFallback = heartResult.props.children.props.children;
    expect(heartFallback).toBeDefined();
    expect(heartFallback.type).toBe('svg');
    expect(heartFallback.props.className).toContain('lucide-heart');

    const unknownResult = LordIconWrapper({ icon: 'unknown-icon' }) as any;
    const unknownFallback = unknownResult.props.children.props.children;
    expect(unknownFallback).toBeDefined();
    expect(unknownFallback.type).toBe('svg');
    expect(unknownFallback.props.className).toContain('lucide-sparkles');
  });
});
