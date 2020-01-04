import { Injectable } from '@nestjs/common';
import { CreateGroupDTO } from './create-group.dto';
import { Group } from 'src/entities/group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class GroupService {
  async createGroup(createGroupDto: CreateGroupDTO): Promise<any> {
    const { groupName, voteEndDt, participants } = createGroupDto;
    const group = new Group();
    group.groupName = groupName;
    group.owner = 1;
    group.vote_end_dt = new Date(voteEndDt);
    const userParticipants = await User.findByIds(participants);

    group.participants = userParticipants;

    const newGroup = await group.save();
    return newGroup;
  }
}
