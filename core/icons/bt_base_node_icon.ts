/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Warning

import type {BlockSvg} from '../block_svg.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import * as eventUtils from '../events/utils.js';
import {Icon} from './icon.js';
import type {IHasBubble} from '../interfaces/i_has_bubble.js';
import {Rect} from '../utils/rect.js';
import {Size, browserEvents} from '../utils.js';
import {Svg} from '../utils/svg.js';
import {BtNodeBubble} from '../bubbles/bt_node_bubble.js';
import {IconType} from './icon_types.js';
import * as Css from '../css.js';
import { WorkspaceArrowlineSvg } from '../workspace_arrowline_svg.js';
import { BehaviorOrderManager } from '../behavior_order_manager.js';

/**
 * An icon that warns the user that something is wrong with their block.
 *
 * For example, this could be used to warn them about incorrect field values,
 * or incorrect placement of the block (putting it somewhere it doesn't belong).
 */
export class BtBaseNodeIcon extends Icon implements IHasBubble {
  /** The type string used to identify this icon. */
  static readonly TYPE = IconType.IBT_NODE;

  /**
   * The weight this icon has relative to other icons. Icons with more positive
   * weight values are rendered farther toward the end of the block.
   */
  static readonly WEIGHT = 2;

  /** A map of warning IDs to warning text. */
  private textMap: Map<string, string> = new Map();

  /** The bubble used to display the warnings to the user. */
  private btNodeBubble: BtNodeBubble | null = null;

  private svgRect: SVGRectElement | null = null;

  // TODO: 起始点存储
  protected static FROM_BLOCK: { blockId: string, isLeft: boolean } | null = null;

  /**
   * 
   */
  protected width: number = 20;
  protected height: number = 60;
  private active: boolean = true;

  /** @internal */
  constructor(protected readonly sourceBlock: BlockSvg) {
    super(sourceBlock);

    this.offsetInBlock = new Coordinate(0, 0);
  }

  override getType(): IconType<BtBaseNodeIcon> {
    return BtBaseNodeIcon.TYPE;
  }

