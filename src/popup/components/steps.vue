<template>
  <div class="steps">
    <div class="step" :class="{active: step >= 0}"></div>
    <div class="step-line" :class="{active: step > 0}"></div>
    <div class="step" :class="{active: step > 0}"></div>
    <div class="step-line" :class="{active: step > 1}"></div>
    <div class="step" :class="{active: step > 1}"></div>
  </div>
</template>
<script>
export default {
  props: ['step'],
};
</script>
<style>
.steps {
  align-items: center;
  margin: 0;
  display: flex;
  padding-bottom: 30px;
}

.step {
  height: 7px;
  width: 7px;
  background-color: #D8D8D8;
  border-radius: 50%;
}

.steps .active {
  background-color: #5368E7;
}

.step-line {
  height: 1px;
  width: 272px;
  background-color: #D8D8D8;
}
</style>
