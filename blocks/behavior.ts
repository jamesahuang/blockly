import * as Extensions from '../core/extensions.js';

import { createBlockDefinitionsFromJsonArray, defineBlocks } from '../core/common.js';
import { Block, BtNodeType } from '../core/blockly.js';

export const blocks = createBlockDefinitionsFromJsonArray([
  {
    type: 'behavior_wrapper',
    message0: '%1',
    args0: [
      {
        type: 'input_statement',
        name: 'DO'
      }
    ],
    inputsInline: true,
    style: 'bt_blocks',
    extensions: ['insert_behavior_draggers'],
  },
  {
    type: 'behavior_top',
    message0: 'I AM %1',
    args0:[
      {
        type: 'input_dummy',
        name: 'dummy',
        align: 'CENTER',
      }
    ],
    message1: 'TOP %1',
    args1:[
      {
        type: 'input_dummy',
        name: 'dummy',
        align: 'CENTER',
      }
    ],
    previousStatement: null,
    style: 'procedure_blocks',
    extensions: ['init_behavior_top'],
  },
]);

Extensions.register('insert_behavior_draggers', function (this: Block) {
  setTimeout(() => {
    this.showNodeDragger();
  }, 0);
});

Extensions.register('init_behavior_top', function (this: Block) {
  this.setBtNodeType(BtNodeType.TOP);
});

defineBlocks(blocks);
