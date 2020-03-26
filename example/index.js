import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Store } from "redust"
import { createStore } from 'redux'
import { reducer } from './reducer'
import App from "./components/App"
import RApp from "./components/RApp"

/*
  WASM REDUX
*/ 
const store = Store.new()

class RedustConnectedApp extends Component {
    constructor(props) {
      super(props)
      this.state = store.get_state()
    }

    dispatch = (actionType, action) => {
        store.dispatch(actionType, action)
        this.setState(store.get_state())
    }

    render() {
        const props = Object.assign({}, { dispatch: this.dispatch }, this.state)
        return React.cloneElement(<App />, props)
    }
}

/*
  REGULAR REDUX
*/
const regStore = createStore(reducer)

class ReduxConnectedApp extends Component {
  constructor(props) {
    super(props)
    this.state = regStore.getState()
  }

  componentDidMount() {
    regStore.subscribe(() => {
      this.setState(regStore.getState())
    })
  }

  render() {
      const props = Object.assign({}, { dispatch: regStore.dispatch }, this.state)
    return React.cloneElement(<RApp />, props)
  }
}

ReactDOM.render(
    (
    <div>
      <div>
        <h1>Redust</h1>
        <RedustConnectedApp />
      </div>  
      <div>
        <h1>Redux</h1>
        <ReduxConnectedApp />
      </div>  
    </div>
    ),
    document.getElementById('app')
)