const { spawn } = require("child_process");

const apiProcess = spawn("node", ["server/contactProxy.js"], {
  stdio: "inherit",
});
const gamesProcess = spawn("node", ["server/gamesProxy.js"], {
  stdio: "inherit",
});

const reactProcess = spawn("npm", ["run", "react-start"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, "--no-deprecation"]
      .filter(Boolean)
      .join(" "),
  },
});

const killAll = () => {
  apiProcess.kill();
  gamesProcess.kill();
  reactProcess.kill();
  process.exit();
};

process.on("SIGINT", killAll);
process.on("SIGTERM", killAll);
process.on("exit", killAll);
