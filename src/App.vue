<template>
  <v-app>
    <transition name="fadeInUp" mode="out-in">
      <router-view />
    </transition>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "App",

  computed: {
    // Start:: Vuex Getters
    ...mapGetters({
      getAuthenticatedUserData: "AuthenticationModule/getAuthenticatedUserData",
      notificationsData: "NotificationsModule/notificationsData",
    }),
    // End:: Vuex Getters
  },

  data() {
    return {
      receivedMessages: [],
      notificationCount: 0,
      // Start:: Notifications Menu Control Data
      notificationsMenuIsOpen: false,
      // End:: Notifications Menu Control Data

      // Start:: User Profile Modal Controlling Data
      userProfileModalIsOpen: false,
      // End:: User Profile Modal Controlling Data
    };
  },

  methods: {
    // Start:: Vuex Actions
    ...mapActions({
      readAllNotifications: "NotificationsModule/readAllNotifications",
    }),
    // End:: Vuex Actions
  },

  created() {
    // Get Query if logout, remove token local Storage
    const logoutQuery = this.$route.query.logout;
    if (logoutQuery) {
      localStorage.removeItem("bonian_provider_dashboard_user_id");
      localStorage.removeItem("bonian_provider_dashboard_user_token");
      localStorage.removeItem("bonian_provider_dashboard_userName");
      localStorage.removeItem("bonian_provider_roles");
      this.$router.go(0);
    }
    // this.getData();
    this.readAllNotifications();

    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("message", event);
      this.readAllNotifications();
    });
  },
};
</script>
