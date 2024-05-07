import { BlockSvg } from "./blockly";

interface Comparable {
  compareTo(other: Comparable): number;
}

export class TreeNode implements Comparable {
  value: BlockSvg;
  rectTop: number = 0;
  weight: number;
  preNodesWeightSum: number = 0; // 当前节点的前序节点的权重和
  children: LinkedList<TreeNode> = new LinkedList();

  constructor(value: BlockSvg, weight: number, top: number) {
    this.value = value;
    this.weight = weight;
    this.rectTop = top;
  }

  addChild(childNode: TreeNode) {
    this.children.insertInOrder(childNode);
  }

  compareTo(other: TreeNode): number {
    return this.rectTop - other.rectTop;
  }
}

class ListNode<T extends Comparable> {
  data: T;
  next: ListNode<T> | null;
  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * 子节点链表
 */
class LinkedList<T extends Comparable> {
  head: ListNode<T> | null;
  constructor() {
    this.head = null;
  }

  // 按序插入数据
  insertInOrder(data: T) {
    const newNode = new ListNode(data);
    if (!this.head || newNode.data.compareTo(this.head.data) < 0) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next && current.next.data.compareTo(newNode.data) < 0) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  forEach(callback: (data: T, index: number) => void) {
    let index = 0;
    let currentNode = this.head;
    while (currentNode) {
      callback(currentNode.data, index);
      currentNode = currentNode.next;
      index++;
    }
  }
}

export const treeToList = (node: TreeNode, result: TreeNode[] = []): TreeNode[] => {
  if (!node) {
    return result;
  }
  result.push(node);
  node.children.forEach(child => treeToList(child, result));
  return result;
}