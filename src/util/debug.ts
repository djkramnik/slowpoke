export const log = (...args: any[]) => {
  if (process.env.DEBUG !== 'true') {
    return
  }
  return console.log(...args)
}