# request-timeline
A NodeJs module to generate a request timeline graph.

I use it to debug api timelines of my graphql server, like which api is dependent on which.

It usages request & request-debug module.


```
npm i -D request-timeline
```

Then in your express app import the middleware:

```nodejs
const requestTimeLine = require('request-timeline');
app.use(requestTimeLine);
```


