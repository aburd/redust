use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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