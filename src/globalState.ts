enum State {
    test=1,
    poll,
    push
}

const defaultState = process.env.STATE
var currentState = defaultState
exports.currentState = currentState

export { State, defaultState }