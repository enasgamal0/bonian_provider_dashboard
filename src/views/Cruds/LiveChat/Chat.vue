<template>
  <div class="chat-wrapper">
    <!-- Back button -->
    <div class="col-12 text-end">
      <v-btn @click="$router.go(-1)" style="color: #1b706f">
        <i class="fas fa-backward"></i>
      </v-btn>
    </div>

    <!-- Header -->
    <div class="chat-header">
      <!-- Left user -->
      <div class="chat-side left">
        <!-- <img
          :src="
            chat.user?.image ||
            require('@/assets/media/icons/ui_icons/users.svg')
          "
          class="avatar avatar_user"
        /> -->
       <div class="avatar avatar_user">
         <v-avatar color="grey">
              <i class="fal fa-user text-white"></i>
            </v-avatar>
       </div>
        <div class="name-meta">
          <h5 class="mb-0">{{ chat.user?.name }}</h5>
          <small>{{ chat.user?.mobile }}</small>
        </div>
      </div>

      <!-- Order Info & Actions -->
      <div class="chat-center">
        <template v-if="chat.order_id">
          <div class="order-info">
            <span class="order-number">
              {{ $t(`SIDENAV.orders.number_order`) }}: {{ chat.order_id }}
            </span>
            <v-btn
              small
              color="#1b706f"
              outlined
              @click="viewOrderDetails"
              class="view-order-btn"
            >
              <i class="fas fa-eye me-1"></i>
              {{ $t("PLACEHOLDERS.view_order_details") }}
            </v-btn>
          </div>
        </template>
      </div>
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
          :key="message?.id"
          class="message-wrapper"
          :class="[
            message?.from_id === currentUser?.id ? 'received' : 'sent',
            $i18n.locale === 'ar' ? 'rtl' : 'ltr',
          ]"
        >
          <div class="message">
            <!-- Message Text -->
            <p v-if="message.message_text" class="message-text">
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
                  <!-- <span class="file-name">{{
                    file?.name || getFileName(file.url || file.path)
                  }}</span> -->
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
    <transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="file-preview-section">
        <!-- <div class="file-preview-header">
          <span>{{ $t("selected_files") }} ({{ selectedFiles.length }})</span>
          <v-btn icon x-small @click="clearAllFiles" color="error">
            <i class="fas fa-times"></i>
          </v-btn>
        </div> -->
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
            <!-- <span class="file-name-preview">{{ file?.name }}</span> -->
            <v-btn icon x-small @click="removeFile(index)" color="error">
              <i class="fas fa-times"></i>
            </v-btn>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reply Box -->
    <div class="chat-input" v-if="chat.is_read == 0">
      <!-- Attachment Button -->
      <v-btn icon color="#1b706f" @click="$refs.fileInput.click()" large style="background-color: #1b6f6d4d">
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
        color="#1b706f"
        background-color="white"
        hide-details
        no-resize
        class="message-input"
        @keydown.enter.exact.prevent="sendMessage"
      />

      <!-- Send Button -->
      <v-btn
        color="#1b706f"
        @click="sendMessage"
        :loading="sending"
        :disabled="!canSend"
        fab
        small
        elevation="2"
      >
        <i class="fas fa-paper-plane text-white"></i>
      </v-btn>
    </div>
      <!-- Start:: Read-only Message (when is_read === 1) -->
    <div class="single_step_form_content_wrapper" v-if="chat.is_read === 1">
      <div class="alert text-center" style="padding: 15px; font-size: 14px; color: #1b706f; background-color: #1b706f1a; border-radius: 10px; border: 1px solid #1b706f;">
        {{ $t("MESSAGES.chat_read_only") }}
      </div>
    <!-- END:: Read-only Message -->
    </div>

    <!-- Payment Status Dialog -->
    <v-dialog v-model="showPaymentStatusDialog" max-width="500" persistent>
      <v-card class="rounded-xl" elevation="8">
        <v-card-text class="py-6 px-5">
          <div class="text-center mb-4">
            <div
              class="payment-icon-wrapper mx-auto"
              :style="{
                width: '80px',
                height: '80px',
                background: isPaymentSuccess 
                  ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                  : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPaymentSuccess
                  ? '0 4px 12px rgba(40, 167, 69, 0.15)'
                  : '0 4px 12px rgba(220, 53, 69, 0.15)'
              }"
            >
              <i
                :class="isPaymentSuccess ? 'fas fa-check-circle' : 'fas fa-times-circle'"
                :style="{
                  fontSize: '36px',
                  color: isPaymentSuccess ? '#28a745' : '#dc3545'
                }"
              ></i>
            </div>
          </div>

          <p
            class="text-center payment-message mb-4"
            :style="{
              fontSize: '16px',
              lineHeight: '1.6',
              color: isPaymentSuccess ? '#28a745' : '#dc3545',
              fontWeight: '600'
            }"
          >
            {{ isPaymentSuccess ? $t("MESSAGES.paymentSuccess") : $t("MESSAGES.paymentFailed") }}
          </p>

          <div class="text-center">
            <v-btn
              block
              size="large"
              elevation="2"
              class="rounded-lg"
              :style="{
                background: 'linear-gradient(135deg, #1b706f 0%, #15605f 100%)',
                color: 'white',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'none',
                fontSize: '15px'
              }"
              @click="closePaymentStatusDialog"
            >
              {{ $t("BUTTONS.ok") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- End:: Payment Status Dialog -->
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
      echoChannel: null,
      showPaymentStatusDialog: false,
      isPaymentSuccess: false,
      paymentStatusTimeout: null,
    };
  },
  computed: {
    groupedMessages() {
      if (!this.chat.messages) return [];
      const groups = {};
      this.chat.messages?.forEach((msg) => {
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
        this.currentUser = this.chat?.provider;

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

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileObj.preview = e.target.result;
          };
          reader.readAsDataURL(file);
        }

        this.selectedFiles.push(fileObj);
      });

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
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
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

    setupPusherListener() {
      const chatId = this.$route.params?.id;
      if (!chatId || !window.Echo) return;

      // Clean up existing listener
      if (this.echoChannel) {
        window.Echo.leave(`chat.${chatId}`);
        this.echoChannel = null;
      }

      // Listen to the public channel chat.{id} with event new_chat
      this.echoChannel = window.Echo.channel(`chat.${chatId}`);
      
      this.echoChannel.listen(".new_chat", (e) => {
        console.log("New chat event received:", e);
        
        if (e.message && e.chat) {
          // Add the new message to the messages array if it doesn't already exist
          const messageExists = this.chat.messages.some(
            (msg) => msg.id === e.message.id
          );
          
          if (!messageExists) {
            this.chat.messages.push(e.message);
            
            // Update chat data if provided
            if (e.chat) {
              this.chat.last_message = e.chat.last_message;
              this.chat.unread_messages_count = e.chat.unread_messages_count;
            }
            
            this.scrollToBottom();
          }
        }
      });

      // Stop polling since we're using Pusher
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    },

    checkPaymentStatus() {
      const successParam = this.$route.query.success;
      if (successParam !== undefined) {
        this.isPaymentSuccess = successParam === "true" || successParam === true;
        
        // Remove the success query parameter from URL immediately
        const query = { ...this.$route.query };
        delete query.success;
        this.$router.replace({ query });
        
        // Show the dialog
        this.showPaymentStatusDialog = true;
        
        // Auto-close after 3 seconds
        if (this.paymentStatusTimeout) {
          clearTimeout(this.paymentStatusTimeout);
        }
        this.paymentStatusTimeout = setTimeout(() => {
          this.closePaymentStatusDialog();
        }, 3000);
      }
    },

    closePaymentStatusDialog() {
      this.showPaymentStatusDialog = false;
      // Clear the timeout if it exists
      if (this.paymentStatusTimeout) {
        clearTimeout(this.paymentStatusTimeout);
        this.paymentStatusTimeout = null;
      }
    },
  },
  mounted() {
    this.fetchChat();
    this.setupPusherListener();
    this.checkPaymentStatus();
  },
  beforeDestroy() {
    // Clean up polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    // Clean up Pusher listener
    if (this.echoChannel && this.$route.params?.id) {
      window.Echo.leave(`chat.${this.$route.params?.id}`);
      this.echoChannel = null;
    }
    
    // Clean up payment status timeout
    if (this.paymentStatusTimeout) {
      clearTimeout(this.paymentStatusTimeout);
      this.paymentStatusTimeout = null;
    }
  },
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 77vh;
  overflow: hidden;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Back Button */
