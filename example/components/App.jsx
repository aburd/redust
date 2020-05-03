import React, { Component } from "react"
import { ActionType } from 'redust'
import Todo from './Todo'

export default class App extends Component {
  handleToggle = (id, done) => {
    const { dispatch } = this.props;
    dispatch(ActionType.UPDATE_TODO_DONE, { id, done })
  }
  handleDescription = (id, description) => {
    const { dispatch } = this.props;
    dispatch(ActionType.UpdateTodoDescription, { id, description })
  }
  handleAdd = () => {
    const { dispatch } = this.props;
    dispatch(ActionType.AddTodo, {})
  }
  test = () => {
    const { dispatch, todos } = this.props;
    const [todo] = todos;
    let done = true
    console.time('redust')
    for (let i = 0; i < 100000; i++) {
      dispatch(ActionType.UpdateTodoDone, {
        id: todo.id,
        done,
      })
      done = !done
    }
    console.timeEnd('redust')
  }
  render() {
    return (
      <div className="container">
        <button onClick={this.handleAdd}>Add Todo</button>
        <button onClick={this.test}>Test Redust</button>
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
      </div>
    )
  }
}
