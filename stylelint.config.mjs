/** @type {import("stylelint").Config} */

const stylelintConfig = {
  extends: ["stylelint-config-standard"],
  rules: {
    "import-notation": "string",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "plugin",
          "custom-variant",
          "apply",
          "source",
          "utility",
          "variant",
        ],
      },
    ],
    "custom-property-empty-line-before": null,
    // oklch() hue accepts a bare number in Tailwind's design tokens.
    "hue-degree-notation": null,
  },
};

export default stylelintConfig;
