## VUE 双向数据绑定原理

数据发生变化后，会重新对页面渲染，这就是vue的响应式，那么这一切是怎么做到的呢？

想完成这个过程，我们需要：

*   侦测数据的变化
*   收集视图依赖的哪些数据
*   数据变化是，自动“通知”需要更新的视图部分，并进行更新



对应的专业术语，分别是：

*   数据劫持/ 数据代理
*   依赖收集
*   发布订阅模式



####如何侦测数据的变化

首先有个问题，在JavaScript中，如何侦测一个对象的变化？

有两种方法可以做到： 使用`Object.defineProperty `或者 `Proxy`，这就是进行数据劫持或者数据代理。



### 方法1， Object.defineProperty实现

`Vue2`中，通过使用`Object.defineProperty`设定对象的getter/setter方法来监听数据的变化，get时进行依赖收集，set时数据变更，通知订阅者更新视图。

```js
//  视图渲染函数
function render () {
    console.log('视图更新模拟')
}

// 需要侦测的对象
const data = {
    name: 'javyin',
    age: 18
}

// 数据劫持
observer(data)

function observer (target) {
    if (target == null || typeof target !== 'object') {
        return target
    }
    for (let key in target) {
        defineReactive(target, key, target[key])
    }
}

function defineReactive (target, key, value) {
    observer(value)     // 递归子属性
    Object.defineProperty(target, key, {
        enumerable: true,   // 可枚举（可遍历）
        configurable: true,     // 可配置（比如可以删除）
        get () {
            console.log('get' + value)
            return value
        },
        set (newValue) {
            if (newValue !== value) {
                observer(newValue)  //  如果赋值的是一个对象，也需要递归子属性
                render()
                value = newValue
            }
        }
    })
}

// 重新赋相同的值
// data.age = 18	

// 重新赋新的值
data.age = 20	// set 20 视图更新模拟

// 获取属性
data.name	// get javyin
```

