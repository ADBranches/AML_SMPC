use sha2::{Digest, Sha256};

pub fn deterministic_pseudonymize(raw: &str, salt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt.as_bytes());
    hasher.update(b":");
    hasher.update(raw.as_bytes());
    let digest = hasher.finalize();
    let hexed = hex::encode(digest);
    format!("psd_{}", &hexed[..24])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_output_is_stable() {
        let salt = "demo-salt";
        let a = deterministic_pseudonymize("ACC-001", salt);
        let b = deterministic_pseudonymize("ACC-001", salt);
        assert_eq!(a, b);
    }
}