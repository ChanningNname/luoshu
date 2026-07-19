import { worldHandlers } from './worlds'
import { entityHandlers } from './entities'
import { relationHandlers } from './relations'
import { timelineHandlers } from './timeline'
import { memoryHandlers } from './memories'
import { ruleHandlers } from './rules'
import { novelHandlers } from './novel'

export const handlers = [
  ...worldHandlers,
  ...entityHandlers,
  ...relationHandlers,
  ...timelineHandlers,
  ...memoryHandlers,
  ...ruleHandlers,
  ...novelHandlers,
]
