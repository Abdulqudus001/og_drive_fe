<template>
  <v-container grid-list-md class="my-drive">
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
              <a
                v-if="isImage(fileDetails)"
                :href="fileDetails.link"
                target="_blank"
                v-on="on"
              >
                <v-icon color="primary" dark>
                  mdi-open-in-new
                </v-icon>
              </a>
              <a
                v-else
                :href="`https://docs.google.com/viewerng/viewer?url=${fileDetails.link}`"
                target="_blank"
                v-on="on"
              >
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
      Folders ({{ filteredFolders.length }})
    </p>
    <div class="files mb-5">
      <Folder
        v-for="(folder, index) in userFolders"
        :key="index"
        :folder-name="folder.dirname"
        :folder-id="folder._id"
        class="my-2"
        :last-updated="folder.updatedAt"
        @deleteFolder="handleFolderDelete"
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
        @deleteFile="handleFileDelete"
        @viewDetails="showFileDetails"
        @previewFile="previewFile(file)"
      />
    </div>
    <v-dialog v-model="showFolderDialog" max-width="360">
      <v-card>
        <v-card-title class="headline">
          Delete Folder
        </v-card-title>

        <v-card-text>
          <p>
            This is going to permanently remove this folder and all its content
            from your drive. Enter the file name below to delete.
            <b>File Name: {{ currentFolderName }}</b>
          </p>
          <v-text-field v-model="folderName" label="Folder Name" />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="darken-1" text @click="showFolderDialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="red px-5"
            :disabled="!folderName || folderName !== currentFolderName"
            @click="deleteFolder(folderToDeleteDetails[0])"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialog" max-width="360">
      <v-card>
        <v-card-title class="headline">
          Delete File
        </v-card-title>

        <v-card-text>
          <p>
            This is going to permanently remove this file from your drive. Enter
            the file name below to delete.
            <b>File Name: {{ currentFileName }}</b>
          </p>
          <v-text-field v-model="fileName" label="File Name" />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="darken-1" text @click="showDialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="red px-5"
            :disabled="!fileName || fileName !== currentFileName"
            @click="deleteFile(fileToDeleteDetails[0])"
          >
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
import File from '@/components/File';
import Folder from '@/components/Folder';
import Loader from '@/components/Loader';
import Preview from '@/components/FilePreview';
import { EventBus } from '../../../plugins/eventBus';

export default {
  layout: 'admin-drive',
  components: { File, Folder, Loader, Preview },
  middleware: 'authenticated',
  data: () => ({
    tempDate: new Date(2020, 3, 22),
    searchFiles: '',
    fileTypes: ['pdf', 'Spreadsheets', 'Presentations'],
    fileType: '',
    selectedFiles: [],
    loading: false,
    error: { status: false, message: '' },
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
    showPreview: false,
    previewData: null,
  }),
  computed: {
    ...mapGetters([
      'getBreadCrumbs',
      'getFiles',
      'isLoggedIn',
      'getFolders',
      'getUser',
      'getUserDirectories',
    ]),
    filteredFiles() {
      if (this.globalSearchFiles) {
        const files = this.globalSearchFiles.filter((el) => {
          return el.filename
            .toLowerCase()
            .includes(this.searchFiles.toLowerCase());
        });
        return files;
      }
      const files = this.getFiles.filter((el) => {
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
      const subFolders = this.getFolders.filter((folder) => !folder.parent_dir);
      const folders = subFolders.filter((el) => {
        return el.dirname
          .toLowerCase()
          .includes(this.searchFiles.toLowerCase());
      });
      return folders;
    },
    userFolders() {
      const subFolders = this.getUserDirectories.filter(
        (folder) => !folder.parent_dir
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
    const user = this.getUser(this);
    this.fetchUserDirectories();
    this.fetchUserFiles(user.id, 0);
    EventBus.$on('filesFetched', this.emitFileLength);
  },
  methods: {
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
    handleFileDelete([id, name]) {
      this.fileToDeleteDetails.push(id, name);
      this.currentFileName = name;
      this.showDialog = true;
    },
    handleFolderDelete([id, name]) {
      this.folderToDeleteDetails.push(id, name);
      this.currentFolderName = name;
      this.showFolderDialog = true;
    },
    deleteFolder(e) {
      this.showFolderDialog = false;
      this.loading = true;
      const user = this.getUser(this);
      this.$axios
        .delete(`directory/deleteDirectory/${e}`)
        .then(() => {
          this.$store.dispatch('fetchFolders', user.id);
          this.folderName = '';
          this.fetchUserFiles(user.id, 0);
          this.emitFileLength();
        })
        .catch((err) => {
          this.loading = false;
          this.error.status = true;
          this.error.message = err.response.data.message;
        });
    },
    deleteFile(e) {
      this.showDialog = false;
      const user = this.getUser(this);
      this.loading = true;
      this.$axios
        .delete('/files', { data: { file_id: e } })
        .then(() => {
          this.fetchUserFiles(user.id, 0);
          this.loading = false;
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
      title: 'Users Drive',
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
