<template>
  <div class="show_all_content_wrapper">
    <main>
      <!-- =========== Start:: Filter Form =========== -->
      <div
        class="filter_content_wrapper"
        :class="{ active: filterFormIsActive }"
      >
        <button
          class="filter_toggler"
          @click="filterFormIsActive = !filterFormIsActive"
        >
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
                col="4"
                type="text"
                :placeholder="$t('TABLES.ContactMessages.clientName')"
                v-model.trim="filterOptions.name"
              />
              <!-- End:: Client Name -->

              <!-- Start:: Order ID -->
              <base-input
                col="4"
                type="number"
                :placeholder="$t('PLACEHOLDERS.orderNumber')"
                v-model.trim="filterOptions.order_id"
              />
              <!-- End:: Order ID -->

              <!-- Start:: Message Read Status -->
              <base-select-input
                col="4"
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

        <!-- Start:: User Image -->
        <template v-slot:[`item.user.image`]="{ item }">
          <div class="d-flex align-center justify-center">
            <img
              v-if="item.user?.image"
              :src="item.user.image"
              alt="user"
              class="rounded-circle"
              width="40"
              height="40"
            />
            <v-avatar v-else color="grey" size="40">
              <i class="fal fa-user text-white"></i>
            </v-avatar>
          </div>
        </template>
        <!-- End:: User Image -->

        <!-- Start:: User Name -->
        <template v-slot:[`item.user.name`]="{ item }">
          <span v-if="item.user?.name">{{ item.user.name }}</span>
          <span v-else class="text-danger">{{ $t("TABLES.noData") }}</span>
        </template>
        <!-- End:: User Name -->

        <!-- Start:: Order ID -->
        <template v-slot:[`item.order_id`]="{ item }">
          <span v-if="item.order_id">{{ item.order_id }}</span>
          <span v-else>-</span>
        </template>
        <!-- End:: Order ID -->

        <!-- Start:: Last Message -->
        <template v-slot:[`item.last_message.message_text`]="{ item }">
          <div class="actions" v-if="item.last_message?.message_text && item.last_message?.message_text != ' '">
            <button
              class="btn_show"
              @click="showReplayModal(item.last_message?.message_text)"
            >
              <i class="fal fa-file-alt"></i>
            </button>
          </div>
          <div class="actions" v-if="!item.last_message?.message_text || (item.last_message?.message_text == ' ' && item.last_message?.resources?.length > 0)">
            <button
              class="btn_show"
              @click="showReplayModal($t('PLACEHOLDERS.file'))"
            >
              <i class="fal fa-file-alt"></i>
            </button>
          </div>
          <div v-if="!item.last_message?.message_text || (item.last_message?.message_text == ' ' && item.last_message?.resources?.length == 0)">
            -
          </div>
        </template>
        <!-- End:: Last Message -->

        <!-- Start:: Last Message Date -->
        <template v-slot:[`item.last_message.created_at`]="{ item }">
          <span v-if="item.last_message?.created_at">
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
                <i
                  class="fad fa-comments fs-5"
                  style="color: cornflowerblue"
                ></i>
              </button>
            </a-tooltip>
          </div>
        </template>
        <!-- End:: Actions -->
        <!-- ======================== Start:: Dialogs ======================== -->
        <template v-slot:top>
          <!-- Start:: Replay Modal -->
          <description-modal
            v-if="dialogReplay"
            :modalIsOpen="dialogReplay"
            :modalDesc="selectedReplayTextToShow"
            @toggleModal="dialogReplay = !dialogReplay"
          />
          <!-- End:: Replay Modal -->

          <!-- Start:: Replay Modal -->
          <v-dialog v-model="dialogSendReplay">
            <v-card>
              <v-card-title class="text-h5 justify-center">
                {{ $t("TITLES.sendReplay") }}
              </v-card-title>

              <form class="w-100">
                <base-input
                  col="12"
                  rows="3"
                  type="textarea"
                  :placeholder="$t('PLACEHOLDERS.messageReplay')"
                  v-model.trim="messageReplay"
                  required
                />
              </form>

              <v-card-actions>
                <v-btn
                  class="modal_confirm_btn"
                  @click="sendReplay"
                  :disabled="!!!messageReplay || messageReplay?.length < 3"
                >
                  {{ $t("BUTTONS.replay") }}
                </v-btn>

                <v-btn
                  class="modal_cancel_btn"
                  @click="dialogSendReplay = false"
                  >{{ $t("BUTTONS.cancel") }}</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- End:: Replay Modal -->
        </template>
        <!-- ======================== End:: Dialogs ======================== -->
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
        { id: 1, name: this.$t("STATUS.read"), value: 1 },
        { id: 2, name: this.$t("STATUS.unread"), value: 0 },
      ];
    },
  },

  data() {
    return {
      loading: false,
      isWaitingRequest: false,
      filterFormIsActive: false,
      dialogReplay: false,
      selectedReplayTextToShow: "",
      filterOptions: {
        name: null,
        order_id: null,
        is_read: null,
      },

      tableHeaders: [
        {
          text: this.$t("PLACEHOLDERS.userImage"),
          value: "user.image",
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.userName"),
          value: "user.name",
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.orderNumber"),
          value: "order_id",
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.last_message"),
          value: "last_message.message_text",
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.data_last_message"),
          value: "last_message.created_at",
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.last_message_status"),
          value: "unread_messages_count",
          align: "center",
        },
        {
          text: this.$t("TABLES.ContactMessages.actions"),
          value: "actions",
          align: "center",
        },
      ],

      tableRows: [],
      echoChannels: [],

      paginations: {
        current_page: 1,
        last_page: 1,
        items_per_page: 10,
      },
    };
  },

  methods: {
    showReplayModal(replay) {
      this.dialogReplay = true;
      this.selectedReplayTextToShow = replay;
    },
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
            search: this.filterOptions.name,
            order_id: this.filterOptions.order_id,
            read: this.filterOptions.is_read?.value,
          },
        });

        this.tableRows = res.data.data;
        this.paginations.last_page = res.data.meta.last_page;
        
        // Setup Pusher listeners for all chats
        this.setupPusherListeners();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    setupPusherListeners() {
      if (!window.Echo) return;

      // Clean up existing listeners
      this.cleanupPusherListeners();

      // Listen to user-chat channels for each chat's user
      this.tableRows.forEach((chat) => {
        if (chat.user && chat.user.id) {
          const channelName = `user-chat.${chat.user.id}`;
          const echoChannel = window.Echo.channel(channelName);
          
          echoChannel.listen(".user.chat", (e) => {
            console.log("User chat event received:", e);
            
            if (e.chat) {
              // Find and update the corresponding chat in the list
              const chatIndex = this.tableRows.findIndex(
                (row) => row.id === e.chat.id
              );
              
              if (chatIndex !== -1) {
                // Update the chat data
                this.$set(this.tableRows, chatIndex, {
                  ...this.tableRows[chatIndex],
                  ...e.chat,
                });
              } else {
                // If it's a new chat, refresh the list
                this.setTableRows();
              }
            }
          });

          this.echoChannels.push({ channel: echoChannel, name: channelName });
        }

        // Also listen to chat.{chatId} for real-time updates
        if (chat.id) {
          const channelName = `chat.${chat.id}`;
          const echoChannel = window.Echo.channel(channelName);
          
          echoChannel.listen(".new_chat", (e) => {
            console.log("Chat update event received:", e);
            
            if (e.chat) {
              // Find and update the corresponding chat in the list
              const chatIndex = this.tableRows.findIndex(
                (row) => row.id === e.chat.id
              );
              
              if (chatIndex !== -1) {
                // Update the chat data
                this.$set(this.tableRows, chatIndex, {
                  ...this.tableRows[chatIndex],
                  last_message: e.chat.last_message,
                  unread_messages_count: e.chat.unread_messages_count,
                });
              }
            }
          });

          this.echoChannels.push({ channel: echoChannel, name: channelName });
        }
      });
    },

    cleanupPusherListeners() {
      if (window.Echo && this.echoChannels.length > 0) {
        this.echoChannels.forEach(({ name }) => {
          window.Echo.leave(name);
        });
        this.echoChannels = [];
      }
    },
  },

  created() {
    if (this.$route.query.page) {
      this.paginations.current_page = +this.$route.query.page;
    }
    this.setTableRows();
  },

  beforeDestroy() {
    // Clean up Pusher listeners
    this.cleanupPusherListeners();
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
