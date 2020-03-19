import React, { Component, useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import { Store, ActionType } from "redust"

const store = Store.new()

const Todo = ({ id, description, done, dispatch }) => {
    const inputEl = useRef(null);
    const [editable, updateEditable] = useState(false)
    useEffect(() => {
        if(inputEl && inputEl.current) {
            inputEl.current.focus()
        }
    }, [editable])
    function toggleDone() {
        dispatch(ActionType.UpdateTodoDone, { id, done: !done })
    }
    function handleDescriptionChange(e) {
        dispatch(ActionType.UpdateTodoDescription, { id, description: e.target.value })
    }
    function handleFocus() {
        updateEditable(!editable)
    }
    return (
        <li className="todo">
            <span className="done">
                <input type="checkbox" checked={done} onChange={toggleDone} />
            </span>
            <span className="desc" onClick={handleFocus}>
                {editable 
                    ? (
                        <input 
                            type="text" 
                            ref={inputEl} 
                            value={description} 
                            onChange={handleDescriptionChange}
                            onKeyPress={e => e.key === 'Enter' ? updateEditable(false) : ''}
                        />
                    )
                    : <div>{description}</div>
                }
            </span>
        </li>
    )
}

class App extends Component {
    constructor(props) {
        super(props)

        this.state = store.get_state()
        this.dispatch = this.dispatch.bind(this)
    }

    dispatch(actionType, action) {
        store.dispatch(actionType, action)
        this.setState({ ...store.get_state() })
    }

    render() {
        return (
            <div className="container">
                <ul className="todos">
                    <li><h2>Todos</h2></li>
                    {this.state.todos.map(todo => <Todo key={todo.id} dispatch={this.dispatch} {...todo} />)}
                </ul>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))