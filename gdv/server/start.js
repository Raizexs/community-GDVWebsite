const { spawn } = require("child_process");

const apiProcess = spawn("node", ["server/contactProxy.js"], { stdio: "inherit" });
const gamesProcess = spawn("node", ["server/gamesProxy.js"], { stdio: "inherit" });
const partnersProcess = spawn("node", ["server/partnersProxy.js"], { stdio: "inherit" });
const aboutUsProcess = spawn("node", ["server/aboutUsProxy.js"], { stdio: "inherit" });
const homeProcess = spawn("node", ["server/homeProxy.js"], { stdio: "inherit" });

const reactProcess = spawn("npm", ["run", "react-start"], { stdio: "inherit", shell: true });

const killAll = () => {
  apiProcess.kill();
  gamesProcess.kill();
  partnersProcess.kill();
  aboutUsProcess.kill();
  homeProcess.kill();
  reactProcess.kill();
  process.exit();
};

process.on("SIGINT", killAll);
process.on("SIGTERM", killAll);
process.on("exit", killAll);
