<template>
  <div>
    <label class="switch">
      <input type="checkbox">
      <span class="slider round" v-on:click="swapNet"></span>
      <p class="switch__label">Testnet</p>
    </label>
    <div class="header-container">
        <div class="header">
          <img :src=networks[network].img alt="lamden" height="128" width="128" class="logo__img" id="logo__img">
          <h1>{{ networks[network].title }}</h1>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['storage'],
  data: () => ({
    network: "TAU",
    networks: {
      "TAU": {
        title: "TAU",
        img: "/images/logo_lamden_color.svg",
      },
      "DarkTAU": {
        title: "DarkTAU",
        img: "/images/darktau.svg",
      }
    },
  }),
  computed: {
  },
  created() {
  },
  methods: {
    swapNet() {
      if (this.network == "TAU") {
        this.network = "DarkTAU"
      } else {
        this.network = "TAU"
      }
    }
  },
  components: {
  },
};
</script>

<style>
.header h1 {
  font-family: Avenir-Light;
  font-weight: 400;
  font-size: 48px;
  color: #000000;
  line-height: 48px;
  margin: 0px;
}

.header-container {
  display: flex;
  justify-content: center;
}

.header {
  color: #000000;
  font-size: 20px;
  line-height: 32px;
  padding-bottom: 30px;
  text-align: center;
}

/* The switch - the box around the slider */
.switch {
  position: absolute;
  display: inline-block;
  width: 60px;
  height: 34px;
  top: 13px;
  right: 13px;
  z-index: 10;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.switch__label { 
  margin: 17px auto;
  text-align: center;
}
</style>
