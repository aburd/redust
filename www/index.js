import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Store, ActionType } from "redust"

const store = Store.new()

function dispatch(actionType, action) {
    store.dispatch(actionType, action)
    updateView(store.get_state())
}

function updateView(state) {
    console.log(state.todos.map(t => `${t.description}, Done: ${t.done}`).join('\n'))
}
dispatch(ActionType.UpdateTodoDescription, {id: 1, description: "A new description!"})

dispatch(ActionType.UpdateTodoDescription, {id: 1, description: "Again!"})

const Todo = ({ id, description, done }) => {
    function toggleDone() {
        dispatch(ActionType.UpdateTodoDone, { id, done: !done })
    }
    return (
        <li>
            <div className="desc">{description}</div>
            <div className="done">
                <input type="checkbox" value={done} onClick={toggleDone} />
            </div>
        </li>
    )
}

class App extends Component {
    state = store.get_state()

    render() {

    }
}