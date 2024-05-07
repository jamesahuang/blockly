Blockly.Msg.ON_START_SHORT = '开始';  
// Blockly.Msg.ON_START_SHORT = 'xxxxx %2';
// Blockly.Msg.MATH_NUMBER_SHORT = '数字-简短名字 %1';
Blockly.Msg.TEST_SHORT_NAME_2_SHORT = '测试简短名字积木-不带input';
Blockly.Msg.TEST_SHORT_NAME_3_SHORT = '测试简短名字积木-带input %2';
Blockly.Msg.TEST_SHORT_NAME_4_SHORT = '测试简短名字积木-input换顺序 %2 %1';
Blockly.Msg.CONTROLS_REPEAT_EXT_SHORT = '多次循环';
Blockly.Msg.CONTROLS_IF_SHORT = "if-短名字"

Blockly.Msg.EVENT_GLOBAL_ONSIGNAL = '当接收到 %1 信号 %2 %3';
Blockly.Msg.EVENT_GLOBAL_ONSIGNAL_SHORT = '当接收到信号'; 
Blockly.Msg.EVENT_GLOBAL_ONSIGNAL_DEFAULT_NAME = '当接收到信号'; 

Blockly.Msg.ACTION_PLAYER_SETNUMBER_SHORT = "设置玩家 %2 属性"

Blockly.defineBlocksWithJsonArray([
  {
    type: 'move',
    message0: '移动',
    previousStatement: null,
    nextStatement: null,
    style: 'colour_blocks',
    inputsInline: true
  },
  {
    type: 'move2',
    message0: '移动(占位8888888)',
    previousStatement: null,
    nextStatement: null,
    style: 'colour_blocks',
    inputsInline: true
  },
  {
    type: 'value',
    message0: '值(padding 24)',
    style: 'colour_blocks',
    output: "String",
    inputsInline: true
  },
]);

Blockly.defineBlocksWithJsonArray([
  {
    type: 'on_start',
    message0: 'On Start %1 %2 %3',
    args0: [
      {
        type: 'input_dummy',
        align: 'CENTRE'
      },
      {
        type: 'input_value',
        name: 'NAME'
      },
      {
        type: 'input_statement',
        name: 'DO'
      }
    ],
    style: 'colour_blocks',
    inputsInline: true
  },
  {
    type: 'test_short_name_1',
    message0: '测试不简化名字 1 %2 %1 %3',
    args0: [
      {
        type: 'input_value',
        name: 'NAME'
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}', 'ROUNDDOWN'],
        ],
      },
      {
        type: 'field_number',
        name: 'NUM',
      }
    ],
    style: 'colour_blocks',
    previousStatement: null,
    nextStatement: null,
    inputsInline: true
  },
  {
    type: 'test_short_name_2',
    message0: '测试简化名字 2 %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'NAME'
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}', 'ROUNDDOWN'],
        ],
      },
      {
        type: 'field_number',
        name: 'NUM',
      }
    ],
    style: 'colour_blocks',
    previousStatement: null,
    nextStatement: null,
    inputsInline: true
  },
  {
    type: 'test_short_name_3',
    message0: '测试简化名字 3 %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'NAME'
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}', 'ROUNDDOWN'],
        ],
      },
      {
        type: 'field_number',
        name: 'NUM',
      }
    ],
    style: 'colour_blocks',
    previousStatement: null,
    nextStatement: null,
    inputsInline: true
  },
  {
    type: 'test_short_name_4',
    message0: '测试简化名字 4 %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'NAME'
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['%{BKY_MATH_ROUND_OPERATOR_ROUND}', 'ROUND'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDUP}', 'ROUNDUP'],
          ['%{BKY_MATH_ROUND_OPERATOR_ROUNDDOWN}', 'ROUNDDOWN'],
        ],
      },
      {
        type: 'field_number',
        name: 'NUM',
      }
    ],
    style: 'colour_blocks',
    previousStatement: null,
    nextStatement: null,
    inputsInline: true
  },
  {
    type: 'Action_Player_SetNumber',
    message0: '玩家 %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'player',
        check: ['Player'],
      },
      {
        type: 'field_dropdown',
        name: 'option',
        options: () => [
          ["xxx", "xxx"],
          ["yyy", "yyy"],
          ["zzz", "zzz"],
        ]
      },
      {
        type: 'input_value',
        name: 'value',
        check: ['Number'],
      },
    ],
    inputsInline: true,
    previousStatement: null,
    helpUrl: '',
    style: 'colour_blocks',
    tags: 'type=ACTION&zh=设置玩家属性的数值',
  }
]);

Blockly.Blocks.Event_Global_OnSignal = {
  init() {
    this.jsonInit({
      message0: '%{BKY_EVENT_GLOBAL_ONSIGNAL}',
      args0: [
        {
          type: 'input_value',
          name: 'signalName',
          check: ['String'],
        },
        {
          type: 'input_dummy',
          name: 'dummy',
        },
        {
          type: 'input_statement',
          name: 'action',
          check: null,
        },
      ],
      inputsInline: true,
      style: 'colour_blocks',
      tags: 'type=EVENT&zh=当接收到信号',
    });
  },  
};

Blockly.Blocks.on_start_hat = {
  init() {
    this.jsonInit({
      message0: 'On Start %1 %2 %3',
      args0: [
        {
          type: 'input_dummy',
          align: 'CENTRE'
        },
        {
          type: 'input_value',
          name: 'NAME'
        },
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      inputsInline: true,
      style: 'hat_blocks',
    });

    this.setCommentText('Comment Dome');
  },
};
