module.exports = {
  resultOk(data) {
    return {
      state: 0,
      message: "OK",
      attributes: null,
      data,
    }
  },
  resultErr(message) {
    return {
      state: 1,
      message,
      attributes: null,
      data: {},
    }
  }
}