export const mockEntities = [
  // === Characters ===
  {
    entity_id: "e-001",
    world_id: "w-001",
    type: "character",
    name: "林清玄",
    description: "青云宗内门弟子，天赋异禀，年仅二十便突破筑基期，被誉为百年难遇的修仙奇才。",
    status: "active",
    born_story_time: "太初历三百四十二年春",
    born_sort_key: 800,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      character_state: "active",
      cultivation_level: "金丹期",
      sect: "青云宗",
      age: 25,
      spiritual_root: "天灵根（木）"
    },
    created_at: "2026-07-01T10:05:00Z",
    updated_at: "2026-07-15T08:30:00Z"
  },
  {
    entity_id: "e-002",
    world_id: "w-001",
    type: "character",
    name: "苏瑶",
    description: "天机阁弟子，精通剑道，冷若冰霜的外表下隐藏着一颗善良的心。与林清玄在历练中相识。",
    status: "active",
    born_story_time: "太初历三百四十三年秋",
    born_sort_key: 850,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      character_state: "active",
      cultivation_level: "筑基后期",
      sect: "天机阁",
      age: 23,
      spiritual_root: "冰灵根"
    },
    created_at: "2026-07-01T10:10:00Z",
    updated_at: "2026-07-14T16:00:00Z"
  },
  {
    entity_id: "e-003",
    world_id: "w-001",
    type: "character",
    name: "玄天老人",
    description: "青云宗太上长老，化神期强者，林清玄的授业恩师。在魔道入侵中为护宗门力竭而亡。",
    status: "active",
    born_story_time: "太初历一百二十年冬",
    born_sort_key: 100,
    died_story_time: "太初历三百六十七年夏",
    died_sort_key: 6000,
    custom_attributes: {
      character_state: "dead",
      cultivation_level: "化神期",
      sect: "青云宗",
      age: 800,
      cause_of_death: "力竭护宗"
    },
    created_at: "2026-07-01T10:15:00Z",
    updated_at: "2026-07-13T12:00:00Z"
  },
  {
    entity_id: "e-004",
    world_id: "w-001",
    type: "character",
    name: "魔道邪尊",
    description: "魔道联盟盟主，修炼禁术「噬魂大法」，实力深不可测。在魔道覆灭后下落不明。",
    status: "active",
    born_story_time: "太初历二百年",
    born_sort_key: 200,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      character_state: "missing",
      cultivation_level: "合体期",
      sect: "魔道联盟",
      age: 500,
      spiritual_root: "魔灵根"
    },
    created_at: "2026-07-01T10:20:00Z",
    updated_at: "2026-07-15T07:00:00Z"
  },
  {
    entity_id: "e-005",
    world_id: "w-001",
    type: "character",
    name: "楚云飞",
    description: "青云宗外门弟子，林清玄的同门师兄，性格豪爽重义气，擅长符箓之道。",
    status: "active",
    born_story_time: "太初历三百三十八年夏",
    born_sort_key: 750,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      character_state: "active",
      cultivation_level: "筑基中期",
      sect: "青云宗",
      age: 29,
      spiritual_root: "火灵根"
    },
    created_at: "2026-07-02T09:00:00Z",
    updated_at: "2026-07-14T10:00:00Z"
  },
  // === Items ===
  {
    entity_id: "e-006",
    world_id: "w-001",
    type: "item",
    name: "天玄剑",
    description: "上古仙器，剑身刻有玄天纹路，与林清玄灵脉共鸣后认主。斩妖除魔，锋芒无双。",
    status: "active",
    born_story_time: "上古时期",
    born_sort_key: 10,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      item_state: "active",
      grade: "仙器",
      owner: "林清玄",
      abilities: ["剑气斩", "万剑归宗", "天玄护体"]
    },
    created_at: "2026-07-01T11:00:00Z",
    updated_at: "2026-07-14T09:00:00Z"
  },
  {
    entity_id: "e-007",
    world_id: "w-001",
    type: "item",
    name: "太虚镜",
    description: "青云宗镇宗至宝，可照见方圆万里之内一切虚实，亦可窥探天机推演未来。",
    status: "active",
    born_story_time: "远古时期",
    born_sort_key: 5,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      item_state: "active",
      grade: "仙器",
      owner: "青云宗",
      abilities: ["天机推演", "万里照影", "破妄真视"]
    },
    created_at: "2026-07-01T11:05:00Z",
    updated_at: "2026-07-12T15:00:00Z"
  },
  {
    entity_id: "e-008",
    world_id: "w-001",
    type: "item",
    name: "噬魂珠",
    description: "魔道至宝，可吸取他人灵魂增强自身修为。魔道联盟覆灭后下落不明。",
    status: "active",
    born_story_time: "太初历一百年",
    born_sort_key: 50,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      item_state: "missing",
      grade: "魔器",
      owner: "魔道邪尊",
      abilities: ["噬魂", "灵魂傀儡", "魂力爆发"]
    },
    created_at: "2026-07-02T10:00:00Z",
    updated_at: "2026-07-15T06:00:00Z"
  },
  // === Factions ===
  {
    entity_id: "e-009",
    world_id: "w-001",
    type: "faction",
    name: "青云宗",
    description: "正道六大宗门之首，坐拥青云山脉万里灵脉，门下弟子过万，以剑修和符修闻名天下。",
    status: "active",
    born_story_time: "太初历元年",
    born_sort_key: 1,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      faction_state: "active",
      alignment: "正道",
      member_count: 12000,
      territory: "青云山脉",
      leader: "青云掌门"
    },
    created_at: "2026-07-01T10:30:00Z",
    updated_at: "2026-07-15T08:00:00Z"
  },
  {
    entity_id: "e-010",
    world_id: "w-001",
    type: "faction",
    name: "魔道联盟",
    description: "由魔道邪尊统领的魔修势力联合体，曾一度与正道分庭抗礼。在大战后土崩瓦解。",
    status: "active",
    born_story_time: "太初历二百零五年",
    born_sort_key: 210,
    died_story_time: "太初历三百六十八年",
    died_sort_key: 8000,
    custom_attributes: {
      faction_state: "dissolved",
      alignment: "魔道",
      member_count: 0,
      territory: "幽冥谷（已废弃）",
      leader: "魔道邪尊（失踪）"
    },
    created_at: "2026-07-01T10:35:00Z",
    updated_at: "2026-07-15T07:30:00Z"
  },
  {
    entity_id: "e-011",
    world_id: "w-001",
    type: "faction",
    name: "天机阁",
    description: "中立势力，专注于天文历法与占卜推演。不参与正魔之争，但暗中影响着天下大势。",
    status: "active",
    born_story_time: "太初历五十年",
    born_sort_key: 30,
    died_story_time: null,
    died_sort_key: null,
    custom_attributes: {
      faction_state: "active",
      alignment: "中立",
      member_count: 3000,
      territory: "天机峰",
      leader: "天机老人"
    },
    created_at: "2026-07-01T10:40:00Z",
    updated_at: "2026-07-13T14:00:00Z"
  }
]
