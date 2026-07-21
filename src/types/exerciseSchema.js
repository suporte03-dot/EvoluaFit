/**
 * Proposta de tipagem / schema para exercícios (catálogo local + Supabase opcional).
 *
 * A geração atual NÃO depende do banco: `inferMovementRole()` deriva movement_type
 * do nome/músculos/tags no cliente. Colunas abaixo são opcionais para enriquecer
 * o catálogo e evitar inferência frágil.
 *
 * Migração sugerida (Supabase / Postgres) — só se quiser persistir metadados:
 *
 * ```sql
 * alter table exercises
 *   add column if not exists target_muscle text,
 *   add column if not exists movement_type text,
 *   add column if not exists difficulty_level text;
 *
 * comment on column exercises.target_muscle is 'Grupo alvo canônico: Peitoral, Ombros, Tríceps, ...';
 * comment on column exercises.movement_type is 'Papel/ângulo: chest_upper, chest_flat, shoulder_lateral, tri_long, ...';
 * comment on column exercises.difficulty_level is 'Iniciante | Intermediário | Avançado';
 * ```
 *
 * Valores sugeridos de movement_type (Push):
 * - Peitoral: chest_upper | chest_flat | chest_lower | chest_isolation
 * - Ombros: shoulder_press | shoulder_lateral | shoulder_rear | shoulder_front | shoulder_other
 * - Tríceps: tri_long | tri_pushdown | tri_other
 */

/**
 * @typedef {'Peitoral'|'Ombros'|'Tríceps'|'Costas'|'Bíceps'|'Pernas'|'Glúteos'|'Panturrilha'|'Trapézio'|'Lombar'|'Abdômen'|'Cardio'|'Mobilidade'|'Alongamento'|'Funcional'|'Antebraço'} TargetMuscle
 */

/**
 * @typedef {'chest_upper'|'chest_flat'|'chest_lower'|'chest_isolation'|'shoulder_press'|'shoulder_lateral'|'shoulder_rear'|'shoulder_front'|'shoulder_other'|'tri_long'|'tri_pushdown'|'tri_other'|'general'} MovementType
 */

/**
 * @typedef {'Iniciante'|'Intermediário'|'Avançado'} DifficultyLevel
 */

/**
 * @typedef {Object} CatalogExerciseMeta
 * @property {string} id
 * @property {string} name
 * @property {TargetMuscle} [target_muscle] - preferencial sobre category
 * @property {TargetMuscle|string} [category]
 * @property {MovementType} [movement_type]
 * @property {DifficultyLevel} [difficulty_level]
 * @property {DifficultyLevel} [level] - alias legado no catálogo local
 * @property {string[]} [muscles]
 * @property {string[]} [tags]
 * @property {string} [equipment]
 */

export {}
