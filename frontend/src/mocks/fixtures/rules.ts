export const mockRules = [
  {
    rule_id: "rule-001",
    world_id: "w-001",
    title: "灵力修炼上限法则",
    category: "cultivation",
    content: "修士每个境界的灵力上限由灵根品质决定。天灵根可达境界上限的100%，地灵根为80%，人灵根为60%。突破境界需灵力达到当前境界上限的90%以上。",
    priority: 1,
    is_active: true,
    scope: "global",
    created_at: "2026-07-01T14:00:00Z",
    updated_at: "2026-07-12T10:00:00Z"
  },
  {
    rule_id: "rule-002",
    world_id: "w-001",
    title: "宗门等级制度",
    category: "social",
    content: "正道宗门分为六级：外门弟子→内门弟子→核心弟子→长老→太上长老→掌门。晋升需通过宗门大比或立下重大功勋。每级对应不同的资源分配权限和宗门禁地进入资格。",
    priority: 2,
    is_active: true,
    scope: "faction",
    created_at: "2026-07-01T14:05:00Z",
    updated_at: "2026-07-13T09:00:00Z"
  },
  {
    rule_id: "rule-003",
    world_id: "w-001",
    title: "禁术清单",
    category: "restriction",
    content: "以下术法被正道各宗共同列为禁术，修炼者将被正道联合追杀：噬魂大法（吸取他人灵魂）、血祭术（以活人祭炼法宝）、天地同归（同归于尽之术，仅在护宗时允许使用）、夺舍秘术（侵占他人肉身）。",
    priority: 1,
    is_active: true,
    scope: "global",
    created_at: "2026-07-01T14:10:00Z",
    updated_at: "2026-07-14T08:00:00Z"
  },
  {
    rule_id: "rule-004",
    world_id: "w-001",
    title: "灵脉分布与资源争夺",
    category: "world_building",
    content: "九州大地共有九条主灵脉，分别被九大宗门占据。灵脉交汇处会形成「灵眼」，为天材地宝生长之地。灵脉枯竭周期约万年一轮回，当前处于灵脉旺盛期。",
    priority: 3,
    is_active: true,
    scope: "global",
    created_at: "2026-07-02T09:00:00Z",
    updated_at: "2026-07-12T14:00:00Z"
  },
  {
    rule_id: "rule-005",
    world_id: "w-001",
    title: "天劫法则",
    category: "cultivation",
    content: "修士每突破大境界（筑基→金丹→元婴→化神→合体）需渡天劫。天劫威力与修士实力成正比，天灵根者天劫威力为普通修士的三倍。渡劫失败则形神俱灭。",
    priority: 1,
    is_active: true,
    scope: "global",
    created_at: "2026-07-02T09:05:00Z",
    updated_at: "2026-07-13T11:00:00Z"
  },
  {
    rule_id: "rule-006",
    world_id: "w-001",
    title: "因果律",
    category: "metaphysics",
    content: "此世界存在因果律：救人一命则结善因，杀人夺宝则结恶因。因果积累到一定程度会触发「因果劫」，善因助修炼，恶因引心魔。魔道修士多受心魔困扰即源于此。",
    priority: 2,
    is_active: true,
    scope: "global",
    created_at: "2026-07-02T09:10:00Z",
    updated_at: "2026-07-14T07:00:00Z"
  }
]
