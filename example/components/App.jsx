import React, { Component } from "react"
import { ActionType } from 'redust'
import Todo from './Todo'

export default class App extends Component {
  handleToggle = (id, done) => {
    const { dispatch } = this.props;
    dispatch(ActionType.UpdateTodoDone, { id, done })
  }
  handleDescription = (id, description) => {
    const { dispatch } = this.props;
    dispatch(ActionType.UpdateTodoDescription, { id, description })
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
      </div>
    )
  }
}
