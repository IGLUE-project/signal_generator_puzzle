//Copy this file to config.js and specify your own settings

export let ESCAPP_APP_SETTINGS = {
  //Settings that can be specified by the authors
  skin: "STANDARD", //Only the "STANDARD" skin is currently supported by the Signal Generator Puzzle.
  waveformButton: "TRUE", // If "TRUE", there will be a button to change the wave's form.
  //background: "NONE", //background can be "NONE" or a URL.
  actionAfterSolve: "PLAY_SOUND", //actionAfterSolve can be "NONE", "SHOW_MESSAGE" or "PLAY_SOUND".
  //message: "Custom message",
  //soundAfterSolve: "sounds/after_solve.mp3"

  //Settings that will be automatically specified by the Escapp server
  locale:"es",

  escappClientSettings: {
    endpoint:"https://escapp.es/api/escapeRooms/id",
    linkedPuzzleIds: [1],
    rtc: false,
  },
};