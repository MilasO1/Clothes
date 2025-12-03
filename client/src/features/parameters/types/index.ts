import type * as z from "zod"

import type { bomMappingSchema } from "../schemas"

export type BomMapping = z.infer<typeof bomMappingSchema>
