const DELIVERY_TYPES = {
  natural: { id: 'natural', label: '顺产' },
  cesarean: { id: 'cesarean', label: '剖腹产' },
};

function getDeliveryLabel(type) {
  return DELIVERY_TYPES[type]?.label || DELIVERY_TYPES.natural.label;
}

const NATURAL_STAGES = [
  {
    from: 1,
    to: 3,
    focus: '排恶露 · 会阴护理 · 充分休息',
    care: [
      '产后 6 小时内尽量排空膀胱，防止尿潴留。',
      '会阴伤口保持清洁干燥，每次如厕后用温水冲洗，从前向后擦拭。',
      '侧卧或平躺休息，避免压迫会阴，可冰敷缓解肿胀（遵医嘱）。',
      '尽早开始母乳喂养，促进子宫收缩。',
    ],
    avoid: ['提重物', '久坐久站', '辛辣生冷食物'],
    watch: ['发热超过 38.5°C', '阴道大量出血', '会阴伤口红肿化脓'],
  },
  {
    from: 4,
    to: 7,
    focus: '观察恶露 · 轻柔活动 · 清淡饮食',
    care: [
      '恶露应由鲜红逐渐转淡，量逐步减少。',
      '可在室内短距离缓慢走动，促进循环，以不疲劳为度。',
      '饮食清淡易消化，补充优质蛋白和温热汤水。',
      '保证夜间休息，白天与宝宝同步小憩。',
    ],
    avoid: ['剧烈运动', '长时间下蹲', '油腻浓汤过量'],
    watch: ['恶露突然增多', '异味加重', '持续剧烈腹痛'],
  },
  {
    from: 8,
    to: 14,
    focus: '伤口恢复 · 逐步活动 · 情绪关注',
    care: [
      '会阴伤口大多逐渐愈合，继续注意清洁。',
      '可适度增加散步时间，每次 10～15 分钟。',
      '开始做凯格尔运动（盆底肌收缩），有助盆底恢复。',
      '关注情绪变化，多与家人沟通，寻求支持。',
    ],
    avoid: ['跑步、跳跃', '负重超过宝宝体重', '熬夜劳累'],
    watch: ['伤口裂开或渗液', '持续情绪低落超过 2 周'],
  },
  {
    from: 15,
    to: 21,
    focus: '体力回升 · 营养均衡 · 盆底康复',
    care: [
      '多数妈妈体力明显好转，可逐步恢复日常轻度家务。',
      '饮食均衡，增加鱼、蛋、瘦肉、深色蔬菜。',
      '坚持盆底肌训练，每天 2～3 组。',
      '哺乳期间保证饮水充足。',
    ],
    avoid: ['腹部剧烈运动', '完全忌口导致营养不足'],
    watch: ['漏尿加重', '腰骶部持续疼痛'],
  },
  {
    from: 22,
    to: 28,
    focus: '调养期 · 适度社交 · 复查准备',
    care: [
      '恶露基本干净，身体进入调养阶段。',
      '可外出短途活动，注意保暖，避免过度疲劳。',
      '准备产后 42 天复查，记录想咨询医生的问题。',
      '继续保证睡眠，建立相对规律的作息。',
    ],
    avoid: ['过度劳累', '忽视复查'],
    watch: ['异常出血回潮', '乳房红肿热痛'],
  },
  {
    from: 29,
    to: 42,
    focus: '巩固恢复 · 长期习惯 · 复查随访',
    care: [
      '逐步恢复产前活动量，但仍需循序渐进。',
      '保持均衡饮食和适度运动习惯。',
      '42 天产检评估子宫复旧、盆底功能等情况。',
      '根据医生建议规划后续运动与避孕。',
    ],
    avoid: ['急于恢复高强度健身', '忽视盆底康复'],
    watch: ['反复出血', '持续骨盆不适'],
  },
];

