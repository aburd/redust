import React, { useState, useRef, useEffect } from "react"
import { ActionType } from "redust"

export default function Todo({ id, description, done, dispatch }) {
  const inputEl = useRef(null);
  const [editable, updateEditable] = useState(false)
  useEffect(() => {
    if (inputEl && inputEl.current) {
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