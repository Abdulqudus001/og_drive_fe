<template>
  <div grid-list-md class="my-drive">
    <v-snackbar v-if="error.status" v-model="error.status" :timeout="5000">
      {{ error.message }}
      <v-btn color="pink" text @click="error.status = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-snackbar v-else v-model="success.status" :timeout="5000">
      {{ success.message }}
      <v-btn color="green" text @click="success.status = false">
        Close
      </v-btn>
    </v-snackbar>
    <Preview
      v-if="showPreview"
      :show="showPreview"
      :data="previewData"
      @hide="showPreview = false"
    />
    <v-navigation-drawer
      v-model="showDrawer"
      temporary
      right
      app
      fixed
      clipped
      overlay-opacity="0.2"
      width="300px"
      class="py-10"
    >
      <Loader v-if="loadingDetails" />
      <v-layout
        v-else
        column
        justify-center
        align-center
        class="fill-height mx-0 px-2"
      >
        <img :src="fileDetails.icon" alt="" width="100px" />
        <ul class="px-4 file-details">
          <li class="my-2">
            <b>File Name: </b>
            {{ fileDetails.name }}
          </li>
          <li class="my-2">
            <b>File Owner: </b>
            {{ fileDetails.owner }}
          </li>
          <li class="my-2">
            <b>Updated: </b>
            {{ fileDetails.lastUpdated }}
          </li>
        </ul>
        <v-divider class="full-width divider" />
        <div class="trails">
          <v-list>
            <div
              v-for="log in fileDetails.logs"
              :key="log._id"
              class="list my-2"
            >
              <p class="my-0 pl-6 caption">
                {{ log.createdAt | date }}
              </p>
              <v-list-item>
                <v-avatar
                  v-if="log.user_id && log.user_id.picture_pic"
                  size="35px"
                  item
                  class="mx-2"
                >
                  <v-img
                    :src="log.user_id && log.user_id.picture_pic"
                    alt="User Image"
                  />
                </v-avatar>
                <v-avatar v-else size="35px" color="primary" item class="mx-2">
                  <span class="white--text font-weight-medium">
                    {{ getUserInitials(log.user_id && log.user_id.full_name) }}
                  </span>
                </v-avatar>
                <v-list-item-content class="py-1">
                  <v-list-item-title class="text-capitalize small--text">
                    {{ log.action }} this {{ log.type }}
                    {{ log.shared_with && `with ${log.shared_with.full_name}` }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="caption">
                    {{ log.user_id && log.user_id.full_name }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="divider" />
            </div>
          </v-list>
        </div>
        <v-layout class="file-actions px-8" row justify-space-between>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <a :href="fileDetails.link" target="_blank" download v-on="on">
                <v-icon color="primary" dark>
                  mdi-cloud-download-outline
                </v-icon>
              </a>
            </template>
            <span>Download</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <a :href="fileDetails.link" target="_blank" v-on="on">
                <v-icon color="primary" dark>
                  mdi-open-in-new
                </v-icon>
              </a>
            </template>
            <span>Open</span>
          </v-tooltip>
        </v-layout>
      </v-layout>
    </v-navigation-drawer>
    <Loader v-if="loading" />
    <v-layout align-center justify-space-between row wrap>
      <v-flex sm12 md2>
        <v-select
          v-model="fileType"
          :items="fileTypes"
          label="All Types"
          solo
          dense
          class="shadow"
        ></v-select>
      </v-flex>
      <v-flex sm12 md3>
        <v-text-field
          v-model="searchFiles"
          label="Search Files"
          single-line
          solo
          prepend-inner-icon="mdi-magnify"
          dense
          class="shadow"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <p class="font-weight-medium body-2">
      Folders ({{ filteredFolders.length }})
    </p>
    <div class="files mb-5">
      <Folder
        v-for="(folder, index) in filteredFolders"
        :key="index"
        :folder-name="folder.dirname"
        :folder-id="folder._id"
        class="my-2"
        :last-updated="folder.updatedAt"
        @foldersSelected="handleMultipleFolders($event, folder)"
        @moveFolder="moveFolder"
        @moveFolderToBin="moveFolderToBin"
        @viewDetails="showFolderDetails"
      />
    </div>
    <p class="font-weight-medium body-2">Files ({{ filteredFiles.length }})</p>
    <div class="files mb-5 pb-5">
      <File
        v-for="file in filteredFiles"
        :key="file.file_url"
        :format="file.file_extension"
        :name="file.filename"
        :file-id="file._id"
        :size="file.file_size"
        :last-edited="file.updatedAt"
        class="my-2"
        @filesSelected="handleMultipleFiles($event, file)"
        @moveFile="moveFile"
        @moveToBin="moveToBin"
        @deleteFile="deleteFile"
        @viewDetails="showFileDetails"
        @previewFile="previewFile(file)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Moment from 'moment';
import Loader from '@/components/Loader';
import File from '@/components/File';
import Folder from '@/components/Folder';
import Preview from '@/components/FilePreview';
import { EventBus } from '../plugins/eventBus';

export default {
  layout: 'drive',
  components: { File, Folder, Loader, Preview },
  filters: {
    date(val) {
      if (val) {
        return Moment(val).format('MMMM Do YYYY');
      }
      return null;
    },
  },
  props: {
    folders: {
      type: Array,
      default: () => {},
    },
    fileKey: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    routeName: '',
    loading: false,
    searchFiles: '',
    fileTypes: ['pdf', 'Spreadsheets', 'Presentations'],
    fileType: '',
    selectedFiles: [],
    selectedFolders: [],
    allFiles: [],
    showDrawer: false,
    loadingDetails: false,
    fileDetails: '',
    previewData: null,
    showPreview: false,
    globalSearchDirectories: null,
    globalSearchFiles: null,
    error: { status: false, message: '' },
    success: { status: false, message: '' },
  }),
  computed: {
    ...mapGetters(['getFolders', 'isLoggedIn', 'getUser']),
    filteredFiles() {
      if (this.globalSearchFiles) {
        const files = this.globalSearchFiles.filter((el) => {
          return el.filename
            .toLowerCase()
            .includes(this.searchFiles.toLowerCase());
        });
        return files;
      }
      const files = this.allFiles.filter((el) => {
        return el.filename
          .toLowerCase()
          .includes(this.searchFiles.toLowerCase());
      });
      return files;
    },
    filteredFolders() {
      if (this.globalSearchDirectories) {
        const folders = this.globalSearchDirectories.filter((el) => {
          return el.dirname
            .toLowerCase()
            .includes(this.searchFiles.toLowerCase());
        });
        return folders;
      }
      const subFolders = this.getFolders.filter(
        (folder) => folder.parent_dir === this.$route.params.name
      );
      const folders = subFolders.filter((el) => {
        return el.dirname
          .toLowerCase()
          .includes(this.searchFiles.toLowerCase());
      });
      return folders;
    },
  },
  mounted() {
    const token = this.isLoggedIn(this);
    this.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.getFolderDetails();
    EventBus.$on('addedNewFile', this.getFolderDetails);
    EventBus.$on('addedNewFolder', this.getFolderDetails);
    EventBus.$on('moved', this.getFolderDetails);
    EventBus.$on('searchFound', this.handleGlobalSearch);
    EventBus.$on('clearSearch', this.clearGlobalSearch);
  },
  beforeDestroy() {
    this.$store.dispatch(
      'removeBreadCrumb',
      `/folder/${this.$route.params.name}`
    );
  },
  methods: {
    handleGlobalSearch(e) {
      this.globalSearchDirectories = e.directories;
      this.globalSearchFiles = e.files;
    },
    clearGlobalSearch() {
      this.globalSearchDirectories = null;
      this.globalSearchFiles = null;
    },
    isImage(details) {
      if (details) {
        const fileType = details.type.split('/')[1];
        const types = [
          'png',
          'jpeg',
          'jpg',
          'gif',
          'mp4',
          'mp3',
          'webp',
          'svg',
        ];
        if (types.includes(fileType)) {
          return true;
        }
        return false;
      }
    },
    previewFile(file) {
      const fileDetails = {
        type: file.file_type,
        url: file.file_url,
      };
      const isImage = this.isImage(fileDetails);
      const data = {
        isImage,
        ...file,
      };
      this.previewData = data;
      this.showPreview = true;
    },
    getUserInitials(fullName) {
      if (fullName) {
        const initials = fullName.split(' ').reduce((join, name) => {
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
    deleteFolder(e) {
      this.loading = true;
      const user = this.getUser(this);
      this.$axios
        .delete(`directory/deleteDirectory/${e}`)
        .then(() => {
          EventBus.$emit('hideAction');
          this.getFolderDetails();
          this.$store.dispatch('fetchFolders', user.id);
        })
        .catch((err) => {
          EventBus.$emit('hideAction');
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    moveToBin(e) {
      this.showDialog = false;
      const user = this.getUser(this);
      this.loading = true;
      this.$axios
        .put('/files/single/bin', { _id: `${e}`, user_id: user.id })
        .then(() => {
          this.fetchUserFiles(user.id, 0);
          this.loading = false;
          this.success.status = true;
          this.success.message = 'File has successfully been moved to bin';
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    deleteFile(e) {
      this.loading = true;
      this.$axios
        .delete('/files', { data: { file_id: e } })
        .then(() => {
          this.getFolderDetails();
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    getFolderDetails() {
      if (this.$route.params.name !== undefined) {
        this.loading = true;
        this.$axios
          .get(`directory/${this.$route.params.name}`)
          .then(({ data }) => {
            this.loading = false;
            this.$store.dispatch('addBreadCrumbs', {
              text: data.directory.dirname,
              href: window.location.pathname,
              disabled: true,
            });
            this.$emit('folderName', data.directory.dirname);
            this.$store.dispatch('saveCurrentLevel', data.directory.level);
            this.allFiles = data.files;
            this.emitFileLength();
          })
          .catch(() => {
            this.loading = false;
            // console.log(err.response);
          });
      }
    },
    moveFolderToBin(e) {
      this.showDialog = false;
      const user = this.getUser(this);
      this.loading = true;
      this.$axios
        .put('/directory/single/bin', { _id: `${e}`, user_id: user.id })
        .then(() => {
          this.$store.dispatch('fetchFolders', user.id);
          this.loading = false;
          this.success.status = true;
          this.success.message = 'Folder has successfully been moved to bin';
          EventBus.$emit('hideAction');
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    showFolderDetails(id) {
      let folderDetails = {};
      this.showDrawer = true;
      this.loadingDetails = true;
      this.$axios.get(`directory/${id}`).then(({ data }) => {
        this.loadingDetails = false;
        folderDetails.name = data.directory.dirname;
        folderDetails.lastUpdated = Moment(data.directory.updatedAt).fromNow();
        folderDetails.owner = data.directory.user_id.full_name;
        this.fileDetails = folderDetails;
        this.fileDetails.logs = data.logs;
      });
    },
    showFileDetails([e, icon]) {
      let fileDetails = {};
      this.showDrawer = true;
      this.loadingDetails = true;
      fileDetails.icon = icon;
      this.$axios.get(`files/${e}`).then(({ data }) => {
        this.loadingDetails = false;
        fileDetails.name = data.file.filename;
        fileDetails.lastUpdated = Moment(data.file.updatedAt).fromNow();
        fileDetails.owner = data.file.user_id.full_name;
        fileDetails.link = data.file.file_url;
        this.fileDetails = fileDetails;
        this.fileDetails.logs = data.logs;
      });
    },
    emitFileLength() {
      const subFolders = this.getFolders.filter(
        (folder) => folder.parent_dir === this.$route.params.name
      );
      const length = subFolders.length + this.allFiles.length;
      EventBus.$emit('fileLength', length);
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar::v-deep {
  min-height: 100px;
  .v-toolbar__content {
    display: block;
    padding: 0;
  }
}

.count {
  margin-bottom: 0;
  margin-left: 5px;
  font-size: 1.5em;
  opacity: 0.7;
}

.my-drive {
  padding: 20px;
  height: calc(100vh - 16vh);
  padding-bottom: 50px;
  position: relative;
  overflow-y: auto;
  .link {
    text-decoration: none;
    color: rgba($color: #000000, $alpha: 0.87);
  }
}

.files {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(215px, 215px));
  justify-content: center;
  gap: 15px;

  @media only screen and (min-width: 768px) {
    justify-content: flex-start;
  }
}

.shadow::v-deep {
  .v-input__slot {
    // box-shadow: 0px 3px 1px -2px rgba(68, 86, 108, 0.2),
    //   0px 2px 2px 0px rgba(68, 86, 108, 0.14),
    //   0px 1px 5px 0px rgba(68, 86, 108, 0) !important;
    box-shadow: 1px 4px 7px rgba(68, 86, 108, 0.1) !important;
  }
}

.file-details {
  list-style-type: none;
}

.file-actions {
  width: 100%;
  max-height: 50px;
  a {
    height: fit-content;
    text-decoration: none;
  }
}

.divider {
  width: 100%;
  height: 1px;
}

.small--text {
  font-size: 14px;
  white-space: normal;
}
</style>
