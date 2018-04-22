/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
 spawnFxBetweenPoints, filterObjs, randomInteger, setDefaultTokenForCharacter, onSheetWorkerCompleted */
const Roll20 = require('../lib/roll20.js');

class FakeAttr {
  constructor(props) {
    this.props = props;
  }
  get(p) {
    return this.props[p];
  }
}


describe('Roll20', () => {
  beforeEach(() => {
    /* eslint-disable no-native-reassign */
    state = {};
    /* eslint-enable no-native-reassign */

    [createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign,
    playerIsGM, spawnFx, spawnFxBetweenPoints, filterObjs, randomInteger,
    setDefaultTokenForCharacter, onSheetWorkerCompleted].map((fn) => fn.mockReset());
  });

  it('should be constructable.', () => {
    expect(() => {
      /* eslint-disable no-unused-vars */
      const roll20 = new Roll20();
      /* eslint-enable no-unused-vars */
    }).not.toThrow();
  });

  describe('state', () => {
    it('should return property in global state object.', () => {
      const roll20 = new Roll20();
      state.JestTest = { name: 'JestTest', version: 1.0 };
      const mState = roll20.getState('JestTest');
      expect(mState).toBe(state.JestTest);
    });

    it('should create property in the global state if it does not exist.', () => {
      const roll20 = new Roll20();
      expect(state.JestTest).toBe(undefined);
      const mState = roll20.getState('JestTest');
      expect(state.JestTest).toEqual({});
      expect(mState).toBe(state.JestTest);
    });
  });

  describe('createObj', () => {
    it('should decorate createObj().', () => {
      const fake = { name: 'fake' };
      createObj.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const obj = roll20.createObj('attribute', { name: 'test1', current: '3' });
      expect(obj).toBe(fake);
      expect(createObj).toHaveBeenCalledWith(
          'attribute',
          { name: 'test1', current: '3' }
      );
    });

    it('should add missing avatar for character.', () => {
      const fake = { name: 'fake' };
      createObj.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const obj = roll20.createObj('character', { name: 'test1', current: '3' });
      expect(obj).toBe(fake);
      expect(createObj).toHaveBeenCalledWith(
          'character',
          expect.objectContaining({
            name: 'test1',
            current: '3',
            avatar: expect.stringContaining('files.d20.io/images'),
          })
      );
    });
  });

  describe('findObjs', () => {
    it('should decorate findObjs().', () => {
      const fake = [{ name: 'fake1' }, { name: 'fake2' }];
      findObjs.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const objs = roll20.findObjs({ name: 'test1' }, { caseSensitive: false });
      expect(objs).toBe(fake);
      expect(findObjs).toHaveBeenCalledWith(
        { name: 'test1' },
        { caseSensitive: false }
      );
    });
  });

  describe('filterObjs', () => {
    it('should decorate filterObjs().', () => {
      const fake = [{ name: 'fake1' }, { name: 'fake2' }];
      filterObjs.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const objs = roll20.filterObjs({ name: 'test1' });
      expect(objs).toBe(fake);
      expect(filterObjs).toHaveBeenCalledWith(
        { name: 'test1' }
      );
    });
  });

  describe('getObj', () => {
    it('should decorate getObj().', () => {
      const fake = { id: '123456', name: 'fake' };
      getObj.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const obj = roll20.getObj('attribute', '123456');
      expect(obj).toBe(fake);
      expect(getObj).toHaveBeenCalledWith(
          'attribute',
          '123456'
      );
    });
  });

  describe('getOrCreateObj', () => {
    it('should call createObj() if the object does not exist.', () => {
      const fake = { name: 'test1' };
      createObj.mockReturnValueOnce(fake);
      findObjs.mockReturnValueOnce([]);

      const roll20 = new Roll20();
      const obj = roll20.getOrCreateObj('attribute', { name: 'test1', current: '3' });
      expect(obj).toBe(fake);
      expect(createObj).toHaveBeenCalledWith(
          'attribute',
          expect.objectContaining({ name: 'test1', current: '3' })
      );
    });

    it('should return the existing object if it exists.', () => {
      const fake = { type: 'attribute', name: 'test1' };
      findObjs.mockImplementationOnce(() => [fake]);

      const roll20 = new Roll20();
      const obj = roll20.getOrCreateObj('attribute', { name: 'test1', current: '3' });
      expect(obj).toBe(fake);
      expect(createObj).not.toHaveBeenCalled();
      expect(findObjs).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'attribute', name: 'test1', current: '3' }),
          undefined
      );
    });

    it('should throw if there is more than 1 result.', () => {
      const fake1 = { type: 'attribute', name: 'test1' };
      const fake2 = { type: 'attribute', name: 'test1' };
      findObjs.mockImplementationOnce(() => [fake1, fake2]);

      const roll20 = new Roll20();
      expect(() => {
        roll20.getOrCreateObj('attribute', { name: 'test1', current: '3' });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('getAttrByName', () => {
    it('should call getAttrByName()', () => {
      const fake = 'value';
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.getAttrByName('123456', 'attrname');
      expect(obj).toBe(fake);
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should pass on a valueType argument.', () => {
      const fake = 'value';
      const valueType = 'max';
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.getAttrByName('123456', 'attrname', valueType);
      expect(obj).toBe(fake);
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', valueType);
    });

    it('should get the attribute object and return it\'s value instead for dontDefaultOrExpand.', () => {
      const fake = {
        id: 'a1234',
        characterid: '123456',
        name: 'attrname',
        current: '3',
        max: '10',
        get: (p) => fake[p],
      };
      findObjs.mockImplementationOnce(() => [fake]);

      const roll20 = new Roll20();
      const obj = roll20.getAttrByName('123456', 'attrname', undefined, true);
      expect(obj).toBe(fake.current);
      expect(getAttrByName).not.toHaveBeenCalled();
      expect(findObjs).toHaveBeenCalledWith({
        type: 'attribute',
        characterid: '123456',
        name: 'attrname',
      },
      { caseInsensitive: true });
    });

    it('should return max value from attribute object for dontDefaultOrExpand and "max".', () => {
      const valueType = 'max';
      const fake = {
        id: 'a1234',
        characterid: '123456',
        name: 'attrname',
        current: '3',
        max: '10',
        get: (p) => fake[p],
      };
      findObjs.mockImplementationOnce(() => [fake]);

      const roll20 = new Roll20();
      const obj = roll20.getAttrByName('123456', 'attrname', valueType, true);
      expect(obj).toBe(fake.max);
      expect(getAttrByName).not.toHaveBeenCalled();
      expect(findObjs).toHaveBeenCalledWith({
        type: 'attribute',
        characterid: '123456',
        name: 'attrname',
      },
      { caseInsensitive: true });
    });
  });

  describe('getAttrObjectByName', () => {
    it('should use findObjs() to get the attribute object.', () => {
      const fake = { id: 'a1234', characterid: '123456', name: 'attrname', current: '3', max: '10' };
      findObjs.mockImplementationOnce(() => [fake]);

      const roll20 = new Roll20();
      const obj = roll20.getAttrObjectByName('123456', 'attrname');
      expect(obj).toBe(fake);
      expect(findObjs).toHaveBeenCalledWith({
        type: 'attribute',
        characterid: '123456',
        name: 'attrname',
      },
      { caseInsensitive: true });
    });

    it('should return null if no object found.', () => {
      findObjs.mockImplementationOnce(() => []);

      const roll20 = new Roll20();
      const obj = roll20.getAttrObjectByName('123456', 'attrname');
      expect(obj).toBe(null);
      expect(findObjs).toHaveBeenCalledWith({
        type: 'attribute',
        characterid: '123456',
        name: 'attrname',
      },
      { caseInsensitive: true });
    });
  });

  describe('checkCharacterFlag', () => {
    it('should return boolean value for boolean attribute', () => {
      const fake = true;
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toBe(fake);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should return boolean value for numeric attribute', () => {
      const fake = 1;
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toEqual(true);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should return boolean true for string "1" attribute', () => {
      const fake = '1';
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toEqual(true);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should return boolean true for string "on" attribute', () => {
      const fake = 'on';
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toEqual(true);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should return boolean false value for numeric 0.', () => {
      const fake = 0;
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toEqual(false);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });

    it('should return boolean false value for other string values', () => {
      const fake = 'off';
      getAttrByName.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.checkCharacterFlag('123456', 'attrname');
      expect(obj).toEqual(false);
      expect(typeof obj).toEqual('boolean');
      expect(getAttrByName).toHaveBeenCalledWith('123456', 'attrname', undefined);
    });
  });

  describe('getOrCreateAttr', () => {
    it('should call getOrCreateObj() with "attribute" type.', () => {
      const fake = { name: 'test1' };

      const roll20 = new Roll20();
      roll20.getOrCreateObj = jest.fn();
      roll20.getOrCreateObj.mockReturnValueOnce(fake);

      const obj = roll20.getOrCreateAttr('123456', 'test1');
      expect(obj).toBe(fake);
      expect(roll20.getOrCreateObj).toHaveBeenCalledWith(
          'attribute',
          expect.objectContaining({ characterid: '123456', name: 'test1' }),
          { caseInsensitive: true }
      );
    });
  });

  describe('setAttrByName', () => {
    it('should call getOrCreateAttr(), and .set() on the result.', () => {
      const fake = { set: jest.fn(), name: 'test1' };

      const roll20 = new Roll20();
      roll20.getOrCreateAttr = jest.fn();
      roll20.getOrCreateAttr.mockReturnValueOnce(fake);

      roll20.setAttrByName('123456', 'test1', 'value');
      expect(roll20.getOrCreateAttr).toHaveBeenCalledWith(
          '123456',
          'test1'
      );
      expect(fake.set).toHaveBeenCalledWith(
        'current',
        'value'
      );
    });
  });

  describe('processAttrValue', () => {
    it('should execute callback with attribute value', () => {
      const fake = { set: jest.fn(), get: (p) => fake[p], name: 'test1', current: '5', max: '10' };

      const roll20 = new Roll20();
      roll20.getOrCreateAttr = jest.fn();
      roll20.getOrCreateAttr.mockReturnValueOnce(fake);
      const processor = jest.fn();

      roll20.processAttrValue('123456', 'test1', processor);
      expect(roll20.getOrCreateAttr).toHaveBeenCalledWith(
          '123456',
          'test1'
      );
      expect(processor).toHaveBeenCalledWith(
        fake.current
      );
    });
  });


  describe('getRepeatingSectionAttrs', () => {
    it('should get subset of attrs that are repeating', () => {
      const fake = [
        { get: () => 'test1', type: 'attribute', name: 'test1' },
        { get: () => 'repeating_section_test1', type: 'attribute', name: 'repeating_section_test1' },
        { get: () => 'repeating_section_test2', type: 'attribute', name: 'repeating_section_test2' },
        { get: () => 'test2', type: 'attribute', name: 'test2' },
      ];
      findObjs.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.getRepeatingSectionAttrs('123456', 'section');
      expect(obj).toEqual(
        expect.arrayContaining([fake[1], fake[2]])
      );
    });
  });

  describe('getRepeatingSectionItemIdsByName', () => {
    it('should get subset of repeating attributes ids for name', () => {
      const fake = [
        new FakeAttr({ name: 'test1' }),
        new FakeAttr({ name: 'test2' }),
        new FakeAttr({ name: 'test3' }),
        new FakeAttr({ name: 'repeating_section_1_test1', current: '1' }),
        new FakeAttr({ name: 'repeating_section_1_name', current: 'id1' }),
        new FakeAttr({ name: 'repeating_section_2_test2', current: '2' }),
        new FakeAttr({ name: 'repeating_section_2_name', current: 'id2' }),
        new FakeAttr({ name: 'repeating_section_3_test3', current: '3' }),
        new FakeAttr({ name: 'repeating_section_3_name', current: 'id3' }),
      ];
      findObjs.mockImplementationOnce(() => fake);

      const roll20 = new Roll20();
      const obj = roll20.getRepeatingSectionItemIdsByName('123456', 'section');
      expect(obj).toEqual({
        id1: '1',
        id2: '2',
        id3: '3',
      });
    });
  });

  describe('getCurrentPage', () => {
    it('should return the Campaign() playerpageid for part of the group.', () => {
      const fakePages = {
        page1: { id: 'page1' },
        page2: { id: 'page2' },
        page3: { id: 'page3' },
      };
      getObj.mockImplementation((type, id) => {
        switch (type) {
          case 'page': return fakePages[id];
          default: return null;
        }
      });


      Campaign.mockImplementation(() => ({
        get: (p) => {
          switch (p) {
            case 'playerspecificpages': return {};
            case 'playerpageid': return 'page1';
            default: return null;
          }
        },
      }));

      const roll20 = new Roll20();
      const obj = roll20.getCurrentPage('123456');
      expect(obj).toBe(fakePages.page1);
      expect(Campaign).toHaveBeenCalled();
      expect(getObj).toHaveBeenCalledWith(
          'page',
          'page1'
      );
    });

    it('should return the Campaign() player specific page id.', () => {
      const fakePages = {
        page1: { id: 'page1' },
        page2: { id: 'page2' },
        page3: { id: 'page3' },
      };
      getObj.mockImplementation((type, id) => {
        switch (type) {
          case 'page': return fakePages[id];
          default: return null;
        }
      });

      Campaign.mockImplementation(() => ({
        get: (p) => {
          switch (p) {
            case 'playerspecificpages': return { 123456: 'page2' };
            case 'playerpageid': return 'page1';
            default: return null;
          }
        },
      }));

      const roll20 = new Roll20();
      const obj = roll20.getCurrentPage('123456');
      expect(obj).toBe(fakePages.page2);
      expect(Campaign).toHaveBeenCalled();
      expect(getObj).toHaveBeenCalledWith(
          'page',
          'page2'
      );
    });

    it('should return the GM last page.', () => {
      const fakePages = {
        page1: { id: 'page1' },
        page2: { id: 'page2' },
        page3: { id: 'page3' },
      };
      const fakePlayers = {
        123456: { get: () => 'page3' },
      };
      playerIsGM.mockImplementation(() => true);
      getObj.mockImplementation((type, id) => {
        switch (type) {
          case 'page': return fakePages[id];
          case 'player': return fakePlayers[id];
          default: return null;
        }
      });

      Campaign.mockImplementation(() => ({
        get: (p) => {
          switch (p) {
            case 'playerspecificpages': return { 123456: 'page2' };
            case 'playerpageid': return 'page1';
            default: return null;
          }
        },
      }));

      const roll20 = new Roll20();
      const obj = roll20.getCurrentPage('123456');
      expect(obj).toBe(fakePages.page3);
      expect(Campaign).not.toHaveBeenCalled();
      expect(getObj).toHaveBeenCalledWith(
          'player',
          '123456'
      );
      expect(getObj).toHaveBeenCalledWith(
          'page',
          'page3'
      );
    });

    it('should return null for bad page id. (not technically possible)', () => {
      Campaign.mockImplementation(() => ({
        get: () => false,
      }));

      const roll20 = new Roll20();
      const obj = roll20.getCurrentPage('123456');
      expect(obj).toBe(null);
      expect(Campaign).toHaveBeenCalled();
    });
  });

  describe('spawnFx', () => {
    it('should call spawnFx() for single point.', () => {
      const coords = [{ x: 1, y: 2 }];
      const fxType = 'fxType';
      const pageId = 'pageId';

      const roll20 = new Roll20();
      roll20.spawnFx(coords, fxType, pageId);
      expect(spawnFxBetweenPoints).not.toHaveBeenCalled();
      expect(spawnFx).toHaveBeenCalledWith(
        coords[0].x,
        coords[0].y,
        fxType,
        pageId
      );
    });

    it('should call spawnFxBetweenPoints() for double point.', () => {
      const coords = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
      const fxType = 'fxType';
      const pageId = 'pageId';

      const roll20 = new Roll20();
      roll20.spawnFx(coords, fxType, pageId);
      expect(spawnFx).not.toHaveBeenCalled();
      expect(spawnFxBetweenPoints).toHaveBeenCalledWith(
        coords[0],
        coords[1],
        fxType,
        pageId
      );
    });

    it('should throw for 3 or more points.', () => {
      const coords = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }];
      const fxType = 'fxType';
      const pageId = 'pageId';

      const roll20 = new Roll20();
      expect(() => roll20.spawnFx(coords, fxType, pageId)).toThrow();
      expect(spawnFx).not.toHaveBeenCalled();
      expect(spawnFxBetweenPoints).not.toHaveBeenCalled();
    });
  });

  describe('playerIsGM', () => {
    it('should decorate playerIsGM().', () => {
      playerIsGM.mockReturnValueOnce(true);

      const roll20 = new Roll20();
      const isGM = roll20.playerIsGM('123456');
      expect(isGM).toBe(true);
      expect(playerIsGM).toHaveBeenCalledWith(
        '123456'
      );
    });
  });

  describe('getCampaign', () => {
    it('should decorate Campaign().', () => {
      const fake = { type: 'campaign' };
      Campaign.mockReturnValueOnce(fake);

      const roll20 = new Roll20();
      const obj = roll20.getCampaign();
      expect(obj).toBe(fake);
      expect(Campaign).toHaveBeenCalled();
    });
  });

  describe('sendChat', () => {
    it('should decorate sendChat().', () => {
      const sendAs = 'sendAs';
      const message = 'message';
      const callback = 'callback';
      const options = 'options';

      const roll20 = new Roll20();
      roll20.sendChat(sendAs, message, callback, options);
      expect(sendChat).toHaveBeenCalledWith(sendAs, message, callback, options);
    });
  });

  describe('on', () => {
    it('should decorate on().', () => {
      const event = 'event';
      const callback = 'callback';

      const roll20 = new Roll20();
      roll20.on(event, callback);
      expect(on).toHaveBeenCalledWith(event, callback);
    });
  });

  describe('randomInteger', () => {
    it('should decorate randomInteger().', () => {
      const max = 'max';

      const roll20 = new Roll20();
      roll20.randomInteger(max);
      expect(randomInteger).toHaveBeenCalledWith(max);
    });
  });

  describe('log', () => {
    it('should decorate log().', () => {
      const message = 'message';

      const roll20 = new Roll20();
      roll20.log(message);
      expect(log).toHaveBeenCalledWith(message);
    });
  });

  describe('setDefaultTokenForCharacter', () => {
    it('should decorate setDefaultTokenForCharacter().', () => {
      const character = 'character';
      const token = 'token';

      const roll20 = new Roll20();
      roll20.setDefaultTokenForCharacter(character, token);
      expect(setDefaultTokenForCharacter).toHaveBeenCalledWith(character, token);
    });
  });

  describe('onSheetWorkerCompleted', () => {
    it('should decorate onSheetWorkerCompleted().', () => {
      const callback = 'callback';

      const roll20 = new Roll20();
      roll20.onSheetWorkerCompleted(callback);
      expect(onSheetWorkerCompleted).toHaveBeenCalledWith(callback);
    });
  });

  describe('setAttrWithWorker', () => {
    it('should call setWithWorker', () => {
      const characterId = 'characterId';
      const attrName = 'attrName';
      const attrValue = 'attrValue';

      const fake = new FakeAttr({ name: 'test' });
      fake.setWithWorker = jest.fn();

      const roll20 = new Roll20();
      roll20.getOrCreateAttr = jest.fn();
      roll20.getOrCreateAttr.mockReturnValueOnce(fake);
      roll20.setAttrWithWorker(characterId, attrName, attrValue);
      expect(onSheetWorkerCompleted).not.toHaveBeenCalled();
      expect(fake.setWithWorker).toHaveBeenCalledWith({
        current: attrValue,
      });
    });

    it('should call setWithWorker and register callback.', () => {
      const characterId = 'characterId';
      const attrName = 'attrName';
      const attrValue = 'attrValue';
      const callback = 'callback';

      const fake = new FakeAttr({ name: 'test' });
      fake.setWithWorker = jest.fn();

      const roll20 = new Roll20();
      roll20.getOrCreateAttr = jest.fn();
      roll20.getOrCreateAttr.mockReturnValueOnce(fake);
      roll20.setAttrWithWorker(characterId, attrName, attrValue, callback);
      expect(onSheetWorkerCompleted).toHaveBeenCalledWith(callback);
      expect(fake.setWithWorker).toHaveBeenCalledWith({
        current: attrValue,
      });
    });
  });

  describe('createAttrWithWorker', () => {
    it('should call setWithWorker', () => {
      const characterId = 'characterId';
      const attrName = 'attrName';
      const attrValue = 'attrValue';

      const fake = new FakeAttr({ name: 'test' });
      fake.setWithWorker = jest.fn();

      const roll20 = new Roll20();
      roll20.createObj = jest.fn();
      roll20.createObj.mockReturnValueOnce(fake);

      roll20.createAttrWithWorker(characterId, attrName, attrValue);
      expect(onSheetWorkerCompleted).not.toHaveBeenCalled();
      expect(fake.setWithWorker).toHaveBeenCalledWith({
        current: attrValue,
      });
    });

    it('should call setWithWorker and register callback.', () => {
      const characterId = 'characterId';
      const attrName = 'attrName';
      const attrValue = 'attrValue';
      const callback = 'callback';

      const fake = new FakeAttr({ name: 'test' });
      fake.setWithWorker = jest.fn();

      const roll20 = new Roll20();
      roll20.createObj = jest.fn();
      roll20.createObj.mockReturnValueOnce(fake);

      roll20.createAttrWithWorker(characterId, attrName, attrValue, callback);
      expect(onSheetWorkerCompleted).toHaveBeenCalledWith(callback);
      expect(fake.setWithWorker).toHaveBeenCalledWith({
        current: attrValue,
      });
    });
  });
});
