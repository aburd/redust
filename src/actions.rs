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
    pub id: u32,
    pub done: bool,
}

#[derive(Deserialize)]
pub struct UpdateTodoDescriptionAction {
    pub id: u32,
    pub description: String,
}