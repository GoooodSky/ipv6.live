<template>
  <div>
    <Header />
    <nuxt />
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
export default {
  components: {
    Header,
    Footer
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
