const cartBtn = select('.cart-btn')
const closeCartBtn = select('.close-cart')
const clearCartbtn = select('.clear-cart')
const cartDom = select('.cart')
const cartOverlay = select('.cart-overlay')
const cartItems = select('.cart-items')
const cartTotal = select('.cart-total')
const cartContent = select('.cart-content')
const productsDom = select('.products-center')

function select(el){
  return document.querySelector(el)
}
function selectAll(xy){
    return document.querySelectorAll(xy)
}
// cart
let cart = []
 let buttonsDom = []
// getting the products
class Products{
   async  getProducts(){
       try{
            let result = await fetch('products.json').then(res => res.json())
            // let data  = await result.json()
            let products = result.items
            products = products.map((item)=> {
                const {title, price} = item.fields
                const {id} = item.sys
                const image = item.fields.image.fields.file.url
                return {title, price, id, image}
            })
            // console.log(products)
            return products
            
       }catch(error){
           console.log(error)
       }
    }
}

// display products
class UI{
 displayProducts(products){
    //  console.log(products) 
     let result = '';
     products.forEach(product=>{
        //  console.log(product.image)
         result += `
         <article class="product">
         <div class="img-container">
             <img src=${product.image} alt="product" class="product-img"/>
             <button class="bag-btn" data-id=${product.id}>
                 <i class="fa fa-shopping-cart">add to cart</i>
             </button>
         </div>
         <h3>${product.title}</h3>
         <h4>$${product.price}</h4>
     </article>`
     })
     productsDom.innerHTML = result
     
     }
     getBagButtons(){
         const buttons = [...selectAll('.bag-btn')]
         buttonsDom = buttons
         buttons.forEach(button =>{
             let id = button.dataset.id
             let inCart = cart.find(item => item.id === id)
             if (inCart){
                 button.innerText = 'IN CART'
                 button.disabled = true
             }
                 button.addEventListener('click',(event)=>{
                   event.target.innerText = 'IN CART'
                   event.target.disabled = true
                //   get product from products
                let cartItem = {...Storage.getProduct(id), amount:1}
                // add product to the cart
                  cart = [...cart, cartItem]
                // save cart in local storage
                Storage.saveCart(cart)
                // set cart values
                this.setCartValues(cart)
                // display cart items
                this.addCartItem(cartItem)
                // show the cart 
                this.showCart()
                 })
             
         })
 }
        setCartValues(cart){
            let tempTotal = 0
            let itemsTotal = 0
            cart.map((item)=>{
                tempTotal += item.price * item.amount
                itemsTotal += item.amount
            })
            cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
            cartItems.innerText = itemsTotal
        }
        addCartItem(item){
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
                        <img src=${item.image} alt="product"/>
                        <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id} >remove</span>
                        </div>
                        <div>
                        <i class="fas fa-chevron-up"data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down"data-id=${item.id}></i>
                        </div>`
                        cartContent.appendChild(div)
        }
        showCart(){
            cartOverlay.classList.add('transparentBcg')
            cartDom.classList.add('showCart')
        }
        setupAPP(){
            cart = Storage.getCartItems()
            this.setCartValues(cart)
            this.populateCart(cart)
            cartBtn.addEventListener('click', this.showCart)
            closeCartBtn.addEventListener('click', this.hideCart)
        }
        populateCart(cart){
            cart.forEach(item=>this.addCartItem(item))
        }
        hideCart(){
            cartOverlay.classList.remove('transparentBcg')
            cartDom.classList.remove('showCart')
            // closeCartBtn.classList.add('close-cart')
        }
        cartlogic(){
            // clear cart button
            clearCartbtn.addEventListener('click',()=>{
                this.clearCart()})
               // cart functionality 
            cartContent.addEventListener('click', event=>{
                if(event.target.classList.contains('remove-item')){
                    let removeItem = event.target
                    let id = removeItem.dataset.id
                    // console.log(removeItem.parentElement.parentElement)
                    cartContent.removeChild(removeItem.parentElement.parentElement)
                    this.removeItem(id)
                } else if (event.target.classList.contains('fa-chevron-up')){
                    let addAmount = event.target
                    let id = addAmount.dataset.id
                    let tempItem = cart.find(item=> item.id === id)
                    tempItem.amount = tempItem.amount + 1
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    addAmount.nextElementSibling.innerText = tempItem.amount
                } else if (event.target.classList.contains('fa-chevron-down')){
                    let reduceAmount = event.target
                    let id = reduceAmount.dataset.id
                    let tempItem = cart.find(item => item.id === id)
                    tempItem.amount = tempItem.amount - 1
                    if(tempItem.amount > 0){
                         Storage.saveCart(cart)
                    this.setCartValues(cart)
                    reduceAmount.previousElementSibling.innerText=tempItem.amount
                    }else{
                        cartContent.removeChild(reduceAmount.parentElement.parentElement)
                        this.removeItem(id)
                    }
                   
                }
            })
        }
        
        clearCart(){
            let cartItemsId = cart.map(item=> item.id)
            cartItemsId.forEach(id => this.removeItem(id))
            // console.log(cartContent.children)

            while(cartContent.children.length>0){
                cartContent.removeChild(cartContent.children[0])
            }
            this.hideCart
        }
        removeItem(id){
            cart = cart.filter(item => item.id !== id)
            this.setCartValues(cart)
            Storage.saveCart(cart)
            let button = this.getSingleButton(id)
            button.disabled = false
            button.innerHTML = `<i class= 'fas fa-shopping-cart'></i>add to cart`
        }
        getSingleButton(id){
            return buttonsDom.find(button => button.dataset.id === id)

        }
}

// local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products))
    }
    // get produc from the local storage,
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart))
    }
    static getCartItems(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart'))
        :[]
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI()
    const products = new Products()

    // get all products
    ui.setupAPP()
    // setapp
    products.getProducts()
    .then(products => { 
        ui.displayProducts(products)
        Storage.saveProducts(products)
        Storage.saveCart(cart)
        })
        .then(()=>{
            ui.getBagButtons()
            ui.cartlogic()
            })
 
})
// .then(data => console.log(data))