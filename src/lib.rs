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

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize, Clone)]
struct State {
    todos: Vec<Todo>,
}

impl State {
    fn new(todos: Vec<Todo>) -> State {
        State { todos }
    }
}

#[wasm_bindgen]
pub struct Store {
    // listeners: Vec<&js_sys::Function>,
    prev_states: Vec<State>,
    state: State,
}

#[wasm_bindgen]
impl Store {
    pub fn new() -> Store {
        utils::set_panic_hook();

        let mut todos = Vec::new();
        let todo1 = Todo::new(1, String::from("Watch the New York Simpsons episode"), false);
        let todo2 = Todo::new(2, String::from("Code something"), false);
        let todo3 = Todo::new(3, String::from("Eat some tonkatsu"), false);
        todos.push(todo1);
        todos.push(todo2);
        todos.push(todo3);

        Store {
            // listeners: Vec::new(),
            prev_states: Vec::new(),
            state: State::new(todos),
        }
    }
}

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
    
    fn update_done(&self, action: &JsValue) -> State {
        let action: UpdateTodoDoneAction = action.into_serde().unwrap();
        let todos: Vec<Todo> = self.state.todos.iter()
            .map(|todo| {
                if todo.id == action.id { 
                    Todo::new(todo.id, todo.description.clone(), action.done)
                } else { 
                    todo.clone()
                }
            })
            .collect();
        State::new(todos)
    }
}
