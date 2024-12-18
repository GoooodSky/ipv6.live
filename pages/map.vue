<template>
  <section id="map">
    <keep-alive>
      <Map />
    </keep-alive>
  </section>
</template>

<script>
import Map from "@/components/university/university-distribution";
export default {
  components: {
    Map
  }
};
</script>

<style>
</style>