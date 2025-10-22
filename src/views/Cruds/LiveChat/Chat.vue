<template>
  <div class="chat-wrapper">
    <!-- Back button -->
    <div class="col-12 text-end mb-2">
      <v-btn @click="$router.go(-1)" style="color: #1b706f">
        <i class="fas fa-backward"></i>
      </v-btn>
    </div>

    <!-- Header -->
    <div class="chat-header">
      <!-- Left user -->
      <div
        class="chat-side left"
      >
        <img
          :src="
            chat.user?.image ||
            require('@/assets/media/icons/ui_icons/users.svg')
          "
          class="avatar avatar_user"
        />
        <div class="name-meta">
          <h5 class="mb-0">{{ chat.user?.name }}</h5>
          <small class="text-muted">{{ chat.user?.mobile }}</small>
        </div>
      </div>

      <!-- Order Info & Actions -->
      <div class="chat-center">
        <template v-if="chat.order_id">
          <div class="order-info">
            <small class="fs-6 fw-bold">
              {{ $t(`SIDENAV.orders.number_order`) }} #{{ chat.order_id }}
            </small>
            <v-btn
              small
              color="primary"
              outlined
              @click="viewOrderDetails"
              class="mt-1"
            >
              <i class="fas fa-eye me-1"></i>
              {{ $t("PLACEHOLDERS.view_order_details") }}
            </v-btn>
          </div>
        </template>
      </div>

      <!-- Right admin -->
      <!-- <div class="chat-side right">
        <div class="name-meta text-end">
          <h5 class="mb-0">{{ chat.admin?.name }}</h5>
          <small class="text-muted">{{ $t(`roles.admin`) }}</small>
        </div>
        <img
          :src="
            chat.admin?.avatar ||
            require('@/assets/media/icons/ui_icons/users.svg')
          "
          class="avatar avatar_admin"
        />
      </div> -->
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(group, index) in groupedMessages" :key="index">
        <!-- Date Separator -->
        <!-- <div class="date-separator">
          <span>{{ group.date }}</span>
        </div> -->

        <!-- Messages -->
        <div
          v-for="message in group.messages"
          :key="message.id"
          class="message-wrapper"
          :class="{
            received: message.from_id === currentUser.id,
            sent: message.from_id !== currentUser.id,
          }"
        >
          <div class="message">
            <!-- Message Text -->
            <p v-if="message.message_text" class="mb-1">
              {{ message.message_text }}
            </p>

            <!-- Attachments -->
            <div
              v-if="message.resources && message.resources.length > 0"
              class="attachments-container"
            >
              <div
                v-for="(file, idx) in message.resources"
                :key="idx"
                class="attachment-item"
                @click="downloadFile(file)"
              >
                <!-- Image Preview -->
                <div
                  v-if="isImage(file.url || file.path)"
                  class="image-preview"
                >
                  <img :src="file.url || file.path" :alt="file?.name" />
                </div>

                <!-- File Icon -->
                <a
                  :href="file.resource"
                  target="_blank"
                  v-else
                  class="file-icon-wrapper"
                >
                  <i
                    :class="getFileIcon(file.url || file.path)"
                    class="file-icon"
                  ></i>
                  <span class="file-name">{{
                    file?.name || getFileName(file.url || file.path)
                  }}</span>
                </a>
              </div>
            </div>

            <!-- Timestamp -->
            <small class="timestamp">
              {{ message.created_at }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- File Preview Section -->
    <div v-if="selectedFiles.length > 0" class="file-preview-section">
      <div class="file-preview-header">
        <span>{{ $t("selected_files") }} ({{ selectedFiles.length }})</span>
        <v-btn icon small @click="clearAllFiles">
          <i class="fas fa-times"></i>
        </v-btn>
      </div>
      <div class="file-preview-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-preview-item"
        >
          <img
            v-if="file.preview"
            :src="file.preview"
            class="preview-thumb"
            alt="preview"
          />
          <i
            v-else
            :class="getFileIconByType(file.type)"
            class="file-icon-preview"
          ></i>
          <span class="file-name-preview">{{ file?.name }}</span>
          <v-btn icon x-small @click="removeFile(index)">
            <i class="fas fa-times"></i>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Reply Box -->
    <div class="chat-input">
      <!-- Attachment Button -->
      <v-btn icon color="#1b706f" @click="$refs.fileInput.click()">
        <i class="fas fa-paperclip"></i>
      </v-btn>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
        style="display: none"
        @change="handleFileSelect"
      />

      <!-- Message Input -->
      <v-textarea
        v-model="newMessage"
        :placeholder="$t('PLACEHOLDERS.type_message')"
        outlined
        auto-grow
        rows="1"
        color="primary"
        background-color="grey lighten-4"
        hide-details
        no-resize
        @keydown.enter.exact.prevent="sendMessage"
      />

      <!-- Send Button -->
      <v-btn
        color="#1b706f"
        @click="sendMessage"
        :loading="sending"
        :disabled="!canSend"
      >
        <i class="fas fa-paper-plane text-white"></i>
      </v-btn>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "Chat",
  data() {
    return {
      chat: { messages: [], user: {}, admin: {}, order_id: "" },
      currentUser: {},
      newMessage: "",
      selectedFiles: [],
      sending: false,
      pollInterval: null,
    };
  },
  computed: {
    groupedMessages() {
      if (!this.chat.messages) return [];
      const groups = {};
      this.chat.messages?.forEach((msg) => {
        // fallback if no created_at
        const dateKey = msg?.created_at;
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(msg);
      });
      return Object.keys(groups).map((date) => ({
        date:
          date === "unknown"
            ? this.$t("unknown_date")
            : moment(date).format("MMM DD, YYYY"),
        messages: groups[date],
      }));
    },
    canSend() {
      return (
        (this.newMessage.trim() || this.selectedFiles.length > 0) &&
        !this.sending
      );
    },
  },
  methods: {
    async fetchChat() {
      try {
        let res = await this.$axios({
          method: "GET",
          url: `chat/chats/${this.$route.params?.id}`,
        });
        this.chat = res.data.data?.chat;
        console.log(this.chat);
        this.currentUser = this.chat?.provider;

        // Auto-scroll if near bottom
        const container = this.$refs.messagesContainer;
        if (container) {
          const isNearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            100;
          if (isNearBottom) {
            this.scrollToBottom();
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      }
    },

    async sendMessage() {
      if (!this.canSend) return;

      this.sending = true;
      try {
        const REQUEST_DATA = new FormData();
        if (this.newMessage.trim()) {
          REQUEST_DATA.append("message", this.newMessage);
        }

        // Append files
        this.selectedFiles?.forEach((file, index) => {
          REQUEST_DATA.append(`resources[${index}]`, file.file);
        });

        let res = await this.$axios({
          method: "POST",
          url: `chat/chats/${this.$route.params?.id}/send-message`,
          data: REQUEST_DATA,
        });

        this.newMessage = "";
        this.selectedFiles = [];
        this.scrollToBottom();

        // Refresh chat to show new message
        await this.fetchChat();
      } catch (error) {
        console.error("Failed to send message:", error);
        this.$toast.error(this.$t("failed_to_send_message"));
      } finally {
        this.sending = false;
      }
    },

    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const fileObj = {
          file: file,
          name: file.name,
          type: file.type,
          size: file.size,
          preview: null,
        };

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileObj.preview = e.target.result;
          };
          reader.readAsDataURL(file);
        }

        this.selectedFiles.push(fileObj);
      });

      // Reset input
      event.target.value = "";
    },

    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    clearAllFiles() {
      this.selectedFiles = [];
    },

    isImage(url) {
      if (!url) return false;
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
      ];
      return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
    },

    getFileIcon(url) {
      if (!url) return "fas fa-file";
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes(".pdf")) return "fas fa-file-pdf";
      if (lowerUrl.includes(".xlsx") || lowerUrl.includes(".xls"))
        return "fas fa-file-excel";
      if (lowerUrl.includes(".doc") || lowerUrl.includes(".docx"))
        return "fas fa-file-word";
      return "fas fa-file";
    },

    getFileIconByType(type) {
      if (type.includes("pdf")) return "fas fa-file-pdf";
      if (type.includes("sheet") || type.includes("excel"))
        return "fas fa-file-excel";
      if (type.includes("word") || type.includes("document"))
        return "fas fa-file-word";
      if (type.includes("image")) return "fas fa-file-image";
      return "fas fa-file";
    },

    getFileName(url) {
      if (!url) return this.$i18n.locale == "ar" ? "ملف" : "File";
      return url?.split("/")?.pop()?.split("?")?.[0];
    },

    downloadFile(file) {
      const url = file.url || file.path;
      if (url) {
        window.open(url, "_blank");
      }
    },

    viewOrderDetails() {
      if (this.chat.order_id) {
        this.$router.push(`/orders/show/${this.chat.order_id}`);
      }
    },

    formatTime(date) {
      return moment(date, "YYYY-MM-DD HH:mm:ss").format("hh:mm A");
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },

    startPolling() {
      if (this.pollInterval) clearInterval(this.pollInterval);
      this.pollInterval = setInterval(async () => {
        try {
          await this.fetchChat();
        } catch (err) {
          console.warn("Polling failed:", err.message);
          if (
            err.response &&
            (err.response.status === 403 || err.response.status === 404)
          ) {
            clearInterval(this.pollInterval);
          }
        }
      }, 5000);
    },
  },
  mounted() {
    this.fetchChat();
    // this.startPolling();

    Echo.channel(`chat.${this.$route.params.id}`).listen(`.new_chat`, (e) => {
      this.chat.messages.push(e.message);
      this.scrollToBottom();
    });
  },
  beforeDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 77vh;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e9e9ee;
  background: #fff;
}

