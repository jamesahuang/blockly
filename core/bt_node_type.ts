/**
 * Enum for the type of a behavior tree node.
 */
export enum BtNodeType {
  TOP = 'top',
  LEFT = 'left',
  BOTH = 'both',
}

const BtNOdeTypes = Object.values(BtNodeType);


export const BtNodeTypes = {
  isNode(type: BtNodeType | null): boolean {
    return !!type && BtNOdeTypes.includes(type);
  },
  isTop(type: BtNodeType | null): boolean {
    return type === BtNodeType.TOP;
  },
  isLeft(type: BtNodeType | null): boolean {
    return type === BtNodeType.LEFT;
  },
}
