import dns from "dns";
import kleur from "kleur";

const checkWifi = () => {
  return new Promise<void>((resolve, reject) => {
    dns.resolve("npmjs.com", (err) => {
      if (err) {
        console.log("\n%s Not connected to Wi-Fi\n", kleur.bold().red("ERR"));
        process.exit(0);
      } else {
        resolve();
      }
    });
  });
};

export default checkWifi;
