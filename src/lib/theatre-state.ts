// Builds a Theatre.js project state (definition 0.4.0) from simple keyframe lists,
// so camera moves can live in code and still open in Theatre Studio for tweaking.
// Studio exports the same shape: paste an exported JSON here to replace it.

type Keyframe = { at: number; value: number };

export function buildTheatreState(
  sheetId: string,
  objectKey: string,
  length: number,
  tracks: Record<string, Keyframe[]>,
) {
  const trackData: Record<string, unknown> = {};
  const trackIdByPropPath: Record<string, string> = {};
  for (const [prop, keys] of Object.entries(tracks)) {
    const trackId = `${objectKey}-${prop}`;
    trackIdByPropPath[JSON.stringify([prop])] = trackId;
    trackData[trackId] = {
      type: "BasicKeyframedTrack",
      __debugName: `${objectKey}:${prop}`,
      keyframes: keys.map((k, i) => ({
        id: `${trackId}-${i}`,
        position: k.at,
        connectedRight: true,
        // ease-in-out bezier handles, like Studio's default "ease" curve
        handles: [0.5, 1, 0.5, 0],
        type: "bezier",
        value: k.value,
      })),
    };
  }
  return {
    sheetsById: {
      [sheetId]: {
        staticOverrides: { byObject: {} },
        sequence: {
          subUnitsPerUnit: 30,
          length,
          type: "PositionalSequence",
          tracksByObject: { [objectKey]: { trackData, trackIdByPropPath } },
        },
      },
    },
    definitionVersion: "0.4.0",
    revisionHistory: [],
  };
}
