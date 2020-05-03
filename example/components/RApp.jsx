import React, { Component } from "react"
import { Actions } from '../reducer'
import Todo from './Todo'

export default class App extends Component {
  handleToggle = (id, done) => {
    const { dispatch } = this.props;
    dispatch({ type: Actions.UPDATE_TODO_DONE, id, done })
  }
  handleDescription = (id, description) => {
    const { dispatch } = this.props;
    dispatch({ type: Actions.UPDATE_TODO_DESCRIPTION, id, description })
  }
  handleAdd = () => {
    const { dispatch, todos } = this.props;
    dispatch({
      type: Actions.ADD_TODO,
      todo: {
        id: todos.length + 1,
        description: "New Todo",
      }
    })
  }
  test = () => {
    const { dispatch, todos } = this.props;
    const [todo] = todos;
    let done = true
    console.time('redux')
    for (let i = 0; i < 100000; i++) {
      dispatch({
        type: Actions.UPDATE_TODO_DESCRIPTION,
        id: todo.id,
        done,
      })
      done = !done
    }
    console.timeEnd('redux')
  }
  render() {
    return (
      <div className="container">
        <ul className="todos">
          <li>
            <h2>Todos</h2>
          </li>
          {this.props.todos.map(todo => (
            <Todo
              key={todo.id}
              onToggleDone={this.handleToggle}
              onChangeDescription={this.handleDescription}
              {...todo}
            />
          ))}
        </ul>
        <button onClick={this.handleAdd}>Add Todo</button>
        <button onClick={this.test}>Test Redust</button>
      </div>
    )
  }
}
