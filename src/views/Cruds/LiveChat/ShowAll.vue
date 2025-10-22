<template>
  <div class="show_all_content_wrapper">
    <main>
      <!-- =========== Start:: Filter Form =========== -->
      <div class="filter_content_wrapper" :class="{ active: filterFormIsActive }">
        <button class="filter_toggler" @click="filterFormIsActive = !filterFormIsActive">
          <i class="fal fa-times"></i>
        </button>

        <div class="filter_title_wrapper">
          <h5>{{ $t("TITLES.searchBy") }}</h5>
        </div>

        <div class="filter_form_wrapper">
          <form @submit.prevent="submitFilterForm">
            <div class="row justify-content-center align-items-center w-100">
              <!-- Start:: Client Name -->
              <base-input
                col="3"
                type="text"
                :placeholder="$t('TABLES.ContactMessages.clientName')"
                v-model.trim="filterOptions.name"
              />
              <!-- End:: Client Name -->

              <!-- Start:: Order ID -->
              <base-input
                col="3"
                type="number"
                :placeholder="$t('PLACEHOLDERS.orderNumber')"
                v-model.trim="filterOptions.order_id"
              />
              <!-- End:: Order ID -->

              <!-- Start:: Message Read Status -->
              <base-select-input
                col="3"
                :optionsList="messageStatuses"
                :placeholder="$t('PLACEHOLDERS.status')"
                v-model="filterOptions.is_read"
              />
              <!-- End:: Message Read Status -->
            </div>

            <div class="btns_wrapper">
              <button class="submit_btn" :disabled="isWaitingRequest">
                <i class="fal fa-search"></i>
              </button>
              <button
                class="reset_btn"
                type="button"
                :disabled="isWaitingRequest"
                @click="resetFilter"
              >
                <i class="fal fa-redo"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- =========== End:: Filter Form =========== -->

      <!-- =========== Start:: Table Title =========== -->
      <div class="table_title_wrapper">
        <div class="title_text_wrapper">
          <h5>{{ $t("SIDENAV.ContactMessages.liveChat") }}</h5>
          <button
            v-if="!filterFormIsActive"
            class="filter_toggler"
            @click.stop="filterFormIsActive = !filterFormIsActive"
          >
            <i class="fal fa-search"></i>
          </button>
        </div>
      </div>
      <!-- =========== End:: Table Title =========== -->

      <!-- =========== Start:: Data Table =========== -->
      <v-data-table
        class="thumb"
        :loading="loading"
        :loading-text="$t('TABLES.loadingData')"
        :headers="tableHeaders"
        :items="tableRows"
        item-class="ltr"
        :items-per-page="paginations.items_per_page"
        hide-default-footer
      >
        <template v-slot:no-data>
          {{ $t("TABLES.noData") }}
        </template>

        <!-- Start:: User -->
        <template v-slot:[`item.user.name`]="{ item }">
          <div class="d-flex align-center justify-center gap-2">
            <img
              v-if="item.user.image"
              :src="item.user.image"
              alt="user"
              class="rounded-circle"
              width="40"
              height="40"
            />
            <v-avatar v-else color="grey" size="40">
              <i class="fal fa-user text-white"></i>
            </v-avatar>
            <span>{{ item.user.name }}</span>
          </div>
        </template>
        <!-- End:: User -->

        <!-- Start:: Order ID -->
        <template v-slot:[`item.order_id`]="{ item }">
          <span v-if="item.order_id">#{{ item.order_id }}</span>
          <span v-else>-</span>
        </template>
        <!-- End:: Order ID -->

        <!-- Start:: Last Message -->
        <template v-slot:[`item.last_message.message_text`]="{ item }">
          <span v-if="item.last_message">
            {{ item.last_message.message_text || '--' }}
          </span>
          <span v-else>--</span>
        </template>
        <!-- End:: Last Message -->

        <!-- Start:: Last Message Date -->
        <template v-slot:[`item.last_message.created_at`]="{ item }">
          <span v-if="item.last_message">
            {{ formatDate(item.last_message.created_at) }}
          </span>
          <span v-else>--</span>
        </template>
        <!-- End:: Last Message Date -->

        <!-- Start:: Unread Indicator -->
        <template v-slot:[`item.unread_messages_count`]="{ item }">
          <v-chip
            v-if="item.unread_messages_count > 0"
            color="green"
            text-color="white"
            small
          >
            {{ $t("STATUS.read") }}
          </v-chip>
          <v-chip v-else color="red" text-color="white" small>
            {{ $t("STATUS.unread") }}
          </v-chip>
        </template>
        <!-- End:: Unread Indicator -->

        <!-- Start:: Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="actions text-center">
            <a-tooltip placement="bottom">
              <template #title>
                <span>{{ $t("BUTTONS.chat") }}</span>
              </template>
              <button class="btn_chat" @click="showChat(item)">
                <i class="fad fa-comments fs-5" style="color: cornflowerblue"></i>
              </button>
            </a-tooltip>
          </div>
        </template>
        <!-- End:: Actions -->
      </v-data-table>
      <!-- =========== End:: Data Table =========== -->
    </main>

    <!-- =========== Start:: Pagination =========== -->
    <div class="pagination_container text-center mt-3 mb-0">
      <v-pagination
        class="py-0"
        square
        v-model="paginations.current_page"
        :length="paginations.last_page"
        :total-visible="6"
        @input="updateRouterQueryParam($event)"
      />
    </div>
    <!-- =========== End:: Pagination =========== -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AllContactMessages",

  computed: {
    ...mapGetters({
      getAppLocale: "AppLangModule/getAppLocale",
    }),

    messageStatuses() {
      return [
        { id: 1, name: this.$t("STATUS.read"), value: "read" },
        { id: 2, name: this.$t("STATUS.unread"), value: "unread" },
      ];
    },
  },

  data() {
    return {
      loading: false,
      isWaitingRequest: false,
      filterFormIsActive: false,

      filterOptions: {
        name: null,
        order_id: null,
        is_read: null,
      },

      tableHeaders: [
        { text: this.$t("TABLES.ContactMessages.clientName"), value: "user.name", align: "center" },
        { text: this.$t("TABLES.ContactMessages.orderNumber"), value: "order_id", align: "center" },
        { text: this.$t("TABLES.ContactMessages.message"), value: "last_message.message_text", align: "center" },
        { text: this.$t("TABLES.ContactMessages.date"), value: "last_message.created_at", align: "center" },
        { text: this.$t("TABLES.ContactMessages.status"), value: "unread_messages_count", align: "center" },
        { text: this.$t("TABLES.ContactMessages.actions"), value: "actions", align: "center" },
      ],

      tableRows: [],

      paginations: {
        current_page: 1,
        last_page: 1,
        items_per_page: 10,
      },
    };
  },

  methods: {
    formatDate(date) {
      if (!date) return "--";
      return new Date(date).toLocaleString();
    },

    async submitFilterForm() {
      this.paginations.current_page = 1;
      await this.setTableRows();
    },

    async resetFilter() {
      this.filterOptions = { name: null, order_id: null, is_read: null };
      this.paginations.current_page = 1;
      await this.setTableRows();
    },

    updateRouterQueryParam(pagenationValue) {
      this.paginations.current_page = pagenationValue;
      this.setTableRows();
      window.scrollTo(0, 0);
    },

    showChat(item) {
      this.$router.push({ path: `/live-chat/chat/${item?.id}` });
    },

    async setTableRows() {
      this.loading = true;
      try {
        const res = await this.$axios.get("chat/chats", {
          params: {
            page: this.paginations.current_page,
            name: this.filterOptions.name,
            order_id: this.filterOptions.order_id,
            is_read: this.filterOptions.is_read?.value,
          },
        });

        this.tableRows = res.data.data;
        this.paginations.last_page = res.data.meta.last_page;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },

  created() {
    if (this.$route.query.page) {
      this.paginations.current_page = +this.$route.query.page;
    }
    this.setTableRows();
  },
};
</script>

<style scoped>
.actions .btn_chat {
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
