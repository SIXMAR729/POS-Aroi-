// ----------- Load Menu -----------
// Add items to order/receipt
//delte items from order / receipt
//update summary
//clear order 
//open paypad
//assign payment type
//input payment buttons 
//close sale and save/send data

class Order {
    constructor() {
        this._menu = [];
        this._previousSales = [];
        this._invoiceNumber = "";
        this._order = [];
        this._payment = {
            amountPaid: 0,
            type: "",
            changeTip: 0
        };
    }

    get menu() {
        return this._menu;
    }

    set menu(menuArray) {
        this._menu = [];

        menuArray.forEach(menuitem => {
            let currItem = {};
            currItem.sku = menuitem[0];
            currItem.description = menuitem[1];
            currItem.pricee = menuitem[2];
            currItem.taxRate = menuitem[3];
            currItem.image = menuitem[4];
            this._menu.push(currItem);
        })
    }

    get previousSales() {
        return this._previousSales;
    }

    set previousSales(saleData) {
        this._previousSales = saleData;
    }

    get invoiceNumber() {
        return this._invoiceNumber;
    }

    set invoiceNumber(num) {
        this._invoiceNumber = num.toString();
    }

    get order() {
        return this._order;
    }

    get payment() {
        return this._payment;
    }

    set payment(payment) {
        this._payment = payment;
    }

    generateInvoiceNumber() {
        if (this._previousSales.length < 1 || this._previousSales == undefined) {
            this._invoiceNumber = 1;
        } else {
            let highest = 0;
            this._previousSales.forEach(previousSalesLine => {
                if (previousSalesLine[1] > highest) {
                    highest = previousSalesLine[1];
                }
                this._invoiceNumber = highest + 1;
            })
        }
    }

    addOrderLine(quantity, sku) {
        let currentLine = {};

        for (let i = 0; i < this._menu.length; i++) {
            if (sku === this._menu[i].sku) {
                currentLine.sku = this._menu[i].sku;
                currentLine.description = this._menu[i].description;
                currentLine.quantity = quantity;
                currentLine.price = this._menu[i].price;
                currentLine.subtotal = currentLine.quantity * currentLine.price;
                currentLine.tax = Utilities.roundToTwo(this._menu[i].taxRate * currentLine.subtotal);
            }
        }

        this._order.push(currentLine);
        Ui.receiptDetails(this);

    }

    deleteOrderLine(index) {
        this._order.splice(index, 1);

        Ui.receiptDetails(this);
    }

    clearOrder() {
        this._order = [];

        Ui.receiptDetails(this);
    }
}

class Ui {
    static menu(orderInstance) {
        let frag = document.createDocumentFragment();

        orderInstance.menu.forEach(item => {
            let menuElement = `<img src="${item.image}"  style="width: 150px;" alt="${item.description}" class="menu-img">
            <figcaption>${item.description}</figcaption>
            <figcaption>${Utilities.convertFloatToString(item.price)}</figcaption>`

            let node = document.createElement("figure");
            node.className = "menu-item";
            let dataString = JSON.stringify({ sku : `${item.sku}`, description: `${item.description}`, price : `${item.price}`, taxRate : `${item.taxRate}`
        })
        node.setAttribute("data-sku", dataString)
        node.innerHTML = menuElement;
        frag.appendChild(node);
        });
        
        document.getElementById('menu').appendChild(frag);

        document.querySelectorAll(".menu-item").forEach(button => {
            button.addEventListener('click', () => {
                orderInstance.addOrderLine(1, button.getAttribute("data-sku"));
            })
        })
    }


    static receiptDetails(orderInstance) {
    let frag = document.createDocumentFragment();

    orderInstance.order.forEach((orderLine, index) => {
        let receiptLine = `<td class="description">${orderLine.description}</td>
        <td class="quantity">${orderLine.quantity}</td>
        <td class="price">${orderLine.price}</td>
        <td class="subtotal">${orderLine.subtotal}</td>
        <td class="delete" data-delete="${index.toString()}"><i class="fas fa-backspace"></i></td>`

        let node = document.createElement("tr");
        node.setAttribute("data-index", `${index.toString()}`);
        node.innerHTML = receiptLine;
        frag.appendChild(node);
    });

    let receiptDetails = document.getElementById("receipt-details");
    while (receiptDetails.hasChildNodes()) {
        receiptDetails.removeChild(receiptDetails.childNodes[0]);
    }

    receiptDetails.appendChild(frag);
}
}
class Utilities {

