use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_double};

unsafe extern "C" {
    fn seal_encrypt_amount(amount: c_double) -> *const c_char;
    fn seal_sum_ciphertexts(lhs_hex: *const c_char, rhs_hex: *const c_char) -> *const c_char;
    fn seal_decrypt_amount(cipher_hex: *const c_char) -> c_double;
    fn seal_free_string(ptr: *const c_char);
}

pub fn encrypt_amount(amount: f64) -> Result<String, String> {
    unsafe {
        let ptr = seal_encrypt_amount(amount);
        if ptr.is_null() {
            return Err("seal_encrypt_amount returned null".into());
        }
        let s = CStr::from_ptr(ptr).to_string_lossy().to_string();
        seal_free_string(ptr);
        Ok(s)
    }
}

pub fn sum_ciphertexts(lhs_hex: &str, rhs_hex: &str) -> Result<String, String> {
    let lhs = CString::new(lhs_hex).map_err(|e| e.to_string())?;
    let rhs = CString::new(rhs_hex).map_err(|e| e.to_string())?;

    unsafe {
        let ptr = seal_sum_ciphertexts(lhs.as_ptr(), rhs.as_ptr());
        if ptr.is_null() {
            return Err("seal_sum_ciphertexts returned null".into());
        }
        let s = CStr::from_ptr(ptr).to_string_lossy().to_string();
        seal_free_string(ptr);
        Ok(s)
    }
}

pub fn decrypt_amount(cipher_hex: &str) -> Result<f64, String> {
    let cipher = CString::new(cipher_hex).map_err(|e| e.to_string())?;
    unsafe { Ok(seal_decrypt_amount(cipher.as_ptr())) }
}