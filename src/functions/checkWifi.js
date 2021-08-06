import dns from "dns";
import chalk from "chalk";

const checkWifi = () => {
  return new Promise((resolve, reject) => {
    dns.resolve("npmjs.com", (err) => {
      if (!err) {
        console.log("%s Not connected to Wi-Fi", chalk.bold.red("ERR"));
        process.exit(0);
      } else {
        resolve();
      }
    });
  });
};

export default checkWifi;
