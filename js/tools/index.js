import jsonTool from './json.js';
import codecTool from './codec.js';
import regexTool from './regex.js';
import timestampTool from './timestamp.js';
import uuidTool from './uuid.js';
import colorTool from './color.js';
import hashTool from './hash.js';
import markdownTool from './markdown.js';
import diffTool from './diff.js';
import jwtTool from './jwt.js';
import radixTool from './radix.js';
import cssgenTool from './cssgen.js';
import cronTool from './cron.js';
import datagenTool from './datagen.js';
import textTool from './text.js';

export const CATEGORIES = ['编码 / 转换', '格式化 / 校验', '生成器', '创意 / CSS', '文本 / 时间'];

export const TOOLS = [
  jsonTool, codecTool, radixTool, jwtTool, hashTool,       // 编码 / 转换
  regexTool, markdownTool, diffTool,                       // 格式化 / 校验
  uuidTool, datagenTool,                                   // 生成器
  colorTool, cssgenTool,                                   // 创意 / CSS
  timestampTool, cronTool, textTool,                       // 文本 / 时间
];
