import router from "@router/index";
import startup from "@util/misc/startup";

try {
  startup();
  router();
} catch (e) {
  console.log(e);
}
