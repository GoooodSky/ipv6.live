function getTime() {
  let date = new Date()
  let now = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date
    .getDate()
    .toString()
    .padStart(2, '0')}${date
    .getHours()
    .toString()
    .padStart(2, '0')}${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
  return now
}

module.exports = { getTime }

// console.log(getTime())
