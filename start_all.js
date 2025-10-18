const { spawn } = require("child_process");

function run(name, file) {
  const proc = spawn("node", [file], { stdio: "inherit" });
  proc.on("close", code => console.log(`${name} exited with code ${code}`));
}

run("Server", "server.js");
setTimeout(() => run("Bot", "bot.js"), 3000);
setTimeout(() => run("AddChat", "add_chat.js"), 6000);
