<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="allCampaigns.campaigns"
      class="elevation-1"
    >
      <template v-slot:item._id="{ item }">
        <span>{{
          allCampaigns.campaigns
            .map(function (x) {
              return x._id;
            })
            .indexOf(item._id) + 1
        }}</span>
      </template>
      <template v-slot:item.title="{ item }">
        <span>{{
          item.title.charAt(0).toUpperCase() + item.title.slice(1)
        }}</span>
      </template>
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>All Campaigns</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            rounded
            height="40"
            class="mx-3 my-5"
            @click="createCampaign"
          >
            <v-icon class="ml-n5 mx-5">mdi-create</v-icon>
            Create Campaign
          </v-btn>
          <v-dialog v-model="createDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">New Campaign</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="campaignItem.title"
                        label="Campaign Title"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  :loading="loading"
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.title"
                        label="Full Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  :loading="loading"
                  @click="editCampaign"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="viewDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.title"
                        label="Full Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  :loading="loading"
                  @click="editCampaign"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">Delete Campaign</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    Are you sure you want to delete this Campaign?
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="red darken-1"
                  text
                  :loading="loading"
                  @click="deleteCampaign"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <!-- <v-icon
          color="black"
          title="View Campaign"
          small
          class="mr-2"
          @click="viewItem(item)"
        >
          mdi-eye
        </v-icon> -->
        <v-icon
          color="yellow"
          title="Edit Campaign"
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          color="red"
          title="Delete Campaign"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <Loader v-if="loading" />
    <v-snackbar v-if="error.status" v-model="error.status" :timeout="5000">
      {{ error.message }}
      <v-btn color="pink" text @click="error.status = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-snackbar v-if="success.status" v-model="success.status" :timeout="5000">
      {{ success.message }}
      <v-btn color="green" text @click="success.status = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  layout: 'admin',
  data: () => ({
    viewDialog: false,
    createDialog: false,
    dialog: false,
    search: '',
    deleteDialog: false,
    adminDialog: false,
    blockDialog: false,
    loading: false,
    headers: [
      {
        text: 'Serial #',
        value: '_id',
      },
      {
        text: 'Campaign',
        align: 'start',
        sortable: false,
        value: 'title',
      },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    desserts: [],
    camps: [],
    editedIndex: -1,
    error: { status: false, message: '' },
    alertError: { status: false, message: '' },
    success: { status: false, message: '' },
    editedItem: {
      title: '',
      admin_id: null,
    },
    adminItem: {},
    deletedItem: {},
    removeItem: {},
    campaignItem: {
      title: '',
    },
  }),
  computed: {
    allUsers() {
      return this.$store.state.allUsers;
    },
    allCampaigns() {
      return this.$store.state.allCampaigns;
    },
    ...mapGetters([
      'getUsers',
      'getFiles',
      'isLoggedIn',
      'getFolders',
      'getCampaigns',
      'getUser',
    ]),
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    // itemsWithSno() {
    //   return this.$store.state.allCampaigns.campaigns.map((d, index) => ({
    //     ...d,
    //     sno: index + 1,
    //   }));
    // },
  },
  mounted() {
    const token = this.isLoggedIn(this);
    this.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.fetchCampaigns();
  },
  methods: {
    viewItem(item) {
      this.viewedItem = Object.assign({}, item);
      this.viewDialog = true;
    },
    editItem(item) {
      this.editedIndex = this.$store.state.allCampaigns.campaigns.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      // const index = this.$store.state.allUsers.users.indexOf(item);
      // console.log(index);
      this.deletedItem = Object.assign({}, item);
      this.deleteDialog = true;
    },

    admin(item) {
      this.adminItem = Object.assign({}, item);
      this.adminDialog = true;
    },

    block(item) {
      this.removeItem = Object.assign({}, item);
      this.blockDialog = true;
    },

    close() {
      this.createDialog = false;
      this.dialog = false;
      this.deleteDialog = false;
      this.adminDialog = false;
      this.blockDialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    createCampaign() {
      this.createDialog = true;
    },

    async viewCampaign() {
      this.loading = true;
      try {
        const response = await this.$axios.get(
          `campaigns/${this.viewedItem._id}`
        );
        if (response) {
          this.loading = false;
          this.$store.commit('LOAD_ALL_CAMPAIGNS', response.data);
          this.fetchCampaigns();
          this.dialog = false;
          this.success.status = true;
          this.success.message = response.data.message;
          return Promise.resolve(response.data);
        }
      } catch (error) {
        this.loading = false;
        this.error.status = true;
        this.error.message = error.response.data.message;
        this.fetchCampaigns();
      }
      this.close();
    },

    async editCampaign() {
      const user = this.getUser(this);
      this.editedItem.admin_id = user.id;
      this.loading = true;
      try {
        const response = await this.$axios.patch(
          `campaigns/${this.editedItem._id}`,
          this.editedItem
        );
        if (response) {
          this.loading = false;
          this.$store.commit('LOAD_ALL_CAMPAIGNS', response.data);
          this.fetchCampaigns();
          this.dialog = false;
          this.success.status = true;
          this.success.message = response.data.message;
          return Promise.resolve(response.data);
        }
      } catch (error) {
        this.loading = false;
        this.error.status = true;
        this.error.message = error.response.data.message;
        this.fetchCampaigns();
      }
      this.close();
    },

    async save() {
      this.loading = true;
      try {
        const response = await this.$axios.post('campaigns/new', {
          title: this.campaignItem.title,
        });
        if (response) {
          this.loading = false;
          this.$store.commit('LOAD_ALL_CAMPAIGNS', response.data);
          this.fetchCampaigns();
          this.createDialog = false;
          this.success.status = true;
          this.success.message = response.data.message;
          return Promise.resolve(response.data);
        }
      } catch (error) {
        this.loading = false;
        this.error.status = true;
        this.error.message = error.response.data.message;
        this.fetchCampaigns();
      }
      this.close();
    },

    async deleteCampaign() {
      const token = this.isLoggedIn(this);
      this.loading = true;
      try {
        const response = await this.$axios.delete(
          `campaigns/${this.deletedItem._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: {
              title: this.deletedItem.title,
            },
          }
        );
        if (response) {
          this.loading = false;
          this.success.status = true;
          this.success.message = response.data.message;
          this.$store.commit('LOAD_ALL_CAMPAIGNS', response.data);
          this.fetchCampaigns();
          this.deleteDialog = false;
          return Promise.resolve(response.data);
        }
      } catch (error) {
        this.loading = false;
        this.error.status = true;
        this.error.message = error.response.data.message;
        this.fetchUsers();
      }
      this.close();
    },
  },
};
</script>

<style></style>
