<template>
  <v-container grid-list-md class="my-drive">
    <Loader v-if="isLoading" />
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
        justify-space-between
        align-center
        class="fill-height"
      >
        <img :src="fileDetails.icon" alt="" width="100px" />
        <ul class="pl-0 file-details">
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
    <p class="font-weight-medium body-2">Folders ({{ allFolders.length }})</p>
    <div class="files mb-5">
      <Folder
        v-for="(folder, index) in allFolders"
        :key="index"
        :folder-name="folder.dirname"
        :folder-id="folder._id"
        class="my-2"
        hide-options
        :last-updated="folder.updatedAt"
        @viewDetails="showFolderDetails"
      />
    </div>
    <p class="font-weight-medium body-2">Files ({{ allFiles.length }})</p>
    <div class="files mb-5 pb-5">
      <File
        v-for="file in allFiles"
        :key="file.file_url"
        :format="file.file_extension"
        :name="file.filename"
        :size="file.file_size"
        :file-id="file._id"
        :last-edited="file.updatedAt"
        hide-options
        class="my-2"
        @viewDetails="showFileDetails"
      />
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import Moment from 'moment';
import Loader from '@/components/Loader';
import File from '@/components/SuperAdminFile';
import Folder from '@/components/SuperAdminFolder';
import { EventBus } from '../../../../../plugins/eventBus';

export default {
  layout: 'adminDrive',
  components: { Loader, File, Folder },
  filters: {
    date(val) {
      if (val) {
        return Moment(val).format('MMMM Do YYYY');
      }
      return null;
    },
  },
  data: () => ({
    user: '',
    folders: [],
    files: [],
    isLoading: false,
    showDrawer: false,
    fileDetails: {},
    loadingDetails: false,
  }),
  computed: {
    ...mapGetters(['getUser', 'isLoggedIn']),
    allFiles() {
      if (this.globalSearchFiles) {
        return this.globalSearchFiles;
      }
      return this.files;
    },
    allFolders() {
      if (this.globalSearchDirectories) {
        return this.globalSearchDirectories;
      }
      return this.folders;
    },
  },
  mounted() {
    const token = this.isLoggedIn(this);
    const params = this.$route.path.split('/');
    console.log('params', params[3]);
    this.$store.dispatch('fetchUser', params[3]).then(() => {
      const userInView = this.$store.getters.getUserDetails;
      this.user = userInView;
      this.fetchSharedFiles();
    });
    this.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  methods: {
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
    fetchSharedFiles() {
      this.isLoading = true;
      const data = {
        _id: this.$route.params.name,
        user_id: this.user.user._id,
      };
      this.$axios
        .post('admin/sharers/details', data)
        .then(({ data }) => {
          this.isLoading = false;
          this.files = data.files;
          this.folders = data.directories;
          const totalFileLength = this.files.length + this.folders.length;
          EventBus.$emit('fileLength', totalFileLength);
        })
        .catch((err) => {
          throw Error(err);
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
  },
  head() {
    return {
      title: 'Shared with me',
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
  gap: 15px;

  @media only screen and (min-width: 768px) {
    justify-content: flex-start;
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

.trails {
  width: 100%;
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
