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



**如何侦测数据的变化**

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
    age: 18,
    hobby: {
        a: 'running',
        b: 'cycling'
    }
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

上面这段代码的主要作用在于： 观察者`observer`可以传入一个`target`(需要被追踪侦测的对象)，通过遍历`target`所有属性的方式对该对象每一个属性都通过`defineReactive`来处理，以此来达到实现侦测对象的变化。值得注意的是`observer`会进行递归调用。

根据上面的代码，就可以大概理解vue2中，是如何侦测组件data的变化， 其实也很简单:

```js
class Vue {
    constructor(options) {
        this._data = options.data;
        observer(this._data);  //  创建vue实例的时候就侦测追踪data数据
    }
}
```

不过这种方式有几个注意点需补充说明：

*   **无法检测到对象属性的添加或者删除**(如：`data.hobby.c = 'games'`)

    这是因为vue通过`Object.defineProperty`来将对象的key值添加的`getter/setter`来追踪变化，但`getter/setter`只能追踪一个属性是否被修改，无法追踪新增属性和删除属性。

    如果是删除属性，我们可以用`vm.$delete`实现，那么如果是新增属性呢？有两种方法：

    1.  可以使用`vm.$set(vm.hobby, c, 'games')`向嵌套对象添加响应式属性
    2.  也可以给这个对象重新赋值，如`data.hobby = {...data.hobby, c: 'games'}`

*   `Object.defineProperty`**无法监听数组的变化，需要进行数组方法的重写**

```js
// vue2 如何实现响应式原理
// 数据变化，视图更新
//  视图渲染函数
function render () {
    console.log('视图更新模拟')
}

// 需要侦测的对象
const data = {
    name: 'javyin',
    age: 18,
    hobby: ['running', 'cycling']
}


let oldArrayPrototype = Array.prototype		// 获取数组原来的原型
let proto = Object.create(oldArrayPrototype)  // 创建继承一个自己的原型
let methods = ['pop', 'push', 'shift', 'unshift', 'sort', 'reverse', 'splice']

//  重写methods方法
methods.forEach(method=>{
    proto[method] = function() {
        // 函数劫持，把函数进行重写，内部继续调用老方法
        oldArrayPrototype[method].call(this, ...arguments)
        console.log('监听到数组变化')
        console.log(this)
        render() // 更新视图
    }
})

// 数据劫持
observer(data)

function observer(target) {
    if(target == null || typeof target !== 'object') {
        return target
    }
    if(Array.isArray(target)) {
        // 拦截数组，给数组的方法进行重写
        Object.setPrototypeOf(target, proto)
        for(let i =0; i < target.length; i++) {
            observer(target[i])
        }
    }else {
        for(let key in target) {
            defineReactive(target, key, target[key])
        }
    }
}

function defineReactive(target, key, value) {
    observer(value)
    Object.defineProperty(target, key, {
        get() {
            return value
        },
        set(newValue) {
            if(value !== newValue) {
                observer(newValue)
                render()
                value = newValue
            }
        }
    })
}

data.hobby.push('games')	// 监听到数组变化 ['running', 'cycling', 'games'] 视图更新模拟
```

上面代码中的方法是将数组的常用方法进行了重写，然后把需要监听的数组原生的方法替换掉，重写之后的方法可以被拦截，就可以监听到数组的变化来实现响应式视图更新。

但是，有些数组操作vue是拦截不到的，当然的也没有办法响应，比如:

```js
data.hobby.length++		// 数组长度变化无法监听
data.hobby[1] = 'swimming' 		// 直接用索引来给其中一项赋值，也无法监听
```

