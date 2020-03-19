#[macro_use]
extern crate serde_derive;
extern crate js_sys;
mod utils;
mod todos;
mod actions;

use wasm_bindgen::prelude::*;
use todos::Todo;
use actions::{ ActionType, UpdateTodoDoneAction, UpdateTodoDescriptionAction };

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[derive(Serialize, Clone)]
struct State {
    todos: Vec<Todo>,
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
    prev_states: Vec<State>,
    state: State,
}

impl<'a> Store<'a> {
    pub fn subscribe(&'a mut self, f: &'a js_sys::Function) {
        self.listeners.push(f);
    }

    pub fn dispatch(&mut self, action_type: ActionType, action: &JsValue) {
        // Get the new state
        let new_state: State = match action_type {
            ActionType::UpdateTodoDescription => self.update_description(action),
            ActionType::UpdateTodoDone => self.update_done(action),
        };

        // Update the states in the store itself
        self.prev_states.push(self.state.clone());
        self.state = new_state;

        // Inform any subscribers
        for listener in &self.listeners {
            let this = JsValue::NULL;
            listener.call0(&this);
        }
    }

    fn update_description(&self, action: &JsValue) -> State {
        let action: UpdateTodoDoneAction = action.into_serde().unwrap();
        self.state.clone()
    }
    
    fn update_done(&self, action: &JsValue) -> State {
        let action: UpdateTodoDescriptionAction = action.into_serde().unwrap();
        self.state.clone()
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