.chat-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chat-side.left {
  /* cursor: pointer; */
  transition: opacity 0.2s;
}

.chat-side.left:hover {
  opacity: 0.8;
}

.order-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid #e9e9ee;
}

.name-meta h5 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.name-meta small {
  font-size: 12px;
  color: #6b7280;
}

/* Messages */
.chat-messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px 16px 12px;
  background: #f9fafb;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f5f5f5;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

/* Date Separator */
.date-separator {
  text-align: center;
  margin: 20px 0;
}

.date-separator span {
  background: #e5e7eb;
  color: #374151;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

/* Message Bubbles */
.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message {
  max-width: 68%;
  padding: 10px 14px;
  border-radius: 14px;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-wrapper.sent .message {
  background: var(--chat-client-bg, #e6e8e9);
  color: var(--chat-admin-text, #1e40af);
  border-bottom-left-radius: 4px;
}

.message-wrapper.received .message {
  background: var(--chat-admin-bg, #dbeafe);
  color: var(--chat-client-text, #111827);
  border: 1px solid #e5e7eb;
  border-bottom-right-radius: 4px;
}

/* Attachments */
.attachments-container {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-item:hover {
  transform: scale(1.05);
}

.image-preview {
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.file-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.file-icon {
  font-size: 24px;
  color: #1b706f;
}

.file-name {
  font-size: 13px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timestamp {
  display: block;
  font-size: 11px;
  opacity: 0.65;
  margin-top: 6px;
  text-align: end;
}

/* File Preview Section */
.file-preview-section {
  border-top: 1px solid #e9e9ee;
  background: #f9fafb;
  padding: 10px 12px;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.file-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
}

.preview-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon-preview {
  font-size: 24px;
  color: #1b706f;
}

.file-name-preview {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Input Section */
.chat-input {
  position: sticky;
  bottom: 0;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e9e9ee;
  background: #fff;
}

.chat-input .v-textarea {
  flex: 1;
}

.chat-input .v-btn {
  min-width: 44px;
  height: 44px;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 10px;
  }

  .chat-center {
    width: 100%;
  }

  .message {
    max-width: 85%;
  }
}
</style>
