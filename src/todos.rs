#[derive(Serialize, Clone)]
pub struct Todo {
    pub id: u32,
    pub description: String,
    pub done: bool,
}

impl Todo {
    pub fn new(id: u32, description: String, done: bool) -> Todo {
        Todo { id, description, done }
    }
}