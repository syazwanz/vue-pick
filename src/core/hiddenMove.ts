/**
 * Stops the chip group's FLIP move for a chip that was `display: none` before
 * the update.
 *
 * The transition group records each child's old rect before it re-renders. A
 * hidden chip reports `0,0,0,0`, and Vue (2 and 3 alike) treats that as a real
 * position, so when the chip becomes visible it is translated from the
 * viewport's top-left corner and slides into the trigger. A chip with no old
 * position should simply appear where it is.
 *
 * `before` runs in the parent's `beforeUpdate`, ahead of the group recording
 * positions. `after` runs in the parent's `updated`, which both Vue versions
 * call after the group's own `updated` hook, so the move has already been set
 * up: translate applied, reflowed, move class added, translate cleared. Setting
 * `transition: none` and forcing a reflow commits the final transform without
 * animating; clearing the override afterwards changes nothing, so nothing
 * starts.
 *
 * Nothing is done before the group's pass on purpose. Both Vue versions decide
 * whether to run the pass at all by cloning the first child and reading its
 * transition, and a clone copies inline styles, so marking the chip early would
 * switch off every move in that update. The group's pending `transitionend`
 * callback and the move class are left for the group to clean up on its next
 * update, as it does for any move. Any inline `transition` the page put on the
 * chip is put back once the reflow has run.
 */
export function createHiddenMoveGuard(moveClass: string) {
  let hidden: HTMLElement[] = []

  return {
    before(chips: Iterable<HTMLElement>) {
      hidden = []
      for (const el of chips) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) hidden.push(el)
      }
    },
    after() {
      for (const el of hidden) {
        if (!el.isConnected || !el.classList.contains(moveClass)) continue
        const own = el.style.transition
        el.style.transition = "none"
        void el.offsetHeight
        el.style.transition = own
      }
      hidden = []
    },
  }
}
