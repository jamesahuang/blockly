/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a code arrowline on the workspace.
 *
 * @class
 */
// Former goog.module ID: Blockly.WorkspaceComment

import type {CommentMove} from './events/events_comment_move.js';
import * as eventUtils from './events/utils.js';
import { Coordinate } from './utils.js';
import * as idGenerator from './utils/idgenerator.js';
import * as xml from './utils/xml.js';
import type {Workspace} from './workspace.js';

/**
 * Class for a workspace comment.
 */
export class WorkspaceArrowline {

  static readonly type = 'workspace_arrowline';

  id: string;
  /** 连线起点 */
  protected fromBlockId: string;
  /** 连线终点 */
  protected toBlockId: string;

  /** Whether this arrowline has been disposed. */
  protected disposed_ = false;
  /** @internal */
  isComment = true;

  /**
   * @param workspace The block's workspace.
   * @param fromBlockId The begin of this workspace line.
   * @param toBlockId The end of this workspace line.
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   */
  constructor(
    public workspace: Workspace,
    fromBlockId: string,
    toBlockId: string,
    opt_id?: string,
  ) {
    this.id =
      opt_id && !workspace.getCommentById(opt_id)
        ? opt_id
        : idGenerator.genUid();

    workspace.addBottomArrowline(this);

    this.fromBlockId = fromBlockId;
    this.toBlockId = toBlockId;

    // WorkspaceArrowline.fireCreateEvent(this);
  }

  isConnectingTo(blockId: string): boolean {
    return blockId === this.toBlockId;
  }

  isConnectingFrom(blockId: string): boolean {
    return blockId === this.fromBlockId;
  }

  isConnecting(blockId: string): boolean {
    return blockId === this.fromBlockId || blockId === this.toBlockId;
  }

  isSame(blockIdA: string, blockIdB: string): boolean {
    return (this.fromBlockId == blockIdA && this.toBlockId == blockIdB) ||
            (this.fromBlockId == blockIdB && this.toBlockId == blockIdA);
  }

  getPair(): string[] {
    return [this.fromBlockId, this.toBlockId];
  }

  /**
   * Dispose of this comment.
   *
   * @internal
   */
  dispose() {
    if (this.disposed_) {
      return;
    }

    if (eventUtils.isEnabled()) {
      // eventUtils.fire(new (eventUtils.get(eventUtils.COMMENT_DELETE))(this));
    }
    // Remove from the list of top comments and the arrowline database.
    this.workspace.removeBottomArrowline(this);
    this.disposed_ = true;
  }

  /**
   *
   * @param blockId 
   * @param dxy dxy How far to move the icons from their original positions, in
   *     workspace units.
   */
  translate(blockId: string, _dxy: Coordinate): void {
    if (blockId !== this.fromBlockId && blockId !== this.toBlockId) {
      return;
    }
    const event = new (eventUtils.get(eventUtils.COMMENT_MOVE))(
      this,
    ) as CommentMove;
    event.recordNew();
    // eventUtils.fire(event);
  }

  /**
   *
   *
   * @param opt_noId True if the encoder should skip the arrowline ID.
   * @returns Tree of XML elements.
   * @internal
   */
  toXml(opt_noId?: boolean): Element {
    const commentElement = xml.createElement('arrowline');
    if (!opt_noId) {
      commentElement.id = this.id;
    }
    commentElement.setAttribute('from', this.fromBlockId);
    commentElement.setAttribute('to', this.toBlockId);
    return commentElement;
  }

  saveState(opt_noId?: boolean): any {
    const state = Object.create({});
    if (!opt_noId) {
      state.id = this.id;
    }
    state.from = this.fromBlockId;
    state.to = this.toBlockId;
    return state;
  }

  /**
   * @internal
   */
  isDeletable(): boolean {
    return false;
  }

  /**
   * Fire a create event for the given workspace arrowline, if arrowlines are
   * enabled.
   *
   * @param line The arrowline that was just created.
   * @internal
   */
  static fireCreateEvent(line: WorkspaceArrowline) {
    if (eventUtils.isEnabled()) {
      const existingGroup = eventUtils.getGroup();
      if (!existingGroup) {
        eventUtils.setGroup(true);
      }
      try {
        eventUtils.fire(
          new (eventUtils.get(eventUtils.COMMENT_CREATE))(line),
        );
      } finally {
        eventUtils.setGroup(existingGroup);
      }
    }
  }

  /**
   * Decode an XML arrowline tag and create a arrowline on the workspace.
   *
   * @param xmlComment XML arrowline element.
   * @param workspace The workspace.
   * @returns The created workspace comment.
   * @internal
   */
  static fromXml(xmlComment: Element, workspace: Workspace): WorkspaceArrowline {
    const info = WorkspaceArrowline.parseAttributes(xmlComment);
    const { from, to } = info;

    const line = new WorkspaceArrowline(
      workspace,
      from,
      to,
    );

    // if (from && to) {
      // line.moveBy(from, to);
    // }

    // WorkspaceArrowline.fireCreateEvent(line);
    return line;
  }

  /**
   * Decode an XML arrowline tag and return the results in an object.
   *
   * @param xml XML arrowline element.
   * @returns An object containing the id, size, position, and arrowline string.
   * @internal
   */
  static parseAttributes(xml: Element): {
    id: string;
    from: string;
    to: string;
  } {
    const from = xml.getAttribute('from') || '';
    const to = xml.getAttribute('to') || '';
    const xmlId = xml.getAttribute('id');

    if (!xmlId) {
      throw new Error('No ID present in XML arrowline definition.');
    }

    return {
      id: xmlId,
      from: from,
      to: to,
    };
  }

  static loadState(state: any, workspace: Workspace): WorkspaceArrowline {
    const info = WorkspaceArrowline.parseAttributesFromState(state);
    const arrowline = new WorkspaceArrowline(
      workspace,
      info.from,
      info.to,
      info.id,
    );

    // arrowline.moveBy(info.from, info.to);

    // WorkspaceArrowline.fireCreateEvent(arrowline);
    return arrowline;
  }

  static parseAttributesFromState(state: any): {
    id: string,
    from: string,
    to: string,
  } {
    const xmlId = state.id;
    const from = state.from;
    const to = state.to;

    if (!xmlId) {
      throw new Error('No ID present in XML arrowline definition.');
    }

    return {
      id: xmlId,
      from: from,
      to: to,
    };
  }
}
