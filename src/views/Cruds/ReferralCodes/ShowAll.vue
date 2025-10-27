<template>
  <div class="show_all_content_wrapper">
    <!-- Start:: Main Section -->
    <main>
      <!-- Start:: Referral Code Card -->
      <div class="referral_code_card mb-4">
        <div class="card_header">
          <h5 class="text-white">{{ $t("PLACEHOLDERS.myReferralCode") }}</h5>
        </div>
        <div class="card_body">
          <div class="row align-items-center">
            <!-- Referral Code Display -->
            <div class="col-md-6">
              <div class="code_display_wrapper">
                <label class="form-label">{{
                  $t("PLACEHOLDERS.referralCode")
                }}</label>
                <div class="code_box">{{ data }}
                  <input
                    type="text"
                    :value="referralCodeData.code"
                    readonly
                    class="form-control"
                    id="referralCodeInput"
                  />
                  <button
                    class="copy_btn"
                    @click="copyReferralCode"
                    :title="$t('PLACEHOLDERS.copy')"
                  >
                    <i :class="codeCopied ? 'fal fa-check' : 'fal fa-copy'"></i>
                  </button>
                </div>
                <small class="mt-2 d-block">
                  {{ $t("PLACEHOLDERS.shareCodeWithOthers") }}
                </small>
              </div>
            </div>

            <!-- Points Summary -->
            <div class="col-md-6">
              <div class="points_summary">
                <div class="summary_item">
                  <i class="fal fa-star text-warning fs-4"></i>
                  <div class="summary_text">
                    <span class="label">{{
                      $t("PLACEHOLDERS.totalPoints")
                    }}</span>
                    <span class="value">{{
                      referralCodeData.total_points || 0
                    }}</span>
                  </div>
                </div>
                <div class="summary_item mt-3">
                  <i class="fal fa-users text-primary fs-4"></i>
                  <div class="summary_text">
                    <span class="label">{{
                      $t("PLACEHOLDERS.totalReferrals")
                    }}</span>
                    <span class="value">{{
                      referralCodeData.total_referrals || 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End:: Referral Code Card -->

      <!--  =========== Start:: Table Title =========== -->
      <div class="table_title_wrapper">
        <div class="title_text_wrapper">
          <h5>{{ $t("PLACEHOLDERS.myReferrals") }}</h5>
        </div>
      </div>
      <!--  =========== End:: Table Title =========== -->

      <!--  =========== Start:: Data Table =========== -->
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
        <!-- Start:: No Data State -->
        <template v-slot:no-data>
          {{ $t("TABLES.noData") }}
        </template>
        <!-- End:: No Data State -->

        <!-- Serial Number -->
        <template v-slot:[`item.id`]="{ item, index }">
          <p class="blue-grey--text text--darken-1 fs-3" v-if="!item.id">-</p>
          <p v-else>
            {{
              (paginations.current_page - 1 || 0) * (paginations.items_per_page || 0) +
              index +
              1
            }}
          </p>
        </template>

        <!-- Joined Provider Name -->
        <template v-slot:[`item.joined_provider.name`]="{ item }">
          <p v-if="item.joined_provider && item.joined_provider.name">
            {{ item.joined_provider.name }}
          </p>
          <p v-else class="blue-grey--text text--darken-1">-</p>
        </template>

        <!-- Joining Date -->
        <template v-slot:[`item.created_at`]="{ item }">
          <p v-if="item.created_at">{{ item.created_at }}</p>
          <p v-else class="blue-grey--text text--darken-1">-</p>
        </template>

        <!-- Points Earned -->
        <template v-slot:[`item.points`]="{ item }">
          <div class="points_badge">
            <i class="fal fa-star text-warning"></i>
            <span>{{ item.points || 0 }}</span>
          </div>
        </template>

        <!-- Start:: Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="actions">
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>{{ $t("BUTTONS.show") }}</span>
              </template>
              <button class="btn_show" @click="showItem(item)">
                <i class="fal fa-eye"></i>
              </button>
            </a-tooltip>
          </div>
        </template>
        <!-- End:: Actions -->

        <!-- ======================== Start:: Dialogs ======================== -->
        <template v-slot:top>
          <!-- Start:: Details Modal -->
          <v-dialog v-model="dialogDetails" max-width="600px">
            <v-card v-if="selectedItem">
              <v-card-title class="text-h5 justify-center">
                {{ $t("PLACEHOLDERS.referralDetails") }}
              </v-card-title>
              <v-card-text>
                <div class="details_content">
                  <div class="detail_row">
                    <span class="detail_label"
                      >{{
                        $t("PLACEHOLDERS.joined_provider_name_referral")
                      }}:</span
                    >
                    <span class="detail_value">{{
                      selectedItem.joined_provider?.name || "-"
                    }}</span>
                  </div>
                  <div class="detail_row">
                    <span class="detail_label"
                      >{{ $t("PLACEHOLDERS.joiningDate") }}:</span
                    >
                    <span class="detail_value">{{
                      selectedItem.created_at || "-"
                    }}</span>
                  </div>
                  <div
                    class="detail_row"
                    v-if="selectedItem.joined_provider?.email"
                  >
                    <span class="detail_label"
                      >{{ $t("PLACEHOLDERS.email") }}:</span
                    >
                    <span class="detail_value">{{
                      selectedItem.joined_provider.email
                    }}</span>
                  </div>
                  <div
                    class="detail_row"
                    v-if="selectedItem.joined_provider?.phone"
                  >
                    <span class="detail_label"
                      >{{ $t("PLACEHOLDERS.phone") }}:</span
                    >
                    <span class="detail_value">{{
                      selectedItem.joined_provider.phone
                    }}</span>
                  </div>
                  <div class="detail_row">
                    <span class="detail_label"
                      >{{ $t("PLACEHOLDERS.earned_points") }}:</span
                    >
                    <span class="detail_value">
                      <div class="points_badge">
                        <i class="fal fa-star text-warning"></i>
                        <span>{{ selectedItem.points || 0 }}</span>
                      </div>
                    </span>
                  </div>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="modal_cancel_btn" @click="dialogDetails = false">
                  {{ $t("BUTTONS.close") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- End:: Details Modal -->
        </template>
        <!-- ======================== End:: Dialogs ======================== -->
      </v-data-table>
      <!--  =========== End:: Data Table =========== -->
    </main>
    <!-- End:: Main Section -->

    <!-- Start:: Pagination -->
    <template>
      <div class="pagination_container text-center mt-3 mb-0">
        <v-pagination
          class="py-0"
          square
          v-model="paginations.current_page"
          :length="paginations.last_page"
          :total-visible="6"
          @input="updateRouterQueryParam($event)"
          :prev-icon="
            getAppLocale == 'ar' ? 'fal fa-angle-right' : 'fal fa-angle-left'
          "
          :next-icon="
            getAppLocale == 'ar' ? 'fal fa-angle-left' : 'fal fa-angle-right'
          "
        />
      </div>
    </template>
    <!-- End:: Pagination -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ProviderReferralCodeView",

  computed: {
    ...mapGetters({
      getAppLocale: "AppLangModule/getAppLocale",
    }),
  },

  data() {
    return {
      // Start:: Loading Data
      loading: false,
      // End:: Loading Data

      // Start:: Referral Code Data
      referralCodeData: {
        code: "",
        total_points: 0,
        total_referrals: 0,
      },
      codeCopied: false,
      // End:: Referral Code Data

      // Start:: Table Data
      tableHeaders: [
        {
          text: this.$t("TABLES.Admins.serialNumber"),
          value: "id",
          align: "center",
          sortable: false,
        },
        {
          text: this.$t("PLACEHOLDERS.joined_provider_name_referral"),
          value: "joined_provider.name",
          sortable: false,
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.joiningDate"),
          value: "created_at",
          sortable: false,
          align: "center",
        },
        {
          text: this.$t("PLACEHOLDERS.earned_points"),
          value: "points",
          sortable: false,
          align: "center",
        },
        {
          text: this.$t("TABLES.Admins.actions"),
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      tableRows: [],
      // End:: Table Data

      // Start:: Dialogs Control Data
      dialogDetails: false,
      selectedItem: null,
      // End:: Dialogs Control Data

      // Start:: Pagination Data
      paginations: {
        current_page: 1,
        last_page: 1,
        items_per_page: 6,
      },
      // End:: Pagination Data
    };
  },

  watch: {
    // Start:: Page Query Param Watcher
    ["$route.query.page"]() {
      this.paginations.current_page = +this.$route.query.page;
      this.setTableRows();
    },
    // End:: Page Query Param Watcher
  },

  methods: {
    // Start:: Copy Referral Code
    async copyReferralCode() {
      try {
        const input = document.getElementById("referralCodeInput");
        input.select();
        document.execCommand("copy");

        this.codeCopied = true;
        this.$message.success(this.$t("PLACEHOLDERS.copiedSuccessfully"));

        setTimeout(() => {
          this.codeCopied = false;
        }, 2000);
      } catch (error) {
        this.$message.error(this.$t("PLACEHOLDERS.copyFailed"));
      }
    },
    // End:: Copy Referral Code

    // Start:: Get Referral Code Data
    // async getReferralCodeData() {
    //   try {
    //     let res = await this.$axios({
    //       method: "GET",
    //       url: "referral_provider-codes",
    //     });
    //     this.referralCodeData = {
    //       code: res.data.data.code,
    //       total_points: res.data.data.total_points || 0,
    //       total_referrals: res.data.data.total_referrals || 0,
    //     };
    //   } catch (error) {
    //     console.log(error.response?.data?.message);
    //     this.$message.error(
    //       error.response?.data?.message || this.$t("MESSAGES.somethingWrong")
    //     );
    //   }
    // },
    // End:: Get Referral Code Data

    // Start:: Set Table Rows
    updateRouterQueryParam(pagenationValue) {
      this.$router.push({
        query: {
          ...this.$route.query,
          page: pagenationValue,
        },
      });

      // Scroll To Screen's Top
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },

    async setTableRows() {
      this.loading = true;
      try {
        let res = await this.$axios({
          method: "GET",
          url: "referral_provider-codes",
          params: {
            page: this.paginations.current_page,
          },
        });
        this.loading = false;
        this.tableRows = res.data.data.referralProviderCodes;
        this.paginations.last_page = res.data.data?.meta?.last_page;
        this.paginations.items_per_page = res.data.data?.meta?.per_page;
        this.referralCodeData = {
          code: res.data.data?.referralProviderCodes[0]?.provider?.code,
          total_points: res.data?.data?.total_points || 0,
          total_referrals: res.data.data?.meta?.total || 0,
        };
      } catch (error) {
        this.loading = false;
        console.log(error.response?.data?.message);
        this.$message.error(
          error.response?.data?.message
        );
      }
    },
    // End:: Set Table Rows

    // Start:: Show Details
    showItem(item) {
      this.selectedItem = item;
      this.dialogDetails = true;
    },
    // End:: Show Details
  },

  created() {
    // Start:: Fire Methods
    if (this.$route.query.page) {
      this.paginations.current_page = +this.$route.query.page;
    }
    // this.getReferralCodeData();
    this.setTableRows();
    // End:: Fire Methods
  },
};
</script>

<style scoped>
.referral_code_card {
  /* background: #fff; */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header now uses your brand color */
.card_header {
  background: linear-gradient(135deg, #1b706f 0%, #155e5e 100%);
  padding: 20px;
  color: #fff;
}

.card_header h5 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card_body {
  padding: 30px;
}

.code_display_wrapper {
  margin-bottom: 20px;
}

.code_display_wrapper .form-label {
  font-weight: 600;
  /* color: #333; */
  margin-bottom: 10px;
  display: block;
}

/* Code input box + copy button */
.code_box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.code_box .form-control {
  flex: 1;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 12px;
  color: #1b706f;
}

/* Copy button now brand color */
.copy_btn {
  background: #1b706f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.copy_btn:hover {
  background: #155e5e;
  transform: translateY(-2px);
}

.points_summary {
  padding: 0 20px;
}

.summary_item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary_text {
  display: flex;
  flex-direction: column;
}

.summary_text .label {
  font-size: 0.9rem;
  /* color: #666; */
  font-weight: 500;
}

.summary_text .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1b706f;
}

/* Points badge subtle brand-tinted look */
.points_badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  /* background: #e0f2f1; */
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: 600;
  color: #1b706f;
  border: #1b706f solid 1px;
}

.details_content {
  padding: 20px 0;
}

.detail_row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail_row:last-child {
  border-bottom: none;
}

.detail_label {
  font-weight: 600;
  /* color: #666; */
}

.detail_value {
  font-weight: 500;
  /* color: #333; */
  text-align: right;
}

@media (max-width: 768px) {
  .card_body {
    padding: 20px;
  }

  .points_summary {
    padding: 20px 0 0 0;
  }

  .code_box .form-control {
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
}

</style>
