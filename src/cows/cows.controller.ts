import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { VacasService } from './cows.service';
import { CreateVacaInput } from './dto/create-cow.input';
import upload, { storage } from '../utils/cloudinaryConfig';

@Controller('cows')
export class VacasController {
  constructor(private readonly vacasService: VacasService) {}

  // Accept multipart/form-data with fields of CreateVacaInput and a file field named 'imagen'
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  async createWithImage(@Body() body: CreateVacaInput, @UploadedFile() file: MulterFile) {
    try {
      // file may be undefined if no file sent
      if (file) {
        // multer-storage-cloudinary commonly sets file.path to the secure URL
        const url = (file as any).path || (file as any).secure_url || (file as any).url || null;
        if (!url) throw new BadRequestException('No se pudo obtener la URL de Cloudinary');
        body.imagen = url;
      }

      return this.vacasService.create(body);
    } catch (e) {
      throw e;
    }
  }
}
