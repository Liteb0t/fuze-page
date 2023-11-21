use wasm_bindgen::prelude::*;

// pulls a function from javascript
#[wasm_bindgen]
extern {
	pub fn alert(s: &str);
}

// pushes a function to be called in the webpage

#[wasm_bindgen]
pub fn show_code(code_name: &str) {
	alert(&format!("You have entered the code {}",  code_name));
}
