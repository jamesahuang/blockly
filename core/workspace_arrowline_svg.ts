/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a code comment on a rendered workspace.
 *
 * @class
 */
// Former goog.module ID: Blockly.WorkspaceCommentSvg

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_selected.js';

import * as Css from './css.js';
// import type {CommentMove} from './events/events_comment_move.js';
import * as eventUtils from './events/utils.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import {WorkspaceArrowline} from './workspace_arrowline.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import { Coordinate } from './utils.js';
import { BlockSvg } from './blockly.js';

/**
 * Class for a workspace arrowline's SVG representation.
 */
export class WorkspaceArrowlineSvg
  extends WorkspaceArrowline
{
  override workspace: WorkspaceSvg;

  // Create core elements for the block.
  private readonly svgGroup: SVGElement;

  /** The SVG path for the arrow from the anchor to the bubble. */
  line: SVGPathElement;

  startX: number;
  startY: number;
  endX: number;
  endY: number;

  /** Whether the comment is rendered onscreen and is a part of the DOM. */
  private rendered = false;

  /**
   * @param workspace The block's workspace.
   * @param from blockId
   * @param to blockId
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   */
  constructor(
    workspace: WorkspaceSvg,
    from: string,
    to: string,
    opt_id?: string,
  ) {
    super(workspace, from, to, opt_id);
    this.svgGroup = dom.createSvgElement(Svg.G, {'class': 'blocklyArrowline'});
    this.svgGroup.setAttribute('data-id', this.id);
    this.workspace = workspace;
    const constants = this.workspace.getRenderer().getConstants();
    this.line = dom.createSvgElement(Svg.PATH, {
      'marker-end': `url(#${
        constants.lineArrowMarkerId
      })`,
      'stroke-width':'2',
      fill: 'none',
      stroke: constants.ARROWLINE_MARKER_END_COLOUR,
    });
    this.svgGroup.appendChild(this.line);
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
  }

  /**
   * Dispose of this comment.
   *
   * @internal
   */
  override dispose() {
    if (this.disposed_) {
      return;
    }

    if (eventUtils.isEnabled()) {
      // eventUtils.fire(new (eventUtils.get(eventUtils.COMMENT_DELETE))(this));
    }

    dom.removeNode(this.svgGroup);
    this.disposeInternal_();

    eventUtils.disable();
    super.dispose();
    eventUtils.enable();
  }

  /**
   * Create and initialize the SVG representation of a workspace comment.
   * May be called more than once.
   *
   * @internal
   */
  initSvg() {
    if (!this.workspace.rendered) {
      throw TypeError('Workspace is headless.');
    }
    if (!this.getSvgRoot().parentNode) {
      this.workspace.getBtNodeCanvas().appendChild(this.getSvgRoot());
    }
  }

  /**
   * @internal
   */
  override translate(blockId: string, dxy: Coordinate): void {    
    // const event = new (eventUtils.get(eventUtils.COMMENT_MOVE))(
    //   this,
    // ) as CommentMove;
    
    // event.recordNew();
    // eventUtils.fire(event);
    // this.workspace.resizeContents();
    let sx = this.startX;
    let sy = this.startY;
    let ex = this.endX;
    let ey = this.endY;

    if (blockId !== this.fromBlockId && blockId !== this.toBlockId) {
      return;
    }
    const block = this.workspace.getBlockById(blockId);
    if (!block) {
      return;
    }
    if (blockId === this.fromBlockId) {
      sx += dxy.x;
      sy += dxy.y;
    } else if (blockId === this.toBlockId) {
      ex += dxy.x;
      ey += dxy.y;
    }

    this.updateLine(sx, sy, ex, ey);
  }

  /**
   * Return the root node of the SVG or null if none exists.
   *
   * @returns The root SVG node (probably a group).
   * @internal
   */
  getSvgRoot(): SVGElement {
    return this.svgGroup;
  }

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   *
   * @param _enable True if auto-layout should be enabled, false otherwise.
   * @internal
   */
  setAutoLayout(_enable: boolean) {}
  // NOP for compatibility with the bubble dragger.

  /**
   * below: workspaceCommentSVg
   */

  private updateLine(startX: number, startY: number, endX: number, endY: number) {
    const steps = [];
    steps.push('M' + startX + ',' + startY + ' ');
    steps.push('L' + endX + ',' + endY);

    this.line?.setAttribute('d', steps.join(' '));
  }

  private moveTo(startX: number, startY: number, endX: number, endY: number) {
    this.updateLine(startX, startY, endX, endY);

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  private resetLine() {
    const location = this.getFromToLocations();
    if (location) {
      this.moveTo(
        location.from.x,
        location.from.y,
        location.to.x,
        location.to.y,
      );
    }
  }

  private getLineConnectXY(block: BlockSvg, isFrom: boolean) : Coordinate | null {
    const node = isFrom ? block.rbtNode : block.lbtNode;
    if (!node) {
      return null;
    }
    const location = node.getAnchorLocation();
    const lineOffset = node.getLineOffset();
    return new Coordinate(location.x + lineOffset.x, location.y + lineOffset.y);
  };

  private getFromToLocations(): { from: Coordinate, to: Coordinate } | null {
    const fromBlock = this.workspace.getBlockById(this.fromBlockId);
    const toBlock = this.workspace.getBlockById(this.toBlockId);
    if (fromBlock && toBlock) {
      const from = this.getLineConnectXY(fromBlock, true);
      const to = this.getLineConnectXY(toBlock, false);
      if (from && to) {
        return { from, to };
      }
    }
    return null;
  }

  rerenderLine() {
    if (!this.rendered) {
      return;
    }

    this.resetLine();
  }

  /**
   * Renders the workspace comment.
   *
   * @internal
   */
  render() {
    if (this.rendered) {
      return;
    }

    this.resetLine();

    this.rendered = true;
  }

  disposeInternal_() {
  }

  /**
   * Decode an XML comment tag and create a rendered comment on the workspace.
   *
   * @param xmlComment XML comment element.
   * @param workspace The workspace.
   * @param opt_wsWidth The width of the workspace, which is used to position
   *     comments correctly in RTL.
   * @returns The created workspace comment.
   * @internal
   */
  static fromXmlRendered(
    xmlComment: Element,
    workspace: WorkspaceSvg,
    _opt_wsWidth?: number,
  ): WorkspaceArrowlineSvg {
    eventUtils.disable();
    let comment;
    try {
      const info = WorkspaceArrowline.parseAttributes(xmlComment);

      comment = new WorkspaceArrowlineSvg(
        workspace,
        info.from,
        info.to,
        info.id,
      );
      if (workspace.rendered) {
        comment.initSvg();
        comment.render();
      }
      // comment.translate(info.from, info.to);
    } finally {
      eventUtils.enable();
    }

    // WorkspaceArrowline.fireCreateEvent(comment);
    return comment;
  }

  static fromJsonRendered(
    state: any,
    workspace: WorkspaceSvg,
    _opt_wsWidth?: number,
    ):WorkspaceArrowlineSvg {
      eventUtils.disable();
      let comment;
      try {
        const info = WorkspaceArrowline.parseAttributesFromState(state);

        comment = new WorkspaceArrowlineSvg(
          workspace,
          info.from,
          info.to,
          info.id,
        );
        if (workspace.rendered) {
          comment.initSvg();
          comment.render();
        }
        // comment.translate(info.from, info.to);
      } finally {
        eventUtils.enable();
      }

      // WorkspaceArrowline.fireCreateEvent(comment);
      return comment;
  }
}

/** CSS for workspace arrowline.  See css.js for use. */
Css.register(`
.blocklyArrowline {
}
`);
