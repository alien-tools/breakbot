enum State {
    test=1,
    poll,
    push
}

const default_state = process.env.STATE
var current_state = default_state
exports.current_state = current_state

export { State, default_state }