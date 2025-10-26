import "./modules/menu.js";
import "./modules/todos.js";
import "./modules/scroll.js";

if ("serviceWorker" in navigator) {
  addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(err => {
      console.log("SW registration failed:", err);
    });
  });
}
