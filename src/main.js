import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

// Start:: Importing Main Sass Styles File
import "./assets/sass/main.scss";
// End:: Importing Main Sass Styles File

// Start:: Importing Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
// End:: Importing Bootstrap

// Start:: Importing Plugins
import i18n from "./plugins/i18n";
import axios from "./plugins/axios";
import vuetify from "./plugins/vuetify";
import Antd from "./plugins/antDesign";
import "./plugins/googleMaps";
import "./plugins/formComponents";
import "./plugins/globalComponents";
import "./plugins/3rdPartyLibraries";

import firebase from "firebase/app";
import "firebase/firebase-messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC7Hso4S6WneO0lk6SeozfzoQjUBPZQlI0",
  authDomain: "bunian-tech.firebaseapp.com",
  projectId: "bunian-tech",
  storageBucket: "bunian-tech.firebasestorage.app",
  messagingSenderId: "113785147585",
  appId: "1:113785147585:web:9f9812b6eab9448ac18440",
  measurementId: "G-JS78WLD1WR"
};

firebase.initializeApp(firebaseConfig);
// End:: Importing Plugins

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: "9077e2ce86701f17f3b2",
  cluster: "mt1",
  forceTLS: true,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  authEndpoint: "https://backend.bonian.moltaqadev.com/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("bonian_provider_dashboard_user_token")}`,
    },
  },
});

// casl vue permissions
import VueTelInput from "vue-tel-input";
import "vue-tel-input/dist/vue-tel-input.css";

Vue.use(VueTelInput);

import ability from "./plugins/ability";
import { abilitiesPlugin } from "@casl/vue";
Vue.use(abilitiesPlugin, ability);

// casl vue permissions

// Start:: Set App Lang  & Theme
store.dispatch("AppLangModule/handelAppDefaultLanguage");
store.dispatch("AppThemeModule/handelAppDefaultTheme");
// End:: Set App Lang  & Theme
import * as Sentry from "@sentry/vue";

Sentry.init({
  Vue,
  dsn: "https://fbb0375d9c3dddd586aa67113cb8c02a@o4508131528343552.ingest.de.sentry.io/4508131535552592",
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

Vue.use(Antd);
Vue.prototype.$axios = axios;
Vue.config.productionTip = false;
new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