    static TolocateString(price, currency, decimalPlaces) {
        let formattedPrice = price.toFixed(decimalPlaces).replace(".", ",");
        return `${currency} ${formattedPrice} ${currency}`;
      }

    static convertFloatToString(float) {
        let priceParams = {
            style: "currency",
            currency: "THB"
        };

        return float.toFixed("TH-th", priceParams);
    }

    static roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    static numberPaypad(input, orderInstance) {
        const currentInput = this.roundToTwo(input * .01);
        const currentAmountPaid = this.roundToTwo(orderInstance.payment.amountPaid);
        const newAmountPaid = this.roundToTwo((currentAmountPaid * 10) + currentInput);

        if (currentAmountPaid === 0) {
            orderInstance.changePayment({ amountPaid: currentInput });
        } else {
            orderInstance.changePayment({ amountPaid: newAmountPaid });
        }
    }

    static backPaypad(orderInstance) {
        const currentPayment = orderInstance.payment.amountPaid;

        if (currentPayment > 0) {
            const toSubtract = ((currentPayment * 100) % 10) * 0.01;
            const newAmount = (currentPayment - toSubtract) * 0.1;
            orderInstance.changePayment({ amountPaid: newAmount });
        }
    }

    static clearPaypad(orderInstance) {
        orderInstance.changePayment({ amountPaid: 0 });
    }

}


//Mock DATA
const menuData = [
	[101, 'Hamburger', 10.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[102, 'Fries', 6.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[103, 'Salad', 9.5, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[104, 'Pizza', 10.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[105, 'Donuts', 2.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[106, 'Crepes', 7.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[107, 'Cupcake', 8.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[108, 'Cupcake2', 10.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[109, 'Cupcake3', 10.99, 0.05, 'https://picsum.photos/seed/picsum/200/300'],
	[110, 'Cupcake4', 10.99, 0.05, 'https://picsum.photos/seed/picsum/200/300']

];


const previousSalesData = [
	["", 4999, 191.9, 1.0, 10.99, 0.5495],
	["", 4999, 102.0, 2.0, 7.95, 0.3975],
	["", 4999, 103.0, 3.0, 8.96, 0.4500],
	["", 5000, 106.0, 1.0, 6.99, 0.3500],
	["", 5000, 107.0, 1.0, 5.95, 0.3000]
];

const paymentsData = [
    ["", 4999, 56.45, "cc" , 5.00],
    ["", 5000, 57.45, "cash" , 0.00]
];

// ------------------------ Order instantiation -------------------
const order = new Order();
order.menu = menuData;
order.previousSales = previousSalesData;
Ui.menu(order);
// ------------------------ Static event listeners ----------------

document.getElementById('clear-order').addEventListener('click', () => {
    order.clearOrder();
})

document.querySelectorAll('.paypad-show').forEach(button => {
    button.addEventListener('click', () => {
        Ui.showPaypad(order);
        order.changePayment(JSON.parse(button.getAttribute("data-payment-type")));

    })
})

document.getElementById('paypad-close').addEventListener('click', () => {
    order.clearPayment();
    Ui.hidePaypad(order);
})

document.querySelectorAll('.paypad-btn').forEach(button => {
    button.addEventListener('click', () => {
        order.paypad(button.getAttribute("data-id"));
    })
})

// ---------------------- Add Menu Button for Mobile -------------------//

let counter = 0;
document.querySelectorAll('.menu-item').forEach((button, index) => {
    button.addEventListener('click', () => {
      counter++;
        console.log(`Button ${index + 1} got clicked! Total clicks: ${counter}`)
    })
})
