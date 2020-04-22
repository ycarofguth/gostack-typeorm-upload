import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const createCategory = new CreateCategoryService();

    const balance = await transactionRepository.getBalance();

    if (value > balance.total && type === 'outcome') {
      throw new AppError('Invalid transaction', 400);
    }

    const { id } = await createCategory.execute({ title: category });
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
