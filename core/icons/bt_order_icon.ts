/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Warning

import type {BlockSvg} from '../block_svg.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Icon} from './icon.js';
import {Size} from '../utils.js';
import {Svg} from '../utils/svg.js';
import * as Css from '../css.js';
import {IconType} from './icon_types.js';

/** The size of the warning icon in workspace-scale units. */
const SIZE = 20;

/**
 * An icon that warns the user that something is wrong with their block.
 *
 * For example, this could be used to warn them about incorrect field values,
 * or incorrect placement of the block (putting it somewhere it doesn't belong).
 */
export class BtOrderIcon extends Icon {
  /** The type string used to identify this icon. */
  static readonly TYPE = IconType.ORDER_NODE;

  /**
   * The weight this icon has relative to other icons. Icons with more positive
   * weight values are rendered farther toward the end of the block.
   */
  static readonly WEIGHT = 10;

  private svgText: SVGTextElement | null = null;
  private order: number | null = null;

  /** @internal */
  constructor(protected readonly sourceBlock: BlockSvg) {
    super(sourceBlock);
  }

  override getType(): IconType<BtOrderIcon> {
    return BtOrderIcon.TYPE;
  }

  override initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);

    const center = SIZE / 2;

    dom.createSvgElement(
      Svg.RECT,
      {
        'rx': center,
        'ry': center,
        'x': 0,
        'y': 0,
        'width': SIZE,
        'height': SIZE,
        'class': 'blocklyBehaviorOrderBackground',
      },
      this.svgRoot,
    );

    this.svgRoot!.style['opacity'] = '1';

    this.svgText = dom.createSvgElement(
      Svg.TEXT,
      {
        'class': 'blocklyBehaviorOrderText',
        'x': center,
        'y': center,
        'font-size': `${Math.round(SIZE / 2) + 2}px`,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      },
      this.svgRoot,
    );

    this.updateOrderText();
  }

  override dispose() {
    super.dispose();
  }

  override getWeight(): number {
    return BtOrderIcon.WEIGHT;
  }

  override getSize(): Size {
    return new Size(SIZE, SIZE);
  }

  override applyColour(): void {
    super.applyColour();
  }

  override updateCollapsed(): void {
    // We are shown when collapsed, so do nothing! I.e. skip the default
    // behavior of hiding.
  }

  /** Tells blockly that this icon is shown when the block is collapsed. */
  override isShownWhenCollapsed(): boolean {
    return true;
  }

  /** Updates the location of the icon's bubble if it is open. */
  override onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);

    this.setOffsetInBlock(new Coordinate(this.sourceBlock.width - SIZE - 1, 1));
  }

  setOrder(order: number | null) {
    this.order = order;
    this.updateOrderText();

    return this;
  }

  /**
   * @returns the display text for this icon. Includes all warning messages
   *     concatenated together with newlines.
   * @internal
   */
  getOrder(): number | null {
    return this.order;
  }

  getOrderText(): string {
    return this.order === null ? '...' : String(this.order);
  }

  updateOrderText() {
    if (!this.svgText) {
      return;
    }
    this.svgText.textContent = this.getOrderText();
  }
}

/** CSS for workspace arrowline.  See css.js for use. */
Css.register(`
.blocklyBehaviorOrderBackground {
  fill: black;
}
.blocklyBehaviorOrderText {
  fill: white;
}
`);
