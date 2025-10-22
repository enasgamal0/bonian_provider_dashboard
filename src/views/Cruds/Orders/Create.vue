<template>
  <div class="crud_form_wrapper">
    <!-- Start:: Title -->
    <div class="form_title_wrapper">
      <h4>{{ $t("SIDENAV.sendOffer") }}</h4>
    </div>
    <div class="col-12 text-end">
      <v-btn @click="$router.go(-1)" style="color: #1b706f">
        <i class="fas fa-backward"></i>
      </v-btn>
    </div>
    <!-- End:: Title -->

    <!-- Start:: Single Step Form Content -->
    <div class="single_step_form_content_wrapper">
      <form @submit.prevent="validateFormInputs">
        <div class="row">
          <!-- Start:: Products and Services Section -->
          <div class="col-12 mb-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <h5>{{ $t("LABELS.productsAndServices") }}</h5>
              <button
                type="button"
                class="btn btn-success"
                style="background-color: #1b706f"
                @click.prevent="addProductRow()"
              >
                {{ $t("BUTTONS.add") }}
              </button>
            </div>

            <!-- Products Table -->
            <div
              v-if="data.product_offers?.length > 0"
              class="table-responsive"
            >
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>{{ $t("LABELS.productOrServiceName") }}</th>
                    <th>{{ $t("LABELS.quantity") }}</th>
                    <th>{{ $t("LABELS.unitPrice") }}</th>
                    <th>{{ $t("LABELS.totalPrice") }}</th>
                    <th>{{ $t("LABELS.actions") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(product, index) in data.product_offers"
                    :key="index"
                  >
                    <td>
                      <input
                        type="text"
                        class="form-control"
                        v-model="product.name"
                        :placeholder="$t('PLACEHOLDERS.productOrServiceName')"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="product.quantity"
                        :placeholder="$t('PLACEHOLDERS.quantity')"
                        min="0"
                        @input="calculateRowTotal(index)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="product.price"
                        :placeholder="$t('PLACEHOLDERS.unitPrice')"
                        min="0"
                        step="0.01"
                        @input="calculateRowTotal(index)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="product.total"
                        :placeholder="$t('PLACEHOLDERS.totalPrice')"
                        min="0"
                        step="0.01"
                        readonly
                      />
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon
                        color="error"
                        small
                        @click="removeProductRow(index)"
                      >
                        <i class="fas fa-trash"></i>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- End:: Products and Services Section -->

          <!-- Start:: Expected Duration Input -->
          <base-input
            col="6"
            type="number"
            :placeholder="$t('PLACEHOLDERS.expectedDuration')"
            :label="$t('LABELS.expectedDurationDays')"
            v-model.number="data.count_days"
            required
            min="1"
          />
          <!-- End:: Expected Duration Input -->

          <!-- Start:: Total Price Input -->
          <base-input
            col="6"
            type="number"
            :placeholder="$t('PLACEHOLDERS.totalOfferPrice')"
            :label="$t('LABELS.totalOfferPriceSAR')"
            v-model.number="data.total_price"
            required
            min="0"
            step="0.01"
            :readonly="data.product_offers.length > 0"
          />
          <!-- End:: Total Price Input -->

          <!-- Start:: Files Upload -->
          <div class="col-12 mb-4">
            <label class="form-label" style="color: #1b706f; font-size: 16px">{{
              $t("LABELS.attachments")
            }}</label>
            <input
              type="file"
              class="form-control"
              multiple
              accept="image/*,.pdf,.xlsx,.xls"
              @change="handleFilesSelected"
              ref="fileInput"
            />
            <small class="text-muted">
              {{ $t("MESSAGES.acceptedFormats") }}:
              {{ $t("MESSAGES.imagesPdfExcel") }}
            </small>

            <!-- Display Selected Files -->
            <div v-if="data.attachments.length > 0" class="mt-3">
              <div
                v-for="(file, index) in data.attachments"
                :key="index"
                class="d-flex align-center justify-space-between p-2 mb-2 border rounded"
              >
                <span>{{ file.name }}</span>
                <v-btn icon small color="error" @click="removeFile(index)">
                  <i class="fas fa-times"></i>
                </v-btn>
              </div>
            </div>
          </div>
          <!-- End:: Files Upload -->

          <!-- Start:: Submit Button Wrapper -->
          <div class="btn_wrapper">
            <base-button
              class="mt-2"
              styleType="primary_btn"
              :btnText="$t('BUTTONS.send')"
              :isLoading="isWaitingRequest"
              :disabled="isWaitingRequest"
            />
          </div>
          <!-- End:: Submit Button Wrapper -->
        </div>
      </form>
    </div>
    <!-- END:: Single Step Form Content -->
  </div>
</template>

<script>
export default {
  name: "SendOffer",

  data() {
    return {
      // Start:: Loader Control Data
      isWaitingRequest: false,
      // End:: Loader Control Data

      // Start:: Data Collection To Send
      data: {
        order_id: null,
        product_offers: [],
        count_days: null,
        total_price: null,
        attachments: [],
      },
      // End:: Data Collection To Send
    };
  },

  mounted() {
    // Get order_id from route params or query
    this.data.order_id = this.$route.params.id || this.$route.query.order_id;
  },

  methods: {
    // Add new product row
    addProductRow() {
      console.log("test");
      this.data.product_offers?.push({
        name: "",
        quantity: null,
        price: null,
        total: null,
      });
    },

    // Remove product row
    removeProductRow(index) {
      this.data.product_offers?.splice(index, 1);
      this.calculateTotalPrice();
    },

    // Calculate row total when quantity or price changes
    calculateRowTotal(index) {
      const product = this.data.product_offers[index];
      if (product.quantity && product.price) {
        product.total = product.quantity * product.price;
      } else {
        product.total = null;
      }
      this.calculateTotalPrice();
    },

    // Calculate total offer price from all products
    calculateTotalPrice() {
      if (this.data.product_offers.length > 0) {
        let total = 0;
        this.data.product_offers.forEach((product) => {
          if (product.total) {
            total += parseFloat(product.total);
          }
        });
        this.data.total_price = total > 0 ? total : null;
      }
    },

    // Handle files selection
    handleFilesSelected(event) {
      const files = Array.from(event.target.files);
      this.data.attachments.push(...files);
    },

    // Remove file
    removeFile(index) {
      this.data.attachments.splice(index, 1);
      // Clear file input
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    // Start:: validate Form Inputs
    validateFormInputs() {
      // Check if at least products table has data OR attachments are uploaded
      const hasProducts =
        this.data.product_offers.length > 0 &&
        this.data.product_offers.some((p) => p.name && p.quantity && p.price);
      const hasAttachments = this.data.attachments.length > 0;

      if (!hasProducts && !hasAttachments) {
        this.$message.error(this.$t("MESSAGES.mustAddProductsOrAttachments"));
        return;
      }

      this.isWaitingRequest = true;
      this.submitForm();
    },
    // End:: validate Form Inputs

    // Start:: Submit Form
    async submitForm() {
      const REQUEST_DATA = new FormData();

      // Append order_id
      REQUEST_DATA.append("order_id", this.data.order_id);

      // Append product offers
      this.data.product_offers.forEach((product, index) => {
        if (product.name) {
          REQUEST_DATA.append(`product_offers[${index}][name]`, product.name);
        }
        if (product.quantity) {
          REQUEST_DATA.append(
            `product_offers[${index}][quantity]`,
            product.quantity
          );
        }
        if (product.price) {
          REQUEST_DATA.append(`product_offers[${index}][price]`, product.price);
        }
        if (product.total) {
          REQUEST_DATA.append(`product_offers[${index}][total]`, product.total);
        }
      });

      // Append count_days
      if (this.data.count_days) {
        REQUEST_DATA.append("count_days", this.data.count_days);
      }

      // Append total_price
      if (this.data.total_price) {
        REQUEST_DATA.append("total_price", this.data.total_price);
      }

      // Append attachments
      this.data.attachments?.forEach((file, index) => {
        REQUEST_DATA.append(`attachments[${index}]`, file);
      });

      try {
        await this.$axios({
          method: "POST",
          url: `orders/send-offer`,
          data: REQUEST_DATA,
        });
        this.isWaitingRequest = false;
        this.$message.success(this.$t("MESSAGES.offerSentSuccessfully"));
        this.$router.push({ path: "/orders/all" });
      } catch (error) {
        this.isWaitingRequest = false;
        this.$message.error(error.response.data.message);
      }
    },
    // End:: Submit Form
  },
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
  border-radius: 15px;
}

.table {
  min-width: 800px;
}

.table th {
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-control:focus {
  outline: none;
  border-color: #1b706f;
}

.form-control:read-only {
  background-color: #f5f5f5;
}
</style>
