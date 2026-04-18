// Mock Chrome APIs for testing environment

const storageMock: Record<string, unknown> = {};

const chromeStorageSyncMock = {
  get: jest.fn((keys: string | string[]) => {
    if (typeof keys === 'string') {
      return Promise.resolve({ [keys]: storageMock[keys] });
    }
    const result: Record<string, unknown> = {};
    keys.forEach((key) => {
      if (key in storageMock) {
        result[key] = storageMock[key];
      }
    });
    return Promise.resolve(result);
  }),
  set: jest.fn((items: Record<string, unknown>) => {
    Object.assign(storageMock, items);
    return Promise.resolve();
  }),
  remove: jest.fn((keys: string | string[]) => {
    const keysArr = typeof keys === 'string' ? [keys] : keys;
    keysArr.forEach((key) => {
      delete storageMock[key];
    });
    return Promise.resolve();
  }),
};

const chromeMock = {
  storage: {
    sync: chromeStorageSyncMock,
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
    },
  },
  runtime: {
    sendMessage: jest.fn(() => Promise.resolve({})),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    id: 'test-extension-id',
  },
};

// Assign to global
Object.assign(global, { chrome: chromeMock });

// Mock localStorage for streak tracking
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
