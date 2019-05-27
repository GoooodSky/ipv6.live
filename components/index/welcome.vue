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
      <button class="welcome-button-search" type="button" name="button" @click="$store.dispatch('detailVisible', universityInput)">
        探测
      </button>
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
    return { universityInput: '' }
  },
  components: { VisitorStatus }
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
    .welcome-button-search {
      position: absolute;
      right: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 1.5rem;
      background-color: #004881;
      // border:0;
      border: 1px solid #fff;
      // border-top: 1px solid trasparent;
      // border-bottom: 1px solid trasparent;
      // border-left: 1px solid trasparent;
      color: #fff;
      cursor: pointer;
    }
  }
  .visitor-status {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 1rem;
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
