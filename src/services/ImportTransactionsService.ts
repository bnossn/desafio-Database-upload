import path from 'path';

// import { Parser } from 'csv-parse';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import loadCSV from '../utilities/loadCSV';
import csvUploadConfig from '../config/csvUpload';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const transactionService = new CreateTransactionService();

    const csvFilesPath = csvUploadConfig.directory;
    const data = await loadCSV(path.join(csvFilesPath, filename));

    const transactionsArray: Transaction[] = [];

    // https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works/
    await data.reduce(
      async (
        prevTransactionPromise: Promise<any>,
        nextTransactionCSV,
        index,
      ) => {
        await prevTransactionPromise;

        if (
          nextTransactionCSV[1] !== 'income' &&
          nextTransactionCSV[1] !== 'outcome'
        ) {
          throw new AppError(
            `Transaction type must be either 'income' or 'outcome'. Error on elemet ${index}`,
          );
        }

        const value = parseFloat(nextTransactionCSV[2]);

        if (!value) {
          throw new AppError(
            `Transaction value must be a number.  Error on elemet ${index}`,
          );
        }

        const transaction = await transactionService.execute({
          title: nextTransactionCSV[0],
          type: nextTransactionCSV[1] as 'income' | 'outcome',
          value,
          category: nextTransactionCSV[3],
        });

        transactionsArray.push(transaction);
        // prevTransactionPromise[index] = transaction
        return transaction;
      },
      Promise.resolve(),
    );

    return transactionsArray;
  }
}

export default ImportTransactionsService;
