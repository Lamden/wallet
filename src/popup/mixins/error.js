module.exports = {
  data() {
    return {
      error: '',
    };
  },
  methods: {
    resetError() {
      this.error = '';
    },
    setError(message) {
      this.error = message;
    },
  },
};
