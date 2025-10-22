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

          <div class="col-12 mt-4 text-center">
            <v-btn
              @click="showPaymentDialog = true"
              color="#1b706f"
              size="large"
              class="view-user-btn"
            >
              <i class="fas fa-user-circle me-2"></i>
              {{ $t("PLACEHOLDERS.viewUserDetails") }}
            </v-btn>
          </div>
          <div class="col-12 mt-4 text-center">
            <a :href="'/orders/create/' + id">
            <v-btn
              color="#1b706f"
              size="large"
              class="view-user-btn"
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
    <v-dialog v-model="showPaymentDialog" max-width="500">
      <v-card>
        <v-card-title
          class="text-h5 text-center py-4"
          style="background-color: #1b706f; color: white"
        >
          {{ $t("PLACEHOLDERS.paymentRequired") }}
        </v-card-title>

        <v-card-text class="py-5 px-4">
          <div class="text-center mb-4">
            <i
              class="fas fa-info-circle"
              style="font-size: 48px; color: #1b706f"
            ></i>
          </div>
          <p class="text-center payment-message">
            {{ $t("PLACEHOLDERS.paymentMessage", { amount: paymentAmount }) }}
          </p>

          <div class="payment-options mt-4">
            <v-btn
              block
              size="large"
              color="#1b706f"
              class="mb-2"
              @click="viewProfile"
            >
              <i class="fas fa-user me-2"></i>
              {{ $t("PLACEHOLDERS.viewProfile") }}
            </v-btn>

            <v-btn
              block
              size="large"
              color="#1b706f"
              variant="outlined"
              @click="openChat"
            >
              <i class="fas fa-comments me-2"></i>
              {{ $t("PLACEHOLDERS.openChat") }}
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn
            block
            size="large"
            @click="showPaymentDialog = false"
            variant="text"
          >
            {{ $t("PLACEHOLDERS.cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- End:: Payment Dialog -->

    <!-- Start:: Image Preview Dialog -->
    <v-dialog v-model="imagePreviewDialog" max-width="800">
      <v-card>
        <v-card-actions class="justify-end pa-2">
          <!-- <v-btn icon @click="imagePreviewDialog = false" variant="text">
            <i class="fas fa-times"></i>
          </v-btn> -->
        </v-card-actions>
        <v-card-text class="pa-0">
          <img :src="previewImageUrl" style="width: 100%; height: auto" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- End:: Image Preview Dialog -->
  </div>
</template>

<script>
export default {
  name: "ShowOrderDetails",

  data() {
    return {
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
      },
      // End:: Order Data
      id: this.$route.params?.id,
    };
  },

  methods: {
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
          url: "settings/payment-amount",
        });
        this.paymentAmount = res.data.data.amount;
      } catch (error) {
        console.error("Error fetching payment amount:", error);
        this.paymentAmount = 0;
      }
    },
    // End:: Fetch Payment Amount

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
    // End:: Fire Methods
  },
};
</script>