const CESAREAN_STAGES = [
  {
    from: 1,
    to: 3,
    focus: '伤口观察 · 尽早翻身 · 严格休息',
    care: [
      '术后 6 小时内禁食水（遵医嘱），之后从流质逐步过渡。',
      '在护士或家人帮助下尽早翻身、下床，预防血栓和肠粘连。',
      '腹部伤口保持敷料干燥，避免牵拉咳嗽时用力（可手托伤口）。',
      '使用镇痛泵或遵医嘱止痛，不要硬扛疼痛。',
    ],
    avoid: ['自行揭开敷料', '剧烈咳嗽不护伤口', '过早负重'],
    watch: ['伤口渗血渗液', '高热寒战', '下肢肿痛'],
  },
  {
    from: 4,
    to: 7,
    focus: '伤口护理 · 缓慢活动 · 预防便秘',
    care: [
      '可在搀扶下短距离行走，促进肠蠕动和血液循环。',
      '保持伤口清洁，穿宽松棉质衣物，避免摩擦。',
      '多吃富含膳食纤维的食物，适量饮水，预防便秘。',
      '哺乳时可用枕头垫在腹部上方，减轻伤口压力。',
    ],
    avoid: ['提重物', '突然起身', '辛辣刺激食物'],
    watch: ['伤口红肿热痛', '恶露增多有异味', '腹胀不排气'],
  },
  {
    from: 8,
    to: 14,
    focus: '疤痕恢复 · 适度活动 · 营养补充',
    care: [
      '伤口表面逐渐愈合，继续避免牵拉和负重。',
      '室内活动量可略增，以微微出汗、不疲劳为宜。',
      '补充蛋白质和维生素 C，有助伤口愈合。',
      '注意疤痕护理，避免抓挠，遵医嘱使用祛疤产品。',
    ],
    avoid: ['仰卧起坐', '抱重物上楼', '完全卧床不动'],
    watch: ['疤痕渗液', '持续低热', '咳嗽加重伤口痛'],
  },
  {
    from: 15,
    to: 21,
    focus: '体力恢复 · 核心保护 · 情绪调适',
    care: [
      '多数妈妈可承担更多日常照护，但仍需避免腹部用力。',
      '起床时先侧身再用手臂支撑，减少腹肌牵拉。',
      '开始轻柔的盆底肌训练（遵医嘱）。',
      '剖腹产恢复通常比顺产慢，不必与他人比较进度。',
    ],
    avoid: ['跑步、跳绳', '提超过 5kg 重物', '忽视情绪问题'],
    watch: ['伤口裂开', '持续失眠焦虑'],
  },
  {
    from: 22,
    to: 28,
    focus: '疤痕养护 · 逐步外出 · 复查准备',
    care: [
      '疤痕可能发痒，属愈合过程，不要抓挠。',
      '可短途外出，避免提购物袋等负重。',
      '准备 42 天复查，关注子宫恢复和疤痕情况。',
      '饮食继续均衡，适当温补但不过量。',
    ],
    avoid: ['疤痕暴晒', '腹部高强度训练'],
    watch: ['疤痕增生明显', '异常出血'],
  },
  {
    from: 29,
    to: 42,
    focus: '长期恢复 · 核心重建 · 复查随访',
    care: [
      '42 天复查后，根据医生建议逐步恢复运动。',
      '核心肌群训练需在专业指导下进行，不宜过早。',
      '关注疤痕和腹部肌肉分离（腹直肌）恢复情况。',
      '规划合理避孕，给子宫充分恢复时间。',
    ],
    avoid: ['未经评估就高强度健身', '忽视疤痕护理'],
    watch: ['持续腰背痛', '盆底功能问题'],
  },
];

function getStagesData(deliveryType) {
  return deliveryType === 'cesarean' ? CESAREAN_STAGES : NATURAL_STAGES;
}

function formatRangeLabel(from, to) {
  return to > from ? `第 ${from}～${to} 天` : `第 ${from} 天`;
}

function formatStage(stage, index) {
  return {
    index,
    from: stage.from,
    to: stage.to,
    rangeLabel: formatRangeLabel(stage.from, stage.to),
    stageLabel: `阶段 ${index + 1}`,
    focus: stage.focus,
    care: stage.care,
    avoid: stage.avoid,
    watch: stage.watch,
  };
}

function getStageIndexByDay(day) {
  const d = Math.max(1, Math.min(day, 42));
  const stages = NATURAL_STAGES;
  const idx = stages.findIndex((s) => d >= s.from && d <= s.to);
  return idx >= 0 ? idx : stages.length - 1;
}

function getStages(deliveryType) {
  const type = deliveryType === 'cesarean' ? 'cesarean' : 'natural';
  return getStagesData(type).map((stage, index) => formatStage(stage, index));
}

function getStageGuide(deliveryType, stageIndex) {
  const type = deliveryType === 'cesarean' ? 'cesarean' : 'natural';
  const label = getDeliveryLabel(type);
  const stages = getStagesData(type);
  const idx = Math.max(0, Math.min(stageIndex, stages.length - 1));
  const stage = formatStage(stages[idx], idx);

  return {
    deliveryType: type,
    deliveryLabel: label,
    ...stage,
  };
}

function getStageGuideByDay(deliveryType, day) {
  return getStageGuide(deliveryType, getStageIndexByDay(day));
}

module.exports = {
  DELIVERY_TYPES,
  getDeliveryLabel,
  getStages,
  getStageGuide,
  getStageGuideByDay,
  getStageIndexByDay,
};
