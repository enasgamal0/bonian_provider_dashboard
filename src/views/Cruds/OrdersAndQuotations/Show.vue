<template>
  <div class="crud_form_wrapper">
    <!-- Start:: Title -->
    <div
      class="form_title_wrapper d-flex align-items-center justify-content-between"
    >
      <h4>{{ $t("SIDENAV.orders.show") }}</h4>
      <v-btn @click="$router.go(-1)" style="color: #1b706f">
        <i class="fas fa-backward"></i>
      </v-btn>
    </div>
    <!-- End:: Title -->

    <!-- Start:: Loader -->
    <div v-if="isWaitingRequest" class="text-center my-10">
      <v-progress-circular indeterminate color="#1b706f"></v-progress-circular>
    </div>
    <!-- End:: Loader -->

    <!-- Start:: Single Step Form Content -->
    <div v-else class="single_step_form_content_wrapper">
      <form>
        <div class="row">
          <!-- Basic info -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.serialNumber')"
            v-model.trim="data.serial_number"
            disabled
          />
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.subCategory')"
            v-model.trim="data.sub_category"
            disabled
          />

          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.city')"
            v-model.trim="data.city"
            disabled
          />
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.district')"
            v-model.trim="data.district"
            disabled
          />

          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.date')"
            v-model.trim="data.date"
            disabled
          />
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.status')"
            v-model.trim="data.status_trans"
            disabled
          />

          <base-input
            col="12"
            type="textarea"
            :placeholder="$t('PLACEHOLDERS.note')"
            v-model.trim="data.note"
            disabled
          />

          <!-- Attachments -->
          <div class="col-12 mt-4">
            <h5 class="mb-2">{{ $t("PLACEHOLDERS.attachments") }}</h5>
            <div class="d-flex flex-wrap gap-3">
              <a
                v-for="(file, index) in data.attachments"
                :key="index"
                :href="file.attachment"
                target="_blank"
                class="attachment_item"
              >
                <img
                  v-if="isImage(file.attachment)"
                  :src="file.attachment"
                  alt="attachment"
                  width="100"
                  height="100"
                  class="rounded border"
                />
                <div
                  v-else
                  class="pdf-placeholder border rounded p-2 text-center"
                >
                  <i class="fas fa-file-pdf fa-2x text-danger"></i>
                  <p class="m-0 small">PDF</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Offers -->
          <div class="col-12 mt-5">
            <h5 class="mb-3">{{ $t("PLACEHOLDERS.offers") }}</h5>

            <div v-if="!data.offers?.length" class="text-muted">
              {{ $t("PLACEHOLDERS.noOffers") }}
            </div>

            <div
              v-for="offer in data.offers"
              :key="offer.id"
              class="offer_card border rounded p-3 mb-4"
            >
              <h6 class="fw-bold mb-2">{{ offer.provider_name }}</h6>
              <p class="mb-1">
                <strong>{{ $t("PLACEHOLDERS.status") }}:</strong>
                {{ offer.status_trans }}
              </p>
              <p class="mb-1">
                <strong>{{ $t("PLACEHOLDERS.totalPrice") }}:</strong>
                {{ offer.total_price }}
              </p>
              <p class="mb-3">
                <strong>{{ $t("PLACEHOLDERS.countDays") }}:</strong>
                {{ offer.count_days }}
              </p>

              <!-- Offer attachments -->
              <div v-if="offer.attachments?.length" class="mb-3">
                <h6 class="small mb-1">{{ $t("PLACEHOLDERS.attachments") }}</h6>
                <div class="d-flex flex-wrap gap-2">
                  <a
                    v-for="(file, i) in offer.attachments"
                    :key="i"
                    :href="file.attachment"
                    target="_blank"
                  >
                    <i class="fas fa-paperclip"></i>
                    {{ $t("PLACEHOLDERS.file") }} {{ i + 1 }}
                  </a>
                </div>
              </div>

              <!-- Offer products -->
              <div v-if="offer.offerProducts?.length">
                <h6 class="small mb-2">{{ $t("PLACEHOLDERS.products") }}</h6>
                <table class="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{{ $t("PLACEHOLDERS.name") }}</th>
                      <th>{{ $t("PLACEHOLDERS.quantity") }}</th>
                      <th>{{ $t("PLACEHOLDERS.price") }}</th>
                      <th>{{ $t("PLACEHOLDERS.totalPrice") }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, i) in offer.offerProducts" :key="p.id">
                      <td>{{ i + 1 }}</td>
                      <td>{{ p.name }}</td>
                      <td>{{ p.quantity }}</td>
                      <td>{{ p.price }}</td>
                      <td>{{ p.total_price }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <!-- END:: Single Step Form Content -->
  </div>
</template>

<script>
export default {
  name: "ShowOrder",

  data() {
    return {
      isWaitingRequest: false,
      data: {
        serial_number: null,
        sub_category: null,
        city: null,
        district: null,
        date: null,
        note: null,
        status_trans: null,
        attachments: [],
        offers: [],
      },
    };
  },

  methods: {
    isImage(url) {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    },

    async showOrder() {
      this.isWaitingRequest = true;
      try {
        const res = await this.$axios.get(`/orders/${this.$route.params.id}`);
        this.data = res.data.data.orders;
      } catch (err) {
        console.error(err?.response?.data?.message);
      } finally {
        this.isWaitingRequest = false;
      }
    },
  },

  created() {
    this.showOrder();
  },
};
</script>

<style scoped>
.attachment_item img {
  object-fit: cover;
}
.pdf-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* .offer_card {
  background-color: #fafafa;
} */
</style>
