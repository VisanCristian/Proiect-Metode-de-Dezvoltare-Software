mod commands;
mod crypto;

use clap::Parser;
use commands::{Command, decrypt, encrypt};
#[derive(Parser)]
#[command(author, version, about, long_about = None)]

struct CLI {
    #[command(subcommand)]
    command: Command,
}

fn main() {
    if let Err(e) = run() {
        eprintln!("{}", e);
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let cli = CLI::parse();
    match cli.command {
        Command::Encrypt { input, password } => {
            let msg = encrypt(&input, &password)?;
            println!("{}", msg);
        }
        Command::Decrypt { input, password } => {
            let msg = decrypt(&input, &password)?;
            println!("{}", msg);
        }
    };
    Ok(())
}
