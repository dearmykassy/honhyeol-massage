import {
  ACTIVE_REGION_NODES,
  getParentNode,
  type RegionNode,
} from "@/lib/regions";

export const REGIONAL_IMAGE_ASSET_COUNT = 130;

const INDEX_BY_PATH = new Map(
  ACTIVE_REGION_NODES.map((node, index) => [node.path, index]),
);

const PARENT_INDEXES = ACTIVE_REGION_NODES.map((node) => {
  const parent = getParentNode(node);
  return parent ? (INDEX_BY_PATH.get(parent.path) ?? -1) : -1;
});

const CHILD_INDEXES = ACTIVE_REGION_NODES.map(() => [] as number[]);
for (const [childIndex, parentIndex] of PARENT_INDEXES.entries()) {
  if (parentIndex >= 0) CHILD_INDEXES[parentIndex].push(childIndex);
}

function createAssetIndexes(): number[] {
  const assignments = ACTIVE_REGION_NODES.map(
    (_, index) => index % REGIONAL_IMAGE_ASSET_COUNT,
  );

  const isLocallyValid = (nodeIndex: number, assetIndex: number): boolean => {
    const parentIndex = PARENT_INDEXES[nodeIndex];
    if (parentIndex >= 0 && assignments[parentIndex] === assetIndex) return false;
    return CHILD_INDEXES[nodeIndex].every(
      (childIndex) => assignments[childIndex] !== assetIndex,
    );
  };

  for (let nodeIndex = 0; nodeIndex < assignments.length; nodeIndex += 1) {
    if (isLocallyValid(nodeIndex, assignments[nodeIndex])) continue;

    let swapIndex = -1;
    for (
      let candidateIndex = nodeIndex + 1;
      candidateIndex < assignments.length;
      candidateIndex += 1
    ) {
      if (assignments[candidateIndex] === assignments[nodeIndex]) continue;

      const currentAsset = assignments[nodeIndex];
      const candidateAsset = assignments[candidateIndex];
      assignments[nodeIndex] = candidateAsset;
      assignments[candidateIndex] = currentAsset;
      const valid =
        isLocallyValid(nodeIndex, assignments[nodeIndex]) &&
        isLocallyValid(candidateIndex, assignments[candidateIndex]);
      assignments[nodeIndex] = currentAsset;
      assignments[candidateIndex] = candidateAsset;

      if (valid) {
        swapIndex = candidateIndex;
        break;
      }
    }

    if (swapIndex < 0) {
      throw new Error(
        `HONHYEOL_MASSAGE_REGION_IMAGE_ASSIGNMENT_UNRESOLVED:${ACTIVE_REGION_NODES[nodeIndex].path}`,
      );
    }

    [assignments[nodeIndex], assignments[swapIndex]] = [
      assignments[swapIndex],
      assignments[nodeIndex],
    ];
  }

  return assignments;
}

const ASSET_INDEXES = createAssetIndexes();

export function getRegionalImageAssetNumber(node: RegionNode): number {
  const nodeIndex = INDEX_BY_PATH.get(node.path);
  if (nodeIndex === undefined) {
    throw new Error(`HONHYEOL_MASSAGE_REGION_IMAGE_NODE_MISSING:${node.path}`);
  }
  return ASSET_INDEXES[nodeIndex] + 1;
}

export function getRegionalImageAssetId(node: RegionNode): string {
  return `hym-t4-rgn-${String(getRegionalImageAssetNumber(node)).padStart(3, "0")}-v1`;
}

export function getRegionalImageAssetPath(
  node: RegionNode,
  variant: "desktop" | "tablet" | "mobile" = "desktop",
): string {
  return `/assets/honhyeol-massage/template4-regional/${getRegionalImageAssetId(node)}/${variant}.webp`;
}
