<template>
  <div>
    <f-block block>
      <div class="q-pa-md text-center">
        <fdev-select
          use-input
          hide-dropdown-icon
          hide-selected
          transition-show="jump-down"
          transition-hide="jump-down"
          :options="usersOptions"
          option-label="user_name_cn"
          option-value="id"
          v-model="inputValue"
          class="input-width"
          @filter="filteredUsers"
          @input="selectUser"
        >
          <template v-slot:append>
            <f-icon name="search" />
          </template>

          <template v-slot:option="scope">
            <fdev-item v-bind="scope.itemProps" v-on="scope.itemEvents">
              <fdev-item-section>
                <fdev-item-label :title="scope.opt.user_name_cn">
                  {{ scope.opt.user_name_cn }}
                </fdev-item-label>
                <fdev-item-label caption :title="scope.opt.user_name_en">
                  {{ scope.opt.user_name_en }}
                </fdev-item-label>
              </fdev-item-section>
            </fdev-item>
          </template>
        </fdev-select>
      </div>
      <fdev-separator inset />
      <div class="q-pa-sm">
        <span class="text-grey-9">所属小组：</span>
        <span
          class="text-primary q-ml-md float-right cursor-pointer"
          @click="reset"
        >
          重置
        </span>
        <span class="text-primary float-right cursor-pointer" @click="close">
          {{ open ? '展开' : '收起' }}
        </span>
        <GroupsTree
          v-model="selectedList"
          class="bg-white q-mt-sm"
          :data="groupsData"
          ref="groupsTree"
          firstData="5c81c4d0d3e2a1126ce30049"
        />
      </div>
      <div class="q-pa-sm">
        <span class="text-grey-9">所属公司(默认全选)：</span>
        <span
          class="text-primary q-ml-md float-right cursor-pointer"
          @click="resetCompany"
        >
          重置
        </span>
        <span
          v-if="company.length > 0"
          class="text-primary float-right cursor-pointer"
          @click="closeCompany = !closeCompany"
        >
          {{ closeCompany ? '收起' : '展开' }}
        </span>
        <div :class="closeCompany ? 'user-wrapper' : 'user-wrapper-close'">
          <div class="col q-mt-xs" v-if="company.length > 0">
            <button
              v-for="(item, index) in company"
              :key="index"
              class="q-mr-md q-mb-sm btn"
              :class="{
                'text-white bg-primary': item.selected === true
              }"
              @click="selectCompany(item)"
            >
              {{ item.name }}
            </button>
          </div>
        </div>
      </div>

      <fdev-separator inset />

      <div class="q-ma-sm" v-if="!isFrameCom">
        <span class="text-grey-9">角色(默认全选)：</span>
        <div class="q-mt-xs">
          <button
            v-for="(item, index) in options"
            :key="index"
            class="q-mr-md btn"
            :class="{
              'text-white bg-primary': roles.indexOf(item.value) > -1
            }"
            @click="selectRole(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <fdev-separator inset />

      <div class="q-ma-sm">
        <span class="text-grey-9 inline-block">人员：</span>
        <span
          v-if="users.length > 0"
          class="text-primary q-ml-md float-right cursor-pointer"
          @click="selectAll"
        >
          全选
        </span>
        <span
          v-if="users.length > 0"
          class="text-primary float-right cursor-pointer"
          @click="closeUsers = !closeUsers"
        >
          {{ closeUsers ? '收起' : '展开' }}
        </span>
        <div :class="closeUsers ? 'user-wrapper' : 'user-wrapper-close'">
          <div class="col q-mt-xs" v-if="users.length > 0">
            <button
              v-for="(item, index) in users"
              :key="index"
              class="q-mr-md q-mb-sm btn"
              :class="{
                'text-white bg-primary': item.selected === true
              }"
              @click="selectUser(item)"
            >
              {{ item.user_name_cn }}
            </button>
          </div>
          <div class="col q-ml-sm" v-else>暂无</div>
        </div>
      </div>
    </f-block>
    <f-block block class="q-my-md">
      <span class="text-grey-9 inline-block">已选人员：</span>
      <span
        class="text-primary q-ml-md float-right cursor-pointer"
        @click="clearAll"
        v-if="userSelected.length > 0"
      >
        清除
      </span>
      <div>
        <button
          v-for="(item, index) in userSelected"
          :key="index"
          class="q-mr-md q-mb-sm btn"
          :class="{
            'text-white bg-primary': item.selected === true
          }"
          @click="selectUser(item)"
        >
          {{ item.user_name_cn }}
        </button>
      </div>
      <div class="text-center q-mt-sm">
        <fdev-btn label="查询" dialog @click="query" ficon="search"></fdev-btn>
        <fdev-btn-toggle
          v-if="!isFrameCom && toggle"
          v-model="showSwitch"
          class="float-right"
          @input="getInput"
          :options="[
            { label: '图表', value: 'chartShow' },
            { label: '表格', value: 'formShow' }
          ]"
        ></fdev-btn-toggle>
      </div>
    </f-block>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import GroupsTree from '@/components/GroupsTree';
