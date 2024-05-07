/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IIcon} from '../interfaces/i_icon.js';
import {CommentIcon} from './comment_icon.js';
import {MutatorIcon} from './mutator_icon.js';
import {WarningIcon} from './warning_icon.js';
import {BtLeftNodeIcon} from './bt_left_node_icon.js';
import {BtRightNodeIcon} from './bt_right_node_icon.js';
import {BtBaseNodeIcon} from './bt_base_node_icon.js';
import { BtOrderIcon } from './bt_order_icon.js';

/**
 * Defines the type of an icon, so that it can be retrieved from block.getIcon
 */
export class IconType<_T extends IIcon> {
  /** @param name The name of the registry type. */
  constructor(private readonly name: string) {}

  /** @returns the name of the type. */
  toString(): string {
    return this.name;
  }

  /** @returns true if this icon type is equivalent to the given icon type. */
  equals(type: IconType<IIcon>): boolean {
    return this.name === type.toString();
  }

  static MUTATOR = new IconType<MutatorIcon>('mutator');
  static WARNING = new IconType<WarningIcon>('warning');
  static COMMENT = new IconType<CommentIcon>('comment');
  static IBT_NODE = new IconType<BtBaseNodeIcon>('ibt_node');
  static LBT_NODE = new IconType<BtLeftNodeIcon>('lbt_node');
  static RBT_NODE = new IconType<BtRightNodeIcon>('rbt_node');
  static ORDER_NODE = new IconType<BtOrderIcon>('order_node');
}
