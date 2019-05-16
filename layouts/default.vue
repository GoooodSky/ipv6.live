<template>
  <div>
    <Header />
    <nuxt />
  </div>
</template>

<script>
import Header from '@/components/header/header'
export default {
  components: {
    Header
  }
}
</script>

<style>
*{
  padding: 0;
  margin: 0;
}
</style>
