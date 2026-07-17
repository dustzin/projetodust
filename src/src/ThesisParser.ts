export interface ParsedConstants {
  frequency?: number;
  elasticity?: number;
  damping?: number;
  threshold?: number;
  [key: string]: number | undefined;
}

export async function parseThesisManifesto(): Promise<ParsedConstants | null> {
  try {
    const response = await fetch('data/VibPhys_Hub/thesis_manifesto.md');
    if (!response.ok) {
      throw new Error('Failed to load thesis_manifesto.md');
    }
    const text = await response.text();

    const constants: ParsedConstants = {};
    
    // Parses lines looking for: [PHYS_MODEL] <VarName> = <Value>
    const regex = /\[PHYS_MODEL\]\s+([a-zA-Z0-9_]+)\s*=\s*([\d.]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      const varValue = parseFloat(match[2]);
      constants[varName] = varValue;
    }

    return constants;
  } catch (err) {
    console.error('Error parsing thesis manifesto:', err);
    return null;
  }
}
