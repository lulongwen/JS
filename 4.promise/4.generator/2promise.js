/**
 * generator & promise
 */

const { promisify } = requie('bluebird')
const fs = require('fs')

let read = promisify(fs.readFile)

function* gen() {
  let b = yield read('a.txt', 'utf8')
  let c = yield read(b, 'utf8')
  return c
}

// co 可以帮你执行 promise
// let co = require('co')
function co(it) {
  // 实现异步递归
  return new Promise((resolve, reject) => {
    // next是为了实现异步迭代
    function next(data) {
      // 获取迭代的结果
      let {value, done} = it.next(data)
      
      if (!done) {
        value.then((data => {
          // 当第一个 promise执行完再继续执行下一个next
          next(data)

          // 有一个失败了就失败了
        }), reject)
      }
      else {
        // 迭代成功后将成功的结果返回
        resolve(value)
      }
    }

    next()
  })
}

co(gen()).then(res => {
  console.log('res', res)
})


it.next().value.then(res => {
  it.next(res).value.then(data => {
    console.log(it.next(data).value)
  })
})



/* 
generator相当于把一个函数拆分成若干个部分执行，
执行第一次时，将指针指向下一段代码，直到结束位置
如果再generator中调用另一个generator 就需要用 yield 
* */

function* a() {
  yield '1'
  yield '2'
}

function* b() {
  yield '3'
  yield *a()
  yield '66'
}

var it = b()
it.next() // {value: "3", done: false}
it.next() // {value: "1", done: false}
it.next() // {value: "2", done: false}
it.next() // {value: "66", done: false}

it.next() // {value: undefined, done: true} 完成迭代