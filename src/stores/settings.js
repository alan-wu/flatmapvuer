import { defineStore } from "pinia";

/* eslint-disable no-alert, no-console */

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      organCuries: [],
    };
  },
  getters: {},
  actions: {
    updateOrganCuries(organCuries) {
      this.organCuries = organCuries;
    },
  },
});
