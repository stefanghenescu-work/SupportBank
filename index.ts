var readlineSync = require('readline-sync');

const csv = require('csv-parser')
const fs = require('fs')
const results = [];
const moment = require('moment');


function readFile(): void {

}
fs.createReadStream('DodgyTransactions2015.csv')
  .pipe(csv())
  .on('data', (data: never) => results.push(data))
  .on('end', () => {
    processTransactions(results);
  });


class Transaction {
    date: any;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(transaction: any) {
        this.date = moment(transaction.Date, "DD/MM/YYYY");
        this.from = transaction.From;
        this.to = transaction.To;
        this.narrative = transaction.Narrative;
        this.amount = parseFloat(transaction.Amount);
    }

    verify(): number {
        if (Number.isNaN(this.amount)) {
            console.log("Amount should be a number! Look at transaction on date: " + this.date.format('YYYY-MM-DD'));
            return -1;
        }

        if (!this.date.isValid()) {
            console.log("Invalid date on transaction: " + this.narrative + " from " + this.from + " to " + this.to);
            return -1;
        }

        return 0;
    }

    getDetails() : void {
        console.log("Transaction from " + this.date.format('YYYY-MM-DD') + " with description: " + this.narrative);
    }

}

class Account {
    name: string;
    oweMoney: number = 0;;
    owedMoney: number = 0;
    transactions: Array<Transaction> = new Array();

    constructor(name) {
        this.name = name;
    }

    pay(amount: number): void {
        this.owedMoney += amount;
    }

    getPaid(amount: number): void {
        this.oweMoney += amount;
    }

    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    getDetails(): void {
        console.log("Account " + this.name + " owes " + this.oweMoney +
                    " and is awed " + this.owedMoney);
    }

    getTransactions(): void {
        for (let trans of this.transactions) {
            trans.getDetails();
        }
    }
}

function processTransactions(transactions: any): void {
    var people = new Set<string>();
    var accounts: Map<string, Account> = new Map();

    for (let i = 0; i < transactions.length; i++) {
        let transaction = new Transaction(transactions[i]);

        if (transaction.verify() == -1)
            return;

        let nameFrom: string;
        let nameTo: string;

        nameFrom = transaction.from;
        nameTo = transaction.to;

        if (!people.has(nameFrom)) {
            let account = new Account(nameFrom);
            accounts.set(nameFrom, account);
            people.add(nameFrom);
        }

        if (!people.has(nameTo)) {
            let account = new Account(nameTo);
            accounts.set(nameTo, account);
            people.add(nameTo);
        }

        let currentAccountFrom: Account | undefined;
        let currentAccountTo: Account | undefined;

        if (accounts.get(nameFrom)) {
            currentAccountFrom = accounts.get(nameFrom);
            currentAccountFrom?.addTransaction(transaction);
        }

        if (accounts.get(nameTo)) {
            currentAccountTo = accounts.get(nameTo)
            currentAccountTo?.addTransaction(transaction);
        }
    }

    for (let i = 0; i < transactions.length; i++) {
        let accountFrom = accounts.get(transactions[i].From);
        let accountTo = accounts.get(transactions[i].To);

        if (!accountFrom || !accountTo)
            continue;

        let amount = parseFloat(transactions[i].Amount);

        accountFrom.pay(amount);
        accountTo.getPaid(amount);
    }

    readCommand(accounts);
}


function readCommand(accounts: Map<string, Account>): void {
    var command = readlineSync.question('List ');

    if (command == "All") {
         accounts.forEach((value: Account, key: string) => {
                            value.getDetails();})
    } else {
        if (accounts.get(command))
            accounts.get(command)?.getTransactions();
        else
            console.log("Account does not exist!");
    }
}