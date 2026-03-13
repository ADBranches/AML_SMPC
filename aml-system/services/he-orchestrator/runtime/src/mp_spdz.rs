use std::path::PathBuf;
use std::process::Command;

pub fn run_sanction_check(entity_id: i64) -> Result<bool, String> {
    let root = std::env::var("AML_ROOT_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::current_dir().unwrap());

    let script = root.join("scripts/dev/run_mp_spdz_local.sh");

    let output = Command::new("bash")
        .arg(script)
        .arg(entity_id.to_string())
        .output()
        .map_err(|e| format!("Failed to execute MP-SPDZ wrapper: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "MP-SPDZ wrapper failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    crate::parser::parse_match_result(&stdout)
}