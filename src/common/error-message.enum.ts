/**
 * messages support placeholder,
 * like:
 *     $0, $1, ..., and so on,
 * it will be replaced with the real value that is passed to the params.
 * Notice:
 *     placeholder starts with 0!
 */
export enum ErrorMessage {
  // common
  NOT_FOUND = 'Page not found',
  UNKNOWN_ERROR = 'Unknown error',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  BAD_REQUEST = 'Bad request',
  INTERNAL_SERVER_ERROR = '请求失败，请稍后重试',
  DB_QUERY_ERROR = '数据库查询失败，请稍后重试',
  IP_UPDATE_ERROR = 'IP更新失败',
  IP_SAVE_ERROR = 'IP保存失败',
  IP_INVALID = 'IP格式有误'
}
