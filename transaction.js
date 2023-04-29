const cryptoTransactions = require('crypto');
const { privateKey, publicKey } = cryptoTransactions.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });

class Transaction {
  constructor(senderPublicKey, recipientPublicKey, amount) {
    this.senderPublicKey = senderPublicKey;
    this.recipientPublicKey = recipientPublicKey;
    this.amount = amount;
    this.transactionId = this.calculateHash();
    this.signature = null;
  }

  calculateHash() {
    const hash = cryptoTransactions.createHash('sha256');
    hash.update(this.senderPublicKey + this.recipientPublicKey + this.amount);
    return hash.digest('hex');
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.senderPublicKey) {
      throw new Error('You cannot sign transactions for other wallets');
    }

    const transactionHash = this.calculateHash();
    const signature = signingKey.sign(transactionHash, 'base64');
    this.signature = signature.toDER('hex');
  }

  isValid() {
    if (this.senderPublicKey === null) return false;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = cryptoTransactions.createPublicKey({
      key: this.senderPublicKey,
      format: 'pem',
      type: 'spki'
    });

    const transactionHash = this.calculateHash();
    return publicKey.verify(transactionHash, this.signature, 'hex', 'base64');
  }
}
module.exports.Transaction = Transaction;