const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to url.parse.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Handle specific routes if needed
      if (pathname === '/api') {
        await handle(req, res, parsedUrl)
      } else if (pathname === '/free-packing-list-generator') {
        await app.render(req, res, '/free-packing-list-generator', query)
      } else if (pathname === '/free-travel-planner-ai') {
        await app.render(req, res, '/free-travel-planner-ai', query)
      } else if (pathname === '/saved-itineraries') {
        await app.render(req, res, '/saved-itineraries', query)
      } else if (pathname === '/saved-packing-lists') {
        await app.render(req, res, '/saved-packing-lists', query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
