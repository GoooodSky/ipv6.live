;(async () => {
  console.time()
  let { alive, loss, rtt } = await pingTest('155.94.170.155')
  console.timeEnd()
  console.log({ alive, loss, rtt })
})()