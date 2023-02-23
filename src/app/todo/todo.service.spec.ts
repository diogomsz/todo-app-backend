import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe } from 'node:test';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './entity/todo.entity';
import { TodoService } from './todo.service';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ task: 'task1', isDone: 0 }),
  new TodoEntity({ task: 'task2', isDone: 1 }),
  new TodoEntity({ task: 'task3', isDone: 0 }),
  new TodoEntity({ task: 'task4', isDone: 1 }),
];

const updatedTodoEntityItem = new TodoEntity({ task: 'task5', isDone: 0 });

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRespository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValueOnce(todoEntityList),
            findOneOrFail: jest.fn().mockResolvedValueOnce(todoEntityList[0]),
            create: jest.fn().mockReturnValue(todoEntityList[0]),
            merge: jest.fn().mockReturnValue(updatedTodoEntityItem),
            save: jest.fn().mockResolvedValueOnce(todoEntityList[0]),
            softDelete: jest.fn().mockResolvedValueOnce(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRespository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRespository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a todo list entity successfully', async () => {
      // Act
      const result = await todoService.findAll();

      // Assert
      expect(result).toEqual(todoEntityList);
      expect(todoRespository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw an expection', () => {
      // Arrange
      jest.spyOn(todoRespository, 'find').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.findAll()).rejects.toThrowError();
    });
  });

  describe('findOneOrFail', () => {
    it('should return a todo item successfully', async () => {
      // Act
      const result = await todoService.findOneOrFail('1');

      // Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRespository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw an not found exception', () => {
      // Arrange
      jest
        .spyOn(todoRespository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.findOneOrFail('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new todo entity item successfully', async () => {
      //Arrange
      const data: CreateTodoDto = {
        task: 'task',
        isDone: 0,
      };

      // Act
      const result = await todoService.create(data);

      // Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRespository.create).toHaveBeenCalledTimes(1);
      expect(todoRespository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      const data: CreateTodoDto = {
        task: 'task',
        isDone: 0,
      };

      jest.spyOn(todoRespository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.create(data)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update a todo entity item successfully', async () => {
      // Arrange
      const data: UpdateTodoDto = { task: 'taskrandom', isDone: 1 };
      jest
        .spyOn(todoRespository, 'save')
        .mockResolvedValueOnce(updatedTodoEntityItem);

      //Act
      const result = await todoService.update('id', data);

      // Assert
      expect(result).toEqual(updatedTodoEntityItem);
      expect(todoRespository.update('1', data)).toHaveBeenCalledTimes(1);
    });

    it('should throw an not found expection', () => {
      // Arrange
      const data: UpdateTodoDto = { task: 'taskrandom', isDone: 1 };
      jest
        .spyOn(todoRespository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.update('1', data)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an expection', () => {
      // Arrange
      const data: UpdateTodoDto = { task: 'taskrandom', isDone: 1 };
      jest.spyOn(todoRespository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.update('1', data)).rejects.toThrowError();
    });
  });

  describe('deleteById', () => {
    it('should delete a todo entity item successfully', async () => {
      // Arrange
      const result = await todoService.deleteById('1');

      // Assert
      expect(result).toBeUndefined();
      expect(todoRespository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(todoRespository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw an not found exception', () => {
      // Arrange
      jest
        .spyOn(todoRespository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.deleteById('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(todoRespository, 'softDelete')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.deleteById('1')).rejects.toThrowError();
    });
  });
});
