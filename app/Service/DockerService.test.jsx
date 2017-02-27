/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env mocha */
import { expect } from 'chai';
import sinon from 'sinon';
import Fetch from 'js-fetch';
import btoa from '../Tools/btoa';
import localStorageService from './LocalStorageService';
import DockerService, { authStorage } from './DockerService';

describe('DockerService', () => {
  let data;
  beforeEach(() => {
    data = null;

    function get(urlValue, auth) {
      if (data) {
        return Promise.resolve(data);
      }

      return Promise.resolve({
        urlValue,
        auth,
      });
    }

    sinon.stub(localStorageService, 'isEnabled').callsFake(() => false);
    sinon.stub(Fetch, 'url').callsFake(urlValue => ({
      auth: auth => ({
        get: () => get(urlValue, auth),
        error: () => ({
          get,
        }),
      }),
    }));
  });

  afterEach(() => {
    Fetch.url.restore();
    localStorageService.isEnabled.restore();
  });

  it('should determine if already logged', () => {
    sinon.stub(localStorageService, 'getItem').callsFake(() => 'token');

    expect(DockerService.isLogged()).to.be.true;
    localStorageService.getItem.restore();
  });

  it('should determine if not already logged', () => {
    sinon.stub(localStorageService, 'getItem').callsFake(() => '');

    expect(DockerService.isLogged()).to.be.false;
    localStorageService.getItem.restore();
  });

  it('should login with given username and password', () =>
    DockerService.login('admin', 'password').then((result) => {
      expect(result.urlValue).to.match(/auth$/);
      expect(result.auth).to.eql(`Basic ${btoa('admin:password')}`);
    }));

  it('should store token in localStorage on login', () => {
    const setItemSpy = sinon.spy(localStorageService, 'setItem');

    return DockerService.login('admin', 'password').then(() => {
      localStorageService.setItem.restore();
      expect(setItemSpy.calledWith(authStorage, `Basic ${btoa('admin:password')}`)).to.be.true;
    });
  });

  it('should drop stored token from localStorage on logout', () => {
    const removeItemSpy = sinon.spy(localStorageService, 'removeItem');

    return DockerService.logout().then(() => {
      localStorageService.removeItem.restore();
      expect(removeItemSpy.calledWith(authStorage)).to.be.true;
    });
  });

  it('should list containers with auth', () => {
    const getItemSpy = sinon.spy(localStorageService, 'getItem');

    return DockerService.containers().then(() => {
      localStorageService.getItem.restore();
      expect(getItemSpy.calledWith(authStorage)).to.be.true;
    });
  });

  it('should return results when listing containers', () => {
    data = {
      results: [{
        id: 1,
      }],
    };
    
    return DockerService.containers().then(value => expect(value).to.be.eql([{ id: 1 }]));
  });
});
