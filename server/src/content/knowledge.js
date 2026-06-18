const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'recovery', label: '身体恢复' },
  { id: 'diet', label: '月子饮食' },
  { id: 'mood', label: '情绪心理' },
  { id: 'exercise', label: '适度活动' },
  { id: 'caution', label: '注意事项' },
];

const ARTICLES = [
  {
    id: 'lochia-guide',
    category: 'recovery',
    icon: '💗',
    title: '恶露变化怎么看？',
    summary: '了解产后恶露的正常颜色与量，知道什么时候该警惕。',
    readMinutes: 4,
    dayRange: [1, 14],
    paragraphs: [
      '产后恶露是子宫蜕膜、血液等排出体外的正常现象，通常会持续 4～6 周。',
      '第 1～3 天：颜色偏鲜红，量较多，类似月经量或略多，属于常见情况。',
      '第 4～10 天：颜色逐渐转为淡红或粉红，量慢慢减少。',
      '第 2 周后：可变为淡黄或乳白色，量继续减少。',
      '需要警惕的情况：突然大量出血、有难闻异味、伴随高热或剧烈腹痛，请尽快就医。',
      '建议每天简单记录恶露颜色和量，便于观察恢复趋势。',
    ],
  },
  {
    id: 'wound-care',
    category: 'recovery',
    icon: '🩹',
    title: '顺产 / 剖腹产伤口护理',
    summary: '不同分娩方式的伤口护理要点，保持清洁、预防感染。',
    readMinutes: 5,
    dayRange: [1, 21],
    paragraphs: [
      '顺产会阴伤口：每次如厕后用温水冲洗，从前往后擦拭，保持干燥。避免久坐，可侧卧减轻压迫。',
      '剖腹产伤口：保持敷料清洁干燥，穿宽松棉质衣物，避免摩擦。淋浴时可用防水敷料保护（遵医嘱）。',
      '共同原则：不要用手抠结痂，不要自行使用不明药膏。',
      '若伤口红肿加重、渗液、裂开或疼痛明显加剧，应及时就医。',
      '恢复期间避免提重物、久站久走，以身体感受为准逐步增加活动。',
    ],
  },
  {
    id: 'breast-care',
    category: 'recovery',
    icon: '🤱',
    title: '哺乳期的乳房护理',
    summary: '预防堵奶、缓解胀痛，照顾好自己的乳房健康。',
    readMinutes: 4,
    dayRange: [1, 42],
    paragraphs: [
      '产后 2～3 天可能出现「生理性胀奶」，乳房胀痛、变硬，属于常见现象。',
      '让宝宝频繁吸吮是最有效的缓解方式；若宝宝暂时吸吮困难，可温敷后轻柔按摩，配合手挤或吸奶器。',
      '预防堵奶：避免长时间不排空、不要穿过紧内衣、注意哺乳姿势。',
      '若出现局部硬块伴红肿发热、全身发烧，可能是乳腺炎，需及时就医。',
      '哺乳期间也要保证自己饮水充足、营养跟上，你的状态直接影响恢复。',
    ],
  },
  {
    id: 'diet-week1',
    category: 'diet',
    icon: '🥣',
    title: '产后第 1 周怎么吃？',
    summary: '排恶露期饮食宜清淡，帮助肠胃慢慢恢复。',
    readMinutes: 4,
    dayRange: [1, 7],
    paragraphs: [
      '产后第一周身体还在排恶露、伤口恢复，饮食宜清淡、易消化、温热。',
      '推荐：小米粥、软面条、蒸蛋、清炖瘦肉、温热蔬菜汤。',
      '适量补充优质蛋白，但避免过于油腻的浓汤，以免肠胃负担过重。',
      '少食生冷、辛辣、酒精，减少胀气食物（如大量豆类）的摄入。',
      '少量多餐，细嚼慢咽，比「大补」更重要。',
    ],
  },
  {
    id: 'diet-week2',
    category: 'diet',
    icon: '🍲',
    title: '产后第 2～4 周营养补充',
    summary: '逐步增加营养，为身体恢复和哺乳储备能量。',
    readMinutes: 4,
    dayRange: [8, 28],
    paragraphs: [
      '进入第二周后，若恶露减少、肠胃适应良好，可逐步增加蛋白质和铁质。',
      '推荐：鱼肉、鸡肉、瘦牛肉、猪肝（适量）、深色蔬菜、杂粮饭。',
      '汤水可以喝，但不必迷信「越浓越好」，撇去浮油更健康。',
      '哺乳妈妈每天额外需要约 300～500 大卡能量，饥饿感增加是正常的。',
      '继续避免生冷、酒精和过度进补，均衡比猛补更重要。',
    ],
  },
  {
    id: 'diet-taboo',
    category: 'diet',
    icon: '🚫',
    title: '月子期常见饮食误区',
    summary: '澄清一些传统观念，吃对比吃多更重要。',
    readMinutes: 3,
    dayRange: [1, 42],
    paragraphs: [
      '误区一：必须天天喝猪蹄汤才能下奶——奶水分泌与吸吮频率、休息、情绪关系更大，油腻汤反而可能引起堵奶。',
      '误区二：完全不能碰水果——常温或温热的水果可以适量吃，补充维生素。',
      '误区三：越补越好——产后肠胃虚弱，过度进补易导致消化不良、体重难控。',
      '误区四：只喝粥不吃主食——需要碳水化合物提供能量，杂粮、薯类都是好选择。',
      '听从身体感受，有不适及时调整，必要时咨询医生或营养师。',
    ],
  },
  {
    id: 'mood-baby-blues',
    category: 'mood',
    icon: '💭',
    title: '产后情绪低落是正常的吗？',
    summary: '认识「产后情绪波动」，学会区分正常与需要求助的信号。',
    readMinutes: 5,
    dayRange: [1, 42],
    paragraphs: [
      '约 50%～80% 的新妈妈会在产后几天内经历情绪波动，俗称「baby blues」，表现为易哭、焦虑、疲惫、易怒。',
      '这通常与激素骤降、睡眠不足、角色转变有关，多数在 2 周内自行缓解。',
      '你可以做的：向家人表达需求、争取休息、减少对自己「必须完美」的要求。',
      '若情绪低落持续超过 2 周、影响照顾宝宝或日常生活、有伤害自己或宝宝的念头，请立即寻求专业帮助。',
      '产后抑郁是可以治疗的，求助不是软弱，是对自己和家庭负责。',
    ],
  },
  {
    id: 'mood-self-care',
    category: 'mood',
    icon: '🌸',
    title: '月子里的自我关怀',
    summary: '在照顾宝宝之前，先照顾好你自己。',
    readMinutes: 3,
    dayRange: [1, 42],
    paragraphs: [
      '接受帮助：让家人分担换尿布、洗奶瓶、做饭等事务，你不需要一个人扛下所有。',
      '保证基本睡眠：宝宝睡你也尽量休息，家务可以等一下。',
      '保持社交：与信任的朋友简短聊天，不必强撑「我很开心」。',
      '每天留 10 分钟给自己：听音乐、深呼吸、晒太阳、简单拉伸都可以。',
      '记录情绪变化（本 App 的情绪记录功能）有助于发现规律，必要时就医时有据可查。',
    ],
  },
  {
    id: 'exercise-start',
    category: 'exercise',
    icon: '🚶',
    title: '产后什么时候可以运动？',
    summary: '循序渐进恢复活动量，从轻微走动开始。',
    readMinutes: 4,
    dayRange: [14, 42],
    paragraphs: [
      '产后 1～2 周：以卧床休息和短距离室内走动为主，以不疲劳、不疼痛为原则。',
      '产后 2～6 周：可逐步增加散步时间，从 10 分钟开始，慢慢延长。',
      '剖腹产妈妈：建议遵医嘱，通常 6 周后再考虑核心训练。',
      '顺产无并发症：可较早开始凯格尔运动（盆底肌收缩），有助于盆底恢复。',
      '避免：提重物、仰卧起坐、高强度跑跳，至少在医生确认恢复良好后再进行。',
    ],
  },
  {
    id: 'exercise-pelvic',
    category: 'exercise',
    icon: '🧘',
    title: '盆底肌恢复训练入门',
    summary: '简单安全的凯格尔运动，帮助改善漏尿等问题。',
    readMinutes: 3,
    dayRange: [7, 42],
    paragraphs: [
      '盆底肌像一张「吊床」，托住膀胱、子宫和直肠。怀孕和分娩会使其松弛。',
      '凯格尔运动方法：想象憋尿时收紧的那块肌肉，保持收紧 3～5 秒，放松 3～5 秒，重复 10 次为一组，每天 2～3 组。',
      '注意：不要用夹紧臀部或大腿来代替，呼吸保持自然。',
      '坚持 4～6 周可能感受到改善，如漏尿减轻。',
      '若训练后不适加重，或漏尿严重，建议咨询妇产科医生或盆底康复师。',
    ],
  },
  {
    id: 'caution-fever',
    category: 'caution',
    icon: '🌡️',
    title: '这些情况请尽快就医',
    summary: '识别危险信号，不要硬扛。',
    readMinutes: 3,
    dayRange: [1, 42],
    paragraphs: [
      '体温 ≥ 38.5°C 且持续不退。',
      '阴道出血突然增多，每小时浸透一片卫生巾，或有大血块。',
      '恶露有恶臭，伴随剧烈腹痛。',
      '伤口红肿化脓、裂开，或疼痛急剧加重。',
      '单侧乳房红肿热痛，伴发烧。',
      '严重头痛、视力模糊、呼吸困难、下肢肿痛。',
      '持续情绪低落、有自伤或伤害宝宝的想法。',
      '遇到以上情况，不要等待，及时就医或拨打急救电话。',
    ],
  },
  {
    id: 'caution-sleep',
    category: 'caution',
    icon: '😴',
    title: '月子期睡眠与休息',
    summary: '睡眠不足会影响恢复和情绪，学会「碎片化休息」。',
    readMinutes: 3,
    dayRange: [1, 42],
    paragraphs: [
      '新生儿每 2～3 小时需要喂养，妈妈的睡眠必然被打断，这是正常的。',
      '策略：宝宝睡时你也躺下，不要趁机做家务；白天小睡 20～30 分钟也有帮助。',
      '夜间减少光线刺激，喂完奶尽快回到睡眠状态。',
      '与家人分工夜奶：母乳妈妈可提前挤奶，让家人参与一次夜喂。',
      '长期严重失眠影响情绪和功能时，请咨询医生，不要硬撑。',
    ],
  },
  {
    id: 'recovery-timeline',
    category: 'recovery',
    icon: '📅',
    title: '产后 42 天恢复时间线',
    summary: '了解身体大致恢复节奏，减少不必要的焦虑。',
    readMinutes: 5,
    dayRange: [1, 42],
    paragraphs: [
      '第 1 周：排恶露、伤口初步愈合、泌乳启动，以休息为主。',
      '第 2 周：恶露变淡，可短距离活动，情绪可能仍有波动。',
      '第 3～4 周：体力逐渐恢复，可适量增加活动，注意饮食均衡。',
      '第 5～6 周：多数妈妈感觉明显好转，42 天产检评估子宫恢复情况。',
      '每个人的恢复速度不同，剖腹产通常比顺产需要更长时间，不必与他人比较。',
      '42 天后不代表「完全恢复」，盆底、腹直肌等仍可能需要更长时间的康复。',
    ],
  },
];

function getCategoryLabel(id) {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.label : '';
}

function getArticles(category) {
  if (!category || category === 'all') return ARTICLES;
  return ARTICLES.filter((a) => a.category === category);
}

function getArticleById(id) {
  return ARTICLES.find((a) => a.id === id) || null;
}

function getRecommendedArticles(day, limit = 3) {
  const scored = ARTICLES.map((a) => {
    const [min, max] = a.dayRange || [1, 42];
    const inRange = day >= min && day <= max;
    const distance = inRange ? 0 : Math.min(Math.abs(day - min), Math.abs(day - max));
    return { article: a, score: inRange ? 0 : distance };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.article);
}

module.exports = {
  CATEGORIES,
  ARTICLES,
  getCategoryLabel,
  getArticles,
  getArticleById,
  getRecommendedArticles,
};
