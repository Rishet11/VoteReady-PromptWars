import { describe, it, expect } from 'vitest';
import { pinToStateMap } from '@/data/pinToState';

describe('pinToState Map', () => {
  it('contains valid mappings for key Indian PIN codes', () => {
    expect(pinToStateMap['110001']).toBeDefined();
    expect(pinToStateMap['110001'].state).toBe('DL');
    
    expect(pinToStateMap['400001']).toBeDefined();
    expect(pinToStateMap['400001'].state).toBe('MH');
  });

  it('contains correctly formatted polling places', () => {
    const data = pinToStateMap['110001'];
    expect(data.pollingPlace.lat).toBeTypeOf('number');
    expect(data.pollingPlace.lng).toBeTypeOf('number');
    expect(data.pollingPlace.distance).toBeGreaterThan(0);
  });
});
