import React, { useState, useRef, useEffect } from "react"

export default function Todo({
  id,
  description,
  done,
  onToggleDone,
  onChangeDescription,
}) {
  const inputEl = useRef(null);
  const [editable, updateEditable] = useState(false)
  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus()
    }
  }, [editable])
  function handleFocus() {
    updateEditable(!editable)
  }
  return (
    <li className="todo">
      <span className="done">
        <input type="checkbox" checked={done} onChange={() => onToggleDone(id, !done)} />
      </span>
      <span className="desc" onClick={handleFocus}>
        {editable
          ? (
            <input
              type="text"
              ref={inputEl}
              value={description}
              onChange={(e) => onChangeDescription(id, e.target.value)}
              onKeyPress={e => e.key === 'Enter' ? updateEditable(false) : ''}
            />
          )
          : <div>{description}</div>
        }
      </span>
    </li>
  )
}