  override initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);
    
    this.svgRoot!.setAttribute('class', 'blocklyBehaviorIconGroup')

    // 
    browserEvents.conditionalBind(
      this.svgRoot!,
      'pointerdown',
      this,
      this.onMouseDown,
      true
    );
    browserEvents.conditionalBind(
      this.svgRoot!,
      'pointerup',
      this,
      this.onMouseUp,
      true
    );

    // Triangle with rounded corners.
    this.svgRect = dom.createSvgElement(
      Svg.RECT,
      {
        'rx': 0,
        'ry': 0,
        'x': 0,
        'y': 0,
        'width': this.width,
        'height': this.height,
        'class': this.getIconClassName(),
      },
      this.svgRoot,
    );
  }

  override dispose() {
    super.dispose();
    this.btNodeBubble?.dispose();
  }

  override getWeight(): number {
    return BtBaseNodeIcon.WEIGHT;
  }

  override getSize(): Size {
    return new Size(this.width, this.height);
  }

  setSize({ width, height} : { width?: number; height?: number}): void {
    if (typeof width === 'number' && this.width !== width) {
      this.width = width;
      this.svgRect?.setAttribute('width', String(width));
    }
    if (typeof height === 'number' && this.height !== height) {
      this.height = height;
      this.svgRect?.setAttribute('height', String(height));
    }
  }

  override applyColour(): void {
    super.applyColour();
    this.btNodeBubble?.setColour(this.sourceBlock.style.colourPrimary);
  }

  override updateCollapsed(): void {
    // We are shown when collapsed, so do nothing! I.e. skip the default
    // behavior of hiding.
  }

  /** Tells blockly that this icon is shown when the block is collapsed. */
  override isShownWhenCollapsed(): boolean {
    return false;
  }

  /** Updates the location of the icon's bubble if it is open. */
  override onLocationChange(blockOrigin: Coordinate): void {
    this.setSize({ height: this.sourceBlock.height });

    super.onLocationChange(blockOrigin);
    this.btNodeBubble?.setAnchorLocation(this.getAnchorLocation());

    this.sourceBlock.workspace.getBottomArrowlines().forEach((line) => {
      if (line.isConnecting(this.sourceBlock.id)) {
        (line as WorkspaceArrowlineSvg).rerenderLine();
      }
    });
  }

  /**
   * Adds a warning message to this warning icon.
   *
   * @param text The text of the message to add.
   * @param id The id of the message to add.
   * @internal
   */
  addMessage(text: string, id: string): this {
    if (this.textMap.get(id) === text) return this;

    if (text) {
      this.textMap.set(id, text);
    } else {
      this.textMap.delete(id);
    }

    // this.btNodeBubble?.setText(this.getText());
    return this;
  }

  /**
   * @returns the display text for this icon. Includes all warning messages
   *     concatenated together with newlines.
   * @internal
   */
  getText(): string {
    return [...this.textMap.values()].join('\n');
  }

  /** Toggles the visibility of the bubble. */
  override onClick(): void {
    super.onClick();
    // this.setBubbleVisible(!this.bubbleIsVisible());
  }

  bubbleIsVisible(): boolean {
    return !!this.btNodeBubble;
  }

  setBubbleVisible(visible: boolean): void {
    if (this.bubbleIsVisible() === visible) return;

    if (visible) {
      this.btNodeBubble = new BtNodeBubble(
        this.sourceBlock.workspace,
        this.getAnchorLocation(),
        this.getBubbleOwnerRect(),
      );
      this.applyColour();
    } else {
      this.btNodeBubble?.dispose();
      this.btNodeBubble = null;
    }

    eventUtils.fire(
      new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.sourceBlock,
        visible,
        'warning',
      ),
    );
  }

  /**
   * @returns the location the bubble should be anchored to.
   *     I.E. the middle of this icon.
   */
  public getAnchorLocation(): Coordinate {
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(this.width / 2, this.height / 2),
    );
  }

  /**
   * @returns the rect the bubble should avoid overlapping.
   *     I.E. the block that owns this icon.
   */
  private getBubbleOwnerRect(): Rect {
    const bbox = this.sourceBlock.getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }

  getBubble() {
    return this.btNodeBubble;
  }

  static recordDownPoint(blockId: string, isLeft: boolean) {
    BtBaseNodeIcon.FROM_BLOCK = { blockId, isLeft };
  }

  static clearDownPoint() {
    BtBaseNodeIcon.FROM_BLOCK = null;
  }

  /**
   * 
   */
  onMouseDown(e: PointerEvent) {
    if (!this.active) {
      return;
    }
    const gesture = this.sourceBlock.workspace.getGesture(e);
    if (gesture) {
      if (!this.bubbleIsVisible()) {
        this.setBubbleVisible(true);
        this.getBubble()?.setPositionRelativeToAnchor(0, 0);
        gesture.setStartBubble(this.getBubble()!);
      }
    }
  }

  onMouseUp(e: PointerEvent): boolean {
    if (!this.active) {
      return true;
    }
    if (!BtBaseNodeIcon.FROM_BLOCK) {
      return true;
    }
    
    const { clientX, clientY } = e;
    if (clientX !== undefined && clientY !== undefined) {
      const endTarget = document.elementFromPoint(e.clientX,e.clientY);
      if (endTarget && endTarget.classList.contains('blocklyBehaviorIconNode')) {
        const event = new TouchEvent('pointerup', {
          bubbles: true,
          cancelable: true,
        });
        endTarget.dispatchEvent(event);
        return true;
      }
    }

    if (BtBaseNodeIcon.FROM_BLOCK?.blockId === this.sourceBlock.id) {
      return true;
    }

    return false;
  }

  createArrowLine(fromBlockId: string, toBlockId: string) {
    const { workspace } = this.sourceBlock; 
    if (fromBlockId === toBlockId) {
      return;
    }
    const fromBlock = workspace.getBlockById(fromBlockId);
    const toBlock = workspace.getBlockById(toBlockId);
    if (!fromBlock || !toBlock) {
      return;
    }

    const isFromTop = fromBlock.isBtTopNodeOrWrapper();
    let isExist = false;
    workspace.getBottomArrowlines().forEach(line => {
      if (line.isSame(fromBlockId, toBlockId)) {
        isExist = true;
      }
      // 根节点只能连一个
      if (isFromTop && line.isConnectingFrom(fromBlockId)) {
        line.dispose();
      }
      // 解除目标节点已有连线
      if (line.isConnectingTo(toBlockId)) {
        line.dispose();
      }
    });
    if (isExist) {
      return;
    }

    const line = new WorkspaceArrowlineSvg(
      workspace, 
      fromBlockId,
      toBlockId);

    if (workspace.rendered) {
      line.initSvg();
      line.render();
    }

    [fromBlock, toBlock].some(block => {
      const behaviorOrderManager = new BehaviorOrderManager(block);
      return behaviorOrderManager.update();
    })
  }

  getIconClassName() {
    return this.active ? 'blocklyBehaviorIconNode' : 'blocklyBehaviorIconDisable';
  }

  setActive(active: boolean) {
    this.active = active;

    this.svgRoot?.setAttribute('class', this.getIconClassName());

    return this;
  }
}

/** CSS for workspace arrowline.  See css.js for use. */
Css.register(`
.blocklyBehaviorIconNode {
  fill: blue
}

.blocklyBehaviorIconNode:hover {
  fill: yellow
}

.blocklyBehaviorIconDisable {
  fill: #808080
}
`);
