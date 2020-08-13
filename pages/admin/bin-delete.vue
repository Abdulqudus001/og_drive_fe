<template>
  <v-container grid-list-md class="my-drive">
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
        <v-layout class="file-actions px-8" row justify-space-between>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <a :href="fileDetails.link" download v-on="on">
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
    <v-layout align-center justify-space-between row wrap>
      <v-flex sm12 md2> </v-flex>
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
      Folders
    </p>
    <div class="files mb-5">
      <Folder
        v-for="(folder, index) in filteredFolders"
        :key="index"
        :folder-name="folder.dirname"
        :folder-id="folder._id"
        class="my-2"
        :last-updated="folder.updatedAt"
        @deleteFolder="handleFolderDelete"
        @revertFolder="revertFolder"
        @foldersSelected="handleMultipleFolders($event, folder)"
      />
    </div>
    <p class="font-weight-medium body-2">
      Files
    </p>
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
        @revert="revert"
        @viewDetails="showFileDetails"
        @deleteFile="handleFileDelete"
      />
    </div>
    <v-dialog v-model="showFolderDialog" max-width="360">
      <v-card>
        <v-card-title class="headline">
          Are you sure?
        </v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="darken-1" text @click="showFolderDialog = false">
            Cancel
          </v-btn>

          <v-btn color="red px-5" @click="deleteFolder(folderId)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialog" max-width="360">
      <v-card>
        <v-card-title class="headline">
          Are you sure?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="darken-1" text @click="showDialog = false">
            Cancel
          </v-btn>

          <v-btn color="red px-5" @click="deleteFile(fileId)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import Moment from 'moment';
import File from '@/components/SuperAdminBinFileDelete';
import Folder from '@/components/SuperAdminBinFolderDelete';
import Loader from '@/components/Loader';
import { EventBus } from '../../plugins/eventBus';

export default {
  layout: 'adminBinDelete',
  components: { File, Folder, Loader },
  middleware: 'authenticated',
  data: () => ({
    tempDate: new Date(2020, 3, 22),
    searchFiles: '',
    fileTypes: ['pdf', 'Spreadsheets', 'Presentations'],
    fileType: '',
    selectedFiles: [],
    selectedFolders: [],
    fileId: null,
    folderId: null,
    loading: false,
    error: { status: false, message: '' },
    success: { status: false, message: '' },
    loadingDetails: false,
    fileDetails: '',
    showDrawer: false,
    currentFileName: '',
    currentFolderName: '',
    showDialog: false,
    showFolderDialog: false,
    fileName: '',
    folderName: '',
    fileToDeleteDetails: [],
    folderToDeleteDetails: [],
    deletedItem: {},
  }),
  computed: {
    ...mapGetters([
      'getBreadCrumbs',
      'getFiles',
      'isLoggedIn',
      'getFolders',
      'getUser',
      'getAdminBin',
      'getAdminBinFolders',
      'getBinFolders',
      'getFilesToDelete',
      'getFoldersToDelete',
    ]),
    filteredFiles() {
      const files = this.getFilesToDelete.filter((el) => {
        return el.filename
          .toLowerCase()
          .includes(this.searchFiles.toLowerCase());
      });
      return files;
    },
    filteredFolders() {
      const folders = this.getFoldersToDelete.filter((el) => {
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
    // this.$store.dispatch('fetchUser', this.$route.params.id).then(() => {
    //   const userInView = this.$store.getters.getUserDetails;
    //   this.$store.dispatch('fetchAdminBinFiles', userInView.user._id);
    //   this.$store.dispatch('fetchAdminBinFolders', userInView.user._id);
    // });
    this.$store.dispatch('fetchAdminStuffToBeDeleted');
    // this.fetchStuffToDelete();
    // const user = this.getUser(this);
    // this.$store.dispatch('fetchFolders', user.id);
    // this.fetchUserFiles(user.id, 0);
    // EventBus.$on('filesFetched', this.emitFileLength);
    // this.$store.dispatch('fetchBinFiles', user.id);
    // this.$store.dispatch('fetchBinFolders', user.id);
  },
  methods: {
    handleFileDelete(e) {
      this.fileId = e;
      this.showDialog = true;
    },
    handleFolderDelete(e) {
      this.folderId = e;
      this.showFolderDialog = true;
    },
    deleteFolder(e) {
      this.showFolderDialog = false;
      this.loading = true;
      this.$axios
        .delete(`directory/${e}`)
        .then(() => {
          this.$store.dispatch('fetchAdminStuffToBeDeleted');
          this.loading = false;
          this.success.status = true;
          this.success.message = 'Folder has been deleted';
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    deleteFile(e) {
      this.showDialog = false;
      this.loading = true;
      this.$axios
        .delete(`/files/${e}`)
        .then(() => {
          this.$store.dispatch('fetchAdminStuffToBeDeleted');
          this.loading = false;
          this.success.status = true;
          this.success.message = 'File has been deleted';
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    revert(e) {
      this.showDialog = false;
      //const user = this.getUser(this);
      const userInView = this.$store.getters.getUserDetails;
      this.loading = true;
      this.$axios
        .put('files/sadmin/single/revert', {
          _id: `${e}`,
          user_id: userInView.user._id,
        })
        .then(() => {
          this.$store.dispatch('fetchAdminBinFiles', userInView.user._id);
          this.loading = false;
          this.success.status = true;
          this.success.message = 'File has successfully been reverted';
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    revertFolder(e) {
      this.showDialog = false;
      const userInView = this.$store.getters.getUserDetails;
      this.loading = true;
      this.$axios
        .put('/directory/sadmin/single/revert', {
          _id: `${e}`,
          user_id: userInView.user._id,
        })
        .then(() => {
          window.location.reload();
          this.$store.dispatch('fetchAdminBinFolders', userInView.user._id);
          this.loading = false;
          this.success.status = true;
          this.success.message = 'Folder has successfully been reverted';
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
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
      });
    },
    emitFileLength() {
      const subFolders = this.getFolders.filter((folder) => !folder.parent_dir);
      const length = subFolders.length + this.getFiles.length;
      EventBus.$emit('fileLength', length);
    },
  },
  head() {
    return {
      title: 'Bin',
    };
  },
};
</script>

<style lang="scss" scoped>
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
  gap: 10px;

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
</style>
