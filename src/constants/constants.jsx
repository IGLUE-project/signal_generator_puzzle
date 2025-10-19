export const DEFAULT_APP_SETTINGS = {
  skin: "STANDARD",
  actionAfterSolve: "NONE",
  message: undefined,
  background: "images/standard/background.png",
  backgroundDevice: "images/standard/background_device.png",
  backgroundDial: "images/standard/dial.png",
  modeButton: "images/standard/mode_button.png",
  backgroundNok: "images/standard/background_nok.png",
  backgroundOk: "images/standard/background_ok.png",
  backgroundOff: "images/standard/background_off.png",
  backgroundButton: "images/standard/button.png",
  backgroundPowerButton: "images/standard/power_button.png",
  backgroundMessage: "images/standard/background_message.png",
  imageLightOff: "images/standard/light_off.png",
  imageLightNok: "images/standard/light_nok.png",
  imageLightOk: "images/standard/light_ok.png",
  soundBeep: "sounds/beep.mp3",
  soundNok: "sounds/solution_nok.mp3",
  soundOk: "sounds/solution_ok.mp3",
  soundDial: "sounds/spin.wav",
  soundTurnOn: "sounds/turnon.wav", // Sound played when the power is turned on
  soundTurnOff: "sounds/turnoff.wav", // Sound played when the power is turned off
  waveformButton: true,

  //Developer settings
  dialWidth: 0.7, 
  dialHeight: 0.7, 
  dialTextSize: "0.055", 
  screenTextSize: "0.042",
  dialTextColor: "#000000", // Color for the dial text
  rayWidth: 0.665, 
  rayHeight: 0.675, 
  buttonWidth: 0.19, // Relative width of the button compared to the box width
  buttonHeight: 0.19, // Relative height of the button compared to the box height
  buttonMarginTop: 0.98, // Margin from the top of the box to the button in percentage of box height
  buttonMarginLeft: 0.92, // Margin from the left of the box to the button in percentage of box width
  dialsGap: 0.22, // Gap between dials in percentage of box width
  dialsNames: ["F", "A", "Φ"], // Names for the dials
  screenTextNames: ["F", "A", "ɸ"], // Names for the screen text

  minFrequency: 0.05, // Minimum frequency for the ray
  maxFrequency: 0.25, // Maximum frequency for the ray
  minAmplitude: 0, // Minimum amplitude for the ray
  maxAmplitude: 73, // Maximum amplitude for the ray

  svgSize: '25vmin',
  viewAngle: "FALSE", //FALSE, TRUE
  textGap: 0.085,
  screenContainerWidth: 0.550, // Width of the screen container
  screenContainerHeight: 0.550, // Height of the screen container
  screenContainerMarginTop: -0.282, // Margin from the top of the box to the screen container in percentage of box height
  dialSpeed: 40, // Speed of the dial rotation in milliseconds
  multiButtonWidth: 0.1, // Relative width of the multi button compared to the box width
  multiButtonHeight: 0.1, // Relative height of the multi button compared to the box height
  multiButtonMarginTop: 0.90, // Margin from the top of the box to the multi button in percentage of box height
  multiButtonMarginLeft: 0.185, // Margin from the left of the box to the multi button in percentage of box width
  powerButtonMarginLeft: 0.190, // Margin from the left of the box to the power button in percentage of box width
  dataContainerMarginTop: 0.235,
  dataContainerMarginLeft: -0.04, // Margin from the left of the box to the data container in percentage of box width
  multiTextColor: "rgba(161, 106, 58, 1)",
};

export const ESCAPP_CLIENT_SETTINGS = {
  imagesPath:"./images/",
};

export const MAIN_SCREEN = "MAIN_SCREEN";
export const MESSAGE_SCREEN = "MESSAGE_SCREEN";