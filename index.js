"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readlineSync = require('readline-sync');
var csv = require('csv-parser');
var fs = require('fs');
var results = [];
var moment = require('moment');
fs.createReadStream('Transactions2014.csv')
    .pipe(csv())
    .on('data', function (data) { return results.push(data); })
    .on('end', function () {
    processTransactions(results);
});
var Transaction = /** @class */ (function () {
    function Transaction(transaction) {
        this.date = moment(transaction.Date, "DD/MM/YYYY");
        this.from = transaction.From;
        this.to = transaction.To;
        this.narrative = transaction.Narrative;
        this.amount = parseFloat(transaction.Amount);
    }
    Transaction.prototype.verify = function () {
        if (Number.isNaN(this.amount)) {
            console.log("Amount should be a number! Look at transaction on date: " + this.date.format('YYYY-MM-DD'));
            return -1;
        }
        if (!this.date.isValid()) {
            console.log("Invalid date on transaction: " + this.narrative + " from " + this.from + " to " + this.to);
            return -1;
        }
        return 0;
    };
    Transaction.prototype.getDetails = function () {
        console.log("Transaction from " + this.date.format('YYYY-MM-DD') + " with description: " + this.narrative);
    };
    return Transaction;
}());
var Account = /** @class */ (function () {
    function Account(name) {
        this.oweMoney = 0;
        this.owedMoney = 0;
        this.transactions = new Array();
        this.name = name;
    }
    ;
    Account.prototype.pay = function (amount) {
        this.owedMoney += amount;
    };
    Account.prototype.getPaid = function (amount) {
        this.oweMoney += amount;
    };
    Account.prototype.addTransaction = function (transaction) {
        this.transactions.push(transaction);
    };
    Account.prototype.getDetails = function () {
        console.log("Account " + this.name + " owes " + this.oweMoney +
            " and is awed " + this.owedMoney);
    };
    Account.prototype.getTransactions = function () {
        for (var _i = 0, _a = this.transactions; _i < _a.length; _i++) {
            var trans = _a[_i];
            trans.getDetails();
        }
    };
    return Account;
}());
function processTransactions(transactions) {
    var people = new Set();
    var accounts = new Map();
    for (var i = 0; i < transactions.length; i++) {
        var transaction = new Transaction(transactions[i]);
        if (transaction.verify() == -1)
            return;
        var nameFrom = void 0;
        var nameTo = void 0;
        nameFrom = transaction.from;
        nameTo = transaction.to;
        if (!people.has(nameFrom)) {
            var account = new Account(nameFrom);
            accounts.set(nameFrom, account);
            people.add(nameFrom);
        }
        if (!people.has(nameTo)) {
            var account = new Account(nameTo);
            accounts.set(nameTo, account);
            people.add(nameTo);
        }
        var currentAccountFrom = void 0;
        var currentAccountTo = void 0;
        if (accounts.get(nameFrom)) {
            currentAccountFrom = accounts.get(nameFrom);
            currentAccountFrom === null || currentAccountFrom === void 0 ? void 0 : currentAccountFrom.addTransaction(transaction);
        }
        if (accounts.get(nameTo)) {
            currentAccountTo = accounts.get(nameTo);
            currentAccountTo === null || currentAccountTo === void 0 ? void 0 : currentAccountTo.addTransaction(transaction);
        }
    }
    for (var i = 0; i < transactions.length; i++) {
        var accountFrom = accounts.get(transactions[i].From);
        var accountTo = accounts.get(transactions[i].To);
        if (!accountFrom || !accountTo)
            continue;
        var amount = parseFloat(transactions[i].Amount);
        accountFrom.pay(amount);
        accountTo.getPaid(amount);
    }
    readInput(accounts);
}
function readInput(accounts) {
    var _a;
    var command = readlineSync.question('List ');
    if (command == "All") {
        accounts.forEach(function (value, key) {
            value.getDetails();
        });
    }
    else {
        if (accounts.get(command))
            (_a = accounts.get(command)) === null || _a === void 0 ? void 0 : _a.getTransactions();
        else
            console.log("Account does not exist!");
    }
}
