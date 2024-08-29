/**
 * 生成随机ID字符串：10位36进制时间戳+6位36进制随机数
 * @return {string} ID
 */
export function generateId() {
  const idLen = 16;
  const randomLen = 6;
  const radix = 36;
  const id = Date.now().toString(radix);
  let randomStr = '';

  for (let idx = 0; idx < randomLen; idx += 1) {
    randomStr += Math.floor(Math.random() * radix).toString(radix);
  }
  let prefix = '';
  for (let idx = 0; idx < idLen - randomLen - id.length; idx += 1) {
    prefix += '0';
  }

  return prefix + id + randomStr;
}
