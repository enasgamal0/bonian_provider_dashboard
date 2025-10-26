<template>
  <div class="crud_form_wrapper">
    <!-- Start:: Title -->
    <div class="form_title_wrapper">
      <h4>{{ $t("PLACEHOLDERS.orderDetails") }}</h4>
    </div>
    <div class="col-12 text-end">
      <v-btn @click="$router.go(-1)" style="color: #1b706f">
        <i class="fas fa-backward"></i>
      </v-btn>
    </div>
    <!-- End:: Title -->
    <!-- Start:: Order Details Content -->
    <div class="single_step_form_content_wrapper">
      <form @submit.prevent="validateFormInputs">
        <div class="row">
          <div class="col-md-6">
            <base-input
              col="12"
              type="text"
              :placeholder="$t('PLACEHOLDERS.serialNumber')"
              v-model="data.serial_number"
              disabled
            />
          </div>
          <div class="col-md-6">
            <base-input
              col="12"
              type="text"
              :placeholder="$t('PLACEHOLDERS.executionDate')"
              v-model="data.date"
              disabled
            />
          </div>
          <div class="col-md-6">
            <base-input
              col="12"
              type="text"
              :placeholder="$t('PLACEHOLDERS.city')"
              v-model="data.city"
              disabled
            />
          </div>
          <div class="col-md-6" v-if="data.district">
            <base-input
              col="12"
              type="text"
              :placeholder="$t('PLACEHOLDERS.district')"
              v-model="data.district"
              disabled
            />
          </div>
          <div class="col-md-6">
            <base-input
              col="12"
              type="text"
              :placeholder="$t('PLACEHOLDERS.subCategory')"
              v-model="data.sub_category"
              disabled
            />
          </div>
          <div class="col-12" v-if="data.questions && data.questions.length">
            <h5 class="section-title">
              {{ $t("PLACEHOLDERS.questionsAndAnswers") }}
            </h5>
            <div
              v-for="(question, index) in data.questions"
              :key="index"
              class="question-item p-3"
            >
              <div class="row">
                <div class="col-md-6">
                  <label class="form-label fw-bold">{{
                    $t("PLACEHOLDERS.question")
                  }}</label>
                  <p class="answer-text">{{ question.question }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">{{
                    $t("PLACEHOLDERS.answer")
                  }}</label>
                  <p class="answer-text">{{ question.answer }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12" v-if="data.note">
            <base-input
              col="12"
              type="textarea"
              :placeholder="$t('PLACEHOLDERS.notes')"
              v-model="data.note"
              disabled
            />
          </div>
          <div
            class="col-12 mt-4"
            v-if="data.attachments && data.attachments.length"
          >
            <h6
              class="section-title mb-5"
              style="color: #1b706f; font-size: 16px"
            >
              {{ $t("PLACEHOLDERS.attachments") }}
            </h6>
            <div class="attachments-grid">
              <div
                v-for="(attachment, index) in data.attachments"
                :key="index"
                class="attachment-item m-3"
                style="cursor: pointer"
              >
                <img
                  :src="attachment.attachment"
                  :alt="'Attachment ' + (index + 1)"
                  style="max-height: 200px; max-width: 200px"
                  @click="openImagePreview(attachment.attachment)"
                />
              </div>
            </div>
          </div>

          <!-- Conditional Button Based on chat_before -->
          <!-- <div class="col-12 mt-4 text-center">
            <v-btn
              v-if="!data.chat_before"
              @click="showPaymentDialog = true"
              color="#1b706f"
              size="large"
              elevation="2"
              class="px-8 py-6 rounded-lg"
              style="font-weight: 600; letter-spacing: 0.5px; color: white;"
            >
              <i class="fas fa-user-circle me-2"></i>
              {{ $t("PLACEHOLDERS.viewUserDetails") }}
            </v-btn>
            
            <v-btn
              v-else
              @click="continueChatWithUser"
              color="#1b706f"
              size="large"
              elevation="2"
              class="px-8 py-6 rounded-lg"
              style="font-weight: 600; letter-spacing: 0.5px; color: white;"
            >
              <i class="fas fa-comments me-2"></i>
              {{ $t("PLACEHOLDERS.continueChat") }}
            </v-btn>
          </div> -->

          <div class="col-12 mt-3 text-center">
            <a :href="'/orders/create/' + id">
              <v-btn
                color="#1b706f"
                size="large"
                elevation="2"
                variant="outlined"
                class="px-8 py-6 rounded-lg"
                style="font-weight: 600; letter-spacing: 0.5px; color: white"
              >
                {{ $t("BUTTONS.send_offer") }}
              </v-btn>
            </a>
          </div>
        </div>
      </form>
    </div>
    <!-- End:: Order Details Content -->

    <!-- Start:: Payment Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="550" style="z-index: 9999">
      <v-card class="rounded-xl" elevation="8">
        <v-card-text class="py-6 px-5">
          <div class="text-center mb-4">
            <div
              class="payment-icon-wrapper mx-auto"
              style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #e8f5f5 0%, #d4eceb 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(27, 112, 111, 0.15);
              "
            >
              <i
                class="fas fa-wallet"
                style="font-size: 36px; color: #1b706f"
              ></i>
            </div>
          </div>

          <p
            class="text-center payment-message mb-4"
            style="font-size: 16px; line-height: 1.6;"
          >
            {{
              $t("PLACEHOLDERS.paymentMessage", {
                amount: paymentAmount,
                amountPoints: paymentAmountPoints,
              })
            }}
          </p>
          <p>
            *{{
              $t("PLACEHOLDERS.your_current_pointes_number", {
                points: myPoints,
              })
            }}
          </p>

          <div class="payment-options mt-5">
            <!-- <v-btn
              block
              size="x-large"
              elevation="2"
              class="mb-3 rounded-lg"
              style="background: linear-gradient(135deg, #1b706f 0%, #15605f 100%); color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: none; font-size: 15px;"
              @click="viewProfile"
            >
              <i class="fas fa-user-check me-2"></i>
              {{ $t("PLACEHOLDERS.viewProfile") }}
            </v-btn> -->

            <v-btn
              block
              size="x-large"
              elevation="2"
              class="mb-3 rounded-lg"
              style="
                background: linear-gradient(135deg, #1b706f 0%, #15605f 100%);
                color: white;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: none;
                font-size: 15px;
              "
              @click="openChat"
            >
              <!-- <i class="fas fa-comments me-2"></i> -->
              {{ $t("PLACEHOLDERS.pay") }}
            </v-btn>

            <v-btn
              block
              size="x-large"
              elevation="2"
              class="mb-3 rounded-lg"
              style="
                background: linear-gradient(135deg, #1b706f 0%, #15605f 100%);
                color: white;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: none;
                font-size: 15px;
              "
              @click="openChat"
              :disabled="myPoints < paymentAmountPoints"
            >
              <!-- <i class="fas fa-comments me-2"></i> -->
              {{ $t("PLACEHOLDERS.points_pay") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- End:: Payment Dialog -->

    <!-- Start:: Image Preview Dialog -->
    <v-dialog v-model="imagePreviewDialog" max-width="900">
      <v-card class="rounded-xl" elevation="8">
        <v-card-actions
          class="justify-end pa-3"
          style="background-color: #f5f5f5"
        >
          <v-btn
            icon
            @click="imagePreviewDialog = false"
            variant="text"
            size="large"
            style="color: #1b706f"
          >
            <i class="fas fa-times" style="font-size: 20px"></i>
          </v-btn>
        </v-card-actions>
        <v-card-text class="pa-0">
          <img
            :src="previewImageUrl"
            style="width: 100%; height: auto; display: block"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- End:: Image Preview Dialog -->

    <!-- Floating Chat Button -->
<v-btn
  v-if="data.user"
  icon
  elevation="8"
  :class="['floating-chat-btn', lang === 'ar' ? 'left' : 'right']"
  @click="toggleChatDialog"
>
  <div class="rings-wrapper">
    <span class="ring ring1"></span>
    <!-- <span class="ring ring2"></span> -->
    <!-- <span class="ring ring3"></span> -->
    <i class="fas fa-comments icon"></i>
  </div>
</v-btn>

<!-- Add overlay to close dialog on click outside -->
<div
  v-if="imagePreviewDialog || showPaymentDialog"
  class="overlay"
  @click="closeDialogs"
></div>

  </div>
</template>

<script>
export default {
  name: "ShowOrderDetails",
  data() {
    return {
      lang: this.$i18n.locale,
      // Start:: Loader Control Data
      isWaitingRequest: false,
      // End:: Loader Control Data
      // Start:: Dialog Control
      showPaymentDialog: false,
      imagePreviewDialog: false,
      previewImageUrl: null,
      // End:: Dialog Control
      // Start:: Payment Data
      paymentAmount: 0,
      // End:: Payment Data
      // Start:: Order Data
      data: {
        serial_number: null,
        date: null,
        note: null,
        city: null,
        district: null,
        sub_category: null,
        questions: [],
        attachments: [],
        user: null,
        chat_before: false,
      },
      // End:: Order Data
      id: this.$route.params?.id,
      myPoints: 0,
      paymentAmountPoints: 0,
    };
  },
  methods: {
    toggleChatDialog() {
    this.showPaymentDialog = !this.showPaymentDialog;
  },
  closeDialogs() {
    this.showPaymentDialog = false;
    this.imagePreviewDialog = false;
  },
    handleChatButton() {
      if (this.data.chat_before) {
        this.continueChatWithUser();
      } else {
        this.showPaymentDialog = true;
      }
    },

    // Start:: Fetch Order Details
    async fetchOrderDetails() {
      this.isWaitingRequest = true;
      try {
        const res = await this.$axios({
          method: "GET",
          url: `orders/show/${this.$route.params.id}`,
        });
        const orderData = res.data.data.order;
        this.data.serial_number = orderData.serial_number;
        this.data.date = orderData.date;
        this.data.note = orderData.note;
        this.data.city = orderData.city?.name;
        this.data.district = orderData.district?.name;
        this.data.sub_category = orderData.sub_category?.name;
        this.data.questions = orderData.questions || [];
        this.data.attachments = orderData.attachments || [];
        this.data.user = orderData.user;
        this.data.chat_before = orderData.chat_before || false;
      } catch (error) {
        console.error("Error fetching order details:", error);
        this.$toast.error(
          error.response?.data?.message || this.$t("MESSAGES.errorFetchingData")
        );
      } finally {
        this.isWaitingRequest = false;
      }
    },
    // End:: Fetch Order Details

    // Start:: Fetch Payment Amount
    async fetchPaymentAmount() {
      try {
        const res = await this.$axios({
          method: "GET",
          url: "settings",
          params: { key: "dashboard_setting" },
        });
        this.paymentAmount = res.data.data.data[0]?.value?.Payment_amount || 0;
        this.paymentAmountPoints =
          res.data.data.data[0]?.value?.Payment_amount ||
          0 * res.data.data.data[0]?.value?.Points_value_per_riyal ||
          0;
      } catch (error) {
        console.error("Error fetching payment amount:", error);
        this.paymentAmount = 0;
        this.paymentAmountPoints = 0;
      }
    },
    // End:: Fetch Payment Amount

    // Start:: Fetch My Points
    async fetchMyPoints() {
      try {
        const res = await this.$axios({
          method: "GET",
          url: "auth/profile",
        });
        this.myPoints = res.data.data?.user?.points;
      } catch (error) {
        console.error("Error fetching my points:", error);
        this.myPoints = 0;
      }
    },
    // End:: Fetch My Points

    // Start:: View Profile (Navigate to Payment)
    viewProfile() {
      this.$router.push({
        name: "Payment",
        params: {
          orderId: this.$route.params.id,
          action: "profile",
        },
      });
    },
    // End:: View Profile

    // Start:: Open Chat (Navigate to Payment)
    openChat() {
      this.$router.push({
        name: "Payment",
        params: {
          orderId: this.$route.params.id,
          action: "chat",
        },
      });
    },
    // End:: Open Chat

    // Start:: Continue Chat with User
    continueChatWithUser() {
      this.$router.push({
        name: "ChatShow",
        params: {
          orderId: this.$route.params.id,
          userId: this.data.user?.id,
        },
      });
    },
    // End:: Continue Chat with User

    // Start:: Open Image Preview
    openImagePreview(imageUrl) {
      this.previewImageUrl = imageUrl;
      this.imagePreviewDialog = true;
    },
    // End:: Open Image Preview
  },
  created() {
    // Start:: Fire Methods
    this.fetchOrderDetails();
    this.fetchPaymentAmount();
    this.fetchMyPoints();
    // End:: Fire Methods
  },
};
</script>

<style scoped>
.floating-chat-btn {
  position: fixed;
  bottom: 90px;
  z-index: 9999;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1b706f 0%, #15605f 100%);
  box-shadow: 0 4px 12px rgba(27, 112, 111, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.floating-chat-btn.left {
  left: 60px;
}

.floating-chat-btn.right {
  right: 60px;
}

.floating-chat-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(27, 112, 111, 0.4);
}

/* Rings */
.rings-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border: 2px solid rgba(27, 112, 111, 0.5);
  border-top-color: #1b706f; /* <-- highlight one side */
  border-radius: 50%;
  animation: spin 3s linear infinite;
}

.ring1 { width: 90px; height: 90px; animation-duration: 3s; }
.ring2 { width: 110px; height: 110px; animation-duration: 4s; }
.ring3 { width: 130px; height: 130px; animation-duration: 5s; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.rings-wrapper .icon {
  position: relative;
  font-size: 22px;
  color: white;
  z-index: 2;
}

/* Overlay to detect outside clicks */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: transparent;
}


.question-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #1b706f;
}

.answer-text {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.attachments-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.attachment-item img {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.attachment-item img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.theme--light.v-btn.v-btn--disabled.v-btn--has-bg{
  color: black !important;
  cursor: not-allowed !important;
}
</style>
