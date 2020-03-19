use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(PartialEq, Debug)]
pub enum ActionType {
    UpdateTodoDone,
    UpdateTodoDescription,
}

#[derive(Deserialize)]
pub struct UpdateTodoDoneAction {
    id: u32,
    done: bool,
}

#[derive(Deserialize)]
pub struct UpdateTodoDescriptionAction {
    id: u32,
    description: String,
}