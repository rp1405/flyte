// // index.js
import "./polyfill";
// import { AppRegistry } from "react-native";
// import App from "./App"; // Points to App.tsx in the root
// import { name as appName } from "./app.json";
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
// AppRegistry.registerComponent(appName, () => App);
