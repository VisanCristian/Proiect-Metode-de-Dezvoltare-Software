use argon2::{Algorithm, Argon2, Params, Version};

#[derive(Debug, Clone)]
pub struct KDFConfig {
    pub iterations: u32,
    pub memory_kib: u32,
    pub parallelism: u32,
    pub output_len: u32,
}

impl Default for KDFConfig {
    fn default() -> Self {
        Self {
            iterations: 3,
            memory_kib: 65536,
            parallelism: 4,
            output_len: 32,
        }
    }
}

#[derive(Debug)]
pub enum KDFError {
    InvalidConfig(String),
    InternalError(String),
}

pub fn derive_key(password: &str, salt: &[u8], config: &KDFConfig) -> Result<[u8; 32], KDFError> {
    let mut buffer = [0u8; 32];
    let params = Params::new(
        // Argon2::Params::new expects: memory_cost (KiB), iterations, parallelism, output_len
        // so we pass memory_kib first to ensure a sufficiently high memory cost.
        config.memory_kib,
        config.iterations,
        config.parallelism,
        Some(config.output_len as usize),
    )
    .map_err(|e| KDFError::InvalidConfig(e.to_string()))?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    argon2
        .hash_password_into(password.as_bytes(), salt, &mut buffer)
        .map_err(|e| KDFError::InternalError(e.to_string()))?;
    Ok(buffer)
}
