class Relationship {
  constructor(number1, name1, number2, name2) {
    this.number1 = number1;
    this.name1 = name1;
    this.number2 = number2;
    this.name2 = name2;

    this.count = 0;
  }

  inc() {
    this.count++;
  }
}

module.exports = Relationship;
