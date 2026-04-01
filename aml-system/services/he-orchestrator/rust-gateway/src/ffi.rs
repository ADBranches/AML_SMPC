use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_double};

unsafe extern "C" {
    fn seal_encrypt_amount(amount: c_double) -> *const c_char;
    fn seal_sum_ciphertexts(lhs_hex: *const c_char, rhs_hex: *const c_char) -> *const c_char;
    fn seal_decrypt_amount(cipher_hex: *const c_char) -> c_double;
    fn seal_last_error_message() -> *const c_char;
    fn seal_free_string(ptr: *const c_char);
}

fn take_last_error(default: &str) -> String {
    unsafe {
        let ptr = seal_last_error_message();
        if ptr.is_null() {
            return default.to_string();
        }

        let msg = CStr::from_ptr(ptr).to_string_lossy().to_string();
        seal_free_string(ptr);

        if msg.trim().is_empty() {
            default.to_string()
        } else {
            msg
        }
    }
}

pub fn encrypt_amount(amount: f64) -> Result<String, String> {
    unsafe {
        let ptr = seal_encrypt_amount(amount);
        if ptr.is_null() {
            return Err(take_last_error("seal_encrypt_amount failed"));
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
            return Err(take_last_error("seal_sum_ciphertexts failed"));
        }

        let s = CStr::from_ptr(ptr).to_string_lossy().to_string();
        seal_free_string(ptr);
        Ok(s)
    }
}

pub fn decrypt_amount(cipher_hex: &str) -> Result<f64, String> {
    let cipher = CString::new(cipher_hex).map_err(|e| e.to_string())?;

    unsafe {
        let value = seal_decrypt_amount(cipher.as_ptr());
        if value.is_nan() {
            return Err(take_last_error("seal_decrypt_amount failed"));
        }
        Ok(value)
    }
}