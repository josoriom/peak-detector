import { sum } from '..';

describe('test sum', () => {
  it('should return 4', async () => {
    expect(sum(2, 2)).toStrictEqual(4);
  });
});
