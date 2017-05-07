module.exports = {
    default: {
        src: ["dist/stativus.min.js"],
        overwrite: true,
        replacements: [
            { from: 'DEFAULT_TREE', to: '_DT'},
            { from: 'SUBSTATE_DELIM', to: '_SSD'},
            { from: '_all_states', to: '_as'},
            { from: '_states_with_concurrent_substates', to: '_swcss'},
            { from: '_current_subtrees', to: '_cts'},
            { from: '_current_state',      to: '_cs'},
            { from: '_goToStateLocked',      to: '_gtsl'},
            { from: '_sendEventLocked',      to: '_sel'},
            { from: '_pendingStateTransitions',      to: '_pst'},
            { from: '_pendingEvents',      to: '_pe'},
            { from: '_active_subtrees',      to: '_ast'},
            { from: '_configs_in_waiting',      to: '_ciw'},
            { from: '_paused_transition_states',      to: '_pts'},
            { from: '_parentStatesWithRoot',      to: '_pswr'},
            { from: '_findCommonAncestor',      to: '_fca'},
            { from: '_unwindExitStateStack',      to: '_uess'},
            { from: '_initiateEnterStateSequence',      to: '_iess'},
            { from: '_flushPendingStateTransitions',      to: '_fpst'},
            { from: '_exitStateStack',      to: '_ess'},
            { from: '_cascadeEnterSubstates',      to: '_cess'}
        ]
    }
};
