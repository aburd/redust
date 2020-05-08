- (blog-post)[#title]
- (installation)[#About]

# Title
Writing a simple implementation of Redux in Web Assembly


## Introduction

Hi, I'm Aaron, a frontend engineer at Zeals. At Zeals, we use React for the frontend of our main application, with Redux as our primary method of managing state. While this works just fine for most of what we need our frontend to do, I like to explore other options and how they compare to established solutions. So today, I thought it would be interesting trying to try to port Redux to web-assembly, and see how this compares to its Javascript counterpart. And when I say "compare", I mean this in the loosest sense. I'm not familiar on all the latest web-assembly news and technology, so this is simply an opportunity to explore it and share what it was like.

This article somewhat assumes the reader is somewhat familiar with React. I will try not to spend too much time on it as it could be an entire article on its own, but not knowing react should not be a hurdle to understanding the larger implications. I will spend some time talking about Redux/Rust/Wasm, as it will guide the reader into understanding how I tried to use Wasm, and perhaps why the trade-offs work the way they do.


### Web-assembly

A bit naively, I am choosing web-assembly for this experiment on the theory that **a web-assembly implementation might be faster**. According to [https://webassembly.org/](https://webassembly.org/):

> WebAssembly (abbreviated **Wasm**) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications. 
> ...
> The Wasm stack machine is designed to be encoded in a size- and load-time-efficient binary format. WebAssembly aims to execute at native speed by taking advantage of common hardware capabilities available on a wide range of platforms

And this line inside the Rust/Wasm book intrigued me:

> As a general rule of thumb, a good JavaScript↔WebAssembly interface design is often one where large, long-lived data structures are implemented as Rust types that live in the WebAssembly linear memory, and are exposed to JavaScript as opaque handles.
- https://rustwasm.github.io/book/game-of-life/implementing.html

It should be noted, my understanding of the above is quite elementary, and my implementation will probably not be the best. I will try my best to explain why my implementation did or didn't meet my expectations, but I may not do the best job. **My goal is to try and understand the larger trade-offs in general**, not necessarily the finer points of implementing "Redux" as a library itself. Redux is a quite simple library, and being able to make even a crude implementation of it should give us some idea of why or why not Rust/wasm is a good fit for someone's next project.


### Rust/Wasm

I won't be writing this purely in the web-assembly instructions, but rather I will be using Rust as the language to compile to Wasm. While other more familiar languages (Go, C++, etc.) do compile to wasm, the reason for choosing Rust is two:

1. I am more familiar with Rust than the other languages that compile to Wasm
2. Rust has the most mature tooling and documentation for wasm

Notice, that I have not said that Rust is the "best" language for this particular job. This is probably the best point that can be made about doing a project in Wasm today: doing anything requires a fair bit of research about what tooling is available and it's particular trade-offs. You may choose a certain language for certain feature and find that how it interfaces with Javascript may not suit your needs. You may find that Go has a great wasm CLI tool, but writing in Rust may result in a faster binary. It is truly a new portion of the web and not all the possibilities have been explored. Proceed at your own risk.

As for rust/wasm, a more in-depth overview of Rust interfacing with Wasm can be found in the community's [book](https://rustwasm.github.io/book/) on this subject.


### Goal

My overall goal is to try and port Redux to being a Wasm library, and then explore the results. I have one simple question, "how difficult is using wasm today?" 

### On Redux

Before going into the actual experiment, I'd like to give some description of Redux's architecture, so that our implementation of Redux stays somewhat close to the original. That being said, in the interest of time and to keep this discussion simple, we won't be porting the entire library's API.

The Redux Architecture:
![redux_architecture](https://user-images.githubusercontent.com/6701630/77313525-62728780-6d47-11ea-9076-d6dc10ff8bd0.png)

On what redux is:
"[Redux] is a predictable state container for JavaScript apps... [The state container] is like a “model” except that there are no setters. This is so that different parts of the code can’t change the state arbitrarily, causing hard-to-reproduce bugs."

On what the stores and reducers are:
> The whole state of your app is stored in an object tree inside a single store. The only way to change the state tree is to emit an action, an object describing what happened. To specify how the actions transform the state tree, you write pure reducers.

The overall thing to take away from this description is that we will be creating a "state container" called a "**Store**". This **store** will take "**actions**", which are a bit like requests to update the state. In order to take these actions, the Store offers an API called "**dispatch**", which is to say we don't send actions, we **dispatch** them. The store will feed these actions to a "**reducer**" which will make a new copy of the state. Lastly, any code that is "**subscribed**" to the store will be notified when there is a new version of the state, to ensure that view can update it's own representation when necessary (this is how React keeps is state up to date with Redux".

Our code should:

1. Define some state tree
2. Allow us to update that state tree by making a new copy of it (we will never directly overwrite memory)
3. Be notified when there is a new copy of the state tree, so we can update our frontend


## The code

### Introduction

All the code discussed here can be found at github where my wasm implementation of Redux lives: https://github.com/aburd/redust.

Before we start, we need to ensure that we have these tools:

1. `rustup`, `rustc`, and `cargo`: [installation instructions](https://www.rust-lang.org/tools/install)
2. `wasm-pack`, [installation instructions](https://rustwasm.github.io/wasm-pack/installer/)
3. `cargo generate`, which can be installed with this command 
```
$ cargo install cargo-generate
```
4. It is also assumed that you have the latest version of `npm`

Below are all the steps I took when creating `redust`.
(By the way, I found [this tutorial](https://rustwasm.github.io/book/game-of-life/introduction.html) to be very helpful.)


### Generating the Rust/Wasm Library

The first thing I did is create a Rust/Wasm project that can be imported as a JS module inside are React Application code.

1. With **cargo generator**, generate a new rust/wasm library

```
$ cargo generate --git https://github.com/rustwasm/wasm-pack-template
```

I was prompted to name the project, which I called "redust".

2. `$ cd redust`

3. The new project is designed to be exported as a JS library by using the `wasm-pack` command. To compile our Rust code into a js package, we use `$ wasm-pack build`


### The React-JS project

Next well need a React-JS project to use our new wasm library with. 

1. First, we generate a new example project with: 

```
$ npm init wasm-app example
```

2. Next we add our new wasm library to the JS project by going to the `package.json` file and adding:

```json
{
  // ...
  "dependencies": {
    // This line refers to the pkg directory generated in the `wasm-pack build` step
    "redust": "file:../pkg",
    // ...
  }
}
```

After adding this dependency, we'll be able to import our rust/wasm code as a package called "redust".

3. Then I added the react/babel dependencies to the project

```
npm i react react-dom
npm i --dev @babel/core @babel/preset-env @babel/preset-react babel-loader
```

4. Next I added a .babelrc file for react

```
$ touch .babelrc
```

`.babelrc`
```
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

5. Then I updated the webpack.config.js file to compile react

```
...
module.exports = {
  ...
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  ...
};
```

### Using the library in the new JS Project

Now I have a react enabled project, so I wrote the minimal amount of code to test that our new wasm library can be used in our react project.

1. We'll need to add a DOM element for our react app to render into. (`bootstrap.js` is our webpack output file)
`redust/example/index.html`
```html
...
<body>
    <noscript>This page contains webassembly and javascript content, please enable javascript in your browser.</noscript>
    <script src="./bootstrap.js"></script>

    <div id="app"></div>
</body>
...
```

2. Next we'll need to make a base react app

`redust/example/index.js`
```jsx
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as redust from 'redust'

class App extends Component {
  render() {
    return (
      <button onClick={() => redust.greet()}>Click me!</button>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
```

You may be surprised to see that the "redust" already has a method called `greet`. That's because our library template compiled with wasm-pack comes with the `greet` export in it by default. We'll erase it later.

`redust/src/lib.rs`
```rust
...

// This code just exposes the browser's alert function from JS to Rust
#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

// Notice this is marked as `pub`. Non-pub functions will not be available from our
// exported library
#[wasm_bindgen]
pub fn greet() {
    alert("Hello, redust!");
}
```

After using testing my `./example` folder by running the webpack dev server:
```
$ npm start
```

I checked my browser to make sure everything was running ok.

<img width="840" alt="スクリーンショット 2020-03-23 22 32 47" src="https://user-images.githubusercontent.com/6701630/77321918-40cccc80-6d56-11ea-8341-ac2a36d303f3.png">


### Creating the Redux Store

I started by trying to make a `Store` struct that would keep track of our state, and offer an interface to update that state. Rust is a strongly-typed language, and I was excited at the prospect of having type-checking out of the box for this project. My first thought at an implementation would be something like this:

```rust
#[wasm_bindgen]
pub struct Store<'a, State> {
    listeners: Vec<&'a js_sys::Function>,
    prev_states: Vec<State>,
    state: State,
}
```

The users of "redust" would be able to pass in their own `State` type, I would simply use rust generics. `state` would be the current state, and `prev_states` would be a vector of previous versions of the application state that users could use to implement "undo" features. `listeners` would be a collection of JS functions that would be called when the current state had been updated.

Unfortunately, using **wasm_bindgen,** I ran into a problem:

<img width="626" alt="スクリーンショット 2020-05-03 15 54 27" src="https://user-images.githubusercontent.com/6701630/80907963-6cc86e00-8d56-11ea-923a-099a8c994387.png">

```
error: structs with #[wasm_bindgen] cannot have lifetime or type parameters currently
```

:(

This means, that users of my library couldn't pass their own data-structures to my "Store". The Store structure would have to be specifically tailored to work with one kind of data-structure that it in the library. In addition, lifetime parameters aren't acceptable either, which means users couldn't pass their own listener functions to the wasm side. Oh well, updated it looked like this:

```rust
#[wasm_bindgen]
pub struct Store {
    // listeners: Vec<&'a js_sys::Function>,
    prev_states: Vec<State>,
    state: State,
}
```

I suppose, this isn't much of a library anymore, but from here I at least tried to code this thing to the end to measure performance.

### The Redux "Store" methods

Here is the important parts of the implementation:

Firstly, these "todos" and "actions" modules are the parts of Rust code that should be written by consumers of the Redust library. They are code dealing with how to update the state tree and what the state tree looks like.

```rust
#[macro_use]
extern crate serde_derive;
extern crate js_sys;
mod utils;
mod todos;
mod actions;

use wasm_bindgen::prelude::*;
use todos::Todo;
use actions::{ ActionType, UpdateTodoDoneAction, UpdateTodoDescriptionAction, AddTodoAction };

...

#[derive(Serialize, Clone)]
struct State {
    todos: Vec<Todo>,
}

impl State {
    fn new(todos: Vec<Todo>) -> State {
        State { todos }
    }
}
```

Usually, I would have the the user pass in an initial state tree when creating the store, but since the state struct lives alongside the Store struct now, I just initialize all of it when creating the store. A bit sad, but oh well...what follows is a mixture of the Redux implementation, and the actual app-code, which is a Todo App.

```
#[wasm_bindgen]
pub struct Store {
    // listeners: Vec<&'a js_sys::Function>,
    prev_states: Vec<State>,
    state: State,
}

#[wasm_bindgen]
impl Store {
    pub fn new() -> Store {
        utils::set_panic_hook();
        let mut todos = Vec::new();

        Store {
            // listeners: Vec::new(),
            prev_states: Vec::new(),
            state: State::new(todos),
        }
    }
}
```

Next, for the actual Redux implementation, we need somewhere to retrieve the state on the JS side, subcribe to state changes, and dispatch actions to update the state tree. 

The Rust "Serde" lib will allow us to send JS and rust serializable data structures (https://rustwasm.github.io/wasm-bindgen/reference/arbitrary-data-with-serde.html) and we use this to send our State structure that lives inside wasm to the JS side with the `get_state` method.

As for our `subscribe` method, unfortunately wasm_bindgen does support lifetimes, so references to JS functions can't live in our Store on the rust/wasm side. This is shelved for now.

Our `dispatch` method is where we can send information about how we want to update our state from the JS side to the wasm side. `dispatch`'s job is usually to send this information along to our redux "reducer", but since our State structure lives inside our store implementation, I've skipped that step and just decided that `dispatch` can update our state data directly from `dispatch`. I know, not clean, please don't write me any angry comments. I was just trying to get this done to compare performance at this point.

```rust
#[wasm_bindgen]
impl Store {
    pub fn get_state(&self) -> JsValue {
        JsValue::from_serde(&self.state).unwrap()
    }

    // pub fn subscribe(&mut self, f: &js_sys::Function) {
    //     self.listeners.push(f);
    // }

    pub fn dispatch(&mut self, action_type: ActionType, action: &JsValue) {
        // Get the new state
        let new_state: State = match action_type {
            ActionType::UpdateTodoDescription => self.update_description(action),
            ActionType::UpdateTodoDone => self.update_done(action),
            ActionType::AddTodo => self.add_todo(action),
        };

        // Update the states in the store itself
        self.prev_states.push(self.state.clone());
        self.state = new_state;

        // TODO: wasm-bindgen currently does not allow the wasm_bindgen trait for generic structs
        //       reimplement this when it does
        // Inform any subscribers
        // for listener in &self.listeners {
        //     let this = JsValue::NULL;
        //     log("Calling listener");
        //     match listener.call0(&this) {
        //         Ok(_) => log("Ok"),
        //         Err(e) => log("Err"),
        //     }
        // }
    }

    fn update_description(&self, action: &JsValue) -> State {
        let action: UpdateTodoDescriptionAction = action.into_serde().unwrap();
        let todos: Vec<Todo> = self.state.todos.iter()
            .map(|todo| {
                if todo.id == action.id { 
                    Todo::new(todo.id, action.description.clone(), todo.done)
                } else { 
                    todo.clone()
                }
            })
            .collect();
        State::new(todos)
    }
    
    ...
}
```

I found the "reducer" logic quite refreshing to write in Rust. Using a rust `enum`s along with a `match` statement to keep track of action processing was great to keep track of what actions I needed to implement in the reducer.

```rust
// actions.rs
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ActionType {
    UpdateTodoDone,
    UpdateTodoDescription,
    AddTodo,
}

#[derive(Deserialize)]
pub struct UpdateTodoDoneAction {
    pub id: u32,
    pub done: bool,
}

...
```

### Using the redust "library" in our JS code

Make a Todo app is pretty straight-forward, but since my "store" doesn't have the ability to let my app "subscribe" to it, I added a wrapper method which would both call `dispatch` from my wasm "store" and update the App state on the JS/react side:

```jsx
// index.js
import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Store } from "redust"
...

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

    ...
}
```

From the Rust/Wasm side, I was able to import data-structures in my JS code when dispatching actions to keep things straight, which was nice:

```jsx
// App.jsx
import React, { Component } from "react"
import { ActionType } from 'redust'
import Todo from './Todo'

export default class App extends Component {
  handleToggle = (id, done) => {
    const { dispatch } = this.props;
    dispatch(ActionType.UPDATE_TODO_DONE, { id, done })
  }
  ...
```

Since wasm-pack will automatically generate .d.ts type-def files, I got nice code-suggestions as well:

<img width="877" alt="スクリーンショット 2020-05-03 16 26 40" src="https://user-images.githubusercontent.com/6701630/80908457-f2e6b380-8d5a-11ea-98f1-3079d3a76070.png">

## Result

Here's what the app looked like in the end:

<img width="1045" alt="スクリーンショット 2020-05-03 15 32 49" src="https://user-images.githubusercontent.com/6701630/80907603-64226880-8d53-11ea-81cd-ad2fb301c8fd.png">

You'll notice there is a "redust" side and a "redux" side. I ended up making the regular redux version for comparison.


### Speed test

Since wasm claims to be fast, I compared my version to the regular redux library by writing some test code which would measure the time taken to dispatch 100,000 actions:

```jsx
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
```

Although not redux's selling-point, it would be interesting to have a redux that would keep state rock-solidly reliable **and** fast. The results, were underwhelming:

<img width="236" alt="スクリーンショット 2020-05-03 16 31 55" src="https://user-images.githubusercontent.com/6701630/80908546-a9e32f00-8d5b-11ea-8ae5-dacdac832b1b.png">

### Why?

There's a (a decent blog post)[https://dev.to/sendilkumarn/rust-and-webassembly-for-the-masses-memory-model-1jhd?signin=true] about the topic, but in short the JS memory and the Wasm memory live in separate places and there are significant costs associated with crossing that boundary.

In short, my code is sending JS data structures (actions) over to the Wasm side (store), which then have to be parsed, processed, and the state had to be updated. I was crossing the boundary between JS and Wasm **every time** I sent an action, which is **much slower** than if I just processed the data purely on the JS-side or visa-versa.

Although, libraries like wasm_bindgen provide us ways of deserializing Rust data structures into JS objects, it doesn't not mean it's particularly fast or a good idea. Your application architecture should take all this into account. Wasm is "fast", but certainly not in the way that I architected my application.

For more information about JS/Wasm Interoperation, you can check the links below:

- https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API
- https://rustwasm.github.io/docs/book/print.html#going-beyond-numerics

## Conclusion

I will say firstly that I have **much** to learn. In retrospect, I should have read much more about the wasm memory model and JS/wasm interoperation before even deciding to try this project, I think it was doomed from the start :) That being said, it was a great learning experience in finding out where we are at with wasm and where I might apply it. 

The bar for justifying including a wasm module in your project is quite high. You have to know exactly what data-structures you're working with and exactly how those might play with the JS part of your application. How much are you planning on crossing the JS/wasm boundary for your application? Is it just to bootstrap the app (best-case scenario) or is it a small module that gets called a lot (worst-case scenario)?

I would say that, at this point, that wasm is most likely not suited for small libraries that are used in JS. And in fact, not really suited to prototyping anything. If you are making something and concerned about speed, it's probably best to reconsider your application architecture, rather than reaching for wasm as a tool to speed up your application.

If you're going to use wasm, it's a tough road with a high mental cost. It is certainly not anywhere close to building your everyday web-app.

---

<div align="center">

  <h1><code>wasm-pack-template</code></h1>

  <strong>A template for kick starting a Rust and WebAssembly project using <a href="https://github.com/rustwasm/wasm-pack">wasm-pack</a>.</strong>

  <p>
    <a href="https://travis-ci.org/rustwasm/wasm-pack-template"><img src="https://img.shields.io/travis/rustwasm/wasm-pack-template.svg?style=flat-square" alt="Build Status" /></a>
  </p>

  <h3>
    <a href="https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/index.html">Tutorial</a>
    <span> | </span>
    <a href="https://discordapp.com/channels/442252698964721669/443151097398296587">Chat</a>
  </h3>

  <sub>Built with 🦀🕸 by <a href="https://rustwasm.github.io/">The Rust and WebAssembly Working Group</a></sub>
</div>

## About

[**📚 Read this template tutorial! 📚**][template-docs]

This template is designed for compiling Rust libraries into WebAssembly and
publishing the resulting package to NPM.

Be sure to check out [other `wasm-pack` tutorials online][tutorials] for other
templates and usages of `wasm-pack`.

[tutorials]: https://rustwasm.github.io/docs/wasm-pack/tutorials/index.html
[template-docs]: https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/index.html

## 🚴 Usage

### 🐑 Use `cargo generate` to Clone this Template

[Learn more about `cargo generate` here.](https://github.com/ashleygwilliams/cargo-generate)

```
cargo generate --git https://github.com/rustwasm/wasm-pack-template.git --name my-project
cd my-project
```

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```

### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```

## 🔋 Batteries Included

* [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.
* [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.
* [`wee_alloc`](https://github.com/rustwasm/wee_alloc), an allocator optimized
  for small code size.
