<template>
  <div class="crud_form_wrapper">
    <!-- Start:: Title -->
    <div class="form_title_wrapper">
      <h4>{{ $t("TITLES.editProvider") }}</h4>
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
          <!-- Start:: Image Upload Input -->
          <base-image-upload-input
            col="6"
            identifier="provider_image"
            :placeholder="$t('PLACEHOLDERS.personalImage')"
            @selectImage="selectImage"
            :preSelectedImage="data.image.path"
          />
          <!-- End:: Image Upload Input -->

          <!-- Start:: Commercial Image Upload Input -->
          <base-image-upload-input
            col="6"
            identifier="commercial_image"
            :placeholder="$t('PLACEHOLDERS.commercial_register_img')"
            @selectImage="selectCommercialImage"
            :preSelectedImage="data.commercial_image.path"
          />
          <!-- End:: Commercial Image Upload Input -->

          <!-- Start:: Previous Works Upload Input -->
          <div class="col-12 my-5">
            <base-multi-image-upload-input
              :urls="data.previous_works.urls"
              @onFileSelect="selectPreviousWorks"
              @onFileRemove="removePreviousWork"
            >
              {{ $t("PLACEHOLDERS.prev_imgs") }}
            </base-multi-image-upload-input>
          </div>
          <!-- End:: Previous Works Upload Input -->

          <!-- Start:: Name Input -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.name')"
            v-model.trim="data.name"
            required
          />
          <!-- End:: Name Input -->

          <!-- Start:: Email Input -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.email')"
            v-model.trim="data.email"
            required
          />
          <!-- End:: Email Input -->

          <!-- Start:: Phone Input -->
          <!-- <base-phone-input
            col="12"
            required
            dir="ltr"
            v-model="data.mobile"
            @dialCode="dialCode"
            @isoCode="isoCode"
            :placeholder="$t('PLACEHOLDERS.phone')"
            :defaultCountry="data.dial_code"
            :key="key"
          /> -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.phone')"
            v-model.trim="data.mobile"
            required
          />
          <!-- End:: Phone Input -->

          <!-- Start:: Referral Code Input -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.referral_code')"
            v-model.trim="data.referral_code"
            disabled
          />
          <!-- End:: Referral Code Input -->

          <!-- Start:: Commercial Registration Input -->
          <base-input
            col="6"
            type="text"
            :placeholder="$t('PLACEHOLDERS.commercial_register')"
            v-model.trim="data.commercial_registration_number"
          />
          <!-- End:: Commercial Registration Input -->

          <!-- Start:: Category Rows -->
          <div class="col-12 my-5">
            <div class="category-rows-wrapper">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="color: #1b706f; margin: 0;">
                  {{ $t('PLACEHOLDERS.categories') || 'Categories' }}
                </h5>
                <v-btn
                  @click="addCategoryRow"
                  color="#1b706f"
                  small
                  outlined
                >
                  <i class="fas fa-plus mr-2"></i>
                  {{ $t('BUTTONS.add') || 'Add' }}
                </v-btn>
              </div>

              <div
                v-for="(row, index) in data.categoryRows"
                :key="index"
                class="category-row mb-4"
              >
                <div class="row align-items-center">
                  <!-- Category Select -->
                  <div class="col-lg-5 col-md-5 col-12">
                    <base-select-input
                      :key="`cat-${index}`"
                      :optionsList="getAvailableCategories(index)"
                      :placeholder="$t('PLACEHOLDERS.category')"
                      v-model="row.category"
                      @input="onCategoryRowChange(index, $event)"
                      required
                    />
                  </div>

                  <!-- Sub Categories Multi Select -->
                  <div class="col-lg-6 col-md-6 col-12">
                    <base-select-input
                      :key="`subcat-${index}-${row.category ? (row.category.id || row.category) : 'none'}`"
                      :optionsList="getSubCategoriesForRow(index)"
                      :placeholder="$t('PLACEHOLDERS.subCategories')"
                      v-model="row.sub_categories"
                      :multiple="true"
                      :disabled="!row.category"
                      required
                    />
                  </div>

                  <!-- Delete Button -->
                  <div class="col-lg-1 col-md-1 col-12 text-center">
                    <v-btn
                      @click="removeCategoryRow(index)"
                      color="error"
                      icon
                      small
                      :disabled="data.categoryRows.length == 1"
                    >
                      <i class="fas fa-trash" style="font-size: 20px;"></i>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End:: Category Rows -->

          <!-- Start:: City Select -->
          <base-select-input
            col="6"
            :optionsList="cities"
            :placeholder="$t('PLACEHOLDERS.city')"
            v-model="data.city"
            @input="onCityChange"
            required
          />
          <!-- End:: City Select -->

          <!-- Start:: District Select -->
          <base-select-input
            col="6"
            :optionsList="districts"
            :placeholder="$t('PLACEHOLDERS.district')"
            v-model="data.district"
            :disabled="!data.city"
          />
          <!-- End:: District Select -->

          <!-- Start:: Description Textarea -->
          <base-textarea-input
            col="12"
            :placeholder="$t('PLACEHOLDERS.description')"
            v-model.trim="data.description"
            rows="4"
          />
          <!-- End:: Description Textarea -->

          <!-- Start:: Active Switch -->
          <!-- <div class="input_wrapper switch_wrapper my-5">
            <v-switch
              color="green"
              :label="$t('PLACEHOLDERS.status')"
              v-model="data.is_active"
              hide-details
            ></v-switch>
          </div> -->
          <!-- End:: Active Switch -->

          <!-- Start:: Submit Button Wrapper -->
          <div class="btn_wrapper">
            <base-button
              class="mt-2"
              styleType="primary_btn"
              :btnText="$t('BUTTONS.save')"
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
import { mapGetters, mapActions } from "vuex";
import BasePhoneInput from "@/components/formInputs/BasePhoneInput.vue";
import BaseMultiImageUploadInput from "@/components/formInputs/BaseMultiImageUploadInput.vue";

