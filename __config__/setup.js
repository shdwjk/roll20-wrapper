/* setup.js */

/* roll20 mocks */
/* globals jest */
/* eslint-disable prefer-const,no-unused-vars */
global.state = {};
global.createObj = jest.fn();
global.findObjs = jest.fn();
global.getObj = jest.fn();
global.getAttrByName = jest.fn();
global.sendChat = jest.fn();
global.on = jest.fn();
global.log = jest.fn();
global.Campaign = jest.fn();
global.playerIsGM = jest.fn();
global.spawnFx = jest.fn();
global.spawnFxBetweenPoints = jest.fn();
global.filterObjs = jest.fn();
global.randomInteger = jest.fn();
global.setDefaultTokenForCharacter = jest.fn();
global.onSheetWorkerCompleted = jest.fn();
/* eslint-enable prefer-const,no-unused-vars */
