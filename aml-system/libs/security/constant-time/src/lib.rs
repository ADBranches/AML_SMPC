/// Constant-time-ish equality check for byte slices.
///
/// This is a simple wrapper appropriate for MVP hardening where the goal is to
/// avoid obvious early-return timing leaks in sensitive comparisons.
pub fn ct_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let mut diff: u8 = 0;
    for i in 0..a.len() {
        diff |= a[i] ^ b[i];
    }

    diff == 0
}

/// Zeroize a mutable byte buffer in-place.
pub fn zeroize(buf: &mut [u8]) {
    for b in buf.iter_mut() {
        *b = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ct_eq_works() {
        assert!(ct_eq(b"abc", b"abc"));
        assert!(!ct_eq(b"abc", b"abd"));
        assert!(!ct_eq(b"abc", b"ab"));
    }

    #[test]
    fn zeroize_works() {
        let mut data = [1u8, 2u8, 3u8];
        zeroize(&mut data);
        assert_eq!(data, [0u8, 0u8, 0u8]);
    }
}
