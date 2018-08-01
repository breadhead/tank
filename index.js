const _ = require('lodash')
const axios = require('axios')

const args = _.chunk(process.argv.slice(2), 2)
  .reduce((prev, cur) => ({
    ...prev,
    [cur[0].substring(2)]: cur[1],
  }), {})

const successRequests = []
const failureRequests = []

Promise.all(
  _.range(0, parseInt(args.count, 10))
    .map(index => axios.get(args.url)
      .then(
        res => successRequests.push({
          index,
          data: res.data,
        }),
        err => failureRequests.push({
          index,
          code: err.response
            ? `${err.response.status} ${err.response.statusText}`
            : err,
        }),
      )),
).then(() => {
  console.log(`Target: ${args.url}`)
  console.log(`${args.count} requests`)

  console.log('--- ---')
  console.log(`Success: ${successRequests.length}`)
  console.log('--- ---')

  console.log(`Failure: ${failureRequests.length}`)

  Object.entries(_.groupBy(failureRequests, 'code'))
    .map(entry => ({
      code: entry[0],
      count: entry[1].length,
    }))
    .sort((a, b) => b.count - a.count)
    .forEach(error => console.log(`${error.count} times | ${error.code}`))
})
