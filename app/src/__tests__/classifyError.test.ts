import { describe, expect, it } from '@jest/globals';

import { ConnectionError, classifyError, errorMessageKey, timeoutError } from '@/lib/errors/classifyError';

describe('classifyError', () => {
  it('knows its own connection errors', () => {
    expect(classifyError(new ConnectionError('offline'))).toBe('offline');
    expect(classifyError(new ConnectionError('server'))).toBe('server');
  });

  it('treats a timeout as a server fault, or as offline when the device has no network', () => {
    expect(classifyError(timeoutError())).toBe('server');
    expect(classifyError(timeoutError(), false)).toBe('offline');
  });

  it('treats a failed request on an online device as a server fault', () => {
    expect(classifyError(new TypeError('Network request failed'))).toBe('server');
    expect(classifyError({ message: 'FetchError: Network request failed', details: '' }, false)).toBe('offline');
  });

  it('reads 5xx codes and statuses', () => {
    expect(classifyError({ code: '503', message: 'x' })).toBe('server');
    expect(classifyError({ status: 502, message: 'x' })).toBe('server');
  });

  it('recognises a signed-out write and a conflict', () => {
    expect(classifyError({ code: '42501', message: 'rls' })).toBe('signedOut');
    expect(classifyError(new Error('forbidden'))).toBe('signedOut');
    expect(classifyError(new Error('conflict'))).toBe('conflict');
  });

  it('leaves everything else as other', () => {
    expect(classifyError({ code: '23505', message: 'duplicate key' })).toBe('other');
    expect(classifyError(new Error('boom'))).toBe('other');
    expect(classifyError(null)).toBe('other');
  });
});

describe('errorMessageKey', () => {
  it('only a lost connection or a server fault overrides the screen message', () => {
    expect(errorMessageKey('offline', 'x.failed')).toBe('errors.offline');
    expect(errorMessageKey('server', 'x.failed')).toBe('errors.server');
    expect(errorMessageKey('other', 'x.failed')).toBe('x.failed');
    expect(errorMessageKey('conflict', 'x.failed')).toBe('x.failed');
  });
});
