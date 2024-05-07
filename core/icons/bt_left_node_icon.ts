/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Warning
import {IconType} from './icon_types.js';
import { BtBaseNodeIcon } from './bt_base_node_icon.js';
import { Coordinate } from '../utils.js';

/**
 * An icon that warns the user that something is wrong with their block.
 *
 * For example, this could be used to warn them about incorrect field values,
 * or incorrect placement of the block (putting it somewhere it doesn't belong).
 */
export class BtLeftNodeIcon extends BtBaseNodeIcon {
  /** The type string used to identify this icon. */
  static readonly TYPE = IconType.LBT_NODE;

  override getType(): IconType<BtLeftNodeIcon> {
    return BtLeftNodeIcon.TYPE;
  }

  override onMouseDown(e: PointerEvent): void {
    super.onMouseDown(e);

    e.preventDefault();
    BtBaseNodeIcon.recordDownPoint(this.sourceBlock.id, true);
    console.log('行为树 左节点 点击事件', BtBaseNodeIcon.FROM_BLOCK);
  }

  override onMouseUp(e: PointerEvent): boolean {
    if (super.onMouseUp(e)) {
      return true;
    }
    console.log('行为树 左节点 连接事件', e);

    if (!BtBaseNodeIcon.FROM_BLOCK || BtBaseNodeIcon.FROM_BLOCK.isLeft) {
      return false;
    }
    this.createArrowLine(
      BtBaseNodeIcon.FROM_BLOCK!.blockId,
      this.sourceBlock.id
    );

    BtBaseNodeIcon.clearDownPoint();
    return true;
  }

  getLineOffset(): Coordinate {
    return new Coordinate(-this.width / 2 - 4, 0);
  }
}
