#[macro_use]
extern crate serde_derive;
extern crate js_sys;
mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[derive(Serialize)]
pub struct Todo {
    pub id: u32,
    pub description: String,
    pub done: bool,
}

impl Todo {
    fn new(id: u32, description: String, done: bool) -> Todo {
        Todo { id, description, done }
    }
}

#[derive(Serialize)]
pub struct UpdateTodoDoneAction {
    id: u32,
    done: bool,
}

#[derive(Serialize)]
pub struct UpdateTodoDescriptionAction {
    id: u32,
    description: String,
}

#[derive(Serialize)]
pub struct State {
    pub todos: Vec<Todo>,
}

impl State {
    fn new() -> State {
        let mut todos = Vec::new();
        let todo1 = Todo::new(1, String::from("Watch the New York Simpsons episode"), false);
        let todo2 = Todo::new(2, String::from("Code something"), false);
        let todo3 = Todo::new(3, String::from("Eat some tonkatsu"), false);
        todos.push(todo1);
        todos.push(todo2);
        todos.push(todo3);
        State { todos }
    }
}

struct Store<'a> {
    listeners: Vec<&'a js_sys::Function>,
    prev_states: Vec<State>
}

impl<'a> Store<'a> {
    pub fn subscribe(&'a mut self, f: &'a js_sys::Function) {
        self.listeners.push(f);
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn get_state() -> JsValue {
    let state = State::new();
    JsValue::from_serde(&state).unwrap()
}
