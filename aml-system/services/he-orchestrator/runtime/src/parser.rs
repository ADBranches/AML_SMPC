pub fn parse_match_result(raw: &str) -> Result<bool, String> {
    let trimmed = raw.trim();

    if trimmed.contains("1") {
        return Ok(true);
    }

    if trimmed.contains("0") {
        return Ok(false);
    }

    Err(format!("Unable to parse MPC output: {}", raw))
}
