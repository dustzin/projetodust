// physics_engine.ts
// Strict math calculation functions for wave simulation

export interface WaveParams1D {
  amplitude: number;
  frequency: number;
  phase: number;
  elasticity: number;
  damping: number;
  x: number;
  time: number;
}

export interface PhysicsConstants {
  frequency: number;
  elasticity: number;
  damping: number;
  threshold: number;
}

/**
 * Calculates the y displacement of a damped 1D wave at position x and time t.
 */
export function calculateWave1D(params: WaveParams1D): number {
  const { amplitude, frequency, phase, elasticity, damping, x, time } = params;
  
  // Base angular frequency
  const angularFreq = frequency / 100;
  
  // Superposition of two waves simulating a complex vibration
  const wave1 = Math.sin(elasticity * x + angularFreq * time + phase);
  const wave2 = Math.sin(elasticity * x * 1.5 - angularFreq * time * 0.8);
  
  const waveSum = wave1 + wave2;
  const dampingEffect = Math.exp(-damping * x);
  
  return amplitude * waveSum * dampingEffect;
}

/**
 * Validates if the current simulation frequency matches the theoretical frequency.
 */
export function validateTheory(simFreq: number, theoryFreq: number, threshold: number): { isValid: boolean, divergence: number } {
  const divergence = Math.abs(simFreq - theoryFreq) / theoryFreq;
  const isValid = divergence <= threshold;
  
  return {
    isValid,
    divergence
  };
}
