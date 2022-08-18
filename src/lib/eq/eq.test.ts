import {eq} from './eq'

describe('EQ', () => {
  test('EQ', () => {
    expect(eq(undefined, undefined)).toBeTruthy()
    expect(eq(undefined, null)).toBeTruthy()
    expect(eq(null, undefined)).toBeTruthy()
    expect(eq(null, null)).toBeTruthy()
    expect(eq(1, 1)).toBeTruthy()
    expect(eq(1, 2)).toBeFalsy()
    expect(eq(2, 1)).toBeFalsy()
    expect(eq(1, '1')).toBeFalsy()
  })
})
