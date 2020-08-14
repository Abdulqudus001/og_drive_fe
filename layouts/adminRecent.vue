<template>
  <v-app id="inspire">
    <new-dialog
      :show-dialog="showNewFolderDialog"
      :is-loading="buttonLoading"
      @closeDialog="closeDialog('showNewFolderDialog')"
      @createFolder="createFolder"
    />
    <move-dialog
      :show-dialog="showMoveFolderDialog"
      :is-loading="buttonLoading"
      @closeDialog="closeDialog('showMoveFolderDialog')"
      @moveFolder="moveFolder"
    />
    <share-dialog
      :show-dialog="showShareDialog"
      :is-loading="buttonLoading"
      @closeDialog="closeDialog('showShareDialog')"
      @share="handleFileSharing"
    />
    <v-dialog v-model="showProfileDialog" max-width="360">
      <v-card>
        <v-card-title class="headline">
          Edit account
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="alertError.status"
            v-model="alertError.status"
            type="error"
            dismissible
          >
            {{ alertError.message }}
          </v-alert>
          <v-form @submit.prevent.stop="update">
            <input
              id="user-photo"
              type="file"
              name="user-photo"
              @change="handleImage"
            />
            <label
              :style="{ backgroundImage: `url(${user.picture})` }"
              for="user-photo"
              class="picture-upload"
            >
              <v-icon size="50" color="white">
                mdi-camera-plus-outline
              </v-icon>
              <img id="user-image" :src="user.picture" alt="User's image" />
            </label>
            <v-text-field
              v-model="updateUser.full_name"
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              prepend-icon="mdi-account-outline"
              class="mx-3 my-4"
            />
            <v-text-field
              v-model="updateUser.username"
              label="Username"
              name="username"
              type="text"
              placeholder="johndoe123"
              prepend-icon="mdi-account-box-outline"
              class="mx-3 my-4"
            />
            <v-layout>
              <v-spacer />
              <v-btn
                type="submit"
                color="primary px-5 mx-4"
                :loading="profileLoading"
                @click.stop.prevent="update"
              >
                Update
              </v-btn>
              <v-btn
                color="darken-1"
                text
                @click="
                  showProfileDialog = false;
                  clearForm();
                "
              >
                Cancel
              </v-btn>
            </v-layout>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
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
    <v-navigation-drawer v-model="drawer" clipped app class="drawer">
      <v-list dense shaped>
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              rounded
              height="50"
              width="93%"
              class="mx-3 my-5"
              v-on="on"
            >
              <v-icon class="ml-n5 mx-5">mdi-upload</v-icon>
              New
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="openNewFolderDialog">
              <v-list-item-action>
                <v-icon>mdi-folder-plus-outline</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  New Folder
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <input
                id="file-upload"
                type="file"
                name="file-upload"
                multiple
                @change="handleFileUpload"
              />
              <label for="file-upload" class="row pl-3">
                <v-list-item-action>
                  <v-icon>mdi-file-upload-outline</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    Upload File
                  </v-list-item-title>
                </v-list-item-content>
              </label>
            </v-list-item>
          </v-list>
        </v-menu>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
            color="primary"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              link
              :to="item.to"
              color="primary"
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
            v-else
            :key="item.text"
            link
            :to="item.to"
            color="primary"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      color="white"
      class="app-bar"
      elevation="0"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <img src="/images/logo.png" alt="Outsource Logo" width="100vh" />
      <!-- <v-text-field
        :solo="pressed"
        :solo-inverted="!pressed"
        :flat="!pressed"
        hide-details
        background-color="#f8fafb"
        prepend-inner-icon="mdi-magnify"
        label="Search in drive"
        class="hidden-sm-and-down search-bar"
        color="#555"
        @focus="pressed = true"
        @blur="pressed = false"
      /> -->
      <v-spacer />
      <v-divider vertical />
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            <v-layout align-center>
              <v-avatar v-if="user.picture" size="35px" item class="mx-2">
                <v-img :src="user.picture" alt="User Image" />
              </v-avatar>
              <v-avatar v-else size="35px" color="primary" item class="mx-2">
                <span class="white--text font-weight-medium">
                  {{ getUserInitials }}
                </span>
              </v-avatar>
              <span class="hidden-sm-and-down">{{ user.username }}</span>
              <v-icon>mdi-menu-down</v-icon>
            </v-layout>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showDialog">
            <v-list-item-icon>
              <v-icon>mdi-account-edit-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Edit Profile</v-list-item-content>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Logout</v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isAdmin || isSuperAdmin" to="/admin/dashboard">
            <v-list-item-icon>
              <v-icon>mdi-account-supervisor-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Admin Dashboard</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-content class="body">
      <v-container class="pb-0">
        <v-toolbar flat class="toolbar px-2" color="transparent">
          <v-toolbar-title class="px-0">
            <v-layout justify-space-between full-width>
              <span class="row align-center mx-0 font-weight-black text--text">
                <h2>
                  Recent
                </h2>
                <!-- <p class="count">({{ fileLength }})</p> -->
              </span>
              <v-layout v-if="showAction" class="full-width" justify-end>
                <v-btn color="primary" @click="showMoveFolderDialog = true">
                  Move
                </v-btn>
                <v-btn text @click="deleteFiles">Delete</v-btn>
                <v-btn text @click="shareFile">Share</v-btn>
              </v-layout>
            </v-layout>
          </v-toolbar-title>
          <v-layout justify-space-between align-center>
            <v-breadcrumbs :items="getBreadCrumbs" class="px-0">
              <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
              <template v-slot:item="{ item }">
                <v-breadcrumbs-item
                  :to="item.href"
                  nuxt
                  :disabled="item.disabled"
                  class="breadcrumb"
                >
                  <v-icon v-if="item.icon">{{ item.text }}</v-icon>
                  <span v-else>{{ item.text.toUpperCase() }}</span>
                </v-breadcrumbs-item>
              </template>
            </v-breadcrumbs>
            <div class="view">
              <v-btn
                small
                fab
                elevation="0"
                color="rgba(68, 86, 108, 0.042)"
                class="mx-2"
              >
                <v-icon size="20" color="rgba(68, 86, 108, 0.7)">
                  mdi-view-grid
                </v-icon>
              </v-btn>
              <v-btn small fab elevation="0" color="rgba(68, 86, 108, 0.042)">
                <v-icon size="23" color="rgba(68, 86, 108, 0.7)">
                  mdi-view-list
                </v-icon>
              </v-btn>
            </div>
          </v-layout>
        </v-toolbar>
      </v-container>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import NewDialog from '@/components/NewFolder';