.back-button-container {
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 2px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.chat-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chat-side.left {
  transition: opacity 0.2s;
}

.chat-side.left:hover {
  opacity: 0.85;
}

.order-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.view-order-btn {
  font-size: 12px;
}

.avatar {
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 3px solid #1b706f;
  box-shadow: 0 2px 6px rgba(27, 112, 111, 0.2);
}

.name-meta h5 {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.name-meta small {
  font-size: 13px;
  color: #6c757d;
}

/* Messages */
.chat-messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 20px 16px;
  background: #f8f9fa;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f3f5;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #868e96;
}

/* Date Separator */
.date-separator {
  text-align: center;
  margin: 24px 0 16px;
}

.date-separator span {
  background: #ffffff;
  color: #6c757d;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Message Bubbles */
.message-wrapper {
  display: flex;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message {
  max-width: 65%;
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.message:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.received p {
  color: white !important;
}

.message-wrapper.received .message {
  background: linear-gradient(135deg, #1b706f 0%, #156160 100%);
  color: #212529;
}

.right_border .received .message {
  border-bottom-right-radius: 4px;
}

.left_border {
  border-bottom-left-radius: 4px;
}

.message-wrapper.sent .message {
  background: #ffffff;
  color: #ffffff;
  border: 1px solid #dee2e6;
}

.message-wrapper.sent .message {
  color: #ffffff;
}

.message-text {
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

/* Attachments */
.attachments-container {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-item {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  overflow: hidden;
}

.attachment-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview {
  max-width: 220px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.file-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.message-wrapper.received .file-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.file-icon {
  font-size: 26px;
  color: #1b706f;
}

.message-wrapper.received .file-icon {
  color: #ffffff;
}

.file-name {
  font-size: 13px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #495057;
}

.message-wrapper.sent .file-name {
  color: #ffffff;
}

.timestamp {
  display: block;
  font-size: 11px;
  opacity: 0.75;
  margin-top: 6px;
  text-align: end;
  font-weight: 500;
}

.message-wrapper.received .timestamp {
  color: #ffffff !important;
}

.message-wrapper.sent .timestamp {
  color: #212529 !important;
}

/* File Preview Section */
.file-preview-section {
  border-top: 2px solid #e9ecef;
  background: #ffffff;
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.file-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-size: 13px;
  transition: background 0.2s;
}

.file-preview-item:hover {
  background: #e9ecef;
}

.preview-thumb {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-icon-preview {
  font-size: 28px;
  color: #1b706f;
}

.file-name-preview {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #495057;
  font-weight: 500;
}

/* Input Section */
.chat-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: #ffffff;
  border-top: 2px solid #e9ecef;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.message-input {
  flex: 1;
}

.message-input >>> .v-input__control {
  border-radius: 24px;
}

.message-input >>> textarea {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .chat-side.left {
    width: 100%;
    justify-content: flex-start;
  }

  .chat-center {
    width: 100%;
  }

  .message {
    max-width: 80%;
  }

  .avatar {
    width: 42px;
    height: 42px;
  }

  .name-meta h5 {
    font-size: 14px;
  }

  .name-meta small {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .message {
    max-width: 85%;
  }

  .chat-input {
    padding: 12px;
    gap: 8px;
  }
}

/* Default bubble rounding */
.message {
  border-radius: 16px;
}

/* LTR layout (English) */
.ltr.sent .message {
  border-bottom-right-radius: 4px;
}

.ltr.received .message {
  border-bottom-left-radius: 4px;
}

/* RTL layout (Arabic) */
.rtl.sent .message {
  border-bottom-left-radius: 4px;
}

.rtl.received .message {
  border-bottom-right-radius: 4px;
}

.dark_theme .chat-wrapper {
  background: #1f1f1f;
  box-shadow: none;
}

/* Header */
.dark_theme .chat-header {
  background: #2a2a2a;
  border-bottom-color: #333;
}

.dark_theme .name-meta h5 {
  color: #ffffff;
}

.dark_theme .name-meta small {
  color: #bfbfbf;
}

/* Messages container */
.dark_theme .chat-messages {
  background: #1f1f1f;
}

/* Sent (me) message bubble */
.dark_theme .message-wrapper.sent .message {
  background: #2e2e2e;
  border-color: #3a3a3a;
  color: #ffffff;
}

/* Received message bubble */
.dark_theme .message-wrapper.received .message {
  background: linear-gradient(135deg, #1b706f 0%, #156160 100%);
  color: #ffffff;
}

/* Attachments */
.dark_theme .file-icon-wrapper {
  background: #2e2e2e;
}

.dark_theme .file-icon-wrapper .file-icon {
  color: #85d1cf;
}

/* Timestamp */
.dark_theme .timestamp {
  color: #cfcfcf !important;
}

/* Input Section */
.dark_theme .chat-input {
  background: #2a2a2a;
  border-top-color: #333;
}

.dark_theme .v-textarea textarea {
  color: #ffffff !important;
  background: #2e2e2e !important;
}

.dark_theme .v-input__control {
  background: #2e2e2e !important;
}

/* File preview section */
.dark_theme .file-preview-section {
  background: #2a2a2a;
  border-top-color: #333;
}

.dark_theme .file-preview-item {
  background: #3a3a3a;
  border-color: #4a4a4a;
  color: #ffffff;
}
.dark_theme .order-number {
  color: #ffffff !important;
}
.dark_theme .message-wrapper.sent .timestamp {
  color: #ffffff !important;
}
.theme--light.v-btn.v-btn--disabled.v-btn--has-bg[data-v-631411bf]{
  background-color: #1b706f !important;
}
</style>
