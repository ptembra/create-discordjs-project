import dns from "dns";
import chalk from "chalk";

const checkWifi = () => {
  dns.resolve("npmjs.com", (err) => {
    if (err) {
      console.log("%s Not connected to Wi-Fi", chalk.bold.red("ERR"));
    }
  });
};

export default checkWifi;
