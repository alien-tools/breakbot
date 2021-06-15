enum State {
    test,
    poll,
    push
}

const default_state = State.poll
var current_state = default_state
exports.current_state = current_state

export { State, default_state }