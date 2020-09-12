import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import csvUploadConfig from '../config/csvUpload';
// import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const uploadCSV = multer(csvUploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const TransactionRepository = getCustomRepository(TransactionsRepository);

  const balance = await TransactionRepository.getBalance();
  const transactions = await TransactionRepository.find({
    relations: ['category'],
  });

  const transactionsAndBalance = {
    transactions,
    balance,
  };

  return response.json(transactionsAndBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionService = new CreateTransactionService();

  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  uploadCSV.single('file'),
  async (request, response) => {
    // TODO
    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute(
      request.file.filename,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
