'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovementDate = function (date,locale) {
  const daysPassed = Math.round(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24));
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
      // const day = `${date.getDate()}`.padStart(2, 0);
      // const month = `${date.getMonth()+1}`.padStart(2,0);
      // const year = date.getFullYear();
      return new Intl.DateTimeFormat(locale).format(date)
  }
}

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}
//Function to display movements

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  movs.forEach(function (move, i) {
    const type = move < 0 ? "withdrawal" : "deposit";
    const dispDate = formatMovementDate(new Date(acc.movementsDates[i]), acc.locale);
    
    const formatedMovement = formatCurrency(move,acc.locale,acc.currency)

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${dispDate}</div>
    <div class="movements__value">${formatedMovement}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Function to create usernames
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map(ele => ele[0])
      .join('');
  });
};

createUsername(accounts);
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
}    
//Function to display balance

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc += cur, 0);
  labelBalance.textContent = formatCurrency(acc.balance.toFixed(2),acc.locale,acc.currency);
};

//Function to display summary

const calcDisplaySummary = function (acc) {
  const deposits = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formatCurrency(deposits.toFixed(2),acc.locale,acc.currency);;
  const withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + Math.abs(cur), 0);
  labelSumOut.textContent = formatCurrency(withdrawals.toFixed(2),acc.locale,acc.currency);;
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * acc.interestRate / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(interest.toFixed(2),acc.locale,acc.currency);;
  
}

let timer=0;

const startLogoutTimer = function () {
  let time = 300;
  const tick = () => {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`
      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
  return timer;
}

let currentAccount;

//On clicking login button

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //console.log('lgoin');
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //UI
    containerApp.style.opacity = 100;
    //Welcome msg
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;

    //CURRENT DATE AND TIME

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    updateUI(currentAccount);
  }
  //clear input fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
});

//On clicking transfer button

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferTo = accounts.find(acc => acc.username === inputTransferTo.value);
  const transferAmount = Number(inputTransferAmount.value)
  
  if (transferTo && transferAmount>0 && transferAmount<=currentAccount.balance && currentAccount.username!==transferTo.username) {
    currentAccount.movements.push(-transferAmount);
    transferTo.movements.push(transferAmount);
    //add date of transfer
    currentAccount.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
    //clear input fields
    inputTransferTo.value = inputTransferAmount.value = '';
    inputTransferAmount.blur();
    
    updateUI(currentAccount);

    //Reset timer

    clearInterval(timer);
    timer = startLogoutTimer();
  }
})

//On clicking loan button

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(Number(inputLoanAmount.value));
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * .1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      //add date of transfer
      currentAccount.movementsDates.push(new Date().toISOString());
      //clear input fields
      inputLoanAmount.value = '';
      inputLoanAmount.blur();
      updateUI(currentAccount);
    }, 2500);
    
    //Reset timer

    clearInterval(timer);
    timer = startLogoutTimer();
  }
})

//On clicking close acc button

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    //Delete account
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    updateUI(currentAccount);

  }
  //clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
})

//On clicking close acc button
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})
// const day = `${ now.getDate()}`.padStart(2,0);
// const month = `${now.getMonth()+1}`.padStart(2,0);
// const year = now.getFullYear();
// const hour = `${now.getHours()+1}`.padStart(2,0);
// const min = `${now.getMinutes()+1}`.padStart(2,0);
// const sec = now.getSeconds();
//labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
//////////////////////////////////////

////////////////////////////////////////

// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];
// const recc = dogs.map(cur => cur.weight ** 0.75 * 28);
// console.log(recc);
// console.log(dogs.find(cur => cur.owners.find(ele => ele === 'Sarah') === 'Sarah'));
// const ownersEatTooMuch = dogs.filter(cur => cur.weight ** 0.75 * 28 < cur.curFood).flatMap(curr => curr.owners).join(" ").replaceAll(" "," and ");
// const ownersEatTooLittle = dogs.filter(cur => cur.weight ** 0.75 * 28 > cur.curFood).flatMap(curr => curr.owners).join(" ").replaceAll(" "," and ");
// console.log(ownersEatTooLittle,ownersEatTooMuch);
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
