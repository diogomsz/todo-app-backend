import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoEntity } from './entity/todo.entity';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ id: '1', task: 'task 1', isDone: 0 }),
  new TodoEntity({ id: '2', task: 'task 2', isDone: 1 }),
  new TodoEntity({ id: '3', task: 'task 3', isDone: 0 }),
];

const newTodoEntity = new TodoEntity({
  task: 'new task',
  isDone: 0,
});

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(todoEntityList),
            create: jest.fn().mockResolvedValue(newTodoEntity),
            findOneOrFail: jest.fn().mockResolvedValue(todoEntityList[0]),
            update: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();
    todoController = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(todoController).toBeDefined();
    expect(todoService).toBeDefined();
  });

  describe('index', () => {
    it('should be return a todo list entity successfully', async () => {
      // Act
      const result = await todoController.index();

      // Assert
      expect(result).toEqual(todoEntityList);
      expect(typeof result).toEqual('object');
      expect(todoService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(todoService, 'findAll').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoController.index()).rejects.toThrowError();
    });
  });

  describe('store', () => {
    it('should create a new todo item successfully', async () => {
      // Arrange
      const body: CreateTodoDto = {
        task: 'new task',
        isDone: 0,
      };

      // Act
      const result = await todoController.create(body);

      // Assert
      expect(result).toEqual(newTodoEntity);
      expect(todoService.create).toHaveBeenCalledTimes(1);
      expect(todoService.create).toHaveBeenCalledWith(body);
    });

    it('should throw an exception', () => {
      // Arrange
      const body: CreateTodoDto = {
        task: 'new task',
        isDone: 0,
      };

      jest.spyOn(todoService, 'create').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoController.create(body)).rejects.toThrowError();
    });
  });

  describe('show', () => {
    it('should get a todo item successfully', async () => {
      // Arrange
      const result = await todoController.show('1');

      // Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoService.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(todoService.findOneOrFail).toHaveBeenCalledWith('1');
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(todoService, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(todoController.show('1')).rejects.toThrowError();
    });
  });

  desci;
});
