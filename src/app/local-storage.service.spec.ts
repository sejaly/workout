
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
let platformId: Object;

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  
  function configureTestBed(isBrowser: boolean) {
    platformId = isBrowser ? 'browser' : 'server';

    TestBed.configureTestingModule({
      providers: [
        LocalStorageService,
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });
    service = TestBed.inject(LocalStorageService);
  }

 
  describe('when in browser', () => {
    beforeEach(() => {
      configureTestBed(true); 
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should set and get an item', () => {
      const key = 'testKey';
      const value = 'testValue';

      service.setItem(key, value);
      const storedValue = service.getItem(key);

      expect(storedValue).toBe(value);
    });

    it('should return null when getting an item that does not exist', () => {
      const key = 'nonExistentKey';
      const storedValue = service.getItem(key);

      expect(storedValue).toBeNull();
    });

    it('should remove an item', () => {
      const key = 'testKey';
      const value = 'testValue';

      service.setItem(key, value);
      service.removeItem(key);
      const storedValue = service.getItem(key);

      expect(storedValue).toBeNull();
    });

    it('should clear all items', () => {
      const key1 = 'testKey1';
      const value1 = 'testValue1';
      const key2 = 'testKey2';
      const value2 = 'testValue2';

      service.setItem(key1, value1);
      service.setItem(key2, value2);

      service.clear();

      const storedValue1 = service.getItem(key1);
      const storedValue2 = service.getItem(key2);

      expect(storedValue1).toBeNull();
      expect(storedValue2).toBeNull();
    });
  });

  
  describe('when not in browser', () => {
    beforeEach(() => {
      configureTestBed(false); 
    });

    it('should handle setting an item', () => {
      const key = 'testKey';
      const value = 'testValue';

      service.setItem(key, value);
      const storedValue = service.getItem(key);

      expect(storedValue).toBeNull(); 
    });

    it('should handle getting an item', () => {
      const key = 'testKey';
      const storedValue = service.getItem(key);

      expect(storedValue).toBeNull(); 
    });

    it('should handle removing an item', () => {
      const key = 'testKey';
      service.removeItem(key);

      const storedValue = service.getItem(key);
      expect(storedValue).toBeNull(); 
    });

    it('should handle clearing items', () => {
      const key1 = 'testKey1';
      const value1 = 'testValue1';
      const key2 = 'testKey2';
      const value2 = 'testValue2';

      service.setItem(key1, value1);
      service.setItem(key2, value2);

      service.clear();

      const storedValue1 = service.getItem(key1);
      const storedValue2 = service.getItem(key2);

      expect(storedValue1).toBeNull();
      expect(storedValue2).toBeNull(); 
    });
  });
});
