<template>
  <v-container grid-list-md>
    <v-snackbar v-if="error.status" v-model="error.status" :timeout="5000">
      {{ error.message }}
      <v-btn color="red" text @click="error.status = false">
        Close
      </v-btn>
    </v-snackbar>
    <Loader v-if="isLoading" />
    <p class="font-weight-medium body-2">
      Users that have shared files/folders with this User
    </p>
    <div class="users">
      <v-layout
        v-for="sharer in sharers"
        :key="sharer.id"
        class="user"
        column
        justify-center
        align-center
      >
        <v-avatar
          v-if="sharer.picture"
          size="70px"
          item
          class="mx-2 user-avatar"
        >
          <v-img :src="sharer.picture" alt="User Image" />
        </v-avatar>
        <v-avatar
          v-else
          size="70px"
          color="primary"
          item
          class="mx-2 user-avatar"
        >
          <span class="white--text font-weight-medium">
            {{ sharer.initials }}
          </span>
        </v-avatar>
        <p class="subtitle-2 font-weight-black my-3">{{ sharer.full_name }}</p>
        <nuxt-link
          :to="`/admin/shared/${$route.params.id}/${sharer.id}`"
          class="user-link"
        >
          View File
        </nuxt-link>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import Loader from '@/components/Loader';

export default {
  layout: 'adminDrive',
  components: { Loader },
  data: () => ({
    user: '',
    sharers: '',
    isLoading: false,
    error: { status: false, message: '' },
  }),
  computed: {
    ...mapGetters(['isLoggedIn', 'getUser']),
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
    this.$store.dispatch('fetchUser', this.$route.params.id).then(() => {
      const userInView = this.$store.getters.getUserDetails;
      this.user = userInView;
      this.fetchSharedUsers();
    });
    this.$axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  methods: {
    fetchSharedUsers() {
      this.isLoading = true;
      this.$axios
        .post('/admin/sharers', { user_id: this.user.user._id })
        .then(({ data }) => {
          const sharers = [
            ...this.handleObjData(data.file_sharers),
            ...this.handleObjData(data.directory_sharers),
          ];
          console.log('sharers', sharers);
          this.sharers = sharers.filter((el, index, self) => {
            const elIndex = self.findIndex((item) => item.id === el.id);
            return index === elIndex;
          });
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
          this.error.status = true;
          this.error.message = 'Something went wrong, Please try again';
        });
    },
    getInitials(fullName) {
      const initials = fullName.split(' ').reduce((join, name) => {
        return `${join}${name[0]}`;
      }, '');
      if (initials.length > 2) {
        return `${initials[0]}${initials[1]}`;
      } else {
        return initials;
      }
    },
    handleObjData(data) {
      const keys = Object.keys(data);
      const result = [];
      if (keys.length > 0) {
        keys.forEach((key) => {
          const obj = {
            id: key,
            full_name: data[key].full_name,
            initials: this.getInitials(data[key].full_name),
            picture: data[key].profile_pic,
          };
          result.push(obj);
        });
      }
      return result;
    },
  },
  head() {
    return {
      title: 'Shared',
    };
  },
};
</script>

<style lang="scss" scoped>
.users {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 200px));
  justify-content: center;
  gap: 15px;

  @media only screen and (min-width: 768px) {
    justify-content: flex-start;
  }

  .user {
    background-color: white;
    border-radius: 12px;
    width: 200px;
    height: 180px;
    box-shadow: 0px 1px 2px rgba($color: #000000, $alpha: 0.2);
    transition: box-shadow 0.2s ease-out;
    &:hover {
      box-shadow: 0px 4px 7px rgba($color: #000000, $alpha: 0.2);
      // box-shadow: 0px 5px 8px rgba($color: #000000, $alpha: 0.2),
      //   2px 5px 8px rgba($color: #000000, $alpha: 0.2);
    }
    &-avatar {
      border: 4px solid #1976d2;
    }

    &-link {
      text-decoration: none;
      font-size: 0.92rem;
    }
  }
}
</style>
