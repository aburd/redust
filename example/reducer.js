const initState = {
  todos: [{id: 1, description: 'Do stuff', done: false}]
}

export const Actions = {
  UPDATE_TODO_DONE: 'UPDATE_TODO_DONE',
  UPDATE_TODO_DESCRIPTION: 'UPDATE_TODO_DESCRIPTION',
  ADD_TODO: 'ADD_TODO',
}

export function reducer(state = initState, action) {
  switch (action.type) {
    case Actions.UPDATE_TODO_DONE:
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.id ? ({ ...t, done: action.done }) : t)
      }
    case Actions.UPDATE_TODO_DESCRIPTION:
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.id ? ({ ...t, description: action.description }) : t)
      }
    case Actions.ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.todo]
      }
    default:
      return state
  }
}

