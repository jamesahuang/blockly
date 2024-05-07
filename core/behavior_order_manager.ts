/**
 * Class that controls updates to behavior order during drags.
 *
 * @class
 */


import { TreeNode, treeToList } from './behavior_node_models.js';
import type {BlockSvg} from './block_svg.js';
import { BtNodeTypes } from './bt_node_type.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Manages updating of behavior orders during a drag operation.
 */
export class BehaviorOrderManager {
  /**
   * The top block in the stack being dragged.
   * Does not change during a drag.
   */
  private readonly topBlock: BlockSvg;

  /**
   * 如果是wrapper节点，记录第一个积木
   * wrapper被删除时，取不到子积木，所以需要记录，用于判断是否要刷新
   */
  private readonly wrappedFirstBlock: BlockSvg | null;

  /**
   * The workspace on which these connections are being dragged.
   * Does not change during a drag.
   */
  private readonly workspace: WorkspaceSvg;


  /** @param block The top block in the stack being dragged. */
  constructor(block: BlockSvg) {
    this.topBlock = block;

    this.wrappedFirstBlock = block.isBtWrapper() ? this.getWrappedFirstBlock(block) : null;

    this.workspace = block.workspace;
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
  }

  getWrappedFirstBlock(btWrapper: BlockSvg): BlockSvg | null {
    return btWrapper.getInput('DO')?.connection?.targetBlock() as BlockSvg ?? null;
  }


  /**
   * 更新节点顺序
   * 
   * @returns 是否触发刷新
   */
  update(): boolean {
    const shouldUpdate = this.shouldUpdate();
    const block = this.topBlock;

    if (!shouldUpdate) {
      console.log('behavior order update not needed');
      return false;
    }

    // TODO: 这里每次都重新构建一棵树，基于ai行为树体量不大，后续再考虑局部刷新
    const topNode = this.createNodeTree();
    if (!topNode) {
      return false;
    }

    console.log('behavior order tree created', topNode);

    block.btOrder?.setOrder(null);

    // 树以外的节点，要恢复为空顺序
    this.resetOutsideTreeOrder(topNode);

    // 树有了，我们开始把顺序显示到积木中
    this.updateTreeOrder(topNode);

    return true;
  }

  /**
   * @returns 当前积木是否要触发顺序更新的逻辑
   * 
   * @internal
   */
  shouldUpdate(): boolean {
    let block: BlockSvg | null = this.topBlock;

    if (block.isBtWrapper()) {
      block = this.wrappedFirstBlock;
    }

    if (!block) {
      return false;
    }

    const preOrder: number | null = block.btOrder?.getOrder() ?? null;
    if (preOrder !== null) {
      return true;
    }

    if (block.isDisposed()) {
      return false;
    }

    if (block.getNextBlock()?.btOrder?.getOrder() ?? null !== null) {
      return true;
    }

    return false;
  }

  /**
   * 从根节点创建整颗树
   * wrapper类型的积木为一个节点，每个节点包含的子积木数为权重
   * 变了前序节点的权重和，即为自己的顺序起点
   * 
   * @returns 树的根节点, 或者null
   */
  createNodeTree(): TreeNode | null {
    let topNode: TreeNode | null = null;
    const nodes: { [key: string]: TreeNode } = {};

    const lines = this.workspace.getBottomArrowlines();
    lines.forEach(line => {
      const pair = line.getPair();
      pair.forEach(blockId => {
        if (nodes[blockId]) {
          return;
        }

        const block = this.workspace.getBlockById(blockId);
        if (!block) {
          return;
        }

        const wrappedFirstBlock = this.getWrappedFirstBlock(block);
        const wrapBlockCount = this.getFollowingCount(wrappedFirstBlock);

        nodes[blockId] = new TreeNode(block, wrapBlockCount, block.getBoundingRectangle().top);

        if (!topNode && BtNodeTypes.isTop(block?.getBtWrapNodeType())) {
          topNode = nodes[blockId];
        }
      });
      const [from, to] = pair;
      nodes[from].addChild(nodes[to]);
    });

    // 连线中找不到根节点，根节点独苗了
    if (!topNode) {
      const topBlocks = this.workspace.getTopBlocks().filter(block => block.isBtTopNodeOrWrapper());
      const [topBlock] = topBlocks;
      if (topBlock) {
        topNode = new TreeNode(topBlock, 1, 0);
      }
    }

    if (topNode) {
      this.updatePreNodesWeightSum(topNode);
    }

    return topNode;
  }

  // TODO: 是否有现存方法算跟随的积木总数？
  private getFollowingCount(block: BlockSvg | null): number {
    if (!block) {
      return 0;
    }
    let blockCount = 0;
    let nextBlock: BlockSvg | null = block;
    do {
      blockCount++;
      nextBlock = nextBlock.getNextBlock();
    } while (nextBlock);
    return blockCount;
  }

  /**
   * 更新权重，权重即当前切到积木顺序的起始值
   *
   * @param curNode 
   * @param parentSum
   */
  private updatePreNodesWeightSum(node: TreeNode) {
    let accumulatedWeight: number = 0;
    const loopNodesWeightSum = (node: TreeNode) => {
      // 当前节点的preNodesWeightSum是累积的权重加上当前节点的weight
      node.preNodesWeightSum = accumulatedWeight;

      // 累积权重需要包括当前节点的weight，以便传递给子节点
      accumulatedWeight = accumulatedWeight + node.weight;

      // 递归更新子节点的preNodesWeightSum
      node.children.forEach(child => loopNodesWeightSum(child));
    }
    loopNodesWeightSum(node);
  }

  /**
   * 
   * @param node 
   * 
   * @internal
   */
  private renderTreeOrder(node: TreeNode) {
    if (!node) {
      return;
    }

    const { value, preNodesWeightSum } = node;
    const firstBlock = value.getChildren(false)[0];

    let count = 1;
    firstBlock.btOrder?.setOrder(preNodesWeightSum + count);
    let nextBlock = firstBlock.getNextBlock();
    while (nextBlock) {
      count += 1;
      nextBlock.btOrder?.setOrder(preNodesWeightSum + count);
      nextBlock = nextBlock.getNextBlock();
    }
  }

  private updateTreeOrder(node: TreeNode) {
    this.renderTreeOrder(node);
    node.children.forEach(child => this.updateTreeOrder(child));
  }

  /**
   * 这里有两种做法：
   * A. 重置所有积木，较简单
   * B. 只重置不在树中的积木
   * 
   * @internal
   */
  private resetOutsideTreeOrder(topNode: TreeNode) {
    // A. 把所有积木顺序重置，这样做最简单保险，但是和树节点刷有部分重叠，冗余。
    // this.workspace.getAllBlocks().forEach(block => block.setNodeOrder(null));

    // B. 只重置不在树中的积木。 TODO: 与A相比的实际效率未知
    const insideBlockIdMap = new Map();
    treeToList(topNode).forEach(node => insideBlockIdMap.set(node.value.id, 1));
    const outSideTopBlocks = this.workspace.getTopBlocks().filter(block => !insideBlockIdMap.has(block.id));
    outSideTopBlocks.forEach(block => {
      if (block.isBtWrapper()) {
        let nextBlock = this.getWrappedFirstBlock(block);
        while (nextBlock) {
          nextBlock.setNodeOrder(null);
          nextBlock = nextBlock.getNextBlock();
        };
      } else {
        block.setNodeOrder(null);
      }
    });
  }
}
