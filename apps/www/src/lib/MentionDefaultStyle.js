export default {
  control: {
    backgroundColor: "#fff",
  },

  "&multiLine": {
    control: {
      minHeight: 40,
    },
    highlighter: {
      padding: 0,
      outline: 0,

      // border: '1px solid transparent',
    },
    input: {
      padding: 0,
      outline: 0,
      // border: '1px solid silver',
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      // border: "2px inset transparent",
    },
    input: {
      padding: 1,
      // border: "2px inset",
    },
  },

  suggestions: {
    list: {
      backgroundColor: "white",
      fontSize: 14,
      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    },
    item: {
      font: "primary",
      padding: "5px 15px",
      "&focused": {
        backgroundColor: "#f0f2f5",
      },
    },
  },
};
