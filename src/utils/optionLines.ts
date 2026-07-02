import type { PlaySet, ActionItem } from '../models/types'

// Helpers for "options" — branching reads off a play's primary line.
//
// The primary line is PlaySet.actions ("Option 1"). Each PlayOption diverges
// after `branchAfter` primary actions and carries only its own continuation.
// The composed line an option actually plays = the shared primary prefix
// followed by the option's own actions.

// The composed action line for a given option. `null` = the primary line.
export function composeOptionLine(set: PlaySet, optionId: string | null): ActionItem[] {
  if (!optionId) return set.actions
  const opt = set.options?.find((o) => o.id === optionId)
  if (!opt) return set.actions
  return [...set.actions.slice(0, opt.branchAfter), ...opt.actions]
}

// How many primary actions precede the active line's own (editable) actions:
// 0 for the primary line, `branchAfter` for an option. Used to translate between
// a composed step index and the option's own tail.
export function branchOffset(set: PlaySet, optionId: string | null): number {
  if (!optionId) return 0
  return set.options?.find((o) => o.id === optionId)?.branchAfter ?? 0
}

// Display label for the primary line ("Option 1" unless renamed).
export function primaryLabel(set: PlaySet): string {
  return set.primaryName?.trim() || 'Option 1'
}

// Whether a play has any branching options at all.
export function hasOptions(set: PlaySet): boolean {
  return (set.options?.length ?? 0) > 0
}
