import { Injectable, NotFoundException } from '@nestjs/common';

import { AdminEntity } from './admin.entity';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async setRefreshTokenHash(
    admin: AdminEntity,
    hash: string | null
  ): Promise<void> {
    await this.adminRepository.update(admin.id, { refreshTokenHash: hash });
  }

  async getById(id: number): Promise<AdminEntity> {
    const admin: AdminEntity | null = await this.adminRepository.findById(id);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async getByEmail(email: string): Promise<AdminEntity | null> {
    return await this.adminRepository.findByEmail(email);
  }
}
