import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Store } from "redust"
import App from "./components/App"

const store = Store.new()

class ConnectedApp extends Component {
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

ReactDOM.render(
    <ConnectedApp />,
    document.getElementById('app')
)