export default {
  name: "EditProvider",
  components: {
    BasePhoneInput,
    BaseMultiImageUploadInput,
  },
  data() {
    return {
      // Start:: Loader Control Data
      isWaitingRequest: false,
      // End:: Loader Control Data

      // Start:: Data Collection To Send
      data: {
        image: {
          path: null,
          file: null,
        },
        commercial_image: {
          path: null,
          file: null,
        },
        previous_works: {
          urls: [],
          files: [],
          removedIndices: [],
        },
        name: null,
        email: null,
        mobile: null,
        referral_code: null,
        description: null,
        commercial_registration_number: null,
        categoryRows: [
          {
            category: null,
            sub_categories: [],
          },
        ],
        city: null,
        district: null,
        is_active: true,
        dial_code: null,
        iso_code: null,
      },
      categories: [],
      subCategories: [],
      cities: [],
      districts: [],
      key: "",
      // End:: Data Collection To Send
    };
  },
  methods: {
    // Start:: API Methods
    async getCategories() {
      try {
        let res = await this.$axios({
          method: "GET",
          url: `https://backend.bonian.moltaqadev.com/dashboard-api/v1/categories?page=0&limit=0&is_active=1&ignorePermissionCheck=1`,
        });
        this.categories = res.data.data.data;
      } catch (error) {
        console.log(error.response?.data?.message);
      }
    },

    async getSubCategories(categoryId = null) {
      try {
        const url = categoryId
          ? `https://backend.bonian.moltaqadev.com/dashboard-api/v1/sub-categories?category_id=${categoryId}&page=0&limit=0&is_active=1&ignorePermissionCheck=1`
          : `https://backend.bonian.moltaqadev.com/dashboard-api/v1/sub-categories?page=0&limit=0&is_active=1&ignorePermissionCheck=1`;

        let res = await this.$axios({
          method: "GET",
          url: url,
        });
        this.subCategories = res.data.data.data;
      } catch (error) {
        console.log(error.response?.data?.message);
      }
    },

    async getCities() {
      try {
        let res = await this.$axios({
          method: "GET",
          url: "https://backend.bonian.moltaqadev.com/dashboard-api/v1/cities?page=0&limit=0&is_active=1&ignorePermissionCheck=1",
        });
        this.cities = res.data.data.data;
      } catch (error) {
        console.log(error.response?.data?.message);
      }
    },

    async getDistricts(cityId = null) {
      try {
        const url = cityId
          ? `https://backend.bonian.moltaqadev.com/dashboard-api/v1/districts?city_id=${cityId}&page=0&limit=0&is_active=1&ignorePermissionCheck=1`
          : `https://backend.bonian.moltaqadev.com/dashboard-api/v1/districts?page=0&limit=0&is_active=1&ignorePermissionCheck=1`;

        let res = await this.$axios({
          method: "GET",
          url: url,
        });
        this.districts = res.data.data.data;
      } catch (error) {
        console.log(error.response?.data?.message);
      }
    },

    // Start:: Show Provider Data
    async showProvider() {
      try {
        let res = await this.$axios({
          method: "GET",
          url: `auth/profile`,
        });

        const provider = res.data.data.user;
        this.data.name = provider.name;
        this.data.email = provider.email;
        this.data.mobile = provider.mobile;
        this.data.referral_code = provider.code;
        this.data.description = provider.description;
        this.data.commercial_registration_number =
          provider.commercial_registration_number;
        this.data.is_active = provider.is_active;
        
        // Set avatar image (API returns 'avatar' field)
        if (provider.avatar) {
          this.data.image.path = provider.avatar;
        } else if (provider.image) {
          this.data.image.path = provider.image;
        }

        // Set commercial image
        if (provider.commercial_image) {
          this.data.commercial_image.path = provider.commercial_image;
        }

        // Set previous works
        if (provider.previous_works && Array.isArray(provider.previous_works)) {
          this.data.previous_works.urls = provider.previous_works
            .map((pw) => {
              if (typeof pw === 'string') return pw;
              return pw.previous_work || pw.url || pw;
            })
            .filter(Boolean);
        }

        // Initialize category rows
        this.data.categoryRows = [];

        // Load all subcategories initially
        await this.getSubCategories();

        // Handle category and subcategory data from API
        // API returns providerCategories and providerSubCategories arrays
        const providerCategories = provider.providerCategories || [];
        const providerSubCategories = provider.providerSubCategories || [];

        // Group subcategories by category_id
        const subCategoriesByCategory = {};
        providerSubCategories.forEach((subCat) => {
          const catId = subCat.category_id;
          if (!subCategoriesByCategory[catId]) {
            subCategoriesByCategory[catId] = [];
          }
          subCategoriesByCategory[catId].push(subCat);
        });

        // Create rows for each category
        if (providerCategories.length > 0) {
          providerCategories.forEach((providerCat) => {
            const category = this.categories.find((cat) => cat.id === providerCat.id);
            if (category) {
              // Get subcategories for this category from providerSubCategories
              const rowSubCategories = subCategoriesByCategory[providerCat.id] || [];
              
              // Map to full subcategory objects from this.subCategories
              const mappedSubCategories = rowSubCategories
                .map((providerSubCat) => {
                  return this.subCategories.find(
                    (subCat) => subCat.id === providerSubCat.id
                  );
                })
                .filter(Boolean);

              this.data.categoryRows.push({
                category: category,
                sub_categories: mappedSubCategories,
              });
            }
          });
        }

        // If no categories found, ensure at least one empty row
        if (this.data.categoryRows.length === 0) {
          this.data.categoryRows = [
            {
              category: null,
              sub_categories: [],
            },
          ];
        }

        // Set city and load districts
        // Find city object from cities array
        if (provider.city_id) {
          const cityObj = this.cities.find((city) => city.id === provider.city_id);
          this.data.city = cityObj || provider.city_id;
          await this.getDistricts(provider.city_id);
        }
        
        // Find district object from districts array
        if (provider.district_id) {
          const districtObj = this.districts.find(
            (district) => district.id === provider.district_id
          );
          this.data.district = districtObj || provider.district_id;
        }

        // Set phone related data
        this.data.dial_code = provider.country_code;
        this.data.iso_code = provider.iso_code;
        this.key = +provider.country_code || "";
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    },
    // End:: Show Provider Data

    // Start:: Event Handlers
    addCategoryRow() {
      this.data.categoryRows.push({
        category: null,
        sub_categories: [],
      });
    },

    removeCategoryRow(index) {
      if (this.data.categoryRows.length > 1) {
        this.data.categoryRows.splice(index, 1);
      }
    },

    onCategoryRowChange(rowIndex, selectedCategory) {
      const row = this.data.categoryRows[rowIndex];
      if (!selectedCategory) {
        row.sub_categories = [];
        return;
      }

      // Clear sub_categories for this row since category changed
      // The getSubCategoriesForRow method will filter the correct subcategories
      // from the already loaded subCategories array
      this.$set(row, 'sub_categories', []);
    },

    getAvailableCategories(currentRowIndex) {
      // Get all selected category IDs except the current row
      const selectedCategoryIds = this.data.categoryRows
        .map((row, index) => {
          if (index === currentRowIndex) return null;
          if (!row.category) return null;
          return row.category.id || row.category;
        })
        .filter(Boolean);

      // Filter out already selected categories
      return this.categories.filter((cat) => {
        const catId = cat.id || cat;
        return !selectedCategoryIds.includes(catId);
      });
    },

    getSubCategoriesForRow(rowIndex) {
      const row = this.data.categoryRows[rowIndex];
      if (!row || !row.category) {
        return [];
      }

      const categoryId = row.category.id || row.category;
      if (!categoryId) {
        return [];
      }

      // Filter subcategories to only show those belonging to the selected category
      // Check both category_id and nested category.id
      const filtered = this.subCategories.filter((subCat) => {
        if (!subCat) return false;
        const subCatCategoryId = subCat.category_id || subCat?.category?.id || subCat.category_id;
        return subCatCategoryId == categoryId; // Use == for type coercion
      });

      return filtered;
    },

    onCityChange(selectedCity) {
      this.data.district = null;
      if (selectedCity?.id) {
        this.getDistricts(selectedCity.id);
      }
    },

    // Start:: Select Upload Image
    selectImage(selectedImage) {
      this.data.image = selectedImage;
    },
    // End:: Select Upload Image

    // Start:: Select Commercial Image
    selectCommercialImage(selectedImage) {
      this.data.commercial_image = selectedImage;
    },
    // End:: Select Commercial Image

    // Start:: Select Previous Works
    selectPreviousWorks(files) {
      this.data.previous_works.files = files;
    },
    // End:: Select Previous Works

    // Start:: Remove Previous Work
    removePreviousWork(index) {
      this.data.previous_works.removedIndices.push(index);
    },
    // End:: Remove Previous Work

    dialCode(dialCode) {
      this.data.dial_code = dialCode;
    },

    isoCode(isoCode) {
      this.data.iso_code = isoCode;
    },

    // Start:: validate Form Inputs
    validateFormInputs() {
      this.isWaitingRequest = true;
      this.submitForm();
    },
    // End:: validate Form Inputs

    // Start:: Submit Form
    async submitForm() {
      const REQUEST_DATA = new FormData();

      // Append image if selected
      if (this.data.image.file) {
        REQUEST_DATA.append("avatar", this.data.image.file);
      }

      // Append commercial image if selected
      if (this.data.commercial_image.file) {
        REQUEST_DATA.append(
          "commercial_image",
          this.data.commercial_image.file
        );
      }

      // Append previous works files if selected
      if (
        Array.isArray(this.data.previous_works.files) &&
        this.data.previous_works.files.length > 0
      ) {
        this.data.previous_works.files.forEach((file, index) => {
          REQUEST_DATA.append(`previous_works[${index}]`, file);
        });
      }

      // Append basic fields
      if (this.data.name) {
        REQUEST_DATA.append("name", this.data.name);
      }
      if (this.data.email) {
        REQUEST_DATA.append("email", this.data.email);
      }
      if (this.data.mobile) {
        REQUEST_DATA.append("mobile", this.data.mobile);
      }
      if (this.data.description) {
        REQUEST_DATA.append("description", this.data.description);
      }
      if (this.data.commercial_registration_number) {
        REQUEST_DATA.append(
          "commercial_registration_number",
          this.data.commercial_registration_number
        );
      }

      // Append categories and sub-categories from rows
      const allCategoryIds = [];
      const allSubCategoryIds = [];

      if (
        Array.isArray(this.data.categoryRows) &&
        this.data.categoryRows.length > 0
      ) {
        this.data.categoryRows.forEach((row) => {
          if (row.category) {
            const categoryId = row.category.id || row.category;
            if (categoryId && !allCategoryIds.includes(categoryId)) {
              allCategoryIds.push(categoryId);
            }
          }

          if (
            Array.isArray(row.sub_categories) &&
            row.sub_categories.length > 0
          ) {
            row.sub_categories.forEach((subCat) => {
              const subCatId = subCat.id || subCat;
              if (subCatId && !allSubCategoryIds.includes(subCatId)) {
                allSubCategoryIds.push(subCatId);
              }
            });
          }
        });
      }

      // Append category_ids array
      allCategoryIds.forEach((categoryId, index) => {
        REQUEST_DATA.append(`category_ids[${index}]`, categoryId);
      });

      // Append sub_category_ids array
      allSubCategoryIds.forEach((subCatId, index) => {
        REQUEST_DATA.append(`sub_category_ids[${index}]`, subCatId);
      });

      // Handle city_id (can be object or number)
      if (this.data.city) {
        const cityId = typeof this.data.city === 'object' ? this.data.city.id : this.data.city;
        if (cityId) {
          REQUEST_DATA.append("city_id", cityId);
        }
      }
      
      // Handle district_id (can be object or number)
      if (this.data.district) {
        const districtId = typeof this.data.district === 'object' ? this.data.district.id : this.data.district;
        if (districtId) {
          REQUEST_DATA.append("district_id", districtId);
        }
      }
      if (this.data.dial_code) {
        REQUEST_DATA.append("country_code", this.data.dial_code);
      }
      if (this.data.iso_code) {
        REQUEST_DATA.append("iso_code", this.data.iso_code);
      }

      // Append active status
      REQUEST_DATA.append("is_active", this.data.is_active ? "1" : "0");

      // Add method for PUT request
      // REQUEST_DATA.append("_method", "put");

      try {
        await this.$axios({
          method: "POST",
          url: `auth/update-profile`,
          data: REQUEST_DATA,
        });
        this.isWaitingRequest = false;
        this.$message.success(this.$t("MESSAGES.editedSuccessfully"));
        // Optionally redirect or stay on the same page
        // this.$router.push({ path: "/providers/all" });
      } catch (error) {
        this.isWaitingRequest = false;
        this.$message.error(
          error.response?.data?.message || "An error occurred"
        );
      }
    },
    // End:: Submit Form
  },

  async created() {
    // Start:: Fire Methods
    // Load categories first so they're available when loading provider data
    await this.getCategories();
    await this.getSubCategories(); // Load all subcategories initially
    await this.getCities();
    await this.showProvider();
    // End:: Fire Methods
  },
};
</script>

<style scoped>
.crud_form_wrapper {
  padding: 20px;
}

.form_title_wrapper h4 {
  color: #1b706f;
  margin-bottom: 20px;
}

.btn_wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.switch_wrapper {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.category-rows-wrapper {
  width: 100%;
}

.category-row {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  /* background: #ffffff; */
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-row:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #1b706f;
}

.category-row .row {
  margin: 0;
}

.category-row .row {
  margin-left: -10px;
  margin-right: -10px;
}

.category-row .row > div {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