import { deepClone, appendNode } from '@/utils/utils';

export default {
  name: 'UserSelected',
  components: { GroupsTree },
  data() {
    return {
      userList: [],
      showSwitch: 'chartShow',
      inputValue: null,
      selectedList: ['5c81c4d0d3e2a1126ce30049'],
      groupsData: [],
      usersOptions: [],
      open: false,
      selectedCompanyList: [],
      company: [],
      closeCompany: false,
      options: [
        { label: '创建者', value: 'creator' },
        { label: '开发人员', value: 'developer' },
        { label: '测试人员', value: 'tester' },
        { label: '行内项目负责人', value: 'spdb_master' },
        { label: '任务负责人', value: 'master' }
      ],
      roles: [],
      users: [],
      closeUsers: false,
      userSelected: []
    };
  },
  props: {
    toggle: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    nodes(val) {
      this.groupsData = deepClone(val);
    },
    selectedList(val) {
      this.filterByGroupOrCompany();
    },
    selectedCompanyList(val) {
      this.filterByGroupOrCompany();
    }
  },
  computed: {
    ...mapState('userForm', {
      groups: 'groups',
      companies: 'companies'
    }),
    ...mapState('dashboard', {
      usersList: 'userList'
    }),
    isFrameCom() {
      return this.$route.path.includes('frame');
    },
    nodes() {
      const root = this.groups.filter(group => !group.parent);
      const groupList = this.appendNode(
        root,
        this.groups.filter(group => group.id && group.parent)
      );
      return this.addAttribute(groupList);
    }
  },
  methods: {
    ...mapActions('userForm', ['fetchGroup', 'fetchCompany']),
    ...mapActions('dashboard', ['queryUserCoreData']),
    query() {
      this.$emit(
        'queryClick',
        this.userSelected,
        this.roles,
        this.selectedCompanyList,
        this.selectedList
      );
    },
    getInput() {
      this.$emit('switch', this.showSwitch);
    },
    setAttribute() {
      this.company = this.companies.map(item => {
        return {
          ...item,
          selected: false
        };
      });
    },
    selectCompany(company) {
      company.selected = !company.selected;
      this.selectedCompanyList = [];
      this.company.forEach(item => {
        if (item.selected === true) {
          this.selectedCompanyList.push(item.id);
        }
      });
    },
    selectRole(role) {
      const hadSelected = this.roles.indexOf(role);
      if (hadSelected > -1) {
        this.roles = this.roles.filter(item => item !== role);
      } else {
        this.roles.push(role);
      }
    },
    filteredUsers(val, update, abort) {
      if (!val) {
        update();
        this.usersOptions = [];
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.usersOptions = this.userList.filter(
          v =>
            v.user_name_cn.toLowerCase().indexOf(needle) > -1 ||
            v.user_name_en.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    /* 全选 */
    selectAll() {
      let flag = true;
      this.users.forEach(item => {
        if (item.selected === false) {
          flag = false;
        }
        item.selected = true;
      });
      if (flag) {
        return;
      }
      this.userSelected = this.userList.filter(item => item.selected === true);
    },
    clearAll() {
      this.userList.forEach(item => (item.selected = false));
      this.userSelected = [];
    },
    addAttribute(data) {
      if (!Array.isArray(data)) {
        return data;
      }
      return data.map(item => {
        return {
          ...item,
          expand: false,
          selected: item.id === '5c81c4d0d3e2a1126ce30049' ? true : false,
          children: this.addAttribute(item.children)
        };
      });
    },
    /* 根据小组公司筛选 */
    filterByGroupOrCompany() {
      if (this.selectedCompanyList.length === 0) {
        this.users = this.userList
          .filter(user => {
            return this.selectedList.indexOf(user.group_id) > -1;
          })
          .sort((a, b) => {
            return a.user_name_en.localeCompare(b.user_name_en);
          });
      } else {
        this.users = this.userList
          .filter(user => {
            return (
              this.selectedList.indexOf(user.group_id) > -1 &&
              this.selectedCompanyList.indexOf(user.company_id) > -1
            );
          })
          .sort((a, b) => {
            return a.user_name_en.localeCompare(b.user_name_en);
          });
      }
    },
    close() {
      this.open = this.$refs.groupsTree.open;
      this.$refs.groupsTree.closed();
    },
    appendNode(parent, set) {
      return appendNode(parent, set);
    },
    resetCompany() {
      this.selectedCompanyList = [];
      this.company.forEach(item => (item.selected = false));
    },
    /* 选择人员 */
    selectUser(user) {
      user.selected = !user.selected;
      this.userSelected = this.userList.filter(item => item.selected === true);
      this.inputValue = null;
    },
    reset() {
      /* 默认选择互联网应用 */
      this.selectedList = ['5c81c4d0d3e2a1126ce30049'];
      this.groupsData = deepClone(this.nodes);
      try {
        this.$refs.groupsTree.reset();
      } catch (error) {
        //
      }
    }
  },
  async created() {
    await this.fetchGroup();
    await this.fetchCompany();
    this.setAttribute();
    await this.queryUserCoreData();
    this.userList = [];
    this.usersList.forEach(item => {
      if (item.status === '0') {
        this.userList.push({ ...item, selected: false });
      }
    });
    this.filterByGroupOrCompany();

    // 不同的页面分别记住原进原出
    let searchObj;
    if (this.$route.name === 'realTimeParticipation') {
      searchObj = JSON.parse(sessionStorage.getItem('reamtimeObj'));
    } else if (this.$route.name === 'userOptimize') {
      searchObj = JSON.parse(sessionStorage.getItem('userOptimizeObj'));
    } else if (this.$route.name === 'taskOutput') {
      searchObj = JSON.parse(sessionStorage.getItem('taskOutputObj'));
      let dateObj = sessionStorage.getItem('dateObj');
      if (dateObj) this.showSwitch = JSON.parse(dateObj).showSwitch;
    }

    if (searchObj) {
      let ids, roles, companyList, groupList;
      ids = searchObj.ids || [];
      roles = searchObj.roles || [];
      companyList = searchObj.companyList || [];
      groupList = searchObj.groupList || ['5c81c4d0d3e2a1126ce30049'];

      this.userList.forEach((item, index) => {
        if (
          ids.some(user => {
            return user.id === item.id;
          })
        ) {
          item.selected = true;
        }
      });
      this.userSelected = this.userList.filter(item => item.selected === true);
      this.roles = roles;
      this.selectedList = groupList || ['5c81c4d0d3e2a1126ce30049'];
      this.selectedCompanyList = companyList || [];
      this.company.forEach((item, index) => {
        if (this.selectedCompanyList.indexOf(item.id) !== -1) {
          item.selected = true;
        }
      });
      this.filterByGroupOrCompany();
    }
  }
};
</script>

<style lang="stylus" scoped>
button
  border none
  outline none
  background none
  cursor pointer
.user-wrapper-close
  height 31px
  overflow hidden
.input-width
  width 300px
  margin 0 auto
.btn
  cursor pointer
  color #757575
  &:hover
      background #ebeef5
.input
  min-width 230px
</style>
