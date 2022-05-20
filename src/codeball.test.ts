import {urlWithToken} from './codeball'

describe('urlWithToken', () => {
  test('set token', () => {
    expect(
      urlWithToken(
        'https://github.com/sturdy-dev/test-codeball/pull/3',
        'hello-token'
      )
    ).toBe(
      'https://x-access-token:hello-token@github.com/sturdy-dev/test-codeball/pull/3'
    )
  })
})
