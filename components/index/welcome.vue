<template>
  <main id="welcome">
    <section class="welcome-logo">
      <img src="../../assets/img/ipv4toipv6.png" alt="Logo" />
    </section>
    <section class="welcome-button">
      <input
        v-model="universityInput"
        class="welcome-button-input"
        type="text"
        placeholder="输入高校名称"
        v-on:keyup.enter="$store.dispatch('detailVisible', universityInput)"
      />
      <button class="welcome-button-clear" type="button" name="button" @click="clearInput()" v-if="universityInput">
        <i class="el-icon-error"></i>
      </button>
      <button class="welcome-button-search" type="button" name="button" @click="$store.dispatch('detailVisible', universityInput)">
        探测
      </button>
      <section class="suggestions" v-if="suggestions">
        <div>
          <ul>
            <li v-for="university in suggestions" :key="university" @click="handleClick(university)">
              <span v-html="highlight(university)"></span>
            </li>
          </ul>
        </div>
      </section>
    </section>
    <section class="visitor-status">
      <VisitorStatus />
    </section>
  </main>
</template>

<script>
import VisitorStatus from '@/components/utils/visitor-status'
export default {
  data() {
    return { universityInput: null }
  },
  components: { VisitorStatus },
  computed: {
    suggestions() {
      let suggestions = this.$store.state.universityList
        .filter(university => {
          return this.universityInput && university.name.includes(this.universityInput)
        })
        .map(university => university.name)
      if (suggestions.length) return suggestions
      else return null
    }
  },
  methods: {
    handleClick(university) {
      this.universityInput = university
    },
    highlight(university) {
      return university.replace(this.universityInput, `<b style="color:#409EFF">${this.universityInput}</b>`)
    },
    clearInput() {
      this.universityInput = null
    }
  }
}
</script>

<style lang="scss" scoped>
#welcome {
  position: relative;
  width: 100vw;
  height: 90vw;
  max-height: 100vh;
  background-color: #004881;
  .welcome-logo {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: visible;
    img {
      width: 100px;
      height: 100px;
      clip-path: circle(43%);
      z-index: 10;
      cursor: pointer;
      transition: 0.5s;
      animation: logo 2s infinite alternate;
      &:hover {
        transform: rotateZ(360deg);
      }
    }
  }
  .welcome-button {
    position: relative;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    max-width: 80vw;
    height: 2.5rem;
    .welcome-button-input {
      box-sizing: border-box;
      box-shadow: 0 0 25px 0 #004881, 0 20px 25px 0 rgba(0, 0, 0, 0.2);
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 1.5rem;
      outline: 0;
      border: 0px;
      font-size: 1rem;
      padding: 0 1rem;
    }
    .welcome-button-clear {
      position: absolute;
      border: 0;
      background-color: transparent;
      cursor: pointer;
      outline: 0;
      height: 2.5rem;
      right: 50px;
    }
    .welcome-button-search {
      position: absolute;
      right: 0;
      outline: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 1.5rem;
      background-color: #004881;
      border: 1px solid #fff;
      color: #fff;
      cursor: pointer;
    }
  }
  .suggestions {
    position: relative;
    top: 50px;
    border: 4px solid #004881;
    ul {
      background-color: #fff;
      padding: 10px;
      max-height: 150px;
      overflow: scroll;
      li {
        list-style: none;
        padding: 5px;
        font-size: 15px;
        cursor: pointer;
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
  .visitor-status {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 1rem;
    z-index: 1;
  }
}
@keyframes logo {
  form {
    clip-path: circle(43%);
  }
  to {
    clip-path: circle(50%);
  }
}
</style>