import MoveDialog from '@/components/MoveFolder';
import ShareDialog from '@/components/ShareDialog';
import Loader from '@/components/Loader';
import { EventBus } from '../plugins/eventBus';

export default {
  components: { NewDialog, Loader, MoveDialog, ShareDialog },
  props: {
    source: {
      type: String,
      default: '',
    },
  },
  data: (v) => ({
    dialog: false,
    drawer: null,
    items: [
      {
        icon: 'mdi-cloud-outline',
        text: 'Drive',
        to: `/admin/user/${v.$route.params.id}`,
      },
      {
        icon: 'mdi-account-multiple-outline',
        text: 'Shared with this User',
        to: `/admin/shared/${v.$route.params.id}`,
      },
      {
        icon: 'mdi-clock-outline',
        text: 'Recent',
        to: `/admin/recent/${v.$route.params.id}`,
      },
      {
        icon: 'mdi-trash-can-outline',
        text: 'Bin',
        to: `/admin/bin/${v.$route.params.id}`,
      },
      // {
      //   icon: 'mdi-chevron-up',
      //   'icon-alt': 'mdi-chevron-down',
      //   text: 'Labels',
      //   model: true,
      //   children: [{ icon: 'mdi-plus', text: 'Create label' }],
      // },
      // {
      //   icon: 'mdi-chevron-up',
      //   'icon-alt': 'mdi-chevron-down',
      //   text: 'More',
      //   model: false,
      //   children: [
      //     { text: 'Import' },
      //     { text: 'Export' },
      //     { text: 'Print' },
      //     { text: 'Undo changes' },
      //     { text: 'Other contacts' },
      //   ],
      // },
      // { icon: 'mdi-settings', text: 'Settings' },
      // { icon: 'mdi-message', text: 'Send feedback' },
      // { icon: 'mdi-help-circle', text: 'Help' },
      // { icon: 'mdi-cellphone-link', text: 'App downloads' },
      // { icon: 'mdi-keyboard', text: 'Go to the old version' },
    ],
    loading: false,
    buttonLoading: false,
    showNewFolderDialog: false,
    showMoveFolderDialog: false,
    pressed: false,
    showAction: false,
    error: { status: false, message: '' },
    alertError: { status: false, message: '' },
    success: { status: false, message: '' },
    fileIds: [],
    fileLength: 0,
    showShareDialog: false,
    user: '',
    showProfileDialog: false,
    profileLoading: false,
    updateUser: {
      full_name: '',
      username: '',
    },
  }),
  computed: {
    ...mapGetters(['getBreadCrumbs', 'isLoggedIn', 'getUser', 'getLevel']),
    isAdmin() {
      return this.user.role && this.user.role.toLowerCase() === 'admin';
    },
    isSuperAdmin() {
      return this.user.role && this.user.role.toLowerCase() === 'superadmin';
    },
    disableBtn() {
      return !this.updateUser.full_name || !this.updateUser.username;
    },
    getUserInitials() {
      const full_name = this.user.full_name;
      if (full_name) {
        const initials = full_name.split(' ').reduce((join, name) => {
          return `${join}${name[0]}`;
        }, '');
        if (initials.length > 2) {
          return `${initials[0]}${initials[1]}`;
        } else {
          return initials;
        }
      }
      return null;
    },
  },
  mounted() {
    const token = this.isLoggedIn(this);
    const user = this.getUser(this);
    if (token) {
      this.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      this.$router.push({ path: '/login' });
    }
    this.loading = true;
    this.fetchUserFiles(user.id, 0);
    this.showAction = false;
    EventBus.$on('showAction', (files) => {
      this.fileIds = files;
      this.showAction = true;
    });
    EventBus.$on('hideAction', () => {
      this.showAction = false;
    });
    EventBus.$on('fileLength', (length) => {
      this.fileLength = length;
    });
    EventBus.$on('shareFile', (id) => {
      this.fileIds.push(id);
      this.shareFile();
    });
    this.$store.dispatch('fetchFolders', user.id);
    this.user = user;
  },
  methods: {
    openNewFolderDialog() {
      this.showNewFolderDialog = true;
    },
    closeDialog(e) {
      this[e] = false;
    },
    createFolder(e) {
      const parentDir = this.$route.params.name || '';
      this.buttonLoading = true;
      const user = this.getUser(this);
      let data;
      if (!parentDir) {
        data = {
          dirname: e,
          user_id: user.id,
          level: 0,
        };
      } else {
        data = {
          dirname: e,
          user_id: user.id,
          level: this.getLevel + 1,
          parent_dir: parentDir,
        };
      }
      this.$axios
        .post('directory/create', data)
        .then(() => {
          this.buttonLoading = false;
          this.loading = true;
          this.fetchUserFiles(user.id, 0);
          this.$store.dispatch('fetchFolders', user.id);
        })
        .catch((err) => {
          this.buttonLoading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
      this.showNewFolderDialog = false;
    },
    resetBreadCrumbs() {
      this.$store.dispatch('resetAdminBreadCrumbs', this.$route.params.id);
    },
    handleFileUpload(e) {
      const parentDir = this.$route.params.name || '';
      this.loading = true;
      const user = this.getUser(this);
      const file = e.target.files;
      let formData = new FormData();
      formData.set('user_id', user.id);
      if (parentDir) {
        formData.set('directory_id', parentDir);
      }
      if (file.length > 1) {
        this.handleMultipleFileUpload(user.id, file);
      } else {
        formData.set('file', file[0]);
        this.$axios
          .post('files/upload/single', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then(() => {
            EventBus.$emit('addedNewFile');
            this.fetchUserFiles(user.id, 0);
          })
          .catch((err) => {
            this.loading = false;
            this.error.status = true;
            this.error.message = err.response.data.message;
          });
      }
    },
    handleMultipleFileUpload(id, files) {
      const parentDir = this.$route.params.name || '';
      const formData = new FormData();
      formData.set('user_id', id);
      [...files].forEach((file) => {
        formData.append('files', file);
      });
      if (parentDir) {
        formData.set('directory_id', parentDir);
      }
      this.$axios
        .post('files/upload/bulk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
          this.fetchUserFiles(id, 0);
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    moveFolder(e) {
      this.buttonLoading = true;
      const data = {
        file_id: this.fileIds,
        directory_id: e,
      };
      this.$axios
        .put('files/move/bulk', data)
        .then(() => {
          const user = this.getUser(this);
          this.loading = true;
          this.buttonLoading = false;
          this.fetchUserFiles(user.id, 0);
        })
        .catch((err) => {
          this.buttonLoading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
      this.showMoveFolderDialog = false;
    },
    deleteFiles() {
      this.$axios
        .delete('/files/bulk', { data: { file_id: this.fileIds } })
        .then(() => {
          const user = this.getUser(this);
          this.loading = true;
          this.fetchUserFiles(user.id, 0);
        })
        .catch((err) => {
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    shareFile() {
      this.showShareDialog = true;
    },
    handleFileSharing(users) {
      const user = this.getUser(this);
      const data = {
        user_id: user.id,
        user_ids: users,
        files: this.fileIds,
      };
      this.buttonLoading = true;
      this.$axios
        .post('files/share', data)
        .then(({ data }) => {
          this.buttonLoading = false;
          this.showShareDialog = false;
          this.success.status = true;
          this.success.message = data.message;
        })
        .catch(() => {
          this.buttonLoading = false;
          this.error.status = true;
          this.error.message = 'Something went wrong';
        });
    },
    handleImage(image) {
      const files = image.target.files;
      this.updateUser.image = files[0];
      const imageElement = document.querySelector('#user-image');
      if (files && files[0]) {
        const reader = new FileReader();

        reader.readAsDataURL(files[0]);

        reader.onload = (e) => {
          imageElement.style.display = 'block';
          imageElement.src = e.target.result;
          // imageElement.style.backgroundImage = `url(${e.target.result})`;
        };
      }
    },
    logout() {
      this.$cookies.remove('token');
      this.$cookies.remove('user');
      this.$router.push('/login');
    },
    showDialog() {
      this.updateUser.full_name = this.user.full_name;
      this.updateUser.username = this.user.username;
      this.showProfileDialog = true;
    },
    update() {
      this.profileLoading = true;
      const ogId = this.user.ogId;
      const data = {
        ogId,
        full_name: this.updateUser.full_name,
        username: this.updateUser.username,
      };
      this.$axios
        .put('users', data)
        .then(() => {
          if (this.updateUser.image) {
            const form = new FormData();
            form.set('user_id', this.user.id);
            form.set('picture', this.updateUser.image);

            this.$axios
              .post('files/upload/picture', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
              .then(() => {
                this.clearForm();
                this.profileLoading = false;
                this.showProfileDialog = false;
                this.success.status = true;
                this.success.message = 'Account Updated';
                this.fetchUser();
              })
              .catch(() => {
                this.profileLoading = false;
                this.alertError.status = true;
                this.alertError.message = 'Something went wrong';
              });
          } else {
            this.clearForm();
            this.profileLoading = false;
            this.showProfileDialog = false;
            this.success.status = true;
            this.success.message = 'Account Updated';
            this.fetchUser();
          }
        })
        .catch(() => {
          this.profileLoading = false;
          this.alertError.status = true;
          this.alertError.message = 'Something went wrong';
        });
    },
    clearForm() {
      this.updateUser.full_name = '';
      this.updateUser.username = '';
      this.updateUser.image = '';
    },
    fetchUser() {
      const ogId = this.user.ogId;
      this.$axios.get(`users/${ogId}`).then(({ data }) => {
        const userDetails = {
          id: data._id,
          ogId: data.ogId,
          full_name: data.full_name,
          username: data.username,
          email: data.email,
          department: data.department,
          role: data.role,
          picture: data.profile_pic,
        };
        this.user = userDetails;
        const token = this.$cookies.get('token');
        this.$store.dispatch('saveAuth', [userDetails, token]);
      });
    },
  },
  head() {
    return { title: `OG-Drive - ${this.$route.name}` };
  },
};
</script>

<style lang="scss" scoped>
.app-bar {
  border-bottom: 0.6px solid rgba(0, 0, 0, 0.2) !important;
}

#file-upload {
  width: 0.1px;
  height: 0.1px;
  position: absolute;
  opacity: 0;

  + label {
    cursor: pointer;
  }

  &:hover + label,
  &:focus + label {
    background-color: rgba($color: #000000, $alpha: 0.03);
  }
}

.drawer::v-deep {
  box-shadow: 0px 2px 5px rgba($color: #000000, $alpha: 0.17);
  .v-navigation-drawer__border {
    width: 0px;
  }
}

.breadcrumb::v-deep {
  a.v-breadcrumbs__item {
    color: rgba($color: #000000, $alpha: 0.87);
  }
}

.toolbar::v-deep {
  min-height: 100px;
  .v-toolbar__content {
    display: block;
    padding: 0;
    height: 100%;
  }
}

.count {
  margin-bottom: 0;
  margin-left: 5px;
  font-size: 1.5em;
  opacity: 0.7;
}

.search-bar {
  max-width: 400px;
}

.body {
  background-color: rgba(68, 86, 108, 0.042);
}

#user-photo {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
}

#user-photo:hover + .picture-upload,
#user-photo:focus + .picture-upload {
  &::before {
    background-color: rgba($color: #000, $alpha: 0.4);
  }
}

#user-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: none;
}

.picture-upload {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 20px auto;
  display: block;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  position: relative;
  .v-icon {
    position: absolute;
  }
  &::before {
    transition: background-color 0.09s ease-in;
    content: '';
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    border-radius: 50%;
    background-color: rgba($color: #000000, $alpha: 0.2);
  }
}
</style>
