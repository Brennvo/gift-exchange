import { TestingModule, Test } from '@nestjs/testing';
import { PollService } from './poll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupPoll } from '../entities/user-group-poll.entity';
import { Suggestion } from '../entities/suggestion.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('Poll service', () => {
  let pollService;
  let pollRepository;
  let suggestionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollService,
        {
          provide: getRepositoryToken(UserGroupPoll),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Suggestion), useFactory: mockRepository },
      ],
    }).compile();

    pollService = await module.get(PollService);
    pollRepository = await module.get(getRepositoryToken(UserGroupPoll));
    suggestionRepository = await module.get(getRepositoryToken(Suggestion));
  });

  it("should get a user's poll by id", async () => {
    const mockPoll = { id: 1 };
    const mockWhere = jest.fn().mockReturnThis();
    pollRepository.createQueryBuilder = jest.fn().mockReturnValue({
      where: mockWhere,
      andWhere: mockWhere,
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockReturnValue(mockPoll),
    });

    const res = await pollService.getUserPoll(5, 1);
    // Ensure database being queried with right data
    expect(mockWhere.mock.calls[0][1].groupId).toBe(5);
    expect(mockWhere.mock.calls[1][1].userId).toBe(1);

    // Ensure returning poll
    expect(res).toBe(mockPoll);
  });

  it('should create a suggestion', async () => {
    const whereMock = jest.fn().mockReturnThis(),
      andMock = jest.fn().mockReturnThis(),
      mockPoll = {},
      newSuggestion = { title: 'mock title' };

    pollRepository.createQueryBuilder = jest.fn().mockReturnValue({
      where: whereMock,
      andWhere: andMock,
      getOne: jest.fn().mockReturnValue(mockPoll),
    });

    suggestionRepository.save.mockResolvedValue(newSuggestion);
    const res = await pollService.createSuggestion(1, 2, newSuggestion);
    expect(suggestionRepository.create).toHaveBeenCalledWith({
      ...newSuggestion,
      poll: mockPoll,
      votes: 0,
    });
  });

  describe('suggestion voting', () => {
    const mockPoll = { id: 1 };
    let mockSuggestion;
    beforeEach(() => {
      mockSuggestion = { votes: 1 };
      pollRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(mockPoll),
      });
      suggestionRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(mockSuggestion),
      });
    });

    it('should upvote', async () => {
      const spy = jest.spyOn(pollService, 'getUserPoll');
      await pollService.voteOnSuggestion(1, 2, {
        id: 1,
        upvote: true,
      });
      expect(spy).toHaveBeenCalled();
      expect(mockSuggestion.votes).toBe(2);
    });

    it('should downvote', async () => {
      const spy = jest.spyOn(pollService, 'getUserPoll');
      await pollService.voteOnSuggestion(1, 2, {
        id: 1,
        upvote: false,
      });
      expect(spy).toHaveBeenCalled();
      expect(mockSuggestion.votes).toBe(0);
    });
  });
});
